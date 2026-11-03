# Faz05 — B2C satış, müşteri hesabı ve sipariş sonrası işlemler

## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**Bu fazın işi:** SIP-TAS-02/04/05/06/08: sipariş satırı ve revizyonu, üç görselin korunması/indirilmesi, eski kayıtlar. Ticari sipariş/ödeme/kargo kapsamı değişmedi.

**03.11 SIP-TAS-04 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` (`orders.read`) siparişe bağlı desen kopyasını sunucuda sipariş/satırdan çözüyor. Baytlar değiştirilmeden, SHA-256 ve baytlardan saptanan MIME doğrulanarak `xinobi-{no}-satir-{n}-desen[-rev{r}].{uzantı}` adıyla indiriliyor. Admin Ham desen kartında kilitli “Ham deseni indir” düğmesi, 404/403 açık durumu ve servis hatasında tekrar dene var. API 506 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Canlı ortam ve SQL kabulü açık. [TST-219](../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md). Bu fazdan SIP-TAS-05/06/08 açık.

**03.11 SIP-TAS-02 uygulaması:** Sipariş satırına `Files` sözleşmesi eklendi: desen, maskelemede kullanılan ürün kaynak görseli ve giydirilmiş önizleme; her biri SHA-256, tür ve bayt ile. Ürün kaynak görseli sipariş anında yüzeyin kayıtlı kaynak özetiyle doğrulanıp siparişe kopyalanıyor. Desen konfigürasyon özetiyle eşleşmezse sipariş reddediliyor; okumada özet farklıysa dosya verilmiyor (503). Tasarım silme/düzenleme, katalog/maske değişimi, eski revizyon, tekrar istek ve yarım kopya izole fixture ile PASS. API 502 test PASS (29 atlandı); sözleşme/admin/web/Flutter analiz PASS. Gerçek SQL kabulü açık (izole SQL yok), eski siparişler geriye dönük doldurulmadı. [TST-211](../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md). Bu fazdan SIP-TAS-04/05/06/08 açık.

**03.11 SIP-TAS-01 uygulaması:** Admin sipariş detayında kişiselleştirilmiş her satır için “Sipariş tasarım detayı” alanı eklendi. Alanda sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, okunur kayıtlı yerleşim ve ayrı üç görsel kartı var. Ham desen dosya doğrulanınca önizlenir ve mevcut korumalı uçla indirilir. Ürün kaynak görseli ve giydirilmiş önizleme için açıkça “İndirme hazır değil” yazar. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Fiziksel profil/kalibrasyon/ölçüm ekranı tasarım ekranından kaldırıldı (API/veri korunur); menü “Tasarımlar”. Sipariş/kargo/iptal/iade işlemleri ve tasarımdan siparişe geçiş korundu. Sipariş penceresinde etiket kontrastı ve %200 yazı taşması da düzeltildi. Admin lint/TypeScript/derleme ve izole Chrome regresyonları PASS. [TST-207](../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md). Bu fazdan SIP-TAS-02/04/05/06/08 açık; ticari sipariş akışları değişmedi.


**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Bloke - gerçek ödeme, rezervasyon, kargo ve ticari kabul açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** Mevcut sunucu fiyatlı demo sipariş, sahiplik/revizyon ve bağımsız sipariş görseli korunur. 42bee88 siparişe tam profil kopyası/SHA ekler; gerçek tahsilat, rezervasyon veya para iadesi eklemez.

**Müşteriden / iş sahibinden beklenenler:** D03 ticaret/iptal-iade/kişiselleştirme fiyatı, vergi-fatura-kargo-havale; seçilen ödeme/kargo test erişimleri ve yasal onaylı metinler.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [TIC-01](../docs/tasks/project-closure-2026-10-30.md#tic-01) - Sunucu sepeti ve hesap birleştirmesini kur | Yapılmadı - kapanış açık | Ortak sunucu sepeti, misafir-hesap birleştirme ve iki cihaz arasındaki eşzamanlı sepet senkronu yapılmadı. |
| [TIC-02](../docs/tasks/project-closure-2026-10-30.md#tic-02) - Checkout fiyat teklifini sunucuda üret | Yapılmadı - kapanış açık | Kupon, kişiselleştirme, vergi, kargo ve geçerlilik süresini kapsayan tek sunucu checkout/quote motoru eksik. |
| [TIC-03](../docs/tasks/project-closure-2026-10-30.md#tic-03) - Stok rezervasyonu ve kesinleşmeyi atomik yap | Yapılmadı - kapanış açık | Atomik rezervasyon, süre sonu bırakma, tahsilatla kesinleştirme ve son stok yarışı iş kuralı tamamlanmadı. |
| [TIC-04](../docs/tasks/project-closure-2026-10-30.md#tic-04) - Kart ve 3DS ödeme akışını bağla | Yapılmadı - kapanış açık | Gerçek kart/3DS/taksit sağlayıcı akışı ve başarı/red/iptal/dönüş için işlem kimlikli kabul yok. |
| [TIC-05](../docs/tasks/project-closure-2026-10-30.md#tic-05) - Ödeme webhook ve mutabakatını kur | Yapılmadı - kapanış açık | Ödeme webhook imzası, olay tekilleştirme, sıra dışı bildirim ve tahsilat-sipariş mutabakatı uçtan uca eksik. |
| [TIC-06](../docs/tasks/project-closure-2026-10-30.md#tic-06) - Havale ve ödeme bekleyen siparişi tamamla | Yapılmadı - kapanış açık | Havale referansı, son tarih, finans yetkisi, tutar kontrolü ve süresi dolan rezervasyonu bırakma uygulanmalı. |
| [TIC-07](../docs/tasks/project-closure-2026-10-30.md#tic-07) - İptal ve iadeyi gerçek geri ödemeye bağla | Yapılmadı - kapanış açık | Tam/kısmi gerçek para iadesi, sağlayıcı işlem kimliği, fazla iade önleme ve stokla uzlaştırma tamamlanmadı. |
| [TIC-08](../docs/tasks/project-closure-2026-10-30.md#tic-08) - Kargo fiyatı ve gönderiyi entegre et | Yapılmadı - kapanış açık | Gerçek taşıyıcı fiyatı, desi/bölge kuralları, etiket/gönderi, takip ve yinelenen gönderi kontrolü kabul edilmedi. |
| [WEB-03](../docs/tasks/project-closure-2026-10-30.md#web-03) - Gerçek checkout ve sonuç ekranını tamamla | Yapılmadı - kapanış açık | Gerçek ödeme durumları, fatura/ücret özeti ve sağlayıcı dönüşlerinin checkout/quote üzerinden tamamlanması bekliyor. |
| [WEB-04](../docs/tasks/project-closure-2026-10-30.md#web-04) - Hesap yaşam döngüsünü gerçek e-postayla kabul et | Yapılmadı - kapanış açık | İzinli gerçek alıcıyla e-posta teslimi, çoklu sekme ve gerçek ortam uçtan uca hesap kabulü bu task için kapanmadı. |
| [WEB-05](../docs/tasks/project-closure-2026-10-30.md#web-05) - Satış sonrası ve tasarım ekranlarını doğrula | Yapılmadı - kapanış açık | Gerçek hesap ve SQL ile satış sonrası uçtan uca kabul; gerçek geri ödeme durumunun doğru gösterimi açık. |
| [ADM-04](../docs/tasks/project-closure-2026-10-30.md#adm-04) - Müşteri ve firma operasyon ekranını tamamla | Yapılmadı - kapanış açık | Firma/kurumsal profil, destek geçmişi ve tüm sunucu filtre/sayfalama alanlarının kabul matrisi kapanmadı. |
| [ADM-05](../docs/tasks/project-closure-2026-10-30.md#adm-05) - Sipariş finans ve kargo eylemlerini tamamla | Yapılmadı - kapanış açık | Gerçek tahsilat/geri ödeme/kargo sağlayıcısı sonuçları ve yinelenmeyen operasyon eylemleri eksik. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [ADM-01](../docs/tasks/project-closure-2026-10-30.md#adm-01), [CAT-02](../docs/tasks/project-closure-2026-10-30.md#cat-02), [CAT-03](../docs/tasks/project-closure-2026-10-30.md#cat-03), [SEC-01](../docs/tasks/project-closure-2026-10-30.md#sec-01), [SEC-02](../docs/tasks/project-closure-2026-10-30.md#sec-02), [KIS-03](../docs/tasks/project-closure-2026-10-30.md#kis-03), [OPS-04](../docs/tasks/project-closure-2026-10-30.md#ops-04).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Bloke — gerçek ödeme ve ticari kabul açık. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| Favoriler / sepet | Uygulandı; sepet kısmi | 9933fef, 47d8016, d2d8f8d: hesapta ortak web/mobil tasarım favorisi, tam ürün/renk/konfigürasyon/revizyon anahtarı, hedefli Kaydet/İptal, adet ve diğer satırların korunması; renk/kaynak değişimi. Sepet cihazda tutulur, cihazlar arası otomatik sunucu eşitlemesi yok. |
| Sipariş snapshot ve görseller | Uygulandı | 9933fef, 902066f, 451581b, e2131e7: sipariş yerleşimi ve kaynak/checksum/SKU korunur; yeni siparişe bağımsız birleşik JPEG kopyası alınır. Web/mobil küçük görsel ve büyütme aynı ürün kompozisyonunu kullanır; eski kayıtta tam satın alınan revizyonla fallback, kaynak yoksa açık temsilî/erişilemiyor durumu. Ham desen ürün önizlemesi gibi gösterilmez. |
| Panel sipariş / iptal | Uygulandı | 6fd16c0, c425c4a, 681daeb, c34c250: tasarımdan bağlı siparişe geçiş, sayfalı referanslar, tek siparişi bağımsız okuma. aa6069f iptal yetkisini UI ve API üzerinde ayırır. |
| Ödeme ve operasyon | Bloke / kısmi | Demo sipariş tahsilatsızdır. Kart/3DS/havale, webhook/iade ödemesi, sunucu sepeti, rezervasyon, kargo sağlayıcısı/ücreti, yasal onay/İYS ve push için D03/D05/D10/D11 ve gerçek entegrasyon kanıtları gerekir. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


**Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md`, özellikle §3.1 B2C, §4 D02–D03/D05/D10, §5, §6.2–6.3 ve §8. **Kayıt:** İlerleme, karar ve yarım kalan iş `Faz00_Proje_Takip_ve_Kesintiden_Devam.md` içine işlenir. Bu dosya uygulanacak plan ve kabul kapısıdır. 20+ yıl deneyimli yedi rol birer *temsili uzman bakışıdır*; aşağıdaki imza kutuları gerçek kişilerin onayıyla doldurulur, otomatik olarak onaylanmış sayılmaz.

## 1. Kapsam ve ön koşullar

Üyelik/giriş, profil/adres, arama/filtre/karşılaştırma, favoriler, varyantlı ürün, sepet, kupon/kampanya, kart/havale-EFT ödeme, sipariş, kargo takibi, iptal/iade başvurusu, değerlendirme ve bildirim. Hem web hem mobil aynı iş API'sine dayanır; mobil ekran teslimi kendi fazında yapılır. B2B teklif, editör ve pazaryeri siparişinin ayrıntıları kendi fazlarındadır. Kişiselleştirilmiş satır, bu fazda geçerli bir `DesignVersionId` taşıyabilecek sözleşmeyle hazırlanır.

**Başlama denetimi:** Faz00'daki D01 mevcut kod keşfi ve repo yolu; D02 ürün/fiyat/stok ana kayıt kararı; D03 kesin sipariş anı, ödeme/havale doğrulaması, stok rezervasyon süresi, iptal/iade geçişleri; D05 sağlayıcı test erişimleri ve webhook doğrulaması; D10 müşteri metinleri, saklama ve rıza. Bu kararlar eksikse yalnız ilgili bağımsız modüller ve sahte sağlayıcıyla sözleşme testleri yapılır; canlı ödeme/kargo ve iş sahibi kabulü “tamamlandı” yazılmaz. Kod varsa mimariyi mevcut yapı ve testlerle uyarlayıp dosya yollarını Faz00'da kaydet. Yeni repo örneği: `services/api` (.NET ASP.NET Core), `apps/web` (Next.js/TypeScript), `apps/mobile` (Flutter/Dart, ADR-001), `tests`; SQL Server migration kaynağı `services/api` veya Faz03'te sabitlenen `infra/db/migrations` altında. Faz00 farklı doğrulanmış yol bildiriyorsa onu kullan.

## 2. Sözleşme, durumlar ve veri bütünlüğü

Örnek sürümlü uçlar; uygulamadan önce OpenAPI şemasını Faz00 kanonik `packages/contracts/` veya mevcut repoda Faz00'a eşlenmiş tek sözleşme yolunda güncelle. Her uçta hata kodu/alan hatası, rol, sayfalama ve `correlationId` açık olsun. `GET /api/v1/catalog/products?query=&category=&filters=&sort=&page=` ile filtre/sıralama, `GET /products/{slug}`, `GET /products/compare?variantIds=` ile karşılaştırma; görüntülenen fiyat/stok sunucunun hesapladığı anlık okumadır. `POST /auth/register|login|refresh|logout|password-reset`, `GET/PATCH /me`, `GET/POST/PATCH/DELETE /me/addresses`, `/me/favorites` müşteri nesne sahipliği ile korunur. Kimlik tasarımı mevcut sistem ve D01'e göre uyarlanır; parolayı uygun güçlü karma ile tut, token yenileme/iptal ve rate limit uygula.

`GET/PUT /me/cart`, `POST /me/cart/lines`, `PATCH/DELETE /me/cart/lines/{id}`, `POST /checkout/quote` toplamı sunucuda fiyatlandırır. `POST /checkout` isteği `Idempotency-Key`, teslimat adresi, teslimat/kargo seçimi, ödeme yöntemi, isteğe bağlı kupon taşır; yanıt **tek** `orderId`, `paymentAttemptId`, sunucu toplamı ve sağlayıcıya yönlendirme/ödeme durumu verir. İstemciden gelen tutar ve stok gerçek kabul edilmez. Son ürün yarışında atomik rezervasyon veya D03'ün doğruladığı kesinleşme politikası uygulanır. Sağlayıcıya ödeme kaydı bağlandıktan sonra yanıt kaybolsa aynı anahtar aynı kaydı döndürür; farklı içerikle aynı anahtar `409` verir. Tekil sağlayıcı işlem ID'si ve doğrulanmış webhook ile ikinci tahsilat/ikinci stok düşümü engellenir. Ödeme başarısız, iptal veya zaman aşımında rezervasyon yalnız bir defa serbest bırakılır. Kart verisi saklanmaz, ödeme sağlayıcısının yönlendirme/token akışı kullanılır. Havale/EFT `payment_pending` kalır; yalnız yetkili doğrulayıcı tutar/referans denetleyip işlem geçmişiyle onaylar. Sipariş kesinleşme noktası ve kart başarısızlığındaki kaydın statüsü D03 kararıyla sabitlenir.

`GET /me/orders`, `GET /me/orders/{id}`, `POST /me/orders/{id}/cancel-requests`, `POST /me/orders/{id}/return-requests`, `GET /me/orders/{id}/shipments`, `POST /products/{id}/reviews`, `POST /me/orders/{id}/review`, `GET /me/notifications` uçları yalnız sahip olunan kayıtları döndürür. İade ve iptal **talep** kayıtlarıdır; gerçekleşmiş ödeme iadesi gibi gösterilmez. Durum geçişleri D03 tablosuyla doğrulanır; her değişiklik kaynağı, aktörü, zaman ve gerekçeyi yazar. Değerlendirmede satın alma doğrulaması ve yayın/moderasyon kuralı iş sahibiyle netleştirilir; güvenli varsayılan olarak yayın öncesi moderasyon. Bildirim kuyruğu sipariş olayına bağlanır; tekrar gönderimde tek mantıksal bildirim, hatada takip edilebilir durum.

**Yasal yükümlülükler (D11):** Ödeme adımında mesafeli satış sözleşmesi ve ön bilgilendirme formu, sipariş içeriğiyle doldurulmuş haliyle gösterilir ve açık onay alınmadan `POST /checkout` kabul edilmez. Onaylanan metnin sürüm kimliği, içerik hash'i, onay zamanı ve kanal siparişe değişmez olarak kaydedilir; müşteri bunları sipariş detayında ve e-postada tekrar görebilir. Pazarlama amaçlı SMS/e-posta yalnız İYS kapsamında alınmış ve kaydedilmiş izinle gönderilir; işlemsel bildirim ile ticari ileti ayrı tutulur. ETBİS kaydı ve e-Fatura/e-Arşiv'in hangi sistemde kesileceği D11 ile Faz08'e bağlanır; karar yoksa canlı satış kabulü bloke kalır.

**Ödeme ayrıntıları:** Kart akışı sağlayıcının 3D Secure yönlendirmesiyle çalışır; 3DS dönüşü tek başına başarı sayılmaz, webhook/durum sorgusuyla doğrulanır. Taksit seçenekleri ve vade farkı sağlayıcıdan/panel ayarından gelir, sunucu toplamına dahil edilir ve sipariş anlık görüntüsüne yazılır. Kart iadesi (tam/kısmi `Refund`) yetkili `payments` izniyle, iade talebinden ayrı bir işlem olarak yürür ve sağlayıcı işlem ID'siyle tekildir. Havale/EFT için banka hesap bilgileri panelden yönetilir, müşteriye sipariş referansıyla gösterilir.

**Kargo ayrıntıları:** Kargo firmaları, ücret kuralı (sabit/desi/sepet tutarı), ücretsiz kargo eşiği ve teslimat bölgesi kısıtları panelden yönetilir; ücret `checkout/quote` içinde sunucuda hesaplanır. İade onaylandığında kargo sağlayıcısı destekliyorsa iade kargo kodu üretilir ve müşteriye bildirilir.

**Push bildirimi:** Kapsamdaki push altyapısının sunucu tarafı bu fazda kurulur: cihaz token kaydı/silme (`POST/DELETE /me/devices`), kullanıcı ve hesap bağı, izin/opt-out, FCM/APNs adaptörü (D05) ve sipariş olaylarına bağlı gönderim kuyruğu. Mobil istemci tarafı ve gerçek cihaz kabulü Faz11 11.06'dadır.

**MS SQL tabloları/migration:** `Customer`, `Address`, `Favorite(CustomerId,VariantId)`, `Cart`, `CartLine`, `Order`, `OrderLine`, `PaymentAttempt`, `PaymentProviderEvent`, `StockReservation`, `Shipment`, `CancelRequest`, `ReturnRequest`, `ProductReview`, `OrderReview`, `Notification`, `OrderStatusHistory`, `LegalDocumentVersion`, `OrderLegalConsent(OrderId,DocumentVersionId,ContentHash,AcceptedAt,Channel)`, `CommunicationConsent` (İYS izin kaydı), `PaymentRefund`, `ShippingCarrier`, `ShippingRateRule`, `BankAccount`, `CustomerDevice`. Faz03 `OutboxEvent`/`AuditLog`, Faz04 `CouponRedemption`/`InventoryMovement` **yeniden kurulmaz**; tek migration geçmişinde yalnız gereken yeni FK/alan/indeks için ek göç yazılır. Var olan katalog/stok/fiyat tablolarına FK kullan, kopya ana kaynak üretme. `OrderLine` satış anı ürün adı, SKU, seçili varyant, miktar, birim tutar, indirim, vergi, kargo payı ve tasarım sürümü anlık görüntüsünü korur. `CheckoutIdempotency(CustomerId,Key,RequestHash,OrderId)` benzersiz; sağlayıcı ID ve webhook event ID benzersiz; stok hareketi `(ReservationId, MovementType)` tekrar korumalı; tutarlar decimal ve para birimi açık; tüketici adresine FK ve erişim denetimi. Migration geri alma/ileri alma ve veri korunumu gözden geçirilir. Ödeme/rezervasyon, sipariş ve outbox yerel işlem sınırları birim testiyle belgelenir.

## 3. İş sırası ve teslim dosyaları

1. **İş analisti + PM:** Kaynaktaki UAT örneklerini somut iş kuralı tablosuna dönüştür; D02/D03/D05/D10'u Faz00'a açık/kararlı olarak işle. Ürün-varyant fiyat/stok ve kampanya önceliği, kargo/vergiler, havale operatörü ve iptal/iade yetkilerini yaz. Bağımlı modül için belirsiz kararla varsayımsal canlı davranış üretme.
2. **Sr. Creative Designer → UI/UX → Sr. Frontend:** Tasarım teslim paketi (ürün ve varyant durumları, filtre/karşılaştırma, sepet, ödeme bekliyor/hata/başarılı, sipariş/iade, boş/stoksuz/erişilemez halleri, responsive ve klavye akışı) tasarım sistemi ve bileşen durumlarıyla teslim edilir; UI/UX akış doğrulamasını yapar. Mevcut kurumsal görsel dil ve Faz00 tasarım kararına uyar. Kodda `apps/web` altında sayfaları ve API istemcilerini geliştir; müşteri seçtiği varyantın görseli/stok/fiyatı sepet ve siparişte korunur.
3. **DB Admin + Sr. Backend:** Migration, kısıt/indeks, hesap nesne sahipliği, fiyatlandırma ve rezervasyon işlemlerini kur. API uçları, ödeme sağlayıcı arayüzü (`CreatePayment`, `VerifyWebhook`, `QueryStatus`, gerekirse `Refund`), kargo arayüzü (`CreateShipment`, `Track`), e-posta/SMS bildirim arayüzü tanımla. Gerçek adapterlar D05 sağlayıcı sözleşmesine göre yazılır; test adapterı yalnız `Development/Test` ortamında ve açıkça mock etiketli çalışır. Ödeme çağrısı timeout olursa `unknown_outcome` ile otomatik yeni tahsilat çağrısını durdur: sabit sağlayıcı referansından durum sorgusu/idempotency varsa uzlaştır; destek yoksa yetkili manuel sağlayıcı kontrolü ve PM blokaj kararı olmadan tekrar başlatma. Yerel unique kısıt dış sağlayıcıdaki çift tahsilatı tek başına önlemez. `apps/admin` içinde müşteri/izin/sipariş için yetkili maskeli liste ve detay, kayıt düzeltme/audit, ürün ve sipariş değerlendirmesi moderasyonu, e-posta/SMS şablon-gönderim-hata-yeniden deneme/bildirim yönetimi ekranları ve API'lerini geliştir. D05 erişimiyle gerçek e-posta/SMS sandbox ve teslim/hata kanıtı al; mock gerçek gönderim kabulü değildir.
4. **Sr. Full Stack:** Web → API → DB → sağlayıcı sandbox uçtan uca akışını bağla; event/outbox worker'ı, hata kuyruğu ve panelden yetkili yeniden deneme görünümünü kontrol et. Test ortamında imzalı callback ve sağlayıcıdan durum sorgusu mutabakatı yap. Mobilin tüketebilmesi için OpenAPI ve örnek istek/yanıtları paylaş.
5. **PM:** Her risk, karar, eklenen migration, commit/PR, test kanıtı, blokaj, kalan iş ve rol onayı Faz00'a yazıldıktan sonra kapıyı açar. Kritik ödeme, stok veya nesne erişim kusuru açıkken fazı kapatmaz.

## 4. Test ve müşteri kabulü

- Paralel iki satın alma son birim stoku paylaşınca eksi stok ve çift satış oluşmaz. Stoksuz varyant sepete eklenmez; stok sonradan tükenirse checkout belirgin uyarı ve yeni fiyat/stok ile durur.
- Seçilen varyantın kimliği, fotoğrafı, fiyatı ve tasarım sürümü sepet, ödeme özeti ve değişmez sipariş satırında eşleşir. Fiyat/kupon değişikliğinde sunucu yeni toplam ve açıklanabilir hata üretir.
- Aynı idempotency anahtarıyla tekrar checkout, eşzamanlı callback, iki kez imzalı webhook ve ödeme durum sorgusu bir sipariş, en fazla bir tahsilat ve bir kesin stok hareketi oluşturur. Yanlış imza reddedilir; durum beklemede kalırsa uzlaştırma işi deterministik sonuç verir.
- Havale/EFT müşteriye `ödeme bekliyor` görünür, yetkisiz aktör onaylayamaz; operatör onayı audit kaydı oluşturur. Kargo/iptal/iade durumu ve bildirimler yalnız onaylı durum tablosuna uyar.
- Ürün ve **sipariş değerlendirmesi** ayrı yetkili müşteri kimlikleriyle yayın/moderasyon kuralına uyar; panel müşteri yönetimi ve e-posta/SMS bildirim yönetimi maskeleme, gerçek sağlayıcı sandbox, hata/yeniden deneme testlerinden geçer. Belirsiz ödeme sonucu otomatik ikinci tahsilat yaratmaz.
- Kullanıcı başka müşterinin adres, sipariş, ödeme veya iadesini ID tahmin ederek göremez; CSRF/XSS ve rate limit temel güvenlik kontrolleri geçer. Üye oturumu ve parola sıfırlama test edilir.
- Sözleşme onayı verilmeden checkout reddedilir; onaylanan sözleşme sürümü ve hash'i siparişte kalıcıdır, metin sonradan değişse de eski siparişte eski sürüm görünür. İYS izni olmayan kullanıcıya ticari ileti gitmez.
- 3DS başarısız/yarıda kalan ödeme sipariş kesinleştirmez; taksitli toplam sunucu hesabıyla eşleşir; aynı iade isteği iki kez gönderildiğinde tek `Refund` oluşur.
- Kargo ücreti eşik altında/üstünde doğru hesaplanır, panel değişikliği yalnız yeni sepetlere uygulanır. Push token başka kullanıcıya bağlanamaz; opt-out sonrası push gitmez.
- Sahte sağlayıcı testleri `MOCK` olarak raporlanır; gerçek ödeme/kargo sandbox ve iş sahibinin D03/D05 onayı yoksa gerçek entegrasyon/kabul tamamlandı sayılmaz. Ekranlarda telefon/tablet/masaüstü, hata-yeniden dene ve temel klavye erişimi doğrulanır.

**Kabul kanıtı:** OpenAPI + migration/indeks gözden geçirme, otomatik test sonuçları, sandbox işlem ve webhook kayıtları (sır/kişisel veri maskeleme), ekran akışı videosu veya ekran görüntüleri, müşteri UAT sonucu, Faz00 güncellemesi. Çıktıdaki ödeme/stock metrikleri ve hangi davranışın mock olduğu belirtilir.

## 5. Yarıda kaldığında devam

`Faz00_Proje_Takip_ve_Kesintiden_Devam.md` içindeki *Son güvenli durum*, D02/D03/D05/D10, aktif commit/branch, migration sürümü, son geçen test, mock/gerçek sağlayıcı ve açık blokajı oku; `git status`, migration geçmişi ve veritabanı şemasını doğrula. Önce tekrarlanabilir kritik senaryoyu çalıştır; ödemeyi manuel yeniden başlatmadan provider işlem ID'siyle sorgula. Bekleyen outbox'ı idempotency anahtarı korunarak işle; test kanıtını ve sonraki tek işi Faz00'a yaz. Faz05 durumu yalnız tüm kanıtlar ve gerekli gerçek karar/onaylar mevcutsa `Tamamlandı` olur.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~52 % · kalan ~48 % · Statü: Bloke (D03/D05/D10/D11)**

**16.10 güncellemesi (kod/commit incelemesi):** Web favorileri hesap API’siyle kalıcı hale geldi (`fc715ec`, `754db13`); mobil favorilerin aynı API ile eşitlenmesi bu kayıtta doğrulanmadı. Hesabım değerlendirmeleri, adres silme onayı, sipariş hata/aksiyonları ve bildirim okundu durumunun saklanması eklendi (`8f3adc4`, `2550209`, `b210122`, `1f02e1f`). Kayıt e-posta doğrulaması ve parola sıfırlama ekran geçişi düzeltildi (`fd52a16`, `5f704cf`). Ödeme, sunucu sepeti ve stok rezervasyonu açık. Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

**20.10 güncellemesi:** Panel siparişlerinde yükleme hatası ve güvenli tekrar (`fd0097f`), bildirim tekrarlarında koruma (`6c53359`), maskeli müşteri dizini (`b4d37ca`), SQL sipariş/müşteri sayıları (`65c0722`). Ödeme, sunucu sepeti, rezervasyon, kargo ve yasal onay eksikleri değişmedi (D03/D05/D11). Oran değişmedi. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

| İş | Durum | Kanıt / eksik |
|---|---|---|
| Üyelik, profil, adres (en çok 10), hesap silme | Tamam | `/api/v1/me/*`, web+mobil (TST-098/099, `1354a08`) |
| Parola sıfırlama | Tamam (14.10) | `/auth/password-reset`, web + mobil ekran (TST-117) |
| Favoriler | Kısmi | Web `/me/favorites` ile hesapta kalıcı (`754db13`); mobil eşitleme kanıtı açık |
| Sepet | Kısmi | Tarayıcı/cihaz deposu; kişiselleştirilmiş satır (`49d3f35`, `265c48d`); sunucu sepeti ve `checkout/quote` yok |
| Sipariş (sunucu fiyatlı, idempotent) | Kısmi | Ödeme almayan demo sipariş, 0003/0005 tabloları; stok rezervasyonu yok |
| Ödeme (kart/3DS/taksit/havale, webhook, iade) | Bloke | D03/D05 |
| Kargo (firma, ücret kuralı, takip) | Kısmi | Panelden durum/gönderi bilgisi; sağlayıcı ve ücret yok |
| İptal/iade talebi | Kısmi | Talep akışı ve geçici 14 gün kuralı; D03 onayı yok |
| Ürün değerlendirmesi | Tamam | Satın alma doğrulamalı, panel moderasyonu |
| Bildirim (e-posta/SMS/push) | Kısmi | Bildirim merkezi, SMTP, kuyruk; Netgsm test erişimi ve Firebase yok |
| Yasal onay kaydı, İYS izni | Bloke | D10/D11 |

**Sonraki adım:** ödeme için D03/D05 kararı; karar gerektirmeyen iş olarak sunucu tarafı sepet.

## 6. Yedi rol inceleme ve PM son kapısı

Her kutu gerçek inceleme tamamlandıktan sonra kişi/tarih/kanıt bağlantısı ile Faz00'da işaretlenir; temsili rol tanımı gerçek onay yerine geçmez.

- [ ] İş Analisti — D02/D03 ve müşteri kabul senaryoları
- [ ] Sr. Creative Designer — durumlu ekran paketi UI/UX ve frontend'e teslim
- [ ] Sr. Frontend Developer — UI/UX akışı, erişilebilirlik, responsive deneyim ve API eşliği
- [ ] Sr. Backend Developer — fiyat/stok/ödeme güvenliği, sözleşmeler
- [ ] DB Admin — migration, benzersizlik, eşzamanlılık ve kurtarma
- [ ] Sr. Full Stack Developer — uçtan uca ve sağlayıcı sandbox doğrulama
- [ ] **Proje Yöneticisi — zorunlu nihai onay:** tüm rollerin bulguları, müşteri kararları, kabul kanıtı ve Faz00 tamam; açık kritik engel yok.

**Not:** Kullanıcının talep ettiği ekip yedi kişidir: PM, İş Analisti, Creative Designer, Sr. Frontend, Sr. Backend, DB Admin, Sr. Full Stack. UI/UX ayrı sekizinci kişi varsayılmaz; Creative Designer tasarımı teslim eder, Frontend'in görevlendirilmiş UI/UX sorumluluğu ayrıca incelenir.
