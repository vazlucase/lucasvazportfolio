import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hashPassword } from '../server/analytics-auth.mjs';

const production = process.argv.includes('--production');
const root = resolve(import.meta.dirname, '..');
const envFile = resolve(root, production ? 'secrets/vercel.env' : '.env.local');
const credentials = resolve(root, production ? 'secrets/painel-producao.txt' : 'secrets/painel-local.txt');
let existing = '';
try { existing = await readFile(envFile, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
if (/^ANALYTICS_ADMIN_PASSWORD_HASH=.+/m.test(existing)) {
  console.log('Credenciais existentes preservadas. Consulte ' + credentials);
  process.exit(0);
}
try { await access(credentials); throw new Error('Já existe um arquivo de acesso. Preserve-o antes de gerar novas credenciais.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const password = randomBytes(24).toString('base64url');
const hash = await hashPassword(password);
const secret = randomBytes(48).toString('base64url');
const settings = [
  'ANALYTICS_ADMIN_PASSWORD_HASH=' + hash,
  'ANALYTICS_SESSION_SECRET=' + secret,
  ...(production ? ['UPSTASH_REDIS_REST_URL=', 'UPSTASH_REDIS_REST_TOKEN=', 'ANALYTICS_KEY_PREFIX=lucasvaz:analytics:production:v1'] : []),
];
await mkdir(resolve(root, 'secrets'), { recursive: true });
await writeFile(credentials, ['ACESSO PRIVADO — NÃO COMPARTILHAR NEM VERSIONAR',
  production ? 'Painel: /painel no domínio de produção' : 'Painel: http://127.0.0.1:3000/painel',
  'Senha: ' + password, '',
  'A senha não é enviada ao GitHub. O servidor recebe somente o hash scrypt.',
  production ? 'Configure as variáveis de secrets/vercel.env na Vercel e complete as credenciais Upstash antes de publicar.' : 'Reinicie o servidor local para carregar as variáveis de .env.local.', ''].join('\n'), { flag: 'wx', mode: 0o600 });
const clean = existing.split(/\r?\n/).filter(line => !/^ANALYTICS_(ADMIN_PASSWORD(?:_HASH)?|SESSION_SECRET)=/.test(line)).join('\n').trim();
await writeFile(envFile, (clean ? clean + '\n\n' : '') + settings.join('\n') + '\n', { mode: 0o600 });
console.log('Credenciais geradas sem exibir valores. Arquivo privado: ' + credentials);
console.log('Variáveis do servidor: ' + envFile);
