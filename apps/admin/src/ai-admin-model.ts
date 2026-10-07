export type AiPolicy = { revision:number; dailyLimit:number; alternativeCount:number; prompt:string; reason:string; createdAt:string }
export const initialPolicies:AiPolicy[]=[{revision:1,dailyLimit:5,alternativeCount:4,prompt:'Örnek şablon: ürün ihtiyacını açıkla; yalnız onaylı kaynakları kullan. Doğrulanmamış fiyat, stok veya teslimat sözü verme.',reason:'İlk demo politika; gerçek D08 onayı değildir.',createdAt:'2026-10-03T08:00:00Z'}]
export function validateAiPolicy(policy:AiPolicy):string{
 if(!Number.isInteger(policy.dailyLimit)||policy.dailyLimit<1||policy.dailyLimit>1000)return 'Günlük demo limit 1–1000 arasında tam sayı olmalı.'
 if(policy.alternativeCount!==4)return 'Bu prototipte Analiz2 hedefi dört adaydır; gerçek politika D08 ile kesinleşir.'
 if(policy.prompt.trim().length<10||policy.prompt.length>2000)return 'İstem şablonu 10–2000 karakter olmalı.'
 if(!policy.reason.trim())return 'Politika revizyon gerekçesi girin.'
 return ''
}
export const knowledgeSources=[
 {id:'DEMO-K1',title:'Örnek katalog bilgisi',version:1,status:'published',approved:true,expires:'2026-10-31',source:'DEMO-P101'},
 {id:'DEMO-K2',title:'Örnek teslimat taslağı',version:1,status:'draft',approved:false,expires:'2026-12-31',source:'DEMO-CONTENT1'},
 {id:'DEMO-K3',title:'Örnek geçmiş kampanya',version:2,status:'published',approved:true,expires:'2026-09-30',source:'DEMO-CAMPAIGN1'},
]
export function sourceEligibility(source:typeof knowledgeSources[number],date:string):string{
 if(source.status!=='published')return 'Taslak; yanıta alınamaz'
 if(!source.approved)return 'Onay eksik; yanıta alınamaz'
 if(date>source.expires)return 'Süresi dolmuş; yanıta alınamaz'
 return 'Örnek kaynak uygun; gerçek yayın onayı yok'
}
export const usageJobs=[
 {id:'DEMO-AI1',feature:'Görsel üretimi',status:'Örnek tamamlandı',units:4,estimated:'Örnek tahmin var',billed:null,error:''},
 {id:'DEMO-AI2',feature:'Görsel üretimi',status:'Sonuç belirsiz',units:4,estimated:'Örnek tahmin var',billed:null,error:'Sağlayıcı yanıtı bilinmiyor; iş durumu sorgulanmalı'},
 {id:'DEMO-AI3',feature:'Asistan yanıtı',status:'İçerik reddi',units:0,estimated:'Tanımlanmadı',billed:null,error:'Örnek içerik politikası reddi'},
]
