import path from 'node:path';
import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',testMatch:'single-source-web.spec.ts',workers:1,fullyParallel:false,timeout:60000,reporter:'line',
 use:{baseURL:'http://127.0.0.1:3017',viewport:{width:390,height:900},launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},trace:'retain-on-failure'},
 webServer:{cwd:path.resolve(__dirname,'..'),command:'node tests/serve-export.mjs',url:'http://127.0.0.1:3017',env:{PRODUCT_SURFACES_TEST_WEB_PORT:'3017'},reuseExistingServer:false},
});
