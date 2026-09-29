import { useRef } from 'react';
import { experience } from '@/content/experience';
import { useHydrated } from '@/lib/useHydrated';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { SECTION_HEADERS } from '@/content/sections';
import { SectionHeader } from '@/ui/SectionHeader';
import { careerYears } from './careerProgress';
import { EarlyCareerNode } from './EarlyCareerNode';
import { TreeNode } from './TreeNode';
import { useCareerProgress } from './useCareerProgress';

const recent = experience.filter((role) => role.era === 'recent');
const early = experience.filter((role) => role.era === 'early');
const TOTAL = recent.length + 1;

export function CareerTree() {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const scrollDriven = hydrated && !reduced;
  const mounted = useCareerProgress(ref, TOTAL, scrollDriven);
  const years = careerYears(experience, __BUILD_YEAR__);

  return (
    <div ref={ref} className="career-pin">
      <div className="career-sticky grid gap-12 py-24 lg:grid-cols-[4fr_8fr] lg:gap-16">
        <div className="flex flex-col justify-between gap-8">
          <SectionHeader step="tree" title={SECTION_HEADERS.tree.title.replace('{years}', String(years))} />
          <div aria-hidden className="hidden flex-col gap-2.5 font-mono text-xs text-muted lg:flex">
            <span>
              {scrollDriven ? 'pinned · ' : ''}mounted {mounted} / {TOTAL}
            </span>
            <div className="h-1 rounded-full bg-border">
              <div
                className="h-1 origin-left rounded-full bg-primary transition-transform duration-500"
                style={{ transform: `scaleX(${mounted / TOTAL})` }}
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3.5">
          <p className="font-mono text-[13px] md:text-[15px]">
            <span className="tok-tag">&lt;Career</span> <span className="tok-prop">years</span>
            <span className="tok-punct">={'{'}</span>
            <span className="tok-num">{years}</span>
            <span className="tok-punct">{'}'}</span>
            <span className="tok-tag">&gt;</span>
          </p>
          <ol className="ml-3 flex flex-col gap-3.5 border-l border-primary">
            {recent.map((role, i) => (
              <TreeNode
                key={role.component}
                role={role}
                mounted={i < mounted}
                expanded={!scrollDriven || i === mounted - 1}
                newest={scrollDriven && i === mounted - 1}
              />
            ))}
            <EarlyCareerNode roles={early} mounted={mounted === TOTAL} />
          </ol>
          <p className="font-mono text-[13px] md:text-[15px]">
            <span className="tok-tag">&lt;/Career&gt;</span>
          </p>
        </div>
      </div>
    </div>
  );
}
