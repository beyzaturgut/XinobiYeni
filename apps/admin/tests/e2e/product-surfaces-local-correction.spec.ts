import { test, expect } from '../../../web/node_modules/@playwright/test/index.mjs'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { correctionGeometry, correctionToSource } from '../../src/features/product-surfaces/source-coordinates'
import type { MaskStroke, ReviewState } from '../../src/features/product-surfaces/product-surfaces-api'

const base = '/api/v1/admin/dev/product-surfaces/tea-maker-101-blue'
test('source coordinates under zoom, pan, contain, resize and outside rejection', () => {
  for (const rect of [{ left: 20, top: 50, width: 900, height: 560 }, { left: 0, top: 0, width: 350, height: 430 }])
    for (const zoom of [1, 3, 8]) {
      const pan = { x: 75, y: -40 }, g = correctionGeometry(1066, 1600, rect, zoom, pan)!
      expect(correctionToSource(rect.left + g.x + 420 * g.scale, rect.top + g.y + 920 * g.scale, 1066, 1600, rect, zoom, pan)!.x).toBeCloseTo(420, 8)
      expect(correctionToSource(rect.left + g.x + 420 * g.scale, rect.top + g.y + 920 * g.scale, 1066, 1600, rect, zoom, pan)!.y).toBeCloseTo(920, 8)
      expect(correctionToSource(rect.left + g.x - 1, rect.top + g.y, 1066, 1600, rect, zoom, pan)).toBeNull()
    }
})

test('local brush preview/undo/reset/zoom/pan: no POST while drawing, failure keeps strokes, one explicit request', async ({ page }) => {
  let posts = 0, sent: MaskStroke[] = []
  page.on('request', r => { if (r.method() === 'POST' && r.url().includes(base)) posts++ })
  await page.goto('/'); await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  await expect(page.getByRole('button', { name: 'Yerel maske düzelt', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Yerel maske düzelt', exact: true }).click()
  const canvas = page.getByTestId('mask-correction-canvas')
  await expect(canvas).toBeVisible()
  const image = (await canvas.boundingBox())!, viewport = page.getByTestId('mask-correction-viewport')
  async function stroke(x: number, y: number, dx = 0) {
    await viewport.scrollIntoViewIfNeeded()
    const current = (await canvas.boundingBox())!
    await page.mouse.move(current.x + x * current.width / 1066, current.y + y * current.height / 1600)
    await page.mouse.down(); await page.mouse.move(current.x + (x + dx) * current.width / 1066, current.y + y * current.height / 1600, { steps: 3 }); await page.mouse.up()
  }
  const alpha = () => canvas.evaluate(e => (e as HTMLCanvasElement).getContext('2d')!.getImageData(533, 800, 1, 1).data[3])
  await expect.poll(alpha).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Sil', exact: true }).click(); await stroke(533, 800, 10)
  await expect.poll(alpha).toBe(0)
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Reddet', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Ekle', exact: true }).click(); await stroke(533, 800, 10); await expect.poll(alpha).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Geri al', exact: true }).click(); await expect.poll(alpha).toBe(0)
  await page.getByRole('button', { name: 'Geri al', exact: true }).click(); await expect.poll(alpha).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Ekle', exact: true }).click(); await page.getByLabel('Fırça yarıçapı').selectOption('8'); await stroke(533, 800)
  await page.getByRole('button', { name: 'Sil', exact: true }).click(); await stroke(533, 800)
  await page.getByRole('button', { name: 'Kaydedilmemiş düzeltmeleri temizle', exact: true }).click()
  await expect(page.getByTestId('stroke-count')).toContainText('0 kaydedilmemiş işlem')
  // Letterbox is never clamped into the image.
  await viewport.click({ position: { x: 1, y: 1 } }); await expect(page.getByTestId('stroke-count')).toContainText('0 kaydedilmemiş işlem')
  const range = page.getByLabel('Yakınlaştır'); await range.fill('3'); await expect(page.getByText('3×', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Gezin', exact: true }).click()
  await viewport.scrollIntoViewIfNeeded()
  const box = (await viewport.boundingBox())!; const beforePan = await canvas.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 25); await page.mouse.up()
  expect((await canvas.boundingBox())!.x - beforePan!.x).toBeCloseTo(35, 0)
  await page.getByRole('button', { name: 'Görünümü sıfırla', exact: true }).click()
  await page.getByRole('button', { name: 'Sil', exact: true }).click(); await stroke(533, 800, 10)
  expect(posts).toBe(0)
  await page.route('**/candidates/*/correct', route => { sent = route.request().postDataJSON().operations; return route.fulfill({ status: 422, json: { requestId: 'local-test' } }) })
  await page.getByRole('button', { name: 'Yeni düzeltilmiş aday oluştur', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible(); await expect(page.getByTestId('stroke-count')).toContainText('1 kaydedilmemiş işlem')
  expect(posts).toBe(1); expect(sent[0].operation).toBe('remove'); expect(sent[0].radius).toBe(8)
  expect(sent[0].points[0].x).toBeCloseTo(533, 0); expect(Math.abs(sent[0].points[0].y - 800)).toBeLessThan(1600 / image.height)
  await page.getByRole('button', { name: 'Geri al', exact: true }).click(); await expect(page.getByTestId('stroke-count')).toContainText('0 kaydedilmemiş işlem')
  await page.getByRole('button', { name: 'Düzeltmeleri bırak ve çık', exact: true }).click()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
})

test('Tea Maker refined parent: explicit local bottom correction creates pending immutable candidate; mobile', async ({ page }) => {
  let correctionPosts = 0, inferencePosts = 0
  await page.route('https://serverless.roboflow.com/**', () => { throw new Error('Forbidden inference') })
  await page.route(`**${base}/**`, async route => {
    const r = route.request()
    if (r.method() === 'POST' && r.url().endsWith('/revisions')) { inferencePosts++; await route.abort(); return }
    if (r.method() === 'POST' && r.url().endsWith('/correct')) correctionPosts++
    const response = await route.fetch({ url: 'http://127.0.0.1:5019' + new URL(r.url()).pathname, headers: { ...r.headers(), Origin: 'http://localhost:5173' } })
    await route.fulfill({ response })
  })
  await page.goto('/'); await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  await expect(page.getByRole('button', { name: 'Yerel maske düzelt', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Kapalı bölgeyi düzenle', exact: true }).click()
  await expect(page.getByTestId('refinement-target')).toContainText('Düzenlenmiş aday')
  const parent = await (await page.request.get('http://127.0.0.1:5019' + base + '/review')).json() as ReviewState
  const old = await (await page.request.get('http://127.0.0.1:5019' + parent.candidate!.maskUrl)).body()
  expect(createHash('sha256').update(old).digest('hex')).toBe('4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43')
  fs.writeFileSync(path.join(os.tmpdir(), 'xinobi-step4d2-parent-mask.png'), old)
  await page.getByRole('button', { name: 'Yerel maske düzelt', exact: true }).click()
  await expect(page.getByTestId('mask-correction-canvas')).toBeVisible()
  await page.getByLabel('Yakınlaştır').fill('4')
  // Pan the zoomed image so the measured bottom jagged region is centered in the viewport.
  await page.getByRole('button', { name: 'Gezin', exact: true }).click()
  await page.getByTestId('mask-correction-viewport').scrollIntoViewIfNeeded()
  const view = page.getByTestId('mask-correction-viewport'), v = (await view.boundingBox())!, c = (await page.getByTestId('mask-correction-canvas').boundingBox())!
  const dx = v.x + v.width / 2 - (c.x + 450 * c.width / 1066), dy = v.y + v.height / 2 - (c.y + 1231 * c.height / 1600)
  await page.mouse.move(v.x + v.width / 2, v.y + v.height / 2); await page.mouse.down(); await page.mouse.move(v.x + v.width / 2 + dx, v.y + v.height / 2 + dy, { steps: 5 }); await page.mouse.up()
  await page.getByRole('button', { name: 'Ekle', exact: true }).click()
  await view.scrollIntoViewIfNeeded()
  const moved = (await page.getByTestId('mask-correction-canvas').boundingBox())!
  const at = (x: number, y: number) => ({ x: moved.x + x * moved.width / 1066, y: moved.y + y * moved.height / 1600 })
  // Human-selected small addition across the known bottom indent; not copied from the manual mask.
  const a = at(435, 1230), b = at(470, 1230)
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 8 }); await page.mouse.up()
  await expect(page.getByTestId('stroke-count')).toContainText('1 kaydedilmemiş işlem')
  expect(correctionPosts).toBe(0); expect(inferencePosts).toBe(0)
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4d2-unsaved-desktop.png'), fullPage: true })
  await page.getByRole('button', { name: 'Yeni düzeltilmiş aday oluştur', exact: true }).click()
  await expect(page.getByTestId('mask-correction-canvas')).toHaveCount(0)
  await expect(page.getByTestId('candidate-id')).not.toContainText(parent.candidate!.candidateId)
  await expect(page.locator('.surface-panel .state')).toHaveText('İnceleme bekliyor')
  const result = await (await page.request.get('http://127.0.0.1:5019' + base + '/review')).json() as ReviewState
  const correctedBytes = await (await page.request.get('http://127.0.0.1:5019' + result.candidate!.maskUrl)).body()
  fs.writeFileSync(path.join(os.tmpdir(), 'xinobi-step4d2-corrected-mask.png'), correctedBytes)
  fs.writeFileSync(path.join(os.tmpdir(), 'xinobi-step4d2-correction-evidence.json'), JSON.stringify(result, null, 2))
  expect(result.correction!.parentCandidateId).toBe(parent.candidate!.candidateId); expect(result.activeApproval).toBeNull()
  expect(result.correction!.operations[0].operation).toBe(0)
  expect(result.correction!.operations[0].radius).toBe(4)
  expect(result.correction!.operations[0].points[0].x).toBeCloseTo(435, 0)
  expect(result.correction!.operations[0].points[0].y).toBeCloseTo(1230, 0)
  expect(await (await page.request.get('http://127.0.0.1:5019' + parent.candidate!.maskUrl)).body()).toEqual(old)
  expect(correctionPosts).toBe(1); expect(inferencePosts).toBe(0)
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4d2-corrected-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Yerel maske düzelt', exact: true }).click(); await expect(page.getByTestId('mask-correction-canvas')).toBeVisible()
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await page.getByTestId('mask-correction-viewport').scrollIntoViewIfNeeded()
  const mobile = (await page.getByTestId('mask-correction-canvas').boundingBox())!
  await page.mouse.move(mobile.x + mobile.width / 2, mobile.y + mobile.height / 2); await page.mouse.down(); await page.mouse.up()
  await expect(page.getByTestId('stroke-count')).toContainText('1 kaydedilmemiş işlem')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4d2-correction-mobile.png'), fullPage: true })
  const undo = page.getByRole('button', { name: 'Geri al', exact: true }); await undo.focus(); await expect(undo).toBeFocused(); await page.keyboard.press('Enter')
  await expect(page.getByTestId('stroke-count')).toContainText('0 kaydedilmemiş işlem')
  await page.getByRole('button', { name: 'Düzeltmeleri bırak ve çık', exact: true }).click()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  expect(correctionPosts).toBe(1)
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})

test('stale correction preserves parent preview and strokes; no automatic retry or transfer to new candidate', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  await expect(page.getByRole('button', { name: 'Yerel maske düzelt', exact: true })).toBeEnabled()
  const original = await (await page.request.get(base + '/review')).json() as ReviewState
  await page.getByRole('button', { name: 'Yerel maske düzelt', exact: true }).click()
  const view = page.getByTestId('mask-correction-viewport'); await expect(page.getByTestId('mask-correction-canvas')).toBeVisible(); await view.scrollIntoViewIfNeeded()
  const c = (await page.getByTestId('mask-correction-canvas').boundingBox())!
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await page.mouse.down(); await page.mouse.up()
  let posts = 0
  await page.route('**/candidates/*/correct', route => { posts++; return route.fulfill({ status: 409, json: { requestId: 'stale' } }) })
  await page.route(`**${base}/review`, route => route.fulfill({ json: { ...original, stateVersion: original.stateVersion + 1,
    candidate: { ...original.candidate, candidateId: '00000000-0000-0000-0000-000000000123' } } }))
  await page.getByRole('button', { name: 'Yeni düzeltilmiş aday oluştur', exact: true }).click()
  await expect(page.getByTestId('stroke-count')).toContainText('1 kaydedilmemiş işlem')
  await expect(page.getByRole('button', { name: 'Yeni düzeltilmiş aday oluştur', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeDisabled()
  await expect(page.getByText('Aday değişti. Düzeltmeler korunuyor; farklı adaya gönderilmez. Düzeltmeleri bırakarak güncel adayı inceleyin.')).toBeVisible()
  expect(posts).toBe(1)
  await page.getByRole('button', { name: 'Düzeltmeleri bırak ve çık', exact: true }).click()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})
