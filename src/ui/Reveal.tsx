import type { CSSProperties, ReactNode } from 'react';
import { useInViewOnce } from '@/lib/useInViewOnce';

type Props = { className?: string; delay?: number; children: ReactNode };

/**
 * Fades/scales/de-blurs its content in the first time it enters the viewport.
 * The hidden state is CSS-only and scoped to html.js, so prerendered and no-JS HTML stays visible.
 */
export function Reveal({ className, delay = 0, children }: Props) {
  const [ref, shown] = useInViewOnce<HTMLDivElement>();
  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined;
  return (
    <div ref={ref} data-reveal="" data-shown={shown ? '' : undefined} style={style} className={className}>
      {children}
    </div>
  );
}
