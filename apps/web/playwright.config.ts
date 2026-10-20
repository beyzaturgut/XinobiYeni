import { defineConfig } from "@playwright/test";
import path from "node:path";
import os from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
const root = path.resolve(__dirname, "../..");
const node = process.execPath;
const apiPort = process.env.PRODUCT_SURFACES_TEST_API_PORT || "5023";
const webPort = process.env.PRODUCT_SURFACES_TEST_WEB_PORT || "3010";
// The demo catalogue plus the products whose reviewed XINOBI U previews are packaged under fixtures/product-surfaces,
// so preview specs run against the same identities as the published bundles (tests/run-e2e.mjs publishes them into out/).
const seedFile = path.join(os.tmpdir(), "xinobi-e2e-seed.json");
{
  const demo = JSON.parse(readFileSync(path.join(root, "tests/fixtures/demo-commerce.json"), "utf8"));
  const previews = JSON.parse(readFileSync(path.join(root, "fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json"), "utf8"));
  writeFileSync(seedFile, JSON.stringify({ ...demo, products: [...demo.products, ...previews.products.filter((p: { id: string }) => !demo.products.some((d: { id: string }) => d.id === p.id))] }));
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome") },
    viewport: { width: 500, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: [{
    command: `dotnet "${process.env.PRODUCT_SURFACES_TEST_API_BINARY || 'services/api/bin/Release/net10.0/Xinobi.Api.dll'}"`,
    cwd: root,
    url: `http://127.0.0.1:${apiPort}/api/v1/health/live`,
    env: { ASPNETCORE_CONTENTROOT: path.join(root, "services/api"), DesignStudio__WorkerEnabled: "false", DesignStudio__ExternalInferenceEnabled: "false", LocalCommerce__DataDirectory: path.join(root, "services/api/App_Data/integration-playwright"), LocalCommerce__SeedFile: seedFile, Catalog__AssetBaseUrl: `http://127.0.0.1:${webPort}`, ASPNETCORE_ENVIRONMENT: "Development", ASPNETCORE_URLS: `http://127.0.0.1:${apiPort}`,
      ProductSurfaces__DevelopmentStorefrontPreview__Enabled: "true", ProductSurfaces__DevelopmentStorefrontPreview__RepositoryRoot: root,
      ProductSurfaces__DevelopmentReview__Enabled: "false", ProductSurfaces__Segmentation__ExternalInferenceEnabled: "false",
      ProductSurfaces__Segmentation__SingleAutomaticSmokeEnabled: "false", ProductSurfaces__Segmentation__SingleInteractiveSmokeEnabled: "false",
      Logging__EventLog__LogLevel__Default: "None" },
  }, {
    command: `"${node}" tests/serve-export.mjs`,
    url: `http://127.0.0.1:${webPort}`,
    env: { PRODUCT_SURFACES_TEST_API_PORT: apiPort, PRODUCT_SURFACES_TEST_WEB_PORT: webPort },
    reuseExistingServer: false,
    timeout: 15_000,
  }],
});
