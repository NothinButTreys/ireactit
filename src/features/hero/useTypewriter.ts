import { useEffect, useState } from 'react';

type Options = { cps?: number; enabled?: boolean };

/** Types `text` out at `cps` characters per second. Disabled → the full text immediately (reduced motion). */
export function useTypewriter(text: string, { cps = 60, enabled = true }: Options = {}) {
  const [typed, setTyped] = useState(0);
  const count = enabled ? Math.min(typed, text.length) : text.length;
  const done = count >= text.length;

  useEffect(() => {
    if (!enabled || done) return;
    const id = window.setInterval(() => setTyped((n) => n + 1), 1000 / cps);
    return () => window.clearInterval(id);
  }, [enabled, done, cps]);

  return { output: text.slice(0, count), done };
}
