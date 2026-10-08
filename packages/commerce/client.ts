export type Variant = { id: string; sku: string; color: string; hex?: string; stock: number; image: string }
export type Product = { id: string; name: string; category: string; active: boolean; description: string; seoTitle: string; personalizable?: boolean | null; originalImage?: string; gallery?: string[]; variants: Variant[] }
export type Slide = { id: number; name: string; type: 'Fotoğraf' | 'Video'; src: string; alt: string; duration: number; active: boolean }
export type Content = { slides: Slide[]; xinobiBanner: string; buttonColor: string; categoryProducts?: Record<string, string>; categoryImages?: Record<string, string>; titaniumBanner?: string | null; titaniumImage?: string | null; featuredProducts?: string[] | null }
export type Announcement = { id: string; title: string; body: string; kind: 'Haber' | 'Duyuru'; publishedAt: string }
export type CommerceState = { announcements?: Announcement[]; categories?: string[]; products: Product[]; prices: Record<string, number>; content: Content }
export const localApi = 'http://127.0.0.1:5003/api/v1/local-commerce'
export async function commerceRequest<T>(base: string, route: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${base}${route}`, {
    method, cache: 'no-store', signal: AbortSignal.timeout(10000),
    headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || `İçerik API’si hata verdi (${response.status}).`)
  }
  return response.json()
}
export async function uploadMedia(base: string, file: File) {
  const form = new FormData(); form.append('file', file)
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
