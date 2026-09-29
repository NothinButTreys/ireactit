import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
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

  it('gives the close button an accessible name that contains its visible "Esc" label (WCAG 2.5.3)', () => {
    render(<InspectorPanel project={project} opener={null} onClose={() => {}} />);
    const close = screen.getByRole('button', { name: /close inspector/i });
    expect(close).toHaveTextContent('Esc');
    expect(close).toHaveAccessibleName(expect.stringContaining('Esc'));
  });

  it('survives a StrictMode double-invoked mount with the dialog left open and usable', () => {
    const onClose = vi.fn();
    render(
      <StrictMode>
        <InspectorPanel project={project} opener={null} onClose={onClose} />
      </StrictMode>,
    );
    const dialog = screen.getByRole('dialog', { name: /inspecting/ });
    expect(dialog).toHaveAttribute('open');
    expect(document.activeElement).toHaveAttribute('role', 'treeitem');
  });

  it('ignores a close event that fires while the dialog has already reopened', () => {
    // Models the real-browser StrictMode close->reopen race: HTMLDialogElement.close()
    // queues its 'close' event per spec, so by the time it fires the dialog may already be
    // open again. jsdom's stub dispatches synchronously instead (see vitest.setup.ts), so this
    // test drives the guard directly rather than relying on StrictMode's effect timing.
    const onClose = vi.fn();
    render(<InspectorPanel project={project} opener={null} onClose={onClose} />);
    const dialog = screen.getByRole('dialog', { name: /inspecting/ }) as HTMLDialogElement;
    expect(dialog).toHaveAttribute('open');
    dialog.dispatchEvent(new Event('close'));
    expect(onClose).not.toHaveBeenCalled();
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
    await userEvent.click(screen.getByRole('button', { name: /close inspector/i }));
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.activeElement).toBe(opener);
    expect(document.documentElement).not.toHaveAttribute('data-inspector-open');
    opener.remove();
  });
});
