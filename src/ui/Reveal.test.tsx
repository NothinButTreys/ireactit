import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';
import { installFakeIntersectionObserver } from '@/test/fakeIntersectionObserver';

let io: ReturnType<typeof installFakeIntersectionObserver>;

describe('<Reveal />', () => {
  beforeEach(() => {
    io = installFakeIntersectionObserver();
  });
  afterEach(() => io.restore());

  it('renders its children immediately (content is never hidden from the DOM)', () => {
    render(<Reveal>hello</Reveal>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('marks itself shown once it scrolls into view', () => {
    render(<Reveal className="card">hello</Reveal>);
    const el = screen.getByText('hello');
    expect(el).toHaveAttribute('data-reveal');
    expect(el).not.toHaveAttribute('data-shown');
    expect(el).toHaveClass('card');
    act(() => io.trigger(el, true));
    expect(el).toHaveAttribute('data-shown');
  });

  it('exposes a stagger delay as a CSS variable', () => {
    render(<Reveal delay={160}>late</Reveal>);
    expect(screen.getByText('late').style.getPropertyValue('--reveal-delay')).toBe('160ms');
  });
});
