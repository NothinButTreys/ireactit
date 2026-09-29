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
