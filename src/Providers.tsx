import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RenderCounterProvider>
      <ViewSourceProvider>{children}</ViewSourceProvider>
    </RenderCounterProvider>
  );
}
