import type { Highlight } from '@/content/types';

/** DevTools-style box over the screenshot/schematic for the selected node. */
export function HighlightOverlay({ highlight, label }: { highlight?: Highlight; label: string }) {
  if (!highlight) return null;
  return (
    <div
      aria-hidden
      className="mount-in pointer-events-none absolute rounded-sm border-2 border-primary bg-primary/10"
      style={{ left: `${highlight.x}%`, top: `${highlight.y}%`, width: `${highlight.w}%`, height: `${highlight.h}%` }}
    >
      <span
        data-highlight-label=""
        className="absolute -top-7 left-0 rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-bg"
      >
        {label}
      </span>
    </div>
  );
}
