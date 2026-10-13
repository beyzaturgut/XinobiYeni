export type Campaign = { id: string; name: string; kind: 'percent' | 'fixed'; value: string; channel: string; variantId: string; start: string; end: string; minimum: string; coupon: string; enabled: boolean }
export const initialPrices: Record<string, number> = {}
export const initialCampaigns: Campaign[] = [{ id: 'DEMO-C1', name: 'Örnek yüzde 10', kind: 'percent', value: '10', channel: 'Web', variantId: '', start: '2026-10-01', end: '2026-10-31', minimum: '1000', coupon: 'DEMO10', enabled: true }]
export function parseDecimal(value: string): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null
  const [whole, decimal = ''] = normalized.split('.')
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'))
}
export function validateCampaign(campaign: Campaign): string {
  const amount = parseDecimal(campaign.value), minimum = parseDecimal(campaign.minimum)
  if (!campaign.name.trim()) return 'Kampanya adı zorunludur.'
  if (amount === null || amount <= 0 || (campaign.kind === 'percent' && amount > 10000)) return 'İndirim pozitif olmalı; yüzde en fazla 100, ondalık en fazla iki basamak olabilir.'
  if (minimum === null) return 'Minimum tutar sıfır veya pozitif, en fazla iki ondalıklı olmalı.'
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  if (!validDate(campaign.start) || !validDate(campaign.end) || campaign.start > campaign.end) return 'Başlangıç ve bitiş tarihlerini doğru sırayla girin.'
  return ''
}
export function previewPrice(price: number | undefined, quantity: number, campaign: Campaign | undefined, context: { date: string; channel: string; variantId: string; coupon: string }) {
  if (price === undefined) return { error: 'Seçili varyantın örnek fiyatı tanımlı değil.' }
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return { error: 'Adet 1 ile 99 arasında tam sayı olmalı.' }
  const subtotal = price * quantity
  if (!campaign) return { subtotal, discount: 0, total: subtotal, reason: 'Kampanya seçilmedi.' }
  const error = validateCampaign(campaign)
  if (error) return { error }
  const reason = !campaign.enabled ? 'Kampanya demo taslağı pasif.' : context.date < campaign.start || context.date > campaign.end ? 'Seçili tarih kampanya dışında.' : context.channel !== campaign.channel ? 'Satış kanalı uygun değil.' : campaign.variantId && context.variantId !== campaign.variantId ? 'Varyant kampanya kapsamında değil.' : subtotal < parseDecimal(campaign.minimum)! ? 'Minimum tutar sağlanmadı.' : campaign.coupon && context.coupon.trim().toLocaleUpperCase('tr-TR') !== campaign.coupon.trim().toLocaleUpperCase('tr-TR') ? 'Kupon kodu uygun değil.' : ''
  if (reason) return { subtotal, discount: 0, total: subtotal, reason }
  const value = parseDecimal(campaign.value)!
  const discount = Math.min(subtotal, campaign.kind === 'fixed' ? value : Number((BigInt(subtotal) * BigInt(value) + 5000n) / 10000n))
  return { subtotal, discount, total: subtotal - discount, reason: 'Seçili örnek kampanya uygulandı.' }
}
