import { parseDecimal } from './pricing-model.ts'
export type QuoteLine = { id: string; variantId: string; label: string; sku: string; quantity: number; unitCents: number }
export type QuoteRevision = { number: number; createdAt: string; validUntil: string; delivery: string; note: string; lines: QuoteLine[] }
export type Quote = { id: string; company: string; contact: string; status: string; requestedDelivery: string; personalization: string; revisions: QuoteRevision[] }
export const initialQuotes: Quote[] = [
 { id:'DEMO-Q1001',company:'Örnek Tasarım Ofisi',contact:'Örnek yetkili A',status:'İnceleniyor',requestedDelivery:'2026-11-15',personalization:'Örnek logo talebi; baskı onayı bekliyor',revisions:[{number:1,createdAt:'2026-10-03T08:00:00Z',validUntil:'2026-10-31',delivery:'Örnek teslimat koşulu; teyit bekliyor',note:'İlk örnek fiyat çalışması',lines:[{id:'DEMO-QL1',variantId:'DEMO-V101-B',label:'Çay Makinesi 101 · Lacivert',sku:'DEMO-TEA-BLUE',quantity:20,unitCents:240000}]}]},
 { id:'DEMO-Q1002',company:'Örnek Kurumsal Firma',contact:'Örnek yetkili B',status:'Bilgi bekliyor',requestedDelivery:'2026-12-01',personalization:'Ürün rengi ve adet teyidi bekleniyor',revisions:[{number:1,createdAt:'2026-10-02T09:00:00Z',validUntil:'2026-10-20',delivery:'Örnek koşul; firma teyidi bekliyor',note:'Örnek ilk değerlendirme',lines:[{id:'DEMO-QL2',variantId:'DEMO-V102-R',label:'Kahve Makinesi 101 · Kırmızı',sku:'DEMO-COFFEE-RED',quantity:10,unitCents:280000}]}]},
]
export function validateRevision(revision: QuoteRevision): string {
 if(!revision.lines.length)return 'Teklifte en az bir satır olmalı.'
 if(revision.lines.some(line=>!line.variantId||!Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>10000||!Number.isSafeInteger(line.unitCents)||line.unitCents<=0))return 'Satır adedi 1–10000 arasında tam sayı, birim fiyat pozitif ve en fazla iki ondalıklı olmalı.'
 if(!Number.isSafeInteger(quoteTotal(revision)))return 'Teklif toplamı desteklenen tutar sınırını aşıyor.'
 if(!/^\d{4}-\d{2}-\d{2}$/.test(revision.validUntil)||Number.isNaN(Date.parse(revision.validUntil))||new Date(revision.validUntil).toISOString().slice(0,10)!==revision.validUntil)return 'Geçerli teklif bitiş tarihi girin.'
 if(!revision.delivery.trim())return 'Teslimat koşulu girin.'
 if(!revision.note.trim())return 'Revizyon gerekçesi girin.'
 return ''
}
export function quoteTotal(revision: QuoteRevision){return revision.lines.reduce((sum,line)=>sum+line.quantity*line.unitCents,0)}
export function revisionPrice(value:string){return parseDecimal(value) ?? NaN}
export function appendRevision(quote:Quote,base:number,revision:QuoteRevision):{quote?:Quote;error?:string}{
 const latest=quote.revisions.at(-1)!
 if(latest.number!==base)return {error:'Teklif sürümü değişti; güncel sürümü yeniden açın.'}
 const error=validateRevision(revision);if(error)return {error}
 return {quote:{...quote,revisions:[...quote.revisions,structuredClone({...revision,number:base+1,createdAt:new Date().toISOString()})]}}
}
