import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ComponentTree } from './ComponentTree';
import type { InspectorKey } from './inspectorKeys';
import { projects } from '@/content/projects';

const project = projects[0]!;

function Harness({ onSelect }: { onSelect?: (k: InspectorKey) => void }) {
  const [selected, setSelected] = useState<InspectorKey>('root');
  return (
    <ComponentTree
      project={project}
      selected={selected}
      onSelect={(k) => {
        setSelected(k);
        onSelect?.(k);
      }}
    />
  );
}

describe('<ComponentTree />', () => {
  it('renders an ARIA tree rooted at the project component, expanded, with five children', () => {
    render(<Harness />);
    const tree = screen.getByRole('tree', { name: `${project.title} case study` });
    expect(tree).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    expect(items.map((i) => i.getAttribute('aria-level'))).toEqual(['1', '2', '2', '2', '2', '2']);
    expect(items[0]).toHaveAttribute('aria-expanded', 'true');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    expect(items[0]).toHaveAttribute('tabindex', '0');
    expect(items[1]).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus with arrows and selects with Enter', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    screen.getAllByRole('treeitem')[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('<Architecture />');
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('architecture');
    expect(document.activeElement).toHaveAttribute('aria-selected', 'true');
  });

  it('collapses and expands the root with Left/Right', async () => {
    render(<Harness />);
    screen.getAllByRole('treeitem')[0]!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getAllByRole('treeitem')).toHaveLength(1);
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('treeitem')).toHaveLength(6);
  });

  it('selects on click', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await userEvent.click(screen.getByText('<Outcome />'));
    expect(onSelect).toHaveBeenLastCalledWith('outcome');
  });
});
