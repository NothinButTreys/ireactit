export const PROJECT_NODE_KEYS = ['problem', 'myRole', 'architecture', 'hardParts', 'outcome'] as const;
export type ProjectNodeKey = (typeof PROJECT_NODE_KEYS)[number];

export type Highlight = { x: number; y: number; w: number; h: number };

export type ProjectNode = { body: string; highlight?: Highlight };

export type Project = {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  year: string;
  team?: string;
  stack: string[];
  links: { label: string; href: string }[];
  screenshot: { src: string; alt: string };
  nodes: Record<ProjectNodeKey, ProjectNode>;
  /** Flipped to true by Trey after fact-checking; Plan 3 blocks launch until every project is reviewed. */
  reviewed: boolean;
};

export type Experience = {
  company: string;
  component: string;
  role: string;
  start: string;
  end: string | null;
  highlights: string[];
  /** 'recent' roles render as top-level tree nodes; 'early' roles nest inside one collapsible <EarlyCareer> node. */
  era: 'recent' | 'early';
};

export type Profile = {
  name: string;
  wordmark: string;
  greeting: string;
  subline: string;
  role: string;
  links: { github: string; linkedin: string; resume: string; pixeltable: string };
};
