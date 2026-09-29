import { describe, expect, it } from 'vitest';
import { downscale, encodeGif, type Frame } from './gif';

const solid = (width: number, height: number, rgb: [number, number, number], delay = 120): Frame => {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([...rgb, 255], i);
  return { data, width, height, delay };
};

describe('encodeGif', () => {
  it('writes a looping GIF89a whose logical screen matches the frames', () => {
    const bytes = encodeGif([solid(4, 2, [255, 0, 0]), solid(4, 2, [0, 0, 255])]);
    expect(new TextDecoder().decode(bytes.subarray(0, 6))).toBe('GIF89a');
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    expect(view.getUint16(6, true)).toBe(4);
    expect(view.getUint16(8, true)).toBe(2);
    expect(new TextDecoder().decode(bytes)).toContain('NETSCAPE2.0');
    expect(bytes.at(-1)).toBe(0x3b); // trailer
  });

  it('refuses an empty recording', () => {
    expect(() => encodeGif([])).toThrow(/no frames/);
  });
});

describe('downscale', () => {
  it('leaves a frame that already fits untouched', () => {
    const frame = solid(4, 2, [1, 2, 3]);
    expect(downscale(frame, 4)).toBe(frame);
  });

  it('box-averages down to the target width, keeping the aspect ratio and delay', () => {
    const frame = solid(4, 2, [0, 0, 0], 300);
    // left half white, right half black: the 2×1 result is one white pixel then one black pixel
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) frame.data.set([255, 255, 255, 255], (y * 4 + x) * 4);
    const small = downscale(frame, 2);
    expect(small).toMatchObject({ width: 2, height: 1, delay: 300 });
    expect([...small.data]).toEqual([255, 255, 255, 255, 0, 0, 0, 255]);
  });
});
