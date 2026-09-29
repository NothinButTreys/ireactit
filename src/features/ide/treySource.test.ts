import { describe, expect, it } from 'vitest';
import { DEFAULT_TREY } from './treyProps';
import { lineText, treySourceLines } from './treySource';

describe('treySourceLines', () => {
  it('renders an 11-line component whose defaults mirror the props', () => {
    const lines = treySourceLines({ ...DEFAULT_TREY, mood: 'focused', coffee: 5, stack: ['React', 'Vite'] });
    expect(lines).toHaveLength(11);
    expect(lineText(lines[0]!)).toBe("type Mood = 'caffeinated' | 'focused' | 'shipping';");
    expect(lineText(lines[4]!)).toBe("  mood = 'focused',");
    expect(lineText(lines[5]!)).toBe("  focus = 'design systems',");
    expect(lineText(lines[6]!)).toBe('  coffee = 5,');
    expect(lineText(lines[7]!)).toBe("  stack = ['React', 'Vite'],");
    expect(lineText(lines[9]!)).toBe('  return <Engineer {...props} />;');
  });

  it('tags tokens by kind for syntax colouring', () => {
    const [first] = treySourceLines(DEFAULT_TREY);
    expect(first?.[0]).toEqual({ text: 'type', kind: 'kw' });
    expect(first?.find((t) => t.text === "'focused'")?.kind).toBe('str');
  });
});
