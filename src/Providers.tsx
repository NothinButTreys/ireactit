import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';
import { SectionProgressProvider } from '@/features/nav/SectionProgress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RenderCounterProvider>
      <ViewSourceProvider>
        <SectionProgressProvider>{children}</SectionProgressProvider>
      </ViewSourceProvider>
    </RenderCounterProvider>
  );
}
