import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSourceProvider, ViewSourceToggle, useViewSource } from './ViewSource';

function Probe() {
  const { enabled } = useViewSource();
  return <p>{enabled ? 'source' : 'rendered'}</p>;
}

describe('ViewSource', () => {
  it('toggles between rendered and source with aria-pressed', async () => {
    render(
      <ViewSourceProvider>
        <ViewSourceToggle />
        <Probe />
      </ViewSourceProvider>,
    );
    const btn = screen.getByRole('button', { name: 'View source' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('rendered')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('source')).toBeInTheDocument();
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
      expect(() => render(<Probe />)).toThrow('useViewSource must be used inside <ViewSourceProvider>');
    });
  });
});
