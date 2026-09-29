import { expect, test } from '../fixtures';

test('View source swaps every section for its code, and back', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#mount')).toContainText('src/features/hero/Hero.tsx');
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(page.locator('#tree')).toContainText('src/features/career-tree/CareerTree.tsx');

  await toggle.click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#mount')).not.toContainText('src/features/hero/Hero.tsx');
});

test('source panels keep the IDE state when toggled back', async ({ page }) => {
  await page.goto('/#write');
  await page.locator('label.radio-chip', { hasText: 'shipping' }).click();
  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await toggle.click();
  await expect(page.getByLabel('Trey.tsx source')).toContainText("mood = 'shipping',");
});
