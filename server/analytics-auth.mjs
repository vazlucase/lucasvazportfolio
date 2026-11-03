import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
const parameters = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const SESSION_TTL = 8 * 3600000;
export const isPasswordHash = value => typeof value === 'string' && /^scrypt-v1:[a-f0-9]{32}:[a-f0-9]{128}$/.test(value);
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 16 || password.length > 256) throw new Error('Use uma senha entre 16 e 256 caracteres.');
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, parameters);
  return `scrypt-v1:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 256 || !isPasswordHash(encoded)) return false;
  const [, salt, expected] = encoded.split(':');
  const key = await derive(password, salt, 64, parameters);
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
export function sessionSecret(secret, passwordHash) {
  // Changing either credential invalidates every existing session.
  return createHmac('sha256', secret).update(passwordHash).digest('hex');
}
export function createMemorySecurity() {
  const rates = new Map(), sessions = new Map();
  const prune = map => { const now = Date.now(); for (const [key, entry] of map) if (entry.until <= now) map.delete(key); };
  return {
    async consumeRate(key, limit, duration) {
      prune(rates);
      if (!rates.has(key) && rates.size >= 10000) return false;
      const entry = rates.get(key) ?? { count: 0, until: Date.now() + duration };
      entry.count++; rates.set(key, entry);
      return entry.count <= limit;
    },
    async createSession(key, duration) { prune(sessions); if (sessions.size >= 1000) throw new Error('Limite de sessões.'); sessions.set(key, { until: Date.now() + duration }); },
    async hasSession(key) { prune(sessions); return sessions.has(key); },
    async deleteSession(key) { sessions.delete(key); },
  };
}
