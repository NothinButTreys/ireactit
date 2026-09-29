import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';
import { Highlights } from './Highlights';

type Props = { role: Experience; mounted: boolean; newest: boolean; pinned: boolean };

/**
 * One role as a JSX tag. Its markup never depends on progress (only colours and the connector's scaleX do),
 * so mounting nodes on scroll can't shift layout. The body (company + highlights) is always in the DOM:
 * inline when static, visually hidden when pinned (the detail pane shows the newest node's copy).
 */
export function TreeNode({ role, mounted, newest, pinned }: Props) {
  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className={`relative ${pinned ? 'pl-8' : 'pl-10'}`}>
      <span
        aria-hidden
        className={`absolute ${pinned ? 'top-4 w-6' : 'top-[21px] w-8'} left-0 h-px origin-left transition-transform duration-500 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <article
        className={`rounded-xl border px-5 transition-colors ${pinned ? 'py-1.5' : 'py-2'} duration-500 ${newest ? 'border-primary bg-card' : mounted ? 'border-border bg-card' : 'border-border/40 bg-card/40'}`}
      >
        <h3
          className={`flex flex-wrap items-baseline justify-between gap-x-4 font-mono text-[13px] font-normal ${pinned ? 'leading-snug' : 'leading-relaxed md:text-[15px]'}`}
        >
          <span>
            <span className="tok-tag">&lt;{role.component}</span> <span className="tok-prop">role</span>
            <span className="tok-punct">=</span>
            <span className="tok-str">&quot;{role.role}&quot;</span>
            <span className="tok-tag">{pinned ? ' />' : '>'}</span>
          </span>
          <span className="text-xs text-muted">{formatRange(role.start, role.end)}</span>
        </h3>
        <div className={pinned ? 'sr-only' : 'mt-1 mb-1 ml-6 flex flex-col gap-1.5 lg:mb-2'}>
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
