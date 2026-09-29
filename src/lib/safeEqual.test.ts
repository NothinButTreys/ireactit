import { describe, expect, it } from 'vitest';
import { safeEqual } from './safeEqual';

describe('safeEqual', () => {
  it('matches identical strings only', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});
