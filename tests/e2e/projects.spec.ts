import { expect, test } from '../fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/#props');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
});

test('Inspect opens the DevTools panel; the tree is keyboard driven; Esc closes and restores focus', async ({ page, browserName }) => {
  const inspect = page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ });
  await inspect.click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /DaggerheartCardCreator/ })).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('template-driven editor');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('Architecture');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  if (browserName !== 'webkit') await expect(inspect).toBeFocused();
});

test('the page behind the inspector does not scroll', async ({ page }) => {
  await page.getByRole('button', { name: /Inspect Alice is Missing/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
});
