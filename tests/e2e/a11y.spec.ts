import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light'] as const) {
  test(`no serious or critical axe violations (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
