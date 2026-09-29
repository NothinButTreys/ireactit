import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(new URL('./og.html', import.meta.url).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: fileURLToPath(new URL('../public/og.png', import.meta.url)) });
await browser.close();
console.log('wrote public/og.png');
