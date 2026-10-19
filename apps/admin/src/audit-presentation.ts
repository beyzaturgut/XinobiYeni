// Presentation only: labels describe attempts, not business completion.
export const auditAreas:Record<string,string>={catalog:'Katalog',pricing:'Fiyat',content:'İçerik',media:'Medya',orders:'Siparişler',quotes:'Teklifler',ai:'AI',notifications:'Bildirimler',admin:'Yönetim'}
const actions:[RegExp,string][]=[
 [/^PUT local-commerce\/prices\/[^/]+$/,'Ürün fiyatı güncelleme'],
 [/^PUT local-commerce\/products\/[^/]+$/,'Ürün bilgilerini kaydetme'],
 [/^DELETE local-commerce\/products\/[^/]+$/,'Ürün silme'],
 [/^POST local-commerce\/categories$/,'Kategori oluşturma'],
 [/^DELETE local-commerce\/categories\/[^/]+$/,'Kategori silme'],
 [/^PUT local-commerce\/content$/,'Mağaza içeriğini güncelleme'],
 [/^POST local-commerce\/announcements$/,'Duyuru oluşturma'],
 [/^DELETE local-commerce\/announcements\/[^/]+$/,'Duyuru silme'],
 [/^POST local-commerce\/media$/,'Görsel yükleme'],
 [/^POST admin\/roles$/,'Yönetici yetkisi değiştirme'],
 [/^POST admin\/invitations$/,'Yönetici daveti oluşturma'],
 [/^POST local-commerce\/reviews\/[^/]+\/moderation$/,'Ürün değerlendirmesini inceleme'],
 [/^POST local-commerce\/quotes\/[^/]+\/status$/,'Teklif durumunu güncelleme'],
 [/^POST local-commerce\/quotes\/[^/]+\/offer$/,'Teklif hazırlama'],
 [/^POST local-commerce\/quotes\/[^/]+\/messages$/,'Teklif mesajı gönderme'],
 [/^POST local-commerce\/orders\/[^/]+\/status$/,'Sipariş durumunu güncelleme'],
 [/^POST local-commerce\/orders\/[^/]+\/shipment$/,'Kargo bilgilerini güncelleme'],
 [/^POST local-commerce\/orders\/[^/]+\/requests\/[^/]+$/,'İptal / iade talebini değerlendirme'],
]
export function auditAction(action:string):string{
 const normalized=action.replace(/^(\w+) \/?(?:api\/v1\/)?/,'$1 ')
 return actions.find(([pattern])=>pattern.test(normalized))?.[1]??'Diğer yönetim işlemi'
}
export function auditResult(status:number):string{
 const known:Record<number,string>={200:'Başarılı',201:'Başarılı',202:'İşleme alındı',204:'Başarılı',206:'Kısmi yanıt',207:'Çoklu işlem sonucu',400:'İşlem gerçekleştirilemedi',401:'Oturum gerekli',403:'Yetki reddedildi',404:'Kayıt veya işlem bulunamadı',408:'İstek zaman aşımına uğradı',409:'İşlem çakışması',422:'Bilgiler doğrulanamadı',429:'Çok fazla istek',503:'Servis kullanılamıyor',504:'Servis yanıtı zaman aşımına uğradı'}
 if(known[status])return known[status]
 if(status>=100&&status<200)return 'Bilgilendirme yanıtı'
 if(status>=200&&status<300)return 'Başarılı'
 if(status>=300&&status<400)return 'Yönlendirme'
 if(status>=400&&status<500)return 'İstek gerçekleştirilemedi'
 if(status>=500&&status<600)return 'Sunucu hatası'
 return 'Sonuç bilgisi yok'
}
export function auditDate(value:string):string{
 const date=new Date(value)
 return Number.isNaN(date.getTime())?'Tarih bilgisi geçersiz':new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(date)
}
