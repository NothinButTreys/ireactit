export const MOODS = ['caffeinated', 'focused', 'shipping'] as const;
export type Mood = (typeof MOODS)[number];

export const FOCI = ['design systems', 'performance', 'developer experience', 'accessibility'] as const;
export type Focus = (typeof FOCI)[number];

export const STACK_OPTIONS = ['React', 'TypeScript', 'Node', 'Vite', 'Tailwind', 'Playwright'] as const;
type Tech = (typeof STACK_OPTIONS)[number];

export const MAX_COFFEE = 5;

export type TreyProps = { mood: Mood; focus: Focus; coffee: number; stack: readonly Tech[] };

export const DEFAULT_TREY: TreyProps = {
  mood: 'caffeinated',
  focus: 'design systems',
  coffee: 3,
  stack: ['React', 'TypeScript', 'Node'],
};

export const BLURBS: Record<Mood, string> = {
  caffeinated: 'Fully powered. Will refactor your design system before lunch.',
  focused: 'Headphones on. Shipping one well-tested component at a time.',
  shipping: 'Green checks everywhere. Merging to main, watching the deploy.',
};

export type TreyAction =
  | { type: 'mood'; mood: Mood }
  | { type: 'focus'; focus: Focus }
  | { type: 'coffee'; delta: 1 | -1 }
  | { type: 'stack'; tech: Tech };

/** Pure; returns `state` itself for no-op actions so the editor only counts real re-renders. */
export function treyReducer(state: TreyProps, action: TreyAction): TreyProps {
  switch (action.type) {
    case 'mood':
      return state.mood === action.mood ? state : { ...state, mood: action.mood };
    case 'focus':
      return state.focus === action.focus ? state : { ...state, focus: action.focus };
    case 'coffee': {
      const coffee = Math.min(MAX_COFFEE, Math.max(0, state.coffee + action.delta));
      return coffee === state.coffee ? state : { ...state, coffee };
    }
    case 'stack': {
      const has = state.stack.includes(action.tech);
      if (has && state.stack.length === 1) return state;
      const stack = STACK_OPTIONS.filter((t) => (t === action.tech ? !has : state.stack.includes(t)));
      return { ...state, stack };
    }
  }
}
