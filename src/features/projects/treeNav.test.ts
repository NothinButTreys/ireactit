import { describe, expect, it } from 'vitest';
import { treeKey, type TreeState } from './treeNav';

const open: TreeState = { expanded: true, focus: 0 };

describe('treeKey (1 root + 5 children)', () => {
  it('moves down and up through visible items, clamped', () => {
    expect(treeKey(open, 'ArrowDown', 5)).toEqual({ expanded: true, focus: 1 });
    expect(treeKey({ expanded: true, focus: 5 }, 'ArrowDown', 5).focus).toBe(5);
    expect(treeKey({ expanded: true, focus: 2 }, 'ArrowUp', 5).focus).toBe(1);
    expect(treeKey(open, 'ArrowUp', 5).focus).toBe(0);
  });

  it('jumps with Home and End', () => {
    expect(treeKey({ expanded: true, focus: 3 }, 'Home', 5).focus).toBe(0);
    expect(treeKey(open, 'End', 5).focus).toBe(5);
    expect(treeKey({ expanded: false, focus: 0 }, 'End', 5).focus).toBe(0);
  });

  it('ArrowRight expands a collapsed root, then enters the first child', () => {
    const collapsed = { expanded: false, focus: 0 };
    expect(treeKey(collapsed, 'ArrowRight', 5)).toEqual({ expanded: true, focus: 0 });
    expect(treeKey(open, 'ArrowRight', 5)).toEqual({ expanded: true, focus: 1 });
  });

  it('ArrowLeft goes from a child to the root, and collapses the root', () => {
    expect(treeKey({ expanded: true, focus: 3 }, 'ArrowLeft', 5)).toEqual({ expanded: true, focus: 0 });
    expect(treeKey(open, 'ArrowLeft', 5)).toEqual({ expanded: false, focus: 0 });
  });

  it('ignores other keys (same object back)', () => {
    expect(treeKey(open, 'a', 5)).toBe(open);
  });
});
