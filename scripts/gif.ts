import { createRequire } from 'node:module';

// gifenc is CommonJS without an exports map, so Node's ESM loader can't see its named exports; require it.
const { applyPalette, GIFEncoder, quantize } = createRequire(import.meta.url)('gifenc') as typeof import('gifenc');

/** One RGBA frame and how long it stays on screen, in ms. */
export type Frame = { data: Uint8Array; width: number; height: number; delay: number };

/** Box-filters a frame down to `maxWidth`, keeping its aspect ratio. Frames that already fit are returned as-is. */
export function downscale(frame: Frame, maxWidth: number): Frame {
  if (frame.width <= maxWidth) return frame;
  const scale = frame.width / maxWidth;
  const width = maxWidth;
  const height = Math.max(1, Math.round(frame.height / scale));
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const y0 = Math.floor(y * scale);
    const y1 = Math.min(frame.height, Math.max(y0 + 1, Math.floor((y + 1) * scale)));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor(x * scale);
      const x1 = Math.min(frame.width, Math.max(x0 + 1, Math.floor((x + 1) * scale)));
      const sum = [0, 0, 0, 0];
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * frame.width + sx) * 4;
          for (let c = 0; c < 4; c++) sum[c]! += frame.data[i + c]!;
        }
      }
      const n = (y1 - y0) * (x1 - x0);
      data.set(sum.map((s) => Math.round(s / n)), (y * width + x) * 4);
    }
  }
  return { data, width, height, delay: frame.delay };
}

/** Encodes frames as a forever-looping GIF, each with its own 256-colour palette. */
export function encodeGif(frames: readonly Frame[]): Uint8Array {
  if (frames.length === 0) throw new Error('encodeGif: no frames to encode');
  const gif = GIFEncoder();
  for (const { data, width, height, delay } of frames) {
    const palette = quantize(data, 256);
    gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay, repeat: 0 });
  }
  gif.finish();
  return gif.bytes();
}
