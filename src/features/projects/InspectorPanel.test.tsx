import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InspectorPanel } from './InspectorPanel';
import { projects } from '@/content/projects';

const project = projects[0]!;

describe('<InspectorPanel />', () => {
  it('opens as a modal dialog labelled by the project and focuses the tree', () => {
    render(<InspectorPanel project={project} opener={null} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /inspecting/ });
    expect(dialog).toHaveAttribute('open');
    expect(document.activeElement).toHaveAttribute('role', 'treeitem');
    expect(document.documentElement).toHaveAttribute('data-inspector-open');
  });

  it('draws a schematic highlight for the selected node when there is no screenshot', async () => {
    render(<InspectorPanel project={project} opener={null} onClose={() => {}} />);
    await userEvent.click(screen.getByText('<Architecture />'));
    expect(screen.getByText('Architecture', { selector: '[data-highlight-label]' })).toBeInTheDocument();
  });

  it('closes from its button, calls onClose and returns focus to the opener', async () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    const onClose = vi.fn();
    const { unmount } = render(<InspectorPanel project={project} opener={opener} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close inspector' }));
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.activeElement).toBe(opener);
    expect(document.documentElement).not.toHaveAttribute('data-inspector-open');
    opener.remove();
  });
});
