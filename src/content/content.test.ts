import { describe, expect, it } from 'vitest';
import { SECTION_COMPONENTS, SECTION_HEADERS, SECTION_IDS } from './sections';
import { profile } from './profile';
import { experience } from './experience';
import { projects } from './projects';
import { PROJECT_NODE_KEYS } from './types';

const PASCAL = /^[A-Z][A-Za-z0-9]+$/;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const wordCount = (s: string) => s.trim().split(/\s+/).length;

describe('sections', () => {
  it('follows the render cycle order', () => {
    expect(SECTION_IDS).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
  });

  it('has header copy for every non-mount section, numbered 02..05 in order', () => {
    const nonMount = SECTION_IDS.filter((id) => id !== 'mount');
    const nums = nonMount.map((id) => SECTION_HEADERS[id].num);
    expect(nums).toEqual(['02', '03', '04', '05']);
    for (const id of nonMount) {
      const header = SECTION_HEADERS[id];
      expect(header.num).toMatch(/^\d{2}$/);
      expect(header.title.length).toBeGreaterThan(0);
    }
  });

  it('templates the tree title with the career length', () => {
    expect(SECTION_HEADERS.tree.title).toContain('{years}');
  });

  it('names a component for every step', () => {
    expect(SECTION_COMPONENTS).toEqual({ mount: 'Trey', write: 'TreyTsx', tree: 'Career', props: 'Projects', commit: 'Contact' });
  });
});

describe('profile', () => {
  it('has https links for every external destination', () => {
    for (const href of Object.values(profile.links)) expect(href).toMatch(/^https:\/\//);
    expect(profile.wordmark).toBe('<IReactIt/>');
  });

  it('splits the subline for emphasis and lists three hero badges', () => {
    expect(`${profile.subline.lead} ${profile.subline.emphasis}`).toBe('I build React that feels effortless.');
    expect(profile.badges).toEqual(['Principal Engineer', 'CXO @ PixelTable', 'React · TypeScript']);
  });
});

describe('experience', () => {
  it('lists the five recent roles in spec order', () => {
    expect(experience.filter((e) => e.era === 'recent').map((e) => e.component)).toEqual([
      'PixelTable',
      'Sunstate',
      'RiskLens',
      'HostPapa',
      'Endurance',
    ]);
  });

  it('nests the six early roles, newest first, back to 2006', () => {
    const early = experience.filter((e) => e.era === 'early');
    expect(early.map((e) => e.component)).toEqual([
      'OffMadisonAve',
      'Pearson',
      'Arrowhead',
      'DynamicPageSolutions',
      'Firesquire',
      'Freelance',
    ]);
    expect(early.at(-1)?.start).toBe('2006-05');
  });

  it('keeps every recent role before every early role', () => {
    const eras = experience.map((e) => e.era);
    expect(eras.lastIndexOf('recent')).toBeLessThan(eras.indexOf('early'));
  });

  it.each(experience.map((e) => [e.company, e] as const))('%s has valid shape', (_, e) => {
    expect(e.component).toMatch(PASCAL);
    expect(e.start).toMatch(YEAR_MONTH);
    if (e.end !== null) {
      expect(e.end).toMatch(YEAR_MONTH);
      expect(e.end >= e.start).toBe(true);
    }
    expect(e.highlights.length).toBeGreaterThan(0);
  });
});

describe('projects', () => {
  it('features the four approved projects and no Sunstate work', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'daggerheart-card-creator',
      'alice-is-missing',
      'support-portal',
      'natural-world-library',
    ]);
    expect(JSON.stringify(projects)).not.toMatch(/sunstate/i);
  });

  it('has unique slugs', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it.each(projects.map((p) => [p.slug, p] as const))('%s is a complete case study', (_, p) => {
    expect(p.name).toMatch(PASCAL);
    expect(p.stack.length).toBeGreaterThan(0);
    expect(p.links.length).toBeGreaterThan(0);
    for (const l of p.links) expect(l.href).toMatch(/^https:\/\//);
    expect(p.screenshot.alt.length).toBeGreaterThan(10);
    if (p.screenshot.src) expect(p.screenshot.src).toMatch(/^\/projects\/.+\.(webp|png|jpg)$/);
    expect(Object.keys(p.nodes).sort()).toEqual([...PROJECT_NODE_KEYS].sort());

    const total = PROJECT_NODE_KEYS.reduce((n, k) => n + wordCount(p.nodes[k].body), 0);
    expect(total).toBeGreaterThanOrEqual(150);
    expect(total).toBeLessThanOrEqual(300);

    for (const k of PROJECT_NODE_KEYS) {
      const words = wordCount(p.nodes[k].body);
      expect(words, `${p.slug}.${k}`).toBeGreaterThanOrEqual(25);
      expect(words, `${p.slug}.${k}`).toBeLessThanOrEqual(80);
      const h = p.nodes[k].highlight;
      if (h) {
        for (const v of [h.x, h.y, h.w, h.h]) expect(v).toBeGreaterThanOrEqual(0);
        expect(h.x + h.w).toBeLessThanOrEqual(100);
        expect(h.y + h.h).toBeLessThanOrEqual(100);
      }
    }
  });
});
