import { useState, type RefObject } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { mountedCount } from './careerProgress';

/** How many career nodes are mounted, driven by scroll through the pinned section. */
export function useCareerProgress(ref: RefObject<HTMLElement | null>, total: number, enabled: boolean): number {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [mounted, setMounted] = useState(1);
  useMotionValueEvent(scrollYProgress, 'change', (progress) => setMounted(mountedCount(progress, total)));
  return enabled ? mounted : total;
}
