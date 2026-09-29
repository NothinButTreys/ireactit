import type { Project } from '@/content/types';
import { SCHEMATIC_BLOCKS } from './schematic';

export function ProjectShot({ project }: { project: Project }) {
  const { src, alt } = project.screenshot;
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className="dots relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-dashed border-border bg-bg"
    >
      {SCHEMATIC_BLOCKS.map((b, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded bg-card"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
        />
      ))}
      <span aria-hidden className="absolute right-3 bottom-3 font-mono text-[11px] text-muted">
        [screenshot · {project.title}]
      </span>
    </div>
  );
}
