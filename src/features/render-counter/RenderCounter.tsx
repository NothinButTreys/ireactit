import { createContext, use, useCallback, useMemo, useState } from 'react';

type RenderCount = { count: number; bump: () => void };

const RenderCountContext = createContext<RenderCount | null>(null);

export function RenderCounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const bump = useCallback(() => setCount((c) => c + 1), []);
  const value = useMemo(() => ({ count, bump }), [count, bump]);
  return <RenderCountContext value={value}>{children}</RenderCountContext>;
}

export function useRenderCount(): RenderCount {
  const value = use(RenderCountContext);
  if (!value) throw new Error('useRenderCount must be used inside <RenderCounterProvider>');
  return value;
}

export function RenderCounterBadge() {
  const { count } = useRenderCount();
  return <span className="font-mono text-xs tabular-nums text-muted">renders: {count}</span>;
}
