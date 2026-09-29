import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';
import { Highlights } from './Highlights';

type Props = { active: boolean; role: Experience | undefined; early: readonly Experience[] };

/**
 * Shown only by the `pinned:` variant: a fixed-size pane showing the newest mounted node's children. It duplicates copy that is
 * already in each node (visually hidden), so it's hidden from assistive tech and find-in-page (aria-hidden + inert).
 * Content swaps with a transform/opacity/blur mount-in; the pane itself never resizes. Empty unless pinned (JS),
 * so static and prerendered HTML carry no duplicate copy; filling it on hydration can't shift layout.
 */
export function DetailPane({ active, role, early }: Props) {
  return (
    <div
      data-career-detail=""
      aria-hidden
      inert
      className="hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-primary/60 bg-card px-5 py-4 pinned:block"
    >
      {!active ? null : role ? (
        <div key={role.component} className="mount-in flex flex-col gap-2">
          <p className="font-mono text-[13px]">
            <span className="tok-tag">&lt;{role.component}&gt;</span>
          </p>
          <p className="ml-6 text-xs text-muted">
            {role.company} · {role.role}
          </p>
          <Highlights role={role} compact className="ml-6" />
          <p className="font-mono text-[13px]">
            <span className="tok-tag">&lt;/{role.component}&gt;</span>
          </p>
        </div>
      ) : (
        <div key="early" className="mount-in flex flex-col gap-2">
          <p className="font-mono text-[13px]">
            <span className="tok-tag">&lt;EarlyCareer&gt;</span>
          </p>
          <ul className="ml-6 flex flex-col gap-1 text-sm">
            {early.map((r) => (
              <li key={r.component} className="flex flex-wrap justify-between gap-x-4">
                <span>{r.company}</span>
                <span className="font-mono text-xs text-muted">{formatRange(r.start, r.end)}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[13px]">
            <span className="tok-tag">&lt;/EarlyCareer&gt;</span>
          </p>
        </div>
      )}
    </div>
  );
}
