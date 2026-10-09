export type Variant = { id: string; sku: string; color: string; hex?: string; stock: number; image: string }
export type ProductSpec = { name: string; value: string }
export type Product = { id: string; name: string; category: string; active: boolean; description: string; seoTitle: string; personalizable?: boolean | null; originalImage?: string; gallery?: string[]; specs?: ProductSpec[] | null; variants: Variant[] }
export type Slide = { id: number; name: string; type: 'Fotoğraf' | 'Video'; src: string; alt: string; duration: number; active: boolean }
export type Content = { slides: Slide[]; xinobiBanner: string; buttonColor: string; categoryProducts?: Record<string, string>; categoryImages?: Record<string, string>; titaniumBanner?: string | null; titaniumImage?: string | null; featuredProducts?: string[] | null }
export type Announcement = { id: string; title: string; body: string; kind: 'Haber' | 'Duyuru'; publishedAt: string }
export type CommerceState = { announcements?: Announcement[]; categories?: string[]; products: Product[]; prices: Record<string, number>; content: Content }
export const localApi = 'http://127.0.0.1:5003/api/v1/local-commerce'
// Panel routes need the staff session cookie; the CSRF header proves the request comes from our own pages (ADR-004).
// A static snapshot (no API base) gets a plain request so CDNs need no credentialed CORS.
const send = (url: string, method: string, body: unknown, api: boolean) => fetch(url, {
  method, cache: 'no-store', signal: AbortSignal.timeout(10000),
  credentials: api ? 'include' : 'same-origin',
  headers: { ...(body instanceof FormData || body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(api ? { 'X-Xinobi-Csrf': '1' } : {}) },
  body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
})
export async function commerceRequest<T>(base: string, route: string, method = 'GET', body?: unknown): Promise<T> {
  let response = await send(`${base}${route}`, method, body, Boolean(base))
  // Access tokens live 15 minutes; renew once from the refresh cookie and retry before giving up.
  if (response.status === 401 && base.includes('/local-commerce')) {
    const refreshed = await fetch(`${base.replace(/\/local-commerce.*$/, '')}/auth/web/refresh`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Xinobi-Csrf': '1' }, body: '{}' }).catch(() => null)
    if (refreshed?.ok) response = await send(`${base}${route}`, method, body, true)
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    if (response.status === 401) throw new Error('Oturumun sona erdi. Sayfayı yenileyip tekrar giriş yap.')
    if (response.status === 403) throw new Error('Bu işlem için yetkin yok.')
    throw new Error(payload.message || payload.title || `İçerik API’si hata verdi (${response.status}).`)
  }
  return response.json()
}
/** Product photos are shown at most ~1400 device pixels wide; anything far larger only slows decoding (a 20 MP photo froze colour switches). */
export const productPhotoMaxEdge = 2000
const encode = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
/** Downscales a PNG/JPEG/WebP so its long edge is at most [maxEdge]; returns the file unchanged when it is already small or the browser cannot help. */
export async function downscaleImage(file: File, maxEdge: number): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  try {
    const scale = maxEdge / Math.max(bitmap.width, bitmap.height)
    if (scale >= 1) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) return file
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const type = file.type === 'image/png' ? 'image/png' : 'image/webp'
    let blob = await encode(canvas, type, 0.86)
    if (!blob || blob.type !== type) {
      // Safari cannot encode WebP: fall back to JPEG on white, since JPEG has no transparency.
      context.globalCompositeOperation = 'destination-over'; context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height)
      blob = await encode(canvas, 'image/jpeg', 0.88)
    }
    if (!blob || blob.size >= file.size) return file
    const extension = blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : '.jpg'
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + extension, { type: blob.type })
  } finally { bitmap.close() }
}
export async function uploadMedia(base: string, file: File, maxEdge = 2560) {
  const form = new FormData(); form.append('file', await downscaleImage(file, maxEdge))
  return (await commerceRequest<{ src: string }>(base, '/media', 'POST', form)).src
}
export function mediaUrl(source: string, base: string, assetBase = '') {
  return source.startsWith('/api/v1/local-commerce/media/') ? `${base.replace(/\/api\/v1\/local-commerce\/?$/, '')}${source}` : source.startsWith('/assets/') ? assetBase + source : source
}
export const money = (cents: number | undefined) => cents === undefined ? 'Fiyat tanımlanmadı' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cents / 100)
export const maxGalleryImages = 12
export type GalleryImage = { src: string; label: string; colour: boolean }
/** Product gallery order shared by web and mobile: cover, the selected colour's photo, then the extra photos (duplicates dropped). */
export function productGallery(product: Pick<Product, 'originalImage' | 'gallery'>, variant?: Pick<Variant, 'color' | 'image'>): GalleryImage[] {
  const items: GalleryImage[] = []
  const add = (src: string | undefined, label: string, colour = false) => { if (src && !items.some(item => item.src === src)) items.push({ src, label, colour }) }
  add(product.originalImage, 'Ürün görseli')
  add(variant?.image, `${variant?.color || 'Seçili renk'} rengi`, true)
  product.gallery?.forEach((src, index) => add(src, `Ek görsel ${index + 1}`))
  return items
}
