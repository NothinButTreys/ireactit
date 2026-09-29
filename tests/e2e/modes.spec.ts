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

test.describe('app bundle fails to load', () => {
  test.use({ allowConsoleErrors: /Failed to load resource|net::ERR_FAILED/ });

  test('falls back to visible content after the 3s failsafe', async ({ page }) => {
    await page.route('**/assets/index-*.js', (route) => route.abort());
    await page.goto('/');
    await page.waitForTimeout(3500);
    await expect(page.getByText('feels effortless.')).toHaveCSS('opacity', '1');
    await expect(page.locator('#write [data-reveal]').first()).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js'))).toBe(false);
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
