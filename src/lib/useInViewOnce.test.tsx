import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useInViewOnce } from './useInViewOnce';
import { installFakeIntersectionObserver } from '@/test/fakeIntersectionObserver';

let io: ReturnType<typeof installFakeIntersectionObserver>;

function Probe() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="target">
      {seen ? 'seen' : 'unseen'}
    </div>
  );
}

describe('useInViewOnce', () => {
  beforeEach(() => {
    io = installFakeIntersectionObserver();
  });
  afterEach(() => io.restore());

  it('starts unseen and observes its element', () => {
    render(<Probe />);
    expect(screen.getByTestId('target')).toHaveTextContent('unseen');
    expect(io.instances[0]?.observed).toEqual([screen.getByTestId('target')]);
  });

  it('flips once when the element intersects, then stops observing', () => {
    render(<Probe />);
    const target = screen.getByTestId('target');
    act(() => io.trigger(target, false));
    expect(target).toHaveTextContent('unseen');
    act(() => io.trigger(target, true));
    expect(target).toHaveTextContent('seen');
    expect(io.instances.every((i) => i.disconnected)).toBe(true);
  });
});
