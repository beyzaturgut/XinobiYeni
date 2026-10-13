import { defineConfig } from '@playwright/test';

// Read-only artwork checks against the already running QA web server.
// No webServer entry: this configuration never starts/stops QA services.
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  reporter: 'line',
  outputDir: '../../artifacts/t12-playwright',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://127.0.0.1:3032',
    launchOptions: { executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
    viewport: { width: 500, height: 900 },
  },
});
