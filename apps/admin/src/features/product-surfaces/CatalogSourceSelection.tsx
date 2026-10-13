import CatalogReadiness from './CatalogReadiness'
import CatalogMaskReview from './CatalogMaskReview'
import { useEffect, useState } from 'react'
import type { Product } from '../../commerce'
import LocalMaskEditor from './LocalMaskEditor'

type SourceSelection = Readonly<{ productId: string; variantId: string; imageReference: string; sha256: string; width: number; height: number; originalWidth: number; originalHeight: number; previewUrl: string }>
const maxWorkingPixels = 8_000_000
function workingDimensions(width: number, height: number) {
  const scale = width * height > maxWorkingPixels ? Math.sqrt(maxWorkingPixels / (width * height)) : 1
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) }
}
// Read-only entry; never passes a catalog source into the fixture's review/candidate state.
const configuredBase = import.meta.env.VITE_PRODUCT_SURFACES_CATALOG_API_URL || '/api/v1/local-commerce'
function catalogBase() {
  const url = new URL(configuredBase, window.location.origin)
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname.replace(/\/$/, '') !== '/api/v1/local-commerce') throw new Error('invalid_local_catalog')
  return url.href.replace(/\/$/, '')
}
export default function CatalogSourceSelection({ disabled, onSelected }: { disabled: boolean; onSelected: (selected: boolean) => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [source, setSource] = useState<SourceSelection | null>(null)
  const [catalogError, setCatalogError] = useState(false)
  const [sourceError, setSourceError] = useState(false)
  const product = products.find(p => p.id === productId)
  const variant = product?.variants.find(v => v.id === variantId)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(catalogBase() + '/state', { signal: controller.signal, credentials: 'omit', cache: 'no-store' })
        if (!response.ok) throw new Error('catalog_unavailable')
        const value = await response.json() as { products?: Product[] }
        if (!Array.isArray(value.products) || value.products.some(p => !p || typeof p.id !== 'string' || !p.id || typeof p.name !== 'string' || !Array.isArray(p.variants) || p.variants.some(v => !v || typeof v.id !== 'string' || !v.id || typeof v.image !== 'string')) || new Set(value.products.map(p => p.id)).size !== value.products.length || new Set(value.products.flatMap(p => p.variants.map(v => v.id))).size !== value.products.flatMap(p => p.variants).length) throw new Error('invalid_catalog')
        if (!controller.signal.aborted) setProducts(value.products)
      } catch { if (!controller.signal.aborted) setCatalogError(true) }
    }
    void load(); return () => controller.abort()
  }, [])
  useEffect(() => {
    const controller = new AbortController(); let previewUrl: string | null = null
    if (!product || !variant) return () => controller.abort()
    const productSnapshot = product.id, variantSnapshot = variant.id, imageReference = variant.image
    async function load() {
      try {
        if (!/^\/api\/v1\/local-commerce\/media\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(imageReference)) throw new Error('unsupported_source')
        const url = new URL(catalogBase()); url.pathname = imageReference
        const response = await fetch(url.href, { signal: controller.signal, credentials: 'omit', cache: 'no-store' })
        if (!response.ok || !/^image\/(png|jpeg|webp)(;|$)/.test(response.headers.get('content-type') || '')) throw new Error('invalid_source')
        const bytes = await response.arrayBuffer()
        if (!bytes.byteLength || bytes.byteLength > 20 * 1024 * 1024) throw new Error('source_size')
        const hash = await crypto.subtle.digest('SHA-256', bytes)
        if (controller.signal.aborted) return
        const inputBlob = new Blob([bytes], { type: response.headers.get('content-type')! })
        const bitmap = await createImageBitmap(inputBlob)
        const originalWidth = bitmap.width, originalHeight = bitmap.height, working = workingDimensions(originalWidth, originalHeight)
        if (working.width === originalWidth && working.height === originalHeight) {
          bitmap.close(); previewUrl = URL.createObjectURL(inputBlob)
        }
        else {
          const canvas = document.createElement('canvas'); canvas.width = working.width; canvas.height = working.height
          const context = canvas.getContext('2d'); if (!context) throw new Error('preview_context')
          context.drawImage(bitmap, 0, 0, working.width, working.height); bitmap.close()
          const preview = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.92))
          if (!preview) throw new Error('preview_encode')
          previewUrl = URL.createObjectURL(preview)
        }
        if (!controller.signal.aborted) setSource(Object.freeze({ productId: productSnapshot, variantId: variantSnapshot, imageReference, sha256: Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join(''), ...working, originalWidth, originalHeight, previewUrl }))
      } catch { if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null }; if (!controller.signal.aborted) setSourceError(true) }
    }
    void load(); return () => { controller.abort(); if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [product, variant])
  return <section className="surface-panel surface-catalog-entry" aria-label="Ürün ve varyant seçimi">
    <div className="surface-controls">
      <CatalogReadiness products={products} disabled={disabled} onSelect={(p,v)=>{setProductId(p);setVariantId(v);setSource(null);setSourceError(false);onSelected(true)}} />
      <fieldset disabled={disabled}>
        <legend>İncelenecek ürün</legend>
        <label>Ürün<select value={productId} onChange={event => { setProductId(event.target.value); setVariantId(''); setSource(null); setSourceError(false); onSelected(!!event.target.value) }}>
          <option value="">Çalışan Tea Maker örneği</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></label>
        {productId && <label>Varyant<select value={variantId} onChange={event => { setVariantId(event.target.value); setSource(null); setSourceError(false) }}><option value="">Varyant seçin</option>{product?.variants.map(v => <option key={v.id} value={v.id}>{v.color}</option>)}</select></label>}
      </fieldset>
      {catalogError && <p role="alert">Katalog yüklenemedi. Çalışan örnek incelemesi korunuyor.</p>}
      {disabled && <p>Ürünü değiştirmeden önce mevcut düzeltmeyi tamamlayın veya temizleyin.</p>}
      {productId && !variantId && <p>İncelemek için bir varyant seçin.</p>}
      {variantId && !source && !sourceError && <p role="status">Seçili varyantın görseli yükleniyor…</p>}
      {sourceError && <p role="alert">Bu varyantın görseli doğrulanamadı. Başka bir görsel veya maske kullanılmadı.</p>}
      {source && <div data-testid="catalog-surface-source" data-product-id={source.productId} data-variant-id={source.variantId} data-image-reference={source.imageReference} data-source-sha256={source.sha256} data-source-width={source.width} data-source-height={source.height} data-source-original-width={source.originalWidth} data-source-original-height={source.originalHeight}>
        <h2>{product?.name} · {variant?.color}</h2>
        <p>Maske durumu yalnızca seçili varyant ve doğrulanmış kaynak için kontrol edilir.</p>
        <CatalogMaskReview key={source.productId+source.variantId+source.sha256} source={source} />
        <LocalMaskEditor key={source.productId + source.variantId + source.sha256} source={source} />
        <img src={source.previewUrl} alt={product?.name + ' · ' + variant?.color} draggable={false} />
      </div>}
    </div>
  </section>
}
