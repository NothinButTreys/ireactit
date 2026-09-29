import { describe, expect, it } from 'vitest';
import { EASE_OUT, SPRING, mountVariants } from './motion';

describe('motion presets', () => {
  it('uses the house easing curve and spring', () => {
    expect(EASE_OUT).toEqual([0.22, 1, 0.36, 1]);
    expect(SPRING).toEqual({ type: 'spring', stiffness: 300, damping: 30 });
  });

  it('mounts with fade, 0.98 scale and 4px blur over 500ms', () => {
    const v = mountVariants(false);
    expect(v.hidden).toEqual({ opacity: 0, scale: 0.98, filter: 'blur(4px)' });
    expect(v.visible).toEqual({
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });

  it('collapses to a short opacity-only fade under reduced motion', () => {
    const v = mountVariants(true);
    expect(v.hidden).toEqual({ opacity: 0 });
    expect(v.visible).toEqual({ opacity: 1, transition: { duration: 0.15 } });
  });
});
