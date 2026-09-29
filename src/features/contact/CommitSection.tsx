import { profile } from '@/content/profile';
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { CommitTerminal } from './CommitTerminal';

const LINKS = [
  { label: 'GitHub', href: profile.links.github },
  { label: 'LinkedIn', href: profile.links.linkedin },
  { label: 'Resume', href: profile.links.resume },
  { label: 'PixelTable', href: profile.links.pixeltable },
];

export function CommitSection() {
  return (
    <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
      <div className="flex flex-col gap-8">
        <SectionHeader step="commit" />
        <ul className="flex flex-wrap gap-2.5">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center rounded-[10px] border border-border px-4 font-mono text-[13px] text-fg transition-colors hover:border-primary hover:text-primary"
              >
                {label} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Reveal delay={120}>
        <CommitTerminal />
      </Reveal>
    </div>
  );
}
