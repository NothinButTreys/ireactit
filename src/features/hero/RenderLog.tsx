import { SECTION_COMPONENTS, SECTION_IDS } from '@/content/sections';
import { useSectionProgress } from '@/features/nav/SectionProgress';

export function RenderLog() {
  const { visited } = useSectionProgress();
  const committed = SECTION_IDS.filter((id) => visited.has(id)).length;

  return (
    <aside aria-label="Render log" className="rounded-2xl border border-border bg-card px-7 py-6">
      <div className="flex justify-between pb-3.5 font-mono text-xs text-muted">
        <span>render log</span>
        <span>
          {committed} / {SECTION_IDS.length} committed
        </span>
      </div>
      <ol className="font-mono text-[13px]">
        {SECTION_IDS.map((id) => {
          const done = visited.has(id);
          return (
            <li key={id} className="flex items-center gap-3.5 border-t border-border py-3">
              <span
                aria-hidden
                className={`size-2.5 shrink-0 rounded-full transition-colors duration-500 ${done ? 'bg-success' : 'border-[1.5px] border-muted'}`}
              />
              <span className={`w-16 ${done ? 'text-fg' : 'text-muted'}`}>{id}</span>
              <span className={`flex-1 ${done ? 'text-primary' : 'text-muted'}`}>&lt;{SECTION_COMPONENTS[id]} /&gt;</span>
              <span className={done ? 'text-success' : 'text-muted'}>{done ? '✓ rendered' : 'pending'}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
