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

test('the focused root treeitem is ringed on its label row only, not outlined on the row that wraps the subtree', async ({ page }) => {
  // Open via the keyboard (focus the button, then activate with Enter) so Chromium's
  // focus-visible heuristic is actually engaged: a plain `.click()` counts as pointer input and
  // the browser withholds :focus-visible from the treeitem that focus() moves to afterwards,
  // which would make this assertion pass or fail for the wrong reason either way.
  const inspect = page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ });
  await inspect.focus();
  await page.keyboard.press('Enter');
  const root = page.getByRole('treeitem', { name: /DaggerheartCardCreator/ });
  await expect(root).toBeFocused();

  const outlineStyle = await root.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).toBe('none');

  const label = root.locator(':scope > span').first();
  const boxShadow = await label.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(boxShadow).not.toBe('none');
});

test('the page behind the inspector does not scroll', async ({ page }) => {
  await page.getByRole('button', { name: /Inspect Alice is Missing/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
});
