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

for (const theme of ['dark', 'light'] as const) {
  test(`the dot-grid drift is visible through a transparent body (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const dots = page.locator('.dots-drift');
    await expect(dots).toBeVisible();
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgba(0, 0, 0, 0)');
  });
}

test('the dot-grid drift stops under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const animationName = await page.locator('.dots-drift').evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe('none');
});

test('at 700px width the footer text is not covered by the mobile pill rail', async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto('/');
  const rail = page.getByRole('navigation', { name: 'Render cycle' }).last();
  await expect(rail).toBeVisible();
  await page.locator('footer').scrollIntoViewIfNeeded();
  const railBox = (await rail.boundingBox())!;
  // The footer element itself reserves `pb-28` under the rail on purpose (so the rail has somewhere
  // to float without covering anything); what must not be covered is the readable text inside it.
  for (const text of await page.locator('footer > span').all()) {
    const textBox = (await text.boundingBox())!;
    const overlaps =
      textBox.x < railBox.x + railBox.width &&
      textBox.x + textBox.width > railBox.x &&
      textBox.y < railBox.y + railBox.height &&
      textBox.y + textBox.height > railBox.y;
    expect(overlaps).toBe(false);
  }
});

test('section headers reveal as they scroll into view', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('#props [data-reveal]').first();
  await expect(header).not.toHaveAttribute('data-shown');
  await header.scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute('data-shown', '');
});
