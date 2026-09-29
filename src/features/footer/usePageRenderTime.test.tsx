import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { usePageRenderTime } from './usePageRenderTime';

function Probe() {
  const ms = usePageRenderTime();
  return <p>{ms === null ? 'pending' : `${ms}ms`}</p>;
}

describe('usePageRenderTime', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is pending during prerender', () => {
    expect(renderToString(<Probe />)).toContain('pending');
  });

  it('reports the time to first client frame, rounded', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(412.4);
    render(<Probe />);
    expect(await screen.findByText('412ms')).toBeInTheDocument();
  });
});
