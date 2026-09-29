import { readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { createCssVariablesTheme, createHighlighter } from 'shiki';
import type { Plugin } from 'vite';

export type Snippet = { filename: string; html: string; lines: number };

const VIRTUAL_ID = 'virtual:source-snippets';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// Colours come from CSS variables (styles.css), so snippets follow the site theme in light and dark.
const theme = createCssVariablesTheme({ name: 'ireactit', variablePrefix: '--shiki-', fontStyle: true });

// Creating a highlighter (loading its wasm engine) is the expensive part, so it's shared across
// every call in this process and never disposed — dev/build/test processes are short-lived, and a
// cold create-per-call was slow enough under parallel test load to make the lazy SourcePanel chunk
// (which resolves this virtual module) occasionally miss a test's assertion timeout.
// Module-scope singleton, created once and intentionally never disposed: cheap for a handful of
// snippets in one language (tsx); revisit if the snippet set grows to many languages/instances.
let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;
function getHighlighter() {
  highlighterPromise ??= createHighlighter({ themes: [theme], langs: ['tsx'] });
  return highlighterPromise;
}

export async function renderSnippets(dir: string): Promise<Record<string, Snippet>> {
  const files = (await readdir(dir)).filter((file) => file.endsWith('.snippet')).sort();
  const [highlighter, sources] = await Promise.all([
    getHighlighter(),
    Promise.all(files.map((file) => readFile(join(dir, file), 'utf8'))),
  ]);
  const out: Record<string, Snippet> = {};
  for (const [i, file] of files.entries()) {
    const code = sources[i]!.trimEnd();
    const [firstLine = ''] = code.split('\n', 1);
    if (!firstLine.startsWith('// ')) throw new Error(`${file}: first line must be "// <path>"`);
    out[basename(file, '.snippet')] = {
      filename: firstLine.slice(3),
      html: highlighter.codeToHtml(code, { lang: 'tsx', theme: 'ireactit' }),
      lines: code.split('\n').length,
    };
  }
  return out;
}

/** Serves `virtual:source-snippets`: section id → build-time-highlighted snippet. */
export function sourceSnippets(dir = 'src/content/snippets'): Plugin {
  const absolute = resolve(dir);
  void getHighlighter(); // start the cold, expensive part as early as possible
  return {
    name: 'ireactit-source-snippets',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      for (const file of await readdir(absolute)) this.addWatchFile(join(absolute, file));
      return `export default ${JSON.stringify(await renderSnippets(absolute))};`;
    },
  };
}
