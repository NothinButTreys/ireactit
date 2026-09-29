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

/**
 * Let every reveal that is in view finish fading in. axe reads the computed colour at the instant it runs, and a
 * reveal caught mid-transition (opacity < 1) reads as a false contrast failure, most often under parallel load.
 */
async function settleReveals(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const inView = (el: Element) => {
      const r = el.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      return r.height > 0 && visible / r.height >= 0.2; // useInViewOnce's threshold
    };
    const deadline = performance.now() + 3000;
    await frame();
    await frame();
    while (performance.now() < deadline && [...document.querySelectorAll('[data-reveal]:not([data-shown])')].some(inView)) {
      await frame();
    }
    const finite = document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
    await Promise.all(finite.map((a) => a.finished.catch(() => undefined)));
  });
}

export async function expectAxeClean(page: Page) {
  await settleReveals(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = violations.filter((v) => ['moderate', 'serious', 'critical'].includes(v.impact ?? ''));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}
