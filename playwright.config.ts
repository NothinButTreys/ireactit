import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env.local'); // local DITL_TOKEN; absent in CI
} catch {
  /* no .env.local */
}

const baseURL = process.env.BASE_URL ?? 'http://localhost:4173';
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
// tests/visual compares against Linux baselines and runs only inside the Playwright image
// (scripts/visual-run.sh, scripts/visual-update.sh), which sets PW_VISUAL=1.
const visual = !!process.env.PW_VISUAL;
// Traces record request headers verbatim, including the Vercel bypass secret and the x-ditl-token, and deploy-check
// uploads failed reports from this public repo. So never trace against a deployment; CI on localhost (dummy token) keeps them.
const remote = !!(process.env.BASE_URL || bypass);

export default defineConfig({
  testDir: './tests',
  testIgnore: visual ? [] : ['visual/**'],
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: remote ? 'off' : 'retain-on-failure',
    extraHTTPHeaders: {
      'x-vercel-skip-toolbar': '1',
      ...(bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : {}),
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'pnpm preview', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
