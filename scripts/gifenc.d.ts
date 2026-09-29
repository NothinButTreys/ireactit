// gifenc ships no type declarations; this covers the subset scripts/gif.ts uses.
declare module 'gifenc' {
  export type Palette = number[][];
  export type FrameOptions = { palette?: Palette; delay?: number; repeat?: number; dispose?: number };
  export interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: FrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(): Encoder;
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number): Palette;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Palette): Uint8Array;
}
