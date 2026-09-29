import { PROJECT_NODE_KEYS, type ProjectNodeKey } from '@/content/types';

export type InspectorKey = 'root' | ProjectNodeKey;

export const INSPECTOR_KEYS: readonly InspectorKey[] = ['root', ...PROJECT_NODE_KEYS];

export const nodeLabel = (key: ProjectNodeKey) => key.charAt(0).toUpperCase() + key.slice(1);
