import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TreeNode } from './TreeNode';
import { experience } from '@/content/experience';

const role = experience[0]!;

/** Node markup with state-only attributes (classes, data-state) stripped: what's left drives its height. */
function structure(mounted: boolean, newest: boolean): string {
  const { container, unmount } = render(
    <ol>
      <TreeNode role={role} mounted={mounted} newest={newest} pinned />
    </ol>,
  );
  const html = container.innerHTML.replace(/ (class|data-state)="[^"]*"/g, '');
  unmount();
  return html;
}

describe('<TreeNode /> when pinned', () => {
  it('has identical structure whether pending, mounted or newest, so progress never shifts layout', () => {
    const pending = structure(false, false);
    expect(structure(true, false)).toBe(pending);
    expect(structure(true, true)).toBe(pending);
  });

  it('reports its state for styling and tests', () => {
    const { container } = render(
      <ol>
        <TreeNode role={role} mounted={false} newest={false} pinned />
      </ol>,
    );
    expect(container.querySelector('li')).toHaveAttribute('data-state', 'pending');
  });
});
