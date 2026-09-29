import { createHash } from 'node:crypto';

/** CSP source tokens for every inline classic script in the document, hashed byte-for-byte. */
export function inlineScriptHashes(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] ?? '';
    if (/\bsrc=/.test(attrs) || /type="(?!text\/javascript|module)[^"]*"/.test(attrs)) continue;
    out.push(`'sha256-${createHash('sha256').update(m[2]!).digest('base64')}'`);
  }
  return out;
}

export function buildCsp(scriptHashes: string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    // 'self' alone isn't enough: @fontsource-variable inlines its small "math"/symbol unicode-range
    // subset for JetBrains Mono Variable as a data: URI in the built CSS instead of a separate file.
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

export function readCspFromVercelJson(json: unknown): string | undefined {
  const rules = (json as { headers?: HeaderRule[] }).headers ?? [];
  return rules
    .find((r) => r.source === '/(.*)')
    ?.headers.find((h) => h.key.toLowerCase() === 'content-security-policy')?.value;
}
