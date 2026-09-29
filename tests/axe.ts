import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from './fixtures';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING = ['moderate', 'serious', 'critical'];

/** Fails on any WCAG 2.2 AA violation of moderate impact or worse. */
export async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = violations.filter((v) => BLOCKING.includes(v.impact ?? ''));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}
