const MARKER = '<!--app-html-->';

export function injectAppHtml(template: string, appHtml: string): string {
  if (!template.includes(MARKER)) throw new Error(`prerender: ${MARKER} marker missing from index.html`);
  return template.replace(MARKER, () => appHtml);
}
