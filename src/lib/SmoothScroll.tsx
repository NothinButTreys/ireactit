import Lenis from 'lenis';
import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Height of the fixed nav; each section carries `scroll-mt-14` (56px) to stop this far below it. */
export const NAV_OFFSET = 56;

export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      // No extra offset here: each section's own `scroll-mt-14` already accounts for the fixed nav,
      // so adding one here would land anchors NAV_OFFSET further below it.
      anchors: true,
      // The Inspector is a modal <dialog>; let it scroll natively.
      prevent: (node) => node.closest('dialog') !== null,
    });
    return () => lenis.destroy();
  }, [reduced]);

  return null;
}
