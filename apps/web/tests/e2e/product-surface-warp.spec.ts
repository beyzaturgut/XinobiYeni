import { expect, test } from "@playwright/test";
import { cylindricalCoordinate, DEFAULT_CURVATURE_STRENGTH, deriveBodySurface, warpPattern } from "../../src/app/urunler/cay-makinesi-101/editor/product-surface-warp";

function fixture() {
  const width = 200, height = 120;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 10; y < 110; y++) {
    const cap = Math.max(0, y - 95) ** 2 * 0.15;
    for (let x = Math.ceil(30 - y * 0.1 + cap); x < 170 + y * 0.1 - cap; x++) {
      if (y >= 20 && y <= 50 && x < 80) continue; // Spout exclusion, not body silhouette.
      data[(y * width + x) * 4 + 3] = 255;
    }
  }
  data[(35 * width + 1) * 4 + 3] = 255; // Isolated mask noise must not define the cylinder.
  return { width, height, data } as ImageData;
}

test("body silhouette is smooth and tapered despite a spout cutout and bottom cap", () => {
  const surface = deriveBodySurface(fixture());
  for (let y = 11; y < 109; y++) {
    expect(Math.abs(surface.centers[y] - surface.centers[y - 1])).toBeLessThan(0.1);
    expect(Math.abs(surface.radii[y] - surface.radii[y - 1])).toBeLessThan(0.3);
  }
  expect(surface.radii[35]).toBeGreaterThan(70);
  expect(surface.radii[105]).toBeGreaterThan(surface.radii[35]);
});

test("cylindrical mapping preserves the center and progressively compresses edges", () => {
  const strength = DEFAULT_CURVATURE_STRENGTH;
  expect(cylindricalCoordinate(0, strength)).toBe(0);
  const derivative = (u: number) => (cylindricalCoordinate(u + 0.0001, strength) - cylindricalCoordinate(u - 0.0001, strength)) / 0.0002;
  expect(derivative(0)).toBeCloseTo(1, 5);
  expect(derivative(0.9)).toBeGreaterThan(derivative(0.5));
  expect(derivative(0.5)).toBeGreaterThan(derivative(0));
  for (const u of [0.1, 0.5, 0.9, 1, 1.01]) {
    expect(cylindricalCoordinate(-u, strength)).toBeCloseTo(-cylindricalCoordinate(u, strength), 10);
    expect(cylindricalCoordinate(u, 0)).toBe(u);
  }
  expect(Math.abs(cylindricalCoordinate(0.9999, strength) - cylindricalCoordinate(1.0001, strength))).toBeLessThan(0.001);
});

test("zero curvature is byte-exact; default warp changes only active pixels without alpha gaps", () => {
  const mask = fixture(), surface = deriveBodySurface(mask);
  const data = new Uint8ClampedArray(mask.data.length);
  for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) data.set([x, 90, 150, 255], (y * mask.width + x) * 4);
  const pattern = { width: mask.width, height: mask.height, data } as ImageData;
  const original = data.slice();
  warpPattern(pattern, surface, 0);
  expect(data).toEqual(original);
  warpPattern(pattern, surface, DEFAULT_CURVATURE_STRENGTH);
  let changed = 0, outsideDifferences = 0, alphaGaps = 0;
  for (let pixel = 0; pixel < mask.width * mask.height; pixel++) {
    const offset = pixel * 4;
    if (mask.data[offset + 3] === 0 && [0, 1, 2, 3].some((channel) => data[offset + channel] !== original[offset + channel])) outsideDifferences++;
    else if (mask.data[offset + 3] > 0 && pixel !== 35 * mask.width + 1 && data[offset + 3] !== 255) alphaGaps++;
    if (data[offset] !== original[offset]) changed++;
  }
  expect(changed).toBeGreaterThan(1000);
  expect(outsideDifferences).toBe(0);
  expect(alphaGaps).toBe(0);
  expect(() => warpPattern(pattern, surface, -1)).toThrow("Invalid curvature strength");
});
