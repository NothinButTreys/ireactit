import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { PROJECT_NODE_KEYS, type Project } from '@/content/types';
import { INSPECTOR_KEYS, nodeLabel, type InspectorKey } from './inspectorKeys';
import { treeKey, type TreeState } from './treeNav';

type Props = { project: Project; selected: InspectorKey; onSelect: (key: InspectorKey) => void };

// Focus-visible ring belongs on the focusable element itself (the `li[role=treeitem]`), never
// on a purely visual inner wrapper the browser never actually focuses. Child treeitems are leaf
// rows, so the ring can live on the treeitem directly.
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-primary';

// The root treeitem is the ARIA tree's expanded container — it wraps the `ul[role=group]` of
// children, so a ring drawn on the root li itself would wrap the whole subtree whenever the root
// (the inspector's initial focus target) is focused. Instead the root li stays outline-none and
// names a group (`group/root`); its label row draws the ring, scoped to `group-focus-visible`
// so it only lights up on the *group element's own* :focus-visible, not a focused descendant.
const rootFocusRing = 'group/root outline-none';
const rootLabelRing = 'group-focus-visible/root:ring-2 group-focus-visible/root:ring-primary';

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
      {/* WAI-ARIA tree pattern: keyboard activation (Enter/Space) is handled by the delegated
          `onKeyDown` on the ancestor ul[role=tree] above, per the roving-tabindex tree pattern;
          this treeitem only needs the pointer handler. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events -- see comment above */}
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
        className={rootFocusRing}
      >
        <span className={`${itemVisual(selected === 'root')} ${rootLabelRing} pl-3`}>
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
              // WAI-ARIA tree pattern: keyboard activation (Enter/Space) is handled by the
              // delegated `onKeyDown` on the ancestor ul[role=tree], per the roving-tabindex
              // tree pattern; this treeitem only needs the pointer handler.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- see comment above
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
