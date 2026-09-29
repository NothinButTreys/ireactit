import { expect, test } from '../fixtures';

test('ships prerendered markup in the raw HTML response', async ({ request }) => {
  const res = await request.get('/');
  const html = await res.text();
  expect(html).toContain('id="mount"');
  expect(html).toContain('<h1');
  expect(html).toContain('Hi, I'); // the greeting is HTML-escaped in the raw response
});
