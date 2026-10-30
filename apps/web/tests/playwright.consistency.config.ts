import {defineConfig} from '@playwright/test';
import os from 'node:os';
import path from 'node:path';
export default defineConfig({
 testDir:'./e2e',testMatch:['web-consistency.spec.ts','design-configuration.spec.ts','critical-interactions.spec.ts','navigation.spec.ts','ux-phases.spec.ts','home-touch-targets.spec.ts','web02-detail.spec.ts','accessibility.spec.ts','web07-accessibility.spec.ts'],
 globalTimeout:600000,workers:1,reporter:'line',outputDir:process.env.WEB_CONSISTENCY_OUTPUT||path.join(os.tmpdir(),'xinobi-web-consistency'),
 use:{baseURL:process.env.WEB_CONSISTENCY_BASE_URL||'http://127.0.0.1:3000',viewport:{width:390,height:900},trace:'retain-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}},
});
