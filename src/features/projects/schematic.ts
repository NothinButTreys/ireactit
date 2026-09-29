import type { Highlight, ProjectNodeKey } from '@/content/types';

const HEADER: Highlight = { x: 4, y: 6, w: 92, h: 12 };
const SIDEBAR: Highlight = { x: 4, y: 24, w: 22, h: 70 };
const CANVAS: Highlight = { x: 30, y: 24, w: 66, h: 70 };

/** Wireframe blocks drawn while a project has no real screenshot. */
export const SCHEMATIC_BLOCKS: readonly Highlight[] = [HEADER, SIDEBAR, CANVAS];

/** Which schematic region each case-study node points at when no screenshot-specific highlight exists. */
export const SCHEMATIC_HIGHLIGHTS: Record<ProjectNodeKey, Highlight> = {
  problem: { x: 4, y: 6, w: 92, h: 88 },
  myRole: HEADER,
  architecture: CANVAS,
  hardParts: SIDEBAR,
  outcome: { x: 30, y: 24, w: 66, h: 34 },
};
