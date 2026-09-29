import { lazy } from 'react';

const load = () => import('./InspectorPanel');

/** Warm the chunk on hover/focus so the first open feels instant. A failure here surfaces on open instead. */
export const preloadInspector = () => {
  load().catch(() => {});
};

/**
 * A lazy Inspector panel. React.lazy caches a rejected import for the life of the component, so a retry
 * after a failed chunk load needs a fresh one from here.
 */
export const createInspector = () => lazy(() => load().then((m) => ({ default: m.InspectorPanel })));
