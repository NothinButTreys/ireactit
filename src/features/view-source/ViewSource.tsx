import { createContext, use, useCallback, useMemo, useState } from 'react';

type ViewSource = { enabled: boolean; toggle: () => void };

const ViewSourceContext = createContext<ViewSource | null>(null);

export function ViewSourceProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const toggle = useCallback(() => setEnabled((e) => !e), []);
  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);
  return <ViewSourceContext value={value}>{children}</ViewSourceContext>;
}

export function useViewSource(): ViewSource {
  const value = use(ViewSourceContext);
  if (!value) throw new Error('useViewSource must be used inside <ViewSourceProvider>');
  return value;
}

export function ViewSourceToggle() {
  const { enabled, toggle } = useViewSource();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="h-8 rounded-lg border border-border px-3 font-mono text-xs text-muted transition-colors hover:text-primary aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
    >
      View source
    </button>
  );
}
