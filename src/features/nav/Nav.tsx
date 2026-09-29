import { SECTION_IDS, type SectionId } from '@/content/sections';
import { profile } from '@/content/profile';
import { RenderCounterBadge } from '@/features/render-counter/RenderCounter';
import { ViewSourceToggle } from '@/features/view-source/ViewSource';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { useSectionProgress } from './SectionProgress';

type Variant = 'bar' | 'pill';

function RailLinks({ active, variant }: { active: SectionId; variant: Variant }) {
  const bar = variant === 'bar';
  return (
    <ol className={bar ? 'flex items-center gap-1 font-mono text-xs' : 'flex items-center gap-0.5 font-mono text-[11px]'}>
      {SECTION_IDS.map((id, i) => (
        <li key={id} className={bar ? 'flex items-center gap-1' : 'flex-1'}>
          {bar && i > 0 && (
            <span aria-hidden className="text-border">
              ·
            </span>
          )}
          <a
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
            className={
              bar
                ? 'rounded-md px-2.5 py-1.5 text-muted transition-colors hover:text-fg aria-[current=location]:bg-primary/10 aria-[current=location]:text-primary'
                : 'flex h-11 items-center justify-center rounded-full text-muted transition-colors aria-[current=location]:bg-primary/15 aria-[current=location]:text-primary'
            }
          >
            {id}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function Nav() {
  const { active } = useSectionProgress();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[78rem] items-center justify-between gap-4 px-4 md:px-8">
          <a href="#mount" className="inline-flex min-h-11 items-center font-mono text-sm font-bold text-fg hover:text-primary md:min-h-0">
            {profile.wordmark}
          </a>
          <nav aria-label="Render cycle" className="hidden md:block">
            <RailLinks active={active} variant="bar" />
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <RenderCounterBadge />
            <ViewSourceToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <nav
        aria-label="Render cycle"
        className="fixed inset-x-3 bottom-4 z-50 rounded-full border border-border bg-card/90 p-1 backdrop-blur-md md:hidden"
      >
        <RailLinks active={active} variant="pill" />
      </nav>
    </>
  );
}
