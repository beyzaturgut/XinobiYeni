import { test, expect } from '../../../web/node_modules/@playwright/test/index.mjs'
import path from 'node:path'
import os from 'node:os'
import type { ReviewState } from '../../src/features/product-surfaces/product-surfaces-api'

const base = '/api/v1/admin/dev/product-surfaces/tea-maker-101-blue'
test('local opt-in refinement: raw/derived comparison preserves exact review target and mobile alignment', async ({ page }) => {
  let refinementPosts = 0
  let inferencePosts = 0
  await page.route('https://serverless.roboflow.com/**', () => { throw new Error('Forbidden external inference') })
  // Separate, network-disabled local fixture host; normal reference tests retain their existing session.
  await page.route(`**${base}/**`, async route => {
    const request = route.request()
    if (request.method() === 'POST' && request.url().endsWith('/revisions')) { inferencePosts++; await route.abort(); return }
    if (request.method() === 'POST' && request.url().endsWith('/refine')) refinementPosts++
    const response = await route.fetch({ url: 'http://127.0.0.1:5017' + new URL(request.url()).pathname, headers: { ...request.headers(), Origin: 'http://localhost:5173' } })
    if (request.method() === 'POST') expect(response.ok(), `Local POST status ${response.status()}`).toBe(true)
    await route.fulfill({ response })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)' }).click()
  const refine = page.getByRole('button', { name: 'Kapalı bölgeyi düzenle', exact: true })
  await expect(refine).toBeEnabled()
  await expect(page.getByTestId('refinement-target')).toHaveText('Ham sağlayıcı adayı inceleniyor.')
  const rawTarget = await page.getByTestId('candidate-id').textContent()
  await refine.click()
  await expect(page.getByTestId('candidate-id')).not.toHaveText(rawTarget!)
  await expect(page.getByTestId('refinement-target')).toContainText('Düzenlenmiş aday')
  await expect(page.getByText('1 kapalı bölge dolduruldu · 5.718 piksel', { exact: true })).toBeVisible()
  await expect(page.locator('.surface-panel .state')).toHaveText('İnceleme bekliyor')
  const current = await (await page.request.get('http://127.0.0.1:5017' + base + '/review')).json() as ReviewState
  const target = await page.getByTestId('candidate-id').textContent()
  expect(current.activeApproval).toBeNull()
  expect(current.derivation?.pixelsFilled).toBe(5718)
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeEnabled()
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4c2-derived-desktop.png'), fullPage: true })
  const raw = page.getByRole('button', { name: 'Ham', exact: true })
  await expect(raw).toHaveAttribute('aria-pressed', 'false')
  await expect(raw).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await raw.click()
  await expect(raw).toHaveAttribute('aria-pressed', 'true')
  await expect(raw).toHaveCSS('background-color', 'rgb(34, 34, 34)')
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Reddet', exact: true })).toBeDisabled()
  await expect(page.getByTestId('candidate-id')).toHaveText(target!)
  expect(await page.getByTestId('surface-mask').evaluate(e => getComputedStyle(e).getPropertyValue('-webkit-mask-image') || getComputedStyle(e).maskImage)).toContain(current.rawCandidate!.maskUrl)
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4c2-raw-desktop.png'), fullPage: true })
  await page.getByRole('button', { name: 'Düzenlenmiş', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).toBeEnabled()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const image = await page.locator('.surface-image-rect').boundingBox()
  const overlay = await page.getByTestId('surface-mask').boundingBox()
  expect(overlay).toEqual(image)
  await page.screenshot({ path: path.join(os.tmpdir(), 'xinobi-step4c2-derived-mobile.png'), fullPage: true })
  await raw.focus(); await expect(raw).toBeFocused()
  expect(refinementPosts).toBe(1); expect(inferencePosts).toBe(0)
  // Verify the client approval target with a mocked decision only; the real local candidate remains pending.
  let decisions = 0
  await page.route('**/candidates/*/review', async route => {
    decisions++
    expect(route.request().url()).toContain(`/revisions/${current.candidate!.revisionId}/candidates/${current.candidate!.candidateId}/review`)
    expect(route.request().postDataJSON().outcome).toBe('approve')
    await route.fulfill({ json: { ...current, candidate: { ...current.candidate, status: 'approved' } } })
  })
  await page.getByRole('button', { name: 'Onayla', exact: true }).click()
  await expect(page.locator('.surface-panel .state')).toHaveText('Onaylandı')
  expect(decisions).toBe(1)
  expect((await (await page.request.get('http://127.0.0.1:5017' + base + '/review')).json()).candidate.status).toBe('pending')
})
