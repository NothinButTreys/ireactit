import { lazy, Suspense, useState, type ReactNode } from 'react';
import type { SectionId } from '@/content/sections';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { Section } from '@/ui/Section';
import { useViewSource } from './ViewSource';

const SourcePanel = lazy(() => import('./SourcePanel').then((m) => ({ default: m.SourcePanel })));

type Props = { id: SectionId; className?: string; children: ReactNode };

/** A section that can flip to its own source. Content stays mounted (hidden) so its state survives. */
export function SectionView({ id, className, children }: Props) {
  const { enabled } = useViewSource();
  const [toggled, setToggled] = useState(false);
  if (enabled && !toggled) setToggled(true);

  return (
    <Section id={id} className={className}>
      <div hidden={enabled} className={toggled ? 'mount-in w-full' : 'w-full'}>
        {children}
      </div>
      {enabled && (
        <ErrorBoundary fallback={<p className="w-full py-6 font-mono text-xs text-muted">source unavailable — toggle off to render ↺</p>}>
          <Suspense fallback={<p className="w-full py-6 font-mono text-xs text-muted">loading source…</p>}>
            <SourcePanel id={id} />
          </Suspense>
        </ErrorBoundary>
      )}
    </Section>
  );
}
