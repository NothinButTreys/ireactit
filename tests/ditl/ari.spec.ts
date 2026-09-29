import { expect, test } from '../fixtures';
import { ditlToken, dryRunContact, expectAxeClean, onlyProject } from './helpers';

// A 640×450 CSS viewport at scale factor 2 is the 1280×900 desktop at 200% zoom.
test.use({ reducedMotion: 'reduce', viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 });

test('Accessible Ari: keyboard only at 200% zoom, reduced motion, axe clean at every stop', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'chromium');
  const token = ditlToken();
  test.skip(!token, 'DITL_TOKEN not set');
  await dryRunContact(page, token!);
  await page.goto('/');
  await expect(page.locator('[data-hero]')).toHaveAttribute('data-mounted', '');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expectAxeClean(page);

  for (const id of ['write', 'tree', 'props']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expectAxeClean(page);
  }

  const author = page.getByLabel(/--author/);
  for (let i = 0; i < 200 && !(await author.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(author).toBeFocused();
  await page.keyboard.type('Accessible Ari');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ditl@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Day in the life: Ari says hello, keyboard only.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'git push' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#commit').getByRole('status')).toContainText('delivered to trey/main');
  await expectAxeClean(page);
});
