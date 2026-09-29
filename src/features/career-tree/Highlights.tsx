import type { Experience } from '@/content/types';

/** A role's highlights as ✓ children. Shared by the inline node body and the pinned detail pane. */
type Props = { role: Experience; compact?: boolean; className?: string };

export function Highlights({ role, compact = false, className = '' }: Props) {
  const size = compact ? 'gap-1.5 text-sm leading-snug' : 'gap-1 text-[15px] leading-snug md:text-base lg:gap-2 lg:leading-normal';
  return (
    <ul className={`flex flex-col ${size} ${className}`}>
      {role.highlights.map((highlight) => (
        <li key={highlight} className="flex gap-3">
          <span aria-hidden className="font-mono text-success">
            ✓
          </span>
          <span>{highlight}</span>
        </li>
      ))}
    </ul>
  );
}
