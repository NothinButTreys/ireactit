/** JS the browser must fetch before first interaction: the entry module plus its modulepreloads. */
export function initialAssets(html: string): string[] {
  const scripts = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]!);
  const preloads = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]!);
  return [...scripts, ...preloads];
}
