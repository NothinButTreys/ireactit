import { expect, test } from '../fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/#write');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
});

test('editing props re-renders the code, the preview and the nav counter', async ({ page }) => {
  const code = page.getByLabel('Trey.tsx source');
  await page.locator('label.radio-chip', { hasText: 'shipping' }).click();
  await expect(code).toContainText("mood = 'shipping',");
  await expect(page.getByRole('region', { name: 'Preview' })).toContainText('Green checks everywhere');
  await expect(page.getByRole('banner').getByText('renders: 2')).toBeVisible();
});

test('the coffee stepper is keyboard operable', async ({ page }) => {
  const more = page.getByRole('button', { name: 'More coffee' });
  await more.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Trey.tsx source')).toContainText('coffee = 5,');
  await expect(more).toBeDisabled();
});
