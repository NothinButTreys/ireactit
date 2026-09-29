import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { initialAssets } from './bundleBudget';

const BUDGET_BYTES = 150 * 1024;

const html = await readFile('dist/index.html', 'utf8');
let total = 0;
for (const asset of initialAssets(html)) {
  const size = gzipSync(await readFile(join('dist', asset))).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${asset}`);
}
console.log(`${(total / 1024).toFixed(1).padStart(7)} KB  total initial JS (gzip), budget ${BUDGET_BYTES / 1024} KB`);
if (total > BUDGET_BYTES) {
  console.error('Initial JS is over budget.');
  process.exit(1);
}
