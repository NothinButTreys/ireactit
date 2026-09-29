import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SectionView } from './SectionView';
import { ViewSourceProvider, ViewSourceToggle } from './ViewSource';

// Warm the virtual module (build-time Shiki highlighting) before any test runs: creating the
// highlighter is a cold, occasionally slow step, and doing it here — outside a per-assertion
// timeout — keeps the lazy <SourcePanel> import from racing it under a loaded test run.
beforeAll(async () => {
  await import('virtual:source-snippets');
});

function Stateful() {
  const [n, setN] = useState(0);
  return (
    <>
      <h2 id="mount-title">Hello</h2>
      <button onClick={() => setN(n + 1)}>clicked {n}</button>
    </>
  );
}

function renderView() {
  return render(
    <ViewSourceProvider>
      <ViewSourceToggle />
      <SectionView id="mount">
        <Stateful />
      </SectionView>
    </ViewSourceProvider>,
  );
}

describe('<SectionView />', () => {
  it('shows the rendered section by default', () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeVisible();
    expect(screen.queryByText('src/features/hero/Hero.tsx')).not.toBeInTheDocument();
  });

  it('swaps to the section’s source and back, keeping component state', async () => {
    renderView();
    await userEvent.click(screen.getByRole('button', { name: 'clicked 0' }));
    await userEvent.click(screen.getByRole('button', { name: 'View source' }));
    expect(await screen.findByText('src/features/hero/Hero.tsx')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hello' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'mount source' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View source' }));
    expect(screen.getByRole('button', { name: 'clicked 1' })).toBeVisible();
  });
});
