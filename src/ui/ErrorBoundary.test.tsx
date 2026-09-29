import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): null {
  throw new Error('boom');
}

describe('<ErrorBoundary />', () => {
  it('renders the fallback when a child throws, logs the error, and leaves siblings rendered', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <div>
        <p>sibling stays</p>
        <ErrorBoundary fallback={<p>fallback content</p>}>
          <Bomb />
        </ErrorBoundary>
      </div>,
    );
    expect(screen.getByText('fallback content')).toBeInTheDocument();
    expect(screen.getByText('sibling stays')).toBeInTheDocument();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('renders its children normally when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });
});
