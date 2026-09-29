import { createContext, use, useCallback, useState } from 'react';

const CountContext = createContext<number | null>(null);
const BumpContext = createContext<(() => void) | null>(null);

export function RenderCounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const bump = useCallback(() => setCount((c) => c + 1), []);
  return (
    <BumpContext value={bump}>
      <CountContext value={count}>{children}</CountContext>
    </BumpContext>
  );
}

/** Stable across renders; use it when a component only increments the counter. */
export function useBump(): () => void {
  const bump = use(BumpContext);
  if (!bump) throw new Error('useBump must be used inside <RenderCounterProvider>');
  return bump;
}

export function useRenderCount(): { count: number; bump: () => void } {
  const count = use(CountContext);
  if (count === null) throw new Error('useRenderCount must be used inside <RenderCounterProvider>');
  return { count, bump: useBump() };
}

export function RenderCounterBadge() {
  const { count } = useRenderCount();
  return <span className="font-mono text-xs tabular-nums text-muted">renders: {count}</span>;
}
