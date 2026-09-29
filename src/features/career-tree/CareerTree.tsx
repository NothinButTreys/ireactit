import { useRef } from 'react';
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
 * The career as a component tree. Pinned and scroll-driven only where the stage fits (lg and tall, motion
 * allowed); everywhere else — and in the prerendered HTML — every node is mounted with its highlights inline.
 * styles.css makes the same call with a media query, so the pin's geometry is right before hydration.
 */
export function CareerTree() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const pinned = usePinnable() && !reduced;
  const mounted = useCareerProgress(ref, TOTAL, pinned);
  const years = careerYears(experience, __BUILD_YEAR__);

  const header = <SectionHeader step="tree" title={SECTION_HEADERS.tree.title.replace('{years}', String(years))} />;
  const progress = (
    <div aria-hidden className="hidden flex-col gap-2.5 font-mono text-xs text-muted lg:flex">
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
  );
  const tree = (
    <div className={`flex min-h-0 min-w-0 flex-col ${pinned ? 'gap-2' : 'gap-3'}`}>
      <p className={tagLine}>
        <span className="tok-tag">&lt;Career</span> <span className="tok-prop">years</span>
        <span className="tok-punct">={'{'}</span>
        <span className="tok-num">{years}</span>
        <span className="tok-punct">{'}'}</span>
        <span className="tok-tag">&gt;</span>
      </p>
      <ol
        data-lenis-prevent={pinned ? '' : undefined}
        className={`ml-3 flex flex-col border-l border-primary ${pinned ? 'min-h-0 gap-1.5 overflow-y-auto pr-2' : 'gap-1 lg:gap-3.5'}`}
      >
        {recent.map((role, i) => (
          <TreeNode
            key={role.component}
            role={role}
            mounted={i < mounted}
            newest={pinned && i === mounted - 1}
            pinned={pinned}
          />
        ))}
        <EarlyCareerNode roles={early} mounted={mounted === TOTAL} pinned={pinned} />
      </ol>
      <p className={tagLine}>
        <span className="tok-tag">&lt;/Career&gt;</span>
      </p>
    </div>
  );

  return (
    <div className="py-24">
      <div ref={ref} className="career-pin" data-pinned={pinned ? '' : undefined}>
        {pinned ? (
          <div className="career-sticky grid grid-rows-[auto_minmax(0,1fr)] gap-4 py-4">
            {header}
            <div className="grid min-h-0 grid-cols-[7fr_5fr] gap-10">
              {tree}
              <div className="flex min-h-0 flex-col gap-4">
                {progress}
                <DetailPane role={recent[mounted - 1]} early={early} />
              </div>
            </div>
          </div>
        ) : (
          <div className="career-sticky grid gap-3 lg:grid-cols-[4fr_8fr] lg:gap-16">
            <div className="flex flex-col justify-between gap-8">
              {header}
              {progress}
            </div>
            {tree}
          </div>
        )}
      </div>
    </div>
  );
}
