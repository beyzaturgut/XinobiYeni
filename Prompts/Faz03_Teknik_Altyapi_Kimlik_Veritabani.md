# Faz03 — Teknik temel, kimlik ve veritabanı iskeleti

**27.10 yerel OCR kapısı:** Yeni AI üretimlerine Tesseract tam görsel + köşe taraması bağlandı; şüpheli yazı/imza izleri yayımlanmıyor, en fazla bir ek üretim; OCR yok/hatalıysa kapalı kalır. Yeni dış görsel gönderimi yok. Eşya kontrolü hâlâ açık. Windows sunucuda executable/eng kurulumu ve IIS izinleri deploy öncesi gerekli; bu çalışma canlı kurulum değildir. [Kurulum ve sınırlar](../docs/runbooks/tesseract-artwork-gate.md).

## Güncel uygulama durumu — 27.10.2026

**Durum:** Devam — güvenlik ve işletim doğrulamaları kısmi. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Aşağıdaki kayıt günceldir; 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| 03.02 / 03.04 kamuya açık önizleme | Düzeltildi | 9e69a74 ve TST-135: rendering-inputs salt okunur anonim listeye alındı; OnlyListedAreasArePublic geçti (434 geçti/25 atlandı/0 hata). Önceki 20.10 test hatası güncel açık değildir. |
| 03.04 personel / nesne yetkisi | Uygulandı | 34556fa, 503fe50, 6fd16c0, 681daeb: salt okunur tasarım metadata ve korumalı görsel, tasarıma bağlı sayfalı sipariş referansları, liste limiti dışındaki tek siparişi okuma. 88e99f9/b9b63f3 teklif/AI yazma kontrollerini yetkiye bağlar. |
| 03.04 iptal ve stok ayrımı | Düzeltildi | aa6069f: sipariş status üzerinden iptal için orders.cancel sunucuda da zorunlu; stok yazımı inventory.write ve yalnız stok güncelleme yoluyla yapılır. Katalog yazma yetkisi stok yetkisi yerine geçmez. DEPLOY-014: 26 AuthorizationTests geçti. |
| 03.08 / 03.11 revizyon ve medya | Kısmi | 9933fef, 47d8016, 902066f: sahiplik kontrollü konfigürasyon revizyonu, özel JPEG ve siparişe bağımsız kompozisyon kopyası. Mevcut FeatureDocuments/PersonalizationJson kullanılır; yeni fiziksel SQL migration yok. İzole SQL kalıcılık doğrulaması atlandı; malware taraması ve genel upload/finalize sözleşmesi açık. |
| 03.10 sırlar / kurulum | Kısmi | 096b267, 982436b, 4333eda, 94c9e26: harici sunucu ayarları, aynı dizine kurulum reddi, checksum ile birleşik paket, IIS durdurma/bekleme/yeniden deneme ve geri dönüş. localhost:8024 readiness kullanılır. VERIFYONLY/restore provası, RPO/RTO ve güvenlik taramaları kapanmadı. |
| 03.07 / 03.12 sınırlar | Açık | Inbox/dead-letter, ayrı worker, kalıcı genel panel ayarları ve teknik kararların açık bölümleri sürer. Cihaz sepeti sunucu sepetine dönüşmedi; XINOBI U oturumları tümüyle SQL olarak doğrulanmadı. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


> **Durum (16.10.2026):** Devam · geliştirme ~75 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Plan / uygulanmadı. Bu dosyadaki yedi rol değerlendirmesi bir kontrol listesidir; gerçek kişilerin onayı değildir. Uygulama tamamlanınca kanıt yollarını ve ayrı ayrı kararları doldurun. Son geçişi her koşulda PM verir.

## 1. Bağlayıcı kaynak, sınır ve ön koşullar

- Kaynak: `Xinobi_Kavramsal_ve_Teknik_Analiz.md`, özellikle §2, §3, §4.1 D01–D03/D05/D06/D10, §6.1–6.5, §8. Müşterinin doğrudan kapsamı `Xinobi_Proje_Kapsami(4).md` ile çelişen bir durum varsa PM bunu Faz00 karar kaydında açar ve müşteri kararı alır.
- Ön koşul: Faz00'da kaynak sürümü ve mevcut kod envanteri (D01), ana veri sahipliği (D02) ve bu fazın başladığı commit yazılıdır. D01'de çalışan kod/altyapı bulunduysa repo, DB motoru ve framework değiştirilmez; burada verilen yollar mantıksal örnek olarak eşlenir ve fark Faz00'da belgelenir. Onaylanmış yeni repo omurgası: Next.js + TypeScript web, React + Vite + TypeScript panel, Flutter + Dart iOS/Android, ASP.NET Core Web API + worker, SQL Server ve nesne depolama. Mevcut kod veya barındırma buna uymuyorsa somut ADR ve PM kapısı olmadan yığın değiştirilmez.
- Burada gerçek ödeme, canlı müşteri verisi, Mikro veya pazaryeri transferi yapılmaz. Kimlik, veri ve asenkron çalışma temeli kurulur; e-ticaret iş kuralları sonraki fazlarda kesinleştirilir. `D02` stok/fiyat için alan bazlı sahip kararı alınmamışsa okuma/yazma yalnız örnek veriyle çalışır.
- Çıktı: tekrarlanabilir yerel ve test ortamı, sürümlü sözleşme, yetki altyapısı, migration geçmişi, audit/outbox/job/media omurgası, minimal panel kabuğu, CI doğrulaması ve geri yükleme kanıtı.

## 2. Dosya sözleşmesi ve fazdan devam etme

Yeni repo için önerilen yollar; mevcut projede eşdeğerleri Faz00'da birebir eşleyin:

```text
apps/web/                  Next.js müşteri sitesi
apps/admin/                React + Vite yetkili yönetim paneli
apps/mobile/               Flutter iOS/Android
services/api/              ASP.NET Core HTTP API, modüller ve yetki
services/worker/           outbox, zamanlanmış işler, retry
packages/contracts/        OpenAPI'den üretilen TS istemci/tipler ve sözleşme sürümü
infra/db/migrations/       EF Core veya eşdeğer sürümlü SQL migration ve açıklama
infra/dev/                 yerel SQL Server ve gerekli servisleri başlatma
docs/decisions/            teknoloji, D01/D02 ve kimlik/medya ADR kararları
docs/runbooks/             yerel kurulum, migration, restore, kuyruk yeniden işleme
tests/                     API, veri, sözleşme ve duman testleri
```

Her görev sonunda Faz00'a `faz=03`, iş maddesi, commit, değişen yollar, çalıştırılan komut/sonuç, ortam, göç sürümü, açık risk ve **sonraki tek adım** yazılır. Çalışma durursa önce Faz00, sonra çalışma ağacı ve migration geçmişi karşılaştırılır; başarılı olduğu kanıtlanmayan komut tekrar güvenle çalıştırılır. Ortam sırları veya kişisel veri Faz00'a yazılmaz.

## 3. Sırayla uygulama görevleri

| ID | İş ve uygulama yeri | Somut çıktı / bitiş kanıtı |
|---|---|---|
| 03.01 | D01 envanterini okuyup repo/DB/API seçimini `docs/decisions/ADR-001.md` içinde gerekçelendir; yeni repoda workspace, format/lint, backend çözümü ve komutları kur. | `README` tek komutla yerel kurulum ve servis başlangıcını, sürüm gereksinimlerini, portları açıklar; mevcut kod korunur. |
| 03.02 | `services/api` içinde `/api/v1/health/live` ve `/api/v1/health/ready`, modül sınırları, hata cevabı (`code`, `message`, `traceId`, alan hataları), UTC zaman, sayfalama/sıralama, correlation ID ve OpenAPI kur. | Başarısız DB'de liveness 200, readiness başarısız; hatada sır ve stack trace istemciye çıkmaz. |
| 03.03 | Kimlik: müşteri kayıt/giriş/parola sıfırlama ve doğrulama altyapısı; yönetici davet/rol atama; parola güçlü tek yönlü karma, token/oturum yenileme ve iptal. Platform/web kimlik taşıma yöntemi ve CSRF/XSS korunumu ADR'de seçilir. | Kayıt → doğrulama → giriş → oturum sonu; aynı e-postanın tekrarına açık hesap ifşası yok; yönetici kendi yetkisini yükseltemez. Gerçek e-posta servisi yoksa yerel sink. |
| 03.04 | `Role`, `Permission`, `UserRole`, rol-yetki bağlantısı ve merkezi authorization policy oluştur. Panel kaynakları için `catalog`, `content`, `media`, `pricing`, `inventory`, `promotions` (kampanya/kupon), `customers`, `orders`, `payments` (havale/EFT onayı ve iade), `quotes`, `print` (baskı operatörü), `integration`, `ai`, `reports`, `notifications`, `settings`, `audit` işlem izinleri; müşteri kendi nesneleri için sahiplik kontrolü. | API'de default deny, yetkisiz 401/403, başka müşterinin kaydı 404/403 politikaya göre; yalnız menü gizlemek yetki kabul edilmez. İlk süper yönetici güvenli bootstrap prosedürüyle kurulur. |
| 03.05 | DB ilk göçü: kimlik/rol, audit, outbox/inbox, job/attempt, dış eşleme, medya metadata çekirdeğini kur; iş modüllerinin göçleri sonraki faza kalır. SQL script/göç sırası ve indeksleri aşağıdaki modelde tanımla. | Boş veritabanında `migrate up` çalışır, tekrar çalıştırma durumu bozmaz, sürüm kaydı okunur; `migrate down` veya forward fix stratejisi belgeli. |
| 03.06 | `AuditLog`: actor, rol, işlem, entity, entity ID, before/after farkı için yalnız güvenli alanlar, timestamp, correlation ID; rol/fiyat/stok/sipariş/integration retry gibi kritik olaylara çağrı arayüzü. | Başarılı/başarısız yetkili değişiklik denemesi politika uyarınca izlenir, parola/token/ham ödeme ve PII dump yazılmaz; log yalnız denetçi yetkisiyle okunur. |
| 03.07 | `OutboxEvent` aynı DB transaction'ında iş kaydıyla yazılır, worker claim/lease ile teslim eder. `InboxEvent` tekil dış olay anahtarı ve işlenme durumu sunar; hata/backoff/dead-letter, idempotent handler şablonu kur. | Worker kapalıyken olay kaybolmaz; yeniden açılınca bir iş sonucu; iki worker aynı olayı yarışsa tek etki; terminal hata panelde görünür. |
| 03.08 | Medya soyutlaması: veride `Asset` metadata; dosya nesne depoda, kısa süreli yükleme/indirme izinleri, MIME/içerik/boyut kontrolü ve zararlı dosya taraması stratejisi. `POST /api/v1/media/uploads` ve finalize/GET metadata sözleşmesi; yüklenmiş dosya ile yetkili sahip ayrımı. | Geçersiz dosya reddi, sahipsiz/başka kullanıcının dosyası erişilemez; SQL'de ikili büyük dosya yok; yetkisiz açık bucket yok. |
| 03.09 | `apps/admin` içinde minimal `/login` ve boş dashboard, rol bazlı navigasyon, yükleme/boş/hata durumları; yaratıcı tasarımcının Faz02 tasarım tokenları ve UI/UX aktarımını uygula. `apps/mobile` API istemcisi ve kimlik kabuğu; gereksiz ürün ekranı yapılmaz. | Creative Designer → UI/UX → Frontend teslim izi `design/handoff.md`; responsive/klavye odak ve basit ekran okuyucu denetimi. |
| 03.10 | Ortamlar/işletim: `.env.example` yalnız anahtar adları, secret store, dev/test/prod ayrımı; TLS, en az yetkili SQL/nesne depo hesapları, CORS, rate limit, güvenli log; CI format, derleme, migration ve test. Yedek alma, saklama, nokta-in-time imkânı ve ayrı restore prova prosedürü. | CI yeşil; boş test DB'de göç ve restore denemesi kaydı; üretim sırrı repoda yok. RPO/RTO iş sahibi ile kararlaştırılıp Faz00'a yazılmadıysa değer uydurulmaz. |
| 03.11 | **Geçici dosya deposundan SQL Server'a geçiş.** `services/api/LocalCommerce` (`App_Data/local-commerce/state.json` + `media/`) ve tarayıcı localStorage demo hesap/sipariş kayıtları (`xinobi-demo-commerce-v1`, `xinobi-cart-v1`) için önce ADR-003 yazılır. Sonra EF Core DbContext ve ilk migration'lar kurulur, ticaret verisi SQL Server'a taşınır, yerel medya T-06 nesne depolamaya geçer, demo kimlik 03.03 gerçek kimliğiyle değiştirilir. Dosya deposu yalnız Development seed/fixture olarak kalabilir. | Aynı seed ile dosya deposu ve SQL Server API yanıtları eşleşir; `pnpm test:local-commerce` SQL Server'a karşı geçer; production'da dosya deposu ve localStorage kimlik yolu bulunmaz; geçiş ve geri dönüş adımları `docs/runbooks/` altında. |
| 03.12 | **Faz00 §3.1 teknik kararları:** T-03 oturum taşıma, T-05 barındırma, T-06 nesne depolama/CDN, T-07 zararlı dosya taraması, T-08 gözlemlenebilirlik, T-09 özellik bayrağı, T-10 CI güvenlik taraması ve T-12 yol eşlemesi ADR olarak kapatılır, ilk uygulaması yapılır. | Her karar ADR + Faz00 satırıyla kapalı; CI'da SAST, bağımlılık ve sır taraması çalışır; örnek bayrak XINOBI U'yu kapatıp açabilir; yapılandırılmış log ve correlation ID seçilen araca ulaşır. |

## 4. Asgari şema ve API sözleşmeleri

Model adları örnektir; fiziksel tablo adı farklıysa migration ve sözleşme haritasında karşılığı tutulur. `User(id, normalizedEmail UNIQUE, passwordHash, status, createdAt, rowVersion)`, `Role(id, code UNIQUE)`, `Permission(id, resource, action UNIQUE)`, `UserRole(userId,roleId UNIQUE)`, `RolePermission(roleId,permissionId UNIQUE)`. Müşteri hesabı ile yönetici rolü varsayılan ayrıdır. `AuditLog(id, actorId?, action, entityType, entityId, safeDiff, traceId, at)` append-only ve yalnız gerektiği kadar kişisel veri içerir.

`OutboxEvent(id, eventType, aggregateType, aggregateId, payloadVersion, payload, state, attempts, nextAttemptAt, leaseUntil, createdAt, processedAt)`; `(aggregateType,aggregateId,id)` ile sıralama ihtiyacı belgelenir. `InboxEvent(provider, externalEventId, eventType, payloadHash, state, receivedAt)` birleşik benzersizdir; sağlayıcı olayı ID sağlamıyorsa kanonik hash ve dönem kuralı Faz08'de karara bağlanır. `SyncJob(id, source, direction, objectType, objectId, state, attempts, nextAttemptAt, lastErrorCode, correlationId)` ve `SyncAttempt` geçmişi. `ExternalMapping(system, entityType, localId, externalId, mappingVersion)` için `(system,entityType,localId)` ve `(system,entityType,externalId)` benzersizdir. `Asset(id, ownerType, ownerId, storageKey, mime, bytes, checksum, status, createdAt)`; yalnız storageKey, açık URL tutulmaz.

API: `/api/v1/auth/register|login|refresh|logout|password-reset`, `/api/v1/admin/users|roles|permissions`, `/api/v1/admin/audit`, `/api/v1/admin/integrations/jobs` için kapsamlı auth; `/api/v1/media/uploads` ve `/api/v1/media/{id}` için nesne sahipliği. Değişiklik istekleri için sürüm/ETag veya concurrency token; OpenAPI'den TS istemci üretimi ve uyumluluk kontrolü kurulur. İstek/cevap örneklerini `packages/contracts/examples/` altında tut; sırlar örneğe girmez.

## 5. Göç, geri alma ve kurtarma

1. Her migration için önceki sürüm, SQL öncesi etki, yeni indeks/kısıt, tahmini kilit etkisi, veri dönüşümü ve idempotency varsayımını PR'a yaz. Test DB'de temiz kurulum **ve** önceki sürümden yükseltme ayrı denenir.
2. Geri uyumlu şema → uygulama → veri taşıma → eski kolonun sonraki güvenli teslimde çıkarılması sırasını kullan. Silici göçten önce doğrulanmış yedek al. Uygulama geri dönüşünün eski şemada çalışacağı yalnız test edildiyse `down` uygula; aksi durumda forward-fix ve yedekten geri yükleme kararını PM verir.
3. Restore provasında yeni boş ortamda yedekten aç, migration sürümünü ve örnek tutarlılığı kontrol et; prod verisi kullanılıyorsa maskeleme/kısıtlı erişim. Sırları restore çıktısına kopyalama.
4. Yarıda kalmada Faz00 son başarılı migration ID'sini DB migration tablosuyla kıyasla; kaydı olmayan SQL'i el yordamıyla tekrar uygulama. Son temiz yedeği ve tam hata kodunu kayda geçir.

## 6. Doğrulama ve kabul kapısı

| Kanıt | Yerel/mock sınaması | Gerçek erişim gerektiren kapı |
|---|---|---|
| Temiz kurulum ve yükseltme | Temiz SQL Server test verisi, migration/rollback veya forward-fix prova | Gerçek barındırmada yedek/restore ve izin kontrolleri, canlıya geçmeden önce |
| Kimlik/yetki | Negatif API testleri; başka kullanıcıya erişim, rol yükseltme, refresh iptali | Gerçek e-posta/SMS sağlayıcısında bağlantı ve gönderim izni sonraki entegrasyon fazında |
| Job/outbox/medya | Fake dış sağlayıcıyla kesinti, tekrar, iki worker, imzasız/bozuk dosya | Seçilen nesne depo ve işleyici ortamında erişim/restore prova |
| Web/panel/mobil temel | Tasarım el teslimi ve ortak API istemcisi; cihaz duman testi | Gerçek mobil sertifikalar ve dağıtım hedefi sonraki fazlarda |

**Mevcut durum notu (2026-10-07):** 03.01, 03.02 ve CI kısmen yapıldı. **03.05 kod tarafı tamam** (TST-091): `services/shared/Xinobi.Persistence`, migration `InitialCore`, `infra/db/migrations/0001_InitialCore.{idempotent,rollback}.sql`; XinobiYeniDB'ye uygulama SQL portu erişimi açılınca yapılacak. Oturum, barındırma ve depolama kararları ADR-004'te. **03.04 kod tarafı tamam** (TST-100): izin kataloğu, `super_admin`, merkezi `RequirePermission` politikası, varsayılan ret, konsoldan ilk süper yönetici (`docs/runbooks/super-admin-bootstrap.md`); panel uçlarının yetkiye geçmesi ve rol yönetim ekranı SQL kimlik deposuyla (03.11). 03.03 geliştirme deposuyla çalışıyor (TST-098/099); 03.06–03.08 henüz yok. Faz04–06/10 için yazılan demo kod bu çekirdeğe bağlanmadan ilgili faz kabulüne girmez.

**Geçiş:** 03.01–03.12 kanıtları, CI, migration/restore sonucu, OpenAPI sürümü, kullanıcı sahipliği negatif testleri, `docs/decisions` ve Faz00 kaldığı yerden devam kaydı tamamlanır. Test erişimi olmayan bir sağlayıcıyı gerçek çalışıyor saymayın; erişim sahibi, eksik izin, bloklanan test ve plan Faz00'a yazılır. D01 nedeniyle değişen yollar açıklanır. D02/D10 açık ise ilgili gerçek veri yazımı ve saklama politikasına bağımlı iş koşullu tutulur.

**09.10.2026 uygulama güncellemesi:** 03.05 artık gerçek `XinobiYeniDB` üzerinde uygulanmıştır ([TST-110](../test/2026-10-09/TST-110-initial-core-migration-application.md)). Boş hedef ön kontrolü, model/script testleri 12/12, 12 çekirdek tablo ve 1 migration sürümü, ikinci uygulamada aynı metadata ve API SQL readiness başarılı. Önceki SQL erişim blokajı son kontrolde yoktur. İş modülleri ve SQL depoları henüz bağlanmadı; restore provası ve hesap ayrımı bu kanıtla kapanmaz, faz kabulü verilmez.

**09.10.2026 katalog hazırlığı:** [TST-111](../test/2026-10-09/TST-111-sql-catalog-preparation.md): 0002 katalog migration'ı, SQL depo, mevcut sözleşmeyi koruyan facade ve doğrulamalı aktarım hazır; tam .NET 315 geçti / 1 gerçek SQL testi atlandı, Release 0/0. COPY_ONLY/CHECKSUM yedeği alındı; `RESTORE VERIFYONLY` Msg262 sunucu yetkisi nedeniyle başarısız olduğundan DBA kontrolü bekleniyor. Katalog migration'ı, gerçek SQL entegrasyon testi ve yerel aktarım henüz yapılmadı; Development mevcut dosya deposuyla devam eder. Hesap/sipariş ve diğer modüllerin SQL bağlantısı ayrı sonraki işlerdir.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~75 % · kalan ~25 % · Statü: Devam**

**16.10 güncellemesi (kod/commit incelemesi):** Yönetici daveti/rol atama, ayrı personel-müşteri oturumları, e-posta MFA ve yönetici kurtarma eklendi (`fc715ec`, `c618feb`); 0006–0009 migration dosyaları mevcut, hedef SQL uygulama kanıtı bu denetimde doğrulanmadı. Audit için güvenli alanların önce/sonra farkı ve roller `TransactionalAudit` içinde var; tüm kritik modül kapsamı ayrıca doğrulanmalı. CI Dart SDK/izole fixture ve bağımlılık düzeltmeleri eklendi (`18888a4`, `5cbe7da`, `ef66c03`, `456444e`). Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

**20.10 güncellemesi:** Panel isteklerinde ortak personel oturum yenilemesi, API’nin verdiği gerçek yetkilerin gösterilmesi, eski/ yetkisiz işlemlerin engellenmesi ve audit kayıtlarının Türkçe sunumu (`697ec23`, `51eca15`, `7a84da0`, `9ecc480`, `ccb5d22`); maskeli salt okunur müşteri dizini (`b4d37ca`). İzole kabul: .NET 429/24/0 ([admin-technical-acceptance](../test/2026-10-19/admin-technical-acceptance.md)); gerçek oturum açmış tarayıcı kabulü yapılmadı. **Yeni açık:** `AuthorizationTests.OnlyListedAreasArePublic` başarısız (anonim `commerce-mask/.../rendering-inputs`, TST-130) — izinli listeye ekleme veya anonim erişimi geri alma kararı. Kalıcı ayar yazma sözleşmesi/şeması yok. Oran değişmedi. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

| ID | Durum | Kanıt / eksik |
|---|---|---|
| 03.01 | Tamam | README, pnpm/dotnet araç zinciri, `pnpm dev:local:background` |
| 03.02 | Tamam | `/api/v1/health/live|ready`, `RequestCorrelationMiddleware`, OpenAPI + TS/Dart istemcileri |
| 03.03 | Tamam (kod) | Kayıt/giriş/yenileme/çıkış, e-posta doğrulama kodu, web cookie+CSRF, mobil refresh (TST-098/099); **parola sıfırlama 14.10’da eklendi** (hesap ifşa etmez, tüm oturumları kapatır; web+mobil, [TST-117](../test/2026-10-14/TST-117-password-reset.md)). Yönetici daveti/rol atama ve MFA eklendi (`fc715ec`, `c618feb`); güncel uçtan uca test bu denetimde çalıştırılmadı |
| 03.04 | Tamam | İzin kataloğu, `RequirePermission`, panel uçları personel oturumuna bağlı (`12f543c`, TST-100/114) |
| 03.05 | Tamam | 0001 XinobiYeniDB’ye uygulandı (TST-110) |
| 03.06 | Kısmi (14.10) | `AuditMiddleware` panel/yönetim değişiklik denemelerini (başarılı, 4xx, 401/403, 5xx) aktör/işlem/kayıt/sonuç/istek no ile `ops.AuditLogs`’a yazar, gövde saklanmaz; `GET /local-commerce/audit` yalnız `audit.read`; panelde Denetim kaydı ([TST-116](../test/2026-10-14/TST-116-audit-trail.md)). Güvenli alan bazlı önce/sonra farkı ve rol eklendi (`fc715ec`, `TransactionalAudit`); tüm kritik modüllerin kapsam doğrulaması açık |
| 03.07 | Kısmi | Outbox sahiplenme ve SQL’de işçiler (`7db18d6`); inbox yalnız tablo; dead-letter/panel yok; `services/worker` hâlâ şablon döngü |
| 03.08 | Kısmi | `IFileStore` (`fa8d720`), MIME/görüntü doğrulama; kısa ömürlü imzalı URL, `/api/v1/media/uploads` finalize sözleşmesi ve zararlı içerik taraması (T-07) yok |
| 03.09 | Tamam | Panel girişi/rota izinleri, mobil kimlik kabuğu |
| 03.10 | Kısmi | CI (`.github/workflows/ci.yml`), rate limit, HTTPS ARR (`c88ea3e`); yedek VERIFYONLY Msg262, restore provası ve RPO/RTO yok |
| 03.11 | Kısmi | Katalog, hesap, sipariş, özellik belgeleri SQL’de (TST-113); canlı IIS SQL katalog (DEPLOY-008 hazırlandı). Sepet tarayıcıda (`xinobi-cart-v1`), XINOBI U oturumları SQL’de değil, `state.json` Development’ta duruyor |
| 03.12 | Kısmi | T-03/T-05/T-06 kapandı (ADR-004); T-07, T-08, T-09 (yalnız `XinobiU:Enabled`/`Features:*` ayarları), T-10, T-11 açık |

**Sonraki adım:** yönetici yaşam döngüsünü güncel SQL ortamında doğrulamak; 03.10 restore provası.

## 7. Yedi rol kontrolü ve PM son kararı

**09.10.2026 devam güncellemesi:** [TST-112](../test/2026-10-09/TST-112-customer-schema-and-backup-retry.md): VERIFYONLY tekrarında sunucu yetkisi hatası sürüyor. 0003 hesap profili, hash oturumları, adres ve sipariş şeması/migration'ı hazırlandı, .NET 321 geçti / 1 gerçek SQL testi atlandı. 0002/0003 gerçek SQL'e uygulanmadı; yerel veri ve mevcut IAccountStore değiştirilmedi. SQL hesap deposu/aktarımı, yedek doğrulama, yetki ayrımı ve restore provası hâlâ açık.

Her rol ayrı bir kayıt ekler: `rol | karar: bekliyor/onay/revizyon | kanıt bağlantısı/commit | açık nokta | tarih`. Bu doküman yazıldığında tamamı **BEKLİYOR** durumundadır; otomatik veya hayali imza yoktur.

| Rol | Gözden geçirilecek ölçüt | Karar |
|---|---|---|
| İş Analisti | Aktör, D01/D02/D10 ve faz sınırı kaynakla uyumlu | Bekliyor |
| Sr. Creative Designer | Panel kabuğu görsel yönü ve UI/UX teslimi uygulanabilir | Bekliyor |
| Sr. Frontend Developer | Web/mobil istemci, durumlar, erişilebilirlik ve sözleşme | Bekliyor |
| Sr. Backend Developer | API, auth, outbox, concurrency ve hata modeli | Bekliyor |
| DB Admin | Anahtarlar, migration, yedek/restore, sorgu indeksleri | Bekliyor |
| Sr. Full Stack Developer | Ortam/CI ve web–mobil–API birlikte açılıyor | Bekliyor |
| CTO Advisor (ek zorunlu rol) | Barındırma, nesne depolama, gözlemlenebilirlik ve güvenlik taraması kararları; dosya deposundan çıkış | Bekliyor |
| Proje Yöneticisi (SON KAPI) | Altı rolün kanıtı, müşteri kararları, riskler ve Faz00 güncel | Bekliyor |

Herhangi bir rol `revizyon` derse görev sahibi düzeltir ve rol tekrar bakar. Altı rolün onayı ve gereken müşteri kararları olmadan PM onay veremez; PM onayı olmadan sonraki fazın bağımlı işi başlamaz. Faz00 karar tablosu gerçek uygulama sırasında doldurulur.
