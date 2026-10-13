import { test, expect } from '../../../web/node_modules/@playwright/test/index.mjs'
import fs from 'node:fs'
import path from 'node:path'
const image = fs.readFileSync(path.resolve(process.cwd(), 'apps/web/public/assets/products/tea-maker-101-blue.webp'))
const reference = '/api/v1/local-commerce/media/' + 'a'.repeat(32) + '.webp'
const product = { id: 'catalog-product', name: 'Catalog tea maker', category: 'Tea', active: true, description: '', seoTitle: '', personalizable: true, variants: [{ id: 'catalog-navy', color: 'Navy', sku: '101', stock: 1, image: reference }] }
for (const invalid of [false, true]) test(invalid ? 'invalid source fails closed without borrowing demo mask' : 'exact catalog selection preserves image identity and demo review', async ({ page }) => {
  let posts = 0
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url())
    if (request.method() !== 'GET') { posts++; return route.abort() }
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort()
    if (url.pathname === '/api/v1/local-commerce/state') return route.fulfill({ json: { products: [invalid ? { ...product, variants: [{ ...product.variants[0], image: 'https://invalid.example/image.webp' }] } : product], prices: {}, content: { slides: [], xinobiBanner: '', buttonColor: '#000' } } })
    if (url.pathname === reference) return route.fulfill({ contentType: 'image/webp', body: image })
    return route.continue()
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ürün yüzeyi incele (geliştirme)', exact: true }).click()
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  await page.getByRole('combobox', { name: 'Ürün', exact: true }).selectOption(product.id)
  await expect(page.getByTestId('surface-mask')).not.toBeVisible()
  await page.getByRole('combobox', { name: 'Varyant', exact: true }).selectOption('catalog-navy')
  if (invalid) await expect(page.getByRole('alert').filter({ hasText: 'Bu varyant' })).toBeVisible()
  else {
    const source = page.getByTestId('catalog-surface-source')
    await expect(source).toHaveAttribute('data-product-id', product.id)
    await expect(source).toHaveAttribute('data-variant-id', 'catalog-navy')
    await expect(source).toHaveAttribute('data-image-reference', reference)
    await expect(source).toHaveAttribute('data-source-sha256', 'da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414')
    await expect(source).toHaveAttribute('data-source-width', '1066')
    await expect(source.locator('img')).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Onayla', exact: true })).not.toBeVisible()
  await page.getByRole('combobox', { name: 'Ürün', exact: true }).selectOption('')
  await expect(page.getByTestId('surface-mask')).toBeVisible()
  expect(posts).toBe(0)
})
