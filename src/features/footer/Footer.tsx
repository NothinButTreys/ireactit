import { profile } from '@/content/profile';
import { usePageRenderTime } from './usePageRenderTime';

export function Footer() {
  const ms = usePageRenderTime();
  return (
    <footer className="mx-auto flex max-w-[78rem] flex-col gap-2 border-t border-border px-4 py-6 pb-28 font-mono text-xs text-muted md:h-[72px] md:flex-row md:items-center md:justify-between md:py-0 md:px-8 md:pb-0">
      <span>
        {'// page rendered in '}
        <span className="text-success">{ms === null ? '—' : ms}ms</span>
      </span>
      <span>
        {profile.wordmark} · © {__BUILD_YEAR__} {profile.name}
      </span>
    </footer>
  );
}
