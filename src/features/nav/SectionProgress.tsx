import { createContext, use, useMemo, useState } from 'react';
import { SECTION_IDS, type SectionId } from '@/content/sections';
import { useActiveSection } from './useActiveSection';

type SectionProgress = { active: SectionId; visited: ReadonlySet<SectionId> };

const SectionProgressContext = createContext<SectionProgress | null>(null);

export function SectionProgressProvider({ children }: { children: React.ReactNode }) {
  const active = useActiveSection(SECTION_IDS) as SectionId;
  const [visited, setVisited] = useState<ReadonlySet<SectionId>>(() => new Set([active]));
  // Adjust state during render when a new section becomes active (React's documented pattern).
  if (!visited.has(active)) setVisited(new Set(visited).add(active));
  const value = useMemo(() => ({ active, visited }), [active, visited]);
  return <SectionProgressContext value={value}>{children}</SectionProgressContext>;
}

export function useSectionProgress(): SectionProgress {
  const value = use(SectionProgressContext);
  if (!value) throw new Error('useSectionProgress must be used inside <SectionProgressProvider>');
  return value;
}
