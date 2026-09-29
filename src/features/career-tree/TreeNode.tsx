import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';

type Props = { role: Experience; mounted: boolean; expanded: boolean; newest: boolean };

export function TreeNode({ role, mounted, expanded, newest }: Props) {
  const showChildren = mounted && expanded && role.highlights.length > 0;
  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className="relative pl-10">
      <span
        aria-hidden
        className={`absolute top-[22px] left-0 h-px w-8 origin-left transition-transform duration-500 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <article
        className={`rounded-xl border bg-card px-5 py-2 transition-colors duration-500 lg:py-3 ${newest ? 'border-primary' : mounted ? 'border-border' : 'border-border/40'} ${mounted ? '' : 'bg-card/40'}`}
      >
        <h3 className="font-mono text-[13px] leading-relaxed font-normal md:text-[15px]">
          <span className="tok-tag">&lt;{role.component}</span> <span className="tok-prop">role</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{role.role}&quot;</span>{' '}
          <span className="tok-prop">at</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{role.company}&quot;</span>
          <span className="tok-tag">{showChildren ? '>' : ' />'}</span>
        </h3>
        <p className="font-mono text-xs text-muted">{formatRange(role.start, role.end)}</p>
        {showChildren && (
          <>
            <ul className="mount-in mt-1.5 mb-1 ml-6 flex flex-col gap-1 text-[15px] leading-snug md:text-base lg:mt-3 lg:mb-2 lg:gap-2 lg:leading-normal">
              {role.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span aria-hidden className="font-mono text-success">
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <p aria-hidden className="font-mono text-[13px] md:text-[15px]">
              <span className="tok-tag">&lt;/{role.component}&gt;</span>
            </p>
          </>
        )}
      </article>
    </li>
  );
}
