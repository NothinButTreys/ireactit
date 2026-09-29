import { expect, test } from '../fixtures';

test.use({ allowConsoleErrors: [/Failed to load resource: the server responded with a status of (400|429|502)/] });

async function fill(page: import('@playwright/test').Page) {
  await page.getByLabel(/--author/).fill('Playwright Pat');
  await page.getByLabel(/--email/).fill('pat@example.com');
  await page.getByLabel(/-m/).fill('Hello from the contact e2e test.');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#commit');
});

test('a valid commit is delivered and clears the form', async ({ page }) => {
  let body: unknown;
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { ok: true } });
  });
  await fill(page);
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.locator('#commit').getByRole('status')).toContainText('delivered to trey/main');
  await expect(page.getByLabel(/-m/)).toHaveValue('');
  expect(body).toMatchObject({ name: 'Playwright Pat', email: 'pat@example.com' });
});

test('a rejected push keeps the message', async ({ page }) => {
  await page.route('**/api/contact', (route) => route.fulfill({ status: 502, json: { ok: false, error: 'send_failed' } }));
  await fill(page);
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.locator('#commit').getByRole('status')).toContainText('push rejected');
  await expect(page.getByLabel(/-m/)).toHaveValue('Hello from the contact e2e test.');
});

test('an empty submit moves focus to the name field, and to the first invalid field in order', async ({ page }) => {
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByLabel(/--author/)).toBeFocused();

  await page.getByLabel(/--author/).fill('Playwright Pat');
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByLabel(/--email/)).toBeFocused();
});

test('the form has an accessible name', async ({ page }) => {
  await expect(page.getByRole('form', { name: 'Contact form' })).toBeVisible();
});

test('the inputs meet the 44px touch target at mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  // The terminal is wrapped in a <Reveal>, which briefly scales it down until its own
  // IntersectionObserver fires; wait for that to settle before measuring the steady state.
  await expect(page.locator('#commit [data-reveal]').last()).toHaveAttribute('data-shown', '');
  await page.waitForTimeout(600); // let the reveal's 500ms scale/opacity/blur transition finish
  for (const label of [/--author/, /--email/, /-m/]) {
    const box = await page.getByLabel(label).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('invalid input never reaches the network', async ({ page }) => {
  let called = false;
  await page.route('**/api/contact', (route) => {
    called = true;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.getByText('Tell me your name')).toBeVisible();
  expect(called).toBe(false);
});

test('the footer reports a real render time', async ({ page }) => {
  await expect(page.locator('footer')).toContainText(/page rendered in \d+ms/);
});

test('the author field shows a visible keyboard focus indicator', async ({ page }) => {
  const author = page.getByLabel(/--author/);
  await author.focus();

  const { outlineStyle, boxShadow } = await author.evaluate((el) => {
    const style = getComputedStyle(el);
    return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow };
  });

  expect(outlineStyle !== 'none' || boxShadow !== 'none').toBe(true);
});
