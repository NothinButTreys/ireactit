import snippets from 'virtual:source-snippets';
import type { SectionId } from '@/content/sections';

const NUMBER: Record<SectionId, string> = { mount: '01', write: '02', tree: '03', props: '04', commit: '05' };

export function SourcePanel({ id }: { id: SectionId }) {
  const snippet = snippets[id];
  return (
    <div className="mount-in flex w-full flex-col gap-5 py-6">
      <h2 className="sr-only">{id} source</h2>
      <p className="flex flex-wrap justify-between gap-2 font-mono text-[13px]">
        <span className="text-primary">
          {NUMBER[id]} — {id} · view source
        </span>
        <span className="text-muted">toggle off to render ↺</span>
      </p>
      <figure className="overflow-hidden rounded-2xl border border-border bg-card">
        <figcaption className="flex h-11 items-center justify-between gap-4 border-b border-border px-5 font-mono text-xs text-muted">
          <span>{snippet.filename}</span>
          <span className="hidden sm:inline">TypeScript React · {snippet.lines} lines</span>
        </figcaption>
        {/* Build-time HTML from our own snippet files (vite-plugins/sourceSnippets.ts), not user input. */}
        <div
          className="source-code overflow-x-auto px-6 py-7 font-mono text-[13px] leading-7 md:text-[15px]"
          dangerouslySetInnerHTML={{ __html: snippet.html }}
        />
      </figure>
    </div>
  );
}
