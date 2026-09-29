import { expect, test } from '@playwright/test';

test.describe('Day in the Life: smoke', () => {
  test('a visitor can reach every step of the render cycle', async ({ page }) => {
    await page.goto('/');
    for (const id of ['mount', 'write', 'tree', 'props', 'commit']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('the contact API accepts a dry-run commit', async ({ request }) => {
    const token = process.env.DITL_TOKEN;
    test.skip(!token, 'DITL_TOKEN not set');
    const res = await request.post('/api/contact', {
      headers: { 'x-ditl-token': token! },
      data: { name: 'Ditl Bot', email: 'ditl@example.com', message: 'Day in the life smoke test.' },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
  });
});
