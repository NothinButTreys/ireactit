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
  await header.scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute('data-shown', '');
});
