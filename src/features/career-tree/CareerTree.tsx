import { useRef, useState } from 'react';
import { experience } from '@/content/experience';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { SECTION_HEADERS } from '@/content/sections';
import { SectionHeader } from '@/ui/SectionHeader';
import { careerYears } from './careerProgress';
import { DetailPane } from './DetailPane';
import { EarlyCareerNode } from './EarlyCareerNode';
import { TreeNode } from './TreeNode';
import { useCareerProgress } from './useCareerProgress';
import { usePinnable } from './usePinnable';

const recent = experience.filter((role) => role.era === 'recent');
const early = experience.filter((role) => role.era === 'early');
const TOTAL = recent.length + 1;

const tagLine = 'font-mono text-[13px] md:text-[15px]';

/**
 * The career as a component tree. Pinned and scroll-driven only where the stage fits (html.js, lg and tall,
 * motion allowed); everywhere else — and in the prerendered HTML — every node is mounted with its highlights
 * inline. The markup is the same in both modes: the `pinned:` CSS variant switches the layout, so prerender,
 * hydration and resizing never swap subtrees. JS only drives which nodes are mounted/newest and the pane copy.
 */
export function CareerTree() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const pinned = usePinnable() && !reduced;
  const mounted = useCareerProgress(ref, TOTAL, pinned);
  const [earlyOpen, setEarlyOpen] = useState(false);
  const years = careerYears(experience, __BUILD_YEAR__);

  return (
    <div className="py-24">
      <div ref={ref} className="career-pin" data-pinned={pinned ? '' : undefined}>
        <div className="career-sticky grid gap-3 lg:grid-cols-[4fr_8fr] lg:gap-x-16 lg:gap-y-8 pinned:grid-cols-[7fr_5fr] pinned:grid-rows-[auto_minmax(0,1fr)] pinned:gap-x-10 pinned:gap-y-4 pinned:py-4">
          <div className="lg:col-[1] lg:row-[1] pinned:col-[1/-1]">
            <SectionHeader step="tree" title={SECTION_HEADERS.tree.title.replace('{years}', String(years))} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:col-[2] lg:row-[1/span_2] pinned:col-[1] pinned:row-[2] pinned:gap-2">
            <p className={tagLine}>
              <span className="tok-tag">&lt;Career</span> <span className="tok-prop">years</span>
              <span className="tok-punct">={'{'}</span>
              <span className="tok-num">{years}</span>
              <span className="tok-punct">{'}'}</span>
              <span className="tok-tag">&gt;</span>
            </p>
            <ol
              // Opening <EarlyCareer> can overflow the pinned list; only then should wheel scroll it natively.
              data-lenis-prevent={pinned && earlyOpen ? '' : undefined}
              className="ml-3 flex flex-col gap-1 border-l border-primary lg:gap-3.5 pinned:min-h-0 pinned:gap-1.5 pinned:overflow-y-auto pinned:pr-2"
            >
              {recent.map((role, i) => (
                <TreeNode key={role.component} role={role} mounted={i < mounted} newest={pinned && i === mounted - 1} />
              ))}
              <EarlyCareerNode roles={early} mounted={mounted === TOTAL} onOpenChange={setEarlyOpen} />
            </ol>
            <p className={tagLine}>
              <span className="tok-tag">&lt;/Career&gt;</span>
            </p>
          </div>
          <div className="hidden min-h-0 flex-col gap-4 lg:col-[1] lg:row-[2] lg:flex lg:self-end pinned:col-[2] pinned:row-[2] pinned:self-stretch">
            <div aria-hidden className="flex flex-col gap-2.5 font-mono text-xs text-muted">
              <span>
                {pinned ? 'mounting' : 'mounted'} {mounted} / {TOTAL}
              </span>
              <div className="h-1 rounded-full bg-border">
                <div
                  className="h-1 origin-left rounded-full bg-primary transition-transform duration-500"
                  style={{ transform: `scaleX(${mounted / TOTAL})` }}
                />
              </div>
            </div>
            <DetailPane active={pinned} role={recent[mounted - 1]} early={early} />
          </div>
        </div>
      </div>
    </div>
  );
}
