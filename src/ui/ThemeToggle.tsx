import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

function readTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener('change', onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const next: Theme = theme === 'light' ? 'dark' : 'light';

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable (private mode); the in-page choice still applies
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? `Switch to ${next} theme` : 'Switch theme'}
      className="font-mono text-xs text-muted transition-colors hover:text-primary focus-visible:text-primary"
    >
      {theme === 'light' ? '☾' : '☀'}
    </button>
  );
}
