import { describe, expect, it } from 'vitest';
import { initialAssets } from './bundleBudget';

describe('initialAssets', () => {
  it('finds the entry module and its modulepreloads, but not lazy chunks or CSS', () => {
    const html = `<head>
      <script type="module" crossorigin src="/assets/index-abc.js"></script>
      <link rel="modulepreload" crossorigin href="/assets/vendor-def.js">
      <link rel="stylesheet" href="/assets/index-123.css">
    </head>`;
    expect(initialAssets(html)).toEqual(['/assets/index-abc.js', '/assets/vendor-def.js']);
  });
});
