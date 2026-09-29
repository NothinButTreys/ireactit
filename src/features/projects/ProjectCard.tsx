import { PROJECT_NODE_KEYS, type Project } from '@/content/types';
import { nodeLabel } from './inspectorKeys';
import { preloadInspector } from './lazyInspector';
import { ProjectShot } from './ProjectShot';

type Props = { project: Project; onInspect: (opener: HTMLElement) => void };

export function ProjectCard({ project, onInspect }: Props) {
  const [primary] = project.links;
  return (
    <article aria-labelledby={`${project.slug}-title`} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <ProjectShot project={project} />
      <div className="flex flex-col gap-1.5 px-1">
        <p className="font-mono text-xs text-primary">&lt;{project.name} /&gt;</p>
        <h3 id={`${project.slug}-title`} className="text-2xl font-semibold tracking-[-0.02em]">
          {project.title}
        </h3>
        <p className="text-muted">
          {project.tagline}
          {project.team && <> · {project.team}</>}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-1">
        <ul aria-label="Stack" className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted">
              {tech}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          {primary && (
            <a
              href={primary.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:text-fg md:h-10"
            >
              Visit ↗ <span className="sr-only">{project.title} (opens in a new tab)</span>
            </a>
          )}
          <button
            type="button"
            aria-haspopup="dialog"
            onPointerEnter={preloadInspector}
            onFocus={preloadInspector}
            onClick={(e) => onInspect(e.currentTarget)}
            className="h-11 rounded-lg border border-primary bg-primary/10 px-3.5 font-mono text-[13px] text-primary transition-colors hover:bg-primary/20 md:h-10"
          >
            ⌘ Inspect <span className="sr-only">{project.title}</span>
          </button>
        </div>
      </div>
      <noscript>
        <details open className="px-1">
          <summary className="font-mono text-xs text-muted">Case study</summary>
          {PROJECT_NODE_KEYS.map((key) => (
            <section key={key} className="mt-3">
              <h4 className="font-mono text-xs text-primary">&lt;{nodeLabel(key)} /&gt;</h4>
              <p>{project.nodes[key].body}</p>
            </section>
          ))}
        </details>
      </noscript>
    </article>
  );
}
