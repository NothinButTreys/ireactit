import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * View Source snippets are simplified excerpts, but they must stay honest: every function called and every
 * component rendered in a snippet must exist in the file its first line names. Allowed without appearing
 * there: syntax that looks like a call (keywords) and React hooks a simplified excerpt may use for context.
 */
const ALLOWED = new Set([
  // keywords followed by "(" in ordinary code
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'function',
  'return',
  'typeof',
  // React built-ins
  'useState',
  'useRef',
  'useEffect',
  'useReducer',
  'useCallback',
  'useMemo',
  // useReducer's dispatch, named by convention
  'dispatch',
]);

const dir = join(process.cwd(), 'src/content/snippets');
const snippets = readdirSync(dir).filter((file) => file.endsWith('.snippet'));

function identifiers(snippet: string): string[] {
  const code = snippet.replace(/\/\/.*$/gm, ''); // comments are prose, not calls
  const calls = [...code.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)].map((m) => m[1]!);
  const tags = [...code.matchAll(/<([A-Z]\w*)/g)].map((m) => m[1]!);
  return [...new Set([...calls, ...tags])].filter((id) => !ALLOWED.has(id));
}

describe('View Source snippets', () => {
  it('exist', () => {
    expect(snippets.length).toBeGreaterThan(0);
  });

  it.each(snippets)('%s only calls and renders what its source file does', (file) => {
    const code = readFileSync(join(dir, file), 'utf8');
    const path = code.split('\n', 1)[0]!.replace(/^\/\/ /, '');
    const source = readFileSync(join(process.cwd(), path), 'utf8');
    const missing = identifiers(code).filter((id) => !new RegExp(`\\b${id}\\b`).test(source));
    expect(missing, `${file} → ${path}`).toEqual([]);
    const attrs = [...code.matchAll(/\bdata-[a-z-]+/g)].map((m) => m[0]);
    const refs = [...code.matchAll(/\b(\w+)\.current\b/g)].map((m) => `${m[1]}.current`);
    for (const token of new Set([...attrs, ...refs])) {
      expect(source, `${file}: snippet mentions ${token}, source does not`).toContain(token);
    }
  });
});
