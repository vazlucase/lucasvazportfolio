import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildReport, DAY, dayKey, normalizeBatch, periodRange, reportCSV } from '../server/analytics-core.mjs';
import { createAnalyticsHandler, signSession, validSession } from '../server/analytics-handler.mjs';
import { createFileStore } from '../server/analytics-store.mjs';
import { createMemorySecurity, hashPassword, verifyPassword } from '../server/analytics-auth.mjs';

const PASSWORD = 'test-only-password-not-for-production';
const testEnv = { ANALYTICS_ADMIN_PASSWORD_HASH: await hashPassword(PASSWORD), ANALYTICS_SESSION_SECRET: 'unit-test-session-key-long-enough-for-tests' };
const secured = store => ({ ...createMemorySecurity(), ...store });

const NOW = Date.parse('2026-11-03T15:00:00Z');
const visitor = randomUUID(), session = randomUUID();
const context = { visitorId: visitor, sessionId: session, page: '/', device: 'Desktop', browser: 'Chrome', source: 'Direto' };
const event = (type = 'view', overrides = {}) => ({ id: randomUUID(), at: NOW, type, label: type === 'view' ? '/' : '', value: type === 'view' ? 1 : 0, ...context, ...overrides });
const payload = (events, overrides = {}) => ({ context: { ...context, ...overrides }, events: events.map(({ id, at, type, label, value }) => ({ id, at, type, label, value })) });
const snapshot = (events, startedAt = NOW - 800 * DAY) => ({ version: 1, startedAt, totalViews: events.filter(item => item.type === 'view').length, events });
const request = (action, method = 'GET', body, headers = {}) => new Request(`https://portfolio.example/api/analytics/${action}`, {
  method, headers: { ...(method === 'POST' ? { Origin: 'https://portfolio.example' } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined,
});

test('periods use Brazilian civil days, include today, and clamp calendar months', () => {
  const range = periodRange('30d', NOW);
  assert.equal(dayKey(range.start), '2026-10-05');
  assert.equal(dayKey(range.end), '2026-11-04');
  assert.equal(range.days, 30);
  assert.equal(dayKey(Date.parse('2026-11-03T01:00:00Z')), '2026-11-02');
  assert.equal(dayKey(periodRange('3m', Date.parse('2026-05-30T15:00:00Z')).start), '2026-02-28');
  assert.equal(periodRange('1y', Date.parse('2024-02-28T15:00:00Z')).days, 366);
  assert.throws(() => periodRange('all', NOW));
});

test('a new collection has an honest zero-filled history and no invented growth', () => {
  const report = buildReport(snapshot([], NOW), '30d', NOW);
  assert.equal(report.daily.length, 30);
  assert(report.daily.every(day => day.views === 0));
  assert.equal(report.metrics.views.value, 0);
  assert.equal(report.metrics.views.change, null);
  assert.equal(report.meta.comparisonComplete, false);
  assert.equal(report.meta.historyDays, 1);
  assert.equal(report.daily.filter(day => day.available).length, 1);
  assert.match(reportCSV(report), /Anterior à coleta/);
  assert.equal(report.realtime.activeVisitors, 0);
  assert.match(report.insights[0].text, /visitas reais/);
});

test('views, anonymous visitors, sessions, engagement and contacts have distinct meanings', () => {
  const otherSession = randomUUID();
  const events = [event(), event(), event('active', { value: 15 }), event('contact', { label: 'email' }),
    event('contact', { label: 'email' }), event('project', { label: 'Rusty Pub' }), event('scroll', { value: 100 }),
    event('view', { sessionId: otherSession })];
  const report = buildReport(snapshot(events), '30d', NOW);
  assert.equal(report.metrics.views.value, 3);
  assert.equal(report.metrics.visitors.value, 1);
  assert.equal(report.metrics.sessions.value, 2);
  assert.equal(report.metrics.contacts.value, 2);
  assert.equal(report.metrics.contactRate.value, 50);
  assert.equal(report.metrics.engagementRate.value, 50);
  assert.equal(report.metrics.avgActiveSeconds.value, 7.5);
  assert.equal(report.metrics.completionRate.value, 50);
  assert.equal(report.breakdowns.sources[0].value, 2);
  assert.equal(report.breakdowns.hours.find(hour => hour.name === '12').value, 3);
});

test('current and previous windows exclude outside and future events', () => {
  const range = periodRange('30d', NOW);
  const events = [event(), event('view', { at: range.previousStart + 1000 }), event('view', { at: range.previousStart - 1000 }), event('view', { at: NOW + DAY })];
  const report = buildReport(snapshot(events), '30d', NOW);
  assert.equal(report.metrics.views.value, 1);
  assert.equal(report.metrics.views.previous, 1);
  assert.equal(report.metrics.views.change, 0);
  assert.equal(report.daily.reduce((sum, day) => sum + day.views, 0), 1);
});

test('collection validates page, identifiers, event age, bounded values and batch size', () => {
  assert.equal(normalizeBatch(payload([event()]), NOW)[0].page, '/');
  assert.throws(() => normalizeBatch(payload([event()], { page: '/painel' }), NOW));
  assert.throws(() => normalizeBatch(payload([event()], { visitorId: 'person@example.com' }), NOW));
  assert.throws(() => normalizeBatch(payload([event('scroll', { value: 101 })]), NOW));
  assert.throws(() => normalizeBatch(payload([event('contact', { label: 'arbitrary' })]), NOW));
  assert.throws(() => normalizeBatch(payload([event('view', { at: NOW - DAY })]), NOW));
  assert.throws(() => normalizeBatch(payload(Array.from({ length: 21 }, () => event())), NOW));
  assert.equal(normalizeBatch(payload([event('active', { value: 10000 })]), NOW)[0].value, 30);
});

test('file persistence deduplicates retried batches and serializes concurrent writes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'lv-analytics-test-'));
  try {
    const store = createFileStore(directory), events = Array.from({ length: 8 }, () => event('view', { at: Date.now() }));
    await Promise.all(events.map(item => store.append([item, item])));
    await store.append(events);
    const stored = await createFileStore(directory).snapshot();
    assert.equal(stored.totalViews, 8);
    assert.equal(stored.events.length, 8);
    assert.equal(JSON.parse(await readFile(join(directory, 'analytics.json'), 'utf8')).events.length, 8);
    await writeFile(join(directory, 'analytics.json'), 'broken');
    await assert.rejects(() => store.snapshot(), SyntaxError);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('signed admin sessions expire and reject tampering and unrelated secrets', () => {
  const secret = 'unit-test-session-secret';
  const token = signSession(secret, NOW);
  assert(validSession(token, secret, NOW));
  assert.equal(validSession(token, secret, NOW + 9 * 3600000), false);
  assert.equal(validSession(`${token}x`, secret, NOW), false);
  assert.equal(validSession(token, 'different-secret', NOW), false);
  assert.equal(validSession('invalid', secret, NOW), false);
});

test('production report and export need login, then work with an HttpOnly session', async () => {
  const store = { mode: 'redis', append: async () => 0, snapshot: async () => snapshot([]) };
  const password = 'test-only-password-not-for-production';
  const handler = createAnalyticsHandler({ store: secured(store), env: testEnv });
  assert.equal((await handler(request('report'))).status, 401);
  assert.equal((await handler(request('export'))).status, 401);
  assert.equal((await handler(request('login', 'POST', { password: 'wrong' }))).status, 401);
  const login = await handler(request('login', 'POST', { password }));
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Strict/);
  assert.match(login.headers.get('set-cookie'), /Secure/);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const response = await handler(request('report?period=3m', 'GET', undefined, { cookie }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).period, '3m');
  const exported = await handler(request('export?period=1y', 'GET', undefined, { cookie }));
  assert.match(exported.headers.get('content-type'), /text\/csv/);
  assert.match(exported.headers.get('content-disposition'), /1y\.csv/);
});

test('API rejects cross-origin collection, ignores bots, and never counts admin views', async () => {
  let accepted = 0;
  const store = { mode: 'local', append: async events => { accepted += events.length; return events.length; }, snapshot: async () => snapshot([]) };
  const handler = createAnalyticsHandler({ local: true, store: secured(store), env: testEnv });
  const batch = payload([event('view', { at: Date.now() })]);
  assert.equal((await handler(request('collect', 'POST', batch, { origin: 'https://other.example' }))).status, 403);
  assert.equal((await handler(request('collect', 'POST', batch, { 'user-agent': 'ExampleBot' }))).status, 204);
  assert.equal((await handler(request('collect', 'POST', { ...batch, context: { ...batch.context, page: '/admin' } }))).status, 400);
  assert.equal(accepted, 0);
  assert.equal((await handler(request('collect', 'POST', batch))).status, 202);
  assert.equal(accepted, 1);
});

test('a production instance without configuration fails closed and exposes no report', async () => {
  const handler = createAnalyticsHandler({ env: {} });
  const status = await (await handler(request('session'))).json();
  assert.equal(status.configured, false);
  assert.equal(status.authenticated, false);
  assert.equal((await handler(request('report'))).status, 503);
});

test('CSV exports actual daily values and storage failures do not turn into fake zeroes', async () => {
  const report = buildReport(snapshot([event()]), '30d', NOW);
  const csv = reportCSV(report);
  assert(csv.startsWith('\uFEFF'));
  assert.match(csv, /"2026-11-03";"1";"1"/);
  const handler = createAnalyticsHandler({ local: true, env: testEnv, store: secured({ mode: 'local', snapshot: async () => { throw new Error('Unavailable'); } }) });
  const login = await handler(request('login', 'POST', { password: PASSWORD }));
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await handler(request('report', 'GET', undefined, { cookie }))).status, 503);
});

test('passwords use salted scrypt and local access also requires authentication', async () => {
  assert(await verifyPassword(PASSWORD, testEnv.ANALYTICS_ADMIN_PASSWORD_HASH));
  assert.equal(await verifyPassword('incorrect', testEnv.ANALYTICS_ADMIN_PASSWORD_HASH), false);
  assert.notEqual(await hashPassword(PASSWORD), testEnv.ANALYTICS_ADMIN_PASSWORD_HASH);
  const handler = createAnalyticsHandler({ local: true, env: testEnv, store: secured({ mode: 'local', snapshot: async () => snapshot([]) }) });
  assert.equal((await handler(request('report'))).status, 401);
  const info = await (await handler(request('session'))).json();
  assert.equal(info.authenticated, false);
  assert.equal(info.storage, null);
  assert.equal((await handler(request('login', 'POST', { password: 'wrong' }))).status, 401);
});

test('logout revokes the copied session and credential rotation invalidates sessions', async () => {
  const store = secured({ mode: 'redis', snapshot: async () => snapshot([]) });
  const handler = createAnalyticsHandler({ env: testEnv, store });
  const login = await handler(request('login', 'POST', { password: PASSWORD }));
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^__Host-lv_admin=/);
  assert.equal((await handler(request('report', 'GET', undefined, { cookie }))).status, 200);
  const rotated = createAnalyticsHandler({ store, env: { ...testEnv, ANALYTICS_ADMIN_PASSWORD_HASH: await hashPassword('a-different-long-administrator-password') } });
  assert.equal((await rotated(request('report', 'GET', undefined, { cookie }))).status, 401);
  assert.equal((await handler(request('logout', 'POST', {}, { cookie }))).status, 200);
  assert.equal((await handler(request('report', 'GET', undefined, { cookie }))).status, 401);
  assert.equal((await handler(request('export', 'GET', undefined, { cookie }))).status, 401);
});

test('shared rate limits survive a new handler and unavailable security storage fails closed', async () => {
  const store = secured({ mode: 'redis' });
  const handler = createAnalyticsHandler({ env: testEnv, store });
  for (let i = 0; i < 8; i++) assert.equal((await handler(request('login', 'POST', { password: 'wrong' }))).status, 401);
  const second = createAnalyticsHandler({ env: testEnv, store });
  assert.equal((await second(request('login', 'POST', { password: PASSWORD }))).status, 429);
  const failing = createAnalyticsHandler({ env: testEnv, store: { ...store, consumeRate: async () => { throw new Error('private database detail'); } } });
  const response = await failing(request('login', 'POST', { password: PASSWORD }));
  assert.equal(response.status, 503);
  assert.equal(response.headers.has('set-cookie'), false);
  assert.doesNotMatch(await response.text(), /private database/);
});

test('mutation origin, request sizes, methods and missing secrets are rejected', async () => {
  const store = secured({ mode: 'local' });
  const handler = createAnalyticsHandler({ local: true, env: testEnv, store });
  const noOrigin = new Request('https://portfolio.example/api/analytics/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
  assert.equal((await handler(noOrigin)).status, 403);
  assert.equal((await handler(request('login'))).status, 405);
  assert.equal((await handler(request('login', 'POST', { password: 'x'.repeat(5000) }))).status, 400);
  assert.equal((await handler(request('login', 'POST', []))).status, 401);
  const missingSecret = createAnalyticsHandler({ store, env: { ANALYTICS_ADMIN_PASSWORD_HASH: testEnv.ANALYTICS_ADMIN_PASSWORD_HASH } });
  assert.equal((await missingSecret(request('report'))).status, 503);
  const invalidEndpoint = createAnalyticsHandler({ env: { ...testEnv, UPSTASH_REDIS_REST_URL: 'http://localhost', UPSTASH_REDIS_REST_TOKEN: 'test-token' } });
  assert.equal((await invalidEndpoint(request('report'))).status, 503);
});
