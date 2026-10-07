# Faz09 — Trendyol, Hepsiburada ve N11 ile merkezi sipariş

**Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2, §3.1 çok kanallı operasyon, §4 D02/D03/D06, §6.2–6.3, §7 K4 ve §8. **İlerleme ve yarım kalan işin tek kaydı:** `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`. Pazaryerinin güncel API sözleşmesi, mağaza yetkileri ve oran/kota koşulları D06 incelemesinde doğrulanır; bu belge sağlayıcıya ait doğrulanmamış endpoint/alan iddia etmez.

## 1. Kapsam, veri sahipliği ve başlangıç

Üç **ayrı** bağlayıcı: Trendyol, Hepsiburada, N11. Her birinde ürün ve kategori eşleme; uygun ürünün varyant, stok, kanal/kampanyalı fiyat yayımlama ya da alım yönü; dış siparişi içeri alma; kargo, iptal ve iade durum alışverişi; tek merkezî sipariş listesi, kanal/entegrasyon durumu, hataların yetkili yeniden işlenmesi. D02 ürün/fiyat/stok sahibi, D03 sipariş-kargo-iade geçişleri, D06 sürüm/mağaza/API erişimleri kapatılmadan veri yönü varsayılarak canlı çift yazma yapılmaz. Kişiselleştirilmiş ürünlerin pazaryerinde yayını ayrı müşteri kararıdır; izin yoksa bu SKU'lar yayımlanmaz.

Faz05 merkezi sipariş modeli, katalog/stok/fiyat ve Faz00 kaynak kod kararı giriş gereğidir. Mikro köprüsü ayrı fazda kendi mapping ve outbox tüketicisini oluşturur; pazaryeri siparişindeki muhasebe durumu merkezi listede ilişkilendirilir. Örnek yol: `services/api/Integrations/Marketplaces/{Trendyol,Hepsiburada,N11}`, `services/api/Commerce/Orders`, `services/worker/Marketplaces`, `apps/admin/src/features/integrations`, `packages/contracts/marketplaces.openapi.yaml`, `tests/integration/marketplaces`; mevcut kod varsa D01 gerçek yollarını Faz00'a yazıp uyarlayın.

## 2. Ortak bağlayıcı sözleşmesi ve alan haritası

`IMarketplaceAdapter` yalnız ortak iş sözleşmesini tanımlar: `ValidateCredentials`, `GetCategoriesAndAttributes`, `PublishOrUpdateListings`, `PushStock`, `PushPrice`, `FetchOrders(cursor,range)`, `GetOrderStatus`, `SubmitShipment`, `FetchCancelAndReturns`, `AcknowledgeOrRespondToCancelReturn` (sağlayıcının izin verdiği ölçüde). DTO'larda `Channel`, `ShopId`, `ExternalId`, `ExternalEventId/Version`, `OccurredAt`, `ExternalSku`, `ProductId`, `VariantId`, `ChannelCategoryId`, `Currency`, `LinePrice`, `ChannelDiscount`, `Quantity`, `TrackingNo`, `Status`, `RawPayloadRef`, `CorrelationId`, `Cursor` yer alır. Her adapter kanalın kimlik doğrulama, sayfalama, oran sınırı, hata kodu, zaman dilimi, alan, durum ve iade yöntemini kendi içinde uygular. Kanala ait bilinmeyen/uygunsuz özellik ortak sözleşmeye zorla sıkıştırılmaz: yetenek matrisi (`supported/unsupported/needs-approval`) ve manuel süreç yoluna yazılır.

Yayımlama girişi merkez katalogdan kanal SKU/kategori/varyant eşlemesi, onaylanmış kanal fiyatı ve kampanya kuralı, stok politikasına göre hazırlanır. İç kanal kampanyasının pazaryeri kampanya yetenekleriyle eşliği D02/sağlayıcı kabiliyetinde doğrulanır; kanalda desteklenmeyen indirim sessizce taban fiyata yazılmaz. Harici siparişte her satırın kanal SKU'su iç varyanta eşlenir; eşlenemezse ham kayıt kaybolmadan karantinaya alınır, yanlış ürüne otomatik bağlanmaz. Adres/kişisel veri sadece gerekli roller ve kullanım süresi kapsamında saklanır.

## 3. MS SQL modeli ve API/panel sözleşmesi

`MarketplaceShop(Channel,ShopId,Status,CredentialRef)`, `CategoryMapping(Channel,ExternalCategoryId,CategoryId,AttributesJson,Version)`, `ListingMapping(Channel,ShopId,ExternalSku,VariantId,ExternalListingId,PublishStatus,Version)` (kapsama göre ürün-varyant ayrımı), `ChannelPrice(VariantId,Channel,Amount,Currency,CampaignRuleId,EffectiveFrom,EffectiveTo)`, `ExternalOrderRef(Channel,ShopId,ExternalOrderId,OrderId)`, `ExternalOrderLineRef`, `IntegrationEvent(Channel,ShopId,ExternalEventId,EventType,Version,PayloadHash,RawPayloadRef,ReceivedAt,ProcessStatus)`, `SyncJob`, `SyncAttempt`, `SyncError`, `SyncCursor`, `OutboxEvent`, `AuditLog`. Tekillik en az `(Channel,ShopId,ExternalOrderId)`, `(Channel,ShopId,ExternalEventId,EventType,Version)` (olay kimliği yoksa kanala özel belirlenmiş deterministik fingerprint), `(Channel,ShopId,ExternalSku)` ve outbox işlem anahtarını kapsar. Faz03 `SyncJob`/`SyncAttempt`/`OutboxEvent`/`AuditLog`, Faz04 `ChannelPrice` fiziksel tablolarını yeniden kurma; yalnız kanal/satır ilişkileri, eşleme, cursor ve gerekli indeksleri tek migration geçmişinde ekle. Mikro'dan veya pazaryerinden stok olayı geldiğinde D02 ana kaynak ve stok hareketi kimliğiyle aynı satışın ikinci kez stok tüketmediğini test et. Sipariş değişikliği ve outbox aynı yerel işlemde yazılır; stok hareketi aynı iç sipariş/satır için tekrar korumalıdır. `RawPayloadRef` şifreli/erişim kontrollü depoya referanstır; hassas payload düz loga yazılmaz.

Yönetim uçları (yalnız role dayalı yetki): `GET /api/v1/admin/marketplaces/capabilities`, `GET/PUT /shops/{channel}/{shopId}/mappings/{kind}`, `POST /shops/{channel}/{shopId}/sync?kind=`, `GET /integration/jobs?channel=&status=`, `GET /integration/jobs/{id}/attempts`, `POST /integration/jobs/{id}/retry` (gerekçe ve audit), `GET /orders?channel=&integrationStatus=`, `GET /orders/{id}`. Gelen webhook sağlayıcının doğrulanmış imza/ağ yöntemine göre ayrı `/api/v1/webhooks/marketplaces/{channel}` yolunda doğrulanır, hızlıca saklanıp 2xx dönülür; uzun işlem worker'da. Sağlayıcı webhook sunmuyorsa cursor ile poll ve örtüşen pencere kullan; tekrar idempotenttir. İstek/yanıt, pagination, hata ve desteklenmeyen işlem bilgisi OpenAPI'de yer alır.

## 4. Sıralı iş planı

1. **PM + İş Analisti:** D02/D03/D06 ve kişiselleştirilmiş ürün yayını kararını Faz00'dan kontrol et; her kanaldan örnek ürün, varyant, kategori, fiyat/kampanya, sipariş, kargo, iptal/iade olaylarını anonimleştirerek al. Sahipliği ve yetenek matrisini, yön/çakışma politikasını müşteriyle kesinleştir. Üç mağazanın test hesabını ayrı doğrula.
2. **Creative Designer → Frontend UI/UX:** Eşleme ekranı, merkezi sipariş filtresi, bağlantı/son başarılı senkron, işlem kuyruğu, hata ayrıntısı, tekrar dene/onay diyaloğu, yetkisiz ve desteklenmeyen işlem durumlarını tasarım paketi olarak teslim et. Frontend panelde düzeltme ve yeniden denemeyi `reason` ve beklenen sonuçla gösterir; ham gizli bilgiyi görüntülemez.
3. **DB Admin + Backend:** Şema/indeks/migration; ortak sözleşme; event inbox + outbox + işleyici, cursor, sınırlandırılmış artan gecikme (jitter), kalıcı hata karantinası, yetkili manuel replay, uzlaştırma raporu. Son başarılı/son deneme, gecikme, hata sayısı ve stok/fiyat/sipariş ayrışması ölçülür. Yanlış eşleme düzeltilmeden olay `başarılı` işaretlenmez.
4. **Backend, sırayla her kanal:** Önce Trendyol, sonra Hepsiburada, sonra N11 adapterı. Her biri gerçek sağlayıcı dokümanı/örnek yanıtıyla kendi kategori özellikleri, kimlik doğrulama, varyant/SKU, fiyat/kampanya, stok, sipariş, kargo, iptal/iade eşlemesi ve API limitlerini uygular. Bu sıra teknik mecburiyet değil teslim kontrol sırasıdır; tek bağlayıcı başarısı diğer ikisinin kabulü değildir.
5. **Full Stack:** Her kanal sandbox'ında katalog yayını → sipariş alımı → stok etkisi → kargo ve iade/iptal güncellemeleri → panelde kanal ve muhasebe durumu test edilir. Gecikmeli ve sırasız olayları mevcut durum geçiş tablosuyla uzlaştırır; Mikro aynı siparişi iki kez göndermez. Üretime geçişte son cursor, bekleyen kuyruk ve kanal mutabakatı Faz00'a yazılır.
6. **İlk yükleme ve geçiş günü:** Her kanaldaki mevcut listeleme ve SKU'lar merkez varyantlarla eşlenir (yeni ilan açmak yerine mevcut ilanı bağlamak esastır); eşleşmeyenler karantinaya alınır. Geçiş gününde stok yazma yetkisinin eski yöntemden merkez sisteme hangi sırayla devredileceği, devir sırasında stok güncellemesinin dondurulup dondurulmayacağı ve açık siparişlerin nasıl içeri alınacağı runbook'a yazılır; aynı stok iki kaynaktan aynı anda yazılmaz.
7. **PM son kapı:** Üç kanalın ayrı ayrı kanıtı, müşteri kararları, yedi rol incelemesi ve Faz00 güncellenmeden faz tamamlanmaz.

## 5. Test, hata ve dış erişim blokajı

- Her kanalda kategori/özellik, ürün/varyant ve SKU eşleme; doğru kanal ve kampanya fiyatı, stok yönü; üç kanal siparişi tek listede kanal, dış ID ve iç sipariş ID'siyle görünür. Yanlış/eşleşmeyen SKU karantinada kalır.
- Aynı siparişin webhook + poll + manuel replay ile üç kez gelmesi **tek** iç sipariş/satır/stok etkisi verir. Aynı event'in tekrarları, eksik/sırasız durum, geç gelen iptal ve ağ zaman aşımı değişmez durum geçişine göre işler; çift kargo/iade komutu gönderilmez.
- 429/5xx/artık geçersiz token ayrı sınıflanır; oran sınırına uygun artan gecikme ve alarm, kalıcı hatada son hata görünürlüğü; worker çöküp kalkınca outbox/inbox güvenle devam eder. Tekrarda tedarikçinin son durum sorgusu ve idempotent komut desteği varsa kullanılır; yoksa dış komut işi `unknown_outcome` olarak otomatik replay kuyruğundan çıkarılır; yetkili operatör dış sonucu doğrulayıp kanıta dayalı tekrar/çözüm kararı vermeden yeniden gönderilmez.
- Dış kargo, iptal ve iade komutunun timeout sonrası sonucu bilinmiyorsa otomatik retry durur; sağlayıcı sorgulaması veya operatörün dış durum kanıtı olmadan ikinci işlem gönderilmez. Mikro/pazaryeri stok olayının aynı iç siparişi ikinci defa tüketmediği doğrulanır.
- Üç kanalda ayrı sandbox/gerçek erişim doğrulanmadan “entegrasyon tamam” yazılmaz. Test serverı yoksa imzalı örnek cevap ve fixture ile adapter sözleşmesi `MOCK` olarak işaretlenir; Faz00 blokajında kanal, beklenen erişim, sorumlu, son durum ve etkilenmeyen devam işi yazılır. Sağlayıcı yeteneği yoksa manuel süreç ve müşteri kabulü kayıtlı olmadan tam kabul yapılmaz.
- Mevcut ilanların ilk eşlemesinde mükerrer ilan açılmaz; geçiş günü provasında stok yazma devri sırasında hiçbir kanalda eksi stok veya çift satış oluşmaz. Pazaryeri siparişinin fatura sorumluluğu D11 kararına göre izlenir.
- Kanala göre gönderilen ve alınan fiyat, stok, kargo, iptal/iade, muhasebe geçişleri günlük uzlaştırma örnekleriyle; rol, audit ve kişisel veri maskelemesiyle doğrulanır.

**Kanıt:** Üç ayrı kanal yetenek/eşleme matrisi, API erişim test kaydı, fixture ve sandbox sonuçları, migration/benzersizlik/worker testleri, panel ekran kanıtı, uzlaştırma raporu, müşteri UAT kararı ve Faz00 linkleri.

## 6. Yarıda kaldığında devam

`Faz00_Proje_Takip_ve_Kesintiden_Devam.md` içinde her kanalın `mock/sandbox/live`, mağaza/erişim kararı, son güvenli commit, migration, son başarılı cursor, bekleyen inbox/outbox, başarısız iş ve kayıtlı düzeltme adımını oku. `git status` ve DB migration durumunu karşılaştır. Önce işin tekrar anahtarını/dış sipariş ID'sini ve sağlayıcı son durumunu doğrula; doğrudan kör replay yapma. Karantinadaki SKU eşlemesini düzelt, tek işi çalıştır, sonuç/kanıt ve sıradaki adımı Faz00'a yaz. Bir kanaldaki tamamlanma diğerlerine taşınmaz.

## 7. Yedi rol incelemesi ve zorunlu PM kapısı

Kutular yalnız gerçek kişi/tarih/kanıtla Faz00 üzerinden kapanır; rol uzmanlığı ve “20+ yıl” bu belgede temsilidir, insan imzası uydurulmaz.

- [ ] İş Analisti — üç kanal iş kuralı, durumlar ve müşteri UAT
- [ ] Sr. Creative Designer — panel tasarım paketi UI/UX ve frontend'e teslim
- [ ] Sr. Frontend Developer — UI/UX sorumluluğu, panel hata/tekrar etkileşimi ve erişilebilirlik
- [ ] Sr. Backend Developer — üç adapter, idempotency, retry ve veri sahipliği
- [ ] DB Admin — benzersizlik, migration, cursor ve veri denetimi
- [ ] Sr. Full Stack Developer — üç kanal uçtan uca ve Mikro/merkezi sipariş uyumu
- [ ] **Proje Yöneticisi — zorunlu nihai onay:** üç ayrı kanal kanıtı, karar ve blokajlar, müşteri kabulü, Faz00 izleri; kapatılmamış kritik hata yok.
