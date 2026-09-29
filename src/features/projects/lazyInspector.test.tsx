import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';

describe('lazyInspector', () => {
  it('preloadInspector swallows a failed chunk load (it surfaces on open instead)', async () => {
    vi.resetModules();
    vi.doMock('./InspectorPanel', () => {
      throw new Error('chunk load failed');
    });
    const { preloadInspector } = await import('./lazyInspector');
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    preloadInspector();
    await new Promise((r) => setTimeout(r, 20));
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
    vi.doUnmock('./InspectorPanel');
  });

  it('createInspector returns a fresh lazy panel each call', async () => {
    vi.resetModules();
    vi.doMock('./InspectorPanel', () => ({ InspectorPanel: () => <p>panel</p> }));
    const { createInspector } = await import('./lazyInspector');
    const Panel = createInspector();
    expect(createInspector()).not.toBe(Panel);
    const props = { project: {} as never, opener: null, onClose: () => {} };
    render(
      <Suspense fallback={null}>
        <Panel {...props} />
      </Suspense>,
    );
    expect(await screen.findByText('panel')).toBeInTheDocument();
    vi.doUnmock('./InspectorPanel');
  });
});
