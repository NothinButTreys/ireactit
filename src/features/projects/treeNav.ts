/** Focus model for a one-level tree: index 0 is the root, 1..childCount are its children. */
export type TreeState = { expanded: boolean; focus: number };

export function treeKey(state: TreeState, key: string, childCount: number): TreeState {
  const last = state.expanded ? childCount : 0;
  switch (key) {
    case 'ArrowDown':
      return { ...state, focus: Math.min(last, state.focus + 1) };
    case 'ArrowUp':
      return { ...state, focus: Math.max(0, state.focus - 1) };
    case 'Home':
      return { ...state, focus: 0 };
    case 'End':
      return { ...state, focus: last };
    case 'ArrowRight':
      if (state.focus !== 0) return state;
      return state.expanded ? { ...state, focus: 1 } : { ...state, expanded: true };
    case 'ArrowLeft':
      return state.focus === 0 ? { ...state, expanded: false } : { ...state, focus: 0 };
    default:
      return state;
  }
}
