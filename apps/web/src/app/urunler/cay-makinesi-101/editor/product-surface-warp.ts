export const DEFAULT_CURVATURE_STRENGTH = 0.75;
const ANGULAR_EXTENT = 0.9; // Stop short of the cylinder's singular grazing angle.

export function cylindricalCoordinate(u: number, strength: number) {
  const absolute = Math.abs(u);
  const angular = absolute <= 1
    ? Math.asin(ANGULAR_EXTENT * absolute) / ANGULAR_EXTENT
    : Math.asin(ANGULAR_EXTENT) / ANGULAR_EXTENT + (absolute - 1) / Math.sqrt(1 - ANGULAR_EXTENT ** 2);
  return u + strength * (Math.sign(u) * angular - u);
}

export function deriveBodySurface(mask: ImageData) {
  const { width, height, data } = mask;
  const rows: { y: number; left: number; right: number; count: number }[] = [];
  let widest = 0, widestRow = 0;
  for (let y = 0; y < height; y++) {
    let left = width, right = -1, count = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = x; count++;
    }
    if (!count) continue;
    rows.push({ y, left: left - 0.5, right: right + 0.5, count });
    if (count / (right - left + 1) >= 0.95 && right - left + 1 > widest) { widest = right - left + 1; widestRow = y; }
  }
  // Fit a stable tapered silhouette, excluding spout-narrowed rows, holes and the bottom cap.
  // The original mask still clips those physical exclusions; it is never changed here.
  const bodyRows = rows.filter((row) => row.y <= widestRow && row.right - row.left >= widest * 0.85 && row.count / (row.right - row.left) >= 0.95);
  if (bodyRows.length < 2) throw new Error("Insufficient body silhouette rows");
  const fit = (side: "left" | "right") => {
    const meanY = bodyRows.reduce((sum, row) => sum + row.y, 0) / bodyRows.length;
    const meanX = bodyRows.reduce((sum, row) => sum + row[side], 0) / bodyRows.length;
    const variance = bodyRows.reduce((sum, row) => sum + (row.y - meanY) ** 2, 0);
    const slope = bodyRows.reduce((sum, row) => sum + (row.y - meanY) * (row[side] - meanX), 0) / variance;
    return (y: number) => meanX + slope * (y - meanY);
  };
  const leftAt = fit("left"), rightAt = fit("right");
  const centers = new Float32Array(height), radii = new Float32Array(height);
  const activePixels: number[] = [], offsets: number[] = [];
  for (let y = 0; y < height; y++) {
    const left = leftAt(y), right = rightAt(y);
    centers[y] = (left + right) / 2;
    radii[y] = (right - left) / 2;
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      if (!data[pixel * 4 + 3]) continue;
      if (radii[y] <= 0) throw new Error("Invalid body silhouette");
      const u = (x - centers[y]) / radii[y];
      activePixels.push(pixel);
      offsets.push(radii[y] * (cylindricalCoordinate(u, 1) - u));
    }
  }
  return { width, height, centers, radii, activePixels: Uint32Array.from(activePixels), offsets: Float32Array.from(offsets), fittedRows: bodyRows.length };
}

export function warpPattern(pattern: ImageData, surface: ReturnType<typeof deriveBodySurface>, strength: number) {
  if (!Number.isFinite(strength) || strength < 0 || strength > 1) throw new Error("Invalid curvature strength");
  if (pattern.width !== surface.width || pattern.height !== surface.height) throw new Error("Unaligned warp buffer");
  if (strength === 0) return; // Exact Step 4 path, with no resampling or rounding.
  const source = pattern.data.slice();
  for (let index = 0; index < surface.activePixels.length; index++) {
    const pixel = surface.activePixels[index], x = pixel % pattern.width;
    const sourceX = x + strength * surface.offsets[index];
    const left = Math.floor(sourceX), fraction = sourceX - left;
    const row = pixel - x, output = pixel * 4;
    const a = (row + left) * 4, b = a + 4;
    const alphaA = left >= 0 && left < pattern.width ? source[a + 3] / 255 : 0;
    const alphaB = left + 1 >= 0 && left + 1 < pattern.width ? source[b + 3] / 255 : 0;
    const weightA = (1 - fraction) * alphaA, weightB = fraction * alphaB;
    const alpha = weightA + weightB;
    for (let channel = 0; channel < 3; channel++) {
      pattern.data[output + channel] = alpha > 0 ? ((weightA ? source[a + channel] * weightA : 0) + (weightB ? source[b + channel] * weightB : 0)) / alpha : 0;
    }
    pattern.data[output + 3] = alpha * 255;
  }
}
