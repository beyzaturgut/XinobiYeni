import { expect, test } from "@playwright/test";
const endpoint = "/api/v1/dev/product-surfaces/cay-makinesi-101/blue/rendering-inputs";
const editor = "/urunler/cay-makinesi-101/editor/";

test("real local bundle renders accepted assets, branding and responsive product", async ({ page, request }, testInfo) => {
  const bundle = await (await request.get(endpoint)).json();
  expect(bundle.previewAvailable).toBe(true);
  expect(bundle.inputs.mask.sha256).toBe("8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06");
  const loaded: string[] = [];
  page.on("request", r => { if (r.url().includes("?v=")) loaded.push(r.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editor + "?variant=blue");
  await expect(page.locator("canvas[role='img']")).toBeVisible();
  for (const media of [bundle.inputs.source, bundle.inputs.mask, bundle.inputs.branding])
    expect(loaded.some(url => url.endsWith(media.url))).toBe(true);
  expect(await page.locator("canvas[role='img']").evaluate((c: HTMLCanvasElement) => [c.width, c.height])).toEqual([1066, 1600]);
  await page.getByRole("button", { name: "Çerez tercih panelini kapat" }).click();
  await page.screenshot({ path: testInfo.outputPath("xinobi-step5b-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("canvas[role='img']")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("xinobi-step5b-mobile.png"), fullPage: true });
});
test("loading stays controlled until bundle arrives", async ({ page, request }) => {
  const bundle = await (await request.get(endpoint)).json();
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/rendering-inputs", async route => { await wait; await route.fulfill({ json: bundle }); });
  await page.goto(editor);
  await expect(page.getByRole("status").filter({ hasText: "Ürün önizlemesi yükleniyor" })).toBeVisible();
  expect(await page.locator("canvas[role='img']").count()).toBe(0);
  release(); await expect(page.locator("canvas[role='img']")).toBeVisible();
});
for (const variant of ["silver", "red", "rose", "unknown"]) {
  test(`${variant} never falls back to blue`, async ({ page }) => {
    await page.goto(editor + `?variant=${variant}`);
    await expect(page.getByRole("status")).toContainText("kullanılamıyor");
    expect(await page.locator("canvas[role='img']").count()).toBe(0);
    await expect(page.getByRole("link", { name: "Basit moda dön" })).toHaveAttribute("href", new RegExp(`variant=${variant}$`));
  });
}
test("API failure and malformed/required-branding bundles never render", async ({ page, request }) => {
  const bundle = await (await request.get(endpoint)).json();
  for (const response of [{ status: 503, json: {} }, { json: { ...bundle, inputs: { ...bundle.inputs, branding: null } } },
    { json: { ...bundle, inputs: { ...bundle.inputs, width: 100 } } }]) {
    await page.route("**/rendering-inputs", route => route.fulfill(response));
    await page.goto(editor);
    await expect(page.locator("section[role='alert']")).toContainText("yüklenemedi");
    expect(await page.locator("canvas[role='img']").count()).toBe(0);
    await page.unroute("**/rendering-inputs");
  }
});
test("disabled endpoint is unavailable, not a static fallback", async ({ page }) => {
  await page.route("**/rendering-inputs", route => route.fulfill({ status: 404 }));
  await page.goto(editor);
  await expect(page.getByRole("status")).toContainText("kullanılamıyor");
  expect(await page.locator("canvas[role='img']").count()).toBe(0);
});
