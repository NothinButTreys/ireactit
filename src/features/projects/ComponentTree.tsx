import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { PROJECT_NODE_KEYS, type Project } from '@/content/types';
import { INSPECTOR_KEYS, nodeLabel, type InspectorKey } from './inspectorKeys';
import { treeKey, type TreeState } from './treeNav';

type Props = { project: Project; selected: InspectorKey; onSelect: (key: InspectorKey) => void };

// Focus-visible ring belongs on the focusable element itself (the `li[role=treeitem]`), never
// on a purely visual inner wrapper the browser never actually focuses.
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md';

const itemVisual = (selected: boolean) =>
  `flex h-11 md:h-8 cursor-pointer items-center rounded-md font-mono text-[13px] ${
    selected ? 'bg-primary/15 text-fg' : 'text-muted hover:text-fg'
  }`;

export function ComponentTree({ project, selected, onSelect }: Props) {
  const [state, setState] = useState<TreeState>({ expanded: true, focus: INSPECTOR_KEYS.indexOf(selected) });
  const items = useRef<(HTMLElement | null)[]>([]);
  const userMoved = useRef(false);
  const rootLabelId = useId();

  // Selection changed from outside (e.g. PropsPane's ←/→ buttons): move the roving tabIndex to
  // match during render (React's "adjust state when a prop changes" pattern), without stealing
  // DOM focus — the focus-moving effect below only runs off `userMoved`, which this doesn't set.
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    const index = INSPECTOR_KEYS.indexOf(selected);
    if (index !== state.focus) setState((s) => ({ ...s, focus: index }));
  }

  useEffect(() => {
    if (userMoved.current) items.current[state.focus]?.focus();
  }, [state.focus, state.expanded]);

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const key = INSPECTOR_KEYS[state.focus];
      if (key) onSelect(key);
      return;
    }
    const next = treeKey(state, e.key, PROJECT_NODE_KEYS.length);
    if (next === state) return;
    e.preventDefault();
    userMoved.current = true;
    setState(next);
  }

  function choose(index: number) {
    const key = INSPECTOR_KEYS[index];
    if (!key) return;
    userMoved.current = true;
    setState((s) => ({ ...s, focus: index }));
    onSelect(key);
  }

  return (
    <ul role="tree" aria-label={`${project.title} case study`} onKeyDown={onKeyDown} className="flex flex-col gap-0.5">
      <li
        role="treeitem"
        aria-level={1}
        aria-expanded={state.expanded}
        aria-selected={selected === 'root'}
        aria-labelledby={rootLabelId}
        tabIndex={state.focus === 0 ? 0 : -1}
        ref={(el) => {
          items.current[0] = el;
        }}
        onClick={() => choose(0)}
        className={focusRing}
      >
        <span className={`${itemVisual(selected === 'root')} pl-3`}>
          <span aria-hidden className="mr-1.5 text-muted">
            {state.expanded ? '▾' : '▸'}
          </span>
          <span id={rootLabelId} className="tok-tag">
            &lt;{project.name}&gt;
          </span>
        </span>
        {state.expanded && (
          <ul role="group" className="mt-0.5 flex flex-col gap-0.5">
            {PROJECT_NODE_KEYS.map((key, i) => (
              <li
                key={key}
                role="treeitem"
                aria-level={2}
                aria-selected={selected === key}
                tabIndex={state.focus === i + 1 ? 0 : -1}
                ref={(el) => {
                  items.current[i + 1] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  choose(i + 1);
                }}
                className={`${focusRing} ${itemVisual(selected === key)} pl-8`}
              >
                <span className="tok-tag">&lt;{nodeLabel(key)} /&gt;</span>
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
}
