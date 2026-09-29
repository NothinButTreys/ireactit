export const SECTION_IDS = ['mount', 'write', 'tree', 'props', 'commit'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  mount: 'Hello',
  write: 'About',
  tree: 'Experience',
  props: 'Work',
  commit: 'Contact',
};
