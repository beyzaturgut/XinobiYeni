// Prototype lighting approximation: a scalar field, never the source navy RGB.
const SHADING = { shadowStrength: 0.4, highlightStrength: 0.4, smoothingRadius: 6, brandingMargin: 3 };
const LINEAR = Float32Array.from({ length: 256 }, (_, byte) => {
  const value = byte / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
});

function encodeLinear(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return Math.round(255 * (clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055));
}

export function deriveProductLighting(product: ImageData, mask: ImageData, branding?: ImageData) {
  const { width, height, data } = product;
  if (mask.width !== width || mask.height !== height || (branding && (branding.width !== width || branding.height !== height))) throw new Error("Unaligned lighting assets");
  const size = width * height;
  const excluded = new Uint8Array(size);
  if (branding) {
    for (let pixel = 0; pixel < size; pixel++) {
      if (!branding.data[pixel * 4 + 3]) continue;
      const x = pixel % width, y = Math.floor(pixel / width), margin = SHADING.brandingMargin;
      for (let row = Math.max(0, y - margin); row <= Math.min(height - 1, y + margin); row++) {
        excluded.fill(1, row * width + Math.max(0, x - margin), row * width + Math.min(width, x + margin + 1));
      }
    }
  }
  // Integral sums smooth only trusted body pixels, ignoring protected parts and branding.
  const stride = width + 1;
  const sums = new Float64Array(stride * (height + 1));
  const counts = new Uint32Array(sums.length);
  const histogram = new Uint32Array(4096);
  let samples = 0;
  for (let y = 0; y < height; y++) {
    let rowSum = 0, rowCount = 0;
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x, offset = pixel * 4;
      if (mask.data[offset + 3] === 255 && !excluded[pixel]) {
        const luminance = 0.2126 * LINEAR[data[offset]] + 0.7152 * LINEAR[data[offset + 1]] + 0.0722 * LINEAR[data[offset + 2]];
        rowSum += luminance; rowCount++; samples++;
        histogram[Math.min(4095, Math.floor(luminance * 4095))]++;
      }
      const index = (y + 1) * stride + x + 1;
      sums[index] = sums[index - stride] + rowSum;
      counts[index] = counts[index - stride] + rowCount;
    }
  }
  if (!samples) throw new Error("No trusted body pixels for lighting");
  const percentile = (fraction: number) => {
    let cumulative = 0;
    for (let bin = 0; bin < histogram.length; bin++) {
      cumulative += histogram[bin];
      if (cumulative >= Math.ceil(samples * fraction)) return (bin + 0.5) / 4095;
    }
    return 1;
  };
  const low = percentile(0.1), neutral = percentile(0.5), high = percentile(0.9);
  const multipliers = new Float32Array(size);
  multipliers.fill(1);
  const activePixels: number[] = [];
  for (let pixel = 0; pixel < size; pixel++) {
    if (!mask.data[pixel * 4 + 3]) continue;
    activePixels.push(pixel);
    const x = pixel % width, y = Math.floor(pixel / width), radius = SHADING.smoothingRadius;
    const left = Math.max(0, x - radius), right = Math.min(width, x + radius + 1);
    const top = Math.max(0, y - radius), bottom = Math.min(height, y + radius + 1);
    const a = top * stride + left, b = top * stride + right, c = bottom * stride + left, d = bottom * stride + right;
    const count = counts[d] - counts[b] - counts[c] + counts[a];
    // Extend lighting across branding from nearby body, without creating a mask hole.
    const luminance = count ? (sums[d] - sums[b] - sums[c] + sums[a]) / count : neutral;
    if (luminance < neutral && neutral - low > 1e-6) {
      multipliers[pixel] = 1 - SHADING.shadowStrength * Math.min(1, (neutral - luminance) / (neutral - low));
    } else if (luminance >= neutral && high - neutral > 1e-6) {
      multipliers[pixel] = 1 + SHADING.highlightStrength * Math.min(1, (luminance - neutral) / (high - neutral));
    }
  }
  // Cache byte-to-byte modulation tables; redraws avoid per-channel exponentiation.
  const lookup = new Uint8Array(256 * 256);
  for (let level = 0; level < 256; level++) {
    const multiplier = 1 - SHADING.shadowStrength + level / 255 * (SHADING.shadowStrength + SHADING.highlightStrength);
    for (let byte = 0; byte < 256; byte++) lookup[level * 256 + byte] = encodeLinear(LINEAR[byte] * multiplier);
  }
  return { multipliers, activePixels: Uint32Array.from(activePixels), lookup, low, neutral, high, samples };
}

export function shadePattern(pattern: ImageData, lighting: ReturnType<typeof deriveProductLighting>) {
  for (const pixel of lighting.activePixels) {
    const offset = pixel * 4;
    if (!pattern.data[offset + 3]) continue;
    if (lighting.multipliers[pixel] === 1) continue;
    const level = Math.round((lighting.multipliers[pixel] - (1 - SHADING.shadowStrength)) / (SHADING.shadowStrength + SHADING.highlightStrength) * 255);
    const table = Math.max(0, Math.min(255, level)) * 256;
    for (let channel = 0; channel < 3; channel++) pattern.data[offset + channel] = lighting.lookup[table + pattern.data[offset + channel]];
  }
  // Alpha is untouched. The renderer applies the original mask after modulation.
}
