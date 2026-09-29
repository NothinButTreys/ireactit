import { Suspense, useState } from 'react';
import { projects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useBump } from '@/features/render-counter/RenderCounter';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { InspectorPanel } from './lazyInspector';
import { ProjectCard } from './ProjectCard';

type Open = { project: Project; opener: HTMLElement };

const InspectorError = () => (
  <p role="alert" className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-danger/40 bg-card px-4 py-3 text-sm text-danger shadow-lg">
    Couldn&apos;t load the inspector — try again.
  </p>
);

export function Projects() {
  const [open, setOpen] = useState<Open | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const bump = useBump();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeader step="props" />
        <p aria-hidden className="font-mono text-xs text-muted">
          {projects.length} components · ⌘ Inspect
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 80}>
            <ProjectCard
              project={project}
              onInspect={(opener) => {
                setOpen({ project, opener });
                setOpenCount((n) => n + 1);
                bump();
              }}
            />
          </Reveal>
        ))}
      </div>
      {/* Keyed by the open counter so a failed chunk load doesn't leave the boundary tripped forever —
          the next "Inspect" click remounts a fresh boundary and gets a fresh chance to load the chunk. */}
      <ErrorBoundary key={openCount} fallback={<InspectorError />}>
        <Suspense fallback={null}>
          {open && <InspectorPanel project={open.project} opener={open.opener} onClose={() => setOpen(null)} />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
