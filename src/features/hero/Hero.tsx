import { useEffect, type CSSProperties } from 'react';
import { profile } from '@/content/profile';
import { useBump } from '@/features/render-counter/RenderCounter';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { RenderLog } from './RenderLog';
import { HERO_TAG, TagTokens } from './TagTokens';
import { useTypewriter } from './useTypewriter';

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const bump = useBump();
  const { output, done } = useTypewriter(HERO_TAG, { enabled: !reduced });

  useEffect(() => {
    if (done) bump();
  }, [done, bump]);

  return (
    <div data-hero="" data-mounted={done ? '' : undefined} className="grid w-full items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
      <div className="flex flex-col gap-7">
        <p aria-hidden className="flex h-6 items-center gap-2.5 font-mono text-[15px] text-muted">
          <TagTokens text={output} />
          <span className="caret inline-block h-[18px] w-[9px] bg-primary" />
        </p>
        <h1 id="mount-title" className="text-[64px] leading-[0.95] font-bold tracking-[-0.045em] md:text-[120px]">
          {profile.greeting}
        </h1>
        <p data-hero-mount="" style={delay(90)} className="max-w-[620px] text-[21px] leading-[1.3] text-muted md:text-[30px]">
          {profile.subline.lead} <span className="text-fg">{profile.subline.emphasis}</span>
        </p>
        <ul data-hero-mount="" style={delay(180)} className="flex flex-wrap gap-2.5 font-mono text-[13px]">
          {profile.badges.map((badge, i) => (
            <li key={badge} className={`rounded-full border border-border px-3 py-1.5 ${i === 0 ? 'text-fg' : 'text-muted'}`}>
              {badge}
            </li>
          ))}
        </ul>
        <div data-hero-mount="" style={delay(270)} className="mt-2 flex flex-col gap-3.5 sm:flex-row">
          <a
            href="#props"
            className="flex h-[52px] items-center justify-center gap-2.5 rounded-[10px] bg-primary px-[22px] text-[17px] font-semibold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span aria-hidden className="font-mono text-sm">
              ⌘
            </span>
            Inspect my work
          </a>
          <a
            href="#commit"
            className="flex h-[52px] items-center justify-center rounded-[10px] border border-border px-5 font-mono text-[15px] text-fg transition-colors hover:border-primary hover:text-primary"
          >
            git commit -m "hello"
          </a>
        </div>
      </div>
      <div data-hero-mount="" style={delay(360)}>
        <RenderLog />
      </div>
      <p aria-hidden className="col-span-full hidden justify-between font-mono text-xs text-muted lg:flex">
        <span>scroll to render ↓</span>
        <span>ireactit.com</span>
      </p>
    </div>
  );
}
