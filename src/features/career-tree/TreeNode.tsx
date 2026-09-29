import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';
import { Highlights } from './Highlights';

type Props = { role: Experience; mounted: boolean; newest: boolean };

/**
 * One role as a JSX tag. Its markup never depends on progress or mode (only colours and the connector's scaleX
 * do; the `pinned:` variant compacts it), so mounting nodes or pinning can't shift layout. The body (company +
 * highlights) is always in the DOM: inline when static, visually hidden when pinned (the detail pane shows it).
 */
export function TreeNode({ role, mounted, newest }: Props) {
  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className="relative pl-10 pinned:pl-8">
      <span
        aria-hidden
        className={`absolute top-[21px] left-0 h-px w-8 origin-left transition-transform duration-500 pinned:top-4 pinned:w-6 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <article
        className={`rounded-xl border px-5 py-2 transition-colors duration-500 pinned:py-1.5 ${newest ? 'border-primary bg-card' : mounted ? 'border-border bg-card' : 'border-border/40 bg-card/40'}`}
      >
        <h3 className="flex flex-wrap items-baseline justify-between gap-x-4 font-mono text-[13px] leading-relaxed font-normal md:text-[15px] pinned:text-[13px] pinned:leading-snug">
          <span>
            <span className="tok-tag">&lt;{role.component}</span> <span className="tok-prop">role</span>
            <span className="tok-punct">=</span>
            <span className="tok-str">&quot;{role.role}&quot;</span>
            <span className="tok-tag">
              <span className="pinned:hidden">&gt;</span>
              <span className="hidden pinned:inline"> /&gt;</span>
            </span>
          </span>
          <span className="text-xs text-muted">{formatRange(role.start, role.end)}</span>
        </h3>
        <div className="mt-1 mb-1 ml-6 flex flex-col gap-1.5 lg:mb-2 pinned:sr-only">
          <p className="text-sm text-muted">{role.company}</p>
          <Highlights role={role} />
          <p aria-hidden className="-ml-6 font-mono text-[13px] md:text-[15px]">
            <span className="tok-tag">&lt;/{role.component}&gt;</span>
          </p>
        </div>
      </article>
    </li>
  );
}
