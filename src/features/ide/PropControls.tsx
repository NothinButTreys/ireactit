import { useId } from 'react';
import { FOCI, MAX_COFFEE, MOODS, STACK_OPTIONS, type Focus, type TreyAction, type TreyProps } from './treyProps';

type Props = { value: TreyProps; onChange: (action: TreyAction) => void };

const chip =
  'inline-flex h-11 md:h-9 items-center rounded-lg border px-3 font-mono text-xs transition-colors cursor-pointer';
const chipOff = 'border-border text-muted hover:text-fg';
const chipOn = 'border-primary bg-primary/10 text-primary';

export function PropControls({ value, onChange }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="float-left w-16 font-mono text-xs text-accent">mood</legend>
        {MOODS.map((mood) => (
          <label key={mood} className="radio-chip">
            <input
              type="radio"
              name={`${id}-mood`}
              value={mood}
              checked={value.mood === mood}
              onChange={() => onChange({ type: 'mood', mood })}
              className="peer sr-only"
            />
            <span className={`${chip} ${value.mood === mood ? chipOn : chipOff}`}>{mood}</span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <label htmlFor={`${id}-focus`} className="w-16 font-mono text-xs text-accent">
          focus
        </label>
        <select
          id={`${id}-focus`}
          value={value.focus}
          onChange={(e) => onChange({ type: 'focus', focus: e.target.value as Focus })}
          className="h-11 md:h-9 rounded-lg border border-border bg-bg px-2 font-mono text-xs text-fg"
        >
          {FOCI.map((focus) => (
            <option key={focus} value={focus}>
              {focus}
            </option>
          ))}
        </select>
      </div>

      <div role="group" aria-labelledby={`${id}-coffee`} className="flex items-center gap-3">
        <span id={`${id}-coffee`} className="w-16 font-mono text-xs text-accent">
          coffee
        </span>
        <button
          type="button"
          aria-label="Less coffee"
          disabled={value.coffee === 0}
          onClick={() => onChange({ type: 'coffee', delta: -1 })}
          className="h-11 md:h-9 w-11 rounded-lg border border-border font-mono text-fg disabled:opacity-40"
        >
          −
        </button>
        <output aria-live="polite" className="w-7 text-center font-mono text-fg">
          {value.coffee}
        </output>
        <button
          type="button"
          aria-label="More coffee"
          disabled={value.coffee === MAX_COFFEE}
          onClick={() => onChange({ type: 'coffee', delta: 1 })}
          className="h-11 md:h-9 w-11 rounded-lg border border-border font-mono text-fg disabled:opacity-40"
        >
          +
        </button>
      </div>

      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="float-left w-16 font-mono text-xs text-accent">stack</legend>
        {STACK_OPTIONS.map((tech) => {
          const on = value.stack.includes(tech);
          return (
            <button
              key={tech}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ type: 'stack', tech })}
              className={`${chip} ${on ? chipOn : chipOff}`}
            >
              {tech}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
