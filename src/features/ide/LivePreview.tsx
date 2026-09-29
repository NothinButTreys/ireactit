import { profile } from '@/content/profile';
import { useRenderCount } from '@/features/render-counter/RenderCounter';
import { BLURBS, MAX_COFFEE, type TreyProps } from './treyProps';

export function LivePreview({ value }: { value: TreyProps }) {
  const { count } = useRenderCount();
  return (
    <section aria-label="Preview" className="flex flex-col">
      <div className="flex h-11 items-center justify-between border-b border-border px-5 font-mono text-xs text-muted">
        <span>preview</span>
        <span key={count} className="flash text-success">
          ● re-rendered · renders: {count}
        </span>
      </div>
      <div className="dots flex flex-1 items-center justify-center p-8">
        <div className="flex w-full max-w-[380px] flex-col gap-5 rounded-2xl border border-border bg-card p-7">
          <div className="flex items-center gap-4">
            <div aria-hidden className="flex size-14 items-center justify-center rounded-[14px] bg-primary/15 font-mono font-bold text-primary">
              TM
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold">{profile.name}</span>
              <span className="text-muted">{profile.role}</span>
            </div>
          </div>
          <dl className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <dt className="font-mono text-xs text-muted">mood</dt>
              <dd key={value.mood} className="mount-in rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs text-accent">
                {value.mood}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-mono text-xs text-muted">focus</dt>
              <dd key={value.focus} className="mount-in">
                {value.focus}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-mono text-xs text-muted">coffee</dt>
              <dd className="flex gap-1.5">
                <span role="img" aria-label={`${value.coffee} of ${MAX_COFFEE} cups`} className="flex gap-1.5">
                  {Array.from({ length: MAX_COFFEE }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={`h-[18px] w-3.5 rounded-t-[3px] rounded-b-md transition-colors duration-300 ${i < value.coffee ? 'bg-accent' : 'border-[1.5px] border-border'}`}
                    />
                  ))}
                </span>
              </dd>
            </div>
          </dl>
          <ul aria-label="Stack" className="flex flex-wrap gap-2">
            {value.stack.map((tech) => (
              <li key={tech} className="mount-in rounded-md border border-border px-2.5 py-1 font-mono text-xs">
                {tech}
              </li>
            ))}
          </ul>
          <p key={value.mood} className="mount-in text-[15px] text-muted">
            {BLURBS[value.mood]}
          </p>
        </div>
      </div>
    </section>
  );
}
