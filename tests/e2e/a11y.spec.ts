import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../fixtures';

for (const theme of ['dark', 'light'] as const) {
  test(`no moderate, serious or critical axe violations (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = violations.filter(
      (v) => v.impact === 'moderate' || v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
