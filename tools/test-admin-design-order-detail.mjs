// All requests intercepted: no real account/SQL/order writes.
import assert from 'node:assert/strict'
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const origin = process.env.PRINT_UI_ORIGIN || 'http://127.0.0.1:5196'
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/)
const id = '00000000000000000000000000000001', other = '00000000000000000000000000000002'
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=', 'base64')
const design = { id: 'design-a', kind: 'upload', productId: 'p', productName: 'Fixture product', createdAt: '2026-10-20T00:00:00Z', mime: 'image/png' }
const money = { amountMinor: 1000, currency: 'TRY' }
const order = key => ({ order: { id: key, number: key === id ? 'OLD-ORDER' : 'SECOND-ORDER', createdAt: design.createdAt, status: 'received', address: { title: 'Fixture', fullName: 'Synthetic', phone: '5551234567', city: 'Test', district: 'Test', line: 'Fixture address' }, lines: [{ productId: 'p', variantId: 'v', name: 'Fixture product', color: 'Siyah', quantity: 1, unitPrice: money, lineTotal: money }], total: money, history: [], requests: [] }, accountId: 'fixture', customerName: 'Fixture customer', customerEmail: 'fixture@example.invalid' })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve }); return { promise, release } }
let passed = 0
async function fixture({ permissions = ['print.read', 'orders.read'], detail, url = '/?view=print' } = {}) {
 const context = await browser.newContext(), page = await context.newPage(), errors = [], calls = []
 page.on('pageerror', error => errors.push(error.message))
 let reads = 0
 await context.route('**/api/v1/**', async route => {
  const request = route.request(), path = new URL(request.url()).pathname; calls.push(path)
  const reply = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  if (path.endsWith('/auth/admin/refresh')) return reply({}, 401)
  assert.equal(request.method(), 'GET')
  if (path.endsWith('/admin/session')) return reply({ account: { name: 'Synthetic' }, permissions })
  if (path.endsWith('/local-commerce/state')) return reply({ title: 'Unavailable' }, 503)
  if (path.endsWith('/local-commerce/orders')) return reply([]) // Old order deliberately absent from list.
  if (path.endsWith('/local-commerce/order-options')) return reply({ carriers: ['Fixture'], returnWindowDays: 14 })
  if (path.endsWith('/admin/designs')) return reply({ items: [design], page: 1, pageSize: 20, total: 1, totalPages: 1 })
  if (path.endsWith('/admin/designs/design-a/orders')) { assert.ok(permissions.includes('orders.read')); return reply({ items: [id, other].map(key => ({ id: key, number: order(key).order.number, createdAt: design.createdAt })), total: 2, totalPages: 1, page: 1, pageSize: 20 }) }
  if (path.endsWith('/admin/designs/design-a/image')) return route.fulfill({ contentType: 'image/png', body: png })
  if (path.endsWith('/admin/designs/design-a')) return reply(design)
  if (path.includes('/admin/orders/')) {
   assert.ok(permissions.includes('orders.read')); const key = path.split('/').at(-1), result = await detail?.(key, ++reads)
   if (result?.abort) return route.abort('failed')
   return reply(result?.body ?? order(key), result?.status ?? 200)
  }
  throw new Error('Unexpected dependency ' + path)
 })
 await page.goto(origin + url)
 return { page, calls, close: async () => { assert.deepEqual(errors, []); if (!permissions.includes('orders.read')) assert.equal(calls.filter(p => p.includes('/orders')).length, 0); await context.close(); passed++ } }
}
async function openFromDesign(f) { await f.page.getByRole('button', { name: 'İncele', exact: true }).click(); await f.page.getByRole('button', { name: 'OLD-ORDER sipariş detayını aç' }).click() }
try {
 for (const width of [1440, 1280, 768, 390]) {
  const f = await fixture(); await f.page.setViewportSize({ width, height: 900 }); await openFromDesign(f)
  const dialog = f.page.getByRole('dialog'); await dialog.getByRole('heading', { name: 'OLD-ORDER' }).waitFor()
  assert.equal(new URL(f.page.url()).searchParams.get('orderId'), id); assert.ok(f.calls.includes('/api/v1/admin/orders/' + id))
  assert.equal(await dialog.getByText('Fixture customer', { exact: false }).count(), 1)
  assert.equal(await dialog.getByRole('button', { name: /hazırlanmaya başla/i }).isDisabled(), true)
  assert.equal(await f.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await dialog.getByRole('button', { name: 'Tasarım yönetimine dön' }).focus(); await f.page.keyboard.press('Enter')
  await f.page.getByRole('region', { name: 'Tasarımlar ve sipariş bağlantıları' }).waitFor()
  await f.page.goForward(); await dialog.getByRole('heading', { name: 'OLD-ORDER' }).waitFor()
  await f.page.reload(); await dialog.getByRole('heading', { name: 'OLD-ORDER' }).waitFor()
  await f.page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' }); assert.equal(new URL(f.page.url()).searchParams.has('orderId'), false)
  await f.close()
 }
 { const f = await fixture({ permissions: ['print.read'] }); await f.page.getByRole('button', { name: 'İncele', exact: true }).click(); await f.page.getByRole('dialog').getByRole('img').waitFor(); assert.equal(await f.page.getByRole('region', { name: 'İlişkili siparişler' }).count(), 0); await f.close() }
 for (const status of [403, 404, 503, 'network']) {
  let fail = true
  const f = await fixture({ detail: () => fail ? status === 'network' ? { abort: true } : { status, body: { title: 'Fixture error' } } : {} }); await openFromDesign(f)
  const dialog = f.page.getByRole('dialog'); await dialog.getByRole('alert').waitFor(); assert.equal(await dialog.getByText('Fixture customer', { exact: false }).count(), 0)
  if (status === 404) assert.match(await dialog.getByRole('alert').innerText(), /Sipariş bulunamadı/)
  fail = false; await dialog.getByRole('button', { name: 'Sipariş detayını tekrar dene' }).click(); await dialog.getByRole('heading', { name: 'OLD-ORDER' }).waitFor(); await f.close()
 }
 { const f = await fixture({ detail: () => ({ status: 401 }) }); await openFromDesign(f); await f.page.getByRole('heading', { name: /giriş/i }).waitFor(); await f.close() }
 { const slow = gate(), started = gate(); const f = await fixture({ detail: async key => { if (key === id) { started.release(); await slow.promise } return { body: order(key) } } }); await openFromDesign(f); await started.promise
  await f.page.getByText('Sipariş detayı yükleniyor…').waitFor(); await f.page.goBack(); await f.page.getByRole('button', { name: 'İncele', exact: true }).click(); await f.page.getByRole('button', { name: 'SECOND-ORDER sipariş detayını aç' }).click()
  await f.page.getByRole('dialog').getByRole('heading', { name: 'SECOND-ORDER' }).waitFor(); slow.release(); await f.page.waitForTimeout(150); assert.equal(await f.page.getByRole('dialog').getByRole('heading', { name: 'OLD-ORDER' }).count(), 0); await f.close()
 }
 { const f = await fixture({ url: '/?view=orders&orderId=' + id, permissions: ['orders.read'] }); await f.page.getByRole('dialog').getByRole('heading', { name: 'OLD-ORDER' }).waitFor(); assert.equal(await f.page.getByRole('button', { name: 'Tasarım yönetimine dön' }).count(), 0); await f.close() }
 console.log(`PASS: ${passed} targeted design-to-order fixture scenarios; old order/direct GET, permissions, errors/retry/stale, history/reload, 4 widths/keyboard; no writes`)
} finally { await browser.close() }
