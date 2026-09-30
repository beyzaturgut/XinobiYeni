# Faz00 — Xinobi yürütme, karar ve kesintiden devam defteri

> **Bu dosyanın ilk hali bir plan ve doldurulabilir çalışma kaydıdır.** Henüz geliştirme, test, müşteri kararı veya canlı yayın tamamlanmış değildir. Her çalışma oturumu başında okunur, anlamlı her değişiklikten sonra ve oturum kapanışında güncellenir.

## 0. Önce bunu oku

1. Kaynak sıra: müşteri kapsamı `Xinobi_Proje_Kapsami(4).md` → hazırlanan kavramsal/teknik analiz `Xinobi_Kavramsal_ve_Teknik_Analiz.md` (kalıcı dosya adı `Xinobi_Kavramsal_ve_Teknik_Analiz(1).md`) → bu Faz00 → ilgili Faz01–Faz11 → mevcut kod/ADR/gerçek test kanıtı. **Yeni depoda ilk iş**, Library'deki bu iki var olan kaynağı `docs/sources/` altına salt okunur kopya olarak alıp özgün ad, sürüm/tarih ve doğrulanmış yol eşlemesini Faz00'a yazmaktır; kaynak okunamıyorsa kapsam işini başlatma. Kaynaklar çelişirse müşteri kapsamında açık teslimi silme; çelişkiyi karar kaydına taşı.
2. Çalışma başlangıcında bu dosyanın **Anlık durum**, **Blokajlar**, **Kesintiden devam** ve ilgili fazın önkoşul bölümünü oku; ardından `git status --short`, `git branch --show-current`, `git log -1 --oneline`, çalışma ortamı ve ilgili test komutlarını doğrula. Git deposu henüz yoksa Faz01'de mevcut repo/yeniden kullanım D01 kararıyla kurulacak.
3. Değişiklikten önce görevi küçük, doğrulanabilir adıma ayır; değişiklikten sonra gerçek komutu ve sonucunu kaydet. Üretim sırlarını, erişim anahtarlarını, müşteri kişisel verilerini veya gerçek bağlantı dizelerini asla Faz00'a yazma.
4. Bir hata/ara verme olursa yalnız **başarıyla biten** adımı işaretle; yarım dosyaları, hata mesajını ve güvenli yeniden başlatma komutunu yaz. Bir sonraki geliştirici Faz00 ile kodu karşılaştırır; kod kanıtsızsa önce doğrular.
5. Fazı yalnız yedi rolün uygulama inceleme kayıtları ve PM'nin **ayrı, açık son onayı** sonrası `Tamamlandı` yap. Doküman inceleme onayı, uygulamanın yapıldığı anlamına gelmez. PM şart gözetmeksizin her kapıyı değerlendirir; şart eksikse `RED` ve eksik kanıt verir.
6. Her test, build, lint, smoke, bağlantı veya entegrasyon doğrulaması sonrasında sonucu `test/` altında tarihli rapora ve `test/INDEX.md` indeksine işle. Başarısız denemeyi silme; düzeltme ve başarılı tekrar kimliğini bağla. Faz00 yalnız son özeti taşır, ayrıntılı kanıt `test/` klasöründedir.

## 1. Sınır ve teslim haritası

Toplam **12 dosya: Faz00–Faz11**. Faz00 bir kere yazılıp bırakılmaz; uygulama boyunca güncellenen tek ilerleme defteridir. Fazlar bağımlılığa göre yürür, uygun alt işlerin paralelliği Faz00'a yazılır. Tüm son kapsam: kurumsal web/CMS/SEO, B2C, panel, kişiselleştirme/editör/baskı, kurumsal teklif/toplu sipariş, Mikro, Trendyol–Hepsiburada–N11, AI tasarım ve satış asistanı/yönetimi, iOS/Android, test/eğitim/canlı geçiş.

| Dosya | İş paketi | Zorunlu bağımlılık | Başlangıç uygulama durumu |
|---|---|---|---|
| Faz00 | Bu kayıt, karar, değişiklik ve onay mekanizması | — | Plan dosyası hazır; uygulama yapılmadı |
| Faz01 | Keşif, D01–D10, iş akışları, ADR ve sözleşmeler | Faz00 | Planlandı |
| Faz02 | Creative yön, UI/UX, tasarım sistemi ve handoff | Faz01 temel marka/akış girdisi | Planlandı |
| Faz03 | Monorepo, API, SQL Server, güvenlik/rol, altyapı | Faz01 mimari/erişim kararları; panel 03.09 için Faz02 tasarım teslimi | Planlandı |
| Faz04 | Katalog, stok, fiyat, promosyon, CMS, SEO; gerçek dashboard, temel rapor ve sistem ayarları | Faz02 görselleri + Faz03 veri/API | Planlandı |
| Faz05 | B2C web, müşteri yönetimi, sepet/ödeme, sipariş/kargo/iade, ürün ve sipariş değerlendirmesi, e-posta/SMS/bildirim yönetimi | Faz03–04; D03/D05 | Planlandı |
| Faz06 | Basit kişiselleştirme, editör, baskı | Faz02–05; D04 | Planlandı |
| Faz07 | Teklif, kurumsal müşteri yönetimi ve toplu sipariş | Faz03–04; D07 | Planlandı |
| Faz08 | Mikro | Faz03–05; D02/D06 | Planlandı |
| Faz09 | Üç pazaryeri ve merkezi sipariş | Faz03–05; D02/D06 | Planlandı |
| Faz10 | AI tasarım ve satış asistanı/yönetimi | Faz03–04/06–07; D05/D08 | Planlandı |
| Faz11 | iOS/Android, bütünleşik UAT, eğitim, canlı/mağaza | Önceki modüllerin kabulü; D09/D10 | Planlandı |

**Paralellik:** Mobil tasarım/Faz11 kabuğu Faz02–03'te, editör/mobile API sözleşmeleri Faz06'da başlayabilir. Faz08–10 bağlayıcılarının mock sözleşmeleri erken geliştirilebilir; gerçek uçtan uca kabul erişim ve müşteri kararına bağlıdır. Faz11'in final kapısı diğer tüm modülleri birleştirir.

## 2. Ekip, görev ayrımı ve onay

Yedi rolün her biri **20+ yıl deneyimli uzman bakışını temsil eden çalışma rolüdür**; burada gerçek kişilerin öz geçmişi veya imzası iddia edilmiyor. Uygulamayı yürütecek gerçek kişiler bu alanlara kendi adını/kanıtını ekler.

| Rol | Sorumluluk ve her fazda inceleme sorusu |
|---|---|
| PM (lead) | Bağımlılık, kapsam, risk, karar, kanıt, tüm rol değerlendirmeleri; **her koşulda nihai KABUL/RED** |
| İş Analisti | Kaynak gereksinimi, iş kuralı, senaryo/UAT, ürün sahibinin karar ve kapsam sahipliği |
| Sr. Creative Designer | Marka ve görsel yön, bileşen/varlık teslimi, görsel kalite, baskı ve mobil uygunluğu |
| Sr. Frontend Developer | Creative tesliminin UI/UX uygulanışı, web/panel/editör erişilebilirliği ve responsive davranış |
| Sr. Backend Developer | API, ödeme/sipariş tutarlılığı, adapter/AI güvenliği ve hata/tekrar işleme |
| DB Admin | Veri sahipliği, SQL Server bütünlüğü, migration, yedek/geri yükleme ve sorgu/erişim |
| Sr. Full Stack Developer | Web/mobil/API uçtan uca sözleşme, dağıtım, test ve geri alma |

**Creative → UI/UX → Frontend teslim sözleşmesi:** Designer marka konsepti, tokenlar, ekran prototipi, varlık lisansı, baskı yerleşimi ve durumları üretir. UI/UX sorumluluğunu Designer (akış/görsel) ile Frontend (etkileşim/erişilebilirlik/uygulama) ortak taşır. Frontend `handoff kabul` kaydı, eksik durum/ölçü/asset listesini Faz00'a işler; kabulden sonra bile tasarıma uymayan ekran bitmiş sayılmaz. Yedi rolün yanında ayrı bir UI/UX kadrosu varmış gibi onay yazılmaz.

**İki ayrı onay türü:** (a) şimdi verilen **plan dokümanı incelemesi**, yedi temsili rolün 12 dosyanın tutarlılığına bakması; (b) gelecekte her fazın **gerçek uygulama kabulü**, kod/test/görsel kanıtı ve gerçek iş sahibinin gerekli ürün kararı. İlk tür ikinci yerine geçmez. Bir fazın onay tablosundaki boş alan `BEKLİYOR` kalır; PM dahil onaylar önceden doldurulmaz. PM ret gerekçesi ve düzeltme adımı yazar; bağımlı faza geçiş durur.

## 3. Teknik çalışma sözleşmesi

**Onaylanmış uygulama yığını (ADR-001):** kurumsal web/B2C için Next.js + React + TypeScript; yönetim paneli için React + Vite + TypeScript; ortak UI tokenları; API ve arka plan işleri için ASP.NET Core/C#; veri için SQL Server + EF Core migrations; iOS/Android için Flutter + Dart; dosya/baskı varlıkları için erişim kontrollü nesne depolama; modüler monolit + ayrı worker ve SQL outbox/inbox. Docker ve Kubernetes kullanılmaz. Sürümler resmi uyumluluk tablolarına göre sabitlenir ve lockfile'a işlenir. Mobil editör, ödeme ve push uyumu D09'da gerçek cihazla doğrulanır.

**Önerilen repo sözlüğü:** `apps/web`, `apps/admin`, `apps/mobile`, `services/api`, `services/worker`, `packages/contracts`, `packages/ui`, `infra/db/migrations`, `design` (Faz02 kaynak ve handoff), `docs/decisions`, `tests`. C# paketleri TS paketlerine kaynak olarak otomatik kopyalanmaz; OpenAPI'den tipli istemci üretilir ve CI'da sürüm farkı denetlenir. Repo varsa yerleşimi bozma: mevcut gerçek yolları Faz00'da düzelt, bu haritayı yalnız örnek kabul et.

**Ortak API/veri ilkeleri:** Açıkça `/api/v1` sürümü, `requestId`, UTC zaman, tutar için para birimiyle decimal, müşteri ve panel nesne yetkisi, hatalarda kod/mesaj/alan, sayfalama; `variantId` ürün ekranından editör, sepet ve siparişe aynı kalır. Sunucu fiyat/vergi/indirim/kişiselleştirme/stok otoritesidir; `(channel, externalOrderId)`, ödeme sağlayıcı işlem ID ve checkout idempotency benzersiz; `OrderLine` anlık görüntüsü ve `DesignVersion` değişmez; outbox aynı yerel transaction'da. D02 veri sahipliği ve D03 ödeme/rezervasyon kapanmadan ilgili şema ve davranış kesinlenmez. Gereken tüm dış sistemlerde `IProviderAdapter` benzeri arayüz, mock/sandbox ve gerçek adaptör ayrılır. **Mock testi gerçek entegrasyon kabulü değildir.**

**Yerel çalışma varsayımı:** Mac üzerinde SQL Server'a bağlantı yöntemi (erişilebilir geliştirme SQL Server örneği/container/uzak test sunucusu), .NET ve JS araçları Faz01'de doğrulanır; DBeaver yalnız SQL istemcisidir, sunucu değildir. Hiçbir ücretli bulut kaynağı gerçek hesap/limit kontrolü yapılmadan zorunlu sayılmaz. `.env.example` yalnız anahtar isimleri içerir. Komutların gerçek hali repo kurulduktan sonra aşağıya yazılır.

## 4. Müşteri kararları ve blokaj kaydı

Analizdeki D01–D10 hiçbirine bu plan **müşteri kararı verilmiş** demez. Her satır gerçek sahibi, tarih, kanıt URL/dosya, tercih, alternatif, etkilediği faz ve PM kaydı ile doldurulur. Bu tablo ilk andaki blokaj haritasıdır.

| ID | Karar | Bağlı işler | Durum / kanıt |
|---|---|---|---|
| D01 | Mevcut kod/veri ve yeniden kullanım | Faz01–03 | Kısmi karar · mevcut uygulama kodu yok, sıfırdan yeni geliştirme; private monorepo ve araç zinciri doğrulandı. Mevcut operasyon/veri örneği ve barındırma envanteri bekliyor |
| D02 | Ürün-varyant-fiyat-stok ana kaynak ve Mikro yazma yönü | Faz04,08,09 | Açık / operasyon + Mikro sahibi |
| D03 | Sipariş/ödeme, havale, stok rezervasyon, iptal-iade/kargo | Faz05,08,09,11 | Açık / satış-operasyon |
| D04 | Baskı tekniği, fiziksel alan, çıktı ve onay | Faz06,11 | Açık / üretim |
| D05 | Ödeme/kargo/SMS/e-posta/AI ve destek erişimleri | Faz05,10,11 | Açık / sağlayıcı hesapları |
| D06 | Mikro sürüm/API ve üç pazaryeri mağaza/sandbox | Faz08,09 | Açık / entegrasyon sahipleri |
| D07 | Tekliften toplu siparişe onay ve fiyatlama | Faz07 | Açık / kurumsal satış |
| D08 | AI alternatif/limit/politika/maliyet | Faz10 | Açık / ürün sahibi |
| D09 | Mobil editör tekniği, push, mağaza hesapları | Faz11 | Açık / ürün + mobil |
| D10 | Hukuki sayfalar, rıza, saklama | Faz04,05,10,11 | Açık / hukuk-operasyon |

Blokaj nedeniyle bağımsız iş ve mock yapılabilir; ilgili faz **gerçek entegrasyon/iş kabulü** alınmaz. Bu kararlar Xinobi iş sahibine aittir; geliştirici tahminini `varsayım` yazabilir, gerçek onay diye işaretleyemez.

## 5. Anlık durum — her oturum başında güncelle

| Alan | Şu anki kayıt |
|---|---|
| Son güncelleme ve sorumlu | 2026-09-30 · Codex uygulama oturumu; uzak SQL erişimi ve sürekliliği yeniden değerlendirildi |
| Aktif faz/görev ID | Faz02 / v0.3.0 WEB-004 ürün detay-varyant; Faz01 D02/D04 gerçek fiyat-stok/baskı davranışını blokeliyor |
| Repo/branch/HEAD | `main` · health değişiklikleri öncesi `5079ddf`, origin/main ile eşit · origin `https://github.com/beyzaturgut/XinobiYeni.git` (private) |
| Geliştirme/test/canlı ortamları | macOS + Docker'sız CI; uzak SQL Server 2022 Express ve boş `XinobiYeniDB` TST-017'de doğrulandı; geçici TCP kesintileri izlenecek |
| Son çalışan uygulama komutu/URL | Güncel Next.js production build `http://localhost:3010`; ürün detay `http://localhost:3010/urunler/cay-makinesi-101` HTTP 200 |
| Son test komutu ve sonucu | TST-020: WEB-004 lint/build/TypeScript, 6/6 statik sayfa ve HTTP varyant/bekleme durumları başarılı; browser interaction QA açık |
| Değişen dosyalar / migration | WEB-004 ürün detay, dört renk varyantı, özellik/Studio bekleme alanı, design v0.3.0 ve TST-020; migration yok |
| Aktif hata/yarım iş | WEB-001/002/004 görsel ve interaction QA açık. D02 olmadan gerçek fiyat-stok/varyant API; D04 olmadan baskı alanı kesinleşmedi. Faz01 rol/PM girdileri ayrıca açık |
| Sonraki en küçük güvenli adım | WEB-005 basit kişiselleştirme görsel/etkileşim kabuğunu D04 ölçüsü uydurmadan başlat |
| Geri alma / devam noktası | `7a5b901` doğrulanmış ve pushlanmış API sözleşme testi tabanı; migration ve dış sistem yazımı yok |

### Oturum kaydı şablonu — yeni satır üste

| Tarih/saat TR | Faz/görev | Branch / commit öncesi-sonrası | Yapılan dosya ve işlem | Çalıştırılan komut/sonuç | Kanıt | Sonraki atomik adım | Kim |
|---|---|---|---|---|---|---|---|
| 2026-09-30 | Faz02 v0.3.0 / WEB-004 | `main` / `af74060` | Çay Makinesi 101 detay; dört renk seçimi, güvenli satın alma bekleme, özellik ve Studio placeholder | TST-020: lint/build/6 statik sayfa, route HTTP 200 ve dört varyant adı başarılı | `apps/web/src/app/urunler/cay-makinesi-101/*`, `test/2026-09-30/TST-020-*` | WEB-005 basit kişiselleştirme kabuğu | Codex |
| 2026-09-30 | Faz02 v0.2.0 / WEB-002 | `main` / `c3faa18` | 10 demo varyantlı katalog; arama, kategori, sıralama, sonuç/boş durum; ana CTA bağlantıları | TST-019: lint/build/5 statik sayfa ve `/urunler` HTTP 200; browser interaction QA açık | `apps/web/src/app/urunler/*`, `test/2026-09-30/TST-019-*` | WEB-004 ürün detay görsel kabuğu | Codex |
| 2026-09-30 | Faz02 v0.1.0 / WEB-001 | `main` / `57b6d93` | Logo/demo ürün envanteri, Inter tabanlı tokenlar, ekran envanteri ve responsive ana sayfa uygulandı | TST-018: lint/build/static render ve HTTP asset smoke başarılı; görsel browser QA bekliyor | `design/*`, `apps/web/src/app/*`, `test/2026-09-30/TST-018-*` | WEB-001 gerçek tarayıcı responsive görsel QA | Codex |
| 2026-09-30 | Faz01 SQL ortam envanteri | `main` / `efd08af` | SQL sürüm/edition, DB durum/collation, tablo/migration sayısı ve login yetkileri salt okunur sorgulandı | TST-017 başarılı; SQL 2022 Express, boş DB, db_owner doğrulandı | `tools/sql/read-only-environment-inventory.sql`, `test/2026-09-30/TST-017-*` | D02/D03/D07 iş sahibi girdilerini al | Codex |
| 2026-09-30 | Faz01 karar toplama | `main` / `2abb59e` | D01–D10 için sahip/tarih/kanıt formatlı tek karar formu hazırlandı; tam `nc` komutu tekrar kaydedildi | TST-015 bloke; TST-016 belge kontrolü başarılı | `docs/discovery/stakeholder-decision-intake.md`, `test/2026-09-30/TST-015-*`, `TST-016-*` | İş sahiplerinden öncelikle D02/D03/D07 girdilerini al | Codex |
| 2026-09-30 | Faz01 D02/D03/D07 hazırlığı | `main` / `8e872a7` | Alan bazlı veri sahipliği; sipariş/ödeme/stok/teklif öneri durumları; dış durum eşleme ve karar listesi hazırlandı | Belge yapısı, açık karar işaretleri ve diff kontrolü TST-014 ile doğrulandı | `docs/discovery/data-ownership-and-state-transitions.md`, `test/2026-09-30/TST-014-phase01-data-state-document.md` | Gerçek iş sahiplerinden D02/D03/D07 yanıtlarını al | Codex |
| 2026-09-30 09:26 | Faz01 SQL ortam envanteri | `main` / `8e872a7` | TST-012 başarısı sonrası sürüm/şema/yetki metadata sorgusu ve ham TCP süreklilik kontrolü yapıldı | TST-013: iki kontrol de login öncesi timeout; DB yazımı/migration yok | `test/2026-09-30/TST-013-sql-availability-recheck.md` | Sunucu erişilebilirken aynı salt okunur envanteri tekrarla | Codex |
| 2026-09-29 23:37 | Faz01 SQL login | `main` / `8e872a7` | Uygulamaya özel `xinobiyeni_app` ile uzak DB, login ve instance salt okunur sorguyla doğrulandı | TST-012: başarılı, çıkış kodu 0 | `test/2026-09-29/TST-012-sql-login-xinobiyeni-app.md` | SQL sürüm/şema/yetki envanteri | Codex |
| 2026-09-29 | Faz01 SQL login | `main` / `a3f37f3` | 64019 üzerinden XinobiYeniDB/master ve iki kullanıcı adı biçimiyle salt okunur SQL oturumu denendi | TST-011: ağ başarılı; üç giriş de `Login failed for user` | `test/.../TST-011-sql-login-on-64019.md` | Mixed Mode + ayrı SQL Login + Keychain güncellemesi | Codex |
| 2026-09-29 | Faz01 SQL aday port | `main` / `3da1c41` | `109.104.120.91:64019` ham TCP erişimi test edildi | TST-010: bağlantı başarılı, çıkış kodu 0 | `test/.../TST-010-sql-external-port-64019.md` | 64019 üzerinden SQL login ve DB seçimi | Codex |
| 2026-09-29 | Faz01 SQL erişim kanıtı | `main` / `a07c242` | Kesin TCP 1433 bilgisiyle ham bağlantı ve doğrudan sqlcmd/XinobiYeniDB yeniden denendi; kaynak genel IP belirlendi | TST-009: nc ve ODBC timeout; SQL kimlik doğrulamaya ulaşılmadı | `test/.../TST-009-sql-1433-external-connectivity.md` | Sunucuda LISTEN + Windows/AWS ağ kuralı kanıtı; Faz01 girdileri | Codex |
| 2026-09-29 | Faz03/03.02 health | `main` / `5079ddf` → yerel commit tamam, push bekliyor | DB bağımsız liveness; gerçek SqlClient bağlantı probe'lu readiness; güvenli 503 kodları; TS/Dart istemci üretimi | TST-008: ilk 8/8, başarı yolu sonrası 9/9; tüm web/mobil/istemci regresyonları; temiz commit üzerinde iki drift kontrolü başarılı | `SqlServerReadinessProbe.cs`, `ReadinessResponse.cs`, `test/.../TST-008-liveness-readiness.md` | Standart API hata gövdesi | Codex |
| 2026-09-29 | Faz03/03.02+03.09 Dart istemci | `main` / `400917c` → yerel commit tamam, push bekliyor | OpenAPI Generator 7.25.0 ile Dart/Dio+BuiltValue istemci; Flutter path dependency; serializer/mobil sözleşme testleri; CI drift | TST-007: ara pnpm/serializer/template sorunları düzeltildi; .NET 6/6, Dart 1/1, Flutter 2/2, TS/web/panel ve temiz commit drift kontrolleri başarılı | `packages/clients/dart`, `apps/mobile/test/api_client_contract_test.dart`, `test/.../TST-007-openapi-dart-flutter-client.md` | Liveness/readiness ayrımı | Codex |
| 2026-09-29 | Faz03 SQL erişim tekrarı | `main` / `f957ab2` | TCP/IP etkinleştirme sonrası 1433, named SQLEXPRESS ve doğrudan sqlcmd bağlantısı yeniden denendi; parola Keychain dışında tutuldu | TST-006: üç deneme de ağ/instance katmanında timeout; login ve DB seçimine ulaşılamadı | `test/.../TST-006-sql-server-connectivity-retry.md` | Gerçek sabit TCP portu + servis restart + firewall/NAT doğrulaması | Codex |
| 2026-09-29 | Faz03/03.02 OpenAPI istemcisi | `main` / `7a5b901` → yerel commit tamam, push bekliyor | Build-time OpenAPI, açık health DTO şeması, ortak tip güvenli TypeScript istemci ve CI drift kontrolü | TST-005: ilk TS peer ve anonim yanıt şeması sorunu düzeltildi; .NET 6/6, TS/web/panel ve Flutter regresyonları; deterministik hash ve temiz commit üzerinde gerçek drift komutu başarılı | `packages/contracts`, `packages/clients/typescript`, `test/.../TST-005-openapi-typescript-client.md` | Flutter/Dart istemci üretimi ve drift kontrolü | Codex |
| 2026-09-29 | Faz03 erken API sözleşmesi | `main` / `b51e6fd` → commit bekliyor | WebApplicationFactory ile gerçek uygulama health, request ID, 404 Problem Details ve OpenAPI testleri eklendi | TST-004: iki Release doğrulaması 0 uyarı/0 hata ve 6/6 test; diff, rapor indeksi ve sır taraması başarılı | `ApiContractTests.cs`, `test/.../TST-004-api-contract-integration.md` | OpenAPI istemci üretme stratejisi ve drift kontrolü | Codex |
| 2026-09-29 | Faz03 erken CI | `main` / commit bekliyor | Docker'sız GitHub Actions: .NET Release build/test, pnpm frozen lint/build, Flutter analyze/test; salt okunur izin ve concurrency | TST-003: tüm hedefler başarılı; bir yerel Flutter dizin hatası kaydedilip doğru dizinden geçti | `.github/workflows/ci.yml`, `docs/operations/ci.md`, `test/.../TST-003-ci-workflow.md` | Push sonrası gerçek Actions sonucunu izle; SQL CI job'u erişim gelene kadar ekleme | Codex |
| 2026-09-29 | Faz00/test raporlama | `main` / commit bekliyor | Kök `test/` klasörü, indeks, rapor şablonu ve bugüne kadarki 27 tekil test/bağlantı kaydı oluşturuldu; gelecekte her test için zorunlu kayıt kuralı eklendi | Rapor bütünlük ve diff kontrolü bekliyor | `test/README.md`, `test/INDEX.md`, `test/2026-09-29/TST-001-initial-validation-history.md` | Her yeni testte indeks ve tarihli raporu güncelle | Codex |
| 2026-09-29 | Faz01/01.07,01.12 | `main` / commit bekliyor | Sağlayıcı/test erişim matrisi, Creative brief girdisi ve faz bağımlılık/UAT planı hazırlandı; erişim varmış gibi işaretlenmedi | `git diff --check` bekliyor | `provider-access-inventory.md`, `creative-brief-input.md`, `phase-dependency-uat-plan.md` | Gerçek iş sahibi/erişim girdisi olmadan dur; Faz01'i kapatma | Codex |
| 2026-09-29 | Faz01/01.11 sözleşmeler | `main` / commit bekliyor | API kuralları ve modül sözleşme taslağı; `X-Request-Id`, Problem Details 404 ve otomatik middleware testleri | İlk test eski restore grafiğiyle 2 hata; `dotnet restore` sonrası build 0 uyarı/hata, 3/3 test; health 200 ve problem 404 smoke başarılı | `docs/contracts/*`, `RequestCorrelationMiddleware.cs`, testler | Müşteri karar girdileri; bağımsız faz plan/kapı dosyası | Codex |
| 2026-09-29 | Faz01/01.02–01.10 hazırlık | `main` / commit bekliyor | As-is/to-be görüşme ve kanıt formu; D01–D10 sahip/kanıt/etki/geri dönüş karar defteri oluşturuldu; bilinmeyen kararlar doldurulmadı | `git diff --check` bekliyor | `docs/discovery/as-is-to-be.md`, `decision-register.md` | Yetkili iş sahibi girdilerini ve maskeli örnekleri al | Codex |
| 2026-09-29 | Faz01/01.01 + D01 | `main` / commit bekliyor | Kapsamdaki 366 madde ve Android eşliği için 367 tekil gereksinim satırı; faz/yüzey/API/veri/UAT/D kararı eşlemesi ve ortam envanteri üretildi | Generator iki kez aynı hash; satır kapsam testi 367/367; `git diff --check` başarılı | `docs/discovery/requirements-traceability.csv`, `environment-inventory.md` | As-is/to-be operasyon girdilerini topla | Codex |
| 2026-09-29 | Faz01/F01-D01 + Faz03 erken iskelet | `main` / `2b6099b` | .NET API/worker/shared/test, Next.js web, Vite admin ve Flutter mobil iskeleti; sürümler sabitlendi; API sağlık ucu eklendi; private origin'e pushlandı | .NET build/test, pnpm lint/build, Flutter analyze/test başarılı; health 200 | `XinobiYeni.slnx`, `apps/*`, `services/*`, `tests/*`, lockfile'lar | Faz01 gereksinim matrisi ve ortam envanteri | Codex |
| 2026-09-29 | Faz01/F01-D01 | `main` / commit yok | Git deposu ve origin kuruldu; kaynaklar hash ile `docs/sources` altına alındı; ADR-001 ve başlangıç dosyaları yazıldı | Kaynak SHA-256 başarılı; Node/npm var; .NET/Flutter/pnpm yok; SQL `109.104.120.91:1433` login timeout | `docs/sources/README.md`, `docs/decisions/ADR-001-teknoloji-omurgasi.md` | Araç zincirini kur ve sürümleri sabitle | Codex + proje sahibi kararları |
| 2026-09-28 | Faz00/P-00 | — | Plan defteri oluşturuldu; kod yazılmadı | Belge incelemesi | Faz00–Faz11 | D01 envanteri | Temsili plan ekibi |

### Kesintiden devam — olay başına kopyala

```text
Olay ID / tarih-saat:
Faz / görev / beklenen kabul:
Son doğrulanmış branch ve commit:
Kirli çalışma ağacı (git status):
Tamamlanan son atomik adım ve test kanıtı:
Yarım kalan dosyalar / migration / dış işlem ve sonucu:
Gerçek hata, tekrar üretme komutu ve log yolu (sır yok):
Gerçek ödeme/sipariş/entegrasyon oluştu mu? İç ve dış işlem ID'leri güvenli referansla:
Güvenli yeniden deneme veya geri alma adımı; idempotency kontrolü:
Açık müşteri kararı / engel / sahibi:
Tek sonraki işlem:
İnceleyen ve PM kararı:
```

**Yeniden başlatma kuralı:** Önce son doğrulanmış commit/test ve dış işlem durumunu kontrol et; aynı ödeme, sipariş, fatura veya baskı işini yeniden üretmeden önce idempotency anahtarını ve sağlayıcı durumunu sorgula. Migration yarım kaldıysa geçmişi/şemayı incele, körlemesine tekrar çalıştırma. Hata kanıtını ve çözümü bu deftere ekle.

## 6. Değişiklik, ADR ve test kayıtları

| ID / tarih | Karar veya değişiklik | Kaynak gerekçe | Etkilenen dosya/faz/API/migration | Test/geri alma | İş sahibi / PM |
|---|---|---|---|---|---|
| ADR-001 / 2026-09-29 | Next.js web, React/Vite panel, ASP.NET Core/EF/MS SQL, Flutter mobil, modüler monolit + worker/outbox-inbox; Docker yok | Proje sahibi kararları, analiz §6 ve temsili CTO incelemesi | Faz03–11; `docs/decisions/ADR-001-teknoloji-omurgasi.md` | Araç/build ve gerçek SQL testi bekliyor; ADR ile geri dönüş | Proje sahibi onayladı / uygulama kanıtı bekliyor |

Her önemli karar `docs/decisions/ADR-###.md` ile şu alanları taşısın: problem, kaynak maddesi, seçenekler, karar/sahip/tarih, güvenlik/veri etkisi, geriye dönüş, test, etkilenen fazlar. Sözleşme ya da şema değişince ilgili önceki fazın regresyonunu yeniden çalıştır; Faz00 satırı ve Faz dosyası bağlantısını güncelle.

**Gerçek komut kayıtları** (kurulumdan sonra boşlukları doldur):

| Tür | Komut / ortam | Son sonuç / tarih |
|---|---|---|
| API başlatma | `dotnet run --project services/api/Xinobi.Api.csproj` | Sağlık ucu doğrulandı · 2026-09-29 |
| Web/panel/mobil başlatma | `pnpm --filter web dev`; `pnpm --filter admin dev`; `cd apps/mobile && flutter run` | Web/panel production build ve mobil analyze/test başarılı; cihaz çalıştırması bekliyor |
| Veritabanı migration/seed | Bekliyor: Faz03 komutu; önce yedek/ortam denetimi | Çalıştırılmadı |
| Birim/entegrasyon/e2e | `dotnet test XinobiYeni.slnx`; `pnpm lint && pnpm build`; `cd apps/mobile && flutter analyze && flutter test` | Başarılı · 2026-09-29; gerçek SQL ve cihaz entegrasyonu bekliyor |
| Geri yükleme/rollback | Bekliyor: Faz03 ve Faz11 prosedürü | Denenmedi |

## 7. Faz kabul kayıtları — gerçek uygulamada doldur

İzin verilen statüler: `Planlandı`, `Devam`, `Bloke`, `İncelemede`, `RED`, `Tamamlandı`. Her fazda yedi rol ayrı ayrı `BEKLİYOR / ONAY / RED`, gerekçe, kanıt, tarih ve gerçek kişinin kimliğiyle kaydedilir. Tüm roller onaylasa bile PM'nin **ayrı nihai kararı olmadan** tamamlanmış olmaz. Ürün sahibinin D kararını PM yerine veremez.

| Faz | Kod/teslim kanıtı | BA | Creative | FE | BE | DBA | Full Stack | PM nihai | Statü |
|---|---|---|---|---|---|---|---|---|---|
| 00 | Plan var; uygulama kabulü yok | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 01 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 02 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 03 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 04 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 05 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 06 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 07 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 08 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 09 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 10 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |
| 11 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |

PM her fazda kontrol eder: ① kaynak kapsamı ve Creative/UIUX handoff ② D kararlarının gerçek sahibi ③ kod/şema/API kanıtı ④ otomatik ve manuel test sonucu ⑤ yedi rol incelemesi ⑥ güvenlik, veri, rollback ⑦ Faz00 güncelliği. PM kendi rol incelemesini `PM-İNCELEME: ONAY/RED`, ardından ayrı nihai kararı `PM-KAPI: KABUL/RED` ve iki ayrı kanıt/tarihle aynı hücreye veya bağlantılı tutanağa yazar. Herhangi biri yoksa gerekçe yazıp `RED`; koşullu kabul ile sonraki bağımlı fazı başlatma. Plan dosyaları için ayrı temsili doküman inceleme sonucu aşağıya yazılır; uygulama tablosunu değiştirmez.

## 8. Plan dokümanı inceleme kaydı

Yedi temsili rol 12 dosyayı çapraz incelemiş, somut revizyonları tekrar denetlemiş; PM her fazı ayrıca son kez incelemiştir. **28.09.2026 plan belge kararı: PM KABUL.** Bu sonuç yalnızca metin planı içindir; müşteri kararları veya yazılımın tamamlandığı anlamına gelmez. §7 uygulama tablosundaki bütün gerçek onaylar beklemede kalır.

| Rol | Belge inceleme sonucu | Açık düzeltme |
|---|---|---|
| BA | ONAY · 28.09.2026 · 00–11 | 00/04/05/07/11 kapsam ve kabul revizyonları işlendi |
| Sr Creative Designer | ONAY · 28.09.2026 · 00–11 | 01 tasarım döngüsü ve 08 panel handoff düzeltildi |
| Sr Frontend Developer | ONAY · 28.09.2026 · 00–11 | 02 UI/UX, 05/09 sözleşme yolu, 11 PM kapısı düzeltildi |
| Sr Backend Developer | ONAY · 28.09.2026 · 00–11 | 05 belirsiz ödeme ve 09 belirsiz dış işlem politikası düzeltildi |
| DB Admin | ONAY · 28.09.2026 · 00–11 | 04/05/09 tablo sahipliği ve göç tekrarları düzeltildi |
| Sr Full Stack Developer | ONAY · 28.09.2026 · 00–11 | 02 UI/UX ve 09 repo yolu düzeltildi |
| PM (zorunlu son kapı) | KABUL · 28.09.2026 · 00–11 | Kaynak kopyası ve tüm faz kapıları dahil son inceleme |

**Faz bazlı temsili belge incelemesi:** Her hücre ilgili rolün son sürüm dosyaya plan düzeyinde onayını gösterir; gerçek uygulama kapısının alanı değildir.

| Faz | BA | Creative | FE | BE | DBA | Full Stack | PM son plan kararı |
|---|---|---|---|---|---|---|---|
| 00 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 01 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 02 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 03 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 04 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 05 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 06 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 07 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 08 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 09 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 10 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 11 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |

## 9. Tamamlanma tanımı

Faz11 sonunda kaynak analizdeki tüm teslimler canlı ortamda kanıtlanmış, üç pazaryeri/Mikro gerçek erişimle mutabık, ödeme/kargo gerçek sağlayıcıyla doğrulanmış, iOS/Android mağaza süreçleri tamamlanmış, baskı çıktısı fiziksel kabulden geçmiş, AI limit/maliyet ve insan devri işler, güvenlik/yedek-geri yükleme ve eğitim/tam teknik doküman teslim edilmişse proje tamamlanır. Gerçek sağlayıcının kabul etmediği bir işlem veya Xinobi iş sahibinin vermediği karar, `mock tamamlandı` diye işaretlenip proje kapanışına geçirilmez.

## 10. Başka bir geliştirici veya kodlama ajanına verilecek devam talimatı

Her yeni oturumda aşağıdaki talimatı, bu dosyayı, ilgili FazXX dosyasını, kaynak kapsam/analizi ve mevcut repo erişimini birlikte ver. Bir oturumda tek kabul edilebilir alt işi tamamla; sonraki oturum yine Faz00'dan başlayabilir.

> Xinobi geliştirmesine kaldığı yerden devam et. Önce `Faz00_Proje_Takip_ve_Kesintiden_Devam.md` anlık durum, kesintiden devam, açık D kararları, rol/PM kapıları ve son oturum kaydını; sonra aktif `FazXX_<konu>.md` görev ve testini oku. Kaynak kapsam ile analizi karşılaştır. Repo gerçek durumu için `git status`, son commit, son migration ve ilgili testleri doğrula; Faz00'da yazanı kanıt olmadan doğru varsayma. Aktif fazın sıradaki **tek atomik işini** uygula, yalnız o işe bağlı kodu değiştir, test/manuel kanıt üret, regresyonu kontrol et, sonuç ve başarısızlıkları Faz00'a yaz. Dış ödeme, AI, fatura veya pazaryeri işlemi yeniden denenmeden önce sağlayıcı durumunu ve idempotency kimliğini doğrula. Müşteri D kararını uydurma; erişim olmadan mock sonucu gerçek entegrasyon diye kapatma. Fazın yedi ayrı rol incelemesini ve PM'nin ayrıca nihai KABUL/RED kararını talep edilen kanıtlarla kaydet; eksikse fazı Bloke/İncelemede tut. Oturum bitmeden aktif branch/commit, değişen dosyalar, son başarılı komut/sonuç, hata, blokaj sahibi ve **sonraki tek güvenli adımı** Faz00'a işle.

Bu talimat yazılımı kendi başına onaylayan bir vekil değildir. Sağlayıcı kimliği/izinleri, üretim baskı standardı, hukuk metinleri ve gerçek Xinobi iş kuralları gibi D01–D10 müşteriye ait girdiler gelene kadar ilgili canlı kapı açık kalır; bağımsız kod ve test işleri devam eder.
