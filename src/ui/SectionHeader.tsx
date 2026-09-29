import type { SectionId } from '@/content/sections';
import { Reveal } from './Reveal';

type Props = { num: string; step: SectionId; title: string; sub?: string };

export function SectionHeader({ num, step, title, sub }: Props) {
  return (
    <Reveal className="flex flex-col gap-3">
      <p className="flex items-center gap-3 font-mono text-[13px] tracking-[0.08em] text-primary">
        <span>{num}</span>
        <span aria-hidden className="h-px w-8 bg-primary" />
        <span>{step}</span>
      </p>
      <h2 id={`${step}-title`} className="text-4xl leading-[1.05] font-bold tracking-[-0.03em] md:text-[56px]">
        {title}
      </h2>
      {sub && <p className="max-w-[640px] text-[19px] text-muted">{sub}</p>}
    </Reveal>
  );
}
