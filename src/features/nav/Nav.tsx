import { SECTION_IDS } from '@/content/sections';
import { profile } from '@/content/profile';
import { RenderCounterBadge } from '@/features/render-counter/RenderCounter';
import { ViewSourceToggle } from '@/features/view-source/ViewSource';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { useActiveSection } from './useActiveSection';

export function Nav() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#mount" className="font-mono text-sm font-semibold text-fg hover:text-primary">
          {profile.wordmark}
        </a>
        <nav aria-label="Render cycle" className="hidden md:block">
          <ol className="flex items-center gap-1 font-mono text-xs">
            {SECTION_IDS.map((id, i) => (
              <li key={id} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden className="text-border">·</span>}
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className="rounded px-2 py-1 text-muted transition-colors hover:text-fg aria-[current=location]:text-primary"
                >
                  {id}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex items-center gap-4">
          <RenderCounterBadge />
          <ViewSourceToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
