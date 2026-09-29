import { expect, test } from '../fixtures';
import { onlyProject } from './helpers';

test('Engineer Eli: drives all four props, flips View Source, and walks an Inspector by keyboard', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'chromium');
  await page.goto('/#write');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
  const code = page.getByLabel('Trey.tsx source');
  const counter = page.getByRole('banner').getByText(/renders: \d+/);
  await expect(counter).toHaveText('renders: 1');

  await page.locator('label.radio-chip', { hasText: 'focused' }).click();
  await expect(code).toContainText("mood = 'focused',");
  await page.getByLabel('focus', { exact: true }).selectOption('performance');
  await expect(code).toContainText("focus = 'performance',");
  await page.getByRole('button', { name: 'More coffee' }).click();
  await expect(code).toContainText('coffee = 4,');
  await page.getByRole('button', { name: 'Playwright', exact: true }).click();
  await expect(code).toContainText("stack = ['React', 'TypeScript', 'Node', 'Playwright'],");
  await expect(counter).toHaveText('renders: 5');

  const toggle = page.getByRole('button', { name: 'View source' });
  await toggle.click();
  await expect(page.locator('#write')).toContainText('src/features/ide/TreyEditor.tsx');
  await toggle.click();
  await expect(code).toContainText("mood = 'focused',");

  const inspect = page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ });
  await inspect.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(page.getByRole('treeitem', { name: /DaggerheartCardCreator/ })).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('Architecture');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('[data-highlight-label]')).toHaveText('HardParts');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(inspect).toBeFocused();
});
