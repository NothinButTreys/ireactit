import { profile } from '../../src/content/profile';
import { expect, test } from '../fixtures';
import { ditlToken, dryRunContact, fillCommit, onlyProject } from './helpers';

test('Recruiter Riley: skims every step on a phone, inspects a project, checks the resume, says hello', async ({ page }, testInfo) => {
  onlyProject(testInfo, 'mobile');
  const token = ditlToken();
  test.skip(!token, 'DITL_TOKEN not set');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const id of ['mount', 'write', 'tree', 'props', 'commit']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
  const dialog = page.getByRole('dialog', { name: /DaggerheartCardCreator/ });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  // The resume link sits beside the contact terminal in #commit; its name carries "↗ (opens in a new tab)".
  await expect(page.locator('#commit').getByRole('link', { name: /^Resume\b/ })).toHaveAttribute('href', profile.links.resume);
  await dryRunContact(page, token!);
  await page.locator('#commit').scrollIntoViewIfNeeded();
  await fillCommit(page, 'Recruiter Riley');
  await page.getByRole('button', { name: 'git push' }).click();
  await expect(page.locator('#commit').getByRole('status')).toContainText('delivered to trey/main');
});
