// Fixture-only Chrome acceptance: intercept every API call; no real SQL/account/files/print jobs.
import assert from 'node:assert/strict'
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const origin = process.env.PRINT_UI_ORIGIN || 'http://127.0.0.1:5196'
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const row = { id: 'design-a', kind: 'upload', productId: 'product-a', productName: 'Fixture ürün', variantId: 'variant-a', color: 'Siyah', createdAt: '2026-10-20T09:00:00Z' }
const paged = (items = [row], page = 1, total = items.length) => ({ items, page, pageSize: 20, total, totalPages: Math.ceil(total / 20) })
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve }); return { promise, release } }
let passed = 0
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=', 'base64')
async function fixture({ permissions = ['print.read'], list, detail, image, refresh = false } = {}) {
  const context = await browser.newContext(), page = await context.newPage(), errors = [], requests = []
  let reads = 0, details = 0, images = 0
  page.on('pageerror', error => errors.push(error.message))
  await context.route('**/api/v1/**', async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname
    requests.push({ path, method: request.method() })
    const reply = result => result?.abort ? route.abort('failed') : route.fulfill({ status: result?.status || 200, contentType: 'application/json', body: JSON.stringify(result?.body ?? {}) })
    if (path.endsWith('/auth/admin/refresh')) { assert.ok(refresh); return reply({ status: refresh === 'success' ? 200 : 401 }) }
    assert.equal(request.method(), 'GET', 'Metadata UI must not write')
    if (path.endsWith('/admin/session')) return reply({ body: { account: { name: 'Synthetic staff' }, permissions } })
    if (path.endsWith('/local-commerce/state')) return reply({ status: 503, body: { code: 'catalog_unavailable', title: 'Katalog kullanılamıyor' } })
    if (path.endsWith('/local-commerce/notifications')) return reply({ body: { channels: [], items: [] } })
    if (path.endsWith('/admin/designs')) { assert.equal(url.searchParams.get('pageSize'), '20'); return reply(await list?.(Number(url.searchParams.get('page')), ++reads) ?? { body: paged() }) }
    if (path.includes('/admin/designs/') && path.endsWith('/image')) {
      const result = await image?.(decodeURIComponent(path.split('/').at(-2)), ++images)
      if (result?.status || result?.abort) return reply(result)
      return route.fulfill({ status: 200, contentType: 'image/png', body: result?.bytes ?? png, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
    }
    if (path.includes('/admin/designs/')) return reply(await detail?.(decodeURIComponent(path.split('/').at(-1)), ++details) ?? { body: { ...row, mime: 'image/png', AccountId: 'PRIVATE-ACCOUNT', File: 'PRIVATE-FILE', Profile: ['PRIVATE-PROFILE'], Name: 'PRIVATE-NAME' } })
    throw new Error('Unexpected API dependency: ' + path)
  })
  await page.goto(origin + '/?view=print')
  const section = page.getByRole('region', { name: 'Tasarım ve baskı operasyonları' })
  return { page, section, requests, close: async () => { assert.deepEqual(errors, []); await context.close(); passed++ } }
}
try {
  for (const width of [1440, 1280, 768, 390]) {
    const f = await fixture(); await f.page.setViewportSize({ width, height: 900 })
    const inspect = f.section.getByRole('button', { name: 'İncele', exact: true }); await inspect.waitFor()
    await f.section.getByLabel('Bu sayfada tasarım ara').fill('bulunmuyor')
    await f.section.getByText('Bu sayfada aramaya uygun tasarım yok.').waitFor()
    await f.section.getByRole('button', { name: 'Aramayı temizle' }).click()
    await inspect.focus(); await f.page.keyboard.press('Enter')
    const dialog = f.page.getByRole('dialog'); await dialog.getByText('image/png', { exact: true }).waitFor()
    assert.doesNotMatch(await dialog.innerText(), /PRIVATE-/)
    await dialog.getByRole('img').waitFor(); await dialog.getByRole('img').evaluate(img => img.decode())
    assert.equal(await dialog.locator('a[download],textarea').count(), 0)
    assert.equal(await f.section.getByRole('button', { name: /Üretime|indir|oluştur|not.*kaydet/i }).count(), 0)
    assert.equal(await f.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow ${width}`)
    await f.page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' })
    assert.equal(await inspect.evaluate(button => button === document.activeElement), true)
    await f.page.reload(); await inspect.waitFor(); await f.close()
  }
  { const slow = gate(); const f = await fixture({ list: async () => { await slow.promise; return { body: paged() } } }); await f.section.getByText('Tasarım kayıtları yükleniyor…').waitFor(); assert.equal(await f.section.getByText('Henüz kayıtlı tasarım yok.').count(), 0); assert.equal(await f.section.getByLabel('Bu sayfada tasarım ara').isDisabled(), true); slow.release(); await f.section.getByRole('button', { name: 'İncele', exact: true }).waitFor(); await f.close() }
  { const f = await fixture({ list: () => ({ body: paged([]) }) }); await f.section.getByText('Henüz kayıtlı tasarım yok.').waitFor(); assert.equal(await f.section.getByRole('alert').count(), 0); await f.close() }
  for (const status of [403, 503]) {
    let fail = true
    const f = await fixture({ list: () => fail ? { status, body: { title: 'Fixture error' } } : { body: paged() } })
    await f.section.getByRole('alert').waitFor(); assert.equal(await f.section.getByText('Henüz kayıtlı tasarım yok.').count(), 0)
    assert.equal(await f.section.getByLabel('Bu sayfada tasarım ara').isDisabled(), true)
    assert.match(await f.section.getByRole('alert').innerText(), status === 403 ? /yetkiniz yok/ : /veri kaynağı.*kullanılamıyor/)
    fail = false; await f.section.getByRole('button', { name: 'Tekrar dene' }).click(); await f.section.getByRole('button', { name: 'İncele', exact: true }).waitFor(); await f.close()
  }
  { let fail = true; const f = await fixture({ list: () => fail ? { abort: true } : { body: paged() } }); await f.section.getByRole('alert').waitFor(); assert.match(await f.section.getByRole('alert').innerText(), /ulaşılamadı/); fail = false; await f.section.getByRole('button', { name: 'Tekrar dene' }).click(); await f.section.getByRole('button', { name: 'İncele', exact: true }).waitFor(); await f.close() }
  { const f = await fixture({ refresh: true, list: () => ({ status: 401 }) }); await f.page.getByRole('heading', { name: /giriş/i }).waitFor(); assert.ok(f.requests.some(r => r.path.endsWith('/auth/admin/refresh'))); await f.close() }
  { const f = await fixture({ permissions: ['notifications.read'] }); await f.page.getByRole('region', { name: 'Bildirim kayıtları' }).waitFor(); assert.equal(f.requests.filter(r => r.path.includes('/admin/designs')).length, 0); assert.equal(await f.page.locator('[data-nav-view="print"]').count(), 0); await f.close() }
  for (const status of [404, 403, 503]) {
    const f = await fixture({ detail: (_, n) => n === 1 ? { status, body: { title: 'Fixture error' } } : { body: { ...row, mime: 'image/png' } } })
    await f.section.getByRole('button', { name: 'İncele', exact: true }).click(); const d = f.page.getByRole('dialog'); await d.getByRole('alert').waitFor()
    assert.equal(await d.getByText('image/png').count(), 0); assert.match(await d.getByRole('alert').innerText(), status === 404 ? /bulunamadı/ : status === 403 ? /yetkiniz yok/ : /kullanılamıyor/)
    await d.getByRole('button', { name: 'Tekrar dene' }).click(); await d.getByText('image/png').waitFor(); await f.close()
  }
  { const slow = gate(), started = gate(); let mode = 'initial'; const f = await fixture({ list: async (page) => { if (mode === 'slow') { started.release(); await slow.promise; return { body: paged([{ ...row, productName: 'STALE-LIST' }]) } } return { body: paged([{ ...row, productName: mode === 'current' ? 'CURRENT-LIST' : row.productName }], page, 21) } } })
    await f.section.getByRole('button', { name: 'İncele', exact: true }).waitFor(); mode = 'slow'; await f.section.getByRole('button', { name: 'Yenile', exact: true }).click(); await started.promise
    await f.section.getByText('Tasarım kayıtları yükleniyor…').waitFor(); assert.equal(await f.section.getByRole('button', { name: 'İncele', exact: true }).count(), 0)
    mode = 'current'; await f.section.getByRole('button', { name: 'Yenile', exact: true }).click(); await f.section.getByRole('cell', { name: /^CURRENT-LIST/ }).waitFor(); slow.release(); await f.page.waitForTimeout(150)
    assert.equal(await f.section.getByRole('cell', { name: /^STALE-LIST/ }).count(), 0)
    await f.section.getByRole('button', { name: 'Sonraki →' }).click(); await f.section.getByText(/Sayfa 2\/2/).waitFor(); assert.equal(await f.section.getByRole('button', { name: 'Sonraki →' }).isDisabled(), true); await f.close()
  }
  { const slow = gate(), started = gate(); const f = await fixture({ detail: async (_, n) => { if (n === 1) { started.release(); await slow.promise; return { body: { ...row, mime: 'STALE-MIME' } } } return { body: { ...row, mime: 'image/current' } } } })
    await f.section.getByRole('button', { name: 'İncele', exact: true }).click(); await started.promise; await f.page.keyboard.press('Escape')
    await f.section.getByRole('button', { name: 'İncele', exact: true }).click(); await f.page.getByRole('dialog').getByText('image/current').waitFor(); slow.release(); await f.page.waitForTimeout(150)
    assert.equal(await f.page.getByText('STALE-MIME', { exact: true }).count(), 0); await f.close()
  }
  for (const status of [403, 404, 503, 'network', 'invalid']) {
    let fail = true
    const f = await fixture({ image: () => fail ? status === 'network' ? { abort: true } : status === 'invalid' ? { bytes: Buffer.from('not an image') } : { status, body: { title: 'Fixture image unavailable' } } : {} })
    await f.section.getByRole('button', { name: 'İncele', exact: true }).click()
    const preview = f.page.getByRole('region', { name: 'Kayıtlı tasarım görseli' }); await preview.getByRole('alert').waitFor()
    assert.equal(await preview.getByRole('img').count(), 0)
    fail = false; await preview.getByRole('button', { name: 'Görseli tekrar dene' }).click(); await preview.getByRole('img').waitFor(); await preview.getByRole('img').evaluate(img => img.decode()); await f.close()
  }
  { const f = await fixture({ refresh: true, image: () => ({ status: 401 }) }); await f.section.getByRole('button', { name: 'İncele', exact: true }).click(); await f.page.getByRole('heading', { name: /giriş/i }).waitFor(); await f.close() }
  { const f = await fixture({ refresh: 'success', image: (_, n) => n === 1 ? { status: 401 } : {} }); await f.section.getByRole('button', { name: 'İncele', exact: true }).click(); const img = f.page.getByRole('dialog').getByRole('img'); await img.waitFor(); await img.evaluate(image => image.decode()); assert.equal(f.requests.filter(request => request.path.endsWith('/auth/admin/refresh')).length, 1); await f.close() }
  { const slow = gate(), started = gate(); const f = await fixture({ list: () => ({ body: paged([row, { ...row, id: 'design-b', productName: 'Second product' }]) }), detail: id => ({ body: { ...row, id, productName: id === 'design-b' ? 'Second product' : row.productName, mime: 'image/png' } }), image: async id => { if (id === 'design-a') { started.release(); await slow.promise; return { bytes: Buffer.from('obsolete broken image') } } return {} } })
    await f.section.getByRole('button', { name: 'İncele', exact: true }).first().click(); await started.promise
    await f.page.getByText('Tasarım görseli yükleniyor…').waitFor(); await f.page.keyboard.press('Escape')
    await f.section.getByRole('button', { name: 'İncele', exact: true }).nth(1).click(); const img = f.page.getByRole('dialog').getByRole('img'); await img.waitFor(); await img.evaluate(image => image.decode()); slow.release(); await f.page.waitForTimeout(150)
    assert.match(await img.getAttribute('alt'), /Second product/); assert.equal(await f.page.getByRole('dialog').getByRole('alert').count(), 0); await f.close()
  }
  console.log(`PASS: ${passed} Chrome fixture scenarios; metadata/image, errors/retry, permission/session, pagination/stale selection, 4 widths and keyboard; no real SQL or print writes`)
} finally { await browser.close() }
