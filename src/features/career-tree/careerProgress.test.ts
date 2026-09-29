import { describe, expect, it } from 'vitest';
import { careerYears, formatMonth, formatRange, mountedCount } from './careerProgress';
import { experience } from '@/content/experience';

describe('mountedCount', () => {
  it('mounts the first node at the top and every node at the end', () => {
    expect(mountedCount(0, 6)).toBe(1);
    expect(mountedCount(0.5, 6)).toBe(3);
    expect(mountedCount(0.51, 6)).toBe(4);
    expect(mountedCount(1, 6)).toBe(6);
  });

  it('clamps out-of-range progress and handles an empty tree', () => {
    expect(mountedCount(-0.2, 6)).toBe(1);
    expect(mountedCount(1.4, 6)).toBe(6);
    expect(mountedCount(0.5, 0)).toBe(0);
  });
});

describe('careerYears', () => {
  it('counts whole years since the earliest role (May 2006 → 20 in 2026)', () => {
    expect(careerYears(experience, 2026)).toBe(20);
  });
});

describe('formatRange', () => {
  it('formats months and open-ended roles', () => {
    expect(formatMonth('2023-08')).toBe('Aug 2023');
    expect(formatRange('2023-08', null)).toBe('Aug 2023 – present');
    expect(formatRange('2017-06', '2021-06')).toBe('Jun 2017 – Jun 2021');
  });
});
