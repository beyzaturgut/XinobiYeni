export const providers = ['Mikro', 'Trendyol', 'Hepsiburada', 'N11'] as const
export type Provider = typeof providers[number]
export type Mapping = { id: string; provider: Provider; variantId: string; externalId: string }
export const initialMappings: Mapping[] = [
 {id:'DEMO-MAP1',provider:'Mikro',variantId:'DEMO-V101-B',externalId:'DEMO-MIKRO-TEA'},
 {id:'DEMO-MAP2',provider:'Trendyol',variantId:'DEMO-V101-B',externalId:'DEMO-TY-TEA'},
 {id:'DEMO-MAP3',provider:'Hepsiburada',variantId:'DEMO-V102-R',externalId:'DEMO-HB-COFFEE'},
]
export type SyncJob = {id:string;provider:Provider;entity:string;operation:string;status:'queued'|'failed'|'unknown'|'dead-letter'|'succeeded';key:string;attempts:number;error:string;time:string}
export const initialJobs:SyncJob[]=[
 {id:'DEMO-SYNC1',provider:'Mikro',entity:'DEMO-1001',operation:'Sipariş aktarımı',status:'unknown',key:'DEMO:order:1001:v1:export',attempts:1,error:'Yanıt zaman aşımı; dış işlem sonucu bilinmiyor',time:'03.10.2026 10:00'},
 {id:'DEMO-SYNC2',provider:'Mikro',entity:'DEMO-V101-B',operation:'Stok sorgulama',status:'failed',key:'DEMO:stock:V101-B:checkpoint1',attempts:2,error:'Örnek bağlantı hatası',time:'03.10.2026 09:30'},
 {id:'DEMO-SYNC3',provider:'Trendyol',entity:'DEMO-V101-B',operation:'Ürün eşlemesi',status:'dead-letter',key:'DEMO:TY:V101-B:v1:map',attempts:3,error:'Örnek kategori eşlemesi eksik',time:'03.10.2026 09:00'},
 {id:'DEMO-SYNC4',provider:'Hepsiburada',entity:'DEMO-V102-R',operation:'Sipariş sorgulama',status:'queued',key:'DEMO:HB:orders:checkpoint1',attempts:0,error:'',time:'03.10.2026 08:30'},
 {id:'DEMO-SYNC5',provider:'N11',entity:'DEMO-V101-R',operation:'Örnek stok karşılaştırma',status:'succeeded',key:'DEMO:N11:V101-R:checkpoint1',attempts:1,error:'',time:'03.10.2026 08:00'},
]
export function validateMapping(mapping:Mapping,mappings:Mapping[],variantIds:string[]):string{
 if(!variantIds.includes(mapping.variantId))return 'Geçerli katalog varyantı seçin.'
 if(!mapping.externalId.trim())return 'Dış sistem kimliği zorunludur.'
 if(mappings.some(item=>item.id!==mapping.id&&item.provider===mapping.provider&&(item.variantId===mapping.variantId||item.externalId.trim()===mapping.externalId.trim())))return 'Bu sağlayıcıda varyant veya dış kimlik zaten eşlenmiş.'
 return ''
}
export function retryPlan(job:SyncJob):string{
 if(job.status==='unknown')return 'Önce sağlayıcı işlem durumu ve dış referans sorgulanmalı. Sonuç doğrulanmadan yeniden aktarım başlatılmaz.'
 if(job.status==='dead-letter')return 'Kalıcı veri/eşleme hatası düzeltilmeli; ardından aynı iş kimliğiyle yetkili yeniden deneme planlanmalı.'
 if(job.status==='failed')return 'Hata sınıfı ve sağlayıcı sonucu kontrol edilmeli; uygun durumda aynı işlem anahtarıyla sınırlı yeniden deneme planlanmalı.'
 return job.status==='queued'?'İş zaten bekliyor; yeni iş oluşturulmaz.':'Örnek iş tamamlandı; aynı işlem yeniden üretilmez.'
}
