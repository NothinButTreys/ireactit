export const SECTION_IDS = ['mount', 'write', 'tree', 'props', 'commit'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

type SectionHeaderCopy = { num: string; title: string; sub?: string };

/** Header copy for each step. The tree title is templated with the career length at render time. */
export const SECTION_HEADERS: Record<Exclude<SectionId, 'mount'>, SectionHeaderCopy> = {
  write: {
    num: '02',
    title: 'Written in TypeScript. Rendered live.',
    sub: 'Change a prop and watch the component re-render — the counter in the nav keeps score.',
  },
  tree: {
    num: '03',
    title: '{years} years, one component tree.',
    sub: 'Every role is a component. Scroll and the tree mounts itself, node by node.',
  },
  props: {
    num: '04',
    title: "Things I've shipped.",
    sub: 'Each project is a component. Inspect one to see its tree, its props and the decisions behind it.',
  },
  commit: {
    num: '05',
    title: "Let's build something.",
    sub: 'Commit a message straight to my inbox. Or skip the terminal and find me below.',
  },
};

/** The component each lifecycle step "renders" — shown in the hero's render log. */
export const SECTION_COMPONENTS: Record<SectionId, string> = {
  mount: 'Trey',
  write: 'TreyTsx',
  tree: 'Career',
  props: 'Projects',
  commit: 'Contact',
};
