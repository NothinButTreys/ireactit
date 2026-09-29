import type { CSSProperties } from 'react';
import { useInViewOnce } from '@/lib/useInViewOnce';
import type { Token } from './treySource';

/** Lines stagger in the first time the editor is seen (CSS, JS-only); the full code is always in the DOM. */
export function CodeView({ lines }: { lines: readonly (readonly Token[])[] }) {
  const [ref, seen] = useInViewOnce<HTMLPreElement>(0.3);
  return (
    <pre
      ref={ref}
      role="region"
      // WAI-ARIA "scrollable region" pattern: this is horizontally scrollable (overflow-x-auto)
      // and has no other focusable descendant, so tabIndex=0 is required for keyboard users to
      // scroll it (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above
      tabIndex={0}
      aria-label="Trey.tsx source"
      data-typed={seen ? '' : undefined}
      className="code-view overflow-x-auto bg-bg px-5 py-6 font-mono text-[13px] leading-[26px] text-fg md:text-sm"
    >
      <code>
        {lines.map((line, i) => (
          <span key={i} className="code-line flex gap-5" style={{ '--i': i } as CSSProperties}>
            <span aria-hidden className="w-6 shrink-0 text-right text-muted select-none">
              {i + 1}
            </span>
            <span className="whitespace-pre">
              {line.map((token, j) => (
                <span key={j} className={token.kind === 'plain' ? undefined : `tok-${token.kind}`}>
                  {token.text}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
