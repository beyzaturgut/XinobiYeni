import { test, expect } from '../../../web/node_modules/@playwright/test/index.mjs'
import path from 'node:path'
import os from 'node:os'
import { clickToSource, imageGeometry } from '../../src/features/product-surfaces/source-coordinates'
const base = '/api/v1/admin/dev/product-surfaces/tea-maker-101-blue'
test('coordinate mapping: center, edges, letterbox, resize, invalid input', () => {
  for (const rect of [{ left: 20, top: 30, width: 900, height: 560 }, { left: 0, top: 0, width: 350, height: 430 }]) {
    const g = imageGeometry(1066, 1600, rect)!
    const center = clickToSource(rect.left + g.x + g.width / 2, rect.top + g.y + g.height / 2, 1066, 1600, rect)!; expect(center.x).toBeCloseTo(533, 8); expect(center.y).toBeCloseTo(800, 8)
    expect(clickToSource(rect.left + g.x, rect.top + g.y, 1066, 1600, rect)).toEqual({ x: 0, y: 0 })
    expect(clickToSource(rect.left + g.x + g.width, rect.top + g.y, 1066, 1600, rect)).toBeNull()
    expect(clickToSource(rect.left - 1, rect.top, 1066, 1600, rect)).toBeNull()
  }
  expect(clickToSource(NaN, 0, 1066, 1600, { left: 0, top: 0, width: 0, height: 0 })).toBeNull()
})
test('local API review, corrections, regeneration, approval/rejection and mobile', async ({ page }) => {
  let posts = 0
  page.on('request', r => { if (r.method() === 'POST' && r.url().includes(base)) posts++ })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  const approve = page.getByRole('button', { name: 'Onayla', exact: true })
  await expect(approve).toBeEnabled()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  expect(await page.getByTestId('surface-mask').evaluate(e => getComputedStyle(e).getPropertyValue('-webkit-mask-image') || getComputedStyle(e).maskImage)).toContain('/mask')
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-product-surfaces-step3-desktop.png'), fullPage: true })
  const first = await page.getByTestId('candidate-id').textContent()
  await page.getByRole('button', { name: 'Düzelt', exact: true }).click()
  const image = page.locator('.surface-image-rect')
  const box = (await image.boundingBox())!
  const preview = page.getByTestId('surface-preview')
  await preview.evaluate(el => el.addEventListener('click', event => { el.setAttribute('data-test-client-x', String((event as MouseEvent).clientX)); el.setAttribute('data-test-client-y', String((event as MouseEvent).clientY)) }, { once: true }))
  await image.click({ position: { x: box.width / 2, y: box.height / 2 } })
  const marker = page.getByTestId('surface-point').first()
  // Compare against the actual dispatched CSS coordinate, not an assumed fractional pointer coordinate.
  const rect = (await preview.boundingBox())!
  const expected = clickToSource(Number(await preview.getAttribute('data-test-client-x')), Number(await preview.getAttribute('data-test-client-y')), 1066, 1600, { left: rect.x, top: rect.y, width: rect.width, height: rect.height })!
  expect(Number(await marker.getAttribute('data-x'))).toBeCloseTo(expected.x, 8)
  expect(Number(await marker.getAttribute('data-y'))).toBeCloseTo(expected.y, 8)
  // Browser pointer dispatch rounds to CSS pixels; allow at most one displayed pixel.
  expect(Math.abs(Number(await marker.getAttribute('data-y')) - 800)).toBeLessThan(1600 / box.height)
  await page.getByRole('button', { name: 'Noktaları temizle' }).click()
  await page.getByTestId('surface-preview').click({ position: { x: 1, y: 1 } })
  await expect(page.getByTestId('surface-point')).toHaveCount(0)
  await image.click({ position: { x: 120, y: 200 } })
  await page.getByRole('button', { name: 'Hariç tut (-)' }).click()
  await image.click({ position: { x: 80, y: 160 } })
  await expect(page.getByTestId('surface-point')).toHaveCount(2)
  expect(posts).toBe(0)
  await expect(approve).toBeDisabled()
  await page.getByRole('button', { name: 'Adayı yeniden oluştur', exact: true }).click()
  await expect(page.getByTestId('candidate-id')).not.toHaveText(first!)
  await expect(page.getByTestId('surface-point')).toHaveCount(0)
  expect(posts).toBe(1)
  await expect(approve).toBeEnabled()
  await approve.click()
  await expect(page.locator('.surface-panel .state')).toHaveText('Onaylandı')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Düzelt', exact: true }).click()
  await image.click({ position: { x: 70, y: 100 } })
  const mobileBox = (await image.boundingBox())!
  const mobileMarker = (await page.getByTestId('surface-point').boundingBox())!
  expect(Math.abs(mobileMarker.x + mobileMarker.width / 2 - mobileBox.x - 70)).toBeLessThan(1)
  await page.getByRole('button', { name: 'Adayı yeniden oluştur', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Reddet', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Reddet', exact: true }).click()
  await expect(page.locator('.surface-panel .state')).toHaveText('Reddedildi')
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-product-surfaces-step3-mobile.png'), fullPage: true })
})
test('failed regeneration keeps points; stale approval reloads without retry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  await expect(page.getByRole('button', { name: 'Düzelt', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Düzelt', exact: true }).click()
  await page.locator('.surface-image-rect').click({ position: { x: 100, y: 200 } })
  await page.route('**/revisions', route => route.fulfill({ status: 503, contentType: 'application/problem+json', body: '{"requestId":"qa"}' }))
  await page.getByRole('button', { name: 'Adayı yeniden oluştur', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByTestId('surface-point')).toHaveCount(1)
  await page.unroute('**/revisions')
  await page.getByRole('button', { name: 'Adayı yeniden oluştur', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeEnabled()
  const current = await (await page.request.get(base + '/review')).json()
  await page.request.post(base + '/revisions', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { sessionId: current.sessionId, expectedStateVersion: current.stateVersion, mode: 'automatic' } })
  let decisions = 0
  page.on('request', r => { if (r.method() === 'POST' && r.url().endsWith('/review')) decisions++ })
  await page.getByRole('button', { name: 'Onayla', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('İnceleme değişti')
  await expect(page.locator('.surface-panel .state')).toHaveText('İnceleme bekliyor')
  expect(decisions).toBe(1)
  await page.getByRole('button', { name: 'Onayla', exact: true }).focus()
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeFocused()
})
test('review loading and error states', async ({ page }) => {
  let release: () => void = () => {}
  const wait = new Promise<void>(resolve => { release = resolve })
  await page.route('**/review', async route => { await wait; await route.abort() })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  await expect(page.locator('.surface-panel').getByRole('status')).toContainText('yükleniyor')
  release()
  await expect(page.getByRole('alert')).toContainText('İnceleme yüklenemedi')
})

test('external-provider page load has no inference; explicit create uses one mocked POST', async ({ page }) => {
  const reference = await (await page.request.get(base + '/review')).json()
  const empty = { ...reference, candidate: null, activeApproval: null, revisionCount: 0,
    provider: 'roboflow', providerLabel: 'Roboflow sağlayıcısı seçili — dış inference kapalı; bu testte yalnız mock HTTP.', operationInProgress: false }
  let posts = 0
  let created = false
  // No remote provider request may ever be made by this browser test.
  await page.route('https://serverless.roboflow.com/**', () => { throw new Error('Forbidden external inference') })
  await page.route('**/review', route => route.fulfill({ json: created ? { ...reference, provider: 'roboflow', providerLabel: 'Mock HTTP sonucu — gerçek AI değil.' } : empty }))
  await page.route('**/revisions', route => {
    posts++
    expect(route.request().postDataJSON().mode).toBe('automatic')
    created = true
    return route.fulfill({ json: { ...reference, provider: 'roboflow', providerLabel: 'Mock HTTP sonucu — gerçek AI değil.' } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  const create = page.getByRole('button', { name: 'Aday oluştur', exact: true })
  await expect(create).toBeEnabled()
  await expect(page.locator('.surface-panel .state')).toHaveText('Henüz aday yok')
  await expect(page.getByTestId('surface-mask')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeDisabled()
  expect(posts).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await create.click()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  await expect(page.locator('.surface-description')).toContainText('Mock HTTP sonucu')
  expect(posts).toBe(1)
})
