import { useSyncExternalStore } from 'react';

/**
 * Where the pinned stage fits under the nav: lg and tall enough for the header, all six nodes and the
 * detail pane (narrower lg screens wrap more, so they need more height). In em, so a larger default font
 * size needs a proportionally larger screen. Mirrors the `pinned` custom variant in styles.css.
 */
export const PINNABLE_QUERY = '(min-width: 64em) and (min-height: 47.5em), (min-width: 75em) and (min-height: 43.75em)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(PINNABLE_QUERY);
  media.addEventListener('change', onChange);
  // The head script's failsafe removes html.js if the bundle is slow; the CSS pin keys on it, so must we.
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => {
    media.removeEventListener('change', onChange);
    observer.disconnect();
  };
}

function snapshot(): boolean {
  return document.documentElement.classList.contains('js') && window.matchMedia(PINNABLE_QUERY).matches;
}

/**
 * Whether the career tree may pin: html.js is present (so the CSS `pinned` variant applies) and the viewport
 * matches. False on the server and during hydration, so prerender is the static tree.
 */
export function usePinnable(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
