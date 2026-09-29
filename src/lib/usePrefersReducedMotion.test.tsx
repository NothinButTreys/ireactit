import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { REDUCED_MOTION_QUERY, usePrefersReducedMotion } from './usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

function Probe() {
  return <p>{String(usePrefersReducedMotion())}</p>;
}

describe('usePrefersReducedMotion', () => {
  it('is false when the user has no preference', () => {
    render(<Probe />);
    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('is true when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<Probe />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders false on the server so prerendered HTML is stable', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    expect(renderToString(<Probe />)).toContain('false');
  });
});
