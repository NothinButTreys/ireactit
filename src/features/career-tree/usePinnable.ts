import { useSyncExternalStore } from 'react';

/**
 * Where the pinned stage fits under the nav: lg and tall enough for the header, all six nodes and the
 * detail pane (narrower lg screens wrap more, so they need more height). Mirrors styles.css `.career-pin`.
 */
export const PINNABLE_QUERY = '(min-width: 1024px) and (min-height: 760px), (min-width: 1200px) and (min-height: 700px)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(PINNABLE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Whether the career tree may pin. False on the server and during hydration, so prerender is the static tree. */
export function usePinnable(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PINNABLE_QUERY).matches,
    () => false,
  );
}
