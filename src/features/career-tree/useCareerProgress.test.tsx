import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useCareerProgress } from './useCareerProgress';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- placeholder signature until useMotionValueEvent's mock replaces it
const scroll = vi.hoisted(() => ({ handler: (_p: number) => {} }));
vi.mock('motion/react', () => ({
  useScroll: () => ({ scrollYProgress: {} }),
  useMotionValueEvent: (_value: unknown, _event: string, handler: (p: number) => void) => {
    scroll.handler = handler;
  },
}));

function Probe({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useCareerProgress(ref, 6, enabled);
  return <div ref={ref}>mounted {mounted}</div>;
}

describe('useCareerProgress', () => {
  it('maps scroll progress to mounted nodes when enabled', () => {
    render(<Probe enabled />);
    expect(screen.getByText('mounted 1')).toBeInTheDocument();
    act(() => scroll.handler(0.5));
    expect(screen.getByText('mounted 3')).toBeInTheDocument();
  });

  it('mounts everything when disabled (reduced motion / prerender)', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByText('mounted 6')).toBeInTheDocument();
  });
});
