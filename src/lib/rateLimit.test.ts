import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows up to the limit per key within the window, then blocks', () => {
    const t = 0;
    const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true);
  });

  it('frees capacity once earlier hits leave the window', () => {
    let t = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(allow('a')).toBe(true);
    t = 999;
    expect(allow('a')).toBe(false);
    t = 1000;
    expect(allow('a')).toBe(true);
  });

  it('does not retain a key in the backing store once its window is empty', () => {
    const store = new Map<string, number[]>();
    // limit 0 means every call is rejected, so the recent-hits window for the
    // key is always empty; the map should not grow an entry for it forever.
    const allow = createRateLimiter({ limit: 0, windowMs: 1000, now: () => 0, store });
    allow('a');
    expect(store.has('a')).toBe(false);
  });
});
