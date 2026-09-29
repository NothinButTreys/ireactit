import { describe, expect, it } from 'vitest';
import { BLURBS, DEFAULT_TREY, MAX_COFFEE, MOODS, treyReducer } from './treyProps';

describe('treyReducer', () => {
  it('sets mood and focus', () => {
    const s = treyReducer(DEFAULT_TREY, { type: 'mood', mood: 'shipping' });
    expect(s.mood).toBe('shipping');
    expect(treyReducer(s, { type: 'focus', focus: 'performance' }).focus).toBe('performance');
  });

  it('returns the same object when nothing changes, so callers can skip a re-render', () => {
    expect(treyReducer(DEFAULT_TREY, { type: 'mood', mood: DEFAULT_TREY.mood })).toBe(DEFAULT_TREY);
    expect(treyReducer(DEFAULT_TREY, { type: 'focus', focus: DEFAULT_TREY.focus })).toBe(DEFAULT_TREY);
  });

  it('clamps coffee between 0 and MAX_COFFEE', () => {
    let s = DEFAULT_TREY;
    for (let i = 0; i < 10; i++) s = treyReducer(s, { type: 'coffee', delta: 1 });
    expect(s.coffee).toBe(MAX_COFFEE);
    expect(treyReducer(s, { type: 'coffee', delta: 1 })).toBe(s);
    for (let i = 0; i < 10; i++) s = treyReducer(s, { type: 'coffee', delta: -1 });
    expect(s.coffee).toBe(0);
  });

  it('toggles stack items in canonical order and never empties the stack', () => {
    const added = treyReducer(DEFAULT_TREY, { type: 'stack', tech: 'Vite' });
    expect(added.stack).toEqual(['React', 'TypeScript', 'Node', 'Vite']);
    const removed = treyReducer(added, { type: 'stack', tech: 'TypeScript' });
    expect(removed.stack).toEqual(['React', 'Node', 'Vite']);
    const single = { ...DEFAULT_TREY, stack: ['React'] as const };
    expect(treyReducer(single, { type: 'stack', tech: 'React' })).toBe(single);
  });

  it('has a blurb for every mood', () => {
    for (const mood of MOODS) expect(BLURBS[mood].length).toBeGreaterThan(20);
  });
});
