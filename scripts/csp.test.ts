import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildCsp, inlineScriptHashes, readCspFromVercelJson } from './csp';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;

describe('inlineScriptHashes', () => {
  it('hashes inline scripts exactly as written, and skips external and JSON scripts', () => {
    const html = `<script>a()</script><script type="module" src="/x.js"></script><script type="application/json">{}</script><script>\n b() \n</script>`;
    expect(inlineScriptHashes(html)).toEqual([sha('a()'), sha('\n b() \n')]);
  });
});

describe('buildCsp', () => {
  it('locks everything to self and allows only the given script hashes', () => {
    const csp = buildCsp(["'sha256-abc'"]);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'sha256-abc'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('readCspFromVercelJson', () => {
  it('finds the CSP header on the catch-all route', () => {
    const json = { headers: [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: 'x' }] }] };
    expect(readCspFromVercelJson(json)).toBe('x');
  });
});
