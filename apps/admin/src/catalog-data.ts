export type Variant = { id: string; sku: string; color: string; hex?: string; stock: number; image: string }
export type Product = { id: string; name: string; category: string; active: boolean; description: string; seoTitle: string; personalizable?: boolean | null; originalImage?: string; gallery?: string[]; specs?: { name: string; value: string }[] | null; variants: Variant[] }
export const categories = ['Çay makineleri', 'Kahve makineleri', 'Hava temizleme', 'Pişirme teknolojileri']
export const initialProducts: Product[] = []
