import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { buildReport, normalizeBatch, reportCSV } from './analytics-core.mjs';
import { createFileStore, createRedisStore } from './analytics-store.mjs';
import { isPasswordHash, sessionSecret, SESSION_TTL, verifyPassword } from './analytics-auth.mjs';

const digest = value => createHash('sha256').update(value).digest();
const equal = (a, b) => timingSafeEqual(digest(a), digest(b));
const tokenKey = token => digest(token).toString('hex');
const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0', 'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow', 'Vary': 'Cookie',
};
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { ...privateHeaders, ...headers } });
export function signSession(secret, now = Date.now()) {
  const value = Buffer.from(JSON.stringify({ iat: now, exp: now + SESSION_TTL, nonce: randomBytes(24).toString('base64url') })).toString('base64url');
  return value + '.' + createHmac('sha256', secret).update(value).digest('base64url');
}
export function validSession(token, secret, now = Date.now()) {
  if (!token || token.length > 1000 || !secret) return false;
  try {
    const [value, signature, extra] = token.split('.');
    const expected = createHmac('sha256', secret).update(value).digest('base64url');
    const claims = JSON.parse(Buffer.from(value, 'base64url').toString());
    return !extra && !!signature && equal(signature, expected) && Number.isFinite(claims.iat) &&
      claims.iat <= now && claims.exp > now && claims.exp - claims.iat === SESSION_TTL &&
      typeof claims.nonce === 'string' && claims.nonce.length === 32;
  } catch { return false; }
}

async function readJSON(request, limit = 65536) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('Formato de envio inválido.');
  if (Number(request.headers.get('content-length')) > limit) throw new Error('Envio muito grande.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Envio vazio.');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('Envio muito grande.'); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('JSON inválido.'); }
}

export function createAnalyticsHandler(options = {}) {
  const local = !!options.local, env = options.env ?? process.env;
  const passwordHash = env.ANALYTICS_ADMIN_PASSWORD_HASH ?? '';
  const key = env.ANALYTICS_SESSION_SECRET ?? '';
  const secret = sessionSecret(key, passwordHash);
  let store = options.store;
  if (!store) {
    try {
      store = local ? createFileStore(options.directory ?? '.analytics-data')
        : env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
          ? createRedisStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, env.ANALYTICS_KEY_PREFIX || undefined) : null;
    } catch { store = null; }
  }
  const configured = !!store?.createSession && !!store?.consumeRate && isPasswordHash(passwordHash) && key.length >= 32;
  const cookieName = local ? 'lv_admin_local' : '__Host-lv_admin';
  const cookieToken = request => request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  const authorized = async request => {
    const token = cookieToken(request);
    return configured && validSession(token, secret) && await store.hasSession(tokenKey(token));
  };
  const rate = async (request, kind, limit, duration = 60000) => {
    // Vercel overwrites x-forwarded-for at the ingress. Never trust x-real-ip.
    const address = local ? 'loopback' : (request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown');
    const id = createHmac('sha256', secret).update(kind + ':' + address).digest('hex');
    return store.consumeRate(id, limit, duration);
  };
  const dispatch = async request => {
    const url = new URL(request.url), origin = request.headers.get('origin');
    const action = url.searchParams.get('action') ?? url.pathname.split('/').filter(Boolean).at(-1);
    const methods = { session: 'GET', login: 'POST', logout: 'POST', collect: 'POST', report: 'GET', export: 'GET' };
    if (!Object.hasOwn(methods, action)) return json({ error: 'Rota não encontrada.' }, 404);
    if (request.method !== methods[action]) return json({ error: 'Método não permitido.' }, 405, { Allow: methods[action] });
    if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site' ||
        (request.method === 'POST' && origin !== url.origin)) return json({ error: 'Origem não permitida.' }, 403);
    const cookie = (token, age) => cookieName + '=' + token + '; HttpOnly; SameSite=Strict; ' +
      (!local || url.protocol === 'https:' ? 'Secure; ' : '') + 'Path=/; Max-Age=' + age;
    if (action === 'session') {
      const authenticated = await authorized(request);
      return json({ authenticated, configured, local, storage: authenticated ? store.mode : null });
    }
    if (!configured) return json({ error: 'O painel está indisponível. Entre em contato com o administrador.', code: 'NOT_CONFIGURED' }, 503);
    if (action === 'login') {
      if (!await rate(request, 'login', 8, 15 * 60000)) return json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, 429, { 'Retry-After': '900' });
      let payload;
      try { payload = await readJSON(request, 2048); } catch (error) { return json({ error: error.message }, 400); }
      if (!await verifyPassword(payload?.password, passwordHash)) return json({ error: 'Senha incorreta.' }, 401);
      const token = signSession(secret);
      await store.createSession(tokenKey(token), SESSION_TTL);
      return json({ authenticated: true }, 200, { 'Set-Cookie': cookie(token, SESSION_TTL / 1000) });
    }
    if (action === 'logout') {
      const token = cookieToken(request);
      if (validSession(token, secret)) await store.deleteSession(tokenKey(token));
      return json({ authenticated: false }, 200, { 'Set-Cookie': cookie('', 0) });
    }
    if (action === 'collect') {
      if (/bot|crawler|spider|headless|lighthouse|preview|slurp/i.test(request.headers.get('user-agent') ?? '')) return new Response(null, { status: 204, headers: privateHeaders });
      if (!await rate(request, 'collect', 180)) return json({ error: 'Limite de coleta atingido.' }, 429, { 'Retry-After': '60' });
      let events;
      try { events = normalizeBatch(await readJSON(request)); } catch (error) { return json({ error: error.message }, 400); }
      return json({ accepted: await store.append(events) }, 202);
    }
    if (!await authorized(request)) return json({ error: 'Entre no painel para acessar os relatórios.' }, 401);
    if (!await rate(request, 'report', 60)) return json({ error: 'Aguarde um minuto para atualizar novamente.' }, 429, { 'Retry-After': '60' });
    const period = url.searchParams.get('period') || '30d';
    if (!['30d', '3m', '1y'].includes(period)) return json({ error: 'Período inválido.' }, 400);
    const report = buildReport(await store.snapshot(), period, Date.now(), { local, storage: store.mode });
    if (action === 'export') return new Response(reportCSV(report), { headers: { ...privateHeaders, 'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lucas-vaz-' + period + '.csv"' } });
    return json(report);
  };
  return request => dispatch(request).catch(() => json({ error: 'Serviço temporariamente indisponível. Tente novamente.' }, 503));
}
