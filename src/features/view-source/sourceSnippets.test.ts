// @vitest-environment node
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSnippets } from '../../../vite-plugins/sourceSnippets';
import { SECTION_IDS } from '@/content/sections';

describe('renderSnippets', () => {
  it('highlights each .snippet at build time and takes the filename from line 1', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'snippets-'));
    await writeFile(join(dir, 'mount.snippet'), '// src/demo.tsx\nexport const a = <b c="d" />;\n');
    const out = await renderSnippets(dir);
    expect(out.mount?.filename).toBe('src/demo.tsx');
    expect(out.mount?.lines).toBe(2);
    expect(out.mount?.html).toContain('<pre class="shiki');
    expect(out.mount?.html).toContain('var(--shiki-');
  }, 20_000);

  it('rejects a snippet without a path comment', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'snippets-'));
    await writeFile(join(dir, 'bad.snippet'), 'const x = 1;\n');
    await expect(renderSnippets(dir)).rejects.toThrow('bad.snippet');
  }, 20_000);

  it('ships a snippet for every section', async () => {
    const files = await readdir('src/content/snippets');
    expect(files.map((f) => f.replace('.snippet', '')).sort()).toEqual([...SECTION_IDS].sort());
  });
});
