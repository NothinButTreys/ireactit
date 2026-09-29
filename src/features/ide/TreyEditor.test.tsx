import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreyEditor } from './TreyEditor';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';

function renderEditor() {
  return render(
    <RenderCounterProvider>
      <TreyEditor />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

const code = () => screen.getByLabelText('Trey.tsx source');

describe('<TreyEditor />', () => {
  it('shows the full source immediately (prerender/no-JS friendly)', () => {
    renderEditor();
    expect(code()).toHaveTextContent("mood = 'caffeinated',");
    expect(code()).toHaveTextContent('coffee = 3,');
    expect(code()).toHaveAttribute('role', 'region');
  });

  it('re-renders code and preview when a prop changes, counting one render per change', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('radio', { name: 'focused' }));
    expect(code()).toHaveTextContent("mood = 'focused',");
    const preview = screen.getByRole('region', { name: 'Preview' });
    expect(within(preview).getByText('focused')).toBeInTheDocument();
    expect(within(preview).getByText(/Headphones on/)).toBeInTheDocument();
    expect(screen.getByText('renders: 1')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('focus'), 'performance');
    expect(code()).toHaveTextContent("focus = 'performance',");
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });

  it('steps coffee within bounds and disables the buttons at the limits', async () => {
    renderEditor();
    const more = screen.getByRole('button', { name: 'More coffee' });
    await userEvent.click(more);
    await userEvent.click(more);
    expect(code()).toHaveTextContent('coffee = 5,');
    expect(more).toBeDisabled();
    expect(screen.getByRole('img', { name: '5 of 5 cups' })).toBeInTheDocument();
  });

  it('toggles stack chips but never removes the last one (and does not count a no-op)', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'TypeScript' }));
    await userEvent.click(screen.getByRole('button', { name: 'Node' }));
    expect(code()).toHaveTextContent("stack = ['React'],");
    const react = screen.getByRole('button', { name: 'React' });
    await userEvent.click(react);
    expect(react).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });
});
