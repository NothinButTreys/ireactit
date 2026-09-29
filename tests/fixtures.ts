import { test as base, expect } from '@playwright/test';

type ConsoleFailure = { type: 'pageerror' | 'console.error'; text: string };

/**
 * Extends the base Playwright `test` with an auto fixture that records
 * `pageerror` events and `console.error` messages, then fails the test if any
 * were recorded. This turns silent hydration mismatches and runtime errors
 * into loud test failures instead of passing specs that hid a broken page.
 */
/**
 * `allowConsoleErrors` is a single RegExp (use alternation for several patterns), never an array: Playwright
 * reads an array fixture value as a `[value, options]` tuple, so `[reA, reB]` would silently drop `reB`.
 */
export const test = base.extend<{
  allowConsoleErrors: RegExp | null;
  forbidConsoleErrors: void;
  linuxWebkitNoFilter: void;
}>({
  allowConsoleErrors: [null, { option: true }],
  /**
   * Playwright's Linux WebKit segfaults in its compositor thread while `filter: blur()` transitions run (gdb
   * traces and a 40-run bisect in .superpowers/sdd/p3/task-5-fix-report.md: every filter animation removed
   * took the crash rate from about 25% to 0/40). Safari on macOS and iOS doesn't use that compositor, so the
   * site keeps its blur, and only this test engine has filters switched off. Opacity and transform still animate.
   */
  linuxWebkitNoFilter: [
    async ({ page, browserName }, use) => {
      if (browserName === 'webkit' && process.platform === 'linux') {
        await page.addInitScript(() => {
          const add = () => {
            const style = document.createElement('style');
            style.textContent = '*, *::before, *::after { filter: none !important; }';
            (document.head ?? document.documentElement).appendChild(style);
          };
          if (document.documentElement) add();
          else document.addEventListener('readystatechange', add, { once: true });
        });
      }
      await use();
    },
    { auto: true },
  ],
  forbidConsoleErrors: [
    async ({ page, allowConsoleErrors }, use) => {
      const failures: ConsoleFailure[] = [];

      const onPageError = (error: Error) => {
        failures.push({ type: 'pageerror', text: error.stack ?? error.message });
      };
      const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
        if (msg.type() === 'error' && !allowConsoleErrors?.test(msg.text())) {
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
