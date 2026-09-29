import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SmoothScroll, NAV_OFFSET } from './SmoothScroll';
import { REDUCED_MOTION_QUERY } from './usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const { LenisMock, destroy } = vi.hoisted(() => {
  const destroy = vi.fn();
  const LenisMock = vi.fn(function Lenis() {
    return { destroy };
  });
  return { LenisMock, destroy };
});
vi.mock('lenis', () => ({ default: LenisMock }));

type LenisOptions = { autoRaf: boolean; anchors: boolean; prevent: (node: HTMLElement) => boolean };

describe('<SmoothScroll />', () => {
  beforeEach(() => {
    LenisMock.mockClear();
    destroy.mockClear();
  });

  it('starts Lenis with auto RAF and no extra anchor offset (sections carry their own scroll-mt), and destroys it on unmount', () => {
    const { unmount } = render(<SmoothScroll />);
    expect(LenisMock).toHaveBeenCalledOnce();
    const options = (LenisMock.mock.calls[0] as unknown as [LenisOptions])[0];
    expect(options.autoRaf).toBe(true);
    expect(options.anchors).toBe(true);
    expect(NAV_OFFSET).toBe(56);
    unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('lets dialogs scroll natively', () => {
    render(<SmoothScroll />);
    const options = (LenisMock.mock.calls[0] as unknown as [LenisOptions])[0];
    const dialog = document.createElement('dialog');
    const inside = document.createElement('p');
    dialog.append(inside);
    expect(options.prevent(inside)).toBe(true);
    expect(options.prevent(document.createElement('p'))).toBe(false);
  });

  it('does nothing when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<SmoothScroll />);
    expect(LenisMock).not.toHaveBeenCalled();
  });
});
