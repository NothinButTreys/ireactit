import { Suspense, useState } from 'react';
import { projects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useBump } from '@/features/render-counter/RenderCounter';
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { InspectorPanel } from './lazyInspector';
import { ProjectCard } from './ProjectCard';

type Open = { project: Project; opener: HTMLElement };

export function Projects() {
  const [open, setOpen] = useState<Open | null>(null);
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
                bump();
              }}
            />
          </Reveal>
        ))}
      </div>
      <Suspense fallback={null}>
        {open && <InspectorPanel project={open.project} opener={open.opener} onClose={() => setOpen(null)} />}
      </Suspense>
    </div>
  );
}
