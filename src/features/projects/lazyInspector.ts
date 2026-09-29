import { lazy } from 'react';

const load = () => import('./InspectorPanel');

/** Warm the chunk on hover/focus so the first open feels instant. */
export const preloadInspector = () => {
  void load();
};

export const InspectorPanel = lazy(() => load().then((m) => ({ default: m.InspectorPanel })));
