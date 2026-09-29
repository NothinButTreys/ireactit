import type { SectionId } from '@/content/sections';

type Props = { id: SectionId; labelledBy?: string; className?: string; children: React.ReactNode };

export function Section({ id, labelledBy, className = '', children }: Props) {
  return (
    <section id={id} aria-labelledby={labelledBy ?? `${id}-title`} className={`scroll-mt-14 ${className}`}>
      {children}
    </section>
  );
}
