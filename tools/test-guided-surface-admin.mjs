// Isolated browser contract check of the WebP-only admin masking screen. Every API and product image is mocked; no catalogue writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const require = createRequire(path.resolve('apps/web/package.json'));
const adminRequire = createRequire(path.resolve('apps/admin/package.json'));
const { createServer, preview } = await import(pathToFileURL(adminRequire.resolve('vite')).href);
const { chromium } = require('@playwright/test');
const sharp = createRequire(require.resolve('next/package.json'))('sharp');
async function run() {
const production = process.argv.includes('--production');
const server = production ? await preview({ root: path.resolve('apps/admin'), configFile: path.resolve('apps/admin/vite.config.ts'), preview: { host: '127.0.0.1', port: 5188, strictPort: true } }) : await createServer({ root: path.resolve('apps/admin'), configFile: path.resolve('apps/admin/vite.config.ts'), server: { host: '127.0.0.1', port: 5188, strictPort: true } });
if (!production) await server.listen();
let browser;
try {
 browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 if (process.argv.includes('--without-web-crypto')) await page.addInitScript(() => { Object.defineProperty(window.crypto, 'subtle', { configurable: true, value: undefined }); });
 const photo = await sharp({ create: { width: 200, height: 300, channels: 4, background: '#cccccc' } }).png().toBuffer();
 const sourceSha = createHash('sha256').update(photo).digest('hex');
 const alpha = Buffer.alloc(200 * 300 * 4);
 for (let y = 80; y < 260; y++) for (let x = 40; x < 160; x++) alpha.set([255, 255, 255, 255], (y * 200 + x) * 4);
 const mask = await sharp(alpha, { raw: { width: 200, height: 300, channels: 4 } }).webp({ lossless: true }).toBuffer();
 const colors = [{ variantId: 'blue', color: 'Mavi', image: '/test-blue.png', width: 200, height: 300 }, { variantId: 'red', color: 'Kırmızı', image: '/test-red.png', width: 200, height: 300 }, { variantId: 'small', color: 'Küçük', image: '/test-small.png', width: 100, height: 150 }];
 const maskPromptTest = process.argv.includes('--mask-prompt');
 if (maskPromptTest) await page.addInitScript(() => {
  window.__copiedPrompts = []; window.__clipboardDenied = false; window.__execCopy = true;
  // The legacy copy used on plain-HTTP sites copies the selected textarea text.
  document.execCommand = command => { if (command !== 'copy' || !window.__execCopy) return false; const el = document.activeElement; window.__copiedPrompts.push(el.value.slice(el.selectionStart, el.selectionEnd)); return true; };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { if (window.__clipboardDenied) throw Error('denied'); window.__copiedPrompts.push(value); } } });
 });
 const expiredSession = process.argv.includes('--expired-session');
 const failedRefresh = process.argv.includes('--failed-refresh');
 let refreshes = 0;
 let draft = null, approved = false, approvals = 0, webpSaves = 0;
 const detail = () => ({ productId: 'test', productName: 'Test ürün', variantId: 'blue', color: 'Mavi', image: colors[0].image, width: 200, height: 300, status: approved ? 'approved' : draft ? 'draft' : 'none', approvedMask: approved ? '/test-mask.png' : null, draft, sourceSha256: sourceSha, colors });
 await page.route('**/*', async route => {
  const req = route.request(), u = new URL(req.url());
  if (!['127.0.0.1', 'localhost'].includes(u.hostname)) return route.abort();
  if (/^\/test-.*\.png$/.test(u.pathname)) return route.fulfill({ body: u.pathname.includes('mask') ? mask : photo, contentType: u.pathname.includes('mask') ? 'image/webp' : 'image/png' });
  if (u.pathname === '/api/v1/admin/session') return route.fulfill({ json: { account: { name: 'Test Admin' }, permissions: ['catalog.read', 'catalog.write', 'reports.read'] } });
  if (u.pathname === '/api/v1/auth/admin/refresh') {
   refreshes++; assert.equal(req.headers()['x-xinobi-csrf'], '1');
   return route.fulfill({ status: failedRefresh ? 401 : 200, json: {} });
  }
  if (u.pathname === '/api/v1/auth/web/refresh') throw Error('Customer refresh must never be used for surface masking');
  const root = '/api/v1/local-commerce/surfaces';
  if (u.pathname === root) return route.fulfill({ json: colors.map(c => ({ ...c, productId: 'test', productName: 'Test ürün', status: approved ? 'approved' : 'none' })) });
  if (u.pathname === root + '/test/blue/draft.webp') return route.fulfill({ body: mask, contentType: 'image/webp' });
  if (req.method() === 'GET' && u.pathname.startsWith(root + '/test/') && !u.pathname.endsWith('.png') && !u.pathname.endsWith('.webp')) {
   const selected = colors.find(c => c.variantId === u.pathname.split('/').at(-1));
   if (selected) return route.fulfill({ json: { ...detail(), ...selected } });
  }
  if (u.pathname.startsWith(root + '/test/blue')) {
   assert.equal(req.headers()['x-xinobi-csrf'], '1');
   if (u.pathname.endsWith('/mask')) {
    if (expiredSession && (refreshes === 0 || failedRefresh)) return route.fulfill({ status: 401, json: {} });
    const input = req.postDataJSON(); assert.equal(input.sourceSha256, sourceSha); assert.equal(input.mode, 'alpha'); assert.ok(input.webpBase64); webpSaves++;
    draft = { method: 'webp-alpha', updatedAt: '2026-10-16T10:00:02Z' };
   }
   if (u.pathname.endsWith('/approval/colors')) {
    const input = req.postDataJSON(); assert.equal(input.samePlacementConfirmed, true);
    assert.deepEqual(input.colors.map(c => c.variantId), ['blue', 'red']); assert.equal(input.expectedDraftUpdatedAt, draft.updatedAt);
    assert.equal(input.alignments, undefined); // One shared mask, unchanged coordinates.
    approvals++; approved = true; draft = null;
   }
   return route.fulfill({ json: detail() });
  }
  if (u.pathname.startsWith('/api/')) return route.fulfill({ json: u.pathname.endsWith('/state') ? { products: [], categories: [], prices: {}, content: {}, announcements: [] } : {} });
  return route.continue();
 });
 await page.goto('http://127.0.0.1:5188/?view=surfaces');
 await page.locator('.surface-row').first().click();
 await page.getByRole('heading', { name: 'Test ürün', exact: true }).waitFor();
 if (maskPromptTest) {
  await page.getByRole('button', { name: 'Promptu kopyala', exact: true }).click();
  const initial = await page.evaluate(() => window.__copiedPrompts.at(-1));
  assert.ok(initial.includes('200 × 300')); assert.ok(initial.includes('x = 0…199; y = 0…299'));
  assert.ok(initial.includes('"Mavi"')); assert.ok(initial.includes(sourceSha)); assert.ok(initial.includes('alfa 0'));
  assert.ok(initial.includes('Siyah fakat opak')); assert.ok(initial.includes('ölçek=1; dönüş=0'));
  assert.ok(initial.includes('Bu WebP akışında ayrı bir logo katmanı yoktur'));
  assert.ok(initial.includes('yalnız harflerin, amblemin ve simgelerin gerçek çizgilerini alfa 0'));
  assert.ok(initial.includes('harflerin iç boşlukları'));
  assert.ok(initial.includes('sınır kutusunu (bounding box) delik olarak KULLANMA'));
  assert.ok(initial.includes('gerçekten ayrı bir etiket, plaka veya rozet'));
  assert.ok(initial.includes('yalnız ekli kaynak fotoğrafı inceleyerek belirle'));
  assert.ok(!initial.includes('XINOBI')); assert.ok(!initial.includes('lacivert'));
  await page.getByLabel('Maskelenecek yüzey açıklaması').fill('Yalnız üst gövdeyi seç.');
  await page.getByRole('button', { name: 'Promptu kopyala', exact: true }).click();
  assert.ok((await page.evaluate(() => window.__copiedPrompts.at(-1))).includes('Yalnız üst gövdeyi seç.'));
  await page.locator('.surface-row').nth(1).click();
  await page.getByRole('button', { name: 'Promptu kopyala', exact: true }).click();
  assert.ok((await page.evaluate(() => window.__copiedPrompts.at(-1))).includes('"Kırmızı"'));
  await page.locator('.surface-row').nth(2).click();
  await page.getByRole('button', { name: 'Promptu kopyala', exact: true }).click();
  const smaller = await page.evaluate(() => window.__copiedPrompts.at(-1));
  assert.ok(smaller.includes('100 × 150')); assert.ok(smaller.includes('x = 0…99; y = 0…149')); assert.ok(!smaller.includes('200 × 300'));
  // Clipboard API refused (as on the plain-HTTP live site): the selected-text copy still copies the whole prompt.
  await page.evaluate(() => { window.__clipboardDenied = true; });
  const before = await page.evaluate(() => window.__copiedPrompts.length);
  await page.getByRole('button', { name: 'Prompt kopyalandı', exact: true }).click();
  await page.waitForFunction(count => window.__copiedPrompts.length > count, before);
  assert.equal(await page.evaluate(() => window.__copiedPrompts.at(-1)), smaller);
  assert.equal(await page.getByText('Tarayıcı panoya yazmaya izin vermedi.', { exact: false }).count(), 0);
  // Both refused: the text stays selected with the ⌘C hint.
  await page.evaluate(() => { window.__execCopy = false; });
  await page.getByRole('button', { name: 'Prompt kopyalandı', exact: true }).click();
  await page.getByText('Tarayıcı panoya yazmaya izin vermedi.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Prompt kopyalandı', exact: true }).count(), 0);
  const generated = page.getByLabel('Hazır maskeleme promptu'); await generated.waitFor();
  assert.equal(await generated.evaluate(el => el.selectionEnd - el.selectionStart === el.value.length), true);
  assert.equal(webpSaves, 0); assert.equal(approvals, 0); assert.deepEqual(errors, []);
  await page.screenshot({ path:'/tmp/xinobi-mask-prompt.png',fullPage:true });
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  console.log('PASS: source-bound prompt dimensions/color/hash, editable target, clipboard content, variant changes, clipboard denial falls back to selected-text copy, then selection hint, responsive, zero write calls');
  return;
 }
 // Only the WebP flow remains: no drawing tabs, brush, points or Roboflow controls.
 assert.equal(await page.getByRole('tab').count(), 0);
 for (const retired of ['Eğrili çizim', 'Fırça', 'Roboflow', 'Noktalar', 'Bu renkte maskeyi hizala']) assert.equal(await page.getByText(retired, { exact: false }).count(), 0, retired);
 const downloading = page.waitForEvent('download');
 await page.getByRole('button', { name: 'Maskeleme için kaynak fotoğrafı indir' }).click();
 const download = await downloading;
 assert.equal(download.suggestedFilename(), 'maske-kaynagi-200x300.png');
 assert.deepEqual(await readFile(await download.path()), photo); // Exact bytes, no resizing/crop/re-encoding.
 await page.getByLabel('Maske WebP dosyası').setInputFiles({ name: 'test-mask.webp', mimeType: 'image/webp', buffer: mask });
 const upload = page.getByRole('button', { name: 'WebP maskeyi taslağa yükle' });
 await upload.click();
 if (failedRefresh) {
  await page.getByText('Yönetici oturumun sona erdi.', { exact: false }).waitFor();
  assert.equal(refreshes, 1); assert.equal(webpSaves, 0); assert.equal(await upload.isEnabled(), true);
  console.log('PASS: expired staff refresh gives recovery instructions, upload can be retried, no customer refresh');
  return;
 }
 await page.getByText('WebP taslağı hazır.', { exact: false }).waitFor();
 await page.getByLabel('Maske içinde örnek desen göster').check();
 await page.getByLabel('Önizleme rengi').selectOption('red');
 await page.getByText('fotoğrafında inceliyorsun', { exact: false }).waitFor();
 // The red photo shows the reference mask at the same coordinates: inside x 40–159, y 80–259.
 const alphaAt = (x, y) => page.locator('.surface-stage canvas').evaluate((canvas, [x, y]) => canvas.getContext('2d').getImageData(x, y, 1, 1).data[3], [x, y]);
 assert.ok(await alphaAt(41, 81) > 0); assert.equal(await alphaAt(38, 150), 0); assert.equal(await alphaAt(100, 78), 0);
 await page.getByRole('checkbox', { name: /^Kırmızı/ }).check();
 assert.equal(await page.getByRole('checkbox', { name: /^Küçük/ }).isDisabled(), true);
 const approve = page.getByRole('button', { name: 'Seçilen renklerde onayla' });
 assert.equal(await approve.isDisabled(), true);
 await page.getByLabel('Seçtiğim her rengi kontrol ettim', { exact: false }).check();
 await page.screenshot({ path: '/tmp/xinobi-guided-surface-admin.png', fullPage: true });
 await page.setViewportSize({ width: 390, height: 844 });
 await page.evaluate(() => window.scrollTo(0,0));
 await page.waitForTimeout(150);
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
 await approve.click(); await page.getByText('Ortak maske seçilen renklerde onaylandı.', { exact: false }).waitFor();
 assert.equal(webpSaves, 1); assert.equal(approvals, 1); assert.deepEqual(errors, []); assert.equal(refreshes, expiredSession ? 1 : 0);
 console.log('PASS: exact source download, WebP draft upload, pattern/colour preview at shared coordinates, incompatible colour blocked, one approval for two colours, retired tools absent, no browser errors');
} finally { await browser?.close(); if (production) await new Promise(resolve => server.httpServer.close(resolve)); else await server.close(); }

}
await run();
