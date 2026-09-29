import { expect, test } from '../fixtures';

const ids = ['mount', 'write', 'tree', 'props', 'commit'];

test('renders every render-cycle section in order', async ({ page }) => {
  await page.goto('/');
  const found = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id));
  expect(found).toEqual(ids);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hi, I'm Trey.");
});

for (const id of ids) {
  test(`deep link /#${id} lands on that section`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}

test('rail marks the section in view as current', async ({ page, isMobile }) => {
  test.skip(isMobile, 'rail is hidden below md');
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Render cycle' }).getByRole('link', { name: 'props' }).click();
  await expect(page.getByRole('link', { name: 'props' })).toHaveAttribute('aria-current', 'location');
});

test('clicking the rail link lands the section within 56±8px of the viewport top', async ({ page, isMobile }) => {
  test.skip(isMobile, 'rail is hidden below md');
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Render cycle' }).getByRole('link', { name: 'props' }).click();
  await expect(page.locator('#props')).toBeInViewport();
  await page.waitForTimeout(1500); // let the Lenis-driven smooth scroll finish easing in
  const top = await page.locator('#props').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(56 - 8);
  expect(top).toBeLessThanOrEqual(56 + 8);
});

test('theme toggle persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' }); // Playwright defaults to light
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
