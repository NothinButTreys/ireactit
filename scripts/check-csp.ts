import { readFile } from 'node:fs/promises';
import { buildCsp, inlineScriptHashes, readCspFromVercelJson } from './csp';

const html = await readFile('dist/index.html', 'utf8');
const expected = buildCsp(inlineScriptHashes(html));
const actual = readCspFromVercelJson(JSON.parse(await readFile('vercel.json', 'utf8')));
if (actual !== expected) {
  console.error('vercel.json CSP is out of date. Expected:\n' + expected);
  process.exit(1);
}
console.log('CSP matches the built inline scripts.');
