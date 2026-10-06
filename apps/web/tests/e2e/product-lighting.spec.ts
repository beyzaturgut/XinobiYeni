import { expect, test } from "@playwright/test";
import { deriveProductLighting, shadePattern } from "../../src/app/urunler/cay-makinesi-101/editor/product-lighting";

function image(width: number, height: number, color: (x: number, y: number) => number[]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set(color(x, y), (y * width + x) * 4);
  return { width, height, data } as ImageData;
}

test("lighting ignores background and branding, stays bounded and preserves alpha", () => {
  const mask = image(64, 32, (x) => [0, 0, 0, x >= 4 && x < 60 ? 255 : 0]);
  const branding = image(64, 32, (x, y) => [255, 255, 255, x >= 29 && x <= 32 && y >= 12 && y <= 16 ? 255 : 0]);
  const product = image(64, 32, (x) => [40 + 2 * x, 40 + 2 * x, 40 + 2 * x, 255]);
  const contaminated = image(64, 32, (x, y) => x < 4 || x >= 60 || (x >= 29 && x <= 32 && y >= 12 && y <= 16) ? [255, 255, 255, 255] : [40 + 2 * x, 40 + 2 * x, 40 + 2 * x, 255]);
  const lighting = deriveProductLighting(product, mask, branding);
  expect(deriveProductLighting(contaminated, mask, branding).multipliers).toEqual(lighting.multipliers);
  expect(Math.min(...lighting.multipliers)).toBeGreaterThanOrEqual(0.5999);
  expect(Math.max(...lighting.multipliers)).toBeLessThanOrEqual(1.4001);
  const pattern = image(64, 32, () => [160, 100, 60, 128]);
  const before = pattern.data.slice();
  shadePattern(pattern, lighting);
  let darkened = 0, brightened = 0;
  for (let pixel = 0; pixel < 64 * 32; pixel++) {
    const offset = pixel * 4;
    expect(pattern.data[offset + 3]).toBe(before[offset + 3]);
    if (mask.data[offset + 3] === 0) expect(pattern.data.slice(offset, offset + 4)).toEqual(before.slice(offset, offset + 4));
    if (pattern.data[offset] < before[offset]) darkened++;
    if (pattern.data[offset] > before[offset]) brightened++;
  }
  expect(darkened).toBeGreaterThan(0);
  expect(brightened).toBeGreaterThan(0);
  // Linear-light shadow modulation is gentler than multiplying encoded sRGB by 0.6.
  expect(pattern.data[(16 * 64 + 4) * 4]).toBeGreaterThan(160 * 0.6);
});

test("constant illumination is neutral and mismatched input dimensions are rejected", () => {
  const product = image(16, 16, () => [40, 55, 80, 255]);
  const mask = image(16, 16, () => [0, 0, 0, 255]);
  const lighting = deriveProductLighting(product, mask);
  expect([...lighting.multipliers].every((value) => value === 1)).toBe(true);
  const pattern = image(16, 16, () => [80, 150, 200, 64]);
  const before = pattern.data.slice();
  shadePattern(pattern, lighting);
  expect(pattern.data).toEqual(before);
  expect(() => deriveProductLighting(product, image(8, 8, () => [0, 0, 0, 255]))).toThrow("Unaligned lighting assets");
});
