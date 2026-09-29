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
