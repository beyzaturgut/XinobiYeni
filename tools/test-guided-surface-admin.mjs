// Isolated browser contract check. Every API and product image is mocked; no provider or catalogue writes.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const require = createRequire(path.resolve('apps/web/package.json'));
const adminRequire = createRequire(path.resolve('apps/admin/package.json'));
const { createServer } = await import(pathToFileURL(adminRequire.resolve('vite')).href);
const { chromium } = require('@playwright/test');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
const server = await createServer({ root: path.resolve('apps/admin'), configFile: path.resolve('apps/admin/vite.config.ts'), server: { host: '127.0.0.1', port: 5188, strictPort: true } });
await server.listen();
let browser;
try {
 browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 const photo = await sharp({ create: { width: 200, height: 300, channels: 4, background: '#cccccc' } }).png().toBuffer();
 const alpha = Buffer.alloc(200 * 300 * 4);
 for (let y = 80; y < 260; y++) for (let x = 40; x < 160; x++) alpha.set([255, 255, 255, 255], (y * 200 + x) * 4);
 const mask = await sharp(alpha, { raw: { width: 200, height: 300, channels: 4 } }).png().toBuffer();
 const colors = [{ variantId: 'blue', color: 'Mavi', image: '/test-blue.png', width: 200, height: 300 }, { variantId: 'red', color: 'Kırmızı', image: '/test-red.png', width: 200, height: 300 }, { variantId: 'small', color: 'Küçük', image: '/test-small.png', width: 100, height: 150 }];
 const failFirst = process.argv.includes('--provider-failure');
 let draft = null, approved = false, segmentCalls = 0, approvals = 0, saves = 0;
 const detail = () => ({ productId: 'test', productName: 'Test ürün', variantId: 'blue', color: 'Mavi', image: colors[0].image, width: 200, height: 300, status: approved ? 'approved' : draft ? 'draft' : 'none', approvedMask: approved ? '/test-mask.png' : null, draft, provider: { configured: true, usedToday: segmentCalls, dailyLimit: 50 }, colors });
 await page.route('**/*', async route => {
  const req = route.request(), u = new URL(req.url());
  if (!['127.0.0.1', 'localhost'].includes(u.hostname)) return route.abort();
  if (/^\/test-.*\.png$/.test(u.pathname)) return route.fulfill({ body: u.pathname.includes('mask') ? mask : photo, contentType: 'image/png' });
  if (u.pathname === '/api/v1/admin/session') return route.fulfill({ json: { account: { name: 'Test Admin' }, permissions: ['catalog.read', 'catalog.write', 'reports.read'] } });
  const root = '/api/v1/local-commerce/surfaces';
  if (u.pathname === root) return route.fulfill({ json: colors.map(c => ({ ...c, productId: 'test', productName: 'Test ürün', status: approved ? 'approved' : 'none' })) });
  if (u.pathname === root + '/test/blue/draft.png') return route.fulfill({ body: mask, contentType: 'image/png' });
  if (u.pathname.startsWith(root + '/test/blue')) {
   assert.equal(req.headers()['x-xinobi-csrf'], '1');
   if (u.pathname.endsWith('/strokes')) {
    saves++; assert.ok(req.postDataJSON().strokes.length > 0); assert.equal(segmentCalls, 0);
    draft = { method: 'brush', prompt: null, score: null, updatedAt: '2026-10-16T10:00:00Z' };
   }
   if (u.pathname.endsWith('/segment')) {
    assert.equal(req.postDataJSON().useDraftGuide, true); assert.equal(req.postDataJSON().expectedDraftUpdatedAt, draft.updatedAt);
    segmentCalls++;
    if (failFirst && segmentCalls === 1) return route.fulfill({ status: 503, json: { message: 'Test sağlayıcı hatası' } });
    draft = { ...draft, method: 'roboflow-guide', updatedAt: '2026-10-16T10:00:01Z' };
   }
   if (u.pathname.endsWith('/approval/colors')) {
    const input = req.postDataJSON(); assert.equal(input.samePlacementConfirmed, true);
    assert.deepEqual(input.colors.map(c => c.variantId), ['blue', 'red']); assert.equal(input.expectedDraftUpdatedAt, draft.updatedAt);
    approvals++; approved = true; draft = null;
   }
   return route.fulfill({ json: detail() });
  }
  if (u.pathname.endsWith('/review')) return route.fulfill({ status: 503, json: { message: 'Legacy review disabled in this fixture' } });
  if (u.pathname.startsWith('/api/')) return route.fulfill({ json: u.pathname.endsWith('/state') ? { products: [], categories: [], prices: {}, content: {}, announcements: [] } : {} });
  return route.continue();
 });
 await page.goto('http://127.0.0.1:5188/');
 await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)', exact: true }).click();
 await page.getByRole('button', { name: 'Elle gösterilen ortak ürün maskesini dene' }).click();
 await page.locator('.surface-row').first().click();
 await page.getByRole('heading', { name: 'Test ürün', exact: true }).waitFor();
 const stage = page.locator('.surface-stage'); const box = await stage.boundingBox();
 await page.mouse.move(box.x + box.width * .45, box.y + box.height * .5);
 await page.mouse.down(); await page.mouse.move(box.x + box.width * .55, box.y + box.height * .6, { steps: 6 }); await page.mouse.up();
 const generate = page.getByRole('button', { name: 'Boyadığım bölgeyi Roboflow ile bul' }); await generate.waitFor();
 page.on('dialog', dialog => dialog.accept());
 assert.equal(await generate.isEnabled(), true); // Unsaved brush strokes must be accepted directly.
 await generate.click();
 if (failFirst) {
  await page.getByText('Test sağlayıcı hatası', { exact: true }).waitFor();
  assert.equal(await generate.isEnabled(), true);
  await generate.click();
 }
 await page.getByText('Roboflow taslağı hazır.', { exact: false }).waitFor();
 await page.getByLabel('Maske içinde örnek desen göster').check();
 await page.getByLabel('Önizleme rengi').selectOption('red');
 await page.getByText('Ortak maskeyi seçilen renkte inceliyorsun.', { exact: false }).waitFor();
 await page.getByLabel('Kırmızı', { exact: true }).check();
 assert.equal(await page.getByLabel('Küçük', { exact: false }).isDisabled(), true);
 const approve = page.getByRole('button', { name: 'Seçilen renklerde onayla' });
 assert.equal(await approve.isDisabled(), true);
 await page.getByLabel('Seçtiğim fotoğrafların aynı konumda olduğunu', { exact: false }).check();
 await page.screenshot({ path: '/tmp/xinobi-guided-surface-admin.png', fullPage: true });
 await page.setViewportSize({ width: 390, height: 844 });
 await page.evaluate(() => window.scrollTo(0,0));
 await page.waitForTimeout(150);
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await approve.click(); await page.getByText('Ortak maske seçilen renklerde onaylandı.', { exact: false }).waitFor();
 assert.equal(segmentCalls, failFirst ? 2 : 1); assert.equal(saves, 1); assert.equal(approvals, 1); assert.deepEqual(errors, []);
 console.log('PASS: brush guide, explicit inference, pattern/color preview, incompatible colour blocked, one approval for two colours, no browser errors');
} finally { await browser?.close(); await server.close(); }
