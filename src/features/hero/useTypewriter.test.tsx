import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

function Probe({ enabled = true }: { enabled?: boolean }) {
  const { output, done } = useTypewriter('abcdef', { cps: 10, enabled });
  return (
    <p>
      [{output}]{done ? ' done' : ''}
    </p>
  );
}

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('types one character per tick at the given rate', () => {
    render(<Probe />);
    expect(screen.getByText('[]')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText('[abc]')).toBeInTheDocument();
  });

  it('reports done once the whole text is typed, and stops', () => {
    render(<Probe />);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
  });

  it('shows the full text immediately when disabled', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
  });
});
