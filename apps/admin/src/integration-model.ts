export const providers = ['Mikro', 'Trendyol', 'Hepsiburada', 'N11'] as const
export type Provider = typeof providers[number]
export type Mapping = { id: string; provider: Provider; variantId: string; externalId: string }
export const initialMappings: Mapping[] = []
export type SyncJob = {id:string;provider:Provider;entity:string;operation:string;status:'queued'|'failed'|'unknown'|'dead-letter'|'succeeded';key:string;attempts:number;error:string;time:string}
export const initialJobs:SyncJob[]=[]
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
