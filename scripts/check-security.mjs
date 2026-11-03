import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const privatePath = /(^|\/)(secrets|\.analytics-data|\.vercel|\.figma|\.codex|\.openai|node_modules|dist)(\/|$)|(^|\/)\.env(?!\.example$)(\.|$)|\.(pem|key|map|tsbuildinfo)$/;
let sourceFiles = [];
try { sourceFiles = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean); }
catch { /* Git metadata is omitted from Vercel's build environment. */ }
for (const file of sourceFiles) if (privatePath.test(file)) failures.push('Arquivo privado no conjunto de publicação: ' + file);
const walk = async directory => {
  let entries; try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
};
const known = [];
for (const file of ['.env.local', 'secrets/vercel.env']) {
  try { const env = parseEnv(await readFile(resolve(root, file), 'utf8')); for (const [key, value] of Object.entries(env)) if (/PASSWORD|SECRET|TOKEN/.test(key) && value.length >= 16) known.push(value); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
for (const file of ['secrets/painel-local.txt', 'secrets/painel-producao.txt']) {
  try { const match = (await readFile(resolve(root, file), 'utf8')).match(/^Senha: (.+)$/m); if (match) known.push(match[1]); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const publicFiles = [...await walk(resolve(root, 'public')), ...await walk(resolve(root, 'dist'))];
const files = new Set([...sourceFiles.filter(file => !privatePath.test(file)).map(file => resolve(root, file)), ...publicFiles]);
const credential = /scrypt-v1:[a-f0-9]{32}:[a-f0-9]{128}|gh[pousr]_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{40,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
for (const file of files) {
  if (!['.ts', '.tsx', '.mts', '.mjs', '.js', '.css', '.html', '.json', '.md', '.yml', '.yaml', '.txt', '.example', '.env'].includes(extname(file))) continue;
  let content; try { content = await readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  if (credential.test(content) || known.some(value => content.includes(value))) failures.push('Possível credencial no arquivo: ' + relative(root, file));
}
for (const file of publicFiles) if (/\.(map|pem|key)$/.test(file) || /(^|[/\\])\.env/.test(file)) failures.push('Arquivo privado no build público: ' + relative(root, file));
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const csp = config.headers.flatMap(rule => rule.headers).find(header => header.key === 'Content-Security-Policy')?.value ?? '';
for (const [, inline] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
  const hash = createHash('sha256').update(inline).digest('base64');
  if (!csp.includes('sha256-' + hash)) failures.push('Atualize o hash CSP do JSON-LD em vercel.json.');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Verificação de publicação: nenhum segredo conhecido nos arquivos versionáveis ou no build; CSP conferida.');
