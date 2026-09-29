import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenderCounterBadge, RenderCounterProvider, useBump, useRenderCount } from './RenderCounter';

function Bumper() {
  const { bump } = useRenderCount();
  return <button onClick={bump}>bump</button>;
}

describe('RenderCounter', () => {
  it('starts at 0 and increments on bump', async () => {
    render(
      <RenderCounterProvider>
        <RenderCounterBadge />
        <Bumper />
      </RenderCounterProvider>,
    );
    expect(screen.getByText('renders: 0')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'bump' }));
    await userEvent.click(screen.getByRole('button', { name: 'bump' }));
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });

  describe('outside the provider', () => {
    let spy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      spy.mockRestore();
    });

    it('throws a helpful error outside the provider', () => {
      expect(() => render(<Bumper />)).toThrow('useRenderCount must be used inside <RenderCounterProvider>');
    });
  });
});

describe('useBump', () => {
  it('gives bump-only consumers a stable function that does not re-render them', async () => {
    const renders = { count: 0 };
    function OnlyBump() {
      renders.count += 1;
      const bump = useBump();
      return <button onClick={bump}>bump only</button>;
    }
    render(
      <RenderCounterProvider>
        <OnlyBump />
        <RenderCounterBadge />
      </RenderCounterProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'bump only' }));
    await userEvent.click(screen.getByRole('button', { name: 'bump only' }));
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
    expect(renders.count).toBe(1);
  });
});
