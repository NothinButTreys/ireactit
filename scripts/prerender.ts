import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { injectAppHtml } from '../src/lib/injectAppHtml';

const { render } = (await import(pathToFileURL(resolve('dist-server/entry-server.js')).href)) as {
  render: () => Promise<string>;
};

const templatePath = resolve('dist/index.html');
const appHtml = await render();
await writeFile(templatePath, injectAppHtml(await readFile(templatePath, 'utf8'), appHtml));
await rm('dist-server', { recursive: true, force: true });
console.log(`prerender: injected ${appHtml.length} chars into dist/index.html`);
