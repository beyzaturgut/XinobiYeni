import {defineConfig} from '@playwright/test';
import path from 'node:path';
import os from 'node:os';
// Runs against the owner's already-running local web; account/order requests are browser fixtures.
export default defineConfig({
 testDir:'./e2e',testMatch:['accessibility.spec.ts','web07-accessibility.spec.ts'],workers:1,reporter:'line',
 outputDir:process.env.WEB07_OUTPUT_DIR||path.join(os.tmpdir(),'xinobi-web07-final'),
 use:{baseURL:process.env.WEB07_BASE_URL||'http://127.0.0.1:3000',browserName:'chromium',viewport:{width:390,height:900},trace:'retain-on-failure',
 launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROME_PATH||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')}},
});
