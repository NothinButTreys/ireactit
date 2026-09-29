import { Component, type ReactNode } from 'react';

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

/**
 * Catches a render error in its subtree (e.g. a lazy chunk that fails to load) and shows
 * `fallback` instead of leaving the whole page blank. Siblings outside the boundary are
 * unaffected.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error('ErrorBoundary caught an error', error, info.componentStack);
  }

  override render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
