import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';

const NAV = 56;

/**
 * Cumulative layout shift since navigation start (buffered). Every shift counts: nothing is typed or tapped
 * during these loads, and Chromium's mobile emulation flags load-time shifts as hadRecentInput.
 */
async function loadCls(page: Page): Promise<number> {
  await expect(page.locator('html.hydrated')).toBeAttached();
  await page.waitForTimeout(1500);
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) total += entry.value;
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 100);
      }),
  );
}

test.describe('large, tall viewport (pinned)', () => {
  test.skip(({ isMobile }) => isMobile, 'the tree pins only at lg and ≥700px tall');

  test('the career tree pins and mounts its nodes as you scroll through it', async ({ page }) => {
    await page.goto('/');
    const tree = page.locator('#tree');
    const mounted = tree.locator('[data-state="mounted"]');
    const pin = tree.locator('.career-pin[data-pinned]');
    await expect(pin).toBeAttached();
    await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>('#tree .career-pin')!.offsetTop));
    await expect(mounted).toHaveCount(1);
    const height = await pin.evaluate((el) => el.getBoundingClientRect().height);
    await page.evaluate((h) => window.scrollBy(0, h * 0.55), height);
    await expect.poll(() => mounted.count()).toBeGreaterThanOrEqual(3);
    await expect(tree.locator('.career-sticky')).toBeInViewport();
  });

  test('the pinned stage fits under the nav', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize()!.height;
    const sticky = page.locator('#tree .career-sticky');
    await page.evaluate(() => {
      const pin = document.querySelector<HTMLElement>('#tree .career-pin')!;
      window.scrollTo(0, pin.offsetTop + pin.offsetHeight / 3);
    });
    await expect(sticky).toHaveCSS('position', 'sticky');
    await expect.poll(async () => (await sticky.boundingBox())!.y).toBeCloseTo(NAV, 0);
    const box = (await sticky.boundingBox())!;
    expect(box.height).toBeLessThanOrEqual(viewport - NAV);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport);
    // Everything in the stage is inside it, including every node with <EarlyCareer> collapsed: nothing mounts
    // below the fold or out of view in the node list.
    const overflow = await sticky.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(0);
    const listOverflow = await sticky.locator('ol').first().evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(listOverflow).toBeLessThanOrEqual(0);
  });

  test('scrolling through the whole tree causes no layout shift (CLS < 0.05)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tree .career-pin[data-pinned]')).toBeAttached();
    const cls = await page.evaluate(async () => {
      let total = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) total += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: false });
      const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
      const pin = document.querySelector<HTMLElement>('#tree .career-pin')!;
      const start = pin.offsetTop - window.innerHeight;
      const end = pin.offsetTop + pin.offsetHeight + window.innerHeight;
      for (let y = start; y <= end; y += 40) {
        window.scrollTo(0, y);
        await frame();
        await frame();
      }
      await new Promise((r) => setTimeout(r, 700));
      observer.takeRecords().forEach((entry) => {
        const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!e.hadRecentInput) total += e.value;
      });
      observer.disconnect();
      return total;
    });
    console.log(`career tree scroll CLS: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.05);
    await expect(page.locator('#tree [data-state="pending"]')).toHaveCount(0);
  });
});

test.describe('loading into the tree', () => {
  test('reloading mid-pin causes no layout shift (CLS < 0.05)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the tree pins only at lg and tall');
    await page.goto('/');
    await expect(page.locator('#tree .career-pin[data-pinned]')).toBeAttached();
    await page.evaluate(() => {
      const pin = document.querySelector<HTMLElement>('#tree .career-pin')!;
      window.scrollTo(0, pin.offsetTop + pin.offsetHeight / 2);
    });
    await page.waitForTimeout(300);
    await page.reload();
    const cls = await loadCls(page);
    const inPin = await page.evaluate(() => {
      const pin = document.querySelector<HTMLElement>('#tree .career-pin')!;
      return window.scrollY > pin.offsetTop && window.scrollY < pin.offsetTop + pin.offsetHeight;
    });
    console.log(`reload mid-pin CLS: ${cls.toFixed(4)}`);
    expect(inPin).toBe(true);
    expect(cls).toBeLessThan(0.05);
  });

  test('deep-linking to /#tree causes no layout shift (CLS < 0.05)', async ({ page, isMobile }) => {
    await page.goto('/#tree');
    const cls = await loadCls(page);
    console.log(`/#tree load CLS (${isMobile ? 'mobile' : 'desktop'}): ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.05);
  });

  test('deep-linking to /#tree on a slow phone CPU causes no layout shift (CLS < 0.05)', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'a Pixel 7 on a throttled CPU (the mobile project; CDP is Chromium-only)');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 8 });
    await page.goto('/#tree');
    const cls = await loadCls(page);
    console.log(`/#tree load CLS (mobile, 8× CPU throttle): ${cls.toFixed(4)}`);
    expect(cls).toBeLessThan(0.05);
  });
});

test.describe('app bundle arrives after the 3s failsafe', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.skip(({ isMobile }) => isMobile, 'desktop-only: the tree would pin here');

  test('the tree stays the static layout, with every node mounted and its highlights visible', async ({ page }) => {
    await page.route('**/assets/index-*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 4500));
      await route.continue();
    });
    await page.goto('/');
    await expect(page.locator('html.hydrated')).toBeAttached({ timeout: 10_000 });
    expect(await page.evaluate(() => document.documentElement.classList.contains('js'))).toBe(false);
    const tree = page.locator('#tree');
    await tree.scrollIntoViewIfNeeded();
    await expect(tree.locator('.career-pin')).not.toHaveAttribute('data-pinned');
    await expect(tree.locator('.career-sticky')).toHaveCSS('position', 'static');
    await expect(tree.locator('[data-state="mounted"]')).toHaveCount(6);
    await expect(tree.getByText('Owned technical breakdowns for upcoming front-end projects')).toBeVisible();
  });
});

test.describe('phones', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile project only');

  test('the tree is not pinned and every node is mounted with its highlights', async ({ page }) => {
    await page.goto('/');
    const tree = page.locator('#tree');
    await tree.scrollIntoViewIfNeeded();
    await expect(tree.locator('.career-sticky')).toHaveCSS('position', 'static');
    const viewport = page.viewportSize()!.height;
    expect((await tree.boundingBox())!.height).toBeLessThan(viewport * 2.5);
    await expect(tree.locator('[data-state="pending"]')).toHaveCount(0);
    await expect(tree.locator('[data-state="mounted"]')).toHaveCount(6);
    await expect(tree.getByText('Owned technical breakdowns for upcoming front-end projects')).toBeVisible();
  });
});

test('the early career subtree expands on click', async ({ page }) => {
  await page.goto('/#tree');
  const summary = page.locator('#tree summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await expect(page.locator('#tree details').getByText('Dynamic Page Solutions')).toBeVisible();
});
