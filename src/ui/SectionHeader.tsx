import type { SectionId } from '@/content/sections';
import { SECTION_HEADERS } from '@/content/sections';
import { Reveal } from './Reveal';

type Props = { step: Exclude<SectionId, 'mount'>; title?: string };

export function SectionHeader({ step, title }: Props) {
  const { num, title: contentTitle, sub } = SECTION_HEADERS[step];
  return (
    <Reveal className="flex flex-col gap-3">
      <p className="flex items-center gap-3 font-mono text-[13px] tracking-[0.08em] text-primary">
        <span>{num}</span>
        <span aria-hidden className="h-px w-8 bg-primary" />
        <span>{step}</span>
      </p>
      <h2 id={`${step}-title`} className="text-4xl leading-[1.05] font-bold tracking-[-0.03em] md:text-[56px]">
        {title ?? contentTitle}
      </h2>
      {sub && <p className="max-w-[640px] text-[19px] text-muted">{sub}</p>}
    </Reveal>
  );
}
