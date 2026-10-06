import { expect, test, type Page } from "@playwright/test";

async function inspectPixels(page: Page) {
  return page.locator("canvas[role='img']").evaluate(async (canvas: HTMLCanvasElement) => {
    const images = await Promise.all([
      "/assets/products/tea-maker-101-blue.webp",
      "/assets/personalization/tea-maker-101-blue-designable.png",
      "/assets/personalization/tea-maker-101-blue-branding-overlay.png",
      "/assets/personalization/sample-pattern.png",
    ].map(async (src) => { const image = new Image(); image.src = src; await image.decode(); return image; }));
    const buffer = document.createElement("canvas");
    buffer.width = canvas.width; buffer.height = canvas.height;
    const context = buffer.getContext("2d", { willReadFrequently: true })!;
    const pixels = (image: HTMLImageElement) => {
      context.clearRect(0, 0, buffer.width, buffer.height);
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, buffer.width, buffer.height).data;
    };
    const [original, mask, branding] = images.map(pixels);
    context.clearRect(0, 0, buffer.width, buffer.height);
    context.save();
    context.translate(533, 1040);
    context.scale(1.2, 1.2);
    context.drawImage(images[3], -images[3].naturalWidth / 2, -images[3].naturalHeight / 2);
    context.restore();
    const initialPattern = context.getImageData(0, 0, buffer.width, buffer.height).data;
    context.globalCompositeOperation = "destination-in";
    context.drawImage(images[1], 0, 0);
    context.globalCompositeOperation = "destination-over";
    context.drawImage(images[0], 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(images[2], 0, 0);
    const flat = context.getImageData(0, 0, buffer.width, buffer.height).data;
    context.clearRect(0, 0, buffer.width, buffer.height);
    context.drawImage(images[0], 0, 0);
    context.drawImage(images[2], 0, 0);
    const restoredOriginal = context.getImageData(0, 0, buffer.width, buffer.height).data;
    const final = canvas.getContext("2d")!.getImageData(0, 0, buffer.width, buffer.height).data;
    let outsideDifferences = 0, outsideBrandingPixels = 0, changedInside = 0, brandingDifferences = 0, initialCoverageGaps = 0, shadedInside = 0;
    for (let i = 0; i < final.length; i += 4) {
      if (mask[i + 3] > 0 && initialPattern[i + 3] === 0) initialCoverageGaps++;
      if (mask[i + 3] === 255 && branding[i + 3] === 0 && [0, 1, 2].some((channel) => final[i + channel] !== flat[i + channel])) shadedInside++;
      if (mask[i + 3] === 0) {
        if (branding[i + 3] > 0) outsideBrandingPixels++;
        const expected = branding[i + 3] > 0 ? restoredOriginal : original;
        if ([0, 1, 2, 3].some((channel) => final[i + channel] !== expected[i + channel])) outsideDifferences++;
      } else if ([0, 1, 2].some((channel) => final[i + channel] !== original[i + channel])) changedInside++;
      if (branding[i + 3] === 255 && [0, 1, 2].some((channel) => final[i + channel] !== branding[i + channel])) brandingDifferences++;
    }
    return { width: canvas.width, height: canvas.height, dimensions: images.map((image) => [image.naturalWidth, image.naturalHeight]), outsideDifferences, outsideBrandingPixels, changedInside, brandingDifferences, initialCoverageGaps, shadedInside, snapshot: canvas.toDataURL() };
  });
}

test("pattern stays inside the fixed mask and branding remains above each transform", async ({ page }) => {
  await page.goto("/urunler/cay-makinesi-101/editor/");
  await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
  await expect(page.locator("canvas[role='img']")).toBeVisible();
  const initial = await inspectPixels(page);
  expect([initial.width, initial.height]).toEqual([1066, 1600]);
  expect(initial.dimensions.slice(0, 3)).toEqual([[1066, 1600], [1066, 1600], [1066, 1600]]);
  expect(initial.initialCoverageGaps).toBe(0);
  console.log("Initial preview pixel QA", { ...initial, snapshot: undefined });
  expect(initial.outsideDifferences).toBe(0);
  expect(initial.brandingDifferences).toBe(0);
  expect(initial.changedInside).toBeGreaterThan(200000);
  expect(initial.shadedInside).toBeGreaterThan(100000);
  await page.locator("#pattern-curvature").fill("0");
  await expect.poll(async () => (await inspectPixels(page)).snapshot === initial.snapshot).toBe(false);
  const zeroCurvature = await inspectPixels(page);
  expect(zeroCurvature.outsideDifferences).toBe(0);
  expect(zeroCurvature.brandingDifferences).toBe(0);
  expect(zeroCurvature.shadedInside).toBeGreaterThan(100000);
  await page.locator("#pattern-curvature").fill("0.75");
  await expect.poll(async () => (await inspectPixels(page)).snapshot === initial.snapshot).toBe(true);
  for (const [id, value, reset] of [["x", "590", "533"], ["y", "1100", "1040"], ["scale", "1.45", "1.2"], ["rotation", "30", "0"]]) {
    await page.locator(`#pattern-${id}`).fill(value);
    await expect.poll(async () => (await inspectPixels(page)).snapshot === initial.snapshot).toBe(false);
    const transformed = await inspectPixels(page);
    expect(transformed.outsideDifferences).toBe(0);
    expect(transformed.brandingDifferences).toBe(0);
    await page.locator(`#pattern-${id}`).fill(reset);
    await expect.poll(async () => (await inspectPixels(page)).snapshot === initial.snapshot).toBe(true);
  }
});
