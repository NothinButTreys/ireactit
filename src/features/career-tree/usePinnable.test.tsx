import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { PINNABLE_QUERY, usePinnable } from './usePinnable';
import { mockMatchMedia } from '@/test/matchMedia';

function Probe() {
  return <p>{usePinnable() ? 'pinnable' : 'static'}</p>;
}

const html = document.documentElement;

describe('usePinnable', () => {
  afterEach(() => html.classList.remove('js'));

  it('pins only on large, tall viewports, in em so a larger default font size needs a larger screen', () => {
    expect(PINNABLE_QUERY).toBe('(min-width: 64em) and (min-height: 47.5em), (min-width: 75em) and (min-height: 43.75em)');
  });

  it('is true when html.js is present and the viewport matches the pinnable query', () => {
    html.classList.add('js');
    mockMatchMedia([PINNABLE_QUERY]);
    render(<Probe />);
    expect(screen.getByText('pinnable')).toBeInTheDocument();
  });

  it('is false on phones, tablets and short laptops', () => {
    html.classList.add('js');
    mockMatchMedia([]);
    render(<Probe />);
    expect(screen.getByText('static')).toBeInTheDocument();
  });

  it('is false without html.js, like the CSS pinned variant (the head-script failsafe removed it)', () => {
    mockMatchMedia([PINNABLE_QUERY]);
    render(<Probe />);
    expect(screen.getByText('static')).toBeInTheDocument();
  });

  it('follows html.js being removed after render', async () => {
    html.classList.add('js');
    mockMatchMedia([PINNABLE_QUERY]);
    render(<Probe />);
    expect(screen.getByText('pinnable')).toBeInTheDocument();
    await act(async () => {
      html.classList.remove('js');
      await Promise.resolve();
    });
    expect(screen.getByText('static')).toBeInTheDocument();
  });

  it('renders false on the server so the prerendered tree is the static layout', () => {
    html.classList.add('js');
    mockMatchMedia([PINNABLE_QUERY]);
    expect(renderToString(<Probe />)).toContain('static');
  });
});
