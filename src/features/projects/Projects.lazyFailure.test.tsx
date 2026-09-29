import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy } from 'react';
import { projects } from '@/content/projects';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';

// Simulates a failed lazy-chunk fetch (e.g. a flaky network) for the Inspector panel, then recovery.
const chunk = vi.hoisted(() => ({ fails: true, loads: 0 }));
vi.mock('./lazyInspector', () => ({
  createInspector: () =>
    lazy(() => {
      chunk.loads += 1;
      return chunk.fails
        ? Promise.reject(new Error('chunk load failed'))
        : Promise.resolve({ default: () => <p>inspector panel</p> });
    }),
  preloadInspector: () => {},
}));

describe('<Projects /> lazy chunk failure', () => {
  it('shows a visible fallback, keeps the page usable, and a retry after the chunk recovers opens the panel', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { Projects } = await import('./Projects');
    render(
      <RenderCounterProvider>
        <Projects />
      </RenderCounterProvider>,
    );

    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
    }

    const openInspector = () => userEvent.click(screen.getByRole('button', { name: `⌘ Inspect ${projects[0]!.title}` }));
    await openInspector();

    // The lazy chunk rejects asynchronously; wait for it to surface, then confirm the
    // ErrorBoundary caught it and shows a visible message instead of taking down the page.
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the inspector — try again.");
    expect(spy).toHaveBeenCalled();
    expect(screen.queryByText('inspector panel')).not.toBeInTheDocument();
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
    }

    // React.lazy caches a rejected import, so a retry needs a fresh lazy component: once the chunk loads,
    // "Inspect" again clears the message and renders the panel.
    chunk.fails = false;
    await openInspector();
    expect(await screen.findByText('inspector panel')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(chunk.loads).toBe(2);

    spy.mockRestore();
  });
});
