import { useEffect, useState } from 'react';

/** Milliseconds from navigation start to the first frame after hydration; null until then (and in prerender). */
export function usePageRenderTime(): number | null {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMs(Math.round(performance.now())));
    return () => cancelAnimationFrame(frame);
  }, []);
  return ms;
}
