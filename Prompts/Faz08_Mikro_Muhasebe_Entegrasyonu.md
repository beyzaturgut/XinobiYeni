# Faz08 — Mikro muhasebe entegrasyonu ve mutabakat

## Güncel uygulama durumu — 27.10.2026

**Durum:** Bloke — D02/D06/D11. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Aşağıdaki kayıt günceldir; 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| 08.01–08.10 değişiklik denetimi | Yeni entegrasyon yok | 20–27 Ekim commitleri içinde gerçek Mikro istemcisi/adaptörü, stok/fiyat/cari/sipariş/fatura senkronu veya mutabakat teslimi bulunmadı. Panel prototip temizliği ve ortak izin altyapısı Mikro entegrasyonunun çalıştığı anlamına gelmez. |
| Açık kapılar | Bloke | Mikro sürümü/API erişimi, alan sahipliği/yönler, gerçek örnek veri, fatura sorumluluğu, idempotent işleyici ve sandbox uçtan uca doğrulama gerekiyor. Önceki çekirdek tablo/prototip kanıtları kısmi kalır. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


> **Durum (16.10.2026):** Bloke (D02/D06) · geliştirme ~5 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Plan / uygulanmadı. Yedi rolün onayı uygulama kanıtından sonra ayrı ayrı kaydedilir; bu metin gerçek insan onayı veya 20 yıllık gerçek iş geçmişi iddiası değildir. Son kapı her durumda PM'dedir.

## 1. Kaynak, kapsam ve giriş koşulu

Bağlayıcı kapsam `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §3.1, §4 D02/D03/D05/D06, §6.1–6.3, §8'deki Mikro satırıdır; `Xinobi_Proje_Kapsami(4).md` içindeki Mikro maddelerinin tamamı şu akışlara dağılır: **ürün/kategori dışarı**, **stok/fiyat içeri ve periyodik**, **müşteri/cari/sipariş/fatura/tahsilat/iade dışarı**, **sipariş durumu senkronu**, hata/günlük ve yetkili manuel yeniden gönderim. Mikro API/ara katmanının gerçek sürümü/yetkileri kanıtlanmadan uç noktalar veya alan adları sağlayıcı gerçeği diye sunulmaz.

Giriş: Faz03'ün kimlik, şema, outbox/inbox, worker, audit ve yetkili panel kabuğu; ilgili katalog/stok/fiyat ve checkout/sipariş/iade alanlarının sözleşmeleri mevcut. D02 için **alan bazında** ürün, varyant, kategori, fiyat türü, kampanyalı fiyat, depo/stok, cari, sipariş, fatura, tahsilat, iade ana kaydı ve tek yazma yönü müşteri operasyonu/Mikro yetkilisiyle karara bağlanıp Faz00'a yazılmış olmalı. D03 durum geçişleri de kaydedilmiş olmalı. Bu kararlar yoksa yalnız mock bağlayıcı ve sözleşme testleri ilerler; canlı veri yazımı ve faz onayı bekler. D06 ile Mikro sürüm, desteklenen yöntem, kimlik doğrulama, rate limit, test hesabı, webhooks/polling kabiliyeti, alan örnekleri ve mağaza/şirket kodları keşfedilir; belge/görüşme kanıtı `docs/integrations/mikro/` içine ve karar özeti Faz00'a konur. Mevcut kod (D01) belirlenen klasörlerden farklıysa yollar Faz00 eşlemelerine göre uygulanır.

## 2. Veri sahipliği ve akış sözleşmesi

Bu tablo başlangıç yönünü **kaynak kapsamına göre** verir. D02 nihai kararı olmadan sistemin aynı alanını iki taraf yazamaz. `Muhasebe sistemine aktarmak` otomatik fatura kesildiği anlamına gelmez; destek, yasal zaman ve operasyon onayı ayrıca belirlenir.

| Nesne / alan | Beklenen yön | Tetikleyici ve idempotency | Kabul kontrolü |
|---|---|---|---|
| Ürün kartı, kategori, yerel varyanttan Mikro kartına eşleme | Xinobi → Mikro | Yayınlanan/gerçekten değişen kayıt; `(entityType, localId, localVersion, operation)` | Mikro ID yerel eşleme kaydına döner; varyant/ürün hiyerarşisi Mikro'nun yeteneğine göre D02'de açıkça eşlenir. |
| Depo ve varyant stok | Mikro → Xinobi, periyodik | Sağlayıcı değişim belirteci veya tarama aralığı + kaynak sürümü | Depo eşlemesi doğru; eski veri yenisini ezmez; güncelleme sonrası satışa açıklık tek kaynak kuralına uyar. |
| Fiyat | Mikro → Xinobi, periyodik | Fiyat listesi + para birimi + vergi/kampanya ayrımı + sürüm | Vergi dahil/hariç ve yuvarlama farklılığı kayıt altına alınır; kampanya Xinobi'de ise Mikro fiyatı kampanyayı silmez. |
| Müşteri / cari | Xinobi → Mikro | İzinli ve gerekli müşteri verisi; yerel customer/company ID | Aynı cari için mükerrer kart yok; misafir/pazaryeri alıcısı için kimlik ve gizlilik politikası ayrı. |
| Sipariş ve satırlar | Xinobi → Mikro | Kesinleşen ve D03'te aktarılacak statüye gelen sipariş; yerel order ID + sürüm | Satış kanalı, satır anlık görüntüsü, vergi/indirim/kargo, tasarım referansı Mikro kabul sözleşmesine eşlenir; toplam tutar korunur. |
| Fatura verisi | D02/D03 ile net yön ve üretim zamanı | Fatura/doküman ID tekil; fatura oluşturma yetkisi kayıtlı | Fatura numarası/tarihi/KDV ve sipariş bağı; tekrar kesim yok. Desteklenmeyen işlem operatör adımı ve durumu olarak görünür. |
| Tahsilat / ödeme | Xinobi → Mikro (muhasebeleştirme) | Ödeme sağlayıcısınca doğrulanmış işlem ID; iade/ters kayıt ayrı | Kart PAN/CVV aktarılmaz; başarısız veya `bekliyor` ödeme tahsilat sayılmaz; aynı webhook tek kayıt. |
| İade ve iptal | Xinobi → Mikro, durum geri bildirimi yalnız izinli alanlarda | Return ID + karar/sürüm; kredi/iade muhasebe belgesi ayrı | Sipariş iptali, stok geri dönüşü, ödeme iadesi ve muhasebe ters kaydı birbirinin otomatik eş anlamlısı değildir; D03 geçişlerine uyar. |
| Sipariş durumu | D03/D02 yazma alanı kararına göre iki yön arasında sahipli alanlar | `source`, `externalId`, `version`, `at`; geçiş matrisi | Daha eski/geçersiz durum yerel siparişi geriye almaz, döngüsel yankı tekrar gönderilmez. |

**e-Fatura / e-Arşiv (D11):** Faturanın Mikro üzerinden mi, ayrı bir e-belge entegratöründen mi, yoksa uygulamadan mı kesileceği; B2C e-Arşiv ve kurumsal e-Fatura ayrımı; pazaryeri siparişlerinde faturayı kimin kestiği ve fatura PDF/bağlantısının müşteriye nasıl ulaşacağı D11 ile kararlaştırılır. Karar yoksa "fatura verisi aktarımı" yalnız muhasebe kaydıdır, yasal e-belge üretimi sayılmaz ve canlı kabul bloke kalır.

**İlk yükleme ve geçiş:** Canlıya geçişten önce Mikro'daki mevcut ürün kartları, cari ve depo kodları yerel kayıtlarla eşlenir (Faz01 01.17, Faz04 ilk katalog yüklemesi). Eşleşmeyen veya mükerrer kartlar raporlanır, otomatik birleştirilmez. Başlangıç stok ve fiyat anlık görüntüsü tek seferlik okumayla alınır, geçiş gününden önce mutabakat raporu iş sahibince onaylanır.

Her alan için `docs/integrations/mikro/ownership.md` satırı: `entity.field | source of truth | direction | transform | conflict policy | last-sync SLA | approval D02`. Eşlemede kaynakta olmayan gerçek Mikro alanı tahmin edilmez. Test fiş/fatura numaraları canlıya taşınmaz.

## 3. Sırayla uygulama görevleri

Yeni repo için yollar Faz03'teki örnekleri izler. Dosya isimleri mevcut kod ve seçilen .NET sürümüne uyarlanır; eşleme Faz00'da saklanır.

| ID | İş / kod yolu | Tamamlandı kanıtı |
|---|---|---|
| 08.01 | D02/D03/D06 görüşme ve gerçek Mikro sürümü/API/ara katman kabiliyetini doğrula. `docs/integrations/mikro/contract.md`, `ownership.md`, `field-map.csv`, `status-map.md`, kimlik ve çağrı kotaları. Örnek test nesnelerini kimlikten arındır. | Her yön/alan için kaynak, Mikro alanı, dönüşüm, null kuralı ve onay sahibi belli; bilinmeyen alanlar blokaj kaydı. |
| 08.02 | `services/api/Integrations/Mikro` içinde provider arayüzü (`IMikroClient`) ve iki implementasyon: sabit yanıtlı fake ile gerçek adaptör. Kimlik bilgisi secret store; timeout, oran sınırlama, bağlantı kesici ve correlation ID. | Fake ile tüm akış deterministik; gerçeğin auth/ortam seçimi yapılandırmadan ve secretsız loglanır. API yeteneği eksikse uydurma endpoint çağrısı yok. |
| 08.03 | `infra/db/migrations` içinde Faz03 `ExternalMapping`/`SyncJob`/`SyncAttempt` çekirdeğini **tekrar kurmadan** Mikro için `SyncCheckpoint`, `IntegrationError`, `IntegrationPayloadRef` ve gerekli yeni alan/indeksleri ekle; `(system,entityType,localId)` ve `(system,entityType,externalId)` tekilliğini koru. Ham payload gerekiyorsa şifreli, erişim kısıtlı, D10 saklama kararıyla; normal logda maskeli özet. | İlk kurulum ve mevcut şemadan yükseltme; mükerrer ID ekleme başarısız; rollback/forward fix prova. |
| 08.04 | Ürün/kategori outbox handler'ı; bağımlılık sırası önce kategori sonra kart/varyant; yalnız D02'de yazma yetkisi Xinobi olan alanlar; dış ID dönüşünden sonra eşleme kaydı. | Kayıt değişimi → outbox → Mikro fake → eşleme; tekrar/timeout sonucu yeni kart üretmez. Kullanımdaki kayıt silme yerine arşiv/kapatma politikası ayrı. |
| 08.05 | Stok/fiyat inbound worker'ı: depo, varyant/SKU ve fiyat listesi eşle; watermark/checkpoint yalnız tüm sayfa güvenle işlendiğinde ilerlet; periyodik görev, gerekirse `since` ve tam tarama mutabakatı. Değişim yerel DB'de sürüm kontrolü ve audit ile uygulanır. | Kaynak daha eski sürümü yenisini ezmez; bilinmeyen SKU/depo veya fiyat null'u hata kuyruğunda; periyodik çekim idempotent. Senkron gecikmesi panelde. |
| 08.06 | Cari/müşteri gönderimi; kurumsal/vergi bilgisi gerekliliği ve KVKK en az veri ilkesi; sipariş export'u için önce cari eşlemesi, sonra sipariş/satır, uygun statüde muhasebe kayıtları. İşlemleri iş bağımlılık grafiğinde kuyruğa koy. | Cari API geçici hatası siparişi kaybetmez; aynı order ID ve sürümle ikinci gönderim tek dış sipariş; ticari toplam ve vergi hesap dökümü karşılaştırılır. |
| 08.07 | D03 ve sağlayıcı yeteneğine göre fatura verisi, doğrulanmış tahsilat, iptal/iade ve sipariş durum geçişi akışları; muhasebe başarısını tahsilatın gerçeği sanma. `status-map.md` ile iki yönlü geçiş ve kaynak etiketli döngü önleme. | Tek ödeme sağlayıcı işlem ID'sinden tek tahsilat kaydı; iptal/iade tekrarı tek etki; geciken Mikro statüsü siparişi geriye götürmez. Desteklenmeyen işlem `manuel aksiyon gerekli` olarak görünür. |
| 08.07a | Creative, Faz02 sistemini kullanarak `design/screens/Faz08/` içinde Mikro iş listesi, mutabakat, maskeli hata, bekliyor/çalışıyor/başarılı/başarısız/sonuç belirsiz, yetkisiz, retry onayı ve tekrar tehlikesi ekranlarını sürümlü teslim eder. Creative+FE UI/UX akışını inceler; FE `design/handoff.md` altında alım/eksik kaydı verir. | Handoff sürümü, ekran ID'leri ve FE alım kanıtı olmadan 08.08 paneli tasarım kabulü almaz. |
| 08.08 | `apps/admin` panelinde `/integrations/mikro`: yön/nesne/sonuç/son hata/zaman filtresi, maskeleme, yetkili detay ve `yeniden gönder` tekil/batch sınırı; API `GET /api/v1/admin/integrations/mikro/jobs`, `POST /api/v1/admin/integrations/mikro/jobs/{id}/retry`, `GET /api/v1/admin/integrations/mikro/reconciliation`. | Retry yalnız `integration.retry` iznine; gerekçe, aktör, zaman ve iş ID audit; başarılı iş körlemesine yeniden fiş/fatura oluşturmaz. Gerçek test işlemi kullanıcıya gösterilebilir. |
| 08.09 | Mutabakat işi ve alarm: yerel–Mikro ürün/eşleme, depo-stok, fiyat listesi, cari, sipariş/toplam, fatura, tahsilat, iade ve durum sayısı/farkları. Her sapma `entity`, dış/yerel ID, alan, iki değer özeti, zaman, risk, karar/owner olarak tutulur. Kritik fark için alarm ve manuel çözüm iş akışı. | Aynı kaynak veriler tekrar tarandığında yinelenen açık fark üretilmez; örnek stok/fiyat/tahsilat uyuşmazlığı raporda görülür ve düzeltme auditlidir. |
| 08.10 | Sözleşme, hata ve canlı erişim testleri; staging'de gerçek yetkili test kayıtları, limit/timeout/rate, kesinti ve geri dönüş; `docs/runbooks/mikro.md` operasyon kılavuzu, kapasite ve alarm eşiği. | Kuru çalıştırma ve küçük kontrollü veriyle dış ID doğrulanır; sonrasında yanlış kayıt oluşmadığı Mikro arayüzünde görülür; Faz00 gerçek erişim/sonuç ve kararları güncellenir. |

## 4. Veri, işleyici ve API ayrıntısı

### 4.1 İşlem bütünlüğü

Yerel iş kaydı değişimi ve outbox yazımı aynı SQL işlemindedir. Worker önce job'ı lease eder, dış çağrı yapar; sonuç DB'ye kaydedilemeden süreç ölürse aynı istek tekrar gidebilir. Bu yüzden Mikro bir idempotency/reference alanı destekliyorsa gönderilen sabit yerel anahtar kullanılır; desteklemiyorsa yeniden denemeden önce dış kayıt referansla sorgulanıp eşleme kontrol edilir. Sorgu da yoksa otomatik tekrar kapanır ve operatöre `belirsiz sonuç` olarak çıkar; mükerrer fatura/tahsilat riski alınmaz.

Önerilen durumlar: `pending → running → succeeded`; geçici hata `retry_wait` ve artan bekleme/jitter, kalıcı doğrulama hatası `action_required`, dış çağrı sonucu belirsiz `unknown_outcome`, operatörce doğrulanıp tekrar için `pending`. Uç hata logunda teknik kod, redakte edilmiş mesaj, deneme sayısı, son/sonraki deneme zamanı bulunur. Dış ID eşlemeleri ayrı kaydedilir. Gelen veride watermark ve payload sürümü; aynı girdi ve aynı işlem tekrarı tek yerel etki vermelidir. Stok alımıyla checkout arasındaki yarışta Faz03–ticaret fazında tanımlanan atomik stok kuralı geçerlidir; entegrasyon gecikmesini stok garantisi gibi sunmayın.

### 4.2 Şema ve indeks

Faz03'teki `ExternalMapping(system, entityType, localId, externalId, mappingVersion)` ve `SyncJob`/`SyncAttempt` kullanılır; bu faz yalnız gerek duyulan `active`, `localVersion`, `idempotencyKey`, lease ve tarih alanlarını geriye uyumlu göçle ekler. Aktif eşleme için iki yönlü tekillik korunur; yeniden eşleme geçmişi `AuditLog` ile ayrı kayıtlıdır. `SyncCheckpoint(system, feed, scopeKey, watermark, completedAt, rowVersion)` depo/fiyat listesi kapsamını ayırır. `SyncJob` için eşsiz `(system,idempotencyKey)` ve iş kuyruğunda `(system,state,nextAttemptAt)` indeksi; `IntegrationError` ve mutabakat farkında `system/entity/id/field` arama indeksi. Büyük payload kopyaları işlem tablosunda tutulmaz. `OrderExternalStatus` kaynak/sürüm/tarih taşır. `AuditLog` manuel retry, eşleme değişikliği ve fark kapatma nedenini taşır. Gerçek sağlayıcı dış ID'sinin boyutu/tipi keşifte doğrulanır.

### 4.3 Panel ve yetki

`integration.read` iş kayıtlarını maskeli okuyabilir; `integration.retry` kontrollü yeniden deneme yapar; `integration.map` eşlemeyi gerekçeyle düzenler; `integration.reconcile` farkları yönetir. Hiçbiri sırları veya tam ham müşteri payload'unu doğrudan UI'ye döndürmez. API tüm yetkiyi tekrar denetler. `POST .../retry` için kullanıcı gerekçesi, işin mevcut durumu ve `Idempotency-Key`; aynı tıklama iki iş oluşturmaz. Uzun çalışan tam senkron veya mutabakat komutu job ID döner; ekranda `bekliyor/çalışıyor/tamamlandı/başarısız` izlenir.

## 5. Test matrisi ve gerçek sağlayıcı kapısı

| Senaryo | Fake/yerel kanıt | Gerçek Mikro test yetkisiyle doğrulama |
|---|---|---|
| Ürün/kategori | kategori önce, tekil dış eşleme, değişiklik tekrar | Gerçek test ürününün alanları ve Mikro dış ID'si ekranda/doğrudan sorguda |
| Stok/fiyat | iki depo, iki fiyat listesi, geç/eksik sayfa, eski watermark ve bilinmeyen SKU | Mikro'da kontrollü değişiklik → belirtilen senkron süresi içinde doğru varyant/depo/liste; yuvarlama farkı açıklı |
| Cari/sipariş/fatura | cari hata → sipariş bekler; timeout tekrarından tek kayıt; toplam/vergi ve durum geçişleri | Test carisi ve siparişine gerçek dış kimlik; fatura üretimi ve yönü D02/D03 kararına göre ayrıca |
| Tahsilat/iade | aynı sağlayıcı bildirimi iki kez, iptal-iade yarışması, belirsiz cevap | Yalnız sahte sağlayıcı/test ödeme veya Mikro test şirketi; çift fiş/tahsilat yok |
| Hata/yeniden gönderim/mutabakat | 429, 5xx, 400, ağ kopma, iki worker, sonucun bilinmemesi; yetki ve audit | Bilinçli izinli test hatasında panel kod/gerekçe; düzeltip tek yetkili retry, iki sistemde sayım |

**Mock testleri yalnız uygulama mantığını doğrular.** D06 kapsamında gerçek test hesabı, API izni, desteklenen işlem listesi ve kontrol edilebilir test şirketi yoksa üretim bağlantısı onaylanamaz; `blokaj`, sahibi, erişim isteği ve kalan gerçek testler Faz00'da kalır. Prod'a geçişte önce backup/restore ve eşleme snapshot'ı; önce küçük ürün alt kümesi, sonra read-only stok/fiyat, ardından finansal dışa aktarım kontrollü açılır. İzleme ve geri dönüş kararı PM kapısına bağlıdır; çift yazan yeni akış doğrudan açılmaz.

## 6. Migration, geri alma ve işletim

- Şema migration'ı temiz DB ve mevcut Faz07 sürümü üstünde koşar. Önce snapshot/yedek, sonra ekleme ve indeksler; gerekirse yeni kısıt öncesi mükerrer eşleme temizliği raporlanır. `down` işlemi dış Mikro kartını/faturasını geri almaz. Geri dönüş planı yazılımı önceki sürüme ve kuyruğu durdurmaya, devamında dış sistem etkilerini tek tek mutabakata dayanır.
- Worker yanlış eşleme veya toplu gönderimde durdurulur; job lease'leri devralınabilir hale getirilir. Son başarılı checkpoint ile gerçek dış kaydı kıyaslanır. `unknown_outcome` otomatik tekrar edilmez. Operatör dış kaydı doğrulayıp gerekçeyle `eşle / yeniden dene / manuel kapat` işlemi yapar; tüm kararlar auditlidir.
- Yetki anahtarı döndürme, yanlış gönderilmiş kişisel veri bildirimi, geciken job alarmı, yedek/restore, periyodik tam mutabakat ve tespit edilen farkı kimin kapatacağı `docs/runbooks/mikro.md` içine konur. Canlı kimlik bilgisi hiç belgeye/repoya/loga yazılmaz.
- İndeks ve performans: yoğun job filtrelerinde `(system,state,nextAttemptAt)` ve `(entityType,localId)`; stok/fiyat sayfa işlemi kısa DB transaction, checkpoint yalnız tamamlanan sayfada. Ağ çağrısı açık SQL transaction'ında bekletilmez.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~5 % · kalan ~95 % · Statü: Bloke (D02/D06/D11)**

| ID | Durum | Kanıt / eksik |
|---|---|---|
| 08.01 | Bloke | Mikro sürüm/API erişimi yok |
| 08.02–08.07 | Yok | `IMikroClient` ve işleyiciler yok |
| 08.03 | Kısmi | Faz03 çekirdeğinde `ExternalMapping`/`SyncJob` tabloları var; Mikro’ya özel tablolar yok |
| 08.07a/08.08 | Kısmi | Panel entegrasyon izleme prototipi (TST-084), gerçek API yok |
| 08.09–08.10 | Yok | — |

## 7. Faz çıkışı ve yedi rolün ayrı onayı

08.01–08.10 tamam; D02/D03/D06 kaynak sahibi kararı ve sağlayıcı kabiliyeti; harita, gerçek test kanıtı, tekrarlı işlem ve mutabakat raporu; migration/geri dönüş provası; panelden yetkili retry; dokümantasyon ve Faz00 devam kaydı hazır olmalı. Test şirketi yoksa **faz gerçek entegrasyon olarak geçmez**, yalnız mock alt çıktısı işaretlenir. Açık üretim riski ve müşteri kararı PM'ye taşınır. Faz09 ya da sonraki bağımlı fazların Mikro çağrıları bu kapıyı aşmadan canlıya alınmaz.

Her rol `rol | karar (bekliyor/onay/revizyon) | commit/kanıt | açık nokta | tarih` satırını gerçek uygulama sırasında doldurur. Şimdiki durumlar **BEKLİYOR**; metin hazırlanması onay değildir.

| Rol | İnceleme odağı | Karar |
|---|---|---|
| İş Analisti | D02/D03 süreçleri, alan yönleri, müşteri senaryoları | Bekliyor |
| Sr. Creative Designer | Hata, retry ve mutabakat durumlarının görsel tasarım teslimi | Bekliyor |
| Sr. Frontend Developer | Panel durumu, yetki, güvenli hata gösterimi, tasarım teslimi | Bekliyor |
| Sr. Backend Developer | Adaptör, outbox, timeout, belirsiz sonuç/idempotency | Bekliyor |
| DB Admin | Eşleme tekilliği, checkpoint, migration ve geri alma/mutabakat | Bekliyor |
| Sr. Full Stack Developer | Kaynak veri → worker → panel ve sipariş uçtan uca senaryo | Bekliyor |
| Proje Yöneticisi (SON KAPI) | Altı rol kanıtı, gerçek sağlayıcı testi, müşteri kararları ve Faz00 | Bekliyor |

Bir rol revizyon isterse düzeltme ve yeniden inceleme gerekir. PM altı rol ve Xinobi'nin alan sahibi kararları olmadan `onay` yazmaz; PM onayı son kayıttır ve Faz00'da kanıt linkiyle yer alır.
