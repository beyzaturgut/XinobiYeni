import { expect, test } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { catalogPreviewDimensions } from "../../src/features/product-personalization/rendering/accepted-surface-api";

const product = "DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6";
const version = "00000000-0000-4000-8000-000000000105";
type AcceptanceRecord={productId:string;variantId:string;version:string;sourceImage:string;width:number;height:number;sourceVersion:string;acceptedAt?:string};
const cases = [
  { name: "CM101 Metallic Navy", variant: "DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1", width: 3543, height: 5315 },
  { name: "CM104 Metallic Red", variant: "DEMO-V-3715b0ef-2087-4392-8e9f-f62da0acc001", width: 3543, height: 5315 },
  { name: "CM105 Antrasit", variant: "DEMO-V-cd1525d4-f909-4c7c-b2a2-6d4df9f53458", width: 4178, height: 6123 },
] as const;

function svg(width: number, height: number, role: "source" | "mask" | "branding") {
  const upper = `<path d="M1450 1100h1250v1250H1450z"/>`;
  const lower = `<path d="M1350 2750h1450v2300H1350z"/>`;
  const body = role === "mask"
    ? `<g fill="#fff">${upper}${lower}</g>`
    : role === "source"
      ? `<rect width="${width}" height="${height}" fill="#fff"/><g fill="#343434">${upper}${lower}</g>`
      : `<text x="1720" y="4720" fill="#fff" font-family="Arial" font-size="180" font-weight="bold">XINOBI</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

test("CM101, CM104 and CM105 catalog previews keep aligned assets under the browser canvas limit", async ({ page }) => {
  test.setTimeout(240_000);
  const bundles = new Map(cases.map(item => {
    const hashes = { source: "a".repeat(64), mask: "b".repeat(64), branding: "c".repeat(64) };
    const media = (role: keyof typeof hashes) => ({
      url: `/api/v1/dev/catalog-surfaces/media/${product}/${item.variant}/${version}/${role}?v=${hashes[role]}`,
      sha256: hashes[role],
    });
    return [item.variant, {
      scope: "development-preview", productReference: product, variantReference: item.variant, previewAvailable: true,
      inputs: {
        width: item.width, height: item.height, surfaceVersion: hashes.mask, sourceMediaVersion: "d".repeat(64),
        source: media("source"), mask: media("mask"), brandingRequired: true, branding: media("branding"),
      },
    }];
  }));
  await page.route("**/api/v1/dev/catalog-surfaces/**", async route => {
    const url = new URL(route.request().url());
    const item = cases.find(candidate => url.pathname.includes(candidate.variant));
    if (!item) return route.fulfill({ status: 404 });
    if (url.pathname.includes("/rendering-inputs")) {
      return route.fulfill({ json: bundles.get(item.variant) });
    }
    const role = url.pathname.split("/").filter(Boolean).pop()?.replace(/\/$/, "");
    if (!["source", "mask", "branding"].includes(role ?? "")) return route.fulfill({ status: 404 });
    const imageRole = role as "source" | "mask" | "branding";
    return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svg(item.width, item.height, imageRole) });
  });

  for (const item of cases) {
    await page.goto(`/urunler/cay-makinesi-101/editor/?product=${product}&variant=${item.variant}`);
    const canvas = page.locator("canvas[role='img']");
    await expect(canvas).toBeVisible({ timeout: 90_000 });
    const expected = catalogPreviewDimensions(item.width, item.height);
    const rendered = await canvas.evaluate((element: HTMLCanvasElement) => [element.width, element.height]);
    expect(rendered).toEqual([expected.width, expected.height]);
    expect(expected.width * expected.height).toBeLessThanOrEqual(20_000_000);
    expect(Math.abs(expected.width / expected.height - item.width / item.height)).toBeLessThan(0.0002);
    if (item.width * item.height > 20_000_000) expect(expected.width * expected.height).toBeLessThanOrEqual(16_000_000);
    await expect(page.getByText("Ürün görselleri doğrulanamadı veya tarayıcıda işlenemedi.")).toHaveCount(0);
  }
});

test("active CM105 approval renders from its real source, mask and branding at preview resolution", async ({ page }) => {
  test.setTimeout(180_000);
  const repo = path.resolve(__dirname, "../../../..");
  const acceptedRoot = path.join(repo, "services/api/App_Data/catalog-surface-review/accepted");
  let acceptedDir: string | undefined, acceptance: AcceptanceRecord | undefined;
  for (const directory of fs.readdirSync(acceptedRoot, { withFileTypes: true }).filter(item => item.isDirectory())) {
    const currentPath = path.join(acceptedRoot, directory.name, "current.json");
    if (!fs.existsSync(currentPath)) continue;
    const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));
    const candidateDir = path.join(acceptedRoot, directory.name, current.version);
    const record = JSON.parse(fs.readFileSync(path.join(candidateDir, "acceptance.json"), "utf8"));
    if (record.productId === product && record.variantId === cases[2].variant) { acceptedDir = candidateDir; acceptance = record; break; }
  }
  test.skip(!acceptedDir || !acceptance, "CM105 active approval fixture is not present in this checkout");
  const record = acceptance!;
  const sourcePath = path.join(repo, "services/api/App_Data/real-catalog-qa/media", path.basename(record.sourceImage));
  const bytes = {
    source: fs.readFileSync(sourcePath),
    mask: fs.readFileSync(path.join(acceptedDir!, "mask.png")),
    branding: fs.readFileSync(path.join(acceptedDir!, "branding.png")),
  };
  const hashes = Object.fromEntries(Object.entries(bytes).map(([role, data]) => [role, crypto.createHash("sha256").update(data).digest("hex")])) as Record<"source" | "mask" | "branding", string>;
  const media = (role: keyof typeof hashes) => ({
    url: `/api/v1/dev/catalog-surfaces/media/${product}/${cases[2].variant}/${record.version}/${role}?v=${hashes[role]}`,
    sha256: hashes[role],
  });
  const bundle = {
    scope: "development-preview", productReference: product, variantReference: cases[2].variant, previewAvailable: true,
    inputs: {
      width: record.width, height: record.height, surfaceVersion: hashes.mask, sourceMediaVersion: record.sourceVersion,
      source: media("source"), mask: media("mask"), brandingRequired: true, branding: media("branding"),
      displayName: "CM105 Metallic Antrasit",
    },
  };
  await page.route("**/api/v1/dev/catalog-surfaces/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/rendering-inputs")) return route.fulfill({ json: bundle });
    const role = url.pathname.split("/").filter(Boolean).pop() as keyof typeof bytes;
    if (!bytes[role]) return route.fulfill({ status: 404 });
    return route.fulfill({ contentType: role === "source" ? "image/webp" : "image/png", body: bytes[role] });
  });
  await page.goto(`/urunler/cay-makinesi-101/editor/?product=${product}&variant=${cases[2].variant}`);
  const canvas = page.locator("canvas[role='img']");
  await expect(canvas).toBeVisible({ timeout: 120_000 });
  const expected = catalogPreviewDimensions(record.width, record.height);
  expect(await canvas.evaluate((element: HTMLCanvasElement) => [element.width, element.height])).toEqual([expected.width, expected.height]);
  expect(expected.width * expected.height).toBeLessThanOrEqual(20_000_000);
  expect(expected.width * expected.height).toBeLessThanOrEqual(16_000_000);
  expect(record.acceptedAt).toBeTruthy();
});

test("active CM104 approval still renders from its real source, mask and branding", async ({ page }) => {
  test.setTimeout(180_000);
  const repo = path.resolve(__dirname, "../../../..");
  const acceptedRoot = path.join(repo, "services/api/App_Data/catalog-surface-review/accepted");
  let acceptedDir: string | undefined, acceptance: AcceptanceRecord | undefined;
  for (const directory of fs.readdirSync(acceptedRoot, { withFileTypes: true }).filter(item => item.isDirectory())) {
    const currentPath = path.join(acceptedRoot, directory.name, "current.json");
    if (!fs.existsSync(currentPath)) continue;
    const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));
    const candidateDir = path.join(acceptedRoot, directory.name, current.version);
    const record = JSON.parse(fs.readFileSync(path.join(candidateDir, "acceptance.json"), "utf8"));
    if (record.productId === product && record.variantId === cases[1].variant) { acceptedDir = candidateDir; acceptance = record; break; }
  }
  test.skip(!acceptedDir || !acceptance, "CM104 active approval fixture is not present in this checkout");
  const record = acceptance!;
  const sourcePath = path.join(repo, "services/api/App_Data/real-catalog-qa/media", path.basename(record.sourceImage));
  const bytes = {
    source: fs.readFileSync(sourcePath),
    mask: fs.readFileSync(path.join(acceptedDir!, "mask.png")),
    branding: fs.readFileSync(path.join(acceptedDir!, "branding.png")),
  };
  const hashes = Object.fromEntries(Object.entries(bytes).map(([role, data]) => [role, crypto.createHash("sha256").update(data).digest("hex")])) as Record<"source" | "mask" | "branding", string>;
  const media = (role: keyof typeof hashes) => ({
    url: `/api/v1/dev/catalog-surfaces/media/${product}/${cases[1].variant}/${record.version}/${role}?v=${hashes[role]}`,
    sha256: hashes[role],
  });
  const bundle = {
    scope: "development-preview", productReference: product, variantReference: cases[1].variant, previewAvailable: true,
    inputs: {
      width: record.width, height: record.height, surfaceVersion: hashes.mask, sourceMediaVersion: record.sourceVersion,
      source: media("source"), mask: media("mask"), brandingRequired: true, branding: media("branding"),
      displayName: "CM104 Metallic Red",
    },
  };
  await page.route("**/api/v1/dev/catalog-surfaces/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/rendering-inputs")) return route.fulfill({ json: bundle });
    const role = url.pathname.split("/").filter(Boolean).pop() as keyof typeof bytes;
    if (!bytes[role]) return route.fulfill({ status: 404 });
    return route.fulfill({ contentType: role === "source" ? "image/webp" : "image/png", body: bytes[role] });
  });
  await page.goto(`/urunler/cay-makinesi-101/editor/?product=${product}&variant=${cases[1].variant}`);
  const canvas = page.locator("canvas[role='img']");
  await expect(canvas).toBeVisible({ timeout: 120_000 });
  const expected = catalogPreviewDimensions(record.width, record.height);
  expect(await canvas.evaluate((element: HTMLCanvasElement) => [element.width, element.height])).toEqual([expected.width, expected.height]);
  expect(record.acceptedAt).toBeTruthy();
});
