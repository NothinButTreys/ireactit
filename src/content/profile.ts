import type { Profile } from './types';

export const profile: Profile = {
  name: 'Trey McBride',
  wordmark: '<IReactIt/>',
  greeting: "Hi, I'm Trey.",
  subline: { lead: 'I build React that', emphasis: 'feels effortless.' },
  badges: ['Principal Engineer', 'CXO @ PixelTable', 'React · TypeScript'],
  role: 'Principal Engineer',
  links: {
    github: 'https://github.com/NothinButTreys',
    linkedin: 'https://www.linkedin.com/in/thomasmcbrideiii',
    // The résumé lives on LinkedIn for now: the experience page, so it isn't a second copy of the profile link.
    resume: 'https://www.linkedin.com/in/thomasmcbrideiii/details/experience/',
    pixeltable: 'https://pixeltable.net',
  },
};
