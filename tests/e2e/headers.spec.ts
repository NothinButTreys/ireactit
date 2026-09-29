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
