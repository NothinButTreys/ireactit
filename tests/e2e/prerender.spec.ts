import { expect, test } from '../fixtures';

test('ships prerendered markup in the raw HTML response', async ({ request }) => {
  const res = await request.get('/');
  const html = await res.text();
  expect(html).toContain('id="mount"');
  expect(html).toContain('<h1');
  expect(html).toContain('Hi, I'); // the greeting is HTML-escaped in the raw response
});

test('link previews have a 1200×630 image', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://ireactit.com/og.png');
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /IReactIt/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://ireactit.com/og.png');
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toBe('image/png');
});
