import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { PINNABLE_QUERY, usePinnable } from './usePinnable';
import { mockMatchMedia } from '@/test/matchMedia';

function Probe() {
  return <p>{usePinnable() ? 'pinnable' : 'static'}</p>;
}

describe('usePinnable', () => {
  it('pins only on large, tall viewports', () => {
    expect(PINNABLE_QUERY).toBe('(min-width: 1024px) and (min-height: 760px), (min-width: 1200px) and (min-height: 700px)');
  });

  it('is true when the viewport matches the pinnable query', () => {
    mockMatchMedia([PINNABLE_QUERY]);
    render(<Probe />);
    expect(screen.getByText('pinnable')).toBeInTheDocument();
  });

  it('is false on phones, tablets and short laptops', () => {
    mockMatchMedia([]);
    render(<Probe />);
    expect(screen.getByText('static')).toBeInTheDocument();
  });

  it('renders false on the server so the prerendered tree is the static layout', () => {
    mockMatchMedia([PINNABLE_QUERY]);
    expect(renderToString(<Probe />)).toContain('static');
  });
});
