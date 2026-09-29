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
