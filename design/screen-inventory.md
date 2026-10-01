# Faz02 ekran envanteri

Sürüm: `0.1.0` · Durum: Envanter hazır, tasarım teslimleri aşamalı

| ID | Yüzey / ekran | Rol ve giriş | Ana eylem | Temel veri | Sonraki faz | Tasarım durumu |
|---|---|---|---|---|---|---|
| WEB-001 | Ana sayfa | Herkes / doğrudan | Kategori ve ürüne git | Kategori, ürün, medya, içerik | 02,04 | Masaüstü ve 500 px Chrome görsel QA geçti; 390 px gerçek cihaz/interaction QA bekliyor |
| WEB-002 | Kategori/liste | Herkes / ana menü, arama | Filtrele, ürüne git | Kategori, ürün, varyant, fiyat, stok | 02,04 | 500 px Chrome görsel QA ve taşma düzeltmesi geçti; D02/API/interaction/gerçek cihaz QA bekliyor |
| WEB-003 | Arama/karşılaştırma | Herkes / header | Ürün bul, en fazla üç ürünü karşılaştır | Arama indeksi, ürün, özellik | 02,04 | 500 px Chrome görsel QA geçti; API/interaction/gerçek cihaz QA bekliyor |
| WEB-004 | Ürün detay/varyant | Herkes / liste | Varyant seç, sepete ekle | Ürün, varyant, medya, fiyat, stok | 02,04,05 | Masaüstü Chrome görsel QA geçti; D02/API/mobil/interaction QA bekliyor |
| WEB-005 | Basit kişiselleştirme | Müşteri / ürün | Metin/stil/renk önizle, demo taslağı hazırla | Baskı alanı, varlık, fiyat farkı | 02,06 | 500 px Chrome görsel QA geçti; D04/API/interaction/gerçek cihaz QA bekliyor |
| WEB-006 | Gelişmiş editör | Müşteri / ürün, tasarımlar | Tasarla, katmanları yönet, demo taslak hazırla | DesignDocument, sürüm, baskı alanı | 02,06 | 500 px Chrome görsel QA geçti; D04/API/interaction/gerçek cihaz QA bekliyor |
| WEB-007 | Favoriler | Üye / hesap, ürün | Demo listeye ekle/çıkar | Kullanıcı, ürün | 02,04 | Responsive demo saklama kabuğu hazır; kimlik/API/browser QA bekliyor |
| WEB-008 | Sepet | Misafir/üye / header | Demo satır/adet yönet, checkout sınırını gör | Sepet, varyant, fiyat, stok | 02,05 | 500 px Chrome görsel QA geçti; D02/D03/API/interaction/gerçek cihaz QA bekliyor |
| WEB-009 | Ödeme | Misafir/üye / sepet | Teslimat/yöntem kabuğunu incele | Checkout, adres, ödeme girişimi | 02,05 | 500 px Chrome görsel QA geçti; D02/D03/D05/API/interaction/gerçek cihaz QA bekliyor |
| WEB-010 | Ödeme sonucu | Müşteri / sağlayıcı dönüşü | Bekleyen/başarısız/başarılı senaryoyu gör | PaymentAttempt, Order | 02,05 | 500 px Chrome bekleyen durum görsel QA geçti; diğer durum/interaction/gerçek cihaz QA bekliyor |
| WEB-011 | Üyelik/oturum | Müşteri / header | Kayıt, giriş, parola yenile | User, consent | 02,03 | Responsive güvenli form kabuğu hazır; kimlik/D10/API/browser QA bekliyor |
| WEB-012 | Hesap/adres | Üye / hesap | Demo profil/adres durumlarını yönet | Customer, Address | 02,03 | Responsive demo kabuk hazır; D10/kimlik API/browser QA bekliyor |
| WEB-013 | Sipariş/takip | Üye / hesap | Demo sipariş ve kargo zaman çizgisini incele | Order, Shipment, history | 02,05 | Responsive senaryo kabuğu hazır; D03/kargo API/browser QA bekliyor |
| WEB-014 | İptal/iade | Üye / sipariş | Demo iptal/iade özeti hazırla | ReturnRequest, ödeme, stok | 02,05 | Responsive form kabuğu hazır; D03/D10/dosya API/browser QA bekliyor |
| WEB-015 | Kurumsal teklif | Başvuru sahibi / menü | Demo teklif özeti hazırla | Firma, ürün, adet, termin, dosya | 02,07 | Responsive form kabuğu hazır; D07/dosya API/browser QA bekliyor |
| WEB-016 | Teklif takibi | Başvuru sahibi / hesap | Demo durum/revizyon gör | QuoteRequest, history | 02,07 | Responsive sürüm/takip kabuğu hazır; D07/API/browser QA bekliyor |
| WEB-017 | AI tasarım | Müşteri / ürün, editör | Demo istem/alternatif/hata durumunu incele | AiJob, quota, asset | 02,10 | Responsive senaryo kabuğu hazır; D08/D10/sağlayıcı/browser QA bekliyor |
| WEB-018 | AI satış asistanı | Herkes / global | Demo ürün/teklif yönlendirmesi gör | Katalog, konuşma, lead | 02,10 | Responsive konuşma kabuğu hazır; D05/D08/D10/sağlayıcı/browser QA bekliyor |
| WEB-019 | Kurumsal/içerik | Herkes / footer, SEO | Marka yaklaşımını ve içerik önizlemesini oku | Page, BlogPost, SEO | 02,04 | Responsive kurumsal hikâye kabuğu hazır; CMS/içerik onayı/browser QA bekliyor |
| WEB-020 | Yasal/çerez | Herkes / footer, ilk ziyaret | Taslak belgeleri ve tercih durumlarını incele | LegalDocument, Consent | 02,04 | Responsive yasal merkez ve global tercih kabuğu hazır; D10/hukuk/persistence/browser QA bekliyor |
| ADM-001 | Dashboard | Panel rolü / giriş | Operasyon özeti | Sipariş, stok, hata, teklif | 02,03+ | Bekliyor |
| ADM-002 | Rol/denetim/ayar | Yönetici | Yetki ve audit incele | Role, Permission, AuditLog | 02,03 | Bekliyor |
| ADM-003 | Katalog/varyant/medya | Katalog rolü | Ürün yayınla | Product, Variant, Asset | 02,04 | D02 bekliyor |
| ADM-004 | Fiyat/kampanya | Ticaret rolü | Fiyat ve kural yönet | Price, Campaign, Coupon | 02,04 | D02/D03 bekliyor |
| ADM-005 | Stok/depo | Operasyon | Stok/mutabakat yönet | Inventory, Warehouse | 02,04 | D02/D03 bekliyor |
| ADM-006 | Sipariş/kargo/iade | Operasyon | Durum işlemi | Order, Shipment, Return | 02,05 | D03 bekliyor |
| ADM-007 | Teklif/toplu sipariş | Kurumsal satış | Teklif işle, dönüştür | Quote, CorporateOrderLink | 02,07 | D07 bekliyor |
| ADM-008 | Tasarım/baskı | Üretim | Dosya onayla/üret | DesignVersion, PrintOutput | 02,06 | D04 bekliyor |
| ADM-009 | CMS/SEO/bildirim | İçerik rolü | Yayınla | Page, SEO, Notification | 02,04 | D10 bekliyor |
| ADM-010 | Mikro eşleme/hata | Entegrasyon rolü | Eşle, tekrar dene | ExternalMapping, SyncJob | 02,08 | D02/D06 bekliyor |
| ADM-011 | Pazaryeri eşleme/hata | Kanal rolü | Kanal işlemi | ProviderEvent, Mapping | 02,09 | D02/D03/D06 bekliyor |
| ADM-012 | AI yönetimi | AI rolü | Prompt/kaynak/limit yönet | Prompt, Knowledge, Usage | 02,10 | D08/D10 bekliyor |
| MOB-001 | Mobil ana/katalog/ürün | iOS/Android müşteri | Keşfet, varyant seç | WEB-001–004 ortak API | 02,04,11 | Bekliyor |
| MOB-002 | Mobil editör | iOS/Android müşteri | Tasarla, kaydet | WEB-005–006 ortak API | 02,06,11 | D04/D09 bekliyor |
| MOB-003 | Mobil sepet/ödeme | iOS/Android müşteri | Siparişi tamamla | WEB-008–010 ortak API | 02,05,11 | D03/D05/D09 bekliyor |
| MOB-004 | Mobil hesap/sipariş | iOS/Android üye | Hesap ve sipariş izle | WEB-011–014 ortak API | 02,03,05,11 | D03/D09/D10 bekliyor |
| MOB-005 | Mobil teklif | iOS/Android başvuru sahibi | Talep aç, izle | WEB-015–016 ortak API | 02,07,11 | D07/D09 bekliyor |
| MOB-006 | Mobil AI/bildirim | iOS/Android müşteri | Üret, sor, bildirimi aç | WEB-017–018, Notification | 02,10,11 | D08/D09/D10 bekliyor |

Her ekran için boş, yükleniyor, başarı, hata, yetkisiz ve yeniden dene durumları ilgili yüksek doğruluk tesliminde ayrıca gösterilecektir. `Hazır` yalnız kaynak dosya, responsive uygulama ve test kanıtı olduğunda kullanılacaktır.
