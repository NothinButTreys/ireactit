import { useEffect, useRef } from 'react';
import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';

type Props = { roles: readonly Experience[]; mounted: boolean; onOpenChange?: (open: boolean) => void };

export function EarlyCareerNode({ roles, mounted, onOpenChange }: Props) {
  const from = roles.at(-1)?.start.slice(0, 4);
  const to = roles[0]?.end?.slice(0, 4);
  const ref = useRef<HTMLDetailsElement>(null);

  // A visitor can open the prerendered <details> before hydration; that toggle event fired with no listener.
  useEffect(() => {
    if (ref.current?.open) onOpenChange?.(true);
  }, [onOpenChange]);

  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className="relative pl-10 pinned:pl-8">
      <span
        aria-hidden
        className={`absolute top-[22px] left-0 h-px w-8 origin-left transition-transform duration-500 pinned:top-4 pinned:w-6 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <details
        ref={ref}
        onToggle={(event) => onOpenChange?.(event.currentTarget.open)}
        className={`group rounded-xl border border-dashed bg-card px-5 py-3 transition-colors duration-500 pinned:py-1.5 ${mounted ? 'border-border' : 'border-border/40 bg-card/40'}`}
      >
        <summary className="cursor-pointer list-none font-mono text-[13px] leading-relaxed md:text-[15px] pinned:text-[13px] pinned:leading-snug [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="inline-block text-muted transition-transform duration-300 group-open:rotate-90">
            ▸
          </span>{' '}
          <span className="tok-tag">&lt;EarlyCareer</span> <span className="tok-prop">from</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{from}&quot;</span> <span className="tok-prop">to</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{to}&quot;</span> <span className="tok-prop">roles</span>
          <span className="tok-punct">={'{'}</span>
          <span className="tok-num">{roles.length}</span>
          <span className="tok-punct">{'}'}</span>
          <span className="tok-tag"> /&gt;</span>
          <span className="mt-2 flex flex-wrap gap-1.5 group-open:hidden pinned:mt-1 pinned:mb-0.5">
            {roles.map((role) => (
              <span key={role.component} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted">
                &lt;{role.component} /&gt;
              </span>
            ))}
          </span>
        </summary>
        <ol className="mount-in mt-4 flex flex-col gap-4">
          {roles.map((role) => (
            <li key={role.component} className="border-l border-border pl-4">
              <p className="font-semibold">{role.company}</p>
              <p className="text-sm text-muted">
                {role.role} · <span className="font-mono text-xs">{formatRange(role.start, role.end)}</span>
              </p>
              <ul className="mt-1.5 flex flex-col gap-1 text-[15px]">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}
