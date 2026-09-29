import { expect, test } from '../fixtures';

test.use({ allowConsoleErrors: /Failed to load resource: the server responded with a status of (400|429|502)/ });

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

test.describe('at a phone width', () => {
  // Load at this size (the beforeEach deep-links to #commit): resizing after the jump reflows the page above
  // #commit ~1800px taller and leaves the terminal off-screen, so its reveal would never fire.
  test.use({ viewport: { width: 375, height: 900 } });

  test('the inputs meet the 44px touch target', async ({ page }) => {
    // The terminal is wrapped in a <Reveal delay={120}>, which scales it to 0.98 until it has been seen;
    // wait for its delayed transition to finish (120ms + 500ms), then measure the steady state.
    const reveal = page.locator('#commit [data-reveal]').last();
    await expect(reveal).toHaveAttribute('data-shown', '');
    await reveal.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    for (const label of [/--author/, /--email/, /-m/]) {
      // The layout height from the page itself: Playwright's boundingBox() goes through device pixels
      // (DPR 2.625 on Pixel 7) and reads a 44px box as 43.99993896484375 at some scroll offsets.
      const height = await page.getByLabel(label).evaluate((el) => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });
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
