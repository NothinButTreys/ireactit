# IReactIt Plan 3: Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the feature-complete `rebuild` branch to launch quality. That means security headers and CSP, a social image, the four Day-in-the-Life personas, visual baselines, Lighthouse budgets, supply-chain hardening and the interactive README. After that the branch goes through the final review gate and is ready for the cutover merge.

**Architecture:** No new runtime features. Everything here is configuration (`vercel.json`, workflows), static assets (`public/og.png`, `docs/readme/*`), Playwright suites (`tests/ditl`, `tests/visual`) and small build-time checker scripts in `scripts/`. Each script exports pure functions that Vitest covers, and a thin CLI that calls them.

**Tech Stack:**
- The app: Vite 8, React 19, TS ~6.0.3 strict, Tailwind v4.
- Tests and tooling: Playwright 1.63, Vitest 5, tsx.
- New dev dependencies: `@lhci/cli` (Lighthouse CI), `eslint-plugin-jsx-a11y`, `gifenc` and `pngjs` (README GIF).

## Global Constraints

- The spec is `docs/superpowers/specs/2026-09-28-ireactit-portfolio-design.md`. Its success criteria: Lighthouse Performance ≥ 95, Accessibility = 100, CLS < 0.05, initial JS < 150 KB gzip, zero moderate/serious/critical axe violations in any state.
- **Privacy (Trey's decision, overrides spec §8's `mailto:` fallback):** no email address and no phone number may appear anywhere public. That covers the site, the README, og.png, screenshots and GIFs. The contact fallback is LinkedIn only.
- **CSP:**
  - `style-src 'self' 'unsafe-inline'`, because React style attributes and Shiki inline styles need it.
  - `script-src 'self'` plus the sha256 of each inline `<script>` in the built `dist/index.html`.
  - No `unsafe-eval`, and no third-party origins.
- Server-chain files (`api/**`, `src/lib/contactSchema.ts`, `rateLimit.ts`, `safeEqual.ts`) use relative `.js` imports, never `@/`.
- Tests use `tests/fixtures.ts` (`import { expect, test } from '../fixtures'`). It fails any test on a console error or page error. `allowConsoleErrors` is a single `RegExp | null`.
- **Motion:** animate only `transform`, `opacity` and `filter: blur`, and never animate layout. Hidden states live under `html.js`.
- **WebKit** can't launch on Trey's Mac (macOS 14). Run `--project=chromium --project=mobile` locally; CI covers WebKit. Visual baselines are generated in Docker (`mcr.microsoft.com/playwright:v1.63.0-noble`), never on macOS.
- **Commits** end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push unless a step says to.
- **Full local gate:** `pnpm coverage && pnpm typecheck && pnpm lint && pnpm build && pnpm check:bundle && pnpm e2e --project=chromium --project=mobile`
- Implementer subagents never merge PR #1 or touch `main`. The controller does the cutover after the final gate (Trey authorised it 2026-09-29).

---

### Task 1: Plan 2 minor-findings cleanup

**Files:**
- Modify:
  - `src/content/snippets.test.ts`
  - `src/features/career-tree/EarlyCareerNode.tsx`
  - `src/features/career-tree/CareerTree.tsx`
  - `src/features/projects/Projects.tsx`
  - `src/features/projects/lazyInspector.test.tsx`
  - `.gitignore`
- Test: the existing colocated tests, plus the new cases below.

**Interfaces:** No public API changes.

- [ ] **Step 1: Tighten the snippet drift test.** In `src/content/snippets.test.ts`, extend the check so that for each snippet, every `data-[a-z-]+` attribute name and every `\w+\.current` ref it contains also appears in its source file. Add the loop inside the existing per-snippet test:

```ts
const attrs = [...snippet.matchAll(/\bdata-[a-z-]+/g)].map((m) => m[0]);
const refs = [...snippet.matchAll(/\b(\w+)\.current\b/g)].map((m) => `${m[1]}.current`);
for (const token of new Set([...attrs, ...refs])) {
  expect(source, `${file}: snippet mentions ${token}, source does not`).toContain(token);
}
```

  To prove the check works, first temporarily change `mount.snippet` to put `data-hero-mount` on a token that isn't in `Hero.tsx`, e.g. `data-hero-mountx`. Run `pnpm test src/content/snippets` and confirm it FAILS. Then revert the snippet and confirm it PASSES.

- [ ] **Step 2: EarlyCareer open state survives a toggle before hydration.**
  - Write a failing test in `CareerTree.test.tsx`: render the static markup with `<details open>` already open (simulating a user toggle before hydration), mount at a pinned width, and assert that the scroll container has `data-lenis-prevent`.
  - Fix it in `EarlyCareerNode.tsx`: add a mount effect that reads `ref.current.open` and calls `onToggle(ref.current.open)` if it's true.

- [ ] **Step 3: Unambiguous state set.** In `Projects.tsx`, replace `setInspectorPanel(createInspector())` with `setInspectorPanel(() => createInspector())`. The existing `Projects.lazyFailure.test.tsx` must stay green.

- [ ] **Step 4: Remove the `as never` cast** in `lazyInspector.test.tsx`. Build a real `Project` from `projects[0]` (`import { projects } from '@/content/projects'`) and pass `opener: null` as its real type.

- [ ] **Step 4b: Mobile `/#tree` CLS on a slow CPU.** Found in the CI-fix round (`.superpowers/sdd/p2/ci-fix-report.md`): on a phone with 8–20× CPU throttling, the hero grows *after* the hash scroll lands, which measures CLS 0.05–0.27.
  - Reproduce with an e2e: in a Pixel 7 context, use CDP `Emulation.setCPUThrottlingRate` at rate 8, `goto('/#tree')`, and apply the load-CLS helper from `tests/e2e/tree.spec.ts`.
  - Watch it go RED, then find what in the hero changes height after first paint (typing text, the mount subline, an image or font). Reserve that space in the prerendered HTML (fixed min-height, or the final text already in place but visually hidden) so nothing above `#tree` moves.
  - The e2e goes GREEN with CLS < 0.05, and the desktop and reload CLS tests stay at 0.

- [ ] **Step 5: Hygiene.**
  - Add `.pw-out/` and `tests/zz-probe/` to `.gitignore`, and delete `tests/zz-probe/` if it exists (it holds throwaway debugging probes).
  - Confirm `pnpm e2e` doesn't pick up any probe spec.

- [ ] **Step 6: Run the full gate, then commit.**

```bash
git add -A
git commit -m "chore: resolve Plan 2 review minors (snippet drift guard, early-career pre-hydration toggle, lazy setState form)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Security headers and CSP

**Files:**
- Create: `scripts/csp.ts`, `scripts/csp.test.ts`, `scripts/check-csp.ts`, `tests/e2e/headers.spec.ts`
- Modify: `vercel.json`, `package.json` (script `check:csp`), `.github/workflows/ci.yml` (run it after `check:bundle`), `playwright.config.ts` (add `x-vercel-skip-toolbar: 1` to `extraHTTPHeaders` so the Vercel preview toolbar never injects scripts that the CSP would block and the console-error fixture would then fail on)

**Interfaces:**
- Produces:
  - `inlineScriptHashes(html: string): string[]` returns `'sha256-…'` source tokens.
  - `buildCsp(scriptHashes: string[]): string`
  - `readCspFromVercelJson(json: unknown): string | undefined`

- [ ] **Step 1: Write the failing tests.** `scripts/csp.test.ts`:

```ts
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildCsp, inlineScriptHashes, readCspFromVercelJson } from './csp';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;

describe('inlineScriptHashes', () => {
  it('hashes inline scripts exactly as written, and skips external and JSON scripts', () => {
    const html = `<script>a()</script><script type="module" src="/x.js"></script><script type="application/json">{}</script><script>\n b() \n</script>`;
    expect(inlineScriptHashes(html)).toEqual([sha('a()'), sha('\n b() \n')]);
  });
});

describe('buildCsp', () => {
  it('locks everything to self and allows only the given script hashes', () => {
    const csp = buildCsp(["'sha256-abc'"]);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'sha256-abc'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('readCspFromVercelJson', () => {
  it('finds the CSP header on the catch-all route', () => {
    const json = { headers: [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: 'x' }] }] };
    expect(readCspFromVercelJson(json)).toBe('x');
  });
});
```

Add `scripts/**/*.test.ts` coverage (it's already in the Vitest include). Run `pnpm test scripts/csp`. Expected: FAIL (the module is missing).

- [ ] **Step 2: Implement `scripts/csp.ts`.**

```ts
import { createHash } from 'node:crypto';

/** CSP source tokens for every inline classic script in the document, hashed byte-for-byte. */
export function inlineScriptHashes(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] ?? '';
    if (/\bsrc=/.test(attrs) || /type="(?!text\/javascript|module)[^"]*"/.test(attrs)) continue;
    out.push(`'sha256-${createHash('sha256').update(m[2]!).digest('base64')}'`);
  }
  return out;
}

export function buildCsp(scriptHashes: string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

export function readCspFromVercelJson(json: unknown): string | undefined {
  const rules = (json as { headers?: HeaderRule[] }).headers ?? [];
  return rules
    .find((r) => r.source === '/(.*)')
    ?.headers.find((h) => h.key.toLowerCase() === 'content-security-policy')?.value;
}
```

Run the tests. Expected: PASS.

- [ ] **Step 3: `scripts/check-csp.ts`** (after `pnpm build`, fails if `vercel.json`'s CSP differs from the policy built from `dist/index.html`):

```ts
import { readFile } from 'node:fs/promises';
import { buildCsp, inlineScriptHashes, readCspFromVercelJson } from './csp';

const html = await readFile('dist/index.html', 'utf8');
const expected = buildCsp(inlineScriptHashes(html));
const actual = readCspFromVercelJson(JSON.parse(await readFile('vercel.json', 'utf8')));
if (actual !== expected) {
  console.error('vercel.json CSP is out of date. Expected:\n' + expected);
  process.exit(1);
}
console.log('CSP matches the built inline scripts.');
```

Add `"check:csp": "tsx scripts/check-csp.ts"`, and add `- run: pnpm check:csp` after `pnpm check:bundle` in `ci.yml`.

- [ ] **Step 4: Headers in `vercel.json`.** Run `pnpm build`, then `pnpm check:csp` (it FAILS and prints the expected CSP). Paste that value into a new `headers` block:

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy", "value": "<exact value printed by check:csp>" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
    ]
  },
  {
    "source": "/assets/(.*)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }
]
```

Re-run `pnpm check:csp`. Expected: PASS.

- [ ] **Step 5: Header e2e, deploy-only.** `tests/e2e/headers.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test('the deployment sends the security headers', async ({ request }, testInfo) => {
  test.skip(!process.env.BASE_URL, 'vite preview does not apply vercel.json headers');
  test.skip(testInfo.project.name !== 'chromium', 'headers are browser-independent');
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("script-src 'self' 'sha256-");
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});
```

The console-error fixture already turns any CSP violation on a real deployment (`Refused to …`) into a failure across the whole deploy-check suite, and that's the real regression guard.

- [ ] **Step 6: Run the full gate, then commit.** Commit: `feat(security): CSP with inline-script hashes, HSTS and hardening headers, CI drift check`.

---

### Task 3: Social image (`og:image`)

**Files:**
- Create: `scripts/og.html`, `scripts/render-og.ts`, `public/og.png` (generated and committed)
- Modify: `index.html`, `tests/e2e/prerender.spec.ts`, `package.json` (script `og`)

- [ ] **Step 1: Write the failing test.** Append to `tests/e2e/prerender.spec.ts`:

```ts
test('link previews have a 1200×630 image', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://ireactit.com/og.png');
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /IReactIt/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://ireactit.com/og.png');
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
});
```

Run `pnpm build && pnpm e2e tests/e2e/prerender.spec.ts --project=chromium`. Expected: FAIL.

- [ ] **Step 2: The template.** `scripts/og.html` is a self-contained 1200×630 page:
  - **Background:** the dark theme background token `hsl(222 47% 6%)` with the dotted texture (a `radial-gradient` dot grid).
  - **Wordmark:** `<IReactIt/>` in Space Grotesk 96px, with the brackets in the primary cyan (`hsl(190 95% 55%)`; copy the exact `--primary` and `--bg` dark values from `src/styles.css`).
  - **Text:** "Hi, I'm Trey." at 56px; "Principal Engineer · I build React that feels effortless." at 30px, muted; and a JetBrains Mono line `mount → write → tree → props → commit` in the accent colour.
  - **Fonts:** load them with `@font-face` pointing at the woff2 files in `node_modules/@fontsource-variable/*/files/*-latin-wght-normal.woff2` (relative `../node_modules/...` paths).
  - No email or phone.

- [ ] **Step 3: The renderer.** `scripts/render-og.ts`:

```ts
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(new URL('./og.html', import.meta.url).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('../public/og.png', import.meta.url)) });
await browser.close();
console.log('wrote public/og.png');
```

Add `"og": "tsx scripts/render-og.ts"`, then run `pnpm og`. Open `public/og.png` with the Read tool and check it visually: text crisp, nothing clipped, no contact details.

- [ ] **Step 4: The meta tags.** In `index.html`, after `og:description`:

```html
<meta property="og:image" content="https://ireactit.com/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="<IReactIt/>: Trey McBride, Principal Engineer" />
<meta name="twitter:image" content="https://ireactit.com/og.png" />
```

(In the `og:image:alt` value, escape `<`/`>` as `&lt;`/`&gt;`.)

- [ ] **Step 5:** Run the test (PASS), run the full gate, and commit: `feat(meta): 1200×630 og:image rendered from a template`.

---

### Task 4: The four Day-in-the-Life personas

**Files:**
- Create:
  - `tests/ditl/helpers.ts`
  - `tests/ditl/riley.spec.ts`
  - `tests/ditl/eli.spec.ts`
  - `tests/ditl/cam.spec.ts`
  - `tests/ditl/ari.spec.ts`
- Keep: `tests/ditl/smoke.spec.ts`

**Interfaces:**
- Consumes these selectors from the existing e2e specs:
  - **IDE:** `label.radio-chip` (moods: caffeinated, focused, shipping); a `<select>` labelled `focus` (options: design systems, performance, developer experience, accessibility); buttons `More coffee`/`Less coffee` (0–5); stack toggle buttons with `aria-pressed` (React, TypeScript, Node, Vite, Tailwind, Playwright); code `getByLabel('Trey.tsx source')`; counter text `renders: N` inside `getByRole('banner')`.
  - **View Source:** `getByRole('button', { name: 'View source' })`.
  - **Projects:** `getByRole('button', { name: /Inspect Daggerheart Card Creator/ })`; dialog `/DaggerheartCardCreator/`; tree items named `<Problem />`, `<MyRole />`, `<Architecture />`, `<HardParts />`, `<Outcome />` in that order; `[data-highlight-label]`; the project link `Open the Card Creator` → `https://www.daggerheart.com/card-creator`.
  - **Contact:** labels `/--author/`, `/--email/`, `/-m/`; button `git push`; `#commit` `getByRole('status')`; success text `delivered to trey/main`. The footer link `Resume` → `profile.links.resume`.
- A dry-run submit needs the `x-ditl-token` header. In the browser, add it with `page.route('**/api/contact', (r) => r.continue({ headers: { ...r.request().headers(), 'x-ditl-token': token } }))`.

- [ ] **Step 1: `tests/ditl/helpers.ts`**

```ts
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from '../fixtures';

export function ditlToken(): string | undefined {
  const token = process.env.DITL_TOKEN;
  if (process.env.CI) expect(token, 'DITL_TOKEN must be set in CI').toBeTruthy();
  return token;
}

export function onlyProject(testInfo: TestInfo, name: 'chromium' | 'webkit' | 'mobile') {
  test.skip(testInfo.project.name !== name, `persona runs on ${name}`);
}

/** Route the browser's contact POST through with the dry-run token so Resend is never called. */
export async function dryRunContact(page: Page, token: string) {
  await page.route('**/api/contact', (route) =>
    route.continue({ headers: { ...route.request().headers(), 'x-ditl-token': token } }),
  );
}

export async function fillCommit(page: Page, who: string) {
  await page.getByLabel(/--author/).fill(who);
  await page.getByLabel(/--email/).fill('ditl@example.com');
  await page.getByLabel(/-m/).fill(`Day in the life: ${who} says hello.`);
}

export async function expectAxeClean(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = violations.filter((v) => ['moderate', 'serious', 'critical'].includes(v.impact ?? ''));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}
```

- [ ] **Step 2: Recruiter Riley** (Pixel 7 → the `mobile` project). `tests/ditl/riley.spec.ts`:

```ts
import { profile } from '../../src/content/profile';
import { expect, test } from '../fixtures';
import { ditlToken, dryRunContact, fillCommit, onlyProject } from './helpers';

test('Recruiter Riley: skims every step on a phone, inspects a project, checks the resume, says hello', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'mobile');
  const token = ditlToken();
  test.skip(!token, 'DITL_TOKEN not set');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const id of ['mount', 'write', 'tree', 'props', 'commit']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', profile.links.resume);
  await dryRunContact(page, token!);
  await page.locator('#commit').scrollIntoViewIfNeeded();
  await fillCommit(page, 'Recruiter Riley');
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.locator('#commit').getByRole('status')).toContainText('delivered to trey/main');
});
```

- [ ] **Step 3: Engineer Eli** (desktop Chromium). `tests/ditl/eli.spec.ts`:

```ts
import { expect, test } from '../fixtures';
import { onlyProject } from './helpers';

test('Engineer Eli: drives all four props, flips View Source, and walks an Inspector by keyboard', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'chromium');
  await page.goto('/#write');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
  const code = page.getByLabel('Trey.tsx source');
  const counter = page.getByRole('banner').getByText(/renders: \d+/);

  await page.locator('label.radio-chip', { hasText: 'focused' }).click();
  await expect(code).toContainText("mood = 'focused',");
  await page.getByLabel('focus', { exact: true }).selectOption('performance');
  await expect(code).toContainText("focus = 'performance',");
  await page.getByRole('button', { name: 'More coffee' }).click();
  await page.getByRole('button', { name: 'Playwright', exact: true }).click();
  await expect(code).toContainText('Playwright');
  await expect(counter).toHaveText('renders: 5');

  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await expect(page.locator('#write')).toContainText('src/features/ide/');
  await toggle.click();
  await expect(code).toContainText("mood = 'focused',");

  const inspect = page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ });
  await inspect.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(page.getByRole('treeitem', { name: /DaggerheartCardCreator/ })).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('Architecture');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('HardParts');
  await page.keyboard.press('Escape');
  await expect(inspect).toBeFocused();
});
```

  - Before finalising, run the test to learn the real starting render count and the exact code strings. Each prop change bumps the counter by one, so the expected value is the start plus 4.
  - Read `src/features/ide/CodeView.tsx` and `treyProps.ts` for how `focus` and `stack` print, and correct the `toContainText` strings to match. Don't weaken the assertions.
  - Likewise, confirm the `[data-highlight-label]` text for the HardParts node from `InspectorPanel.tsx`.

- [ ] **Step 4: Collaborator Cam** (desktop WebKit, CI only). `tests/ditl/cam.spec.ts`:

```ts
import { expect, test } from '../fixtures';
import { onlyProject } from './helpers';

test('Collaborator Cam: deep-links to projects, inspects Daggerheart, and the outbound link is right', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'webkit');
  await page.goto('/#props');
  await expect(page.locator('#props')).toBeInViewport();
  await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  const link = dialog.getByRole('link', { name: 'Open the Card Creator' });
  await expect(link).toHaveAttribute('href', 'https://www.daggerheart.com/card-creator');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});
```

  (If the link lives on the card rather than in the dialog, scope the locator to where it actually renders; check `ProjectCard.tsx` and `InspectorPanel.tsx`.)

- [ ] **Step 5: Accessible Ari** (reduced motion, keyboard only, 200% zoom, chromium). `tests/ditl/ari.spec.ts`:

```ts
import { expect, test } from '../fixtures';
import { ditlToken, dryRunContact, expectAxeClean, onlyProject } from './helpers';

test.use({ reducedMotion: 'reduce', viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 });

test('Accessible Ari: keyboard only at 200% zoom, reduced motion, axe clean at every stop', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'chromium');
  const token = ditlToken();
  test.skip(!token, 'DITL_TOKEN not set');
  await dryRunContact(page, token!);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
  await page.keyboard.press('Enter');
  await expectAxeClean(page);

  for (const id of ['write', 'tree', 'props']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expectAxeClean(page);
  }

  const author = page.getByLabel(/--author/);
  for (let i = 0; i < 200 && !(await author.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(author).toBeFocused();
  await page.keyboard.type('Accessible Ari');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ditl@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Day in the life: Ari says hello, keyboard only.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'git push' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#commit').getByRole('status')).toContainText('delivered to trey/main');
  await expectAxeClean(page);
});
```

  - The 640×450 CSS viewport at scale factor 2 is the 1280×900 desktop at 200% zoom.
  - If the Tab order between the message and `git push` passes through the honeypot or another control, fix the app (the honeypot must be `tabIndex={-1}` and `aria-hidden`), not the test.
  - If the skip-link name differs, use the real one from `Nav.tsx`.

- [ ] **Step 6:** Run `pnpm build && pnpm e2e tests/ditl --project=chromium --project=mobile`. All pass locally (Cam is skipped locally). Run the full gate, then commit: `test(ditl): Riley, Eli, Cam and Ari journeys`.

  `deploy-check` already runs `tests/ditl` on every deployment, and runs only `tests/ditl` for production. The rate limit is 5 per 10 minutes per IP, and the dry-run token check happens before the limiter, so the three dry-run submits per run don't consume it.

---

### Task 5: Visual regression baselines

**Files:**
- Create:
  - `tests/visual/sections.spec.ts`
  - `tests/visual/__screenshots__/**` (generated)
  - `scripts/visual-update.sh`
  - `.github/workflows/visual-baselines.yml`
- Modify: `playwright.config.ts`, `package.json`

**Interfaces:**
- Snapshot path template: `{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}`.
- Visual tests run on `chromium` and `mobile` only (WebKit font rendering on Linux is too noisy to hold pixel baselines).

- [ ] **Step 1: Config.** In `playwright.config.ts`, add at the top level:

```ts
snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
```

- [ ] **Step 2: The spec.** `tests/visual/sections.spec.ts`:

```ts
import { expect, test } from '../fixtures';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name === 'webkit', 'baselines are chromium + mobile only');
});

for (const theme of ['dark', 'light'] as const) {
  test.describe(theme, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
      await page.evaluate(() => document.fonts.ready);
    });

    for (const id of ['mount', 'write', 'tree', 'props', 'commit']) {
      test(`section ${id}`, async ({ page }) => {
        const section = page.locator(`#${id}`);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toHaveScreenshot(`${theme}-${id}.png`);
      });
    }

    test('inspector open', async ({ page }) => {
      await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page).toHaveScreenshot(`${theme}-inspector.png`);
    });

    test('view source', async ({ page }) => {
      await page.getByRole('button', { name: 'View source' }).click();
      await expect(page.locator('#mount figure')).toBeVisible();
      await expect(page.locator('#mount')).toHaveScreenshot(`${theme}-view-source.png`);
    });

    test('contact errors', async ({ page }) => {
      await page.locator('#commit').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'git push' }).click();
      await expect(page.getByText('Tell me your name')).toBeVisible();
      await expect(page.locator('#commit')).toHaveScreenshot(`${theme}-commit-errors.png`);
    });
  });
}
```

  If an element is genuinely time-dependent (e.g. the drifting dots layer), pass `mask: [page.locator('.dots-drift')]` for that element only, and say so in the report.

- [ ] **Step 3: Docker baseline script.** `scripts/visual-update.sh` (make it executable):

```bash
#!/usr/bin/env bash
set -euo pipefail
docker run --rm --ipc=host -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc "corepack enable && pnpm install --frozen-lockfile && pnpm build && pnpm exec playwright test tests/visual --project=chromium --project=mobile --update-snapshots"
```

  Add `"visual:update": "bash scripts/visual-update.sh"`. Note that this runs `pnpm install` inside Linux against the mounted repo. Afterwards, run `pnpm install` again on the host to restore the macOS native binaries.

- [ ] **Step 4: CI fallback workflow.** Use this when Docker is unavailable locally. `.github/workflows/visual-baselines.yml`:

```yaml
name: visual-baselines
on: workflow_dispatch
permissions:
  contents: read
jobs:
  update:
    runs-on: ubuntu-latest
    container: mcr.microsoft.com/playwright:v1.63.0-noble
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec playwright test tests/visual --project=chromium --project=mobile --update-snapshots
      - uses: actions/upload-artifact@v4
        with: { name: visual-baselines, path: tests/visual/__screenshots__ }
```

  Trigger it with `gh workflow run visual-baselines.yml --ref rebuild`, then `gh run download <id> -n visual-baselines -D tests/visual/__screenshots__`.

- [ ] **Step 5: Run the e2e steps in the Playwright container too.** Rendering then matches the baselines. In `ci.yml`, add `container: mcr.microsoft.com/playwright:v1.63.0-noble` to the job and remove the `playwright install --with-deps` step. Do the same in `deploy-check.yml`. Keep everything else.

- [ ] **Step 6: Generate the baselines** (Docker, or the workflow fallback). Read 3–4 of the PNGs to confirm that they show real content (not blank or half-revealed) and contain no contact details. Commit the baselines and the spec, then push `rebuild` and confirm `ci` and `deploy-check` are green. Commit: `test(visual): section/state baselines for chromium and mobile, dark and light`.

---

### Task 6: Lighthouse CI budgets

**Files:**
- Create: `lighthouserc.json`
- Modify: `package.json` (dev dependency `@lhci/cli`, script `lhci`), `.github/workflows/ci.yml`

- [ ] **Step 1:** Run `pnpm add -D @lhci/cli`.

- [ ] **Step 2: `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm preview",
      "startServerReadyPattern": "Local",
      "url": ["http://localhost:4173/"],
      "numberOfRuns": 3,
      "settings": { "chromeFlags": "--no-sandbox" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95, "aggregationMethod": "median-run" }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

  Add `"lhci": "lhci autorun"`, and in `ci.yml` add `- run: pnpm lhci` after `pnpm e2e`. After Task 5 the CI job runs inside the Playwright container, which has no system Chrome. For that step, set `CHROME_PATH` to Playwright's Chromium: `export CHROME_PATH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())")`.

- [ ] **Step 3:** Run `pnpm build && pnpm lhci` locally.
  - If any budget fails, fix the cause in the app: image `width`/`height`/`loading="lazy"`/`decoding="async"`, `fetchpriority` on the LCP element, unused preloads, render-blocking CSS, SEO meta, `robots.txt`.
  - Never lower a threshold. If mobile performance can't reach 0.95 on the simulated throttle after real fixes, stop and report the numbers and the opportunities list as DONE_WITH_CONCERNS.
  - Add `public/robots.txt` (`User-agent: *\nAllow: /\nSitemap: https://ireactit.com/sitemap.xml`) and a one-URL `public/sitemap.xml` if SEO needs them.

- [ ] **Step 4:** Run the full gate, push, and confirm `ci` is green. Commit: `ci: Lighthouse budgets (perf ≥ 95, a11y 100, CLS < 0.05)`.

---

### Task 7: Supply-chain and lint hardening

**Files:**
- Create: `.github/dependabot.yml`
- Modify: `.github/workflows/*.yml` (pin actions to commit SHAs), `eslint.config.js`, `package.json`

- [ ] **Step 1: `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    groups:
      dev-dependencies: { dependency-type: development, update-types: [minor, patch] }
      prod-dependencies: { dependency-type: production, update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
    groups:
      actions: { patterns: ['*'] }
```

- [ ] **Step 2: Pin every `uses:` to a full commit SHA**, with the tag in a trailing comment (e.g. `actions/checkout@<sha> # v4.x.y`). Resolve each SHA with `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha`, e.g. `gh api repos/actions/checkout/commits/v4 --jq .sha`.

- [ ] **Step 3: jsx-a11y.** Run `pnpm add -D eslint-plugin-jsx-a11y`, and add its `flatConfigs.recommended` to `eslint.config.js` for `src/**/*.tsx`.
  - Run `pnpm lint`.
  - Fix every finding in the app code.
  - Disable a rule only where it's a proven false positive for a correct ARIA pattern already covered by axe. Use a line-level disable with a reason comment, never a global off.

- [ ] **Step 4:** Run the full gate, then commit: `chore(ci): dependabot, SHA-pinned actions, jsx-a11y lint`.

---

### Task 8: The interactive README

**Files:**
- Create:
  - `README.md`
  - `docs/readme/header-dark.svg`
  - `docs/readme/header-light.svg`
  - `docs/readme/inspector.gif`
  - `scripts/record-inspector-gif.ts`
- Modify: `package.json` (dev dependencies `gifenc` and `pngjs` with `@types/pngjs`, script `readme:gif`)

- [ ] **Step 1: Animated header SVGs** (840×200).
  - `<IReactIt/>` types in character by character (CSS `@keyframes` on each `<tspan>`'s opacity, 80ms stagger), then a cursor blinks, then a "rendered" pill fades in: `✓ rendered in 1 commit`.
  - Use the site's dark and light `--bg`/`--fg`/`--primary` values from `src/styles.css`, with fonts `font-family="JetBrains Mono, ui-monospace, monospace"`.
  - Wrap all the animation in `@media (prefers-reduced-motion: no-preference)` inside the SVG `<style>`.
  - Check both files by opening them with the Read tool.

- [ ] **Step 2: The Inspector GIF.** `scripts/record-inspector-gif.ts`:
  - Launch Chromium at 1200×750 against `pnpm preview` (start it and wait on the port).
  - Go to `/#props` in the dark scheme, click Inspect on Daggerheart, press ArrowDown/Enter through Problem → Architecture → HardParts, and take a PNG screenshot every 120 ms (about 40 frames).
  - Decode each frame with `pngjs`, quantise it with `gifenc`'s `quantize`/`applyPalette`, and write `docs/readme/inspector.gif` with `GIFEncoder`.
  - The GIF must be ≤ 5 MB. If it's larger, downscale the frames to 900px wide.
  - Add `"readme:gif": "tsx scripts/record-inspector-gif.ts"`, run it, and check the result with the Read tool.

- [ ] **Step 3: `README.md`.** These sections, in this order:

  1. A `<picture>` with `<source media="(prefers-color-scheme: dark)" srcset="docs/readme/header-dark.svg">` and a light `<img>` fallback, alt `<IReactIt/>`.
  2. Badges:
     - CI: `https://github.com/NothinButTreys/ireactit/actions/workflows/ci.yml/badge.svg?branch=main`
     - deploy-check
     - Vercel: `https://img.shields.io/badge/deployed%20on-Vercel-000?logo=vercel`
     - Coverage, as a static shields badge with the line-coverage percentage from the latest `pnpm coverage` run, labelled "logic coverage" (it covers lib, content and hooks).
  3. A one-paragraph pitch, with a link to https://ireactit.com.
  4. **"The render cycle"**: a table of the five steps (`#mount`, `#write`, `#tree`, `#props`, `#commit`) and what each shows.
  5. **"Architecture"**: nested `<details>` blocks shaped like a component tree: `<App/>` → `<Nav/>`, `<Hero/>`, `<WriteSection/>`, `<CareerTree/>`, `<Projects/>` (→ `<Inspector/>`), `<CommitSection/>`, `<Footer/>`. Each gives a 1–2 line summary and a link to its folder. Also include prerender/hydration, `api/contact.ts` and the build-time Shiki virtual module.
  6. The Inspector GIF.
  7. **"Quality gates"**: TDD, coverage, e2e (Chromium/WebKit/Pixel 7), axe in every state, visual baselines, Lighthouse budgets, the JS budget and the CSP drift check.
  8. **"Day in the Life"**: the four personas as a table, and when they run (every deployment, via `deploy-check`).
  9. **"Run it locally"**: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm e2e --project=chromium`, `pnpm visual:update`, and an `.env.local` note. The env var names are `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` and `DITL_TOKEN`, with no values.
  10. A licence and credit line.

  **Privacy:** no email address or phone number anywhere in the README.

- [ ] **Step 4:** Check the rendering with `gh markdown-preview` if it's available; otherwise use the GitHub API: `gh api -X POST /markdown -f text="$(cat README.md)" -f mode=gfm > /tmp/readme.html`, and inspect the HTML for broken image paths. Commit: `docs: interactive README (animated header, component-tree architecture, Inspector demo)`.

---

## Execution notes (controller only, not subagent tasks)

- **Order:** 1 → 8, sequentially. Tasks 5–7 all edit workflow files.
- **After Task 8:**
  1. Run the whole-branch review (most capable model) with `review-package $(git merge-base origin/main HEAD) HEAD`, together with the ledger's minors list, then one fix wave.
  2. Run `/code-review` (high), `/security-review` and `/simplify` on the branch; fix the findings in one wave.
  3. Verification-before-completion: a fresh full gate, plus green `ci` and `deploy-check` on the pushed head.
  4. Cutover prep via the Vercel connector (reversible, no production impact): set the project `framework` to `vite`. Leave the legacy MONGODB/NEXTAUTH/BASE_URL env vars and ask Trey about them.
  5. **Cutover.** Trey authorised it on 2026-09-29 ("i trust in you to merge and switch over"). Only when every gate above is green:
     - Mark PR #1 ready and merge it.
     - Watch the production deployment and the production `deploy-check` (ditl).
     - Verify https://ireactit.com and https://www.ireactit.com serve the new site, with the security headers.
     - If production deploy-check fails, use Vercel Instant Rollback to the previous production deployment and report.
