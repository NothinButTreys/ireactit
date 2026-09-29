import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readme = readFileSync('README.md', 'utf8');
const svgs = readdirSync('docs/readme')
  .filter((f) => f.endsWith('.svg'))
  .map((f) => readFileSync(join('docs/readme', f), 'utf8'))
  // Only what a reader sees: drop the stylesheet and the markup, whose viewBox and coordinates look like runs of digits.
  .map((svg) => svg.replace(/<style[\s\S]*?<\/style>/, '').replace(/<[^>]+>/g, ' '));

describe('README', () => {
  it('publishes no email address or phone number (README and its header SVGs)', () => {
    for (const text of [readme, ...svgs]) {
      expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      expect(text).not.toMatch(/mailto:|tel:/i);
      expect(text).not.toMatch(/\+?\d[\d ().-]{8,}\d/);
    }
  });

  it('points every relative image and link at a file or folder that exists', () => {
    const targets = [
      ...readme.matchAll(/(?:src|srcset|href)="([^"]+)"/g),
      ...readme.matchAll(/\]\(([^)\s]+)\)/g),
    ].map((m) => m[1]!);
    const relative = targets.filter((t) => !/^(https?:|#)/.test(t)).map((t) => t.split('#')[0]!);
    expect(relative.length).toBeGreaterThan(10);
    for (const path of relative) expect(existsSync(path), path).toBe(true);
  });

  it('walks the five steps of the render cycle, in order', () => {
    const steps = [...readme.matchAll(/^\| `#(\w+)` \|/gm)].map((m) => m[1]);
    expect(steps).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
  });
});
