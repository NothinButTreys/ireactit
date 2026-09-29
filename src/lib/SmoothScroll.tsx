import Lenis from 'lenis';
import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Height of the fixed nav; anchor jumps stop this far above their target. */
export const NAV_OFFSET = 56;

export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -NAV_OFFSET },
      // The Inspector is a modal <dialog>; let it scroll natively.
      prevent: (node) => node.closest('dialog') !== null,
    });
    return () => lenis.destroy();
  }, [reduced]);

  return null;
}
