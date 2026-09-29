import type { Page } from '@playwright/test';
import { expectNoViolations } from '../axe';
import { expect, test } from '../fixtures';

const HERO_MOUNT_TIMEOUT = 15_000;

/** Scrolls the whole page so every `[data-reveal]` mounts, then returns to the top. */
async function scrollWholePage(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    window.scrollTo(0, 0);
  });
  // Let every reveal's opacity/transform/filter transition settle (≤500ms, ≤150ms reduced) before
  // scanning — axe reads the computed colour at that instant, and a mid-transition opacity reads
  // as a false contrast violation.
  await expect(page.locator('[data-reveal]:not([data-shown])')).toHaveCount(0);
  await page.waitForTimeout(600);
}

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
      await scrollWholePage(page);
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

  // Its own describe: the reduced-motion beforeEach above would load and scroll the page a second time.
  test.describe(`${theme} theme, motion allowed`, () => {
    test('page', async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'no-preference' });
      await page.goto('/');
      // The hero types its tag before it mounts; allow for a busy machine.
      await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '', { timeout: HERO_MOUNT_TIMEOUT });
      await scrollWholePage(page);
      await expectNoViolations(page);
    });
  });
}
