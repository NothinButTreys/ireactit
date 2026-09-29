import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useHydrated } from './useHydrated';

function Probe() {
  return <p>{useHydrated() ? 'client' : 'server'}</p>;
}

describe('useHydrated', () => {
  it('is false while rendering on the server', () => {
    expect(renderToString(<Probe />)).toContain('server');
  });

  it('is true in a client render', () => {
    render(<Probe />);
    expect(screen.getByText('client')).toBeInTheDocument();
  });
});
