import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3010",
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" },
    viewport: { width: 500, height: 900 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 3010 --directory out",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
