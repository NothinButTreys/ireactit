import { expect, test } from '../fixtures';

test.use({ reducedMotion: 'reduce' });

test.skip(({ browserName }) => browserName === 'webkit', 'baselines are chromium + mobile only');
test.skip(process.platform !== 'linux', 'baselines are Linux-rendered (Playwright container); refresh with `pnpm visual:update`');

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
