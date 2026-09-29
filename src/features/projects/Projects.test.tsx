import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Projects } from './Projects';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { projects } from '@/content/projects';

function renderProjects() {
  return render(
    <RenderCounterProvider>
      <Projects />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

describe('<Projects />', () => {
  it('renders one card per project with its component name, title and stack', () => {
    renderProjects();
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
      expect(screen.getByText(`<${p.name} />`)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /Inspect/ })).toHaveLength(projects.length);
  });

  it('opens the lazy inspector for the chosen project, counts a render, and closes it', async () => {
    renderProjects();
    await userEvent.click(screen.getByRole('button', { name: `⌘ Inspect ${projects[1]!.title}` }));
    const dialog = await screen.findByRole('dialog', { name: new RegExp(projects[1]!.name) });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close inspector' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
