import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DAY } from './analytics-core.mjs';
import { createMemorySecurity } from './analytics-auth.mjs';

const RETENTION = 800 * DAY;
export function createFileStore(directory) {
  const filename = join(directory, 'analytics.json');
  let queue = Promise.resolve();
  const read = async () => {
    try { return JSON.parse(await readFile(filename, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return { version: 1, startedAt: Date.now(), totalViews: 0, events: [] }; throw error; }
  };
  const append = events => {
    const operation = queue.then(async () => {
      const snapshot = await read();
      const seen = new Set(snapshot.events.map(event => event.id));
      const added = events.filter(event => { if (seen.has(event.id)) return false; seen.add(event.id); return true; });
      snapshot.events = [...snapshot.events, ...added].filter(event => event.at >= Date.now() - RETENTION);
      snapshot.totalViews += added.filter(event => event.type === 'view').length;
      await mkdir(directory, { recursive: true });
      const temporary = `${filename}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(snapshot), { mode: 0o600 });
      await rename(temporary, filename);
      return added.length;
    });
    queue = operation.catch(() => {});
    return operation;
  };
  return { mode: 'local', ...createMemorySecurity(), append, snapshot: async () => { await queue; return read(); } };
}

const APPEND = `
redis.call('SET', KEYS[4], ARGV[2], 'NX')
local added = 0
for i = 3, #ARGV do
  local event = cjson.decode(ARGV[i])
  if redis.call('ZADD', KEYS[2], 'NX', event.at, event.id) == 1 then
    redis.call('ZADD', KEYS[1], event.at, ARGV[i])
    if event.type == 'view' then redis.call('INCR', KEYS[3]) end
    added = added + 1
  end
end
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', ARGV[1])
return added`;

const RATE = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return count`;

export function createRedisStore(url, token, prefix = 'lucasvaz:analytics:v1') {
  if (!/^https:\/\/[a-z0-9.-]+\.upstash\.io\/?$/i.test(url)) throw new Error('Endpoint Redis inválido.');
  if (!/^[a-zA-Z0-9:_-]{1,100}$/.test(prefix)) throw new Error('Prefixo Redis inválido.');
  const keys = ['events', 'seen', 'total-views', 'started-at'].map(key => `${prefix}:${key}`);
  const command = async (body, pipeline = false) => {
    const response = await fetch(`${url.replace(/\/$/, '')}${pipeline ? '/pipeline' : ''}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Armazenamento indisponível.');
    const result = await response.json();
    if (pipeline ? result.some(item => item.error) : result.error) throw new Error('Falha no armazenamento.');
    return pipeline ? result.map(item => item.result) : result.result;
  };
  return {
    mode: 'redis',
    consumeRate: async (key, limit, duration) => Number(await command(['EVAL', RATE, 1, `${prefix}:rate:${key}`, duration])) <= limit,
    createSession: (key, duration) => command(['SET', `${prefix}:session:${key}`, '1', 'PX', duration]),
    hasSession: async key => await command(['GET', `${prefix}:session:${key}`]) === '1',
    deleteSession: key => command(['DEL', `${prefix}:session:${key}`]),
    append: events => command(['EVAL', APPEND, 4, ...keys, Date.now() - RETENTION, Date.now(), ...events.map(event => JSON.stringify(event))]),
    snapshot: async () => {
      const [events, totalViews, startedAt] = await command([
        ['ZRANGEBYSCORE', keys[0], Date.now() - RETENTION, '+inf'], ['GET', keys[2]], ['GET', keys[3]],
      ], true);
      return { version: 1, startedAt: Number(startedAt) || Date.now(), totalViews: Number(totalViews) || 0, events: (events ?? []).map(value => JSON.parse(value)) };
    },
  };
}
