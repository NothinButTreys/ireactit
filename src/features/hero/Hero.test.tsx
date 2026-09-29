import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { HERO_TAG, HERO_TAG_SEGMENTS } from './TagTokens';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { SectionProgressProvider } from '@/features/nav/SectionProgress';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

function renderHero() {
  return render(
    <RenderCounterProvider>
      <SectionProgressProvider>
        <Hero />
        <RenderCounterBadge />
      </SectionProgressProvider>
    </RenderCounterProvider>,
  );
}

describe('<Hero />', () => {
  afterEach(() => vi.useRealTimers());

  it('builds its tag from coloured segments', () => {
    expect(HERO_TAG).toBe('<Trey role="Principal Engineer" />');
    expect(HERO_TAG_SEGMENTS.map(([text]) => text).join('')).toBe(HERO_TAG);
  });

  it('renders the greeting as the page h1, the subline, badges and both CTAs', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hi, I'm Trey.");
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveAttribute('data-hero-mount');
    expect(screen.getByText('feels effortless.')).toBeInTheDocument();
    expect(screen.getByText('CXO @ PixelTable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inspect my work/ })).toHaveAttribute('href', '#props');
    expect(screen.getByRole('link', { name: 'git commit -m "hello"' })).toHaveAttribute('href', '#commit');
  });

  it('marks its last element data-hero-end: styles.css keeps #mount invisible until that is parsed', () => {
    const { container } = renderHero();
    const all = container.querySelectorAll('[data-hero] *');
    expect(all[all.length - 1]!.closest('[data-hero-end]')).not.toBeNull();
    expect(container.querySelectorAll('[data-hero-end]')).toHaveLength(1);
  });

  it('types the tag, then mounts exactly once and bumps the render counter', () => {
    vi.useFakeTimers();
    const { container } = renderHero();
    const hero = container.querySelector('[data-hero]');
    expect(hero).not.toHaveAttribute('data-mounted');
    act(() => vi.advanceTimersByTime(5000));
    expect(hero).toHaveAttribute('data-mounted');
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
  });

  it('mounts immediately when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    const { container } = renderHero();
    expect(container.querySelector('[data-hero]')).toHaveAttribute('data-mounted');
  });
});
