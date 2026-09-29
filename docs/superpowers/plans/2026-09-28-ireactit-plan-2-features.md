# IReactIt Plan 2: Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build every section of the approved "Render Cycle" design on the Plan 1 foundation: the hero mount, the live `Trey.tsx` editor, the pinned career tree, the projects grid with its DevTools Inspector, the contact terminal and footer, and View Source mode. Each piece is test-driven, prerender-safe and accessible, and smooth without heavy JavaScript.

**Architecture:** Each section is a self-contained feature folder under `src/features/`, wired into `src/App.tsx` as soon as it lands, so every task ends with a working page. Pure logic lives in `.ts` modules (reducers and calculators) with unit tests. Components get React Testing Library tests, and each feature gets a Playwright spec that runs in real browsers.

Animation is **CSS-first**. Reveal, mount and stagger effects are CSS transitions switched on by data attributes. The `html.js` class is set by the head script, so the prerendered and no-JS HTML is always fully visible. Only the career tree's scroll progress uses Motion's `useScroll`. Lenis provides smooth scrolling unless the user prefers reduced motion. The Inspector and the View Source panel are lazy-loaded.

**Tech Stack:** Vite 8, React 19, TypeScript (strict), Tailwind CSS v4, Motion 13 (`useScroll`, `useMotionValueEvent`), Lenis 1.3, Shiki 4 (build-time only, via a Vite virtual module), zod 4, Vitest 5 + React Testing Library, Playwright 1.63 + axe.

**Spec:** `docs/superpowers/specs/2026-09-28-ireactit-portfolio-design.md`. **Approved design:** https://claude.ai/artifact/XPcRC2u7uHb3ya91TTV9V5 (the Hero, Trey.tsx, Career tree, Projects, Inspector, View Source, Contact, Mobile hero and Mobile inspector artboards). **Previous plan:** `docs/superpowers/plans/2026-09-28-ireactit-plan-1-foundation.md`.

## Global Constraints

Everything in Plan 1's Global Constraints still applies: TypeScript strict with no `any`; pnpm; TDD; the allowed animated properties; the easing, spring and mount values; the section ids; the colour tokens; the fonts; the contact rules; the server-chain import rule, now enforced by ESLint and `tsconfig.server.json`; no secrets in git; and the commit trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. In addition:

- **Prerender-safe rendering.**
  - Never branch on `window`, `document`, `matchMedia` or `Date.now()` during render. Read browser state through `useSyncExternalStore` with a server snapshot (`usePrefersReducedMotion`, `useHydrated`, `ThemeToggle`), or in effects.
  - The first client render must match the prerendered HTML.
  - Motion components must never serialise hidden initial styles (`initial="hidden"`) into the prerendered HTML.
- **Visible without JS.**
  - Any "hidden until revealed" style must be scoped under `html.js` (the head script adds that class).
  - With JavaScript disabled, all content must be readable: the hero, the final IDE code, the fully expanded career tree, and each case study through `<noscript>`.
- **Motion.**
  - Only `transform`, `opacity` and `filter: blur` are animated.
  - Easing is `var(--ease)` = `cubic-bezier(0.22, 1, 0.36, 1)`. Mount is 500ms (fade, scale 0.98→1, blur 4px→0).
  - Under `prefers-reduced-motion: reduce`, transitions are opacity-only at 150ms or less, the tree is not pinned, typing is instant, Lenis is off, and the dot drift stops.
- **Accessibility.**
  - Real `<button>`, `<a href>`, `<input>` and `<label>` elements. Visible focus rings.
  - Touch targets at least 44px on mobile and at least 24px everywhere.
  - Dialogs use native `<dialog>` with `showModal()`. Trees follow the WAI-ARIA tree pattern.
  - `axe` must be clean (wcag2a/2aa/21a/21aa/22aa; no moderate or worse violations) in every state.
- **Playwright specs** import `{ test, expect }` from `tests/fixtures.ts`, which fails a test on any console error or page error. Locally, run Playwright with `--project=chromium --project=mobile`: WebKit can't launch on this Mac (a Playwright/macOS 14 limitation), and CI covers it.
- **Content is data.** Copy comes from `src/content/*`. Never invent facts. Draft case-study copy stays `reviewed: false`.
- **Performance.** The Inspector panel and the View Source panel are `React.lazy` chunks. No new runtime dependencies beyond `lenis` (Shiki is a build-time dev dependency).

## Design reference (from the approved canvas)

| Element | Values |
|---|---|
| Page content width | `max-w-[78rem]` (1248px), side padding `px-4 md:px-8`; section vertical padding `py-24` |
| Section header | mono 13px `text-primary`, tracking 0.08em: `NN ── step`; h2 36px mobile / 56px desktop, bold, leading 1.05, tracking -0.03em; subline 19px `text-muted`, max-w 640px |
| Hero | 2-column grid `7fr 5fr` at `lg`; typed tag line mono 15px + a 9×18px cyan caret; h1 64px mobile / 120px desktop, leading 0.95, tracking -0.045em; subline 21px/30px `text-muted` with an `text-fg` emphasis; three mono 13px pill badges; CTAs 52px tall (a cyan filled "⌘ Inspect my work", and a bordered mono `git commit -m "hello"`); the render-log card on the right; a mono 12px "scroll to render ↓" hint |
| Cards | `rounded-2xl border border-border bg-card`; inner code panels `bg-bg` |
| Syntax colours | keyword `--syntax-keyword` (purple), tag/component = primary, prop = accent, string = success, number = accent, punctuation = muted |
| Inspector | bottom sheet about 70vh (640px max), `rounded-t-[18px]`, header 52px ("⚛ Components · inspecting <Name>" + "Esc ✕"), columns `300px \| 1fr \| 460px`; full-screen on mobile |
| Contact | 2-column grid `5fr 7fr` at `lg`; terminal card with a `trey@ireactit: ~/inbox` title bar, `$ git commit \` prompt, amber flags `--author`, `--email`, `-m`, a 48px cyan "git push" button, and a push log in `bg-bg` |
| Footer | 72px, mono 12px: `// page rendered in NNNms` (the number in success) and `<IReactIt/> · © YEAR Trey McBride` |
| Mobile | nav rail becomes a bottom pill bar (44px items); the header keeps the wordmark, counter, View source and theme toggle |

## File structure (created or changed by this plan)

```
index.html                                   head script also adds html.js
src/styles.css                               + --ease, --syntax-keyword, reveal/mount/caret/flash/drift utilities, shiki vars, inspector dialog
src/test/matchMedia.ts                       matchMediaFor()/mockMatchMedia() test helpers
src/test/fakeIntersectionObserver.ts         installFakeIntersectionObserver() test helper
src/lib/usePrefersReducedMotion.ts           useSyncExternalStore on (prefers-reduced-motion: reduce)
src/lib/useHydrated.ts                       false on server/hydration, true after
src/lib/useInViewOnce.ts                     [ref, seen] — flips once when intersecting
src/lib/SmoothScroll.tsx                     Lenis on/off by reduced motion
src/ui/Reveal.tsx                            data-reveal wrapper (CSS does the animation)
src/ui/SectionHeader.tsx                     "NN ── step" + h2 + subline
src/features/render-counter/RenderCounter.tsx  split count/bump contexts; + useBump()
src/features/nav/SectionProgress.tsx         { active, visited } context over useActiveSection
src/features/nav/Nav.tsx                     skip link, desktop rail, mobile pill bar
src/features/hero/useTypewriter.ts, TagTokens.tsx, RenderLog.tsx, Hero.tsx
src/features/ide/treyProps.ts, treySource.ts, CodeView.tsx, PropControls.tsx, LivePreview.tsx, TreyEditor.tsx, WriteSection.tsx
src/features/career-tree/careerProgress.ts, useCareerProgress.ts, TreeNode.tsx, EarlyCareerNode.tsx, CareerTree.tsx
src/features/projects/schematic.ts, treeNav.ts, ProjectShot.tsx, ProjectCard.tsx, ComponentTree.tsx, PropsPane.tsx, HighlightOverlay.tsx, InspectorPanel.tsx, lazyInspector.ts, Projects.tsx
src/features/contact/commitForm.ts, useCommitForm.ts, CommitTerminal.tsx, CommitSection.tsx
src/features/footer/usePageRenderTime.ts, Footer.tsx
src/content/snippets/{mount,write,tree,props,commit}.snippet
vite-plugins/sourceSnippets.ts               virtual:source-snippets (Shiki at build time)
src/virtual-source-snippets.d.ts             module declaration
src/features/view-source/SourcePanel.tsx, SectionView.tsx
src/App.tsx                                  wires each section as it lands
tests/e2e/{shell,hero,ide,tree,projects,contact,view-source,modes}.spec.ts
```

---

### Task 1: Motion foundation (reduced motion, hydration, in-view, Lenis, reveal CSS)

**Files:**
- Create: `src/test/matchMedia.ts`, `src/test/fakeIntersectionObserver.ts`, `src/lib/usePrefersReducedMotion.ts`, `src/lib/usePrefersReducedMotion.test.tsx`, `src/lib/useHydrated.ts`, `src/lib/useHydrated.test.tsx`, `src/lib/useInViewOnce.ts`, `src/lib/useInViewOnce.test.tsx`, `src/lib/SmoothScroll.tsx`, `src/lib/SmoothScroll.test.tsx`, `src/ui/Reveal.tsx`, `src/ui/Reveal.test.tsx`
- Modify: `package.json` (add `lenis`), `vitest.setup.ts`, `vitest.config.ts`, `index.html`, `src/styles.css`, `src/main.tsx`

**Interfaces:**
- Produces:
  - `matchMediaFor(matching?: readonly string[]): (query: string) => MediaQueryList` and `mockMatchMedia(matching: readonly string[]): void`
  - `installFakeIntersectionObserver(): { trigger(target: Element, isIntersecting: boolean): void; instances: { observed: Element[]; disconnected: boolean }[]; restore(): void }`
  - `REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'` and `usePrefersReducedMotion(): boolean`
  - `useHydrated(): boolean`
  - `useInViewOnce<T extends Element>(threshold?: number): [RefObject<T | null>, boolean]`
  - `SmoothScroll` (renders null) and `NAV_OFFSET = 56`
  - `<Reveal className? delay?(ms) children />`, which renders `<div data-reveal data-shown?>`
  - CSS utilities: `[data-reveal]`, `.mount-in`, `.caret`, `.flash`, `.dots`, `.dots-drift`, the `.tok-{kw,tag,prop,str,num,punct}` classes, and `--ease`/`--syntax-keyword`

- [ ] **Step 1: Install Lenis and add the test helpers**

```bash
cd /Users/thomasmcbride/code/IReactIt
pnpm add lenis
```

`src/test/matchMedia.ts`:

```ts
export function matchMediaFor(matching: readonly string[] = []) {
  return (query: string): MediaQueryList =>
    ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

export function mockMatchMedia(matching: readonly string[]): void {
  window.matchMedia = matchMediaFor(matching);
}
```

`src/test/fakeIntersectionObserver.ts`:

```ts
type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

export function installFakeIntersectionObserver() {
  const instances: { observed: Element[]; disconnected: boolean; callback: Callback }[] = [];

  class FakeIntersectionObserver {
    observed: Element[] = [];
    disconnected = false;
    callback: Callback;
    constructor(callback: Callback) {
      this.callback = callback;
      instances.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve() {}
    disconnect() {
      this.disconnected = true;
    }
    takeRecords() {
      return [];
    }
  }

  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

  return {
    instances,
    trigger(target: Element, isIntersecting: boolean) {
      for (const io of instances) {
        if (!io.disconnected && io.observed.includes(target)) io.callback([{ target, isIntersecting }]);
      }
    },
    restore() {
      globalThis.IntersectionObserver = original;
    },
  };
}
```

In `vitest.setup.ts`, replace the inline `matchMedia` stub with the helper (and reset it after each test), and add a deterministic `<dialog>` stub. The whole file becomes:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { matchMediaFor } from './src/test/matchMedia';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: matchMediaFor() });
}

// jsdom has no IntersectionObserver; a no-op default keeps components that observe sections renderable.
// Tests that exercise observation install their own fake.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// jsdom's <dialog> support is partial; model showModal/close deterministically (close fires 'close').
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    window.matchMedia = matchMediaFor();
  }
});
```

(Keep any additions the Plan 1 fix round made to this file. If it differs from the above only by extra lines, merge them in.)

In `vitest.config.ts`, widen the coverage `include` so pure feature logic counts: `['src/lib/**', 'src/content/**', 'src/features/**/*.ts', 'src/features/**/server/**']`. Keep `exclude: ['**/*.test.*']` and the 90% line threshold.

- [ ] **Step 2: Write the failing hook tests**

`src/lib/usePrefersReducedMotion.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { REDUCED_MOTION_QUERY, usePrefersReducedMotion } from './usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

function Probe() {
  return <p>{String(usePrefersReducedMotion())}</p>;
}

describe('usePrefersReducedMotion', () => {
  it('is false when the user has no preference', () => {
    render(<Probe />);
    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('is true when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<Probe />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders false on the server so prerendered HTML is stable', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    expect(renderToString(<Probe />)).toContain('false');
  });
});
```

`src/lib/useHydrated.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useHydrated } from './useHydrated';

function Probe() {
  return <p>{useHydrated() ? 'client' : 'server'}</p>;
}

describe('useHydrated', () => {
  it('is false while rendering on the server', () => {
    expect(renderToString(<Probe />)).toContain('server');
  });

  it('is true in a client render', () => {
    render(<Probe />);
    expect(screen.getByText('client')).toBeInTheDocument();
  });
});
```

`src/lib/useInViewOnce.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useInViewOnce } from './useInViewOnce';
import { installFakeIntersectionObserver } from '@/test/fakeIntersectionObserver';

let io: ReturnType<typeof installFakeIntersectionObserver>;

function Probe() {
  const [ref, seen] = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="target">
      {seen ? 'seen' : 'unseen'}
    </div>
  );
}

describe('useInViewOnce', () => {
  beforeEach(() => {
    io = installFakeIntersectionObserver();
  });
  afterEach(() => io.restore());

  it('starts unseen and observes its element', () => {
    render(<Probe />);
    expect(screen.getByTestId('target')).toHaveTextContent('unseen');
    expect(io.instances[0]?.observed).toEqual([screen.getByTestId('target')]);
  });

  it('flips once when the element intersects, then stops observing', () => {
    render(<Probe />);
    const target = screen.getByTestId('target');
    act(() => io.trigger(target, false));
    expect(target).toHaveTextContent('unseen');
    act(() => io.trigger(target, true));
    expect(target).toHaveTextContent('seen');
    expect(io.instances.every((i) => i.disconnected)).toBe(true);
  });
});
```

- [ ] **Step 3: Run them and confirm they fail**

Run: `pnpm test src/lib/usePrefersReducedMotion.test.tsx src/lib/useHydrated.test.tsx src/lib/useInViewOnce.test.tsx`
Expected: FAIL, with the three imports unresolved.

- [ ] **Step 4: Implement the hooks**

`src/lib/usePrefersReducedMotion.ts`:

```ts
import { useSyncExternalStore } from 'react';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** Server and hydration render as "no preference", so prerendered HTML never depends on the visitor. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
```

`src/lib/useHydrated.ts`:

```ts
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** false during prerender and the hydration pass, true on every client render after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
```

`src/lib/useInViewOnce.ts`:

```ts
import { useEffect, useRef, useState, type RefObject } from 'react';

export function useInViewOnce<T extends Element>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}
```

- [ ] **Step 5: Confirm they pass**

Run: `pnpm test src/lib`
Expected: all of `src/lib` passes.

- [ ] **Step 6: Write the failing SmoothScroll and Reveal tests**

`src/lib/SmoothScroll.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SmoothScroll, NAV_OFFSET } from './SmoothScroll';
import { REDUCED_MOTION_QUERY } from './usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const { LenisMock, destroy } = vi.hoisted(() => {
  const destroy = vi.fn();
  const LenisMock = vi.fn(function Lenis() {
    return { destroy };
  });
  return { LenisMock, destroy };
});
vi.mock('lenis', () => ({ default: LenisMock }));

type LenisOptions = { autoRaf: boolean; anchors: { offset: number }; prevent: (node: HTMLElement) => boolean };

describe('<SmoothScroll />', () => {
  beforeEach(() => {
    LenisMock.mockClear();
    destroy.mockClear();
  });

  it('starts Lenis with auto RAF and nav-offset anchors, and destroys it on unmount', () => {
    const { unmount } = render(<SmoothScroll />);
    expect(LenisMock).toHaveBeenCalledOnce();
    const options = LenisMock.mock.calls[0]?.[0] as unknown as LenisOptions;
    expect(options.autoRaf).toBe(true);
    expect(options.anchors).toEqual({ offset: -NAV_OFFSET });
    unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('lets dialogs scroll natively', () => {
    render(<SmoothScroll />);
    const options = LenisMock.mock.calls[0]?.[0] as unknown as LenisOptions;
    const dialog = document.createElement('dialog');
    const inside = document.createElement('p');
    dialog.append(inside);
    expect(options.prevent(inside)).toBe(true);
    expect(options.prevent(document.createElement('p'))).toBe(false);
  });

  it('does nothing when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<SmoothScroll />);
    expect(LenisMock).not.toHaveBeenCalled();
  });
});
```

`src/ui/Reveal.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';
import { installFakeIntersectionObserver } from '@/test/fakeIntersectionObserver';

let io: ReturnType<typeof installFakeIntersectionObserver>;

describe('<Reveal />', () => {
  beforeEach(() => {
    io = installFakeIntersectionObserver();
  });
  afterEach(() => io.restore());

  it('renders its children immediately (content is never hidden from the DOM)', () => {
    render(<Reveal>hello</Reveal>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('marks itself shown once it scrolls into view', () => {
    render(<Reveal className="card">hello</Reveal>);
    const el = screen.getByText('hello');
    expect(el).toHaveAttribute('data-reveal');
    expect(el).not.toHaveAttribute('data-shown');
    expect(el).toHaveClass('card');
    act(() => io.trigger(el, true));
    expect(el).toHaveAttribute('data-shown');
  });

  it('exposes a stagger delay as a CSS variable', () => {
    render(<Reveal delay={160}>late</Reveal>);
    expect(screen.getByText('late').style.getPropertyValue('--reveal-delay')).toBe('160ms');
  });
});
```

- [ ] **Step 7: Confirm they fail**

Run: `pnpm test src/lib/SmoothScroll.test.tsx src/ui/Reveal.test.tsx`
Expected: FAIL, imports unresolved.

- [ ] **Step 8: Implement SmoothScroll and Reveal**

`src/lib/SmoothScroll.tsx`:

```tsx
import Lenis from 'lenis';
import { useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Height of the fixed nav; anchor jumps stop this far above their target. */
export const NAV_OFFSET = 56;

export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -NAV_OFFSET },
      // The Inspector is a modal <dialog>; let it scroll natively.
      prevent: (node) => node.closest('dialog') !== null,
    });
    return () => lenis.destroy();
  }, [reduced]);

  return null;
}
```

`src/ui/Reveal.tsx`:

```tsx
import type { CSSProperties, ReactNode } from 'react';
import { useInViewOnce } from '@/lib/useInViewOnce';

type Props = { className?: string; delay?: number; children: ReactNode };

/**
 * Fades/scales/de-blurs its content in the first time it enters the viewport.
 * The hidden state is CSS-only and scoped to html.js, so prerendered and no-JS HTML stays visible.
 */
export function Reveal({ className, delay = 0, children }: Props) {
  const [ref, shown] = useInViewOnce<HTMLDivElement>();
  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined;
  return (
    <div ref={ref} data-reveal="" data-shown={shown ? '' : undefined} style={style} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 9: Confirm they pass**

Run: `pnpm test src/lib src/ui`
Expected: PASS.

- [ ] **Step 10: The `html.js` flag, Lenis CSS and the motion/syntax styles**

In `index.html`, make the head script's first statement add the `js` class (keep the theme logic):

```html
    <script>
      document.documentElement.classList.add('js');
      try {
        var t = localStorage.getItem('theme');
        if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
      } catch (e) {}
    </script>
```

In `src/main.tsx`, add `import 'lenis/dist/lenis.css';` directly above `import './styles.css';`.

In `src/styles.css`:
- Add `--ease: cubic-bezier(0.22, 1, 0.36, 1);` and `--syntax-keyword: 276 68% 75%;` to the dark `:root` block.
- Add `--syntax-keyword: 276 50% 42%;` to **both** light blocks (`:root[data-theme='light']` and the `prefers-color-scheme: light` block).
- Append:

```css
/* ---------- Motion (CSS-first). Hidden states live under html.js so no-JS/prerendered HTML stays visible. ---------- */
[data-reveal] {
  transition:
    opacity 500ms var(--ease),
    transform 500ms var(--ease),
    filter 500ms var(--ease);
  transition-delay: var(--reveal-delay, 0ms);
}
.js [data-reveal]:not([data-shown]) {
  opacity: 0;
  transform: scale(0.98);
  filter: blur(4px);
}

@keyframes mount-in {
  from {
    opacity: 0;
    transform: scale(0.98);
    filter: blur(4px);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
}
.mount-in {
  animation: mount-in 500ms var(--ease) both;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
.caret {
  animation: caret-blink 1.1s steps(1) infinite;
}

@keyframes flash {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.6;
  }
}
.flash {
  animation: flash 600ms var(--ease) both;
}

.dots {
  background-image: radial-gradient(hsl(var(--border)) 1px, transparent 1px);
  background-size: 24px 24px;
}
@keyframes drift {
  to {
    transform: translate3d(24px, 24px, 0);
  }
}
.dots-drift {
  position: fixed;
  inset: -24px;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(hsl(var(--border)) 1px, transparent 1px);
  background-size: 24px 24px;
  animation: drift 90s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: opacity 150ms linear;
    transition-delay: 0ms;
  }
  .js [data-reveal]:not([data-shown]) {
    transform: none;
    filter: none;
  }
  .mount-in {
    animation: fade-in 150ms linear both;
  }
  .caret,
  .flash,
  .dots-drift {
    animation: none;
  }
}

/* ---------- Syntax tokens (IDE + inspector) ---------- */
.tok-kw {
  color: hsl(var(--syntax-keyword));
}
.tok-tag {
  color: hsl(var(--primary));
}
.tok-prop,
.tok-num {
  color: hsl(var(--accent));
}
.tok-str {
  color: hsl(var(--success));
}
.tok-punct {
  color: hsl(var(--muted));
}
```

- [ ] **Step 11: Verify and commit**

Run: `pnpm coverage && pnpm typecheck && pnpm lint && pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all green. The e2e suite should be unchanged in behaviour (nothing uses Reveal yet), and the console-error fixture passes.

```bash
git add -A
git commit -m "feat(motion): reduced-motion/hydration/in-view hooks, Lenis, CSS-first reveal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: App shell (split render counter, section progress, mobile rail, skip link, section headers)

**Files:**
- Create: `src/features/nav/SectionProgress.tsx`, `src/features/nav/SectionProgress.test.tsx`, `src/ui/SectionHeader.tsx`, `tests/e2e/shell.spec.ts`
- Modify: `src/features/render-counter/RenderCounter.tsx`, `src/features/render-counter/RenderCounter.test.tsx`, `src/features/nav/Nav.tsx`, `src/features/nav/Nav.test.tsx`, `src/features/view-source/ViewSource.tsx` (toggle styling only), `src/ui/ThemeToggle.tsx` (target size only), `src/Providers.tsx`, `src/App.tsx`, `eslint.config.js` (react-refresh `allowExportNames`)

**Interfaces:**
- Consumes: `useActiveSection` (Plan 1); `SECTION_IDS` and `SectionId`; `SmoothScroll` and `Reveal` (Task 1)
- Produces:
  - `useBump(): () => void` (a stable function; components that only bump never re-render on count changes), and `useRenderCount(): { count: number; bump: () => void }` (unchanged)
  - `SectionProgressProvider`, `useSectionProgress(): { active: SectionId; visited: ReadonlySet<SectionId> }`
  - `<SectionHeader num: string; step: SectionId; title: string; sub?: string />`, which renders an `<h2 id="{step}-title">`
  - `App` layout: `<main id="main" tabIndex={-1}>` with five `<Section>`s in order. Later tasks replace each section's inner content.

- [ ] **Step 1: Write the failing tests**

Append to `src/features/render-counter/RenderCounter.test.tsx` (keep the existing tests; add `useBump` to the import from `./RenderCounter`):

```tsx
describe('useBump', () => {
  it('gives bump-only consumers a stable function that does not re-render them', async () => {
    let renders = 0;
    function OnlyBump() {
      renders += 1;
      const bump = useBump();
      return <button onClick={bump}>bump only</button>;
    }
    render(
      <RenderCounterProvider>
        <OnlyBump />
        <RenderCounterBadge />
      </RenderCounterProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'bump only' }));
    await userEvent.click(screen.getByRole('button', { name: 'bump only' }));
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
    expect(renders).toBe(1);
  });
});
```

`src/features/nav/SectionProgress.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionProgressProvider, useSectionProgress } from './SectionProgress';

const active = vi.hoisted(() => ({ current: 'mount' }));
vi.mock('./useActiveSection', () => ({ useActiveSection: () => active.current }));

function Probe() {
  const { active: now, visited } = useSectionProgress();
  return (
    <p>
      {now}|{[...visited].join(',')}
    </p>
  );
}

describe('SectionProgress', () => {
  it('exposes the active section and accumulates every section visited', () => {
    active.current = 'mount';
    const { rerender } = render(
      <SectionProgressProvider>
        <Probe />
      </SectionProgressProvider>,
    );
    expect(screen.getByText('mount|mount')).toBeInTheDocument();
    active.current = 'tree';
    rerender(
      <SectionProgressProvider>
        <Probe />
      </SectionProgressProvider>,
    );
    expect(screen.getByText('tree|mount,tree')).toBeInTheDocument();
  });

  it('throws a helpful error outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useSectionProgress must be used inside <SectionProgressProvider>');
    spy.mockRestore();
  });
});
```

Replace `src/features/nav/Nav.test.tsx` with:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Nav } from './Nav';
import { SectionProgressProvider } from './SectionProgress';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

vi.mock('./useActiveSection', () => ({ useActiveSection: () => 'tree' }));

function renderNav() {
  return render(
    <RenderCounterProvider>
      <ViewSourceProvider>
        <SectionProgressProvider>
          <Nav />
        </SectionProgressProvider>
      </ViewSourceProvider>
    </RenderCounterProvider>,
  );
}

describe('<Nav />', () => {
  it('renders the render-cycle rail twice (desktop bar + mobile pill), in order, with hash links', () => {
    renderNav();
    const rails = screen.getAllByRole('navigation', { name: 'Render cycle' });
    expect(rails).toHaveLength(2);
    for (const rail of rails) {
      const links = within(rail).getAllByRole('link');
      expect(links.map((l) => l.getAttribute('href'))).toEqual(['#mount', '#write', '#tree', '#props', '#commit']);
      expect(links.map((l) => l.textContent)).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
    }
  });

  it('marks the active step with aria-current in both rails', () => {
    renderNav();
    for (const link of screen.getAllByRole('link', { name: 'tree' })) {
      expect(link).toHaveAttribute('aria-current', 'location');
    }
    for (const link of screen.getAllByRole('link', { name: 'mount' })) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('offers a skip link to the main content first', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent('Skip to content');
    expect(links[0]).toHaveAttribute('href', '#main');
  });

  it('shows the wordmark, the toggles and the render counter', () => {
    renderNav();
    expect(screen.getByRole('link', { name: '<IReactIt/>' })).toHaveAttribute('href', '#mount');
    expect(screen.getByRole('button', { name: 'View source' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme/ })).toBeInTheDocument();
    expect(screen.getByText('renders: 0')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Confirm they fail**

Run: `pnpm test src/features/render-counter src/features/nav`
Expected: FAIL (`useBump` is not exported, `./SectionProgress` is unresolved, and Nav has one rail and no skip link).

- [ ] **Step 3: Implement**

`src/features/render-counter/RenderCounter.tsx`:

```tsx
import { createContext, use, useCallback, useState } from 'react';

const CountContext = createContext<number | null>(null);
const BumpContext = createContext<(() => void) | null>(null);

export function RenderCounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const bump = useCallback(() => setCount((c) => c + 1), []);
  return (
    <BumpContext value={bump}>
      <CountContext value={count}>{children}</CountContext>
    </BumpContext>
  );
}

/** Stable across renders; use it when a component only increments the counter. */
export function useBump(): () => void {
  const bump = use(BumpContext);
  if (!bump) throw new Error('useBump must be used inside <RenderCounterProvider>');
  return bump;
}

export function useRenderCount(): { count: number; bump: () => void } {
  const count = use(CountContext);
  if (count === null) throw new Error('useRenderCount must be used inside <RenderCounterProvider>');
  return { count, bump: useBump() };
}

export function RenderCounterBadge() {
  const { count } = useRenderCount();
  return <span className="font-mono text-xs tabular-nums text-muted">renders: {count}</span>;
}
```

`src/features/nav/SectionProgress.tsx`:

```tsx
import { createContext, use, useMemo, useState } from 'react';
import { SECTION_IDS, type SectionId } from '@/content/sections';
import { useActiveSection } from './useActiveSection';

type SectionProgress = { active: SectionId; visited: ReadonlySet<SectionId> };

const SectionProgressContext = createContext<SectionProgress | null>(null);

export function SectionProgressProvider({ children }: { children: React.ReactNode }) {
  const active = useActiveSection(SECTION_IDS) as SectionId;
  const [visited, setVisited] = useState<ReadonlySet<SectionId>>(() => new Set([active]));
  // Adjust state during render when a new section becomes active (React's documented pattern).
  if (!visited.has(active)) setVisited(new Set(visited).add(active));
  const value = useMemo(() => ({ active, visited }), [active, visited]);
  return <SectionProgressContext value={value}>{children}</SectionProgressContext>;
}

export function useSectionProgress(): SectionProgress {
  const value = use(SectionProgressContext);
  if (!value) throw new Error('useSectionProgress must be used inside <SectionProgressProvider>');
  return value;
}
```

`src/features/nav/Nav.tsx`:

```tsx
import { SECTION_IDS, type SectionId } from '@/content/sections';
import { profile } from '@/content/profile';
import { RenderCounterBadge } from '@/features/render-counter/RenderCounter';
import { ViewSourceToggle } from '@/features/view-source/ViewSource';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { useSectionProgress } from './SectionProgress';

type Variant = 'bar' | 'pill';

function RailLinks({ active, variant }: { active: SectionId; variant: Variant }) {
  const bar = variant === 'bar';
  return (
    <ol className={bar ? 'flex items-center gap-1 font-mono text-xs' : 'flex items-center gap-0.5 font-mono text-[11px]'}>
      {SECTION_IDS.map((id, i) => (
        <li key={id} className={bar ? 'flex items-center gap-1' : 'flex-1'}>
          {bar && i > 0 && (
            <span aria-hidden className="text-border">
              ·
            </span>
          )}
          <a
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
            className={
              bar
                ? 'rounded-md px-2.5 py-1.5 text-muted transition-colors hover:text-fg aria-[current=location]:bg-primary/10 aria-[current=location]:text-primary'
                : 'flex h-11 items-center justify-center rounded-full text-muted transition-colors aria-[current=location]:bg-primary/15 aria-[current=location]:text-primary'
            }
          >
            {id}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function Nav() {
  const { active } = useSectionProgress();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[78rem] items-center justify-between gap-4 px-4 md:px-8">
          <a href="#mount" className="font-mono text-sm font-bold text-fg hover:text-primary">
            {profile.wordmark}
          </a>
          <nav aria-label="Render cycle" className="hidden md:block">
            <RailLinks active={active} variant="bar" />
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <RenderCounterBadge />
            <ViewSourceToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <nav
        aria-label="Render cycle"
        className="fixed inset-x-3 bottom-4 z-50 rounded-full border border-border bg-card/90 p-1 backdrop-blur-md md:hidden"
      >
        <RailLinks active={active} variant="pill" />
      </nav>
    </>
  );
}
```

In `src/features/view-source/ViewSource.tsx`, change only the toggle's `className` to:
`"h-8 rounded-lg border border-border px-3 font-mono text-xs text-muted transition-colors hover:text-primary aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"`

In `src/ui/ThemeToggle.tsx`, change only the button's `className` to:
`"inline-flex size-11 items-center justify-center rounded-lg text-base text-muted transition-colors hover:text-primary focus-visible:text-primary"`

`src/ui/SectionHeader.tsx`:

```tsx
import type { SectionId } from '@/content/sections';
import { Reveal } from './Reveal';

type Props = { num: string; step: SectionId; title: string; sub?: string };

export function SectionHeader({ num, step, title, sub }: Props) {
  return (
    <Reveal className="flex flex-col gap-3">
      <p className="flex items-center gap-3 font-mono text-[13px] tracking-[0.08em] text-primary">
        <span>{num}</span>
        <span aria-hidden className="h-px w-8 bg-primary" />
        <span>{step}</span>
      </p>
      <h2 id={`${step}-title`} className="text-4xl leading-[1.05] font-bold tracking-[-0.03em] md:text-[56px]">
        {title}
      </h2>
      {sub && <p className="max-w-[640px] text-[19px] text-muted">{sub}</p>}
    </Reveal>
  );
}
```

`src/Providers.tsx`:

```tsx
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';
import { SectionProgressProvider } from '@/features/nav/SectionProgress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RenderCounterProvider>
      <ViewSourceProvider>
        <SectionProgressProvider>{children}</SectionProgressProvider>
      </ViewSourceProvider>
    </RenderCounterProvider>
  );
}
```

`src/App.tsx` (each later task replaces one section's children):

```tsx
import { profile } from '@/content/profile';
import { Nav } from '@/features/nav/Nav';
import { SmoothScroll } from '@/lib/SmoothScroll';
import { Section } from '@/ui/Section';
import { SectionHeader } from '@/ui/SectionHeader';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <SmoothScroll />
      <div aria-hidden className="dots-drift" />
      <Nav />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[78rem] px-4 pt-14 pb-24 outline-none md:px-8 md:pb-0">
        <Section id="mount" className="flex min-h-svh items-center py-16">
          <h1 id="mount-title" className="text-[64px] leading-[0.95] font-bold tracking-[-0.045em] md:text-[120px]">
            {profile.greeting}
          </h1>
        </Section>
        <Section id="write" className="py-24">
          <SectionHeader
            num="02"
            step="write"
            title="Written in TypeScript. Rendered live."
            sub="Change a prop and watch the component re-render — the counter in the nav keeps score."
          />
        </Section>
        <Section id="tree" className="py-24">
          <SectionHeader num="03" step="tree" title="One component tree." />
        </Section>
        <Section id="props" className="py-24">
          <SectionHeader
            num="04"
            step="props"
            title="Things I've shipped."
            sub="Each project is a component. Inspect one to see its tree, its props and the decisions behind it."
          />
        </Section>
        <Section id="commit" className="py-24">
          <SectionHeader
            num="05"
            step="commit"
            title="Let's build something."
            sub="Commit a message straight to my inbox. Or skip the terminal and find me below."
          />
        </Section>
      </main>
    </Providers>
  );
}
```

In `eslint.config.js`, extend `allowExportNames` to `['useRenderCount', 'useViewSource', 'useBump', 'useSectionProgress']`.

- [ ] **Step 4: Confirm the unit tests pass**

Run: `pnpm test`
Expected: all pass, including `src/App.test.tsx` (the h1 is unchanged).

- [ ] **Step 5: Write the shell e2e spec**

`tests/e2e/shell.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test('the first Tab reaches a skip link that jumps to the main content', async ({ page, isMobile, browserName }) => {
  test.skip(isMobile || browserName === 'webkit', 'keyboard flow; WebKit only tabs to links with Option+Tab');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('mobile shows a bottom pill rail that tracks the section in view', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only rail');
  await page.goto('/');
  const rail = page.getByRole('navigation', { name: 'Render cycle' });
  await expect(rail).toBeVisible();
  await rail.getByRole('link', { name: 'commit' }).click();
  await expect(rail.getByRole('link', { name: 'commit' })).toHaveAttribute('aria-current', 'location');
});

test('section headers reveal as they scroll into view', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('#props [data-reveal]').first();
  await expect(header).not.toHaveAttribute('data-shown');
  await page.locator('#props').scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute('data-shown', '');
});
```

- [ ] **Step 6: Run the e2e suite and commit**

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass (the existing navigation, a11y and ditl specs plus shell). If axe flags anything new (for example the pill bar's contrast), fix the markup or tokens, never the rule.

```bash
git add -A
git commit -m "feat(shell): section progress, mobile rail, skip link, section headers, split render counter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Hero, the "mount" step

**Files:**
- Create: `src/features/hero/useTypewriter.ts`, `src/features/hero/useTypewriter.test.tsx`, `src/features/hero/TagTokens.tsx`, `src/features/hero/RenderLog.tsx`, `src/features/hero/RenderLog.test.tsx`, `src/features/hero/Hero.tsx`, `src/features/hero/Hero.test.tsx`, `tests/e2e/hero.spec.ts`
- Modify: `src/content/types.ts` (Profile), `src/content/profile.ts`, `src/content/sections.ts` (`SECTION_COMPONENTS`), `src/content/content.test.ts`, `src/styles.css` (hero mount rules), `src/App.tsx` (mount section)

**Interfaces:**
- Consumes: `usePrefersReducedMotion` (Task 1), `useBump` and `useSectionProgress` (Task 2), `profile`
- Produces:
  - `Profile.subline: { lead: string; emphasis: string }` and `Profile.badges: string[]`
  - `SECTION_COMPONENTS: Record<SectionId, string>`
  - `useTypewriter(text: string, opts?: { cps?: number; enabled?: boolean }): { output: string; done: boolean }`
  - `HERO_TAG_SEGMENTS: readonly (readonly [text: string, className: string])[]`, `HERO_TAG: string`, and `<TagTokens text />`
  - `<RenderLog />` and `<Hero />` (the root is `[data-hero]`, which gains `data-mounted` when the tag finishes typing)

- [ ] **Step 1: Content changes, test first**

In `src/content/content.test.ts`:
- Add `SECTION_COMPONENTS` to the `./sections` import.
- Replace the `profile` describe block with:

```ts
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
```

- Add to the `sections` describe block:

```ts
  it('names a component for every step', () => {
    expect(SECTION_COMPONENTS).toEqual({ mount: 'Trey', write: 'TreyTsx', tree: 'Career', props: 'Projects', commit: 'Contact' });
  });
```

Run `pnpm test src/content`. Expected: FAIL.

Then:
- In `src/content/types.ts`, change the `Profile` fields `subline: string;` to `subline: { lead: string; emphasis: string };` and add `badges: string[];`.
- In `src/content/profile.ts`, replace `subline: 'I build React that feels effortless.',` with:

```ts
  subline: { lead: 'I build React that', emphasis: 'feels effortless.' },
  badges: ['Principal Engineer', 'CXO @ PixelTable', 'React · TypeScript'],
```

- Append to `src/content/sections.ts`:

```ts
/** The component each lifecycle step "renders" — shown in the hero's render log. */
export const SECTION_COMPONENTS: Record<SectionId, string> = {
  mount: 'Trey',
  write: 'TreyTsx',
  tree: 'Career',
  props: 'Projects',
  commit: 'Contact',
};
```

Run `pnpm test src/content && pnpm typecheck`. Expected: PASS. (Nothing in the app reads `profile.subline` yet.)

- [ ] **Step 2: Write the failing typewriter test**

`src/features/hero/useTypewriter.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

function Probe({ enabled = true }: { enabled?: boolean }) {
  const { output, done } = useTypewriter('abcdef', { cps: 10, enabled });
  return (
    <p>
      [{output}]{done ? ' done' : ''}
    </p>
  );
}

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('types one character per tick at the given rate', () => {
    render(<Probe />);
    expect(screen.getByText('[]')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText('[abc]')).toBeInTheDocument();
  });

  it('reports done once the whole text is typed, and stops', () => {
    render(<Probe />);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
  });

  it('shows the full text immediately when disabled', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByText('[abcdef] done')).toBeInTheDocument();
  });
});
```

Run: `pnpm test src/features/hero`. Expected: FAIL (the import is unresolved).

- [ ] **Step 3: Implement `useTypewriter`**

`src/features/hero/useTypewriter.ts`:

```ts
import { useEffect, useState } from 'react';

type Options = { cps?: number; enabled?: boolean };

/** Types `text` out at `cps` characters per second. Disabled → the full text immediately (reduced motion). */
export function useTypewriter(text: string, { cps = 60, enabled = true }: Options = {}) {
  const [typed, setTyped] = useState(0);
  const count = enabled ? Math.min(typed, text.length) : text.length;
  const done = count >= text.length;

  useEffect(() => {
    if (!enabled || done) return;
    const id = window.setInterval(() => setTyped((n) => n + 1), 1000 / cps);
    return () => window.clearInterval(id);
  }, [enabled, done, cps]);

  return { output: text.slice(0, count), done };
}
```

Run: `pnpm test src/features/hero`. Expected: PASS.

- [ ] **Step 4: Write the failing RenderLog and Hero tests**

`src/features/hero/RenderLog.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RenderLog } from './RenderLog';

vi.mock('@/features/nav/SectionProgress', () => ({
  useSectionProgress: () => ({ active: 'write', visited: new Set(['mount', 'write']) }),
}));

describe('<RenderLog />', () => {
  it('lists every step with its component and marks visited ones rendered', () => {
    render(<RenderLog />);
    const log = screen.getByRole('complementary', { name: 'Render log' });
    expect(within(log).getByText('2 / 5 committed')).toBeInTheDocument();
    const rows = within(log).getAllByRole('listitem');
    expect(rows.map((r) => r.textContent)).toEqual([
      'mount<Trey />✓ rendered',
      'write<TreyTsx />✓ rendered',
      'tree<Career />pending',
      'props<Projects />pending',
      'commit<Contact />pending',
    ]);
  });
});
```

`src/features/hero/Hero.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { HERO_TAG, HERO_TAG_SEGMENTS } from './TagTokens';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { SectionProgressProvider } from '@/features/nav/SectionProgress';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

function renderHero() {
  return render(
    <RenderCounterProvider>
      <SectionProgressProvider>
        <Hero />
        <RenderCounterBadge />
      </SectionProgressProvider>
    </RenderCounterProvider>,
  );
}

describe('<Hero />', () => {
  afterEach(() => vi.useRealTimers());

  it('builds its tag from coloured segments', () => {
    expect(HERO_TAG).toBe('<Trey role="Principal Engineer" />');
    expect(HERO_TAG_SEGMENTS.map(([text]) => text).join('')).toBe(HERO_TAG);
  });

  it('renders the greeting as the page h1, the subline, badges and both CTAs', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hi, I'm Trey.");
    expect(screen.getByText('feels effortless.')).toBeInTheDocument();
    expect(screen.getByText('CXO @ PixelTable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Inspect my work/ })).toHaveAttribute('href', '#props');
    expect(screen.getByRole('link', { name: 'git commit -m "hello"' })).toHaveAttribute('href', '#commit');
  });

  it('types the tag, then mounts exactly once and bumps the render counter', () => {
    vi.useFakeTimers();
    const { container } = renderHero();
    const hero = container.querySelector('[data-hero]');
    expect(hero).not.toHaveAttribute('data-mounted');
    act(() => vi.advanceTimersByTime(5000));
    expect(hero).toHaveAttribute('data-mounted');
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
  });

  it('mounts immediately when the user prefers reduced motion', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    const { container } = renderHero();
    expect(container.querySelector('[data-hero]')).toHaveAttribute('data-mounted');
  });
});
```

Run: `pnpm test src/features/hero`. Expected: FAIL (imports unresolved).

- [ ] **Step 5: Implement TagTokens, RenderLog and Hero**

`src/features/hero/TagTokens.tsx`:

```tsx
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

/** Renders the first `text.length` characters of the hero tag, keeping syntax colours per segment. */
export function TagTokens({ text }: { text: string }) {
  let remaining = text.length;
  return (
    <span>
      {HERO_TAG_SEGMENTS.map(([segment, className], i) => {
        const shown = segment.slice(0, Math.max(0, remaining));
        remaining -= segment.length;
        return shown ? (
          <span key={i} className={className || undefined}>
            {shown}
          </span>
        ) : null;
      })}
    </span>
  );
}
```

`src/features/hero/RenderLog.tsx`:

```tsx
import { SECTION_COMPONENTS, SECTION_IDS } from '@/content/sections';
import { useSectionProgress } from '@/features/nav/SectionProgress';

export function RenderLog() {
  const { visited } = useSectionProgress();
  const committed = SECTION_IDS.filter((id) => visited.has(id)).length;

  return (
    <aside aria-label="Render log" className="rounded-2xl border border-border bg-card px-7 py-6">
      <div className="flex justify-between pb-3.5 font-mono text-xs text-muted">
        <span>render log</span>
        <span>
          {committed} / {SECTION_IDS.length} committed
        </span>
      </div>
      <ol className="font-mono text-[13px]">
        {SECTION_IDS.map((id) => {
          const done = visited.has(id);
          return (
            <li key={id} className="flex items-center gap-3.5 border-t border-border py-3">
              <span
                aria-hidden
                className={`size-2.5 shrink-0 rounded-full transition-colors duration-500 ${done ? 'bg-success' : 'border-[1.5px] border-muted'}`}
              />
              <span className={`w-16 ${done ? 'text-fg' : 'text-muted'}`}>{id}</span>
              <span className={`flex-1 ${done ? 'text-primary' : 'text-muted'}`}>&lt;{SECTION_COMPONENTS[id]} /&gt;</span>
              <span className={done ? 'text-success' : 'text-muted'}>{done ? '✓ rendered' : 'pending'}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
```

`src/features/hero/Hero.tsx`:

```tsx
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
        <h1 id="mount-title" data-hero-mount="" className="text-[64px] leading-[0.95] font-bold tracking-[-0.045em] md:text-[120px]">
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
```

Append to `src/styles.css` (hero mount: hidden until the tag finishes typing, JS only):

```css
[data-hero-mount] {
  transition:
    opacity 500ms var(--ease),
    transform 500ms var(--ease),
    filter 500ms var(--ease);
  transition-delay: var(--reveal-delay, 0ms);
}
.js [data-hero]:not([data-mounted]) [data-hero-mount] {
  opacity: 0;
  transform: scale(0.98);
  filter: blur(4px);
}
@media (prefers-reduced-motion: reduce) {
  [data-hero-mount] {
    transition: opacity 150ms linear;
    transition-delay: 0ms;
  }
  .js [data-hero]:not([data-mounted]) [data-hero-mount] {
    transform: none;
    filter: none;
  }
}
```

In `src/App.tsx`, replace the whole `<Section id="mount" …>…</Section>` block with:

```tsx
        <Section id="mount" className="flex min-h-svh items-center py-16">
          <Hero />
        </Section>
```

Add `import { Hero } from '@/features/hero/Hero';`, and remove the now-unused `profile` import.

- [ ] **Step 6: Confirm the unit tests pass**

Run: `pnpm test`
Expected: all pass (the App test's h1 now comes from Hero).

- [ ] **Step 7: The hero e2e spec**

`tests/e2e/hero.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test('the hero types its tag, mounts, and counts one render', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-hero]');
  await expect(hero).toHaveAttribute('data-mounted', '');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hi, I'm Trey.");
  await expect(page.getByRole('banner').getByText('renders: 1')).toBeVisible();
});

test('"Inspect my work" scrolls to the projects', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Inspect my work/ }).click();
  await expect(page.locator('#props')).toBeInViewport();
});

test('the render log commits each section as you reach it', async ({ page }) => {
  await page.goto('/');
  const log = page.getByRole('complementary', { name: 'Render log' });
  await expect(log.getByText('1 / 5 committed')).toBeVisible();
  await page.locator('#write').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, window.innerHeight / 3));
  await expect(log.getByText('2 / 5 committed')).toBeAttached();
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass, with no console errors (the fixture enforces this) and no hydration warnings.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(hero): typed mount tag, render log and CTAs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `Trey.tsx` IDE, the "write" step

**Files:**
- Create: `src/features/ide/treyProps.ts`, `src/features/ide/treyProps.test.ts`, `src/features/ide/treySource.ts`, `src/features/ide/treySource.test.ts`, `src/features/ide/CodeView.tsx`, `src/features/ide/PropControls.tsx`, `src/features/ide/LivePreview.tsx`, `src/features/ide/TreyEditor.tsx`, `src/features/ide/TreyEditor.test.tsx`, `src/features/ide/WriteSection.tsx`, `tests/e2e/ide.spec.ts`
- Modify: `src/styles.css` (code-line stagger and radio chip focus), `src/App.tsx` (write section)

**Interfaces:**
- Consumes: `useInViewOnce` (Task 1); `useBump` and `useRenderCount` (Task 2); `SectionHeader`; `profile`
- Produces:
  - `MOODS`, `FOCI`, `STACK_OPTIONS`, `MAX_COFFEE`, `DEFAULT_TREY`, `BLURBS`, and the types `Mood`, `Focus`, `Tech`, `TreyProps`, `TreyAction`
  - `treyReducer(state, action): TreyProps`, which returns the **same object** when the action changes nothing
  - `Token = { text: string; kind: 'kw' | 'tag' | 'prop' | 'str' | 'num' | 'punct' | 'plain' }`, `treySourceLines(props): Token[][]` and `lineText(line): string`
  - `<TreyEditor />` and `<WriteSection />`

- [ ] **Step 1: Write the failing logic tests**

`src/features/ide/treyProps.test.ts`:

```ts
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
```

`src/features/ide/treySource.test.ts`:

```ts
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
```

Run: `pnpm test src/features/ide`. Expected: FAIL (imports unresolved).

- [ ] **Step 2: Implement the logic**

`src/features/ide/treyProps.ts`:

```ts
export const MOODS = ['caffeinated', 'focused', 'shipping'] as const;
export type Mood = (typeof MOODS)[number];

export const FOCI = ['design systems', 'performance', 'developer experience', 'accessibility'] as const;
export type Focus = (typeof FOCI)[number];

export const STACK_OPTIONS = ['React', 'TypeScript', 'Node', 'Vite', 'Tailwind', 'Playwright'] as const;
export type Tech = (typeof STACK_OPTIONS)[number];

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
```

`src/features/ide/treySource.ts`:

```ts
import { MOODS, type TreyProps } from './treyProps';

export type TokenKind = 'kw' | 'tag' | 'prop' | 'str' | 'num' | 'punct' | 'plain';
export type Token = { text: string; kind: TokenKind };

const t = (text: string, kind: TokenKind = 'plain'): Token => ({ text, kind });
const str = (value: string) => t(`'${value}'`, 'str');
const list = (values: readonly string[], sep: string, sepKind: TokenKind) =>
  values.flatMap((v, i) => (i === 0 ? [str(v)] : [t(sep, sepKind), str(v)]));

/** The Trey.tsx source shown in the editor; every default reflects the live props. */
export function treySourceLines(p: TreyProps): Token[][] {
  return [
    [t('type', 'kw'), t(' '), t('Mood', 'tag'), t(' = '), ...list(MOODS, ' | ', 'punct'), t(';', 'punct')],
    [],
    [t('export function', 'kw'), t(' '), t('Trey', 'tag'), t('({', 'punct')],
    [t('  '), t('role', 'prop'), t(' = '), str('Principal Engineer'), t(',', 'punct')],
    [t('  '), t('mood', 'prop'), t(' = '), str(p.mood), t(',', 'punct')],
    [t('  '), t('focus', 'prop'), t(' = '), str(p.focus), t(',', 'punct')],
    [t('  '), t('coffee', 'prop'), t(' = '), t(String(p.coffee), 'num'), t(',', 'punct')],
    [t('  '), t('stack', 'prop'), t(' = '), t('[', 'punct'), ...list(p.stack, ', ', 'punct'), t('],', 'punct')],
    [t('}: ', 'punct'), t('TreyProps', 'tag'), t(') {', 'punct')],
    [t('  '), t('return', 'kw'), t(' '), t('<Engineer', 'tag'), t(' {...', 'punct'), t('props', 'prop'), t('}', 'punct'), t(' />', 'tag'), t(';', 'punct')],
    [t('}', 'punct')],
  ];
}

export const lineText = (line: readonly Token[]) => line.map((token) => token.text).join('');
```

Run: `pnpm test src/features/ide`. Expected: PASS.

- [ ] **Step 3: Write the failing editor test**

`src/features/ide/TreyEditor.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreyEditor } from './TreyEditor';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';

function renderEditor() {
  return render(
    <RenderCounterProvider>
      <TreyEditor />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

const code = () => screen.getByLabelText('Trey.tsx source');

describe('<TreyEditor />', () => {
  it('shows the full source immediately (prerender/no-JS friendly)', () => {
    renderEditor();
    expect(code()).toHaveTextContent("mood = 'caffeinated',");
    expect(code()).toHaveTextContent('coffee = 3,');
  });

  it('re-renders code and preview when a prop changes, counting one render per change', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('radio', { name: 'focused' }));
    expect(code()).toHaveTextContent("mood = 'focused',");
    const preview = screen.getByRole('region', { name: 'Preview' });
    expect(within(preview).getByText('focused')).toBeInTheDocument();
    expect(within(preview).getByText(/Headphones on/)).toBeInTheDocument();
    expect(screen.getByText('renders: 1')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('focus'), 'performance');
    expect(code()).toHaveTextContent("focus = 'performance',");
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });

  it('steps coffee within bounds and disables the buttons at the limits', async () => {
    renderEditor();
    const more = screen.getByRole('button', { name: 'More coffee' });
    await userEvent.click(more);
    await userEvent.click(more);
    expect(code()).toHaveTextContent('coffee = 5,');
    expect(more).toBeDisabled();
    expect(screen.getByRole('img', { name: '5 of 5 cups' })).toBeInTheDocument();
  });

  it('toggles stack chips but never removes the last one (and does not count a no-op)', async () => {
    renderEditor();
    await userEvent.click(screen.getByRole('button', { name: 'TypeScript' }));
    await userEvent.click(screen.getByRole('button', { name: 'Node' }));
    expect(code()).toHaveTextContent("stack = ['React'],");
    const react = screen.getByRole('button', { name: 'React' });
    await userEvent.click(react);
    expect(react).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });
});
```

Run: `pnpm test src/features/ide/TreyEditor.test.tsx`. Expected: FAIL.

- [ ] **Step 4: Implement the editor components**

`src/features/ide/CodeView.tsx`:

```tsx
import type { CSSProperties } from 'react';
import { useInViewOnce } from '@/lib/useInViewOnce';
import type { Token } from './treySource';

/** Lines stagger in the first time the editor is seen (CSS, JS-only); the full code is always in the DOM. */
export function CodeView({ lines }: { lines: readonly (readonly Token[])[] }) {
  const [ref, seen] = useInViewOnce<HTMLPreElement>(0.3);
  return (
    <pre
      ref={ref}
      aria-label="Trey.tsx source"
      data-typed={seen ? '' : undefined}
      className="code-view overflow-x-auto bg-bg px-5 py-6 font-mono text-[13px] leading-[26px] text-fg md:text-sm"
    >
      <code>
        {lines.map((line, i) => (
          <span key={i} className="code-line flex gap-5" style={{ '--i': i } as CSSProperties}>
            <span aria-hidden className="w-6 shrink-0 text-right text-muted select-none">
              {i + 1}
            </span>
            <span className="whitespace-pre">
              {line.map((token, j) => (
                <span key={j} className={token.kind === 'plain' ? undefined : `tok-${token.kind}`}>
                  {token.text}
                </span>
              ))}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
```

`src/features/ide/PropControls.tsx`:

```tsx
import { useId } from 'react';
import { FOCI, MAX_COFFEE, MOODS, STACK_OPTIONS, type Focus, type TreyAction, type TreyProps } from './treyProps';

type Props = { value: TreyProps; onChange: (action: TreyAction) => void };

const chip =
  'inline-flex h-9 items-center rounded-lg border px-3 font-mono text-xs transition-colors cursor-pointer';
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
          className="h-9 rounded-lg border border-border bg-bg px-2 font-mono text-xs text-fg"
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
          className="h-9 w-11 rounded-lg border border-border font-mono text-fg disabled:opacity-40"
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
          className="h-9 w-11 rounded-lg border border-border font-mono text-fg disabled:opacity-40"
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
```

`src/features/ide/LivePreview.tsx`:

```tsx
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
              <dd role="img" aria-label={`${value.coffee} of ${MAX_COFFEE} cups`} className="flex gap-1.5">
                {Array.from({ length: MAX_COFFEE }, (_, i) => (
                  <span
                    key={i}
                    className={`h-[18px] w-3.5 rounded-t-[3px] rounded-b-md transition-colors duration-300 ${i < value.coffee ? 'bg-accent' : 'border-[1.5px] border-border'}`}
                  />
                ))}
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
```

`src/features/ide/TreyEditor.tsx`:

```tsx
import { useState } from 'react';
import { useBump } from '@/features/render-counter/RenderCounter';
import { CodeView } from './CodeView';
import { LivePreview } from './LivePreview';
import { PropControls } from './PropControls';
import { DEFAULT_TREY, treyReducer, type TreyAction } from './treyProps';
import { treySourceLines } from './treySource';

export function TreyEditor() {
  const [props, setProps] = useState(DEFAULT_TREY);
  const bump = useBump();

  function update(action: TreyAction) {
    const next = treyReducer(props, action);
    if (next === props) return;
    setProps(next);
    bump();
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[7fr_5fr]">
      <div className="flex min-w-0 flex-col border-border lg:border-r">
        <div className="flex h-11 items-end gap-0.5 border-b border-border px-3 font-mono text-xs">
          <span className="rounded-t-lg border border-b-0 border-border bg-bg px-3.5 py-2.5 text-fg">Trey.tsx</span>
          <span className="px-3.5 py-2.5 text-muted">engineer.types.ts</span>
        </div>
        <CodeView lines={treySourceLines(props)} />
        <PropControls value={props} onChange={update} />
      </div>
      <LivePreview value={props} />
    </div>
  );
}
```

`src/features/ide/WriteSection.tsx`:

```tsx
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { TreyEditor } from './TreyEditor';

export function WriteSection() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        num="02"
        step="write"
        title="Written in TypeScript. Rendered live."
        sub="Change a prop and watch the component re-render — the counter in the nav keeps score."
      />
      <Reveal delay={120}>
        <TreyEditor />
      </Reveal>
    </div>
  );
}
```

Append to `src/styles.css`:

```css
/* IDE: code lines stagger in the first time the editor is seen (JS only). */
.code-line {
  transition:
    opacity 300ms var(--ease),
    transform 300ms var(--ease);
  transition-delay: calc(var(--i, 0) * 55ms);
}
.js .code-view:not([data-typed]) .code-line {
  opacity: 0;
  transform: translateX(-6px);
}
.radio-chip:has(input:focus-visible) > span {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .code-line {
    transition: opacity 150ms linear;
    transition-delay: 0ms;
  }
  .js .code-view:not([data-typed]) .code-line {
    transform: none;
  }
}
```

In `src/App.tsx`, replace the write section's children (the `SectionHeader`) with `<WriteSection />` and add `import { WriteSection } from '@/features/ide/WriteSection';`.

- [ ] **Step 5: Confirm the unit tests pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 6: The IDE e2e spec**

`tests/e2e/ide.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/#write');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
});

test('editing props re-renders the code, the preview and the nav counter', async ({ page }) => {
  const code = page.getByLabel('Trey.tsx source');
  await page.locator('label.radio-chip', { hasText: 'shipping' }).click();
  await expect(code).toContainText("mood = 'shipping',");
  await expect(page.getByRole('region', { name: 'Preview' })).toContainText('Green checks everywhere');
  await expect(page.getByRole('banner').getByText('renders: 2')).toBeVisible();
});

test('the coffee stepper is keyboard operable', async ({ page }) => {
  const more = page.getByRole('button', { name: 'More coffee' });
  await more.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Trey.tsx source')).toContainText('coffee = 5,');
  await expect(more).toBeDisabled();
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ide): live Trey.tsx editor with typed props, code view and preview

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Career tree, the pinned "tree" step

**Files:**
- Create: `src/features/career-tree/careerProgress.ts`, `src/features/career-tree/careerProgress.test.ts`, `src/features/career-tree/useCareerProgress.ts`, `src/features/career-tree/useCareerProgress.test.tsx`, `src/features/career-tree/TreeNode.tsx`, `src/features/career-tree/EarlyCareerNode.tsx`, `src/features/career-tree/CareerTree.tsx`, `src/features/career-tree/CareerTree.test.tsx`, `tests/e2e/tree.spec.ts`
- Create: `src/env.d.ts`
- Modify: `vite.config.ts` and `vitest.config.ts` (`define: __BUILD_YEAR__`), `src/styles.css` (pin rules), `src/App.tsx` (tree section)

**Interfaces:**
- Consumes: `experience` and `Experience` (the content, including `era`); `usePrefersReducedMotion` and `useHydrated` (Task 1); `SectionHeader`
- Produces:
  - `mountedCount(progress: number, total: number): number`, where 0 → 1, 1 → total, clamped
  - `careerYears(roles: readonly Pick<Experience, 'start'>[], currentYear: number): number`
  - `formatMonth('2023-08') → 'Aug 2023'` and `formatRange(start, end | null) → 'Aug 2023 – present'`
  - `useCareerProgress(ref, total, enabled): number` (the number of mounted nodes; `total` when disabled)
  - `<CareerTree />`, whose root is `.career-pin` and holds the sticky `.career-sticky`
  - `__BUILD_YEAR__: number`, a compile-time constant. Use it instead of `new Date()` in render so prerender and hydration always agree; the footer uses it too.

**Behaviour:**
- **When scroll-driven** (hydrated and no reduced-motion preference):
  - The section is pinned (`300svh` tall with a sticky inner area), and nodes mount one by one as the visitor scrolls.
  - Only the newest mounted node shows its highlights, which keeps the pinned area short enough to fit any laptop.
  - `<EarlyCareer>` mounts last.
- **Otherwise** (prerender, no JS, or reduced motion):
  - Nothing is pinned, and every node is mounted and expanded.
  - `<EarlyCareer>` is a native `<details>`, collapsed by default, which works without JS.

- [ ] **Step 1: Write the failing logic tests**

`src/features/career-tree/careerProgress.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { careerYears, formatMonth, formatRange, mountedCount } from './careerProgress';
import { experience } from '@/content/experience';

describe('mountedCount', () => {
  it('mounts the first node at the top and every node at the end', () => {
    expect(mountedCount(0, 6)).toBe(1);
    expect(mountedCount(0.5, 6)).toBe(3);
    expect(mountedCount(0.51, 6)).toBe(4);
    expect(mountedCount(1, 6)).toBe(6);
  });

  it('clamps out-of-range progress and handles an empty tree', () => {
    expect(mountedCount(-0.2, 6)).toBe(1);
    expect(mountedCount(1.4, 6)).toBe(6);
    expect(mountedCount(0.5, 0)).toBe(0);
  });
});

describe('careerYears', () => {
  it('counts whole years since the earliest role (May 2006 → 20 in 2026)', () => {
    expect(careerYears(experience, 2026)).toBe(20);
  });
});

describe('formatRange', () => {
  it('formats months and open-ended roles', () => {
    expect(formatMonth('2023-08')).toBe('Aug 2023');
    expect(formatRange('2023-08', null)).toBe('Aug 2023 – present');
    expect(formatRange('2017-06', '2021-06')).toBe('Jun 2017 – Jun 2021');
  });
});
```

`src/features/career-tree/useCareerProgress.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useCareerProgress } from './useCareerProgress';

const scroll = vi.hoisted(() => ({ handler: (_p: number) => {} }));
vi.mock('motion/react', () => ({
  useScroll: () => ({ scrollYProgress: {} }),
  useMotionValueEvent: (_value: unknown, _event: string, handler: (p: number) => void) => {
    scroll.handler = handler;
  },
}));

function Probe({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useCareerProgress(ref, 6, enabled);
  return <div ref={ref}>mounted {mounted}</div>;
}

describe('useCareerProgress', () => {
  it('maps scroll progress to mounted nodes when enabled', () => {
    render(<Probe enabled />);
    expect(screen.getByText('mounted 1')).toBeInTheDocument();
    act(() => scroll.handler(0.5));
    expect(screen.getByText('mounted 3')).toBeInTheDocument();
  });

  it('mounts everything when disabled (reduced motion / prerender)', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByText('mounted 6')).toBeInTheDocument();
  });
});
```

Run: `pnpm test src/features/career-tree`. Expected: FAIL.

- [ ] **Step 2: Implement the logic**

Add a build-time year so render never reads the clock.
- In both `vite.config.ts` (inside the returned config object) and `vitest.config.ts` (top level), add `define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },`.
- Create `src/env.d.ts`:

```ts
/** Year the site was built; injected by Vite `define`. */
declare const __BUILD_YEAR__: number;
```

`src/features/career-tree/careerProgress.ts`:

```ts
import type { Experience } from '@/content/types';

/** Scroll progress (0–1) → how many tree nodes are mounted. The first node is always mounted. */
export function mountedCount(progress: number, total: number): number {
  if (total <= 0) return 0;
  const p = Math.min(1, Math.max(0, progress));
  return Math.min(total, Math.max(1, Math.ceil(p * total)));
}

export function careerYears(roles: readonly Pick<Experience, 'start'>[], currentYear: number): number {
  const first = Math.min(...roles.map((role) => Number(role.start.slice(0, 4))));
  return currentYear - first;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'present'}`;
}
```

`src/features/career-tree/useCareerProgress.ts`:

```ts
import { useState, type RefObject } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { mountedCount } from './careerProgress';

/** How many career nodes are mounted, driven by scroll through the pinned section. */
export function useCareerProgress(ref: RefObject<HTMLElement | null>, total: number, enabled: boolean): number {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [mounted, setMounted] = useState(1);
  useMotionValueEvent(scrollYProgress, 'change', (progress) => setMounted(mountedCount(progress, total)));
  return enabled ? mounted : total;
}
```

Run: `pnpm test src/features/career-tree`. Expected: PASS.

- [ ] **Step 3: Write the failing component test**

`src/features/career-tree/CareerTree.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CareerTree } from './CareerTree';
import { REDUCED_MOTION_QUERY } from '@/lib/usePrefersReducedMotion';
import { mockMatchMedia } from '@/test/matchMedia';

const nodes = () => screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-state'));

describe('<CareerTree />', () => {
  it('headlines the career length and opens <Career>', () => {
    render(<CareerTree />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/^\d+ years, one component tree\.$/);
    expect(screen.getByText(/<Career/)).toBeInTheDocument();
  });

  it('when scroll-driven, mounts only the first role and expands only the newest one', () => {
    render(<CareerTree />);
    const [first, second] = nodes();
    expect(first).toHaveAttribute('data-state', 'mounted');
    expect(second).toHaveAttribute('data-state', 'pending');
    expect(within(first!).getByText(/Daggerheart Card Creator/)).toBeVisible();
    expect(within(second!).queryByRole('list')).not.toBeInTheDocument();
  });

  it('under reduced motion, mounts and expands every role', () => {
    mockMatchMedia([REDUCED_MOTION_QUERY]);
    render(<CareerTree />);
    for (const node of nodes()) expect(node).toHaveAttribute('data-state', 'mounted');
    expect(screen.getByText(/Owned technical breakdowns/)).toBeInTheDocument();
  });

  it('keeps the six early roles in a collapsible <EarlyCareer> node', async () => {
    render(<CareerTree />);
    const summary = screen.getByText(/<EarlyCareer/).closest('summary')!;
    const details = summary.closest('details')!;
    expect(details).not.toHaveAttribute('open');
    await userEvent.click(summary);
    expect(details).toHaveAttribute('open');
    expect(within(details).getByText('Firesquire.com')).toBeInTheDocument();
    expect(within(details).getByText('May 2006 – Jan 2009')).toBeInTheDocument();
  });
});
```

Run: `pnpm test src/features/career-tree/CareerTree.test.tsx`. Expected: FAIL.

- [ ] **Step 4: Implement the components**

`src/features/career-tree/TreeNode.tsx`:

```tsx
import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';

type Props = { role: Experience; mounted: boolean; expanded: boolean; newest: boolean };

export function TreeNode({ role, mounted, expanded, newest }: Props) {
  const showChildren = mounted && expanded && role.highlights.length > 0;
  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className="relative pl-10">
      <span
        aria-hidden
        className={`absolute top-[22px] left-0 h-px w-8 origin-left transition-transform duration-500 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <article
        className={`rounded-xl border bg-card px-5 py-3 transition-opacity duration-500 ${newest ? 'border-primary' : 'border-border'} ${mounted ? 'opacity-100' : 'opacity-40'}`}
      >
        <h3 className="font-mono text-[13px] leading-relaxed font-normal md:text-[15px]">
          <span className="tok-tag">&lt;{role.component}</span> <span className="tok-prop">role</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{role.role}&quot;</span>{' '}
          <span className="tok-prop">at</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{role.company}&quot;</span>
          <span className="tok-tag">{showChildren ? '>' : ' />'}</span>
        </h3>
        <p className="font-mono text-xs text-muted">{formatRange(role.start, role.end)}</p>
        {showChildren && (
          <>
            <ul className="mount-in mt-3 mb-2 ml-6 flex flex-col gap-2 text-[15px] md:text-base">
              {role.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span aria-hidden className="font-mono text-success">
                    ✓
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <p aria-hidden className="font-mono text-[13px] md:text-[15px]">
              <span className="tok-tag">&lt;/{role.component}&gt;</span>
            </p>
          </>
        )}
      </article>
    </li>
  );
}
```

`src/features/career-tree/EarlyCareerNode.tsx`:

```tsx
import type { Experience } from '@/content/types';
import { formatRange } from './careerProgress';

type Props = { roles: readonly Experience[]; mounted: boolean };

export function EarlyCareerNode({ roles, mounted }: Props) {
  const from = roles.at(-1)?.start.slice(0, 4);
  const to = roles[0]?.end?.slice(0, 4);
  return (
    <li data-state={mounted ? 'mounted' : 'pending'} className="relative pl-10">
      <span
        aria-hidden
        className={`absolute top-[22px] left-0 h-px w-8 origin-left transition-transform duration-500 ${mounted ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-border'}`}
      />
      <details
        className={`group rounded-xl border border-dashed border-border bg-card px-5 py-3 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-40'}`}
      >
        <summary className="cursor-pointer list-none font-mono text-[13px] leading-relaxed md:text-[15px] [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="inline-block text-muted transition-transform duration-300 group-open:rotate-90">
            ▸
          </span>{' '}
          <span className="tok-tag">&lt;EarlyCareer</span> <span className="tok-prop">from</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{from}&quot;</span> <span className="tok-prop">to</span>
          <span className="tok-punct">=</span>
          <span className="tok-str">&quot;{to}&quot;</span> <span className="tok-prop">roles</span>
          <span className="tok-punct">={'{'}</span>
          <span className="tok-num">{roles.length}</span>
          <span className="tok-punct">{'}'}</span>
          <span className="tok-tag"> /&gt;</span>
          <span className="mt-2 flex flex-wrap gap-1.5 group-open:hidden">
            {roles.map((role) => (
              <span key={role.component} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted">
                &lt;{role.component} /&gt;
              </span>
            ))}
          </span>
        </summary>
        <ol className="mount-in mt-4 flex flex-col gap-4">
          {roles.map((role) => (
            <li key={role.component} className="border-l border-border pl-4">
              <p className="font-semibold">{role.company}</p>
              <p className="text-sm text-muted">
                {role.role} · <span className="font-mono text-xs">{formatRange(role.start, role.end)}</span>
              </p>
              <ul className="mt-1.5 flex flex-col gap-1 text-[15px]">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}
```

`src/features/career-tree/CareerTree.tsx`:

```tsx
import { useRef } from 'react';
import { experience } from '@/content/experience';
import { useHydrated } from '@/lib/useHydrated';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { SectionHeader } from '@/ui/SectionHeader';
import { careerYears } from './careerProgress';
import { EarlyCareerNode } from './EarlyCareerNode';
import { TreeNode } from './TreeNode';
import { useCareerProgress } from './useCareerProgress';

const recent = experience.filter((role) => role.era === 'recent');
const early = experience.filter((role) => role.era === 'early');
const TOTAL = recent.length + 1;

export function CareerTree() {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const scrollDriven = hydrated && !reduced;
  const mounted = useCareerProgress(ref, TOTAL, scrollDriven);
  const years = careerYears(experience, __BUILD_YEAR__);

  return (
    <div ref={ref} className="career-pin">
      <div className="career-sticky grid gap-12 py-24 lg:grid-cols-[4fr_8fr] lg:gap-16">
        <div className="flex flex-col justify-between gap-8">
          <SectionHeader
            num="03"
            step="tree"
            title={`${years} years, one component tree.`}
            sub="Every role is a component. Scroll and the tree mounts itself, node by node."
          />
          <div aria-hidden className="hidden flex-col gap-2.5 font-mono text-xs text-muted lg:flex">
            <span>
              {scrollDriven ? 'pinned · ' : ''}mounted {mounted} / {TOTAL}
            </span>
            <div className="h-1 rounded-full bg-border">
              <div
                className="h-1 origin-left rounded-full bg-primary transition-transform duration-500"
                style={{ transform: `scaleX(${mounted / TOTAL})` }}
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3.5">
          <p className="font-mono text-[13px] md:text-[15px]">
            <span className="tok-tag">&lt;Career</span> <span className="tok-prop">years</span>
            <span className="tok-punct">={'{'}</span>
            <span className="tok-num">{years}</span>
            <span className="tok-punct">{'}'}</span>
            <span className="tok-tag">&gt;</span>
          </p>
          <ol className="ml-3 flex flex-col gap-3.5 border-l border-primary">
            {recent.map((role, i) => (
              <TreeNode
                key={role.component}
                role={role}
                mounted={i < mounted}
                expanded={!scrollDriven || i === mounted - 1}
                newest={scrollDriven && i === mounted - 1}
              />
            ))}
            <EarlyCareerNode roles={early} mounted={mounted === TOTAL} />
          </ol>
          <p className="font-mono text-[13px] md:text-[15px]">
            <span className="tok-tag">&lt;/Career&gt;</span>
          </p>
        </div>
      </div>
    </div>
  );
}
```

Append to `src/styles.css` (pinning is decided in CSS before first paint, so hydration causes no layout shift):

```css
/* Career tree: pinned, scroll-driven when JS runs and motion is allowed. */
.js .career-pin {
  height: 300svh;
}
.js .career-sticky {
  position: sticky;
  top: 3.5rem;
  min-height: calc(100svh - 3.5rem);
}
@media (prefers-reduced-motion: reduce) {
  .js .career-pin {
    height: auto;
  }
  .js .career-sticky {
    position: static;
    min-height: 0;
  }
}
```

In `src/App.tsx`, replace the tree section with `<Section id="tree"><CareerTree /></Section>`: no `className`, because the sticky area carries the padding. Add `import { CareerTree } from '@/features/career-tree/CareerTree';`.

- [ ] **Step 5: Confirm the unit tests pass**

Run: `pnpm test`
Expected: PASS. In jsdom the hydrated client render is scroll-driven, and motion's `useScroll` reports no progress, so one node is mounted.

- [ ] **Step 6: The tree e2e spec**

`tests/e2e/tree.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test('the career tree pins and mounts its nodes as you scroll through it', async ({ page }) => {
  await page.goto('/');
  const tree = page.locator('#tree');
  const mounted = tree.locator('[data-state="mounted"]');
  await tree.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.getElementById('tree')!.offsetTop));
  await expect(mounted).toHaveCount(1);
  const height = await tree.evaluate((el) => el.getBoundingClientRect().height);
  await page.evaluate((h) => window.scrollBy(0, h * 0.55), height);
  await expect.poll(() => mounted.count()).toBeGreaterThanOrEqual(3);
  await expect(tree.locator('.career-sticky')).toBeInViewport();
});

test('the early career subtree expands on click', async ({ page }) => {
  await page.goto('/#tree');
  const summary = page.locator('#tree summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await expect(page.getByText('Dynamic Page Solutions')).toBeVisible();
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass. The earlier specs still pass, and deep links to `#props`/`#commit` still land (the section is taller, but anchors follow the element).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(tree): pinned, scroll-mounted career tree with collapsible early career

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Projects and the DevTools Inspector, the "props" step

**Files:**
- Create: `src/features/projects/schematic.ts`, `src/features/projects/treeNav.ts`, `src/features/projects/treeNav.test.ts`, `src/features/projects/inspectorKeys.ts`, `src/features/projects/ProjectShot.tsx`, `src/features/projects/ProjectCard.tsx`, `src/features/projects/ComponentTree.tsx`, `src/features/projects/ComponentTree.test.tsx`, `src/features/projects/PropsPane.tsx`, `src/features/projects/PropsPane.test.tsx`, `src/features/projects/HighlightOverlay.tsx`, `src/features/projects/InspectorPanel.tsx`, `src/features/projects/InspectorPanel.test.tsx`, `src/features/projects/lazyInspector.ts`, `src/features/projects/Projects.tsx`, `src/features/projects/Projects.test.tsx`, `tests/e2e/projects.spec.ts`
- Modify: `src/content/types.ts` (optional screenshot src), `src/content/projects.ts` (drop the missing `src`s), `src/styles.css` (inspector dialog), `src/App.tsx` (props section)

**Interfaces:**
- Consumes: `projects`, `Project`, `ProjectNodeKey`, `PROJECT_NODE_KEYS` and `Highlight` (content); `useBump` (Task 2); `Reveal` and `SectionHeader`
- Produces:
  - `Project.screenshot: { alt: string; src?: string }`. With no `src`, a schematic placeholder is drawn.
  - `SCHEMATIC_BLOCKS: readonly Highlight[]` and `SCHEMATIC_HIGHLIGHTS: Record<ProjectNodeKey, Highlight>`
  - `InspectorKey = 'root' | ProjectNodeKey`, `INSPECTOR_KEYS`, and `nodeLabel(key: ProjectNodeKey): string` (`'myRole' → 'MyRole'`)
  - `TreeState = { expanded: boolean; focus: number }` and `treeKey(state, key: string, childCount: number): TreeState`
  - `<ComponentTree project selected onSelect />`, `<PropsPane project selected onSelect />`, `<HighlightOverlay highlight? label />`, `<ProjectShot project />` and `<ProjectCard project onInspect(opener) />`
  - `<InspectorPanel project opener onClose />`, a lazy chunk exported through `lazyInspector.ts` (`InspectorPanel`, `preloadInspector()`)
  - `<Projects />`

**Behaviour:**
- **Opening:** ⌘ Inspect bumps the render counter and lazy-loads the panel. It opens with `showModal()` as a native modal `<dialog>`, which gives focus trapping, Esc and a backdrop for free. Focus goes to the tree's selected item.
- **Closing:** Esc, or the "Esc ✕" button, closes the panel and returns focus to the Inspect button that opened it.
- **Scrolling:** the page behind the panel doesn't scroll while it's open. Lenis ignores the dialog (Task 1), and `html[data-inspector-open]` hides overflow.
- **Tree:** follows the WAI-ARIA tree pattern.
  - ↑/↓ move between items; Home/End jump to the first and last.
  - → expands the root, or moves to its first child.
  - ← moves to the parent, or collapses the root.
  - Enter or Space selects an item.
  - Focus is a roving `tabindex`.
- **No JavaScript:** each card includes a `<noscript>` case study.

- [ ] **Step 1: Content change (screenshots become optional), test first**

In `src/content/content.test.ts`, the project shape test already checks `p.screenshot.alt.length > 10`. Add this assertion inside the same `it.each` block:

```ts
    if (p.screenshot.src) expect(p.screenshot.src).toMatch(/^\/projects\/.+\.(webp|png|jpg)$/);
```

In `src/content/types.ts`, change `screenshot: { src: string; alt: string };` to:

```ts
  /** `src` is added once a real screenshot exists in /public/projects; until then a schematic is drawn. */
  screenshot: { alt: string; src?: string };
```

In `src/content/projects.ts`, delete the four `src: '/projects/….webp', ` fragments, keeping each `alt`. Run `pnpm test src/content && pnpm typecheck`. Expected: PASS.

- [ ] **Step 2: Write the failing keyboard-model test**

`src/features/projects/treeNav.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { treeKey, type TreeState } from './treeNav';

const open: TreeState = { expanded: true, focus: 0 };

describe('treeKey (1 root + 5 children)', () => {
  it('moves down and up through visible items, clamped', () => {
    expect(treeKey(open, 'ArrowDown', 5)).toEqual({ expanded: true, focus: 1 });
    expect(treeKey({ expanded: true, focus: 5 }, 'ArrowDown', 5).focus).toBe(5);
    expect(treeKey({ expanded: true, focus: 2 }, 'ArrowUp', 5).focus).toBe(1);
    expect(treeKey(open, 'ArrowUp', 5).focus).toBe(0);
  });

  it('jumps with Home and End', () => {
    expect(treeKey({ expanded: true, focus: 3 }, 'Home', 5).focus).toBe(0);
    expect(treeKey(open, 'End', 5).focus).toBe(5);
    expect(treeKey({ expanded: false, focus: 0 }, 'End', 5).focus).toBe(0);
  });

  it('ArrowRight expands a collapsed root, then enters the first child', () => {
    const collapsed = { expanded: false, focus: 0 };
    expect(treeKey(collapsed, 'ArrowRight', 5)).toEqual({ expanded: true, focus: 0 });
    expect(treeKey(open, 'ArrowRight', 5)).toEqual({ expanded: true, focus: 1 });
  });

  it('ArrowLeft goes from a child to the root, and collapses the root', () => {
    expect(treeKey({ expanded: true, focus: 3 }, 'ArrowLeft', 5)).toEqual({ expanded: true, focus: 0 });
    expect(treeKey(open, 'ArrowLeft', 5)).toEqual({ expanded: false, focus: 0 });
  });

  it('ignores other keys (same object back)', () => {
    expect(treeKey(open, 'a', 5)).toBe(open);
  });
});
```

Run: `pnpm test src/features/projects`. Expected: FAIL.

- [ ] **Step 3: Implement the pure modules**

`src/features/projects/treeNav.ts`:

```ts
/** Focus model for a one-level tree: index 0 is the root, 1..childCount are its children. */
export type TreeState = { expanded: boolean; focus: number };

export function treeKey(state: TreeState, key: string, childCount: number): TreeState {
  const last = state.expanded ? childCount : 0;
  switch (key) {
    case 'ArrowDown':
      return { ...state, focus: Math.min(last, state.focus + 1) };
    case 'ArrowUp':
      return { ...state, focus: Math.max(0, state.focus - 1) };
    case 'Home':
      return { ...state, focus: 0 };
    case 'End':
      return { ...state, focus: last };
    case 'ArrowRight':
      if (state.focus !== 0) return state;
      return state.expanded ? { ...state, focus: 1 } : { ...state, expanded: true };
    case 'ArrowLeft':
      return state.focus === 0 ? { ...state, expanded: false } : { ...state, focus: 0 };
    default:
      return state;
  }
}
```

`src/features/projects/inspectorKeys.ts`:

```ts
import { PROJECT_NODE_KEYS, type ProjectNodeKey } from '@/content/types';

export type InspectorKey = 'root' | ProjectNodeKey;

export const INSPECTOR_KEYS: readonly InspectorKey[] = ['root', ...PROJECT_NODE_KEYS];

export const nodeLabel = (key: ProjectNodeKey) => key.charAt(0).toUpperCase() + key.slice(1);
```

`src/features/projects/schematic.ts`:

```ts
import type { Highlight, ProjectNodeKey } from '@/content/types';

const HEADER: Highlight = { x: 4, y: 6, w: 92, h: 12 };
const SIDEBAR: Highlight = { x: 4, y: 24, w: 22, h: 70 };
const CANVAS: Highlight = { x: 30, y: 24, w: 66, h: 70 };

/** Wireframe blocks drawn while a project has no real screenshot. */
export const SCHEMATIC_BLOCKS: readonly Highlight[] = [HEADER, SIDEBAR, CANVAS];

/** Which schematic region each case-study node points at when no screenshot-specific highlight exists. */
export const SCHEMATIC_HIGHLIGHTS: Record<ProjectNodeKey, Highlight> = {
  problem: { x: 4, y: 6, w: 92, h: 88 },
  myRole: HEADER,
  architecture: CANVAS,
  hardParts: SIDEBAR,
  outcome: { x: 30, y: 24, w: 66, h: 34 },
};
```

Run: `pnpm test src/features/projects`. Expected: PASS.

- [ ] **Step 4: Write the failing component tests**

`src/features/projects/ComponentTree.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ComponentTree } from './ComponentTree';
import type { InspectorKey } from './inspectorKeys';
import { projects } from '@/content/projects';

const project = projects[0]!;

function Harness({ onSelect }: { onSelect?: (k: InspectorKey) => void }) {
  const [selected, setSelected] = useState<InspectorKey>('root');
  return (
    <ComponentTree
      project={project}
      selected={selected}
      onSelect={(k) => {
        setSelected(k);
        onSelect?.(k);
      }}
    />
  );
}

describe('<ComponentTree />', () => {
  it('renders an ARIA tree rooted at the project component, expanded, with five children', () => {
    render(<Harness />);
    const tree = screen.getByRole('tree', { name: `${project.title} case study` });
    expect(tree).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    expect(items.map((i) => i.getAttribute('aria-level'))).toEqual(['1', '2', '2', '2', '2', '2']);
    expect(items[0]).toHaveAttribute('aria-expanded', 'true');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    expect(items[0]).toHaveAttribute('tabindex', '0');
    expect(items[1]).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus with arrows and selects with Enter', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    screen.getAllByRole('treeitem')[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toHaveTextContent('<Architecture />');
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('architecture');
    expect(document.activeElement).toHaveAttribute('aria-selected', 'true');
  });

  it('collapses and expands the root with Left/Right', async () => {
    render(<Harness />);
    screen.getAllByRole('treeitem')[0]!.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getAllByRole('treeitem')).toHaveLength(1);
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('treeitem')).toHaveLength(6);
  });

  it('selects on click', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await userEvent.click(screen.getByText('<Outcome />'));
    expect(onSelect).toHaveBeenLastCalledWith('outcome');
  });
});
```

`src/features/projects/PropsPane.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsPane } from './PropsPane';
import { projects } from '@/content/projects';

const project = projects[0]!;

describe('<PropsPane />', () => {
  it('shows the project props at the root and prompts to pick a node', () => {
    render(<PropsPane project={project} selected="root" onSelect={() => {}} />);
    expect(screen.getByText('stack')).toBeInTheDocument();
    expect(screen.getByText(/Select a node/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open the Card Creator/ })).toHaveAttribute('href', project.links[0]!.href);
  });

  it('shows the selected node state and steps to neighbours', async () => {
    const onSelect = vi.fn();
    render(<PropsPane project={project} selected="architecture" onSelect={onSelect} />);
    expect(screen.getByText(project.nodes.architecture.body)).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /HardParts/ }));
    expect(onSelect).toHaveBeenCalledWith('hardParts');
    await userEvent.click(screen.getByRole('button', { name: /MyRole/ }));
    expect(onSelect).toHaveBeenCalledWith('myRole');
  });
});
```

`src/features/projects/InspectorPanel.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InspectorPanel } from './InspectorPanel';
import { projects } from '@/content/projects';

const project = projects[0]!;

describe('<InspectorPanel />', () => {
  it('opens as a modal dialog labelled by the project and focuses the tree', () => {
    render(<InspectorPanel project={project} opener={null} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /inspecting/ });
    expect(dialog).toHaveAttribute('open');
    expect(document.activeElement).toHaveAttribute('role', 'treeitem');
    expect(document.documentElement).toHaveAttribute('data-inspector-open');
  });

  it('draws a schematic highlight for the selected node when there is no screenshot', async () => {
    render(<InspectorPanel project={project} opener={null} onClose={() => {}} />);
    await userEvent.click(screen.getByText('<Architecture />'));
    expect(screen.getByText('Architecture', { selector: '[data-highlight-label]' })).toBeInTheDocument();
  });

  it('closes from its button, calls onClose and returns focus to the opener', async () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    const onClose = vi.fn();
    const { unmount } = render(<InspectorPanel project={project} opener={opener} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close inspector' }));
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.activeElement).toBe(opener);
    expect(document.documentElement).not.toHaveAttribute('data-inspector-open');
    opener.remove();
  });
});
```

`src/features/projects/Projects.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Projects } from './Projects';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { projects } from '@/content/projects';

function renderProjects() {
  return render(
    <RenderCounterProvider>
      <Projects />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

describe('<Projects />', () => {
  it('renders one card per project with its component name, title and stack', () => {
    renderProjects();
    for (const p of projects) {
      expect(screen.getByRole('heading', { level: 3, name: p.title })).toBeInTheDocument();
      expect(screen.getByText(`<${p.name} />`)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /Inspect/ })).toHaveLength(projects.length);
  });

  it('opens the lazy inspector for the chosen project, counts a render, and closes it', async () => {
    renderProjects();
    await userEvent.click(screen.getByRole('button', { name: `⌘ Inspect ${projects[1]!.title}` }));
    const dialog = await screen.findByRole('dialog', { name: new RegExp(projects[1]!.name) });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close inspector' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
```

Run: `pnpm test src/features/projects`. Expected: FAIL (the components don't exist yet).

- [ ] **Step 5: Implement the components**

`src/features/projects/ProjectShot.tsx`:

```tsx
import type { Project } from '@/content/types';
import { SCHEMATIC_BLOCKS } from './schematic';

export function ProjectShot({ project }: { project: Project }) {
  const { src, alt } = project.screenshot;
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className="dots relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-dashed border-border bg-bg"
    >
      {SCHEMATIC_BLOCKS.map((b, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded bg-card"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
        />
      ))}
      <span aria-hidden className="absolute right-3 bottom-3 font-mono text-[11px] text-muted">
        [screenshot · {project.title}]
      </span>
    </div>
  );
}
```

`src/features/projects/HighlightOverlay.tsx`:

```tsx
import type { Highlight } from '@/content/types';

/** DevTools-style box over the screenshot/schematic for the selected node. */
export function HighlightOverlay({ highlight, label }: { highlight?: Highlight; label: string }) {
  if (!highlight) return null;
  return (
    <div
      aria-hidden
      className="mount-in pointer-events-none absolute rounded-sm border-2 border-primary bg-primary/10"
      style={{ left: `${highlight.x}%`, top: `${highlight.y}%`, width: `${highlight.w}%`, height: `${highlight.h}%` }}
    >
      <span
        data-highlight-label=""
        className="absolute -top-7 left-0 rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-bg"
      >
        {label}
      </span>
    </div>
  );
}
```

`src/features/projects/ComponentTree.tsx`:

```tsx
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { PROJECT_NODE_KEYS, type Project } from '@/content/types';
import { INSPECTOR_KEYS, nodeLabel, type InspectorKey } from './inspectorKeys';
import { treeKey, type TreeState } from './treeNav';

type Props = { project: Project; selected: InspectorKey; onSelect: (key: InspectorKey) => void };

const itemClass = (selected: boolean) =>
  `flex h-8 cursor-pointer items-center rounded-md font-mono text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-primary ${
    selected ? 'bg-primary/15 text-fg' : 'text-muted hover:text-fg'
  }`;

export function ComponentTree({ project, selected, onSelect }: Props) {
  const [state, setState] = useState<TreeState>({ expanded: true, focus: INSPECTOR_KEYS.indexOf(selected) });
  const items = useRef<(HTMLElement | null)[]>([]);
  const userMoved = useRef(false);

  useEffect(() => {
    if (userMoved.current) items.current[state.focus]?.focus();
  }, [state.focus, state.expanded]);

  function onKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const key = INSPECTOR_KEYS[state.focus];
      if (key) onSelect(key);
      return;
    }
    const next = treeKey(state, e.key, PROJECT_NODE_KEYS.length);
    if (next === state) return;
    e.preventDefault();
    userMoved.current = true;
    setState(next);
  }

  function choose(index: number) {
    const key = INSPECTOR_KEYS[index];
    if (!key) return;
    userMoved.current = true;
    setState((s) => ({ ...s, focus: index }));
    onSelect(key);
  }

  return (
    <ul role="tree" aria-label={`${project.title} case study`} onKeyDown={onKeyDown} className="flex flex-col gap-0.5">
      <li
        role="treeitem"
        aria-level={1}
        aria-expanded={state.expanded}
        aria-selected={selected === 'root'}
        tabIndex={state.focus === 0 ? 0 : -1}
        ref={(el) => {
          items.current[0] = el;
        }}
        onClick={() => choose(0)}
      >
        <span className={`${itemClass(selected === 'root')} pl-3`}>
          <span aria-hidden className="mr-1.5 text-muted">
            {state.expanded ? '▾' : '▸'}
          </span>
          <span className="tok-tag">&lt;{project.name}&gt;</span>
        </span>
        {state.expanded && (
          <ul role="group" className="mt-0.5 flex flex-col gap-0.5">
            {PROJECT_NODE_KEYS.map((key, i) => (
              <li
                key={key}
                role="treeitem"
                aria-level={2}
                aria-selected={selected === key}
                tabIndex={state.focus === i + 1 ? 0 : -1}
                ref={(el) => {
                  items.current[i + 1] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  choose(i + 1);
                }}
                className={`${itemClass(selected === key)} pl-8`}
              >
                <span className="tok-tag">&lt;{nodeLabel(key)} /&gt;</span>
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
}
```

`src/features/projects/PropsPane.tsx`:

```tsx
import type { Project } from '@/content/types';
import { INSPECTOR_KEYS, nodeLabel, type InspectorKey } from './inspectorKeys';

type Props = { project: Project; selected: InspectorKey; onSelect: (key: InspectorKey) => void };

const label = (project: Project, key: InspectorKey) => (key === 'root' ? project.name : nodeLabel(key));

export function PropsPane({ project, selected, onSelect }: Props) {
  const index = INSPECTOR_KEYS.indexOf(selected);
  const prev = INSPECTOR_KEYS[index - 1];
  const next = INSPECTOR_KEYS[index + 1];

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-[11px] font-normal tracking-[0.08em] text-muted">PROPS</h3>
        <dl className="font-mono text-[13px] leading-6">
          <div>
            <dt className="tok-prop inline">stack</dt>
            <span className="tok-punct">: </span>
            <dd className="tok-str inline">[{project.stack.map((s) => `"${s}"`).join(', ')}]</dd>
          </div>
          {project.team && (
            <div>
              <dt className="tok-prop inline">team</dt>
              <span className="tok-punct">: </span>
              <dd className="tok-str inline">&quot;{project.team}&quot;</dd>
            </div>
          )}
          <div>
            <dt className="tok-prop inline">year</dt>
            <span className="tok-punct">: </span>
            <dd className="tok-str inline">&quot;{project.year}&quot;</dd>
          </div>
          <div>
            <dt className="tok-prop inline">links</dt>
            <span className="tok-punct">: </span>
            <dd className="inline">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                  {link.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </section>
      <hr className="border-border" />
      {selected === 'root' ? (
        <p className="text-muted">Select a node in the tree to read that part of the story.</p>
      ) : (
        <section key={selected} className="mount-in flex flex-col gap-2.5">
          <h3 className="font-mono text-[11px] font-normal tracking-[0.08em] text-muted">
            STATE · <span className="tok-tag">&lt;{nodeLabel(selected)} /&gt;</span>
          </h3>
          <p className="text-base leading-[1.65]">{project.nodes[selected].body}</p>
        </section>
      )}
      <nav aria-label="Case study steps" className="mt-auto flex items-center justify-between gap-2 font-mono text-xs text-muted">
        {prev ? (
          <button type="button" onClick={() => onSelect(prev)} className="min-h-6 hover:text-fg">
            ← {label(project, prev)}
          </button>
        ) : (
          <span />
        )}
        {index > 0 && (
          <span>
            {index} / {INSPECTOR_KEYS.length - 1}
          </span>
        )}
        {next ? (
          <button type="button" onClick={() => onSelect(next)} className="min-h-6 hover:text-fg">
            {label(project, next)} →
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
```

`src/features/projects/InspectorPanel.tsx`:

```tsx
import { useEffect, useId, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { ComponentTree } from './ComponentTree';
import { HighlightOverlay } from './HighlightOverlay';
import { nodeLabel, type InspectorKey } from './inspectorKeys';
import { ProjectShot } from './ProjectShot';
import { PropsPane } from './PropsPane';
import { SCHEMATIC_HIGHLIGHTS } from './schematic';

type Props = { project: Project; opener: HTMLElement | null; onClose: () => void };

export function InspectorPanel({ project, opener, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<InspectorKey>('root');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus();
    document.documentElement.dataset.inspectorOpen = '';
    return () => {
      delete document.documentElement.dataset.inspectorOpen;
      if (dialog.open) dialog.close();
      opener?.focus();
    };
  }, [opener]);

  const highlight =
    selected === 'root'
      ? undefined
      : (project.nodes[selected].highlight ?? (project.screenshot.src ? undefined : SCHEMATIC_HIGHLIGHTS[selected]));

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // StrictMode re-runs effects (close → reopen); only report a close that stuck.
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      className="inspector"
    >
      <div className="inspector-sheet flex h-full flex-col">
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border pr-4 pl-5">
          <div className="flex items-center gap-4 font-mono text-xs">
            <span aria-hidden className="text-primary">
              ⚛ Components
            </span>
            <h2 id={titleId} className="font-normal text-muted">
              inspecting <span className="tok-tag">&lt;{project.name}&gt;</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close inspector"
            onClick={() => ref.current?.close()}
            className="h-9 rounded-lg border border-border px-2.5 font-mono text-xs text-muted hover:text-fg"
          >
            Esc ✕
          </button>
        </header>
        <div
          data-lenis-prevent=""
          className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[300px_minmax(0,1fr)_minmax(0,460px)]"
        >
          <div className="flex flex-col gap-2.5 border-b border-border p-3 md:border-r md:border-b-0">
            <p className="pl-3 font-mono text-[11px] tracking-[0.08em] text-muted">COMPONENT TREE</p>
            <ComponentTree project={project} selected={selected} onSelect={setSelected} />
            <p className="mt-auto hidden pl-3 font-mono text-[11px] text-muted md:block">↑↓ move · → expand · Enter select</p>
          </div>
          <div className="border-b border-border p-6 pt-10 md:border-r md:border-b-0">
            <div className="relative">
              <ProjectShot project={project} />
              <HighlightOverlay key={selected} highlight={highlight} label={selected === 'root' ? project.name : nodeLabel(selected)} />
            </div>
          </div>
          <PropsPane project={project} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </dialog>
  );
}
```

`src/features/projects/lazyInspector.ts`:

```ts
import { lazy } from 'react';

const load = () => import('./InspectorPanel');

/** Warm the chunk on hover/focus so the first open feels instant. */
export const preloadInspector = () => {
  void load();
};

export const InspectorPanel = lazy(() => load().then((m) => ({ default: m.InspectorPanel })));
```

`src/features/projects/ProjectCard.tsx`:

```tsx
import { PROJECT_NODE_KEYS, type Project } from '@/content/types';
import { nodeLabel } from './inspectorKeys';
import { preloadInspector } from './lazyInspector';
import { ProjectShot } from './ProjectShot';

type Props = { project: Project; onInspect: (opener: HTMLElement) => void };

export function ProjectCard({ project, onInspect }: Props) {
  const [primary] = project.links;
  return (
    <article aria-labelledby={`${project.slug}-title`} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <ProjectShot project={project} />
      <div className="flex flex-col gap-1.5 px-1">
        <p className="font-mono text-xs text-primary">&lt;{project.name} /&gt;</p>
        <h3 id={`${project.slug}-title`} className="text-2xl font-semibold tracking-[-0.02em]">
          {project.title}
        </h3>
        <p className="text-muted">
          {project.tagline}
          {project.team && <> · {project.team}</>}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-1">
        <ul aria-label="Stack" className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted">
              {tech}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          {primary && (
            <a
              href={primary.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:text-fg"
            >
              Visit ↗<span className="sr-only"> {project.title} (opens in a new tab)</span>
            </a>
          )}
          <button
            type="button"
            aria-haspopup="dialog"
            onPointerEnter={preloadInspector}
            onFocus={preloadInspector}
            onClick={(e) => onInspect(e.currentTarget)}
            className="h-10 rounded-lg border border-primary bg-primary/10 px-3.5 font-mono text-[13px] text-primary transition-colors hover:bg-primary/20"
          >
            ⌘ Inspect<span className="sr-only"> {project.title}</span>
          </button>
        </div>
      </div>
      <noscript>
        <details open className="px-1">
          <summary className="font-mono text-xs text-muted">Case study</summary>
          {PROJECT_NODE_KEYS.map((key) => (
            <section key={key} className="mt-3">
              <h4 className="font-mono text-xs text-primary">&lt;{nodeLabel(key)} /&gt;</h4>
              <p>{project.nodes[key].body}</p>
            </section>
          ))}
        </details>
      </noscript>
    </article>
  );
}
```

`src/features/projects/Projects.tsx`:

```tsx
import { Suspense, useState } from 'react';
import { projects } from '@/content/projects';
import type { Project } from '@/content/types';
import { useBump } from '@/features/render-counter/RenderCounter';
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { InspectorPanel } from './lazyInspector';
import { ProjectCard } from './ProjectCard';

type Open = { project: Project; opener: HTMLElement };

export function Projects() {
  const [open, setOpen] = useState<Open | null>(null);
  const bump = useBump();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          num="04"
          step="props"
          title="Things I've shipped."
          sub="Each project is a component. Inspect one to see its tree, its props and the decisions behind it."
        />
        <p aria-hidden className="font-mono text-xs text-muted">
          {projects.length} components · ⌘ Inspect
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 80}>
            <ProjectCard
              project={project}
              onInspect={(opener) => {
                setOpen({ project, opener });
                bump();
              }}
            />
          </Reveal>
        ))}
      </div>
      <Suspense fallback={null}>
        {open && <InspectorPanel project={open.project} opener={open.opener} onClose={() => setOpen(null)} />}
      </Suspense>
    </div>
  );
}
```

Append to `src/styles.css`:

```css
/* Inspector: native modal <dialog> as a bottom sheet (full screen on phones). */
dialog.inspector {
  margin: auto auto 0;
  width: min(100% - 6rem, 1344px);
  max-width: none;
  height: min(70vh, 640px);
  max-height: none;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  background: hsl(var(--card));
  color: hsl(var(--fg));
  box-shadow: 0 -24px 80px rgb(0 0 0 / 0.5);
}
dialog.inspector::backdrop {
  background: rgb(2 4 8 / 0.55);
}
dialog.inspector[open] .inspector-sheet {
  animation: sheet-in 420ms var(--ease) both;
}
@keyframes sheet-in {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
}
html[data-inspector-open] {
  overflow: hidden;
}
@media (max-width: 767px) {
  dialog.inspector {
    margin: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  dialog.inspector[open] .inspector-sheet {
    animation: fade-in 150ms linear both;
  }
}
```

In `src/App.tsx`, replace the props section's children with `<Projects />` (keep `className="py-24"`) and import it from `@/features/projects/Projects`.

- [ ] **Step 6: Confirm the unit tests pass**

Run: `pnpm coverage && pnpm typecheck && pnpm lint`
Expected: PASS, with coverage ≥ 90%.

- [ ] **Step 7: The projects e2e spec**

`tests/e2e/projects.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/#props');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
});

test('Inspect opens the DevTools panel; the tree is keyboard driven; Esc closes and restores focus', async ({ page, browserName }) => {
  const inspect = page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ });
  await inspect.click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /DaggerheartCardCreator/ })).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('template-driven editor');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('Architecture');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  if (browserName !== 'webkit') await expect(inspect).toBeFocused();
});

test('the page behind the inspector does not scroll', async ({ page }) => {
  await page.getByRole('button', { name: /Inspect Alice is Missing/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(projects): project cards and lazy DevTools Inspector dialog

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Contact terminal and footer, the "commit" step

**Files:**
- Create: `src/features/contact/commitForm.ts`, `src/features/contact/commitForm.test.ts`, `src/features/contact/useCommitForm.ts`, `src/features/contact/CommitTerminal.tsx`, `src/features/contact/CommitTerminal.test.tsx`, `src/features/contact/CommitSection.tsx`, `src/features/footer/usePageRenderTime.ts`, `src/features/footer/usePageRenderTime.test.tsx`, `src/features/footer/Footer.tsx`, `tests/e2e/contact.spec.ts`
- Modify: `tests/fixtures.ts` (the `allowConsoleErrors` option), `src/App.tsx` (commit section and footer)

**Interfaces:**
- Consumes: `contactSchema` (`src/lib/contactSchema.ts`; client code may import it through `@/`, because the server-chain rule only restricts server files); `useBump` (Task 2); `profile`; `SectionHeader`; `__BUILD_YEAR__` (Task 5)
- Produces:
  - `Fields = { name; email; message; company }`, `FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>` and `CommitStatus = 'idle' | 'sending' | 'delivered' | 'rejected'`
  - `RejectReason = 'rate_limited' | 'send_failed' | 'network'`
  - `CommitState = { status; fields; errors; reason? }`, `initialCommit`, and `commitReducer(state, action)`
  - `validateCommit(fields): FieldErrors | null` and `postCommit(fields, fetchImpl?): Promise<CommitAction>` (`delivered` / `invalid` / `rejected`)
  - `useCommitForm(): { state; edit(field, value); submit(): Promise<void> }`
  - `<CommitTerminal />`, `<CommitSection />`, `usePageRenderTime(): number | null` and `<Footer />`
  - The Playwright option `allowConsoleErrors: RegExp[]`, for tests that deliberately make the browser log network errors

**Behaviour:**
- **Validation:** the form validates in the browser with the same zod schema the server uses. Field errors are announced (`aria-invalid` plus `aria-describedby`).
- **While sending:** "git push" is disabled.
- **On success:** the push log shows the delivered lines, the form clears, and the render counter bumps.
- **On failure:** the push log shows `✗ push rejected: <reason>`, the message is **kept**, and a LinkedIn fallback is offered. (An email `mailto:` is intentionally not shown. Trey hasn't chosen a public address; add `profile.email` later to enable it.)
- **Shortcut:** ⌘/Ctrl+Enter in the message box submits.
- **Honeypot:** `company` is visually hidden and skipped by the tab order.

- [ ] **Step 1: Write the failing logic tests**

`src/features/contact/commitForm.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { commitReducer, initialCommit, postCommit, validateCommit, type Fields } from './commitForm';

const good: Fields = { name: 'Ada', email: 'ada@example.com', message: 'Loved the render cycle!', company: '' };

describe('commitReducer', () => {
  it('edits a field and clears only that field’s error', () => {
    const withErrors = commitReducer(initialCommit, { type: 'invalid', errors: { name: 'x', email: 'y' } });
    const edited = commitReducer(withErrors, { type: 'edit', field: 'name', value: 'Ada' });
    expect(edited.fields.name).toBe('Ada');
    expect(edited.errors).toEqual({ email: 'y' });
  });

  it('goes idle → sending → delivered and clears the form on delivery', () => {
    let s = commitReducer(initialCommit, { type: 'edit', field: 'message', value: 'hello there!' });
    s = commitReducer(s, { type: 'send' });
    expect(s.status).toBe('sending');
    s = commitReducer(s, { type: 'delivered' });
    expect(s.status).toBe('delivered');
    expect(s.fields).toEqual(initialCommit.fields);
  });

  it('keeps the message when a push is rejected', () => {
    let s = commitReducer(initialCommit, { type: 'edit', field: 'message', value: 'please keep me' });
    s = commitReducer(s, { type: 'send' });
    s = commitReducer(s, { type: 'rejected', reason: 'send_failed' });
    expect(s).toMatchObject({ status: 'rejected', reason: 'send_failed' });
    expect(s.fields.message).toBe('please keep me');
  });

  it('returns to idle when the visitor edits after a result', () => {
    const rejected = { ...initialCommit, status: 'rejected' as const, reason: 'network' as const };
    expect(commitReducer(rejected, { type: 'edit', field: 'name', value: 'A' }).status).toBe('idle');
  });
});

describe('validateCommit', () => {
  it('accepts a valid commit', () => {
    expect(validateCommit(good)).toBeNull();
  });

  it('returns the first message per invalid field', () => {
    const errors = validateCommit({ ...good, name: '', email: 'nope', message: 'short' });
    expect(Object.keys(errors ?? {}).sort()).toEqual(['email', 'message', 'name']);
    expect(errors?.email).toBe('That email looks off');
  });
});

describe('postCommit', () => {
  const respond = (status: number, body: unknown = {}) =>
    vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));

  it('POSTs JSON to /api/contact and reports delivery', async () => {
    const fetchImpl = respond(200, { ok: true });
    expect(await postCommit(good, fetchImpl)).toEqual({ type: 'delivered' });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(good);
  });

  it('maps server field errors, rate limits, failures and network errors', async () => {
    expect(await postCommit(good, respond(400, { fieldErrors: { email: ['Bad email'] } }))).toEqual({
      type: 'invalid',
      errors: { email: 'Bad email' },
    });
    expect(await postCommit(good, respond(429))).toEqual({ type: 'rejected', reason: 'rate_limited' });
    expect(await postCommit(good, respond(502))).toEqual({ type: 'rejected', reason: 'send_failed' });
    expect(await postCommit(good, vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')))).toEqual({
      type: 'rejected',
      reason: 'network',
    });
  });
});
```

Run: `pnpm test src/features/contact/commitForm.test.ts`. Expected: FAIL.

- [ ] **Step 2: Implement the logic**

`src/features/contact/commitForm.ts`:

```ts
import { z } from 'zod';
import { contactSchema } from '@/lib/contactSchema';

export type Fields = { name: string; email: string; message: string; company: string };
type FieldName = 'name' | 'email' | 'message';
export type FieldErrors = Partial<Record<FieldName, string>>;
export type CommitStatus = 'idle' | 'sending' | 'delivered' | 'rejected';
export type RejectReason = 'rate_limited' | 'send_failed' | 'network';

export type CommitState = { status: CommitStatus; fields: Fields; errors: FieldErrors; reason?: RejectReason };

export type CommitAction =
  | { type: 'edit'; field: keyof Fields; value: string }
  | { type: 'invalid'; errors: FieldErrors }
  | { type: 'send' }
  | { type: 'delivered' }
  | { type: 'rejected'; reason: RejectReason };

export const initialCommit: CommitState = {
  status: 'idle',
  fields: { name: '', email: '', message: '', company: '' },
  errors: {},
};

export function commitReducer(state: CommitState, action: CommitAction): CommitState {
  switch (action.type) {
    case 'edit': {
      const errors = Object.fromEntries(Object.entries(state.errors).filter(([key]) => key !== action.field));
      return {
        ...state,
        status: state.status === 'sending' ? 'sending' : 'idle',
        reason: undefined,
        fields: { ...state.fields, [action.field]: action.value },
        errors,
      };
    }
    case 'invalid':
      return { ...state, status: 'idle', errors: action.errors };
    case 'send':
      return { ...state, status: 'sending', errors: {}, reason: undefined };
    case 'delivered':
      return { ...initialCommit, status: 'delivered' };
    case 'rejected':
      return { ...state, status: 'rejected', reason: action.reason };
  }
}

const FIELD_NAMES: readonly FieldName[] = ['name', 'email', 'message'];

function firstErrors(fieldErrors: Record<string, string[] | undefined>): FieldErrors {
  const out: FieldErrors = {};
  for (const name of FIELD_NAMES) {
    const first = fieldErrors[name]?.[0];
    if (first) out[name] = first;
  }
  return out;
}

export function validateCommit(fields: Fields): FieldErrors | null {
  const parsed = contactSchema.safeParse(fields);
  return parsed.success ? null : firstErrors(z.flattenError(parsed.error).fieldErrors);
}

type PostResult = Extract<CommitAction, { type: 'delivered' | 'invalid' | 'rejected' }>;

export async function postCommit(fields: Fields, fetchImpl: typeof fetch = fetch): Promise<PostResult> {
  let res: Response;
  try {
    res = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fields),
    });
  } catch {
    return { type: 'rejected', reason: 'network' };
  }
  if (res.ok) return { type: 'delivered' };
  if (res.status === 400) {
    const body: unknown = await res.json().catch(() => ({}));
    const fieldErrors =
      typeof body === 'object' && body !== null && 'fieldErrors' in body
        ? (body.fieldErrors as Record<string, string[] | undefined>)
        : {};
    return { type: 'invalid', errors: firstErrors(fieldErrors) };
  }
  return { type: 'rejected', reason: res.status === 429 ? 'rate_limited' : 'send_failed' };
}
```

`src/features/contact/useCommitForm.ts`:

```ts
import { useCallback, useReducer } from 'react';
import { useBump } from '@/features/render-counter/RenderCounter';
import { commitReducer, initialCommit, postCommit, validateCommit, type Fields } from './commitForm';

export function useCommitForm() {
  const [state, dispatch] = useReducer(commitReducer, initialCommit);
  const bump = useBump();

  const edit = useCallback((field: keyof Fields, value: string) => dispatch({ type: 'edit', field, value }), []);

  async function submit() {
    if (state.status === 'sending') return;
    const errors = validateCommit(state.fields);
    if (errors) {
      dispatch({ type: 'invalid', errors });
      return;
    }
    dispatch({ type: 'send' });
    const result = await postCommit(state.fields);
    dispatch(result);
    if (result.type === 'delivered') bump();
  }

  return { state, edit, submit };
}
```

Run: `pnpm test src/features/contact/commitForm.test.ts`. Expected: PASS.

- [ ] **Step 3: Write the failing terminal and footer tests**

`src/features/contact/CommitTerminal.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommitTerminal } from './CommitTerminal';
import { RenderCounterBadge, RenderCounterProvider } from '@/features/render-counter/RenderCounter';

function renderTerminal() {
  return render(
    <RenderCounterProvider>
      <CommitTerminal />
      <RenderCounterBadge />
    </RenderCounterProvider>,
  );
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText(/--author/), 'Ada Lovelace');
  await userEvent.type(screen.getByLabelText(/--email/), 'ada@example.com');
  await userEvent.type(screen.getByLabelText(/-m/), 'Loved the render cycle!');
}

describe('<CommitTerminal />', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows field errors and sends nothing when invalid', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderTerminal();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(screen.getByLabelText(/--author/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Tell me your name')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('delivers, clears the form and counts a render', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })));
    renderTerminal();
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(await screen.findByText(/delivered to trey\/main/)).toBeInTheDocument();
    expect(screen.getByLabelText(/-m/)).toHaveValue('');
    expect(screen.getByText('renders: 1')).toBeInTheDocument();
  });

  it('keeps the message and offers a fallback when the push is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 502 })));
    renderTerminal();
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'git push' }));
    expect(await screen.findByText(/push rejected/)).toBeInTheDocument();
    expect(screen.getByLabelText(/-m/)).toHaveValue('Loved the render cycle!');
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument();
  });

  it('submits with Ctrl+Enter from the message box', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    renderTerminal();
    await fillValid();
    await userEvent.type(screen.getByLabelText(/-m/), '{Control>}{Enter}{/Control}');
    expect(await screen.findByText(/delivered to trey\/main/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('hides the honeypot from people and the tab order', () => {
    renderTerminal();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="company"]')!;
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
```

`src/features/footer/usePageRenderTime.test.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { usePageRenderTime } from './usePageRenderTime';

function Probe() {
  const ms = usePageRenderTime();
  return <p>{ms === null ? 'pending' : `${ms}ms`}</p>;
}

describe('usePageRenderTime', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is pending during prerender', () => {
    expect(renderToString(<Probe />)).toContain('pending');
  });

  it('reports the time to first client frame, rounded', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(412.4);
    render(<Probe />);
    expect(await screen.findByText('412ms')).toBeInTheDocument();
  });
});
```

Run: `pnpm test src/features/contact src/features/footer`. Expected: FAIL.

- [ ] **Step 4: Implement the UI**

`src/features/contact/CommitTerminal.tsx`:

```tsx
import { useId, type KeyboardEvent } from 'react';
import { profile } from '@/content/profile';
import type { CommitState, RejectReason } from './commitForm';
import { useCommitForm } from './useCommitForm';

const REASONS: Record<RejectReason, string> = {
  rate_limited: 'too many pushes — try again in a few minutes',
  send_failed: 'the mail server hiccupped',
  network: 'network unreachable',
};

const inputClass =
  'min-w-0 flex-1 border-0 bg-transparent font-mono text-[15px] text-fg outline-none placeholder:text-muted/70 aria-[invalid=true]:text-danger';

function PushLog({ state }: { state: CommitState }) {
  const pushed = state.status === 'sending' || state.status === 'delivered';
  return (
    <div role="status" aria-live="polite" className="mt-auto border-t border-border bg-bg px-6 py-4 font-mono text-[13px] leading-[22px] text-muted">
      {state.status === 'idle' && <p>$ waiting for your commit…</p>}
      {pushed && (
        <>
          <p>Enumerating objects: 1, done.</p>
          <p>Writing objects: 100% (1/1)</p>
          <p>To ireactit.com</p>
        </>
      )}
      {state.status === 'delivered' && <p className="text-success"> ✓ delivered to trey/main — I&apos;ll reply within a day or two.</p>}
      {state.status === 'rejected' && (
        <>
          <p className="text-danger">✗ push rejected: {REASONS[state.reason ?? 'send_failed']}</p>
          <p>
            Your message is still here. Try again, or reach me on{' '}
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
              LinkedIn ↗
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}

export function CommitTerminal() {
  const { state, edit, submit } = useCommitForm();
  const id = useId();
  const sending = state.status === 'sending';

  function onMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    }
  }

  const field = (name: 'name' | 'email' | 'message') => ({
    id: `${id}-${name}`,
    name,
    value: state.fields[name],
    'aria-invalid': state.errors[name] ? true : undefined,
    'aria-describedby': state.errors[name] ? `${id}-${name}-error` : undefined,
  });

  const error = (name: 'name' | 'email' | 'message') =>
    state.errors[name] && (
      <p id={`${id}-${name}-error`} className="pb-1 pl-[108px] font-mono text-xs text-danger">
        {state.errors[name]}
      </p>
    );

  return (
    <form
      noValidate
      aria-labelledby={`${id}-title`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <p id={`${id}-title`} className="flex h-11 items-center border-b border-border px-5 font-mono text-xs text-muted">
        trey@ireactit: ~/inbox
      </p>
      <div className="flex flex-col px-6 py-5">
        <p aria-hidden className="pb-2 font-mono text-[15px]">
          <span className="text-success">$</span> git commit <span className="text-muted">\</span>
        </p>

        <div className="flex items-center gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-name`} className="w-24 shrink-0 font-mono text-sm text-accent">
            --author <span className="sr-only">(your name)</span>
          </label>
          <input {...field('name')} autoComplete="name" placeholder="Ada Lovelace" onChange={(e) => edit('name', e.target.value)} className={`${inputClass} h-7`} />
        </div>
        {error('name')}

        <div className="flex items-center gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-email`} className="w-24 shrink-0 font-mono text-sm text-accent">
            --email <span className="sr-only">(your email)</span>
          </label>
          <input
            {...field('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ada@example.com"
            onChange={(e) => edit('email', e.target.value)}
            className={`${inputClass} h-7`}
          />
        </div>
        {error('email')}

        <div className="flex items-start gap-3 border-b border-border py-3">
          <label htmlFor={`${id}-message`} className="w-24 shrink-0 pt-0.5 font-mono text-sm text-accent">
            -m <span className="sr-only">(your message)</span>
          </label>
          <textarea
            {...field('message')}
            rows={3}
            placeholder="Loved the render cycle. Want to talk?"
            onChange={(e) => edit('message', e.target.value)}
            onKeyDown={onMessageKeyDown}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </div>
        {error('message')}

        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company
            <input name="company" tabIndex={-1} autoComplete="off" value={state.fields.company} onChange={(e) => edit('company', e.target.value)} />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-5">
          <span className="hidden font-mono text-xs text-muted sm:inline">⌘⏎ to push · replies go to your email</span>
          <button
            type="submit"
            disabled={sending}
            className="h-12 rounded-[10px] bg-primary px-[22px] font-mono text-sm font-bold text-bg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            git push
          </button>
        </div>
      </div>
      <PushLog state={state} />
    </form>
  );
}
```

`src/features/contact/CommitSection.tsx`:

```tsx
import { profile } from '@/content/profile';
import { Reveal } from '@/ui/Reveal';
import { SectionHeader } from '@/ui/SectionHeader';
import { CommitTerminal } from './CommitTerminal';

const LINKS = [
  { label: 'GitHub', href: profile.links.github },
  { label: 'LinkedIn', href: profile.links.linkedin },
  { label: 'Resume', href: profile.links.resume },
  { label: 'PixelTable', href: profile.links.pixeltable },
];

export function CommitSection() {
  return (
    <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
      <div className="flex flex-col gap-8">
        <SectionHeader
          num="05"
          step="commit"
          title="Let's build something."
          sub="Commit a message straight to my inbox. Or skip the terminal and find me below."
        />
        <ul className="flex flex-wrap gap-2.5">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center rounded-[10px] border border-border px-4 font-mono text-[13px] text-fg transition-colors hover:border-primary hover:text-primary"
              >
                {label} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <Reveal delay={120}>
        <CommitTerminal />
      </Reveal>
    </div>
  );
}
```

`src/features/footer/usePageRenderTime.ts`:

```ts
import { useEffect, useState } from 'react';

/** Milliseconds from navigation start to the first frame after hydration; null until then (and in prerender). */
export function usePageRenderTime(): number | null {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMs(Math.round(performance.now())));
    return () => cancelAnimationFrame(frame);
  }, []);
  return ms;
}
```

`src/features/footer/Footer.tsx`:

```tsx
import { profile } from '@/content/profile';
import { usePageRenderTime } from './usePageRenderTime';

export function Footer() {
  const ms = usePageRenderTime();
  return (
    <footer className="mx-auto flex max-w-[78rem] flex-col gap-2 border-t border-border px-4 py-6 pb-28 font-mono text-xs text-muted sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:py-0 md:px-8 md:pb-0">
      <span>
        {'// page rendered in '}
        <span className="text-success">{ms === null ? '—' : ms}ms</span>
      </span>
      <span>
        {profile.wordmark} · © {__BUILD_YEAR__} {profile.name}
      </span>
    </footer>
  );
}
```

In `tests/fixtures.ts`, add an option so a test can allow console errors it causes on purpose (browsers log failed HTTP responses as console errors):
- Change the extend type to `base.extend<{ allowConsoleErrors: RegExp[]; forbidConsoleErrors: void }>`.
- Add the option fixture `allowConsoleErrors: [[], { option: true }],`.
- Make `forbidConsoleErrors` depend on it: `async ({ page, allowConsoleErrors }, use) => {`.
- Only record messages that match none of the allowed patterns: `if (msg.type() === 'error' && !allowConsoleErrors.some((re) => re.test(msg.text())))`.

In `src/App.tsx`:
- Replace the commit section's children with `<CommitSection />`.
- Render `<Footer />` after `</main>`.
- Import both from their feature folders.

- [ ] **Step 5: Confirm the unit tests pass**

Run: `pnpm coverage && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: The contact e2e spec (the API is stubbed with `page.route`, so no email is sent)**

`tests/e2e/contact.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test.use({ allowConsoleErrors: [/Failed to load resource: the server responded with a status of (400|429|502)/] });

async function fill(page: import('@playwright/test').Page) {
  await page.getByLabel(/--author/).fill('Playwright Pat');
  await page.getByLabel(/--email/).fill('pat@example.com');
  await page.getByLabel(/-m/).fill('Hello from the contact e2e test.');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#commit');
});

test('a valid commit is delivered and clears the form', async ({ page }) => {
  let body: unknown;
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await fill(page);
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByRole('status')).toContainText('delivered to trey/main');
  await expect(page.getByLabel(/-m/)).toHaveValue('');
  expect(body).toMatchObject({ name: 'Playwright Pat', email: 'pat@example.com' });
});

test('a rejected push keeps the message', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 502, json: { ok: false, error: 'send_failed' } }));
  await fill(page);
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByRole('status')).toContainText('push rejected');
  await expect(page.getByLabel(/-m/)).toHaveValue('Hello from the contact e2e test.');
});

test('invalid input never reaches the network', async ({ page }) => {
  let called = false;
  await page.route('**/api/contact', (route) => {
    called = true;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByText('Tell me your name')).toBeVisible();
  expect(called).toBe(false);
});

test('the footer reports a real render time', async ({ page }) => {
  await expect(page.locator('footer')).toContainText(/page rendered in \d+ms/);
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(contact): git-commit terminal with validation, push log and footer timing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: View Source mode

**Files:**
- Create: `vite-plugins/sourceSnippets.ts`, `src/virtual-source-snippets.d.ts`, `src/content/snippets/mount.snippet`, `src/content/snippets/write.snippet`, `src/content/snippets/tree.snippet`, `src/content/snippets/props.snippet`, `src/content/snippets/commit.snippet`, `src/features/view-source/sourceSnippets.test.ts`, `src/features/view-source/SourcePanel.tsx`, `src/features/view-source/SectionView.tsx`, `src/features/view-source/SectionView.test.tsx`, `tests/e2e/view-source.spec.ts`
- Modify: `package.json` (dev dependency `shiki`), `vite.config.ts` and `vitest.config.ts` (register the plugin), `src/styles.css` (Shiki CSS variables), `src/App.tsx` (every `Section` becomes a `SectionView`)

**Interfaces:**
- Consumes: `useViewSource` (Plan 1), `Section`, and `SectionId`
- Produces:
  - `renderSnippets(dir): Promise<Record<string, { filename: string; html: string; lines: number }>>`
  - `sourceSnippets(dir?): Plugin`, which serves `virtual:source-snippets`. Its default export is `Record<SectionId, Snippet>`, with the HTML highlighted by Shiki **at build time**. No highlighter ships to the browser.
  - `<SourcePanel id />`, a lazy chunk, and `<SectionView id className? children />`
- **Behaviour:**
  - With View Source on, each section's content is hidden with the `hidden` attribute, so its state (IDE props, form input) is kept, and the section's curated snippet appears with the mount animation instead.
  - Turning it off re-shows the content, and the `mount-in` animation replays because it comes back from `display: none`.
  - Snippet format: the first line is `// <repo path>`, which becomes the panel's filename. Snippets are hand-curated excerpts of the real components.

- [ ] **Step 1: Install Shiki and write the snippets**

```bash
pnpm add -D shiki
mkdir -p src/content/snippets
```

`src/content/snippets/mount.snippet`:

```tsx
// src/features/hero/Hero.tsx
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const bump = useBump();
  const { output, done } = useTypewriter(HERO_TAG, { enabled: !reduced });

  useEffect(() => {
    if (done) bump();
  }, [done, bump]);

  return (
    <div data-hero data-mounted={done ? '' : undefined}>
      <TagTokens text={output} />
      <h1 id="mount-title" data-hero-mount>{profile.greeting}</h1>
      <a href="#props">Inspect my work</a>
    </div>
  );
}
```

`src/content/snippets/write.snippet`:

```tsx
// src/features/ide/TreyEditor.tsx
export function TreyEditor() {
  const [props, setProps] = useState(DEFAULT_TREY);
  const bump = useBump();

  function update(action: TreyAction) {
    const next = treyReducer(props, action);
    if (next === props) return; // no-op: nothing to re-render
    setProps(next);
    bump();
  }

  return (
    <>
      <CodeView lines={treySourceLines(props)} />
      <PropControls value={props} onChange={update} />
      <LivePreview value={props} />
    </>
  );
}
```

`src/content/snippets/tree.snippet`:

```tsx
// src/features/career-tree/CareerTree.tsx
export function CareerTree() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollDriven = useHydrated() && !usePrefersReducedMotion();
  const mounted = useCareerProgress(ref, TOTAL, scrollDriven);

  return (
    <div ref={ref} className="career-pin">
      <ol>
        {recent.map((role, i) => (
          <TreeNode
            key={role.component}
            role={role}
            mounted={i < mounted}
            expanded={!scrollDriven || i === mounted - 1}
          />
        ))}
        <EarlyCareerNode roles={early} mounted={mounted === TOTAL} />
      </ol>
    </div>
  );
}
```

`src/content/snippets/props.snippet`:

```tsx
// src/features/projects/InspectorPanel.tsx
export function InspectorPanel({ project, opener, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<InspectorKey>('root');

  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal(); // native focus trap, Esc and backdrop
    return () => {
      if (dialog.open) dialog.close();
      opener?.focus(); // hand focus back to "⌘ Inspect"
    };
  }, [opener]);

  return (
    <dialog ref={ref} onClose={onClose} className="inspector">
      <ComponentTree project={project} selected={selected} onSelect={setSelected} />
      <PropsPane project={project} selected={selected} onSelect={setSelected} />
    </dialog>
  );
}
```

`src/content/snippets/commit.snippet`:

```tsx
// src/features/contact/useCommitForm.ts
export function useCommitForm() {
  const [state, dispatch] = useReducer(commitReducer, initialCommit);
  const bump = useBump();

  async function submit() {
    const errors = validateCommit(state.fields); // same zod schema as the API
    if (errors) return dispatch({ type: 'invalid', errors });
    dispatch({ type: 'send' });
    const result = await postCommit(state.fields);
    dispatch(result); // delivered | invalid | rejected (keeps your message)
    if (result.type === 'delivered') bump();
  }

  return { state, submit };
}
```

- [ ] **Step 2: Write the failing snippet test**

`src/features/view-source/sourceSnippets.test.ts`:

```ts
// @vitest-environment node
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSnippets } from '../../../vite-plugins/sourceSnippets';
import { SECTION_IDS } from '@/content/sections';

describe('renderSnippets', () => {
  it('highlights each .snippet at build time and takes the filename from line 1', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'snippets-'));
    await writeFile(join(dir, 'mount.snippet'), '// src/demo.tsx\nexport const a = <b c="d" />;\n');
    const out = await renderSnippets(dir);
    expect(out.mount?.filename).toBe('src/demo.tsx');
    expect(out.mount?.lines).toBe(2);
    expect(out.mount?.html).toContain('<pre class="shiki');
    expect(out.mount?.html).toContain('var(--shiki-');
  }, 20_000);

  it('rejects a snippet without a path comment', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'snippets-'));
    await writeFile(join(dir, 'bad.snippet'), 'const x = 1;\n');
    await expect(renderSnippets(dir)).rejects.toThrow('bad.snippet');
  }, 20_000);

  it('ships a snippet for every section', async () => {
    const files = await readdir('src/content/snippets');
    expect(files.map((f) => f.replace('.snippet', '')).sort()).toEqual([...SECTION_IDS].sort());
  });
});
```

Run: `pnpm test src/features/view-source/sourceSnippets.test.ts`. Expected: FAIL (the module is missing).

- [ ] **Step 3: Implement the plugin**

`vite-plugins/sourceSnippets.ts`:

```ts
import { readdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { createCssVariablesTheme, createHighlighter } from 'shiki';
import type { Plugin } from 'vite';

export type Snippet = { filename: string; html: string; lines: number };

const VIRTUAL_ID = 'virtual:source-snippets';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

// Colours come from CSS variables (styles.css), so snippets follow the site theme in light and dark.
const theme = createCssVariablesTheme({ name: 'ireactit', variablePrefix: '--shiki-', fontStyle: true });

export async function renderSnippets(dir: string): Promise<Record<string, Snippet>> {
  const files = (await readdir(dir)).filter((file) => file.endsWith('.snippet')).sort();
  const highlighter = await createHighlighter({ themes: [theme], langs: ['tsx'] });
  try {
    const out: Record<string, Snippet> = {};
    for (const file of files) {
      const code = (await readFile(join(dir, file), 'utf8')).trimEnd();
      const [firstLine = ''] = code.split('\n', 1);
      if (!firstLine.startsWith('// ')) throw new Error(`${file}: first line must be "// <path>"`);
      out[basename(file, '.snippet')] = {
        filename: firstLine.slice(3),
        html: highlighter.codeToHtml(code, { lang: 'tsx', theme: 'ireactit' }),
        lines: code.split('\n').length,
      };
    }
    return out;
  } finally {
    highlighter.dispose();
  }
}

/** Serves `virtual:source-snippets`: section id → build-time-highlighted snippet. */
export function sourceSnippets(dir = 'src/content/snippets'): Plugin {
  const absolute = resolve(dir);
  return {
    name: 'ireactit-source-snippets',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined;
      for (const file of await readdir(absolute)) this.addWatchFile(join(absolute, file));
      return `export default ${JSON.stringify(await renderSnippets(absolute))};`;
    },
  };
}
```

If Shiki 4 moved `createCssVariablesTheme` (for example to `shiki/core`), import it from where the installed version exports it, and note that in the report.

`src/virtual-source-snippets.d.ts`:

```ts
declare module 'virtual:source-snippets' {
  const snippets: Record<
    'mount' | 'write' | 'tree' | 'props' | 'commit',
    { filename: string; html: string; lines: number }
  >;
  export default snippets;
}
```

Register the plugin:
- In `vite.config.ts`: `import { sourceSnippets } from './vite-plugins/sourceSnippets';` and `plugins: [react(), tailwindcss(), devApi(), sourceSnippets()]`.
- In `vitest.config.ts`: import it the same way and use `plugins: [react(), sourceSnippets()]`.

Run: `pnpm test src/features/view-source/sourceSnippets.test.ts`. Expected: PASS.

- [ ] **Step 4: Write the failing SectionView test**

`src/features/view-source/SectionView.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SectionView } from './SectionView';
import { ViewSourceProvider, ViewSourceToggle } from './ViewSource';

function Stateful() {
  const [n, setN] = useState(0);
  return (
    <>
      <h2 id="mount-title">Hello</h2>
      <button onClick={() => setN(n + 1)}>clicked {n}</button>
    </>
  );
}

function renderView() {
  return render(
    <ViewSourceProvider>
      <ViewSourceToggle />
      <SectionView id="mount">
        <Stateful />
      </SectionView>
    </ViewSourceProvider>,
  );
}

describe('<SectionView />', () => {
  it('shows the rendered section by default', () => {
    renderView();
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeVisible();
    expect(screen.queryByText('src/features/hero/Hero.tsx')).not.toBeInTheDocument();
  });

  it('swaps to the section’s source and back, keeping component state', async () => {
    renderView();
    await userEvent.click(screen.getByRole('button', { name: 'clicked 0' }));
    await userEvent.click(screen.getByRole('button', { name: 'View source' }));
    expect(await screen.findByText('src/features/hero/Hero.tsx')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hello' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View source' }));
    expect(screen.getByRole('button', { name: 'clicked 1' })).toBeVisible();
  });
});
```

Run: `pnpm test src/features/view-source/SectionView.test.tsx`. Expected: FAIL.

- [ ] **Step 5: Implement the panel and the wrapper**

`src/features/view-source/SourcePanel.tsx`:

```tsx
import snippets from 'virtual:source-snippets';
import type { SectionId } from '@/content/sections';

const NUMBER: Record<SectionId, string> = { mount: '01', write: '02', tree: '03', props: '04', commit: '05' };

export function SourcePanel({ id }: { id: SectionId }) {
  const snippet = snippets[id];
  return (
    <div className="mount-in flex w-full flex-col gap-5 py-6">
      <p className="flex flex-wrap justify-between gap-2 font-mono text-[13px]">
        <span className="text-primary">
          {NUMBER[id]} — {id} · view source
        </span>
        <span className="text-muted">toggle off to render ↺</span>
      </p>
      <figure className="overflow-hidden rounded-2xl border border-border bg-card">
        <figcaption className="flex h-11 items-center justify-between gap-4 border-b border-border px-5 font-mono text-xs text-muted">
          <span>{snippet.filename}</span>
          <span className="hidden sm:inline">TypeScript React · {snippet.lines} lines</span>
        </figcaption>
        {/* Build-time HTML from our own snippet files (vite-plugins/sourceSnippets.ts), not user input. */}
        <div
          className="source-code overflow-x-auto px-6 py-7 font-mono text-[13px] leading-7 md:text-[15px]"
          dangerouslySetInnerHTML={{ __html: snippet.html }}
        />
      </figure>
    </div>
  );
}
```

`src/features/view-source/SectionView.tsx`:

```tsx
import { lazy, Suspense, useState, type ReactNode } from 'react';
import type { SectionId } from '@/content/sections';
import { Section } from '@/ui/Section';
import { useViewSource } from './ViewSource';

const SourcePanel = lazy(() => import('./SourcePanel').then((m) => ({ default: m.SourcePanel })));

type Props = { id: SectionId; className?: string; children: ReactNode };

/** A section that can flip to its own source. Content stays mounted (hidden) so its state survives. */
export function SectionView({ id, className, children }: Props) {
  const { enabled } = useViewSource();
  const [toggled, setToggled] = useState(false);
  if (enabled && !toggled) setToggled(true);

  return (
    <Section id={id} className={className}>
      <div hidden={enabled} className={toggled ? 'mount-in w-full' : 'w-full'}>
        {children}
      </div>
      {enabled && (
        <Suspense fallback={<p className="w-full py-6 font-mono text-xs text-muted">loading source…</p>}>
          <SourcePanel id={id} />
        </Suspense>
      )}
    </Section>
  );
}
```

Append to `src/styles.css`:

```css
/* Shiki css-variables theme → site tokens (follows light/dark). */
:root {
  --shiki-foreground: hsl(var(--fg));
  --shiki-background: transparent;
  --shiki-token-keyword: hsl(var(--syntax-keyword));
  --shiki-token-string: hsl(var(--success));
  --shiki-token-string-expression: hsl(var(--success));
  --shiki-token-constant: hsl(var(--accent));
  --shiki-token-parameter: hsl(var(--accent));
  --shiki-token-function: hsl(var(--primary));
  --shiki-token-comment: hsl(var(--muted));
  --shiki-token-punctuation: hsl(var(--muted));
  --shiki-token-link: hsl(var(--primary));
}
.source-code pre {
  margin: 0;
  background: transparent !important;
}
```

In `src/App.tsx`, replace every `<Section …>` / `</Section>` with `<SectionView …>` / `</SectionView>` (same ids and classNames), import `SectionView` from `@/features/view-source/SectionView`, and remove the unused `Section` import.

- [ ] **Step 6: Confirm the unit tests pass**

Run: `pnpm coverage && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 7: The View Source e2e spec**

`tests/e2e/view-source.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test('View source swaps every section for its code, and back', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mount')).toContainText('src/features/hero/Hero.tsx');
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(page.locator('#tree')).toContainText('src/features/career-tree/CareerTree.tsx');

  await toggle.click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#mount')).not.toContainText('src/features/hero/Hero.tsx');
});

test('source panels keep the IDE state when toggled back', async ({ page }) => {
  await page.goto('/#write');
  await page.locator('label.radio-chip', { hasText: 'shipping' }).click();
  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await toggle.click();
  await expect(page.getByLabel('Trey.tsx source')).toContainText("mood = 'shipping',");
});
```

Run: `pnpm build && pnpm e2e --project=chromium --project=mobile`
Expected: all pass. Check the built JS: `grep -l "createHighlighter" dist/assets/*.js` must print nothing, because Shiki must not ship.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(view-source): build-time highlighted snippets and per-section source toggle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Modes, accessibility in every state, and the JS budget

**Files:**
- Create: `scripts/bundleBudget.ts`, `scripts/bundleBudget.test.ts`, `scripts/check-bundle.ts`, `tests/e2e/modes.spec.ts`
- Modify: `tests/e2e/a11y.spec.ts` (more states), `vitest.config.ts` (also include `scripts/**/*.test.ts`), `package.json` (the `check:bundle` script), `.github/workflows/ci.yml` (run `pnpm check:bundle` after `pnpm build`)

**Interfaces:**
- Consumes: the whole page from Tasks 1–8
- Produces:
  - `initialAssets(html: string): string[]` (the module script and modulepreload hrefs in `dist/index.html`)
  - `pnpm check:bundle`, which fails when the initial JavaScript is larger than **150 KB gzipped** (the spec §1 budget)

- [ ] **Step 1: Write the failing budget test**

`scripts/bundleBudget.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { initialAssets } from './bundleBudget';

describe('initialAssets', () => {
  it('finds the entry module and its modulepreloads, but not lazy chunks or CSS', () => {
    const html = `<head>
      <script type="module" crossorigin src="/assets/index-abc.js"></script>
      <link rel="modulepreload" crossorigin href="/assets/vendor-def.js">
      <link rel="stylesheet" href="/assets/index-123.css">
    </head>`;
    expect(initialAssets(html)).toEqual(['/assets/index-abc.js', '/assets/vendor-def.js']);
  });
});
```

In `vitest.config.ts`, set `include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts']`.

Run: `pnpm test scripts`. Expected: FAIL.

- [ ] **Step 2: Implement the budget check**

`scripts/bundleBudget.ts`:

```ts
/** JS the browser must fetch before first interaction: the entry module plus its modulepreloads. */
export function initialAssets(html: string): string[] {
  const scripts = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]!);
  const preloads = [...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]!);
  return [...scripts, ...preloads];
}
```

`scripts/check-bundle.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { initialAssets } from './bundleBudget';

const BUDGET_BYTES = 150 * 1024;

const html = await readFile('dist/index.html', 'utf8');
let total = 0;
for (const asset of initialAssets(html)) {
  const size = gzipSync(await readFile(join('dist', asset))).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${asset}`);
}
console.log(`${(total / 1024).toFixed(1).padStart(7)} KB  total initial JS (gzip), budget ${BUDGET_BYTES / 1024} KB`);
if (total > BUDGET_BYTES) {
  console.error('Initial JS is over budget.');
  process.exit(1);
}
```

Add the script `"check:bundle": "tsx scripts/check-bundle.ts"` to `package.json`. In `.github/workflows/ci.yml`, add a step `- run: pnpm check:bundle` directly after `- run: pnpm build`.

Run: `pnpm test scripts && pnpm build && pnpm check:bundle`
Expected: the test passes and the total is under 150 KB. If it's over, report the per-file sizes and stop: don't raise the budget.

- [ ] **Step 3: The modes e2e spec**

`tests/e2e/modes.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing is pinned or typed; every career node is mounted', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
    const tree = page.locator('#tree');
    const viewport = page.viewportSize()!.height;
    expect((await tree.boundingBox())!.height).toBeLessThan(viewport * 2.5);
    await expect(tree.locator('[data-state="pending"]')).toHaveCount(0);
    await expect(tree.locator('[data-state="mounted"]')).toHaveCount(6);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('every section is readable from the prerendered HTML', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel('Trey.tsx source')).toContainText("mood = 'caffeinated',");
    await expect(page.locator('#tree')).toContainText('HostPapa');
    await expect(page.locator('#tree [data-state="pending"]')).toHaveCount(0);
    await expect(page.getByText(/template-driven editor/).first()).toBeVisible();
    await expect(page.locator('#commit form')).toBeVisible();
  });
});

test('scrolling the whole page top to bottom raises no errors and reveals everything', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
  });
  await expect(page.locator('[data-reveal]:not([data-shown])')).toHaveCount(0);
});
```

- [ ] **Step 4: Run axe in every interactive state**

Replace `tests/e2e/a11y.spec.ts` with this (keep the tag list and impact filter Plan 1's fix introduced):

```ts
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = violations.filter((v) => ['moderate', 'serious', 'critical'].includes(v.impact ?? ''));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
    });

    test('page', async ({ page }) => {
      await expectNoViolations(page);
    });

    test('inspector open', async ({ page }) => {
      await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expectNoViolations(page);
    });

    test('view source on', async ({ page }) => {
      await page.getByRole('button', { name: 'View source' }).click();
      await expect(page.locator('#mount figure')).toBeVisible();
      await expectNoViolations(page);
    });

    test('contact errors shown', async ({ page }) => {
      await page.locator('#commit').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'git push' }).click();
      await expect(page.getByText('Tell me your name')).toBeVisible();
      await expectNoViolations(page);
    });
  });
}
```

(Reduced motion is used here so that axe measures final colours, not colours halfway through a transition.)

- [ ] **Step 5: Run everything**

Run: `pnpm coverage && pnpm typecheck && pnpm lint && pnpm build && pnpm check:bundle && pnpm e2e --project=chromium --project=mobile`
Expected: all green. Fix any real violation or mode bug at its root in the app code (with a unit test if it's logic), never by loosening a test.

- [ ] **Step 6: Commit and push for CI (WebKit and deploy-check)**

```bash
git add -A
git commit -m "test: reduced-motion/no-JS modes, axe in every state, initial JS budget

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin rebuild
```

Then watch PR #1's checks (`mcp__ccd_pr__get_status`, or `gh pr checks 1 --watch`). `ci` (including WebKit) and `deploy-check` against the new Vercel preview must pass. On failure, use superpowers:systematic-debugging with the uploaded Playwright report.

---

## Execution notes

- **Order:** run the tasks in order, 1 → 9. Every task after 2 edits `src/App.tsx` and `src/styles.css`, so don't run implementers in parallel.
- **After Task 9:**
  - Run the whole-branch review for Plan 2.
  - Publish an updated preview link for Trey.
  - Then write Plan 3 (visual baselines, the four DITL personas, Lighthouse CI, README, the content-review gate, security headers and CSP, `og:image`, the Resend env vars, and the cutover).
- **Local runs:** WebKit can't launch on Trey's Mac (Playwright/macOS 14). Run `--project=chromium --project=mobile` locally; CI runs WebKit.
- **Still open for Trey (no plan task depends on it):**
  - Should the contact fallback show a public email address? For now it links to LinkedIn.
  - Real screenshots for the four projects. Until they exist, the Inspector draws schematics.
