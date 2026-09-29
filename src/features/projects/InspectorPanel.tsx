import { useEffect, useId, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { ComponentTree } from './ComponentTree';
import { HighlightOverlay } from './HighlightOverlay';
import { nodeLabel, type InspectorKey } from './inspectorKeys';
import { ProjectShot } from './ProjectShot';
import { PropsPane } from './PropsPane';
import { SCHEMATIC_HIGHLIGHTS } from './schematic';

type Props = { project: Project; opener: HTMLElement | null; onClose: () => void };

export function InspectorPanel({ project, opener, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<InspectorKey>('root');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus();
    document.documentElement.dataset.inspectorOpen = '';
    return () => {
      delete document.documentElement.dataset.inspectorOpen;
      if (dialog.open) dialog.close();
      opener?.focus();
    };
  }, [opener]);

  const highlight =
    selected === 'root'
      ? undefined
      : (project.nodes[selected].highlight ?? (project.screenshot.src ? undefined : SCHEMATIC_HIGHLIGHTS[selected]));

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // StrictMode re-runs effects (close → reopen); only report a close that stuck.
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      className="inspector"
    >
      <div className="inspector-sheet flex h-full flex-col">
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border pr-4 pl-5">
          <div className="flex items-center gap-4 font-mono text-xs">
            <span aria-hidden className="text-primary">
              ⚛ Components
            </span>
            <h2 id={titleId} className="font-normal text-muted">
              inspecting <span className="tok-tag">&lt;{project.name}&gt;</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close inspector"
            onClick={() => ref.current?.close()}
            className="h-11 rounded-lg border border-border px-2.5 font-mono text-xs text-muted hover:text-fg md:h-9"
          >
            Esc ✕
          </button>
        </header>
        <div
          data-lenis-prevent=""
          className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)_minmax(0,460px)]"
        >
          <div className="flex flex-col gap-2.5 border-b border-border p-3 md:border-r md:border-b-0">
            <p className="pl-3 font-mono text-[11px] tracking-[0.08em] text-muted">COMPONENT TREE</p>
            <ComponentTree project={project} selected={selected} onSelect={setSelected} />
            <p className="mt-auto hidden pl-3 font-mono text-[11px] text-muted md:block">↑↓ move · → expand · Enter select</p>
          </div>
          <div className="border-b border-border p-6 pt-10 md:border-r md:border-b-0">
            <div className="relative">
              <ProjectShot project={project} />
              <HighlightOverlay key={selected} highlight={highlight} label={selected === 'root' ? project.name : nodeLabel(selected)} />
            </div>
          </div>
          <PropsPane project={project} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </dialog>
  );
}
