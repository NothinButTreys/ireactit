import { expect, test } from '../fixtures';
import { onlyProject } from './helpers';

test('Collaborator Cam: deep-links to projects, inspects Daggerheart, and the outbound link is right', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'webkit');
  await page.goto('/#props');
  await expect(page.locator('#props')).toBeInViewport();
  await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  // Rendered in the inspector's PropsPane; the accessible name ends "(opens in a new tab)".
  const link = dialog.getByRole('link', { name: /^Open the Card Creator\b/ });
  await expect(link).toHaveAttribute('href', 'https://www.daggerheart.com/card-creator');
  await expect(link).toHaveAttribute('target', '_blank');
  // noreferrer implies noopener in every browser, and also withholds the Referer.
  await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
});
