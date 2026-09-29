import { test as base, expect } from '@playwright/test';

type ConsoleFailure = { type: 'pageerror' | 'console.error'; text: string };

/**
 * Extends the base Playwright `test` with an auto fixture that records
 * `pageerror` events and `console.error` messages, then fails the test if any
 * were recorded. This turns silent hydration mismatches and runtime errors
 * into loud test failures instead of passing specs that hid a broken page.
 */
export const test = base.extend<{ allowConsoleErrors: RegExp[]; forbidConsoleErrors: void }>({
  allowConsoleErrors: [[], { option: true }],
  forbidConsoleErrors: [
    async ({ page, allowConsoleErrors }, use) => {
      const failures: ConsoleFailure[] = [];

      const onPageError = (error: Error) => {
        failures.push({ type: 'pageerror', text: error.stack ?? error.message });
      };
      const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
        if (msg.type() === 'error' && !allowConsoleErrors.some((re) => re.test(msg.text()))) {
          failures.push({ type: 'console.error', text: msg.text() });
        }
      };

      page.on('pageerror', onPageError);
      page.on('console', onConsole);

      await use();

      page.off('pageerror', onPageError);
      page.off('console', onConsole);

      if (failures.length > 0) {
        const details = failures.map((f) => `[${f.type}] ${f.text}`).join('\n');
        throw new Error(`Console/page errors were recorded during the test:\n${details}`);
      }
    },
    { auto: true },
  ],
});

export { expect };
