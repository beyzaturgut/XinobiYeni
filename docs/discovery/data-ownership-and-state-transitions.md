# Faz01 — Veri sahipliği ve durum geçişleri

Durum: İş sahibi kararı bekleyen taslak · Son güncelleme: 30.09.2026

Bu belge D02, D03 ve D07 kararlarını toplamak için hazırlanmıştır. Kaynak belgelerde açıkça belirtilmeyen hiçbir sahiplik veya geçiş onaylanmış kabul edilmez. `Öneri` değerleri teknik başlangıç noktasıdır; Xinobi iş sahibi kararı değildir.

## 1. Alan bazlı veri sahipliği

| Veri/alan | Hedef platformdaki kullanım | Aday ana kayıt | Diğer sistem yönü | Çakışma önerisi | Karar sahibi | Durum |
|---|---|---|---|---|---|---|
| Ürün kimliği, ad, açıklama | Web, mobil, panel, kanal yayını | Merkezi platform / Mikro | D02 ile belirlenecek | Tek yazar; dış kimlik `ExternalMapping` ile | Operasyon + Mikro sahibi | D02 bekliyor |
| Kategori ve marka | Gezinme, SEO, kanal eşleme | Merkezi platform / Mikro | D02 ile belirlenecek | Kanal kategorisi yerel kategori yerine geçmez | Operasyon + içerik | D02 bekliyor |
| Varyant, SKU, barkod | Görsel, fiyat, stok, tasarım ve sipariş bağı | Merkezi platform / Mikro | D02 ile belirlenecek | `variantId` platform içinde değişmez; dış ID ayrı eşlenir | Operasyon + Mikro sahibi | D02 bekliyor |
| Ürün/varyant görselleri | Web, mobil, panel, editör | Merkezi platform + nesne deposu | Kanallara yayın | Dosya SQL'e gömülmez; sürümlü referans/checksum | İçerik + operasyon | Teknik ilke hazır, sahip bekliyor |
| Liste fiyatı ve vergi bileşeni | Sunucu fiyat hesabı | Merkezi platform / Mikro | D02 ile belirlenecek | Aynı alanı iki sistem bağımsız yazamaz | Finans + operasyon | D02 bekliyor |
| Kanal fiyatı | Web ve her pazaryeri için fiyat | Merkezi platform önerisi | Kanala giden, gerekirse kanaldan okunan | Kanal+varyant+geçerlilik tekil ve sürümlü | Satış + operasyon | D02 bekliyor |
| Kampanya/kupon | Checkout fiyat hesabı | Merkezi platform önerisi | Pazaryeri kampanyası ayrı eşlenir | Sunucu tek hesaplama otoritesi; öncelik D03 | Satış + pazarlama | D02/D03 bekliyor |
| Depo | Stok konumu ve sevkiyat | Merkezi platform / Mikro | D02 ile belirlenecek | Dış depo kodu ayrı eşlenir | Operasyon + Mikro sahibi | D02 bekliyor |
| Fiziksel ve kullanılabilir stok | Listeleme ve checkout kontrolü | Merkezi platform / Mikro | D02 ile belirlenecek | Hareket defteri + atomik rezervasyon; mutabakat gerekir | Operasyon + Mikro sahibi | D02/D03 bekliyor |
| Müşteri/cari | Hesap, adres, fatura ve Mikro aktarımı | Platform müşteri hesabı; cari yönü açık | Mikro yönü D02/D06 | Kişisel veri alan bazlı ve en az yetkiyle | Satış + muhasebe + hukuk | D02/D10 bekliyor |
| Web/mobil siparişi | Satış yaşam döngüsü | Merkezi platform önerisi | Mikro ve kanallara gerektiği kadar aktarım | Sipariş satırı satış anı snapshot'ı | Satış + operasyon | D03 bekliyor |
| Pazaryeri siparişi | Merkezi operasyon | Kaynak kanal olayı + yerel sipariş kaydı | Kanaldan içeri; durumlar çift yönlü olabilir | `(channel, externalOrderId)` benzersiz | Operasyon + kanal sahipleri | D03/D06 bekliyor |
| Ödeme/tahsilat | Checkout ve mutabakat | Ödeme sağlayıcı sonucu + yerel kayıt | Sağlayıcıdan doğrulanmış olay/durum sorgusu | İşlem ID ve idempotency tekil; kart verisi tutulmaz | Finans + satış | D03/D05 bekliyor |
| Fatura | Muhasebe ve müşteri görünümü | Mikro / başka sağlayıcı | D06 ile belirlenecek | Yerelde dış referans ve değişmez belge metadata'sı | Muhasebe | D06 bekliyor |
| Kargo/takip | Sevkiyat ve müşteri bildirimi | Kargo sağlayıcı + yerel shipment | Sağlayıcıyla çift yönlü durum | Sağlayıcı olay ID'si tekrar güvenli | Operasyon | D03/D05 bekliyor |
| İptal/iade | Sipariş, ödeme, stok ve muhasebe etkisi | Merkezi süreç kaydı önerisi | Sağlayıcı/Mikro/kanala olay | Talep ile sonuç ayrı; yetkili gerekçe ve audit zorunlu | Satış + operasyon + muhasebe | D03 bekliyor |
| Tasarım ve baskı çıktısı | Kişiselleştirme ve üretim | Merkezi platform + nesne deposu | Siparişe sürüm referansı | Siparişte `DesignVersion` değişmez | Ürün + üretim | D04 bekliyor |
| Kurumsal teklif | Talep, revizyon, onay, dönüşüm | Merkezi platform önerisi | E-posta/bildirim dışarı | Teklif talebi otomatik ücretli sipariş değildir | Kurumsal satış | D07 bekliyor |

## 2. Sipariş ve ödeme için önerilen durum sözlüğü

Bu bölüm kaynak analizdeki akışı normalize eder. Nihai adlar, süreler ve geçiş yetkileri D03 kararıyla kesinleşir.

### Sipariş

| Durum | Anlam | İzin verilen sonraki durum önerisi | Açık karar |
|---|---|---|---|
| `PendingPayment` | Sipariş taslağı ve/veya ödeme girişimi var | `Confirmed`, `Cancelled`, `Expired` | Siparişin hangi anda oluştuğu; rezervasyon süresi |
| `Confirmed` | Ödeme/havale kuralına göre satış doğrulandı | `Preparing`, `CancellationRequested` | Havale operatör onayı ve stok kesinleştirme anı |
| `Preparing` | Operasyon/üretim hazırlıyor | `Shipped`, `CancellationRequested` | Kişiselleştirilmiş üründe iptal sınırı |
| `Shipped` | Kargo sağlayıcısına teslim edildi | `Completed`, `ReturnRequested` | Parçalı sevkiyat ve teslim kaynağı |
| `Completed` | Teslim/iş kuralı tamamlandı | `ReturnRequested` | Otomatik tamamlama süresi |
| `CancellationRequested` | Müşteri veya operatör iptal talebi | `Cancelled`, önceki geçerli durum | Onaylayan rol ve ödeme/stok etkisi |
| `Cancelled` | İptal sonuçlandı | — | Kısmi iptal ve dış kanal eşlemesi |
| `ReturnRequested` | İade talebi açıldı | `ReturnApproved`, `ReturnRejected` | Süre, gerekçe, kargo ve inceleme |
| `ReturnApproved` | İade kabul edildi | `Returned` | Para iadesi ve stok kabul sırası |
| `ReturnRejected` | İade reddedildi | — | İtiraz/yeniden değerlendirme |
| `Returned` | İade ve gerekli mutabakat tamamlandı | — | Muhasebe kapanış ölçütü |
| `Expired` | Ödeme/rezervasyon süresi doldu | — | Süre ve yeniden checkout davranışı |

### Ödeme girişimi

| Durum | Anlam | Tekrar güvenliği |
|---|---|---|
| `Created` | Yerel ödeme girişimi oluşturuldu | Checkout idempotency anahtarı aynı sonucu döndürür |
| `Pending` | Sağlayıcı veya havale doğrulaması bekleniyor | Durum sorgusu yeni tahsilat yaratmaz |
| `Authorized` | Sağlayıcı yetkilendirdi, kesinleştirme açık olabilir | Sağlayıcı işlem ID tekil |
| `Succeeded` | Ödeme doğrulandı | Tekrar webhook aynı kaydı günceller |
| `Failed` | Başarısız sonuç | Yeni deneme ayrı attempt kimliği alır |
| `Cancelled` | Girişim iptal edildi | Son durum geriye çevrilmez |
| `RefundPending` | İade sağlayıcıda bekliyor | İade işlem ID/idempotency anahtarı tekil |
| `Refunded` | İade doğrulandı | Tekrar callback ikinci iade üretmez |

Sipariş ile ödeme aynı durum alanında tutulmaz. Bir siparişin birden çok ödeme girişimi olabilir; yalnız doğrulanmış ve benzersiz sağlayıcı işlemi sipariş geçişini tetikler.

## 3. Stok rezervasyonu için önerilen durumlar

| Durum | Anlam | Değişmez |
|---|---|---|
| `Active` | Varyant/depo/adet belirli süre ayrıldı | Aynı checkout tekrarında ikinci rezervasyon oluşmaz |
| `Committed` | Sipariş kesinleşti ve stok hareketine bağlandı | Bir kez kesinleştirilir |
| `Released` | Başarısız/iptal ödeme nedeniyle bırakıldı | Kullanılabilir stok bir kez geri eklenir |
| `Expired` | D03 süresi doldu | Worker tekrar çalışsa da ikinci salım olmaz |

Karar bekleyenler: rezervasyonun hangi ödeme yöntemlerinde açılacağı, süresi, eksi stok, depo seçimi ve kişiselleştirilmiş üründeki üretim rezervasyonu.

## 4. Kurumsal teklif için önerilen durumlar

| Durum | Anlam | İzin verilen sonraki durum önerisi |
|---|---|---|
| `Submitted` | Müşteri talebi iletti | `UnderReview`, `Cancelled` |
| `UnderReview` | Satış sorumlusu inceliyor | `OfferSent`, `Rejected`, `NeedsInformation` |
| `NeedsInformation` | Müşteriden ek bilgi bekleniyor | `UnderReview`, `Cancelled` |
| `OfferSent` | Sürümlü teklif gönderildi | `Accepted`, `Rejected`, `Expired`, yeni revizyon |
| `Accepted` | Belirli teklif sürümü kabul edildi | `ConvertedToOrder` |
| `Rejected` | Teklif/talep reddedildi | — |
| `Expired` | Geçerlilik süresi doldu | yeni revizyon/talep D07 ile |
| `Cancelled` | Başvuru sahibi veya yetkili iptal etti | — |
| `ConvertedToOrder` | Kabul edilen sürüm tek siparişe bağlandı | — |

`Accepted` tek başına ödeme veya sipariş yaratmaz. Dönüşüm yöntemi, fiyat/vergi/kargo anı ve yetkili onay D07 ile kararlaştırılır; aynı teklif sürümü ikinci kez siparişe dönüşemez.

## 5. Dış sistem durum eşleme kuralı

- Mikro, Trendyol, Hepsiburada, N11, ödeme ve kargo durum kodları yerel enum değerleriymiş gibi doğrudan saklanmaz.
- Ham dış kod, dış olay kimliği, alınma zamanı ve adapter sürümü korunur; yerel karşılık sürümlü eşleme ile üretilir.
- Bilinmeyen dış durum sessizce `Completed` veya `Cancelled` yapılmaz; inceleme kuyruğuna alınır.
- Geç gelen olay daha ileri bir yerel durumu geriye götüremez; izinli geçiş ve olay zamanı birlikte doğrulanır.
- Manuel düzeltme rol, gerekçe ve `AuditLog` gerektirir.

## 6. İş sahibinden kapanması gereken kararlar

| Karar | Gerekli yanıt | Etkilenen uygulama işi |
|---|---|---|
| D02-1 | Ürün, varyant, SKU/barkod, kategori ve görsel ana kaydı | Katalog migration ve yönetim paneli |
| D02-2 | Liste/kanal fiyatı, vergi, kampanya ve öncelik sahibi | Fiyat şeması ve hesaplama servisi |
| D02-3 | Depo, fiziksel/kullanılabilir stok ve Mikro aktarım yönü | Stok defteri, rezervasyon ve senkronizasyon |
| D02-4 | Müşteri/cari ve fatura alanlarının Mikro yönü | Cari/fatura adapterı ve KVKK sınırı |
| D03-1 | Siparişin oluşma/kesinleşme anı; kart ve havale farkı | Checkout transaction sınırı |
| D03-2 | Rezervasyon süresi, eksi stok ve depo seçimi | Stok eşzamanlılık kuralları |
| D03-3 | İptal/iade/kargo geçişleri, roller ve zaman sınırları | Order state machine ve panel aksiyonları |
| D03-4 | Parçalı sevkiyat, kısmi iptal/iade ve para iadesi | Shipment/Return/Refund modeli |
| D07-1 | Teklif revizyon, geçerlilik, kabul ve fiyatlandırma | Quote yaşam döngüsü |
| D07-2 | Kabul edilen teklifin sipariş/ödeme akışına dönüşümü | Tekil `CorporateOrderLink` ve checkout |

## 7. Kabul koşulu

Belge ancak ilgili Xinobi iş sahipleri karar satırlarını tarih ve kanıtla kapattığında fiziksel SQL şemasına bağlayıcı girdi olur. O zamana kadar burada önerilen durum adları API/DB migration kabulü sayılmaz; yalnız sözleşme ve test tasarımına temel oluşturur.
