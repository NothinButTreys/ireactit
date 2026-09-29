import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let trigger: Callback = () => {};
let observed: Element[] = [];
let disconnected = false;

class FakeIO {
  constructor(cb: Callback) {
    trigger = cb;
  }
  observe(el: Element) {
    observed.push(el);
  }
  disconnect() {
    disconnected = true;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const ids = ['a', 'b', 'c'] as const;

function Probe() {
  return <p data-testid="active">{useActiveSection(ids)}</p>;
}

describe('useActiveSection', () => {
  beforeEach(() => {
    observed = [];
    disconnected = false;
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
    for (const id of ids) {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
  });
  afterEach(() => {
    for (const id of ids) document.getElementById(id)?.remove();
  });

  it('defaults to the first id and observes every section', () => {
    render(<Probe />);
    expect(screen.getByTestId('active')).toHaveTextContent('a');
    expect(observed.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('switches to the section crossing the centre band', () => {
    render(<Probe />);
    act(() => trigger([{ target: document.getElementById('b')!, isIntersecting: true }]));
    expect(screen.getByTestId('active')).toHaveTextContent('b');
    act(() => trigger([{ target: document.getElementById('b')!, isIntersecting: false }]));
    expect(screen.getByTestId('active')).toHaveTextContent('b');
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();
    expect(disconnected).toBe(true);
  });
});
