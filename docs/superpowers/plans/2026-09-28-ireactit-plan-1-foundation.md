# IReactIt Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the tested, deployable skeleton of the new ireactit.com. The existing repo and Vercel project are rewired. It includes the Vite + React scaffold with build-time prerendering and the TDD toolchain, the design tokens and theme, motion presets, typed content, the contact API, the shared providers, the nav with its lifecycle rail, and the Playwright, CI and deploy-check pipeline. Every later feature then lands behind green gates.

**Architecture:** Vite + React 19 with no meta-framework. The app is prerendered to static HTML at build time with `react-dom/static` and hydrated on the client. The contact endpoint is a standalone Vercel Function (`api/contact.ts`); a small Vite plugin serves the same handler in `vite dev` and `vite preview`. Server logic (the contact handler) is built as a dependency-injected factory, so it is unit-testable without module mocking. Content is typed data in `src/content`. Playwright runs locally, in CI against `vite preview`, and against every Vercel deployment through a `deployment_status` workflow.

**Tech Stack:** Vite 8, React 19, TypeScript (strict), Tailwind CSS v4, Motion 13, zod 4, Resend 6, Vitest 5 + React Testing Library + user-event + jest-dom, Playwright 1.63 + @axe-core/playwright, pnpm, GitHub Actions, and Vercel (through the Vercel MCP connector).

**Spec:** `docs/superpowers/specs/2026-09-28-ireactit-portfolio-design.md`

## Plan roadmap

This plan is 1 of 3. Plans 2 and 3 are written after the Claude Design mockups are approved, because they depend on those visuals.

| Plan | Scope | Depends on |
|---|---|---|
| **1: Foundation** (this) | repo/Vercel wiring, scaffold, tokens/theme, motion presets, content, contact API, providers, nav/rail, Playwright + CI + deploy-check | spec |
| 2: Features | Lenis, hero mount, `Trey.tsx` IDE, career tree (pinned), projects + DevTools Inspector, contact terminal UI, View Source panels + snippets, footer timing | Plan 1 + approved Claude Design |
| 3: Quality & Launch | visual baselines, all four DITL personas, Lighthouse CI budgets, branch-protection finalisation, README (animated SVG, GIF), `/code-review`, `/security-review`, `/simplify`, content-reviewed gate, merge = cutover | Plan 2 |

## Global Constraints

- Language: TypeScript `strict: true`; no `any` in `src/` (use `unknown` and narrow).
- Package manager: pnpm. Node 20.19+ locally; Vercel Node `22.x`. TypeScript pinned `~6.0.3` (the `typescript-eslint` peer range is `<6.1`).
- **Server-chain import rule:** `api/**`, `src/features/contact/server/**`, `src/lib/contactSchema.ts`, `src/lib/rateLimit.ts` and `src/lib/safeEqual.ts` use **relative imports with `.js` extensions** (for example `'../../../lib/safeEqual.js'`) and never the `@/` alias, because Vercel compiles functions without Vite's resolver.
- TDD: every unit in `src/` gets a failing test before its implementation.
- Allowed animated properties: `transform`, `opacity`, and `filter: blur` (for the mount effect only).
- Easing `cubic-bezier(0.22, 1, 0.36, 1)`; spring `stiffness 300, damping 30`; mount = opacity 0→1, scale 0.98→1, blur 4px→0, 500ms; under reduced motion, opacity only at 150ms or less.
- Section ids, in order: `mount`, `write`, `tree`, `props`, `commit`.
- Colour tokens (HSL, dark default): bg `222 47% 4%`, card `221 39% 7%`, border `218 28% 14%`, fg `190 30% 94%`, muted `215 16% 62%`, primary `193 95% 60%`, success `160 84% 45%`, accent `42 96% 58%`, danger `0 72% 51%`.
- Fonts: Space Grotesk (display and body, 17px base) and JetBrains Mono (code and labels), self-hosted through `@fontsource-variable/space-grotesk` and `@fontsource-variable/jetbrains-mono` (family names `Space Grotesk Variable` and `JetBrains Mono Variable`).
- Contact: name 1–100 characters, a valid email, message 10–5000 characters, honeypot field `company`; rate limit 5 per 10 minutes per IP; dry-run header `x-ditl-token`; status codes 400 / 200 / 429 / 502.
- Env vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `DITL_TOKEN`, and optionally `CONTACT_FROM_EMAIL` (default `IReactIt <onboarding@resend.dev>`).
- Never commit secrets. `.env*.local` stays git-ignored.
- Never delete the local `~/code/meet-trey` folder or the Vercel `meet-trey` history.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Vercel team: `team_ktkmn8l7tRwSQST8PXKZAJ05` (slug `nothinbuttreys-projects`); project id `prj_g4GZpnXCP3LgVI0KFCyMUi57safy`.

## File structure (created by this plan)

```
.github/workflows/ci.yml                      PR/main gate: typecheck, lint, unit+coverage, build, Playwright
.github/workflows/deploy-check.yml            Playwright against each Vercel deployment URL
vercel.json                                   Vite preset + our build command (includes prerender)
vite.config.ts / vitest.config.ts / vitest.setup.ts / eslint.config.js / tsconfig.json
vite-plugins/devApi.ts                        serves api/contact.ts in `vite dev` and `vite preview`
playwright.config.ts                          BASE_URL-aware; local preview server; bypass header
index.html                                    meta/OG, no-flash theme script, #root with <!--app-html-->
scripts/prerender.ts                          injects the SSR-rendered App into dist/index.html
api/contact.ts                                Vercel Function: POST → createContactHandler + Resend
src/main.tsx                                  fonts, styles, hydrateRoot/createRoot
src/entry-server.tsx                          render(): prerenderToNodeStream(App) → string
src/App.tsx                                   Providers + Nav + five Sections
src/Providers.tsx                             RenderCounterProvider + ViewSourceProvider
src/styles.css                                Tailwind v4 + tokens (dark/light)
src/lib/injectAppHtml.ts                      marker replacement used by prerender
src/lib/motion.ts                             EASE_OUT, SPRING, mountVariants(reduced)
src/lib/rateLimit.ts                          createRateLimiter
src/lib/contactSchema.ts                      zod schema + ContactInput
src/lib/safeEqual.ts                          timing-safe string compare
src/content/types.ts                          Project, Experience, Profile types
src/content/sections.ts                       SECTION_IDS, SectionId, SECTION_LABELS
src/content/profile.ts / experience.ts / projects.ts
src/features/contact/server/handleContact.ts  createContactHandler (pure, injected deps)
src/features/contact/server/sendContactEmail.ts Resend adapter
src/features/render-counter/RenderCounter.tsx provider, hook, badge
src/features/view-source/ViewSource.tsx       provider, hook, toggle
src/features/nav/useActiveSection.ts          IntersectionObserver centre-band tracker
src/features/nav/Nav.tsx                      wordmark, rail, toggles, counter
src/ui/Section.tsx                            section shell
src/ui/ThemeToggle.tsx                        useSyncExternalStore on data-theme
tests/e2e/*.spec.ts, tests/ditl/*.spec.ts     Playwright
```

---

### Task 1: Rewire the repo and the Vercel project

This is an ops task with no code under test. Verification is by command output.

**Files:**
- Modify: local git config of `/Users/thomasmcbride/code/IReactIt`
- Create: `.env.local` (git-ignored)

**Interfaces:**
- Produces: a local branch `rebuild` tracking `origin/rebuild` on `NothinButTreys/ireactit`, containing the `docs/` commits. The Vercel project `ireactit` has production branch `main`, Node `22.x`, and the `DITL_TOKEN` env var. The GitHub secret `DITL_TOKEN` is set.

- [ ] **Step 1: Confirm with Trey before the outward-facing renames.** Ask in chat: "About to rename GitHub `meet-trey`→`ireactit`, its branch `master`→`main`, and Vercel project `meet-trey`→`ireactit`. The live site is unaffected. OK?" Wait for a yes.

- [ ] **Step 2: Rename the GitHub repo and default branch**

```bash
gh repo rename ireactit --repo NothinButTreys/meet-trey --yes
gh api -X POST repos/NothinButTreys/ireactit/branches/master/rename -f new_name=main
gh repo view NothinButTreys/ireactit --json name,defaultBranchRef -q '.name + " " + .defaultBranchRef.name'
```

Expected: `ireactit main`

- [ ] **Step 3: Rename the Vercel project and set Node.** Load `mcp__c632a316-96ac-4914-9759-b0cc9daf06fc__update_project` with ToolSearch and call it with `idOrName: "prj_g4GZpnXCP3LgVI0KFCyMUi57safy"`, `teamId: "team_ktkmn8l7tRwSQST8PXKZAJ05"`, and a body of `{ "name": "ireactit", "nodeVersion": "22.x" }`. Then call `get_project` and confirm `name: "ireactit"` and that the `link` shows the repo `ireactit` with `productionBranch: "main"`. If `productionBranch` is still `master` and the tool schema offers no field for it, ask Trey to set **Settings → Git → Production Branch = `main`** in the Vercel dashboard, and wait for confirmation.

- [ ] **Step 4: Attach the local folder to the repo on a `rebuild` branch**

```bash
cd /Users/thomasmcbride/code/IReactIt
git branch -m main spec-local
git remote add origin https://github.com/NothinButTreys/ireactit.git
git fetch origin
git checkout -b rebuild origin/main
git checkout spec-local -- docs
git commit -m "docs: add IReactIt design spec and foundation plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git branch -D spec-local
git log --oneline -3
```

Expected: the top commit is the docs commit, and the commits below it are the 2023 MeetTrey history.

- [ ] **Step 5: Create the DITL token in Vercel, GitHub and `.env.local`**

```bash
cd /Users/thomasmcbride/code/IReactIt
TOKEN=$(openssl rand -hex 32)
printf 'DITL_TOKEN=%s\n' "$TOKEN" > .env.local
printf '%s' "$TOKEN" | gh secret set DITL_TOKEN --repo NothinButTreys/ireactit
gh secret list --repo NothinButTreys/ireactit
```

Expected: `DITL_TOKEN` is listed. Then read the token with `cut -d= -f2 .env.local` and call the Vercel connector's `create_project_env` for project `prj_g4GZpnXCP3LgVI0KFCyMUi57safy` with `{ key: "DITL_TOKEN", value: <token>, type: "sensitive", target: ["preview", "production"] }`. Do not repeat the token value in chat.

- [ ] **Step 6: Check deployment protection.** Call `get_project` again. If `ssoProtection` or `passwordProtection` is enabled, call `update_project_protection_bypass` to generate an automation bypass secret, then run `gh secret set VERCEL_AUTOMATION_BYPASS_SECRET --repo NothinButTreys/ireactit` with that value. If both are disabled (the state on 2026-09-28), skip this step and note it in the task report.

---

### Task 2: Vite + React scaffold, prerender pipeline, and the Vitest toolchain

The files are written by hand rather than with `create-vite`, so the setup is exact and needs no interactive prompts.

**Files:**
- Delete: all tracked 2023 MeetTrey files except `docs/`
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `eslint.config.js`, `vercel.json`, `index.html`, `public/favicon.svg`, `src/main.tsx`, `src/entry-server.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/styles.css`, `src/lib/injectAppHtml.ts`, `src/lib/injectAppHtml.test.ts`, `src/lib/motion.ts`, `src/lib/motion.test.ts`, `scripts/prerender.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces:
  - Scripts: `pnpm dev`, `pnpm build` (typecheck → client build → SSR build → prerender into `dist/index.html`), `pnpm preview` (port 4173), `pnpm test`, `pnpm coverage`, `pnpm typecheck`, `pnpm lint`, `pnpm e2e`, `pnpm e2e:ditl`
  - The alias `@/*` → `src/*`
  - `App` (a named export from `src/App.tsx`, no props)
  - `injectAppHtml(template: string, appHtml: string): string`
  - `EASE_OUT: readonly [0.22, 1, 0.36, 1]`, `SPRING: { type: 'spring'; stiffness: 300; damping: 30 }`, `mountVariants(reduced: boolean)`
  - The marker `<!--app-html-->` inside `#root` in `index.html`

- [ ] **Step 1: Remove the old app and install dependencies**

```bash
cd /Users/thomasmcbride/code/IReactIt
git rm -r -q -- . ':(exclude)docs'
rm -rf node_modules .next
cat > package.json <<'EOF'
{
  "name": "ireactit",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build && vite build --ssr src/entry-server.tsx --outDir dist-server && tsx scripts/prerender.ts",
    "preview": "vite preview --port 4173 --strictPort",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "e2e:ditl": "playwright test tests/ditl"
  }
}
EOF
pnpm add react react-dom motion zod resend @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono
pnpm add -D typescript@~6.0.3 vite @vitejs/plugin-react tailwindcss @tailwindcss/vite tsx @types/react @types/react-dom @types/node \
  vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  @playwright/test @axe-core/playwright \
  eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
npm pkg set packageManager="pnpm@$(pnpm -v)"
cat > .gitignore <<'EOF'
node_modules
dist
dist-server
.env*.local
.vercel
coverage
test-results
playwright-report
blob-report
playwright/.cache
.DS_Store
*.tsbuildinfo
EOF
```

Expected: the installs succeed with no peer-dependency errors. TypeScript is pinned to 6.0.x because `typescript-eslint` supports `<6.1`.

- [ ] **Step 2: Write the config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client", "node"],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "api", "scripts", "tests", "vite-plugins", "*.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  // Make .env / .env.local visible to server-side code (the dev API) the same way Vercel does.
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ''), ...process.env });
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/content/**', 'src/features/**/use*.ts', 'src/features/**/server/**'],
      exclude: ['**/*.test.*'],
      thresholds: { lines: 90 },
    },
  },
});
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom has no IntersectionObserver; a no-op default keeps components that observe sections renderable.
// Tests that exercise observation (useActiveSection) install their own fake.
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

afterEach(() => {
  cleanup();
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  }
});
```

`eslint.config.js`:

```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'dist-server', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowExportNames: ['useRenderCount', 'useViewSource'] }],
    },
  },
]);
```

`vercel.json` (this overrides the Vite preset so the prerender step runs on Vercel):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist"
}
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#050810"/><text x="16" y="21" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#4cd6f7">&lt;/&gt;</text></svg>
```

- [ ] **Step 3: Write the failing tests for the HTML injector, the motion presets and the App shell**

`src/lib/injectAppHtml.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { injectAppHtml } from './injectAppHtml';

describe('injectAppHtml', () => {
  it('replaces the marker inside #root with the prerendered app', () => {
    const template = '<div id="root"><!--app-html--></div>';
    expect(injectAppHtml(template, '<h1>hi</h1>')).toBe('<div id="root"><h1>hi</h1></div>');
  });

  it('does not interpret $ patterns in the app html', () => {
    const out = injectAppHtml('<!--app-html-->', 'costs $& and $1');
    expect(out).toBe('costs $& and $1');
  });

  it('fails loudly when the marker is missing', () => {
    expect(() => injectAppHtml('<div id="root"></div>', 'x')).toThrow('<!--app-html--> marker missing');
  });
});
```

`src/lib/motion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EASE_OUT, SPRING, mountVariants } from './motion';

describe('motion presets', () => {
  it('uses the house easing curve and spring', () => {
    expect(EASE_OUT).toEqual([0.22, 1, 0.36, 1]);
    expect(SPRING).toEqual({ type: 'spring', stiffness: 300, damping: 30 });
  });

  it('mounts with fade, 0.98 scale and 4px blur over 500ms', () => {
    const v = mountVariants(false);
    expect(v.hidden).toEqual({ opacity: 0, scale: 0.98, filter: 'blur(4px)' });
    expect(v.visible).toEqual({
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });

  it('collapses to a short opacity-only fade under reduced motion', () => {
    const v = mountVariants(true);
    expect(v.hidden).toEqual({ opacity: 0 });
    expect(v.visible).toEqual({ opacity: 1, transition: { duration: 0.15 } });
  });
});
```

`src/App.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('<App />', () => {
  it('renders the hero greeting as the only h1', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hi, I'm Trey.");
  });
});
```

- [ ] **Step 4: Run them and confirm they fail**

Run: `pnpm test`
Expected: FAIL, with all three suites unable to resolve `./injectAppHtml`, `./motion` and `./App`.

- [ ] **Step 5: Implement the injector, the motion presets and a minimal App**

`src/lib/injectAppHtml.ts`:

```ts
const MARKER = '<!--app-html-->';

export function injectAppHtml(template: string, appHtml: string): string {
  if (!template.includes(MARKER)) throw new Error(`prerender: ${MARKER} marker missing from index.html`);
  return template.replace(MARKER, () => appHtml);
}
```

`src/lib/motion.ts`:

```ts
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function mountVariants(reduced: boolean) {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    };
  }
  return {
    hidden: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: EASE_OUT },
    },
  };
}
```

`src/App.tsx` (Task 6 replaces this skeleton):

```tsx
export function App() {
  return (
    <main>
      <h1>Hi, I&apos;m Trey.</h1>
    </main>
  );
}
```

- [ ] **Step 6: Confirm they pass**

Run: `pnpm test`
Expected: 7 passed.

- [ ] **Step 7: Wire the entries, the HTML template and the prerender script**

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Trey McBride · IReactIt</title>
    <meta name="description" content="Trey McBride, Principal Engineer. I build React that feels effortless." />
    <link rel="canonical" href="https://ireactit.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ireactit.com/" />
    <meta property="og:title" content="Trey McBride · IReactIt" />
    <meta property="og:description" content="Principal Engineer. I build React that feels effortless." />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

(Plan 3 adds `og:image` once `public/og.png` exists.)

`src/styles.css` (Task 3 fills in the tokens):

```css
@import 'tailwindcss';
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('#root missing from index.html');

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered, so hydrate; `vite dev` serves only the marker comment, so render.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
```

`src/entry-server.tsx`:

```tsx
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { App } from './App';

export async function render(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}
```

`scripts/prerender.ts`:

```ts
import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { injectAppHtml } from '../src/lib/injectAppHtml';

const { render } = (await import(pathToFileURL(resolve('dist-server/entry-server.js')).href)) as {
  render: () => Promise<string>;
};

const templatePath = resolve('dist/index.html');
const appHtml = await render();
await writeFile(templatePath, injectAppHtml(await readFile(templatePath, 'utf8'), appHtml));
await rm('dist-server', { recursive: true, force: true });
console.log(`prerender: injected ${appHtml.length} chars into dist/index.html`);
```

- [ ] **Step 8: Run the whole gate and prove the prerender works**

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
grep -c "Hi, I" dist/index.html
test ! -d dist-server && echo SSR_CLEANED
```

Expected: tests pass, types and lint are clean, and the build prints `prerender: injected … chars`. The grep prints `1` and `SSR_CLEANED` is printed. If `pnpm lint` fails on `reactHooks.configs.flat.recommended` being undefined, check the installed plugin's README for its flat-config export name and use that instead.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: replace MeetTrey with Vite + React scaffold, prerender and Vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Design tokens, fonts, the no-flash theme, and ThemeToggle

**Files:**
- Modify: `src/styles.css`, `index.html`
- Create: `src/ui/ThemeToggle.tsx`, `src/ui/ThemeToggle.test.tsx`

**Interfaces:**
- Produces: Tailwind colour utilities `bg-bg`, `bg-card`, `border-border`, `text-fg`, `text-muted`, `text-primary`, `text-success`, `text-accent`, `text-danger`; font utilities `font-display` and `font-mono`; `<ThemeToggle />` (no props). The theme state is `document.documentElement.dataset.theme` ∈ `'light' | 'dark' | undefined`, persisted in `localStorage['theme']`.

- [ ] **Step 1: Write the failing test**

`src/ui/ThemeToggle.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('<ThemeToggle />', () => {
  it('defaults to dark when the system does not prefer light', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('switches to light, writes data-theme and persists the choice', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('respects an explicit data-theme set before mount', () => {
    document.documentElement.dataset.theme = 'light';
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test src/ui/ThemeToggle.test.tsx`
Expected: FAIL, "Failed to resolve import ./ThemeToggle"

- [ ] **Step 3: Implement `src/ui/ThemeToggle.tsx`**

```tsx
import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

function readTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener('change', onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const next: Theme = theme === 'light' ? 'dark' : 'light';

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable (private mode); the in-page choice still applies
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme ? `Switch to ${next} theme` : 'Switch theme'}
      className="font-mono text-xs text-muted transition-colors hover:text-primary focus-visible:text-primary"
    >
      {theme === 'light' ? '☾' : '☀'}
    </button>
  );
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `pnpm test src/ui/ThemeToggle.test.tsx`
Expected: 3 passed. `findByRole` covers the MutationObserver re-render.

- [ ] **Step 5: Replace `src/styles.css`**

```css
@import 'tailwindcss';

:root {
  --bg: 222 47% 4%;
  --card: 221 39% 7%;
  --border: 218 28% 14%;
  --fg: 190 30% 94%;
  --muted: 215 16% 62%;
  --primary: 193 95% 60%;
  --success: 160 84% 45%;
  --accent: 42 96% 58%;
  --danger: 0 72% 51%;
  color-scheme: dark;
}

:root[data-theme='light'] {
  --bg: 210 40% 98%;
  --card: 0 0% 100%;
  --border: 214 32% 88%;
  --fg: 222 47% 8%;
  --muted: 215 19% 35%;
  --primary: 195 90% 30%;
  --success: 160 84% 26%;
  --accent: 32 95% 34%;
  --danger: 0 72% 42%;
  color-scheme: light;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme='dark']) {
    --bg: 210 40% 98%;
    --card: 0 0% 100%;
    --border: 214 32% 88%;
    --fg: 222 47% 8%;
    --muted: 215 19% 35%;
    --primary: 195 90% 30%;
    --success: 160 84% 26%;
    --accent: 32 95% 34%;
    --danger: 0 72% 42%;
    color-scheme: light;
  }
}

@theme inline {
  --color-bg: hsl(var(--bg));
  --color-card: hsl(var(--card));
  --color-border: hsl(var(--border));
  --color-fg: hsl(var(--fg));
  --color-muted: hsl(var(--muted));
  --color-primary: hsl(var(--primary));
  --color-success: hsl(var(--success));
  --color-accent: hsl(var(--accent));
  --color-danger: hsl(var(--danger));
  --font-display: 'Space Grotesk Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}

html {
  background: hsl(var(--bg));
}

body {
  background: hsl(var(--bg));
  color: hsl(var(--fg));
  font-family: var(--font-display);
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 3px;
}
```

- [ ] **Step 6: Add the no-flash theme script to `index.html`.** Insert it as the last element of `<head>`, so a stored choice applies before first paint:

```html
    <script>
      try {
        var t = localStorage.getItem('theme');
        if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
      } catch (e) {}
    </script>
```

- [ ] **Step 7: Verify and commit**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green.

```bash
git add -A
git commit -m "feat(theme): design tokens, fonts, no-flash theme and ThemeToggle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Typed content (sections, profile, experience, projects)

**Files:**
- Create: `src/content/types.ts`, `src/content/sections.ts`, `src/content/profile.ts`, `src/content/experience.ts`, `src/content/projects.ts`, `src/content/content.test.ts`

**Interfaces:**
- Produces:
  - `SECTION_IDS: readonly ['mount','write','tree','props','commit']`, `type SectionId`, `SECTION_LABELS: Record<SectionId, string>`
  - `profile: Profile`, `experience: Experience[]`, `projects: Project[]`
  - `PROJECT_NODE_KEYS: readonly ['problem','myRole','architecture','hardParts','outcome']`, `type ProjectNodeKey`

- [ ] **Step 1: Write the types (types only, nothing to test yet)**

`src/content/types.ts`:

```ts
export const PROJECT_NODE_KEYS = ['problem', 'myRole', 'architecture', 'hardParts', 'outcome'] as const;
export type ProjectNodeKey = (typeof PROJECT_NODE_KEYS)[number];

export type Highlight = { x: number; y: number; w: number; h: number };

export type ProjectNode = { body: string; highlight?: Highlight };

export type Project = {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  year: string;
  team?: string;
  stack: string[];
  links: { label: string; href: string }[];
  screenshot: { src: string; alt: string };
  nodes: Record<ProjectNodeKey, ProjectNode>;
  /** Flipped to true by Trey after fact-checking; Plan 3 blocks launch until every project is reviewed. */
  reviewed: boolean;
};

export type Experience = {
  company: string;
  component: string;
  role: string;
  start: string;
  end: string | null;
  highlights: string[];
  /** 'recent' roles render as top-level tree nodes; 'early' roles nest inside one collapsible <EarlyCareer> node. */
  era: 'recent' | 'early';
};

export type Profile = {
  name: string;
  wordmark: string;
  greeting: string;
  subline: string;
  role: string;
  links: { github: string; linkedin: string; resume: string; pixeltable: string };
};
```

- [ ] **Step 2: Write the failing content-shape tests**

`src/content/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SECTION_IDS, SECTION_LABELS } from './sections';
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
    for (const id of SECTION_IDS) expect(SECTION_LABELS[id]).toBeTruthy();
  });
});

describe('profile', () => {
  it('has https links for every external destination', () => {
    for (const href of Object.values(profile.links)) expect(href).toMatch(/^https:\/\//);
    expect(profile.wordmark).toBe('<IReactIt/>');
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
```

(The per-node minimum of 25 words, with the 150–300 total, gives the spec's 150–250 target a little slack, so short edits by Trey don't break the build.)

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm test src/content`
Expected: FAIL, "Failed to resolve import ./sections"

- [ ] **Step 4: Implement the content files**

`src/content/sections.ts`:

```ts
export const SECTION_IDS = ['mount', 'write', 'tree', 'props', 'commit'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  mount: 'Hello',
  write: 'About',
  tree: 'Experience',
  props: 'Work',
  commit: 'Contact',
};
```

`src/content/profile.ts`:

```ts
import type { Profile } from './types';

export const profile: Profile = {
  name: 'Trey McBride',
  wordmark: '<IReactIt/>',
  greeting: "Hi, I'm Trey.",
  subline: 'I build React that feels effortless.',
  role: 'Principal Engineer',
  links: {
    github: 'https://github.com/NothinButTreys',
    linkedin: 'https://www.linkedin.com/in/thomasmcbrideiii',
    resume: 'https://docs.google.com/document/d/1aCimN1jwt8TFKdIiOJHGyOtdTOPnB-f-KglyM68beMo/edit',
    pixeltable: 'https://pixeltable.net',
  },
};
```

`src/content/experience.ts`:

```ts
import type { Experience } from './types';

export const experience: Experience[] = [
  {
    company: 'PixelTable',
    component: 'PixelTable',
    role: 'CXO & Principal Engineer',
    start: '2023-08',
    end: null,
    highlights: [
      'Built the official Daggerheart Card Creator with Critical Role and Darrington Press',
      'Shipped Alice is Missing: Digital Edition',
      'Helped build the underlying platform and stays hands-on in the codebase daily',
      'Owns the user experience across every PixelTable application',
      'Led the build-out of the Support Portal, a shared community hub for every game title',
    ],
    era: 'recent',
  },
  {
    company: 'Sunstate Equipment Co.',
    component: 'Sunstate',
    role: 'Senior Front-End Software Engineer',
    start: '2023-12',
    end: null,
    highlights: [
      'Builds resilient, performant and secure front-end components for the Sunstate experience',
      'Delivers complex features end to end alongside Product in an agile team',
      'Mentors and coaches engineers across the front end',
    ],
    era: 'recent',
  },
  {
    company: 'RiskLens',
    component: 'RiskLens',
    role: 'Senior Front-End Engineer',
    start: '2022-09',
    end: '2023-07',
    highlights: ['Built front-end features for cyber-risk quantification used to justify security investment decisions'],
    era: 'recent',
  },
  {
    company: 'HostPapa',
    component: 'HostPapa',
    role: 'Senior Software Engineer I',
    start: '2021-06',
    end: '2022-07',
    highlights: [
      'Owned technical breakdowns for upcoming front-end projects',
      'Guided front-end developers while shipping tickets every sprint',
    ],
    era: 'recent',
  },
  {
    company: 'Endurance International Group',
    component: 'Endurance',
    role: 'Senior Software Engineer I · Software Engineer I',
    start: '2017-06',
    end: '2021-06',
    highlights: ['Grew from Software Engineer I to Senior Software Engineer I over four years of front-end work'],
    era: 'recent',
  },
  {
    company: 'Off Madison Ave',
    component: 'OffMadisonAve',
    role: 'Senior Developer',
    start: '2016-01',
    end: '2017-06',
    highlights: ['Built MEAN-stack websites for new and existing agency clients'],
    era: 'early',
  },
  {
    company: 'Pearson Embanet',
    component: 'Pearson',
    role: 'Web Developer',
    start: '2015-04',
    end: '2015-11',
    highlights: [
      'Built responsive sites with HTML5, CSS3/Sass and jQuery, much of it in WordPress',
      'Led the team presentation and documentation on responsive email best practices',
    ],
    era: 'early',
  },
  {
    company: 'Arrowhead Advertising',
    component: 'Arrowhead',
    role: 'Front-End Developer',
    start: '2013-07',
    end: '2015-03',
    highlights: ['Developed client websites and internal applications, including a custom video-upload portal with the media team'],
    era: 'early',
  },
  {
    company: 'Dynamic Page Solutions',
    component: 'DynamicPageSolutions',
    role: 'Web Developer',
    start: '2012-02',
    end: '2013-07',
    highlights: ['Built B2C client sites on a proprietary CMS and maintained its custom templating platform'],
    era: 'early',
  },
  {
    company: 'Firesquire.com',
    component: 'Firesquire',
    role: 'Front-End Developer',
    start: '2009-01',
    end: '2012-02',
    highlights: [
      'Turned designs into standards-compliant HTML/CSS and built custom WordPress themes and plugins',
      'Ran client meetings to gather project specs',
    ],
    era: 'early',
  },
  {
    company: 'Independent Contractor',
    component: 'Freelance',
    role: 'Developer',
    start: '2006-05',
    end: '2009-01',
    highlights: ['Built websites start to finish and helped designers shape layouts and wireframes'],
    era: 'early',
  },
];
```

`src/content/projects.ts`. The copy is a **draft**; `reviewed: false` until Trey fact-checks it:

```ts
import type { Project } from './types';

export const projects: Project[] = [
  {
    slug: 'daggerheart-card-creator',
    name: 'DaggerheartCardCreator',
    title: 'Daggerheart Card Creator',
    tagline: 'Official homebrew & CGL tool',
    year: '2023–present',
    team: 'PixelTable × Critical Role × Darrington Press',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Open the Card Creator', href: 'https://www.daggerheart.com/card-creator' }],
    screenshot: { src: '/projects/daggerheart-card-creator.webp', alt: 'The Daggerheart Card Creator editing a custom domain card' },
    nodes: {
      problem: {
        body: 'Daggerheart players wanted to make homebrew cards that looked and felt official, and creators publishing under the Community Game License needed a sanctioned way to produce them. Hand-built templates in image editors were slow, inconsistent and easy to get wrong.',
      },
      myRole: {
        body: 'As CXO and Principal Engineer at PixelTable I owned the experience end to end: shaping the editor flow with Critical Role and Darrington Press, building core editor features hands-on, and keeping every template faithful to the printed game.',
      },
      architecture: {
        body: 'A template-driven editor: each card type is described as data, and the same description drives both the live on-screen preview and the export, so what a creator sees is exactly what they download as PDF or PNG, on desktop or mobile.',
      },
      hardParts: {
        body: 'Pixel-perfect parity between the preview and exported files across browsers, keeping text fitting and layout stable as creators type, and making a dense, print-oriented editor genuinely comfortable to use on a phone.',
      },
      outcome: {
        body: 'Shipped as the official Daggerheart homebrew tool, with customisable templates, PDF and PNG export, and support for Community Game License submissions, so the community can create content that sits alongside official cards.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'alice-is-missing',
    name: 'AliceIsMissing',
    title: 'Alice is Missing: Digital Edition',
    tagline: 'A silent, real-time mystery',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript', 'Real-time messaging'],
    links: [{ label: 'Play Alice is Missing', href: 'https://aliceismissing.com' }],
    screenshot: { src: '/projects/alice-is-missing.webp', alt: 'Players exchanging in-character text messages during a session' },
    nodes: {
      problem: {
        body: 'Alice is Missing is a silent role-playing game: for ninety minutes players never speak and only text each other in character. Bringing that to the web meant recreating the tension of a group chat without breaking the spell of the table.',
      },
      myRole: {
        body: 'I led the experience and front-end engineering, turning the tabletop rules into an interface that disappears: messaging, timed clue reveals and character information that players reach for without ever stopping to think about the tool.',
      },
      architecture: {
        body: 'Real-time sessions connect every player to a shared game state. Messages, clue cards and the session timer are driven by that state, so each device shows the same story at the same moment while each player keeps their own private view.',
      },
      hardParts: {
        body: 'Keeping a ninety-minute live session in sync when players drop and rejoin, pacing timed reveals so they land together, and designing a chat that feels like a real phone conversation rather than a game menu.',
      },
      outcome: {
        body: 'A live digital edition that preserves what makes the tabletop game special: collaborative storytelling, real-time mystery solving and rich characters, now playable with friends anywhere.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'support-portal',
    name: 'SupportPortal',
    title: 'PixelTable Support Portal',
    tagline: 'One community hub for every game',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript'],
    links: [{ label: 'Visit PixelTable', href: 'https://pixeltable.net' }],
    screenshot: { src: '/projects/support-portal.webp', alt: 'The PixelTable Support Portal showing community discussion threads' },
    nodes: {
      problem: {
        body: 'Players across PixelTable titles had nowhere shared to ask questions, report issues or talk about the games, and the team had no single place to hear from them. Support and community conversations were scattered.',
      },
      myRole: {
        body: 'I led the build-out and expansion of the portal, owning the product direction and user experience and staying hands-on in the implementation as it grew from a support page into a real community space.',
      },
      architecture: {
        body: 'One portal serves every game title: shared community and support features, with each game getting its own space, so a new title plugs in without building a new site and players move between games with one account.',
      },
      hardParts: {
        body: 'Designing one information structure that works for very different games, keeping questions discoverable as the community grows, and letting players reach the development team directly without overwhelming it.',
      },
      outcome: {
        body: 'A centralised hub where players ask questions, discuss games, share ideas and interact with the development team in one place, and a foundation every future PixelTable title launches into.',
      },
    },
    reviewed: false,
  },
  {
    slug: 'natural-world-library',
    name: 'NaturalWorldLibrary',
    title: 'The Natural World Library',
    tagline: 'Field guides for mycology, herbalism & geology',
    year: '2023–present',
    team: 'PixelTable',
    stack: ['React', 'TypeScript', 'Search & data'],
    links: [{ label: 'Explore the Library', href: 'https://www.thenaturalworldlibrary.com/' }],
    screenshot: { src: '/projects/natural-world-library.webp', alt: 'A species entry in the Natural World Library field guide' },
    nodes: {
      problem: {
        body: 'Amateur enthusiasts and professional researchers needed one trustworthy place to identify fungi, plants, herbs and minerals: a reference deep enough for experts yet approachable for someone standing in a forest with a phone.',
      },
      myRole: {
        body: 'I shaped the reading and identification experience and built interface features hands-on, making a large and growing reference library feel like a friendly field guide in your pocket instead of a database.',
      },
      architecture: {
        body: 'A structured species database powers primers for geology, herbalism and mycology, with interactive identification tools and a wiki-style reading experience layered on the same data, so new primers reuse the whole platform.',
      },
      hardParts: {
        body: 'Presenting dense scientific data clearly on small screens out in the field, guiding identification step by step without oversimplifying it, and designing for community contributions without ever compromising accuracy.',
      },
      outcome: {
        body: 'A growing digital library with Geologist, Herbalist and Mycologist primers already live and an Avian primer on the way, serving curious hobbyists and professional researchers alike from one shared, trustworthy source.',
      },
    },
    reviewed: false,
  },
];
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `pnpm test src/content`
Expected: all pass. If a word-count assertion fails, edit that node's copy (keep it truthful) rather than loosening the test.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat(content): typed sections, profile, experience and draft case studies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact API (schema, rate limiter, handler, Resend adapter, route)

**Files:**
- Create: `src/lib/contactSchema.ts`, `src/lib/contactSchema.test.ts`, `src/lib/rateLimit.ts`, `src/lib/rateLimit.test.ts`, `src/lib/safeEqual.ts`, `src/lib/safeEqual.test.ts`, `src/features/contact/server/handleContact.ts`, `src/features/contact/server/handleContact.test.ts`, `src/features/contact/server/sendContactEmail.ts`, `api/contact.ts`, `vite-plugins/devApi.ts`
- Modify: `vite.config.ts` (register `devApi()`)

**Interfaces:**
- Produces:
  - `contactSchema` (zod) and `type ContactInput = { name: string; email: string; message: string; company?: string }`
  - `createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): (key: string) => boolean` (returns `true` when allowed)
  - `safeEqual(a: string, b: string): boolean`
  - `createContactHandler(deps: { send: (input: ContactInput) => Promise<void>; limiter: (key: string) => boolean; ditlToken?: string }): (req: Request) => Promise<Response>`
  - Response JSON: 400 `{ ok: false, error: 'invalid', fieldErrors }`; 200 `{ ok: true }`; dry run 200 `{ ok: true, dryRun: true }`; 429 `{ ok: false, error: 'rate_limited' }`; 502 `{ ok: false, error: 'send_failed' }`.
  - `POST /api/contact`, served by Vercel in deployments and by `devApi()` in `vite dev` and `vite preview`

- [ ] **Step 1: Write the failing schema tests**

`src/lib/contactSchema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contactSchema } from './contactSchema';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello Trey, loved the site!' };

describe('contactSchema', () => {
  it('accepts a valid message and trims whitespace', () => {
    const r = contactSchema.safeParse({ ...valid, name: '  Ada  ' });
    expect(r.success).toBe(true);
    expect(r.success && r.data.name).toBe('Ada');
  });

  it.each([
    ['empty name', { name: '' }],
    ['name over 100 chars', { name: 'a'.repeat(101) }],
    ['bad email', { email: 'not-an-email' }],
    ['short message', { message: 'too short' }],
    ['message over 5000 chars', { message: 'a'.repeat(5001) }],
  ])('rejects %s', (_, patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it('allows the honeypot field', () => {
    expect(contactSchema.safeParse({ ...valid, company: 'bot inc' }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test src/lib/contactSchema.test.ts`
Expected: FAIL, import not resolved.

- [ ] **Step 3: Implement `src/lib/contactSchema.ts`**

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Tell me your name').max(100),
  email: z.email('That email looks off'),
  message: z.string().trim().min(10, 'A little more detail, please').max(5000),
  company: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 4: Confirm it passes**

Run: `pnpm test src/lib/contactSchema.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing rate-limit and safeEqual tests**

`src/lib/rateLimit.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows up to the limit per key within the window, then blocks', () => {
    let t = 0;
    const allow = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true);
  });

  it('frees capacity once earlier hits leave the window', () => {
    let t = 0;
    const allow = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(allow('a')).toBe(true);
    t = 999;
    expect(allow('a')).toBe(false);
    t = 1000;
    expect(allow('a')).toBe(true);
  });
});
```

`src/lib/safeEqual.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { safeEqual } from './safeEqual';

describe('safeEqual', () => {
  it('matches identical strings only', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});
```

- [ ] **Step 6: Confirm they fail**

Run: `pnpm test src/lib/rateLimit.test.ts src/lib/safeEqual.test.ts`
Expected: FAIL, imports not resolved.

- [ ] **Step 7: Implement both**

`src/lib/rateLimit.ts`:

```ts
type Options = { limit: number; windowMs: number; now?: () => number };

/** Best-effort, per-instance sliding window. Serverless instances do not share it. */
export function createRateLimiter({ limit, windowMs, now = Date.now }: Options) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((ts) => t - ts < windowMs);
    const allowed = recent.length < limit;
    if (allowed) recent.push(t);
    hits.set(key, recent);
    return allowed;
  };
}
```

`src/lib/safeEqual.ts`:

```ts
import { createHash, timingSafeEqual } from 'node:crypto';

/** Constant-time comparison; hashing first equalises lengths. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}
```

- [ ] **Step 8: Confirm they pass**

Run: `pnpm test src/lib`
Expected: PASS.

- [ ] **Step 9: Write the failing handler tests**

`src/features/contact/server/handleContact.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createContactHandler } from './handleContact';

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, Trey!' };

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4, 10.0.0.1', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function setup(overrides: Partial<Parameters<typeof createContactHandler>[0]> = {}) {
  const send = vi.fn<(i: unknown) => Promise<void>>().mockResolvedValue(undefined);
  const limiter = vi.fn<(k: string) => boolean>().mockReturnValue(true);
  const handler = createContactHandler({ send, limiter, ditlToken: 'ditl-secret', ...overrides });
  return { send, limiter, handler };
}

describe('POST /api/contact handler', () => {
  it('sends a valid message and returns 200', async () => {
    const { handler, send } = setup();
    const res = await handler(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining(valid));
  });

  it('returns 400 for malformed JSON', async () => {
    const { handler, send } = setup();
    const res = await handler(req('{nope'));
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns 400 with field errors for invalid input', async () => {
    const { handler } = setup();
    const res = await handler(req({ ...valid, email: 'bad' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid');
    expect(body.fieldErrors.email).toBeDefined();
  });

  it('silently accepts honeypot submissions without sending', async () => {
    const { handler, send } = setup();
    const res = await handler(req({ ...valid, company: 'spam co' }));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('rate-limits by the first forwarded IP', async () => {
    const { handler, limiter, send } = setup();
    limiter.mockReturnValue(false);
    const res = await handler(req(valid));
    expect(res.status).toBe(429);
    expect(limiter).toHaveBeenCalledWith('1.2.3.4');
    expect(send).not.toHaveBeenCalled();
  });

  it('dry-runs when the DITL token matches', async () => {
    const { handler, send } = setup();
    const res = await handler(req(valid, { 'x-ditl-token': 'ditl-secret' }));
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('ignores a wrong DITL token and sends for real', async () => {
    const { handler, send } = setup();
    await handler(req(valid, { 'x-ditl-token': 'guess' }));
    expect(send).toHaveBeenCalledOnce();
  });

  it('never dry-runs when no DITL token is configured', async () => {
    const { handler, send } = setup({ ditlToken: undefined });
    await handler(req(valid, { 'x-ditl-token': '' }));
    expect(send).toHaveBeenCalledOnce();
  });

  it('returns 502 when delivery fails', async () => {
    const { handler, send } = setup();
    send.mockRejectedValue(new Error('resend down'));
    const res = await handler(req(valid));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'send_failed' });
  });
});
```

- [ ] **Step 10: Confirm it fails**

Run: `pnpm test src/features/contact`
Expected: FAIL, import not resolved.

- [ ] **Step 11: Implement `src/features/contact/server/handleContact.ts`**

```ts
import { z } from 'zod';
import { contactSchema, type ContactInput } from '../../../lib/contactSchema.js';
import { safeEqual } from '../../../lib/safeEqual.js';

type Deps = {
  send: (input: ContactInput) => Promise<void>;
  limiter: (key: string) => boolean;
  ditlToken?: string;
};

const json = (status: number, body: unknown) => Response.json(body, { status });

function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function createContactHandler({ send, limiter, ditlToken }: Deps) {
  return async function handleContact(req: Request): Promise<Response> {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { ok: false, error: 'invalid', fieldErrors: {} });
    }

    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      return json(400, { ok: false, error: 'invalid', fieldErrors: z.flattenError(parsed.error).fieldErrors });
    }

    if (parsed.data.company) return json(200, { ok: true });

    if (!limiter(clientIp(req))) return json(429, { ok: false, error: 'rate_limited' });

    const header = req.headers.get('x-ditl-token');
    if (ditlToken && header && safeEqual(header, ditlToken)) {
      return json(200, { ok: true, dryRun: true });
    }

    try {
      await send(parsed.data);
    } catch (err) {
      console.error('[contact] send failed', err);
      return json(502, { ok: false, error: 'send_failed' });
    }
    return json(200, { ok: true });
  };
}
```

- [ ] **Step 12: Confirm it passes**

Run: `pnpm test src/features/contact`
Expected: 9 passed.

- [ ] **Step 13: Implement the Resend adapter and route (the thin wiring layer, covered by e2e in Task 7)**

`src/features/contact/server/sendContactEmail.ts`:

```ts
import { Resend } from 'resend';
import type { ContactInput } from '../../../lib/contactSchema.js';

export async function sendContactEmail(input: ContactInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) throw new Error('Contact email is not configured');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? 'IReactIt <onboarding@resend.dev>',
    to,
    replyTo: input.email,
    subject: `ireactit.com: commit from ${input.name}`,
    text: `${input.message}\n\n— ${input.name} <${input.email}>`,
  });
  if (error) throw new Error(error.message);
}
```

`api/contact.ts` (the env is read per request, so values loaded after import still apply):

```ts
import { createContactHandler } from '../src/features/contact/server/handleContact.js';
import { sendContactEmail } from '../src/features/contact/server/sendContactEmail.js';
import { createRateLimiter } from '../src/lib/rateLimit.js';

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export function POST(request: Request): Promise<Response> {
  return createContactHandler({ send: sendContactEmail, limiter, ditlToken: process.env.DITL_TOKEN })(request);
}
```

`vite-plugins/devApi.ts`. It serves the same function locally, so neither dev nor CI needs the Vercel CLI:

```ts
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

type ApiModule = { POST: (request: Request) => Promise<Response> };
type Load = () => Promise<ApiModule>;

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`, {
    method: req.method,
    headers,
    body: chunks.length ? Buffer.concat(chunks) : undefined,
  });
}

async function writeWebResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function mount(middlewares: ViteDevServer['middlewares'], load: Load) {
  middlewares.use('/api/contact', async (req, res, next) => {
    if (req.method !== 'POST') return next();
    try {
      const { POST } = await load();
      await writeWebResponse(res, await POST(await toWebRequest(req)));
    } catch (err) {
      next(err);
    }
  });
}

export function devApi(): Plugin {
  return {
    name: 'ireactit-dev-api',
    configureServer(server) {
      mount(server.middlewares, () => server.ssrLoadModule('/api/contact.ts') as Promise<ApiModule>);
    },
    configurePreviewServer(server) {
      let loader: Promise<ViteDevServer> | undefined;
      mount(server.middlewares, async () => {
        loader ??= createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom' });
        return (await loader).ssrLoadModule('/api/contact.ts') as Promise<ApiModule>;
      });
    },
  };
}
```

Register it in `vite.config.ts`: add `import { devApi } from './vite-plugins/devApi';` and change the plugins line to `plugins: [react(), tailwindcss(), devApi()],`.

Smoke-test it:

```bash
pnpm build && (pnpm preview > /tmp/ireactit-preview.log 2>&1 &) && sleep 4
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:4173/api/contact -H 'content-type: application/json' -d '{"name":""}'
pkill -f "vite preview"
```

Expected: `400`.

- [ ] **Step 14: Verify and commit**

Run: `pnpm coverage && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green, with coverage at 90% or more on the included paths.

```bash
git add -A
git commit -m "feat(contact): validated, rate-limited contact API with DITL dry-run

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Shared providers (RenderCounter, ViewSource), active-section tracking, Nav and page skeleton

**Files:**
- Create: `src/features/render-counter/RenderCounter.tsx`, `src/features/render-counter/RenderCounter.test.tsx`, `src/features/view-source/ViewSource.tsx`, `src/features/view-source/ViewSource.test.tsx`, `src/features/nav/useActiveSection.ts`, `src/features/nav/useActiveSection.test.tsx`, `src/features/nav/Nav.tsx`, `src/features/nav/Nav.test.tsx`, `src/ui/Section.tsx`
- Create: `src/Providers.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `SECTION_IDS`, `SECTION_LABELS`, `profile` (Task 4); `ThemeToggle` (Task 3)
- Produces:
  - `RenderCounterProvider`, `useRenderCount(): { count: number; bump: () => void }`, `<RenderCounterBadge />`
  - `ViewSourceProvider`, `useViewSource(): { enabled: boolean; toggle: () => void }`, `<ViewSourceToggle />`
  - `useActiveSection(ids: readonly string[]): string`
  - `<Nav />`, `<Section id: SectionId; labelledBy?: string; className?: string; children />`

- [ ] **Step 1: Write the failing provider tests**

`src/features/render-counter/RenderCounter.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenderCounterBadge, RenderCounterProvider, useRenderCount } from './RenderCounter';

function Bumper() {
  const { bump } = useRenderCount();
  return <button onClick={bump}>bump</button>;
}

describe('RenderCounter', () => {
  it('starts at 0 and increments on bump', async () => {
    render(
      <RenderCounterProvider>
        <RenderCounterBadge />
        <Bumper />
      </RenderCounterProvider>,
    );
    expect(screen.getByText('renders: 0')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'bump' }));
    await userEvent.click(screen.getByRole('button', { name: 'bump' }));
    expect(screen.getByText('renders: 2')).toBeInTheDocument();
  });

  it('throws a helpful error outside the provider', () => {
    expect(() => render(<Bumper />)).toThrow('useRenderCount must be used inside <RenderCounterProvider>');
  });
});
```

`src/features/view-source/ViewSource.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSourceProvider, ViewSourceToggle, useViewSource } from './ViewSource';

function Probe() {
  const { enabled } = useViewSource();
  return <p>{enabled ? 'source' : 'rendered'}</p>;
}

describe('ViewSource', () => {
  it('toggles between rendered and source with aria-pressed', async () => {
    render(
      <ViewSourceProvider>
        <ViewSourceToggle />
        <Probe />
      </ViewSourceProvider>,
    );
    const btn = screen.getByRole('button', { name: 'View source' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('rendered')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('source')).toBeInTheDocument();
  });

  it('throws a helpful error outside the provider', () => {
    expect(() => render(<Probe />)).toThrow('useViewSource must be used inside <ViewSourceProvider>');
  });
});
```

- [ ] **Step 2: Confirm they fail**

Run: `pnpm test src/features/render-counter src/features/view-source`
Expected: FAIL, imports not resolved. React may log the thrown error to the console; that's expected.

- [ ] **Step 3: Implement both providers**

`src/features/render-counter/RenderCounter.tsx`:

```tsx
import { createContext, use, useCallback, useMemo, useState } from 'react';

type RenderCount = { count: number; bump: () => void };

const RenderCountContext = createContext<RenderCount | null>(null);

export function RenderCounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const bump = useCallback(() => setCount((c) => c + 1), []);
  const value = useMemo(() => ({ count, bump }), [count, bump]);
  return <RenderCountContext value={value}>{children}</RenderCountContext>;
}

export function useRenderCount(): RenderCount {
  const value = use(RenderCountContext);
  if (!value) throw new Error('useRenderCount must be used inside <RenderCounterProvider>');
  return value;
}

export function RenderCounterBadge() {
  const { count } = useRenderCount();
  return <span className="font-mono text-xs tabular-nums text-muted">renders: {count}</span>;
}
```

`src/features/view-source/ViewSource.tsx`:

```tsx
import { createContext, use, useCallback, useMemo, useState } from 'react';

type ViewSource = { enabled: boolean; toggle: () => void };

const ViewSourceContext = createContext<ViewSource | null>(null);

export function ViewSourceProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const toggle = useCallback(() => setEnabled((e) => !e), []);
  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);
  return <ViewSourceContext value={value}>{children}</ViewSourceContext>;
}

export function useViewSource(): ViewSource {
  const value = use(ViewSourceContext);
  if (!value) throw new Error('useViewSource must be used inside <ViewSourceProvider>');
  return value;
}

export function ViewSourceToggle() {
  const { enabled, toggle } = useViewSource();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="font-mono text-xs text-muted transition-colors hover:text-primary aria-pressed:text-primary"
    >
      View source
    </button>
  );
}
```

- [ ] **Step 4: Confirm they pass**

Run: `pnpm test src/features/render-counter src/features/view-source`
Expected: 4 passed.

- [ ] **Step 5: Write the failing `useActiveSection` test**

`src/features/nav/useActiveSection.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let trigger: Callback = () => {};
let observed: Element[] = [];
let disconnected = false;

class FakeIO {
  constructor(cb: Callback) {
    trigger = cb;
  }
  observe(el: Element) {
    observed.push(el);
  }
  disconnect() {
    disconnected = true;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const ids = ['a', 'b', 'c'] as const;

function Probe() {
  return <p data-testid="active">{useActiveSection(ids)}</p>;
}

describe('useActiveSection', () => {
  beforeEach(() => {
    observed = [];
    disconnected = false;
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
    for (const id of ids) {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
    }
  });
  afterEach(() => {
    for (const id of ids) document.getElementById(id)?.remove();
  });

  it('defaults to the first id and observes every section', () => {
    render(<Probe />);
    expect(screen.getByTestId('active')).toHaveTextContent('a');
    expect(observed.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('switches to the section crossing the centre band', () => {
    render(<Probe />);
    act(() => trigger([{ target: document.getElementById('b')!, isIntersecting: true }]));
    expect(screen.getByTestId('active')).toHaveTextContent('b');
    act(() => trigger([{ target: document.getElementById('b')!, isIntersecting: false }]));
    expect(screen.getByTestId('active')).toHaveTextContent('b');
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();
    expect(disconnected).toBe(true);
  });
});
```

- [ ] **Step 6: Confirm it fails**

Run: `pnpm test src/features/nav/useActiveSection.test.tsx`
Expected: FAIL, import not resolved.

- [ ] **Step 7: Implement `src/features/nav/useActiveSection.ts`**

```ts
import { useEffect, useState } from 'react';

/** Tracks which section crosses a thin band just above the viewport centre. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
```

- [ ] **Step 8: Confirm it passes**

Run: `pnpm test src/features/nav/useActiveSection.test.tsx`
Expected: 3 passed.

- [ ] **Step 9: Write the failing Nav test**

`src/features/nav/Nav.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Nav } from './Nav';
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

vi.mock('./useActiveSection', () => ({ useActiveSection: () => 'tree' }));

function renderNav() {
  return render(
    <RenderCounterProvider>
      <ViewSourceProvider>
        <Nav />
      </ViewSourceProvider>
    </RenderCounterProvider>,
  );
}

describe('<Nav />', () => {
  it('renders the lifecycle rail in render-cycle order with hash links', () => {
    renderNav();
    const rail = screen.getByRole('navigation', { name: 'Render cycle' });
    const links = within(rail).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['#mount', '#write', '#tree', '#props', '#commit']);
    expect(links.map((l) => l.textContent)).toEqual(['mount', 'write', 'tree', 'props', 'commit']);
  });

  it('marks the active step with aria-current', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'tree' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'mount' })).not.toHaveAttribute('aria-current');
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

- [ ] **Step 10: Confirm it fails**

Run: `pnpm test src/features/nav/Nav.test.tsx`
Expected: FAIL, import not resolved.

- [ ] **Step 11: Implement `src/features/nav/Nav.tsx`**

```tsx
import { SECTION_IDS } from '@/content/sections';
import { profile } from '@/content/profile';
import { RenderCounterBadge } from '@/features/render-counter/RenderCounter';
import { ViewSourceToggle } from '@/features/view-source/ViewSource';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { useActiveSection } from './useActiveSection';

export function Nav() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#mount" className="font-mono text-sm font-semibold text-fg hover:text-primary">
          {profile.wordmark}
        </a>
        <nav aria-label="Render cycle" className="hidden md:block">
          <ol className="flex items-center gap-1 font-mono text-xs">
            {SECTION_IDS.map((id, i) => (
              <li key={id} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden className="text-border">·</span>}
                <a
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className="rounded px-2 py-1 text-muted transition-colors hover:text-fg aria-[current=location]:text-primary"
                >
                  {id}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex items-center gap-4">
          <RenderCounterBadge />
          <ViewSourceToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 12: Confirm it passes**

Run: `pnpm test src/features/nav`
Expected: 6 passed.

- [ ] **Step 13: Add the Section shell, providers and page skeleton**

`src/ui/Section.tsx`:

```tsx
import type { SectionId } from '@/content/sections';

type Props = { id: SectionId; labelledBy?: string; className?: string; children: React.ReactNode };

export function Section({ id, labelledBy, className = '', children }: Props) {
  return (
    <section id={id} aria-labelledby={labelledBy ?? `${id}-title`} className={`scroll-mt-14 ${className}`}>
      {children}
    </section>
  );
}
```

`src/Providers.tsx`:

```tsx
import { RenderCounterProvider } from '@/features/render-counter/RenderCounter';
import { ViewSourceProvider } from '@/features/view-source/ViewSource';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RenderCounterProvider>
      <ViewSourceProvider>{children}</ViewSourceProvider>
    </RenderCounterProvider>
  );
}
```

`src/App.tsx` (replaces the Task 2 version). This is the skeleton that Plan 2 fills in; each section has real headings and content:

```tsx
import { SECTION_IDS, SECTION_LABELS } from '@/content/sections';
import { profile } from '@/content/profile';
import { Nav } from '@/features/nav/Nav';
import { Section } from '@/ui/Section';
import { Providers } from './Providers';

export function App() {
  return (
    <Providers>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pt-14">
        {SECTION_IDS.map((id) => (
          <Section key={id} id={id} className="flex min-h-svh flex-col justify-center py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{id}</p>
            {id === 'mount' ? (
              <>
                <h1 id="mount-title" className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
                  {profile.greeting}
                </h1>
                <p className="mt-4 text-xl text-muted">
                  {profile.role}. {profile.subline}
                </p>
              </>
            ) : (
              <h2 id={`${id}-title`} className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                {SECTION_LABELS[id]}
              </h2>
            )}
          </Section>
        ))}
      </main>
    </Providers>
  );
}
```

- [ ] **Step 14: Verify and commit**

Run: `pnpm coverage && pnpm typecheck && pnpm lint && pnpm build`
Expected: all green.

```bash
git add -A
git commit -m "feat(nav): render counter, view source, lifecycle rail and page skeleton

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Playwright (e2e, a11y, DITL smoke), CI, deploy-check, first push and PR

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/ditl/smoke.spec.ts`, `.github/workflows/ci.yml`, `.github/workflows/deploy-check.yml`

**Interfaces:**
- Consumes: the section ids, the Nav roles and labels (Task 6), `POST /api/contact` with dry-run (Task 5)
- Produces: `BASE_URL`-driven Playwright projects `chromium`, `webkit`, `mobile`; the CI check names `ci` and `deploy-check`; the open PR `rebuild → main`

- [ ] **Step 1: Add `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env.local'); // local DITL_TOKEN; absent in CI
} catch {
  /* no .env.local */
}

const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' }
      : undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'pnpm preview', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
```

- [ ] **Step 2: Write the e2e and DITL specs (they fail until the server runs; Step 3 proves that)**

`tests/e2e/navigation.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const ids = ['mount', 'write', 'tree', 'props', 'commit'];

test('renders every render-cycle section in order', async ({ page }) => {
  await page.goto('/');
  const found = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id));
  expect(found).toEqual(ids);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hi, I'm Trey.");
});

for (const id of ids) {
  test(`deep link /#${id} lands on that section`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}

test('rail marks the section in view as current', async ({ page, isMobile }) => {
  test.skip(isMobile, 'rail is hidden below md');
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Render cycle' }).getByRole('link', { name: 'props' }).click();
  await expect(page.getByRole('link', { name: 'props' })).toHaveAttribute('aria-current', 'location');
});

test('theme toggle persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' }); // Playwright defaults to light
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
```

`tests/e2e/a11y.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light'] as const) {
  test(`no serious or critical axe violations (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
```

`tests/ditl/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('Day in the Life: smoke', () => {
  test('a visitor can reach every step of the render cycle', async ({ page }) => {
    await page.goto('/');
    for (const id of ['mount', 'write', 'tree', 'props', 'commit']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('the contact API accepts a dry-run commit', async ({ request }) => {
    const token = process.env.DITL_TOKEN;
    test.skip(!token, 'DITL_TOKEN not set');
    const res = await request.post('/api/contact', {
      headers: { 'x-ditl-token': token! },
      data: { name: 'Ditl Bot', email: 'ditl@example.com', message: 'Day in the life smoke test.' },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
  });
});
```

- [ ] **Step 3: Run it locally**

```bash
pnpm exec playwright install chromium webkit
pnpm build
pnpm e2e
```

Expected: all specs pass on chromium, webkit and mobile, including the dry-run test (`.env.local` is loaded by both `vite preview`, through `vite.config.ts`, and the Playwright config). If axe reports a contrast failure in light mode, adjust that light token in `src/styles.css` and re-run. Do not suppress the rule.

- [ ] **Step 4: Add `.github/workflows/ci.yml`**

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      DITL_TOKEN: ci-local-dry-run-token
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm coverage
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium webkit
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-ci
          path: playwright-report
          retention-days: 7
```

- [ ] **Step 5: Add `.github/workflows/deploy-check.yml`**

```yaml
name: deploy-check
on: deployment_status
jobs:
  deploy-check:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      BASE_URL: ${{ github.event.deployment_status.target_url }}
      DITL_TOKEN: ${{ secrets.DITL_TOKEN }}
      VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
      DEPLOY_ENV: ${{ github.event.deployment.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.deployment.sha }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium webkit
      - name: Run against deployment
        run: |
          echo "Testing $DEPLOY_ENV deployment at $BASE_URL"
          if [ "$DEPLOY_ENV" = "Production" ]; then
            pnpm e2e:ditl
          else
            pnpm exec playwright test tests/e2e tests/ditl
          fi
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-deploy
          path: playwright-report
          retention-days: 7
```

- [ ] **Step 6: Commit, push and open a draft PR**

```bash
git add -A
git commit -m "test: Playwright e2e, a11y and DITL smoke; CI and deploy-check workflows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin rebuild
gh pr create --draft --base main --head rebuild --title "Rebuild ireactit.com: The Render Cycle" --body "$(cat <<'EOF'
Rebuilds ireactit.com as a single-page, TDD-built Vite + React portfolio themed as React's render cycle.

- Spec: `docs/superpowers/specs/2026-09-28-ireactit-portfolio-design.md`
- Plan 1 (foundation): `docs/superpowers/plans/2026-09-28-ireactit-plan-1-foundation.md`

Merging this PR is the production cutover. It stays a draft until Plans 2 and 3 land.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 7: Verify both gates on the real deployment.** Load `mcp__ccd_pr__get_status` with ToolSearch and check the PR. The expected result is that `ci` passes, then Vercel posts a Preview deployment, then `deploy-check` runs against the preview URL and passes. If `deploy-check` fails, use the Vercel connector's `get_deployment_events` and `get_runtime_logs` for that deployment, then follow superpowers:systematic-debugging.

- [ ] **Step 8: Protect `main`**

```bash
gh api -X PUT repos/NothinButTreys/ireactit/branches/main/protection --input - <<'EOF'
{
  "required_status_checks": { "strict": true, "contexts": ["ci", "deploy-check"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
EOF
gh api repos/NothinButTreys/ireactit/branches/main/protection -q '.required_status_checks.contexts'
```

Expected: `["ci","deploy-check"]`

---

## Execution notes

- Task 1 needs Trey's go-ahead (Step 1) and possibly one dashboard click (the production branch).
- Tasks 2 → 3 → 4 → 5 → 6 → 7 run in order: each builds on the scaffold and the shared `package.json`. Tasks 4 and 5 touch disjoint files and may run in parallel after Task 3, if a separate worktree is used for each.
- The Claude Design mockups (the spec's Delivery Process §1) can run **at the same time** as this plan. Plan 2 is written once the design is approved.
