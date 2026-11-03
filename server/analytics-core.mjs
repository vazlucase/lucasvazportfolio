export const DAY = 86400000;
export const TIMEZONE = 'America/Sao_Paulo';
export const EVENT_TYPES = new Set(['view', 'section', 'project', 'contact', 'scroll', 'active', 'skill']);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
// Control characters are deliberately removed from every external label.
// eslint-disable-next-line no-control-regex
const clean = (value, max = 100) => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, max) : '';
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const hourFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone: TIMEZONE });
export const dayKey = timestamp => dayFormatter.format(timestamp);
const midnight = key => Date.parse(`${key}T00:00:00-03:00`);

function monthsBefore(timestamp, months) {
  const key = dayKey(timestamp);
  const [year, month, day] = key.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 - months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return midnight(`${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`);
}

export function periodRange(period = '30d', now = Date.now()) {
  if (!['30d', '3m', '1y'].includes(period)) throw new Error('Período inválido.');
  const end = midnight(dayKey(now)) + DAY;
  const months = period === '3m' ? 3 : 12;
  const start = period === '30d' ? end - 30 * DAY : monthsBefore(end, months);
  const previousStart = period === '30d' ? start - 30 * DAY : monthsBefore(start, months);
  return { start, end, previousStart, previousEnd: start, days: Math.round((end - start) / DAY) };
}

export function normalizeBatch(payload, now = Date.now()) {
  if (!payload || !Array.isArray(payload.events) || !payload.events.length || payload.events.length > 20) throw new Error('Lote de eventos inválido.');
  const context = payload.context;
  if (!context || !UUID.test(context.visitorId) || !UUID.test(context.sessionId)) throw new Error('Identificação anônima inválida.');
  const page = clean(context.page, 100);
  if (page !== '/') throw new Error('Página não monitorada.');
  const source = clean(context.source || 'Direto', 80);
  const device = ['Desktop', 'Celular', 'Tablet'].includes(context.device) ? context.device : 'Desktop';
  const browser = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera', 'Outro'].includes(context.browser) ? context.browser : 'Outro';
  return payload.events.map(event => {
    if (!event || !UUID.test(event.id) || !EVENT_TYPES.has(event.type)) throw new Error('Evento inválido.');
    if (!Number.isFinite(event.at) || Math.abs(now - event.at) > 15 * 60000) throw new Error('Evento fora da janela de coleta.');
    let label = clean(event.label);
    let value = Number.isFinite(event.value) ? event.value : 0;
    if (event.type === 'view') { label = '/'; value = 1; }
    if (event.type === 'contact' && !['email', 'whatsapp', 'copy'].includes(label)) throw new Error('Canal inválido.');
    if (event.type === 'section' && !['top', 'projetos', 'sobre', 'skills', 'contato'].includes(label)) throw new Error('Seção inválida.');
    if (event.type === 'scroll' && ![25, 50, 75, 100].includes(value)) throw new Error('Profundidade inválida.');
    if (event.type === 'active') value = Math.max(0, Math.min(30, value));
    return { id: event.id, at: Math.min(event.at, now), type: event.type, label, value,
      visitorId: context.visitorId, sessionId: context.sessionId, page, source, device, browser };
  });
}

function summarize(events) {
  const visitors = new Set(), sessions = new Map();
  let views = 0, contacts = 0, projects = 0, active = 0;
  for (const event of events) {
    visitors.add(event.visitorId);
    if (!sessions.has(event.sessionId)) sessions.set(event.sessionId, { views: 0, active: 0, contact: false, project: false, scroll: 0 });
    const session = sessions.get(event.sessionId);
    if (event.type === 'view') { views++; session.views++; }
    if (event.type === 'contact') { contacts++; session.contact = true; }
    if (event.type === 'project') { projects++; session.project = true; }
    if (event.type === 'active') { active += event.value; session.active += event.value; }
    if (event.type === 'scroll') session.scroll = Math.max(session.scroll, event.value);
  }
  const values = [...sessions.values()], count = sessions.size;
  const engaged = values.filter(session => session.active >= 10 || session.views >= 2 || session.contact || session.project).length;
  return { views, visitors: visitors.size, sessions: count, engagementRate: count ? engaged / count * 100 : 0,
    avgActiveSeconds: count ? active / count : 0, contacts, contactRate: count ? values.filter(session => session.contact).length / count * 100 : 0,
    projects, completionRate: count ? values.filter(session => session.scroll >= 100).length / count * 100 : 0 };
}

function breakdown(events, key, type, uniqueSessions = false) {
  const counts = new Map();
  for (const event of events) {
    if (type && event.type !== type) continue;
    const name = typeof key === 'function' ? key(event) : event[key];
    if (!counts.has(name)) counts.set(name, uniqueSessions ? new Set() : 0);
    if (uniqueSessions) counts.get(name).add(event.sessionId);
    else counts.set(name, counts.get(name) + 1);
  }
  const rows = [...counts].map(([name, value]) => ({ name, value: uniqueSessions ? value.size : value }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.sort((a, b) => b.value - a.value).map(row => ({ ...row, percentage: total ? row.value / total * 100 : 0 }));
}

export function buildReport(snapshot, period = '30d', now = Date.now(), options = {}) {
  const range = periodRange(period, now);
  const eligible = snapshot.events.filter(event => event.at <= now);
  const events = eligible.filter(event => event.at >= range.start && event.at < range.end);
  const previousEvents = eligible.filter(event => event.at >= range.previousStart && event.at < range.previousEnd);
  const current = summarize(events), previous = summarize(previousEvents);
  const comparisonComplete = snapshot.startedAt <= range.previousStart;
  const metrics = Object.fromEntries(Object.entries(current).map(([key, value]) => [key, { value, previous: previous[key],
    change: comparisonComplete && previous[key] > 0 ? (value - previous[key]) / previous[key] * 100 : null }]));
  const days = new Map();
  const collectionStartDay = dayKey(snapshot.startedAt);
  for (let at = range.start; at < range.end; at += DAY) days.set(dayKey(at), { date: dayKey(at), available: dayKey(at) >= collectionStartDay, views: 0, visitors: new Set(), sessions: new Set(), contacts: 0, activeSeconds: 0, previousViews: 0 });
  for (const event of events) {
    const day = days.get(dayKey(event.at));
    if (!day) continue;
    day.visitors.add(event.visitorId); day.sessions.add(event.sessionId);
    if (event.type === 'view') day.views++;
    if (event.type === 'contact') day.contacts++;
    if (event.type === 'active') day.activeSeconds += event.value;
  }
  for (const event of previousEvents) {
    if (event.type !== 'view') continue;
    const index = Math.floor((midnight(dayKey(event.at)) - range.previousStart) / DAY);
    const day = days.get(dayKey(range.start + index * DAY));
    if (day) day.previousViews++;
  }
  const views = events.filter(event => event.type === 'view');
  const activeVisitors = new Set(eligible.filter(event => event.at >= now - 5 * 60000).map(event => event.visitorId)).size;
  const firstSeen = new Map();
  for (const event of eligible) firstSeen.set(event.visitorId, Math.min(firstSeen.get(event.visitorId) ?? Infinity, event.at));
  const currentVisitors = new Set(events.map(event => event.visitorId));
  const returning = [...currentVisitors].filter(id => firstSeen.get(id) < range.start).length;
  const sources = breakdown(events, 'source', undefined, true);
  const projects = breakdown(events, 'label', 'project');
  const sections = breakdown(events, 'label', 'section', true).map(row => ({ ...row, percentage: current.sessions ? row.value / current.sessions * 100 : 0 }));
  const hours = Array.from({ length: 24 }, (_, hour) => ({ name: String(hour).padStart(2, '0'), value: 0 }));
  for (const event of views) hours[Number(hourFormatter.format(event.at))].value++;
  const insights = [];
  if (!current.views) insights.push({ tone: 'neutral', title: 'A história começa agora', text: 'As próximas visitas reais vão preencher seus gráficos. Os períodos anteriores à coleta ficam sem dados.' });
  if (sources[0]) insights.push({ tone: 'positive', title: `${sources[0].name} traz mais visitas`, text: `${Math.round(sources[0].percentage)}% das sessões registradas no período vieram dessa origem.` });
  if (projects[0]) insights.push({ tone: 'lilac', title: `${projects[0].name} está em destaque`, text: `${projects[0].value} ${projects[0].value === 1 ? 'abertura' : 'aberturas'} de detalhes. É o projeto mais explorado no período.` });
  if (current.sessions) insights.push({ tone: current.contacts ? 'positive' : 'neutral', title: current.contacts ? 'Seu trabalho está abrindo conversas' : 'Acompanhe o caminho até o contato',
    text: current.contacts ? `${current.contacts} cliques de contato em ${current.sessions} sessões. Cliques indicam intenção; o envio da mensagem acontece fora do site.` : 'Os cliques de e-mail, WhatsApp e copiar endereço aparecerão aqui quando acontecerem.' });
  const today = dayKey(now);
  return { period, range, metrics,
    meta: { startedAt: snapshot.startedAt, totalViews: snapshot.totalViews, updatedAt: now, lastEventAt: eligible.reduce((latest, event) => Math.max(latest, event.at), 0) || null,
      storage: options.storage ?? 'local', local: !!options.local, timezone: TIMEZONE, historyDays: Math.max(1, Math.floor((now - snapshot.startedAt) / DAY) + 1), comparisonComplete },
    daily: [...days.values()].map(day => ({ ...day, visitors: day.visitors.size, sessions: day.sessions.size })),
    breakdowns: { sources, devices: breakdown(events, 'device', undefined, true), browsers: breakdown(events, 'browser', undefined, true),
      pages: breakdown(views, 'page'), projects, sections, contacts: breakdown(events, 'label', 'contact'),
      hours,
      visitorTypes: [{ name: 'Novos no período', value: currentVisitors.size - returning }, { name: 'Recorrentes', value: returning }] },
    realtime: { activeVisitors, viewsToday: eligible.filter(event => event.type === 'view' && dayKey(event.at) === today).length,
      recent: eligible.filter(event => ['view', 'project', 'contact'].includes(event.type)).sort((a, b) => b.at - a.at).slice(0, 8)
        .map(({ id, type, label, at, source, device }) => ({ id, type, label, at, source, device })) }, insights };
}

export function reportCSV(report) {
  const escape = value => `"${String(value).replace(/^[=+@-]/, "'").replace(/"/g, '""')}"`;
  const rows = [['Data', 'Visualizações', 'Visitantes anônimos', 'Sessões', 'Cliques de contato', 'Tempo ativo (segundos)', 'Status da coleta'],
    ...report.daily.map(day => [day.date, ...(day.available ? [day.views, day.visitors, day.sessions, day.contacts, Math.round(day.activeSeconds)] : ['', '', '', '', '']), day.available ? 'Coleta disponível' : 'Anterior à coleta'])];
  return '\uFEFF' + rows.map(row => row.map(escape).join(';')).join('\r\n');
}
