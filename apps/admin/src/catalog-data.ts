export type Variant = { id: string; sku: string; color: string; hex?: string; stock: number; image: string }
export type Product = { id: string; name: string; category: string; active: boolean; description: string; seoTitle: string; personalizable?: boolean | null; originalImage?: string; variants: Variant[] }
export const categories = ['Çay makineleri', 'Kahve makineleri', 'Hava temizleme', 'Pişirme teknolojileri']
export const initialProducts: Product[] = [
  { id: 'DEMO-P101', name: 'Çay Makinesi 101', category: categories[0], active: true, description: 'Örnek ürün açıklaması', seoTitle: 'Çay Makinesi 101 | Xinobi', variants: [
    { id: 'DEMO-V101-B', sku: 'DEMO-TEA-BLUE', color: 'Lacivert', stock: 8, image: '/assets/products/tea-maker-101-blue.webp' },
    { id: 'DEMO-V101-R', sku: 'DEMO-TEA-RED', color: 'Kırmızı', stock: 0, image: '/assets/products/tea-maker-101-red.webp' },
  ] },
  { id: 'DEMO-P102', name: 'Kahve Makinesi 101', category: categories[1], active: true, description: '', seoTitle: '', variants: [{ id: 'DEMO-V102-R', sku: 'DEMO-COFFEE-RED', color: 'Kırmızı', stock: 4, image: '/assets/products/coffee-maker-101-red.webp' }] },
  { id: 'DEMO-P103', name: 'Hava Temizleme 101', category: categories[2], active: false, description: '', seoTitle: '', variants: [{ id: 'DEMO-V103-W', sku: 'DEMO-AIR-WHITE', color: 'Beyaz', stock: 0, image: '/assets/products/air-purifier-101.webp' }] },
]
