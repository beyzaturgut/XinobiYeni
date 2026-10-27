import { expect, test } from "@playwright/test";
import { cylindricalCoordinate, DEFAULT_CURVATURE_STRENGTH, deriveBodySurface, warpPattern } from "../../src/features/product-personalization/rendering/product-surface-warp";
import { separatedBodyPlacements } from "../../src/features/product-personalization/rendering/separated-body-placement";
import { applySurfaceInk } from "../../src/features/product-personalization/rendering/surface-ink";

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

test("two significant mask components receive stable upper/lower placement ids", () => {
  const width = 120, height = 100;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 8; y < 35; y++) for (let x = 25; x < 95; x++) data[(y * width + x) * 4 + 3] = 255;
  for (let y = 58; y < 92; y++) for (let x = 15; x < 105; x++) data[(y * width + x) * 4 + 3] = 255;
  const placements = separatedBodyPlacements({ width, height, data } as ImageData, 32, 24, false);
  expect(placements.map(({ id }) => id)).toEqual(["upper-body", "lower-body"]);
});

test("small disconnected mask components join the nearest body's clip without changing placement", () => {
  const width = 120, height = 100;
  const makeMask = (includeIslands: boolean) => {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 8; y < 35; y++) for (let x = 25; x < 95; x++) data[(y * width + x) * 4 + 3] = 255;
    for (let y = 58; y < 92; y++) for (let x = 15; x < 105; x++) data[(y * width + x) * 4 + 3] = 255;
    if (includeIslands) {
      for (let y = 20; y < 23; y++) for (let x = 101; x < 104; x++) data[(y * width + x) * 4 + 3] = 255;
      for (let y = 75; y < 78; y++) for (let x = 7; x < 10; x++) data[(y * width + x) * 4 + 3] = 255;
    }
    return { width, height, data } as ImageData;
  };
  const base = separatedBodyPlacements(makeMask(false), 32, 24, false);
  const withIslands = separatedBodyPlacements(makeMask(true), 32, 24, false);
  expect(withIslands).toHaveLength(2);
  expect(withIslands.map(({ id }) => id)).toEqual(["upper-body", "lower-body"]);
  for (let index = 0; index < 2; index++) {
    expect({ ...withIslands[index], runs: undefined }).toEqual({ ...base[index], runs: undefined });
  }
  const contains = (body: typeof withIslands[number], x: number, y: number) =>
    body.runs.some(run => run.y === y && run.start <= x && run.end >= x);
  for (let y = 20; y < 23; y++) for (let x = 101; x < 104; x++) {
    expect(contains(withIslands[0], x, y)).toBe(true);
    expect(contains(withIslands[1], x, y)).toBe(false);
  }
  for (let y = 75; y < 78; y++) for (let x = 7; x < 10; x++) {
    expect(contains(withIslands[0], x, y)).toBe(false);
    expect(contains(withIslands[1], x, y)).toBe(true);
  }
});

test("shared pattern cover keeps both bodies at one scale and survives default warp without alpha gaps", () => {
  const width = 200, height = 120, patternWidth = 40, patternHeight = 40;
  const mask = { width, height, data: new Uint8ClampedArray(width * height * 4) } as ImageData;
  for (let y = 10; y < 45; y++) for (let x = 60; x < 140; x++) mask.data[(y * width + x) * 4 + 3] = 255;
  for (let y = 65; y < 110; y++) for (let x = 40; x < 160; x++) mask.data[(y * width + x) * 4 + 3] = 255;
  const bodies = separatedBodyPlacements(mask, patternWidth, patternHeight, false);
  const sharedRatio = Math.max(...bodies.map(body => Math.max(body.width / patternWidth, body.height / patternHeight)));
  expect(bodies.map(body => body.width / patternWidth)).not.toEqual([sharedRatio, sharedRatio]);

  const pattern = { width, height, data: new Uint8ClampedArray(width * height * 4) } as ImageData;
  for (const body of bodies) {
    const centerX = (body.left + body.right + 1) / 2, centerY = (body.top + body.bottom + 1) / 2;
    const drawWidth = patternWidth * sharedRatio * 1.2, drawHeight = patternHeight * sharedRatio * 1.2;
    for (let y = Math.floor(centerY - drawHeight / 2); y < Math.ceil(centerY + drawHeight / 2); y++) {
      for (let x = Math.floor(centerX - drawWidth / 2); x < Math.ceil(centerX + drawWidth / 2); x++) {
        if (x >= 0 && y >= 0 && x < width && y < height) pattern.data[(y * width + x) * 4 + 3] = 255;
      }
    }
  }
  const surface = deriveBodySurface(mask, true);
  const countGaps = () => {
    let gaps = 0;
    for (let pixel = 0; pixel < width * height; pixel++) if (mask.data[pixel * 4 + 3] >= 128 && pattern.data[pixel * 4 + 3] === 0) gaps++;
    return gaps;
  };
  expect(countGaps()).toBe(0);
  warpPattern(pattern, surface, DEFAULT_CURVATURE_STRENGTH);
  expect(countGaps()).toBe(0);
});

test("metallic ink restores more shadePattern depth without heavily darkening white or changing neutral colors", () => {
  const artwork = { width: 3, height: 1, data: new Uint8ClampedArray([255, 255, 255, 255, 180, 95, 45, 255, 60, 130, 210, 255]) } as ImageData;
  const source = { width: 3, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]) } as ImageData;
  const lighting = { multipliers: new Float32Array([0.6, 1, 1.4]), activePixels: new Uint32Array([0, 1, 2]) };
  const before = artwork.data.slice();
  applySurfaceInk(artwork, source, lighting);
  expect(artwork.data[0]).toBeGreaterThanOrEqual(225);
  expect(artwork.data.slice(4, 7)).toEqual(before.slice(4, 7));
  expect(artwork.data[8]).toBeLessThan(artwork.data[9]);
  expect(artwork.data[9]).toBeLessThan(artwork.data[10]);
  expect(artwork.data[10]).toBeLessThan(255);
  expect(Math.abs(artwork.data[8] / artwork.data[10] - before[8] / before[10])).toBeLessThan(0.04);
  expect(artwork.data[3]).toBe(255);
  expect(artwork.data[7]).toBe(255);
  expect(artwork.data[11]).toBe(255);
  expect(artwork.data[0]).toBeLessThan(255);
});

test("optional surface exposure preserves the existing default byte-for-byte and deepens only relative light", () => {
  const source = { width: 3, height: 1, data: new Uint8ClampedArray(12).fill(255) } as ImageData;
  const lighting = { multipliers: new Float32Array([0.6, 1, 1.4]), activePixels: new Uint32Array([0, 1, 2]) };
  const pixels = [180, 150, 120, 255, 180, 150, 120, 255, 180, 150, 120, 255];
  const defaultInk = { width: 3, height: 1, data: new Uint8ClampedArray(pixels) } as ImageData;
  const explicitDefault = { width: 3, height: 1, data: new Uint8ClampedArray(pixels) } as ImageData;
  const stronger = { width: 3, height: 1, data: new Uint8ClampedArray(pixels) } as ImageData;
  applySurfaceInk(defaultInk, source, lighting);
  applySurfaceInk(explicitDefault, source, lighting, 0.35);
  applySurfaceInk(stronger, source, lighting, 0.55);
  expect(defaultInk.data).toEqual(explicitDefault.data);
  expect(stronger.data[0]).toBeLessThan(defaultInk.data[0]);
  expect(stronger.data[8]).toBeGreaterThan(defaultInk.data[8]);
  expect(stronger.data.slice(4, 7)).toEqual(defaultInk.data.slice(4, 7));
  expect(stronger.data.filter((_, index) => index % 4 === 3)).toEqual(new Uint8ClampedArray([255, 255, 255]));
});
