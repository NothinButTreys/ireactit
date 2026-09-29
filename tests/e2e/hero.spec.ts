import { expect, test } from '../fixtures';

test('the hero types its tag, mounts, and counts one render', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-hero]');
  await expect(hero).toHaveAttribute('data-mounted', '');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hi, I'm Trey.");
  await expect(page.getByRole('banner').getByText('renders: 1')).toBeVisible();
});

test('"Inspect my work" scrolls to the projects', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Inspect my work/ }).click();
  await expect(page.locator('#props')).toBeInViewport();
});

test('the render log commits each section as you reach it', async ({ page }) => {
  await page.goto('/');
  const log = page.getByRole('complementary', { name: 'Render log' });
  await expect(log.getByText('1 / 5 committed')).toBeVisible();
  await page.locator('#write').scrollIntoViewIfNeeded();
  await expect(log.getByText('2 / 5 committed')).toBeVisible();
});
