export const HERO_TAG_SEGMENTS = [
  ['<Trey', 'tok-tag'],
  [' ', ''],
  ['role', 'tok-prop'],
  ['=', 'tok-punct'],
  ['"Principal Engineer"', 'tok-str'],
  [' ', ''],
  ['/>', 'tok-tag'],
] as const;

export const HERO_TAG = HERO_TAG_SEGMENTS.map(([text]) => text).join('');

// Each segment paired with its start offset within HERO_TAG, computed once at module load (not during render).
const SEGMENTS_WITH_STARTS: readonly (readonly [text: string, className: string, start: number])[] = (() => {
  let start = 0;
  return HERO_TAG_SEGMENTS.map(([text, className]) => {
    const entry = [text, className, start] as const;
    start += text.length;
    return entry;
  });
})();

/** Renders the first `text.length` characters of the hero tag, keeping syntax colours per segment. */
export function TagTokens({ text }: { text: string }) {
  return (
    <span>
      {SEGMENTS_WITH_STARTS.map(([segment, className, start], i) => {
        const shown = segment.slice(0, Math.max(0, text.length - start));
        return shown ? (
          <span key={i} className={className || undefined}>
            {shown}
          </span>
        ) : null;
      })}
    </span>
  );
}
