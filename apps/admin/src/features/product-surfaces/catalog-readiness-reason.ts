// Presentation only: the authoritative resolver state and eligibility policy are unchanged.
export type ReadinessReasonInput={state:string;message:string|null;active?:boolean;personalizable?:boolean|null}
export function readinessReason(row:ReadinessReasonInput):string{
 if(row.state!=='error')return row.message||''
 const message=row.message||''
 if(row.active===false)return 'Ürün katalogda pasif; kişiselleştirme kapalı.'
 if(message.includes('kişiselleştirmeye uygun değil')){
  if(row.personalizable===false)return 'Katalogda personalizable=false; kişiselleştirme kapalı.'
  if(row.personalizable==null)return 'Kişiselleştirme uygunluğu tanımlı değil; mevcut katalog politikası izin vermiyor.'
  return 'Tam ürün/varyant eşleşmesi veya uygunluk doğrulanamadı.'
 }
 if(message.includes('Input image exceeds pixel limit'))return 'Kaynak görsel 20.000.000 piksel sınırını aşıyor.'
 if(message.includes('önizleme boyut sınırını'))return 'Kaynak boyutu sınır dışı: en fazla 6000 px/kenar ve 20.000.000 piksel.'
 if(message.includes('dosya sınırını'))return 'Kaynak dosyası boş veya 20 MiB sınırını aşıyor.'
 if(message.includes('yerel kaynak görseli yok'))return 'Varyantın kaynak görseli eksik veya izin verilen yerel PNG/JPG/WebP yolu değil.'
 if(message.includes('ENOENT'))return 'Gerekli kaynak veya maske/koruma dosyası bulunamadı; dosya eşleşmesi kontrol edilmeli.'
 if(/unsupported image format|corrupt|decode|invalid image/i.test(message))return 'Görsel çözümlenemedi veya geçerli desteklenen biçimde değil.'
 return message||'Doğrulama tamamlanamadı; kaynak ve kabul kaydı kontrol edilmeli.'
}
