/**
 * Records the README's Inspector demo: docs/readme/inspector.gif.
 * Needs a fresh `pnpm build`; starts `pnpm preview` itself and stops it afterwards.
 *   pnpm build && pnpm readme:gif
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { downscale, encodeGif, type Frame } from './gif';

const BASE = 'http://localhost:4173';
const OUT = 'docs/readme/inspector.gif';
const INTERVAL = 120;
const MAX_BYTES = 5 * 1024 * 1024;
const HOLD_LAST = 2000; // pause on the final frame before the loop restarts

if (!existsSync('dist/index.html')) throw new Error('dist/ is missing: run `pnpm build` first.');

async function waitForServer(url: string, timeoutMs = 30_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not listening yet */
    }
    await sleep(250);
  }
  throw new Error(`preview server did not answer at ${url}`);
}

/** Screenshots the page every INTERVAL ms until stopped; each frame's delay is the real time until the next. */
function startRecording(page: Page) {
  const shots: { png: Buffer; at: number }[] = [];
  let recording = true;
  const done = (async () => {
    while (recording) {
      const at = Date.now();
      shots.push({ png: await page.screenshot({ type: 'png' }), at });
      await sleep(Math.max(0, INTERVAL - (Date.now() - at)));
    }
  })();
  return async (): Promise<Frame[]> => {
    recording = false;
    await done;
    return shots.map(({ png, at }, i) => {
      const { data, width, height } = PNG.sync.read(png);
      const next = shots[i + 1];
      return { data: new Uint8Array(data), width, height, delay: next ? next.at - at : HOLD_LAST };
    });
  };
}

async function demo(page: Page) {
  const beat = (ms = 700) => page.waitForTimeout(ms);
  await beat(600);
  await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).click();
  await page.getByRole('dialog', { name: /DaggerheartCardCreator/ }).waitFor();
  await beat(1000);
  // Tree order: root, Problem, MyRole, Architecture, HardParts, Outcome.
  for (const downs of [1, 2, 1]) {
    for (let i = 0; i < downs; i++) {
      await page.keyboard.press('ArrowDown');
      await beat(250);
    }
    await page.keyboard.press('Enter');
    await beat(1100);
  }
}

const server = spawn('pnpm', ['preview'], { detached: true, stdio: 'ignore' });
try {
  await waitForServer(BASE);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, colorScheme: 'dark' });
    await page.goto(`${BASE}/#props`);
    await page.locator('[data-hero][data-mounted]').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: /Inspect Daggerheart Card Creator/ }).waitFor();
    await page.waitForTimeout(800); // let the cards' reveal settle before the first frame
    const stop = startRecording(page);
    await demo(page);
    let frames = await stop();
    let gif = encodeGif(frames);
    if (gif.byteLength > MAX_BYTES) {
      frames = frames.map((f) => downscale(f, 900));
      gif = encodeGif(frames);
    }
    await writeFile(OUT, gif);
    const { width, height } = frames[0]!;
    console.log(`${OUT}: ${frames.length} frames, ${width}×${height}, ${(gif.byteLength / 1024 / 1024).toFixed(2)} MB`);
  } finally {
    await browser.close();
  }
} finally {
  if (server.pid) process.kill(-server.pid, 'SIGTERM'); // the whole group: pnpm and its vite child
}
