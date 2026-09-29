import { expect, test } from '../fixtures';

test('robots.txt allows crawling and points at the sitemap', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'static files are browser-independent');
  const res = await request.get('/robots.txt');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('text/plain');
  const body = await res.text();
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Allow: /');
  expect(body).toContain('Sitemap: https://ireactit.com/sitemap.xml');
});

test('sitemap.xml lists the canonical URL', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'static files are browser-independent');
  const res = await request.get('/sitemap.xml');
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('xml');
  expect(await res.text()).toContain('<loc>https://ireactit.com/</loc>');
});
