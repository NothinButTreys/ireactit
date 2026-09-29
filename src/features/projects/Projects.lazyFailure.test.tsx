import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy } from 'react';
import { projects } from '@/content/projects';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';

// Simulates a failed lazy-chunk fetch (e.g. a stale deploy) for the Inspector panel.
vi.mock('./lazyInspector', () => ({
  InspectorPanel: lazy(() => Promise.reject(new Error('chunk load failed'))),
  preloadInspector: () => {},
}));

describe('<Projects /> lazy chunk failure', () => {
  it('shows a visible fallback and keeps the page usable when the Inspector chunk fails to load', async () => {
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
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load the inspector — try again.");
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
    }

    // Reopening mounts a fresh ErrorBoundary (keyed by the open counter) rather than staying tripped:
    // componentDidCatch fires again instead of the fallback silently persisting from the first mount.
    const callsAfterFirstOpen = spy.mock.calls.length;
    await openInspector();
    await waitFor(() => expect(spy.mock.calls.length).toBeGreaterThan(callsAfterFirstOpen));
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load the inspector — try again.");

    spy.mockRestore();
  });
});
