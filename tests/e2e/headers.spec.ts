import { expect, test } from '../fixtures';

test('the deployment sends the security headers', async ({ request }, testInfo) => {
  test.skip(!process.env.BASE_URL, 'vite preview does not apply vercel.json headers');
  test.skip(testInfo.project.name !== 'chromium', 'headers are browser-independent');
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("script-src 'self' 'sha256-");
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('old Next.js routes redirect temporarily to the home page', async ({ request }, testInfo) => {
  test.skip(!process.env.BASE_URL, 'vite preview does not apply vercel.json redirects');
  test.skip(testInfo.project.name !== 'chromium', 'redirects are browser-independent');
  for (const path of ['/login', '/register', '/project/abc123']) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(new URL(res.headers()['location']!, 'https://ireactit.com').pathname, path).toBe('/');
  }
});
