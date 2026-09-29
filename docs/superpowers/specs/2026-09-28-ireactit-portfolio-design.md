# IReactIt — Portfolio Rebuild Design

- **Date:** 2026-09-28
- **Owner:** Trey McBride (GitHub: NothinButTreys)
- **Domain:** ireactit.com (Vercel)
- **Repo:** `NothinButTreys/ireactit` (public). This is the existing `meet-trey` repo, renamed; its 2023 history is kept.
- **Status:** Approved by Trey (2026-09-28)

## 1. Goal

Replace the current ireactit.com with a single-page, dark-first portfolio for Trey McBride (Principal Engineer, React/TypeScript). The page is themed as **"The Render Cycle"**: each section is a step in React's lifecycle. It must feel distinctive and current, animate smoothly without excess, and demonstrate engineering depth to both recruiters and engineers.

### Success criteria

- One page; every section reachable by scroll and by deep link (`/#mount`, `/#write`, `/#tree`, `/#props`, `/#commit`).
- Lighthouse Performance ≥ 95, Accessibility = 100, CLS < 0.05, initial JS < 150 KB gzipped.
- Zero serious/critical axe violations in any UI state.
- All four Day-in-the-Life journeys pass against every Vercel deployment before merge.
- The contact form delivers email to Trey in production.

### Non-goals (YAGNI)

A blog, a CMS, a skills grid, testimonials, i18n, analytics beyond Vercel's built-in, or any Sunstate project showcase.

## 2. Brand

- **Wordmark:** `<IReactIt/>`
- **Hero copy:** "Hi, I'm Trey." Subline: "I build React that feels effortless." Role: Principal Engineer.
- **External links:** GitHub (NothinButTreys), LinkedIn (`/in/thomasmcbrideiii`), Resume (`https://docs.google.com/document/d/1aCimN1jwt8TFKdIiOJHGyOtdTOPnB-f-KglyM68beMo/edit`), PixelTable (pixeltable.net).

## 3. Page flow

A fixed nav holds the wordmark, a **lifecycle rail** (`mount · write · tree · props · commit`) that highlights the active section, a **View Source** toggle, a **theme toggle**, and a **render counter** (`renders: n`).

| # | Step | Section id | Content and behaviour |
|---|---|---|---|
| 1 | mount | `mount` | The hero. The literal tag `<Trey role="Principal Engineer" />` assembles itself character by character, then "renders" (crossfades) into the headline. CTAs: **Inspect my work** (scrolls to `#props`) and **Commit a message** (scrolls to `#commit`). |
| 2 | write | `write` | The **`Trey.tsx` IDE**. A split pane: the left types out a short component when first in view; the right is a live preview. Editable props: `mood` (select), `focus` (select), `coffee` (number 0–5), `stack` (toggle chips). Each change re-renders the preview and increments the render counter. |
| 3 | tree | `tree` | **Experience as a component tree.** `<Career>` → `<PixelTable/>`, `<Sunstate/>`, `<RiskLens/>`, `<HostPapa/>`, `<Endurance/>`. The only pinned section: as the user scrolls, nodes expand in order and SVG connectors draw between them. Role and dates render as props; highlights render as children. |
| 4 | props | `props` | **Projects.** Four cards: Daggerheart Card Creator, Alice is Missing: Digital Edition, PixelTable Support Portal, Natural World Library. Each has an **⌘ Inspect** button that opens the DevTools Inspector (§4). |
| 5 | commit | `commit` | **Contact terminal.** `git commit -m` styled fields (name, email, message). Submitting shows a push log reflecting the real API result. |
| — | footer | — | `// page rendered in {n}ms`, a real `performance` measurement, plus the external links. |

### 3.1 Career data (content/experience.ts)

| Company | Role | Dates |
|---|---|---|
| PixelTable | CXO & Principal Engineer | Aug 2023 – Present |
| Sunstate Equipment Co. | Senior Front-End Software Engineer | Dec 2023 – Present |
| RiskLens | Senior Front-End Engineer | Sep 2022 – Jul 2023 |
| HostPapa | Senior Software Engineer I | Jun 2021 – Jul 2022 |
| Endurance International Group | Senior Software Engineer I; Software Engineer I | Jun 2017 – Jun 2021 |

Highlights come from Trey's LinkedIn text. The PixelTable highlights are: the Daggerheart Card Creator with Critical Role and Darrington Press; Alice is Missing: Digital Edition; building out the platform and staying hands-on daily; owning UX across the apps; and leading the Support Portal.

### 3.2 View Source mode

The toggle crossfades each section into a `SourcePanel` showing one curated JSX snippet for that section (from `content/sourceSnippets.ts`, highlighted at build time). Toggling off "re-mounts" the section with the standard mount animation. The state lives in context; it is not persisted.

## 4. DevTools Inspector (project case studies)

It opens as a bottom sheet about 70vh tall on desktop and full-screen on mobile. It is a modal dialog: focus is trapped, **Esc** closes it, and focus returns to the Inspect button.

- **Left: component tree.** It is built from the project's data: `<ProjectName>` → `<Problem>`, `<MyRole>`, `<Architecture>`, `<HardParts>`, `<Outcome>`. Keyboard: ↑/↓ move, →/← expand/collapse, Enter selects. It uses the WAI-ARIA `tree` pattern.
- **Right: props and state pane.** It shows the selected node's content. The root node shows `stack`, `team`, `links` and `year` as a props list. Child nodes show 40–80 words of prose each (about 150–250 words per project in total).
- **Highlight overlay.** The project's screenshot sits above the tree, with a cyan DevTools-style box that moves to the region relevant to the selected node. Each node declares its region as a percentage rectangle; the rectangle is optional.

`Project` type (enforced by a unit test over `content/projects.ts`):

```ts
type Project = {
  slug: string;
  name: string;            // also the root component name, e.g. "DaggerheartCardCreator"
  tagline: string;
  year: string;
  team?: string;
  stack: string[];
  links: { label: string; href: string }[];
  screenshot: { src: string; alt: string };
  nodes: Record<'problem' | 'myRole' | 'architecture' | 'hardParts' | 'outcome',
    { body: string; highlight?: { x: number; y: number; w: number; h: number } }>;
};
```

The first draft of the case-study copy is written from public PixelTable material, and Trey edits it for accuracy before launch.

## 5. Visual system

### Colour tokens (HSL, dark theme default)

| Token | Value | Use |
|---|---|---|
| `--bg` | 222 47% 4% | page background (from PixelTable) |
| `--card` | 221 39% 7% | surfaces |
| `--border` | 218 28% 14% | hairlines |
| `--fg` | 190 30% 94% | body text |
| `--muted` | 215 16% 62% | secondary text |
| `--primary` | 193 95% 60% | React cyan: links, focus, active rail, highlight box |
| `--success` | 160 84% 45% | PixelTable emerald: "rendered", delivered, syntax strings |
| `--accent` | 42 96% 58% | PixelTable amber: highlights, warnings, syntax props |
| `--danger` | 0 72% 51% | errors |

The light theme uses matching tokens tuned for AA contrast. The theme follows `prefers-color-scheme`, a toggle overrides it, and the choice is persisted in localStorage.

### Type

Space Grotesk (display and body, 17–18px base) and JetBrains Mono (code, labels, rail), self-hosted with Fontsource variable packages (`@fontsource-variable/space-grotesk`, `@fontsource-variable/jetbrains-mono`).

### Texture

A faint dot-grid background with a very slow drift, turned off under reduced motion. Glows appear only on focus and active states.

## 6. Motion system

1. One easing curve, `cubic-bezier(0.22, 1, 0.36, 1)`, and one spring (`stiffness 300, damping 30`) for toggles and draggables. These live in `lib/motion.ts`.
2. Only `transform`, `opacity` and `filter: blur` (for the mount effect only) are animated.
3. Lenis provides smooth scrolling and is synced to Motion's `useScroll`. There is exactly one pinned section (`tree`).
4. The "mount" preset is: opacity 0→1, scale 0.98→1, blur 4px→0, over 500ms.
5. Under `prefers-reduced-motion: reduce`, Lenis is off, pinning is off (the tree renders fully expanded), typing is instant, and all transitions become opacity-only at 150ms or less.
6. The IDE and Inspector are lazy-loaded with `React.lazy` + dynamic `import()` the first time they are near the viewport or opened.

## 7. Architecture

**Vite + React 19** with TypeScript in strict mode and Tailwind v4 (`@tailwindcss/vite`, tokens in CSS). No meta-framework. At build time the app is **prerendered** to static HTML with `react-dom/static` and then hydrated on the client, so crawlers and link previews see full content. The contact endpoint is a standalone **Vercel Function** (`api/contact.ts`, Web `Request`/`Response` signature). A small Vite plugin serves the same handler at `/api/contact` in `vite dev` and `vite preview`, so local dev and CI need no Vercel CLI. Meta and Open Graph tags are static in `index.html`, with a static `public/og.png`.

```
src/
  main.tsx        hydrateRoot entry
  entry-server.tsx  prerender entry
  App.tsx         Nav + sections
  styles.css      Tailwind + tokens
  content/        profile.ts, experience.ts, projects.ts, sourceSnippets.ts
  features/
    hero/ ide/ career-tree/ projects/ contact/ view-source/ render-counter/ nav/
  ui/             Section, Button, Kbd, CodeBlock (Shiki highlighting run at build time through a Vite plugin / virtual module), ThemeToggle
  lib/            motion.ts, reducedMotion.ts, lenis.tsx, contactSchema.ts, rateLimit.ts
tests/
  e2e/ visual/ ditl/  (Playwright)
api/
  contact.ts      Vercel Function → createContactHandler
scripts/
  prerender.ts    SSR-render App into dist/index.html
```

- Each feature folder exposes one public component and its hooks, and is tested in isolation.
- Shared state is limited to three contexts: `ViewSource`, `RenderCounter` and `Theme`.
- The `Trey.tsx` editor is a custom highlighted `<pre>` with real, labelled form controls (no Monaco).
- Each interactive island is wrapped in an error boundary that falls back to static content.
- With JavaScript disabled, the page shows all content: the final IDE code, a fully expanded tree, and projects as `<details>` elements.

## 8. Contact API

`POST /api/contact` with the body `{ name, email, message, company }`, where `company` is the honeypot field.

1. Parse the body with the shared zod schema (`lib/contactSchema.ts`: name 1–100 characters, a valid email, message 10–5000 characters). Invalid input returns **400** with field errors.
2. If the honeypot is filled, return **200** without sending anything.
3. Apply a best-effort, in-memory rate limit of 5 requests per 10 minutes per IP. Over the limit returns **429**.
4. If the `x-ditl-token` header equals `process.env.DITL_TOKEN`, return **200** with `{ dryRun: true }` and skip Resend.
5. Otherwise send via Resend to Trey's inbox (`CONTACT_TO_EMAIL`) and return **200**. A Resend failure returns **502**.

UI states: `idle → sending → delivered | rejected`. When rejected, the form keeps the input and shows a `mailto:` fallback.

**Environment variables (Vercel):** `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `DITL_TOKEN`.

## 9. Testing (TDD required)

Every unit is written red → green → refactor.

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Vitest | contactSchema, rateLimit, the push-log state machine, motion helpers, content-shape guards |
| Component | Vitest + React Testing Library + user-event | IDE prop edits → preview and counter; Inspector keyboard and focus; View Source toggle; contact states; theme toggle |
| API | Vitest | route handler with Resend mocked: 400 / 200 honeypot / 429 / dry-run / 200 / 502 |
| E2E | Playwright (Chromium, WebKit, Pixel 7) | full-page scroll, Inspect flow, contact with the API stubbed, reduced motion, JS disabled |
| Visual | Playwright `toHaveScreenshot` | every section and state × desktop/mobile × dark/light; baselines generated in the official Playwright Docker image |
| a11y | @axe-core/playwright | every state, including the Inspector and View Source |
| Perf | Lighthouse CI | the budgets in §1 |

Coverage must be at least 90% of lines for `src/lib`, `src/content` and the feature hooks.

### 9.1 Day in the Life (`tests/ditl`)

Each journey runs against the URL in `BASE_URL`.

| Persona | Setup | Journey |
|---|---|---|
| Recruiter Riley | Pixel 7 | land → scroll through all five steps → Inspect one project → check the resume link → submit a contact (dry run) |
| Engineer Eli | Desktop Chromium | edit all four IDE props and assert the counter → View Source on/off → open an Inspector, keyboard only, and reach Architecture and HardParts |
| Collaborator Cam | Desktop WebKit | open `/#props` → correct section in view → Inspect Daggerheart → outbound link is correct |
| Accessible Ari | Reduced motion, keyboard only, 200% zoom | complete the whole page and the contact form; axe is clean at each stop |

## 10. CI/CD

GitHub Actions workflows:

- **`ci.yml`** (every PR): typecheck, lint, Vitest with coverage, then `vite build` + prerender, then Playwright e2e, visual, a11y and ditl against `vite preview`, then Lighthouse CI.
- **`deploy-check.yml`** (on the `deployment_status` event with state `success`): runs Playwright visual and ditl against `deployment_status.target_url`, sending `x-vercel-protection-bypass` and `x-ditl-token`. For preview deployments this is a **required check** on `main`. For production it runs ditl only, and a failure fails the workflow (a GitHub notification) so Trey can use Vercel Instant Rollback.

Branch protection on `main`: a PR is required, and `ci` plus `deploy-check` must pass.

**GitHub secrets:** `DITL_TOKEN`, `VERCEL_AUTOMATION_BYPASS_SECRET`.

**Vercel setup** (Vercel MCP connector is connected; team `nothinbuttreys-projects`):

- **Reuse, don't recreate.** The live site already deploys from GitHub `NothinButTreys/meet-trey` (branch `master`) to the Vercel project `meet-trey`, which owns `ireactit.com` and `www.ireactit.com`.
  1. Rename the GitHub repo `meet-trey` → `ireactit` (GitHub keeps a redirect; the Vercel link is ID-based and survives).
  2. Rename the default branch `master` → `main` and set the Vercel production branch to `main`.
  3. Rename the Vercel project `meet-trey` → `ireactit`. The domains stay attached, so no domain move is needed. Update the Node version to 20.x.
  4. The local `IReactIt` folder becomes a clone of that repo. All work happens on the branch `rebuild`, with PRs into `main`.
  5. Set the env vars and the protection-bypass secret through the connector.
- **Cutover is the merge of the rebuild PR into `main`.** Until then, ireactit.com keeps serving the old site. Rollback uses Vercel Instant Rollback or a revert.
- The stale local `~/code/meet-trey` folder is left untouched (never deleted by Claude).
- **Trey's manual steps:** create a Resend account, verify a sending domain (or use Resend's onboarding sender), and paste the `RESEND_API_KEY` in chat or into Vercel. Approve the GitHub↔Vercel app install if Vercel prompts for it.

## 11. README

Built last, from the finished site:

- An animated SVG header in which `<IReactIt/>` types and then "renders".
- Theme-aware images using `<picture>` with `prefers-color-scheme`.
- Live badges: CI, deploy-check, coverage, Vercel.
- The architecture presented as a collapsible component tree (nested `<details>` blocks).
- A demo GIF of the Inspector, recorded with Playwright.
- Local development instructions and a "Day in the Life" explainer.

## 12. Delivery process

1. **Claude Design.** A full visual design of every section, the Inspector open, View Source mode, contact states, and mobile layouts. Trey approves it before any code is written, and it becomes the visual reference for the build agents.
2. **Implementation plan** (writing-plans), then **subagent-driven development**: each task goes TDD implementation → spec-compliance review → code-quality review. Independent features (IDE, career tree, Inspector, contact) run in parallel.
3. **Final gate** before merging to `main`: `/code-review` (high), `/security-review`, `/simplify`, then verification-before-completion with fresh command output.
4. **README**, then launch.
