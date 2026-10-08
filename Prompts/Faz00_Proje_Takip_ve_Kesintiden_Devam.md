# Faz00 — Xinobi yürütme, karar ve kesintiden devam defteri

> **Bu dosyanın ilk hali bir plan ve doldurulabilir çalışma kaydıdır.** Henüz geliştirme, test, müşteri kararı veya canlı yayın tamamlanmış değildir. Her çalışma oturumu başında okunur, anlamlı her değişiklikten sonra ve oturum kapanışında güncellenir.

## 0. Önce bunu oku

1. Kaynak sıra: müşteri kapsamı `Xinobi_Proje_Kapsami(4).md` → hazırlanan kavramsal/teknik analiz `Xinobi_Kavramsal_ve_Teknik_Analiz.md` (kalıcı dosya adı `Xinobi_Kavramsal_ve_Teknik_Analiz(1).md`) → bu Faz00 → ilgili Faz01–Faz11 → mevcut kod/ADR/gerçek test kanıtı. **Yeni depoda ilk iş**, Library'deki bu iki var olan kaynağı `docs/sources/` altına salt okunur kopya olarak alıp özgün ad, sürüm/tarih ve doğrulanmış yol eşlemesini Faz00'a yazmaktır; kaynak okunamıyorsa kapsam işini başlatma. Kaynaklar çelişirse müşteri kapsamında açık teslimi silme; çelişkiyi karar kaydına taşı. **Ek kaynaklar:** `Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` (K-01–K-21; Faz01/02/04/06/10/11'de bağlayıcı) ve `Proje Yönetimi/Yonetim_Paneli_Siyah_Tema_Teknik_Analiz_ve_Promptlar.md` (yalnız panel görsel dili/kabuk referansı) da `docs/sources/` altına SHA-256 ile salt okunur kopya olarak alınmalı ve sıraya müşteri kapsamı ile Analiz1'den sonra eklenmelidir. **Tamam (07.10.2026):** iki kopya SHA-256 ile `docs/sources/` altına salt okunur alındı (`docs/sources/README.md`). Panel dokümanındaki hızlı satış, bayi/riskli müşteri, bakiye/puan, tema/CSS-JS motoru, sosyal giriş ve ödeme/kargo ayar ekranları müşteri kapsamında yoktur; ancak §4 karar kaydıyla kapsama alınır, aksi halde yalnız görsel referanstır.
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

**Takvim ve sprint planı — açık:** Müşteri kapsamı "proje iş planı" ve "sprint ve teslim takvimi"ni teslim olarak ister. Faz01 01.15 ile hazırlanacak takvim aşağıya işlenir; tarih uydurulmaz, sahipsiz satır `Belirlenmedi` kalır.

| Faz | Planlanan başlangıç | Planlanan bitiş | Sprint sayısı / süresi | Kapasite (kişi/rol) | Kilometre taşı |
|---|---|---|---|---|---|
| 01–11 | Belirlenmedi | Belirlenmedi | Belirlenmedi | Belirlenmedi | Belirlenmedi |

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
| Web Designer | Creative yönü web bilgi mimarisi, responsive wireframe, yüksek doğruluk ekran, motion ve erişilebilir etkileşim tanımına dönüştürür; kodlama öncesi kullanıcı web tasarım onayını hazırlar |
| CTO Advisor | Teknoloji ve sağlayıcı adaylarını güvenlik, maliyet, veri işleme, taşınabilirlik ve işletim açısından karşılaştırır; ürün sahibinin onayı olmadan yığını veya sağlayıcıyı değiştirmez |

**Rol sayısı netleştirmesi:** Kabul kapısındaki "yedi rol" PM, BA, Creative, FE, BE, DBA ve Full Stack'tir. **Web Designer** ve **CTO Advisor** bu yediye ek, zorunlu inceleme rolleridir: Web Designer Faz02/04/06/11, CTO Advisor Faz01/03/10/11 kapılarında ayrı `ONAY / REVİZYON / BLOKE` kaydı verir. Bu fazlarda onların kaydı yoksa PM kapıyı kapatamaz. §7 tablosu ve ilgili faz rol tabloları buna göre genişletilmiştir.

**Creative → UI/UX → Frontend teslim sözleşmesi:** Designer marka konsepti, tokenlar, ekran prototipi, varlık lisansı, baskı yerleşimi ve durumları üretir. UI/UX sorumluluğunu Designer (akış/görsel) ile Frontend (etkileşim/erişilebilirlik/uygulama) ortak taşır. Frontend `handoff kabul` kaydı, eksik durum/ölçü/asset listesini Faz00'a işler; kabulden sonra bile tasarıma uymayan ekran bitmiş sayılmaz. Yedi rolün yanında ayrı bir UI/UX kadrosu varmış gibi onay yazılmaz.

**İki ayrı onay türü:** (a) şimdi verilen **plan dokümanı incelemesi**, yedi temsili rolün 12 dosyanın tutarlılığına bakması; (b) gelecekte her fazın **gerçek uygulama kabulü**, kod/test/görsel kanıtı ve gerçek iş sahibinin gerekli ürün kararı. İlk tür ikinci yerine geçmez. Bir fazın onay tablosundaki boş alan `BEKLİYOR` kalır; PM dahil onaylar önceden doldurulmaz. PM ret gerekçesi ve düzeltme adımı yazar; bağımlı faza geçiş durur.

## 3. Teknik çalışma sözleşmesi

**Onaylanmış uygulama yığını (ADR-001):** kurumsal web/B2C için Next.js + React + TypeScript; yönetim paneli için React + Vite + TypeScript; ortak UI tokenları; API ve arka plan işleri için ASP.NET Core/C#; veri için SQL Server + EF Core migrations; iOS/Android için Flutter + Dart; dosya/baskı varlıkları için erişim kontrollü nesne depolama; modüler monolit + ayrı worker ve SQL outbox/inbox. Docker ve Kubernetes kullanılmaz. Sürümler resmi uyumluluk tablolarına göre sabitlenir ve lockfile'a işlenir. Mobil editör, ödeme ve push uyumu D09'da gerçek cihazla doğrulanır.

`Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` içindeki Node.js, PostgreSQL, React Native ve konteyner seçenekleri belgenin de belirttiği gibi öneri/adaydır; proje sahibinin daha önce verdiği ADR-001 kararını değiştirmez. Teknoloji omurgası ancak ayrı değişiklik önerisi, etki/geri dönüş analizi ve proje sahibinin açık onayıyla değişebilir.

**Önerilen repo sözlüğü:** `apps/web`, `apps/admin`, `apps/mobile`, `services/api`, `services/worker`, `packages/contracts`, `packages/ui`, `infra/db/migrations`, `design` (Faz02 kaynak ve handoff), `docs/decisions`, `tests`. C# paketleri TS paketlerine kaynak olarak otomatik kopyalanmaz; OpenAPI'den tipli istemci üretilir ve CI'da sürüm farkı denetlenir. Repo varsa yerleşimi bozma: mevcut gerçek yolları Faz00'da düzelt, bu haritayı yalnız örnek kabul et.

**Ortak API/veri ilkeleri:** Açıkça `/api/v1` sürümü, `requestId`, UTC zaman, tutar için para birimiyle decimal, müşteri ve panel nesne yetkisi, hatalarda kod/mesaj/alan, sayfalama; `variantId` ürün ekranından editör, sepet ve siparişe aynı kalır. Sunucu fiyat/vergi/indirim/kişiselleştirme/stok otoritesidir; `(channel, externalOrderId)`, ödeme sağlayıcı işlem ID ve checkout idempotency benzersiz; `OrderLine` anlık görüntüsü ve `DesignVersion` değişmez; outbox aynı yerel transaction'da. D02 veri sahipliği ve D03 ödeme/rezervasyon kapanmadan ilgili şema ve davranış kesinlenmez. Gereken tüm dış sistemlerde `IProviderAdapter` benzeri arayüz, mock/sandbox ve gerçek adaptör ayrılır. **Mock testi gerçek entegrasyon kabulü değildir.**

**Yerel çalışma varsayımı:** Mac üzerinde SQL Server'a bağlantı yöntemi (erişilebilir geliştirme SQL Server örneği/container/uzak test sunucusu), .NET ve JS araçları Faz01'de doğrulanır; DBeaver yalnız SQL istemcisidir, sunucu değildir. Hiçbir ücretli bulut kaynağı gerçek hesap/limit kontrolü yapılmadan zorunlu sayılmaz. `.env.example` yalnız anahtar isimleri içerir. Komutların gerçek hali repo kurulduktan sonra aşağıya yazılır.

### 3.1 Faz00'da sabitlenmesi gereken teknik kararlar

Faz03–06 belgeleri aşağıdaki kararları "Faz00'da sabitlenir" diye buraya bırakır. Karar verilene kadar ilgili kod geçici kabul edilir; karar ADR ile kapanır ve satır güncellenir.

| ID | Karar | Bağlı faz | Sahip | Durum |
|---|---|---|---|---|
| T-01 | API sürüm öneki ve son yol düzeni (`/api/v1`) | 03–10 | BE + Full Stack | Kısmi · `/api/v1/health`, `/api/v1/catalog/*`, `/api/v1/content/*`, `/api/v1/xinobi-u/*` sözleşmede (TST-093/094); geliştirme uçları `/api/v1/local-commerce`, `/api/v1/design-studio` sözleşme dışı |
| T-02 | Para formatı: minör birim tam sayı mı, `decimal(19,4)` + ISO para birimi mi | 04,05,07,08,09 | BE + DBA | **API önerisi uygulandı (07.10.2026):** `{amountMinor: long, currency: "TRY"}`; veritabanı sütun biçimi Faz04 migration'ında DBA kararıyla kesinleşecek |
| T-03 | Web/mobil oturum taşıma (HttpOnly cookie + CSRF / bearer + refresh) | 03,05,11 | BE + FE + CTO | **Karar · 07.10.2026** · karma: web/panel cookie+CSRF, Flutter access+rotating refresh (ADR-004) |
| T-04 | Editör tuval birimi (mm / normalize) ve geometri test vektörü konumu | 06,10,11 | FE + BE + Creative | Açık |
| T-05 | Barındırma: Windows Server/IIS mi, başka hedef mi; dev/test/prod ayrımı | 03,11 | CTO + Full Stack + proje sahibi | **Karar · 07.10.2026** · mevcut Windows Server + IIS (ADR-004); SQL portu erişim yöntemi açık |
| T-06 | Nesne depolama sağlayıcısı (Docker'sız), CDN ve medya türev üretimi | 03,04,06,10 | CTO + DBA | **Karar · 07.10.2026** · sunucu diski, web kökü dışında, `IFileStorage` arayüzü arkasında (ADR-004); CDN/türev açık |
| T-07 | Yüklenen dosya için zararlı içerik tarama aracı | 03,06,07 | BE + CTO | Açık |
| T-08 | Gözlemlenebilirlik: log, metrik, iz, alarm kanalı ve saklama | 03,08,09,11 | Full Stack + CTO | Açık |
| T-09 | Özellik bayrağı mekanizması (XINOBI U, Nobi, sağlayıcı adaptörleri) | 03,10,11 | BE + Full Stack | Açık |
| T-10 | CI güvenlik taraması: SAST, bağımlılık ve sır taraması aracı | 03,11 | Full Stack + CTO | Açık |
| T-11 | Performans ve yük testi aracı, ölçülecek başlangıç hedefleri (Analiz2 §20.1) | 03,11 | Full Stack + PM | Açık |
| T-12 | Önerilen ama repoda olmayan yollar: `infra/db/migrations`, `infra/dev`, `packages/ui`, `docs/runbooks`; gerçek karşılıklar | 03–11 | Full Stack | **Kısmi** · EF migration'ları `services/shared/Xinobi.Persistence/Migrations`, gözden geçirilmiş SQL `infra/db/migrations`, runbook'lar `docs/runbooks` (07.10.2026); `infra/dev`, `packages/ui` açık |

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
| D11 | Türkiye e-ticaret yükümlülükleri: mesafeli satış/ön bilgilendirme onayının sipariş kaydı, ETBİS, İYS ticari ileti izni, e-Fatura/e-Arşiv'i hangi sistemin keseceği | Faz05,07,08,11 | Açık / hukuk + muhasebe + Mikro sahibi |
| D12 | K-13 "Market hesabı" ifadesinin anlamı (Analiz2'de "anlamı netleşmeli") | Faz01,05,11 | Açık / ürün sahibi |
| D13 | "Desenler" menüsü: içerik modeli, lisans, seçme ve satın alma davranışı | Faz02,04,06 | Açık / ürün sahibi + Creative |
| D14 | Proje sonrası bakım/garanti, hata düzeltme süresi (SLA) ve aylık sağlayıcı/altyapı maliyet tavanı | Faz01,11 | Açık / proje sahibi + PM |

**Karar son tarihi kuralı:** Her açık D kararına PM bir sahip ve hedef tarih yazar. Tarih geçerse PM iş sahibine bir kez hatırlatır, ikinci kez kaçırılırsa proje sahibine taşır ve kayda `Gecikti` yazar. Bu süre boyunca yalnız bağımsız iş ve mock ilerler. Geliştirici tahmini hiçbir koşulda karar yerine geçmez; ancak proje sahibi yazılı olarak "varsayımla devam" derse varsayım, geri dönüş maliyetiyle birlikte ADR'ye yazılır.

**AI-P01 sağlayıcı kararı — ONAYLANDI, 01.10.2026:** Proje sahibi AI görsel sağlayıcısı olarak **Cloudflare Workers AI** seçimini açıkça onayladı. Uygulama sağlayıcıdan bağımsız `IImageGenerationProvider` / `IImageEditingProvider` adaptör sınırını korur; model, fiyat/kota, veri işleme, ticari lisans ve bölge Faz10 başlangıcında resmi dokümanla yeniden doğrulanır. API hesabı, secret, SDK/REST adaptörü ve ücretli çağrı Faz10 sırası gelmeden eklenmez; bu karar erken entegrasyon yetkisi değildir. Ayrıntı: `docs/decisions/ADR-002-cloudflare-workers-ai.md`.

Blokaj nedeniyle bağımsız iş ve mock yapılabilir; ilgili faz **gerçek entegrasyon/iş kabulü** alınmaz. Bu kararlar Xinobi iş sahibine aittir; geliştirici tahminini `varsayım` yazabilir, gerçek onay diye işaretleyemez.

## 5. Anlık durum — her oturum başında güncelle

| Alan | Şu anki kayıt |
|---|---|
| Son güncelleme ve sorumlu | 2026-10-07 · Claude Code; ADR-003/ADR-002 Ek A onaylandı; ADR-004 (T-03/T-05/T-06) yazıldı; Faz03 03.05 çekirdek şema ve ilk migration (TST-091) |
| Aktif faz/görev ID | **Mobil (Faz11 erken hazırlık)**: Flutter iskeleti ve katalog ekranları tamam (TST-095). Faz03 03.05 SQL uygulaması BLOKE (port); Faz02 web onayı ertelendi (F02-A17) |
| Repo/branch/HEAD | `main` · uygulama kodu `0a18bba`; belge commitleri üstte · origin `https://github.com/beyzaturgut/XinobiYeni.git` (private) |
| Geliştirme/test/canlı ortamları | macOS + Docker'sız CI; uzak SQL Server 2022 Express ve boş `XinobiYeniDB` TST-017'de doğrulandı ama uygulama henüz SQL Server kullanmıyor; Development verisi `services/api/App_Data/local-commerce/` dosya deposunda; canlı önizleme IIS `109.104.120.91:8014` |
| Son çalışan uygulama komutu/URL | `pnpm dev:local` (API 5003, web 3000, admin 5173). DEPLOY-004 paketi `XinobiYeni-web-c323e13.zip` hazır, IIS'e aktarılmadı; c323e13 sonrası web değişiklikleri pakette yok |
| Son test komutu ve sonucu | TST-102: Flutter 34/34 (header, duyurular). TST-101: Flutter 30/30 (favoriler). TST-100: .NET 82/82 (rol/yetki, varsayılan ret). TST-099: .NET 78/78, Flutter 25/25, Dart 4/4, lint/build temiz, kayma 0; web cookie oturumu gerçek tarayıcıda, ortak hesap web+mobil doğrulandı. Web e2e'de bilinen 19 hata ve `test-shared-header` |
| Değişen dosyalar / migration | Yeni `services/shared/Xinobi.Persistence` (DbContext, migration `20261007090524_InitialCore`), `infra/db/migrations/0001_InitialCore.{idempotent,rollback}.sql`, `PersistenceModelTests`, `dotnet-tools.json`, runbook. Migration **hiçbir veritabanına uygulanmadı** |
| Aktif hata/yarım iş | SQL Server `109.104.120.91:64019` dışarıdan erişilemiyor (IIS 8014 erişilebilir); migration uygulaması bekliyor. Faz03 03.03 geliştirme deposuyla, 03.04 kod tarafı tamam (TST-100); 03.06–03.08 yok; DEPLOY-004 IIS smoke yapılmadı; HND-01–05, `design/a11y-audit.md`, gerçek rol incelemesi ve D kararları açık; **web e2e paketi 19/48 başarısız** (4 kontrast hatası, 15 eski test; TST-092, header'dan bağımsız) |
| Sonraki en küçük güvenli adım | Panel girişi (admin uygulaması `/api/v1/admin/session`) ve panel uçlarının `RequirePermission`'a geçmesi; ya da mobil favoriler. SQL portu açılınca 0001 migration'ı ve hesapların SQL'e taşınması (03.11) |
| Geri alma / devam noktası | `0a18bba` (TST-088 ile doğrulanmış uygulama kodu); migration ve dış sistem yazımı yok; Cloudflare'a yalnız TST-XINOBI-U-live'daki iki üretim çağrısı yapıldı |

### Oturum kaydı şablonu — yeni satır üste

| Tarih/saat TR | Faz/görev | Branch / commit öncesi-sonrası | Yapılan dosya ve işlem | Çalıştırılan komut/sonuç | Kanıt | Sonraki atomik adım | Kim |
|---|---|---|---|---|---|---|---|
| 2026-10-07 | Mobil header + duyurular | `main` / `9b07d43` → bu commit | DES-MOB-01 rev.1: header'da arama yerine Favorilerim ve Haber ve duyurular; `features/news/*`, `/duyurular`, okunmamış rozeti (cihazda) | TST-102: Flutter 34/34; emülatörde doğrulandı | `test/2026-10-07/TST-102-*` | Mobil: içerik sayfaları, Nobi veya deneme ödeme akışı | Claude Code |
| 2026-10-07 | Mobil favoriler | `main` / `a216b1e` → bu commit | `apps/mobile/lib/features/favorites/*` (web ile aynı `xinobi-demo-favorites` biçimi, cihazda), kart ve ürün sayfasında kalp, `/favoriler`, Hesap bağlantısı | TST-101: Flutter 30/30; emülatörde doğrulandı | `test/2026-10-07/TST-101-*` | Mobilde sıradaki: ödeme öncesi adımlar D03'e bağlı; panel girişi | Claude Code |
| 2026-10-07 | Faz03 03.04 rol/yetki | `main` / `e66bd73` → bu commit | `Identity/Permissions.cs` (17 kaynak, özel işlemler, `super_admin`, `RequirePermission`), varsayılan ret + açık herkese açık alan listesi, `/api/v1/admin/{session,permissions}`, `bootstrap-super-admin` konsol komutu ve runbook; istemciler yenilendi | TST-100: 82/82; analyze/tsc temiz | `test/2026-10-07/TST-100-*`, `docs/runbooks/super-admin-bootstrap.md` | Panel girişi ve panel uçlarının yetkiye geçmesi | Claude Code |
| 2026-10-07 | Mobil SMTP zaman aşımı + kaynak kopyaları | `main` / `84b5804` → `e66bd73` | Mobil istemci alma süresi 3 sn → 20 sn (Gmail SMTP ile kod gönderimi); Analiz2 ve panel belgesi `docs/sources/` altına SHA-256 ile | flutter 25/25 | `docs/sources/README.md` | 03.04 | Claude Code |
| 2026-10-07 | Web hesabı API'ye | `main` / `0eace5b` → bu commit | `/api/v1/auth/web/*` (HttpOnly cookie, CSRF başlığı), CORS credentials; web `demo-commerce.ts` API'ye bağlandı, siparişler hesap kimliğine bağlı demo; e2e testi sahte hesap sunucusuyla | TST-099: 78/78; gerçek tarayıcı + yalıtılmış API; mobil hesapla web girişi | `test/2026-10-07/TST-099-*` | dev:local yeniden başlatma | Claude Code |
| 2026-10-07 | Ortak hesap API + mobil hesap | `main` / `8aa43ca` → bu commit | `services/api/Identity/*` (kayıt/giriş/yenileme/çıkış/profil, geliştirme deposu, Production 503), mobil Hesap sekmesi ve güvenli jeton deposu | TST-098: 77/77, 25/25; emülatörde doğrulandı. 5 test e-postası olayı kaydedildi | `test/2026-10-07/TST-098-*` | Web hesabını API'ye geçir | Claude Code |
| 2026-10-07 | Mobil sepet | `main` / `53d8017` → bu commit | `VariantDetail.maxQuantity` sözleşmesi; mobil sepet (web biçimi, cihazda), Sepete ekle, rozetli Sepet sekmesi, sorunlu satırlar, ödeme yok | TST-097: 70/70, 20/20, 4/4; emülatörde kopya veriyle doğrulandı | `test/2026-10-07/TST-097-*` | dev:local yeniden başlatma; favoriler/hesap | Claude Code |
| 2026-10-07 | XINOBI U gerilemesi + uygulama ikonu | `main` / `0222194` → bu commit | Web ürün kartı yeniden yeni anket açar; mobilde biten tasarım üründen yeniden açılmaz; uygulama ikonu Xinobi logosu (`0222194`) | `test-xinobi-u` ve `test-xinobi-u-direct-questions` başarılı; Flutter 16/16. `test-shared-header` başka oturumun `20cc424` değişikliği nedeniyle başarısız (`/hesap/giris` header yok) | `test/2026-10-07/TST-096-*` ek | Mobil sepet | Claude Code |
| 2026-10-07 | Mobil XINOBI U + DES-XU-01 | `main` / `5ed9bd4` → bu commit | Mobil anket akışı (5 soru, özet, üretim, durum sorgusu, sonuç), cihazda devam; proje sahibi kararıyla renk adımı web+mobilden kaldırıldı, sunucu varsayılan rengi seçer; sözleşme `variantId` isteğe bağlı | TST-096: 66/66, 15/15, 4/4; gerçek Cloudflare 1 test + 2 proje sahibi denemesi | `test/2026-10-07/TST-096-*`, `design/decisions.md` DES-XU-01 | Dev API yeniden başlatılınca web XINOBI U e2e | Claude Code |
| 2026-10-07 | Mobil iskelet | `main` / `c070df3` → bu commit | `apps/mobile`: Riverpod + go_router, 3 sekme, ana sayfa/ürünler/detay/XINOBI U, `CatalogRepository`, tokenlardan tema (`tools/generate-mobile-tokens.mjs`, tokens v0.3.0), Jost/Inter fontları (OFL), platform ağ ayarları; DES-MOB-01 | TST-095: analyze temiz, 10/10, emülatörde gerçek veri; 3 taşma + 1 a11y hatası düzeltildi | `test/2026-10-07/TST-095-*`, `design/decisions.md` DES-MOB-01 | Mobil XINOBI U akışı | Claude Code |
| 2026-10-07 | 1. adım: XINOBI U sözleşmesi | `main` / `9c3a4ac` → bu commit | `services/api/XinobiU/*` (5 uç, mevcut depo, korumalar aynen, Production'da 503), OpenAPI + TS/Dart istemcileri, 4 .NET + 1 Dart testi | TST-094: 58/58, Dart 4/4, Flutter temiz, kayma 0 | `test/2026-10-07/TST-094-*` | Flutter iskeleti | Claude Code |
| 2026-10-07 | 1. adım: katalog API sözleşmesi | `main` / `7958924` → bu commit | `services/api/Catalog/*` (5 salt okunur uç, iş kuralları sunucuda, Production'da 503), katı JSON sayıları, OpenAPI + TS/Dart istemcileri, 16 .NET + 2 Dart testi | TST-093: 54/54, Dart 3/3, Flutter temiz, kayma 0, duman testi | `test/2026-10-07/TST-093-*` | XINOBI U oturum sözleşmesi; Flutter iskeleti | Claude Code |
| 2026-10-07 | Faz02 F02-A17 karar | `main` / `ad2f418` → bu commit | Proje sahibi WEB TASARIM ONAY'ı müşteriye bağlı tasarım değişiklikleri nedeniyle erteledi; 25 ekranlık inceleme sayfası hazır bekliyor; mobil için tasarım tokenları tek kaynaktan beslenecek | Belge değişikliği; test yok | `design/faz02-open-acceptance.md` F02-A17 | 1. adım: katalog API sözleşmesi | Claude Code |
| 2026-10-07 | Faz02 web / DES-HDR-01 rev.1 | `main` / `4b11891` → bu commit | Proje sahibi revizyonu: header tek 64 px şerit, logo en solda 44 px (mobil 40 px), Xinobi dünyası XINOBI U yanında, Kurumsal teklif/Destek header'dan çıktı | Lint/build başarılı; 10 header testi başarılı (`test-home-navigation-feedback` yeni yapıya göre güncellendi); kullanıcı verisi değişmedi | `design/decisions.md` DES-HDR-01 rev.1 | Web tasarım onay sayfasındaki kararları uygula | Claude Code |
| 2026-10-07 | Faz02 web / DES-HDR-01 | `main` / `6d52883` → bu commit | Proje sahibi talebiyle global header ölçüleri dyson.com.tr ile eşlendi (şeritler 53/64 px, 14/16 px ağırlık 300, 1270 px içerik, 245×34 arama, 24 px ikon, ≤1024 px tek şerit); font Jost; Faz02 Dyson kuralına header istisnası | TST-092: lint/build, 16 yerel araç başarılı; web e2e 29/48, başarısızlıklar değişiklik öncesiyle birebir aynı | `test/2026-10-07/TST-092-*`, `design/decisions.md` DES-HDR-01 | 4 kontrast hatası + 15 eski e2e testi; sonra Faz03 03.04 | Claude Code |
| 2026-10-07 | Faz03 03.05 + ADR-004 | `main` / `a05264c` → bu commit | Proje sahibi ADR-003 ve ADR-002 Ek A'yı onayladı; T-03/T-05/T-06 kararları ADR-004; `Xinobi.Persistence` projesi, 12 tablolu çekirdek şema, ilk migration, idempotent ve geri alma script'leri, runbook | TST-091: 38/38 test, Release temiz; XinobiYeniDB uygulaması BLOKE (TCP 64019 zaman aşımı) | `test/2026-10-07/TST-091-*`, `docs/decisions/ADR-004-*` | SQL erişimi açılınca migration uygula; 03.04 | Claude Code |
| 2026-10-07 | Test bakımı | `main` / `4abc8e5` → bu commit | `tools/test-{local-commerce,home-navigation-feedback,product-listing,home-category-products,xinobi-u,free-product-preview}.mjs` güncel davranışa uyarlandı; uygulama kodu değişmedi; oturumda oluşan 8 test görseli scratchpad'e taşındı | TST-090: 22/22 başarılı; `state.json` değişmedi; ücretli çağrı yok | `test/2026-10-07/TST-090-stale-test-updates.md` | ADR onayı; Faz03 03.12 | Claude Code |
| 2026-10-07 | Uçtan uca regresyon | `main` / `0ff8f38` → bu commit | Çalışan servislerde 22 test aracı; `state.json` yedeklenip sonra hash ile doğrulandı | TST-089: 16 başarılı / 6 başarısız; başarısızlıklar eski test (5) ve süresi dolmuş oturum (1); ücretli çağrı yok, veri değişmedi | `test/2026-10-07/TST-089-local-e2e-regression.md` | Beş testi güncelle, free-preview fixture'ını kalıcı yap | Claude Code |
| 2026-10-07 | Faz00 kayıt açığı | `main` / `a97650b` → bu commit | 37 commit aşağıya geri dolduruldu; ADR-003 yazıldı; ADR-002'ye Ek A eklendi; iki numarasız 06.10 raporu indekse alındı | TST-088: dotnet test 26/26, admin/web lint+build başarılı | `test/2026-10-07/TST-088-*`, `docs/decisions/ADR-003-*` | ADR onayı; uçtan uca yerel testler | Claude Code |
| 2026-10-07 10:11–11:13 · *geri dolduruldu* | Faz02 web / Faz05 demo | `8891586` → `0a18bba` (9 commit) | XINOBI U'da soru öncesi renk seçimi (`b344844`); sepet varyant saklama ve katalog uygunluk kontrolü (`b669eaa`); ortak mağaza navigasyonu (`a8859d7`); tarayıcı demo hesap, ödeme ve sipariş geçmişi (`e191174`); hesap alanı/etiket düzeltmeleri (`3b6ff8d`); kare kategori şeridi (`e0df447`); iki katlı siyah header ve 112 px sıkıştırma (`bd25ad6`, `fbbfe57`, `0a18bba`) | Commit anında rapor yok; geriye dönük TST-088 başarılı | README `test-studio-color-selection`, `test-cart`, `test-demo-commerce` araçları (çalıştırılmadı) | Uçtan uca araçları çalıştır | Codex (kayıt: Claude Code) |
| 2026-10-06 16:43–17:33 · *geri dolduruldu* | Faz02 web / Faz04 içerik | `a51a3b8` → `8891586` (5 commit) | XINOBI U raster bannerı etkileşimli bölümle değişti (`529c107`); Japon dalga deseni ve ürün görselleri (`7e96a8e`); koleksiyon/değer kartı referans eşleşmesi (`e5633a8`); kategori fotoğrafı yükleme ve eski XINOBI U sekmesinin kaldırılması (`92913f0`); titanyum banner yerine düzenlenebilir görsel bölüm (`8891586`) | Commit anında rapor yok; TST-088 başarılı | `tools/test-category-photo.mjs`, `test-production-homepage.mjs` (çalıştırılmadı) | — | Codex (kayıt: Claude Code) |
| 2026-10-06 15:10–15:40 · *geri dolduruldu* | Faz04 içerik / DEPLOY-004 | `7a5af3b` → `a51a3b8` (3 commit) | Header duyuru kutusu (`5271842`); güncel ticaret içeriği ve medyasıyla IIS önizleme paketi (`c323e13`) ve yayın adımları (`a51a3b8`) | DEPLOY-004: 27 statik rota, geçici HTTP sunucusunda smoke başarılı; IIS smoke yapılmadı | `deployments/DEPLOY-004-current-commerce-preview.md`, `XinobiYeni-web-c323e13.zip` | IIS'e aktar ve canlı smoke | Codex (kayıt: Claude Code) |
| 2026-10-06 11:47–14:42 · *geri dolduruldu* | Faz04 katalog/içerik | `fd1b07e` → `7a5af3b` (16 commit) | HEX renkler ve orijinal ürün görseli (`b23d5ae`, `c40e5e9`); admin kategorileri ve web filtreleri, kategori silme/ürün taşıma (`dd51b21`, `28873a2`); ana sayfa kategori görseli seçimi (`3bd1728`, `8b8550d`); header kategori bağlantıları (`a742fe1`); ürün detay HEX paleti (`46884c0`); kart/header birleştirme (`ca2191f`); titanyum banner (`cf0c3ef`); stüdyo görsel düzeltmeleri (`29d5071`, `05abd5f`); başlık ve arka plan stilleri (`e08bbe1`, `c40a00b`); admin'den dört öne çıkan ürün (`fe87326`); yalnız son beş stokta stok sayısı (`7a5af3b`) | Commit anında rapor yok; TST-088 başarılı | `tools/test-category-management.mjs`, `test-featured-products.mjs`, `test-product-detail-palette.mjs` (çalıştırılmadı) | — | Codex (kayıt: Claude Code) |
| 2026-10-06 11:31–11:37 · *geri dolduruldu* | Faz03 dışı demo / Faz10 erken | `acc0c99` → `fd1b07e` (4 commit) | Yerel dosya ticaret deposu ve Cloudflare tasarım işleri API'si (`3db452e`); admin ticaret yönetimi ve operasyon modülleri bağlantısı (`d82332b`); XINOBI U ve ücretsiz yüzey önizleme (`d7870f0`); handoff ve yerel entegrasyon belgeleri (`fd1b07e`) | `test/2026-10-06/TST-XINOBI-U-live.md` (iki gerçek Cloudflare üretimi, API 21 test) ve `TST-XINOBI-U-free-preview.md` başarılı | ADR-003, ADR-002 Ek A | ADR onayı | Codex (kayıt: Claude Code) |
| 2026-10-07 | Faz00–11 plan revizyonu | `main` / `0a18bba` → `a97650b` | Kapsam–faz eksiklikleri 12 faz dosyasına işlendi: ek roller, T-01–T-12, D11–D14, takvim, kayıt açığı, ADR-003/ADR-002 istisnası, mevzuat/ödeme/push/kargo, toplu sipariş, soru havuzu, cutover ve dokümantasyon | TST-087: diff temiz, işaretler tutarlı; kod/migration/deploy yok | `test/2026-10-07/TST-087-phase-gap-update.md` | 37 commitlik kayıt açığını geri doldur; ADR-003 ve ADR-002 istisnasını yaz | Claude Code |
| 2026-10-06 | ProductSurfaces Step 2 | `feature/product-personalization` / `acc0c99`; commit yok | SkiaSharp 4.153.1 infrastructure decoder, dev fixture source registration, gerçek RGBA mask/source validation ve 15 yeni test case | NuGet sandbox restore başarısız, izinli tekrar başarılı; test final 39/39, Release build 0 uyarı/0 hata, diff başarılı, OpenAPI aynı | TST-090–092; `docs/contracts/domain-contract-draft.md` Step 2 sınırları/istatistikler | Kullanıcı Step 2 incelemesi; Step 3 uygulama yok | Codex |
| 2026-10-06 | ProductSurfaces Step 1 / geriye dönük kanıt ve dokümantasyon uyumu | `feature/product-personalization` / `acc0c99`; yeni commit yok | Faz00 + domain sözleşme sınırları + test indeksi/üç tarihli rapor; uygulama/test kaynakları değişmedi | Önceki Step 1: final 24/24 test ve Release build 0 uyarı/0 hata; Debug kilit hatası/Release tekrarları TST-087'te korundu; OpenAPI hash aynı | `docs/contracts/domain-contract-draft.md`, TST-087–089 | Kullanıcı talimatıyla Step 2 kapsamını kesinleştir; uygulama başlatma | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-002 | `main` / `acc0c99`; çalışma ağacı | Rol matrisi, sürümlü ayar ve güvenli demo denetim kayıtları | TST-086 model/UI, build/lint ve panel regresyonu başarılı; ilk seçici testi timeout sonrası erişilebilir ad düzeltildi | `test/2026-10-03/TST-086-admin-settings.md` | F02-A10 mobil tasarım kapsamı; gerçek kimlik/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-012 | `main` / `acc0c99`; çalışma ağacı | Politika/istem sürümü, kullanım/hata, kaynak uygunluğu ve destek devri | TST-085 model/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-085-admin-ai.md` | ADM-002 rol/ayar/denetim; gerçek kimlik/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-010/011 | `main` / `acc0c99`; çalışma ağacı | Dört sağlayıcı eşleme/iş/hata/uzlaştırma izleme | TST-084 model/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-084-admin-integrations.md` | ADM-012 AI yönetimi; gerçek sağlayıcı/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-008 | `main` / `acc0c99`; çalışma ağacı | Tasarım/sürüm/kalite/yüz çıktısı ve demo inceleme notu | TST-083 build/lint, baskı testi ve panel regresyonu başarılı | `test/2026-10-03/TST-083-admin-print.md` | ADM-010/011 entegrasyon izleme; gerçek D06/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-007 | `main` / `acc0c99`; çalışma ağacı | Kurumsal talep listesi, sürüm geçmişi ve revizyon taslağı | TST-082 model/UI, build/lint ve panel regresyonu başarılı; TS import hatası düzeltildi | `test/2026-10-03/TST-082-admin-quotes.md` | ADM-008 baskı operasyonu; D04/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-004 | `main` / `acc0c99`; çalışma ağacı | Örnek varyant fiyatı, kampanya koşulları ve indirim önizlemesi | TST-081 hesaplama/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-081-admin-pricing.md` | ADM-007 teklif yönetimi; gerçek D07/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-005 | `main` / `acc0c99`; çalışma ağacı | Depo bakiyeleri, geçmiş, mutabakat ve sayım önizlemesi | TST-080 build/lint/stok; katalog/panel regresyonu başarılı | `test/2026-10-03/TST-080-admin-inventory.md` | ADM-004 fiyat/kampanya; gerçek API kapıları açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-003 | `main` / `acc0c99`; çalışma ağacı | Katalog filtre/sayaç, yeni ürün, dört bölümlü düzenleme, SKU/stok ve taslak koruması | TST-079 build/lint/katalog ve TST-078 regresyon başarılı | `test/2026-10-03/TST-079-admin-catalog.md` | ADM-005 stok/depo; D02/D03 gerçek yazım açık | Codex |
| 2026-10-02 | Faz02 F02-A09 / ADM-001/006/009 | `main` / `acc0c99`; değişiklikler commit edilmedi | Siyah panel kabuğu, 13 kart, sipariş filtre/detay ve korunmuş içerik editörü | TST-078 build/lint ve dört genişlikte tarayıcı başarılı; iki etiket hatası düzeltildi | `test/2026-10-02/TST-078-admin-panel.md` | ADM-003 katalog/varyant prototipi; gerçek API kapıları açık | Codex |
| 2026-10-02 | Faz02 HND-02 | `main` / `acc0c99`; çalışma ağacı | Slider/mobil header hedefleri 44 px, beş yeni E2E | Lint/build, 48/48 E2E ve diff başarılı | `test/2026-10-02/TST-077-home-touch-targets.md` | HND-01 banner gerçek oranı; yayın kullanıcıda | Codex |
| 2026-10-02 | Faz02 F02-A06 | `main` / `acc0c99`; belgeler commit edilmedi | Handoff, 22 medya ölçü/hash envanteri ve API hedef alanları; HND-01–05 | TST-076 manifest ve mevcut üç sağlık ucu doğrulandı; diff başarılı | `design/handoff.md`, `design/assets/manifest.json`, `test/2026-10-02/TST-076-handoff.md` | HND-02 dokunma hedefleri; yayın kullanıcıda | Codex |
| 2026-10-02 | Faz02 F02-A05 / deploy hazırlığı | `main` / `acc0c99` → belgeler çalışma ağacında | Editör/AI spec, kabul listesi ve güncel anlık durum | TST-074 build/mobil/ZIP; TST-075 belge/diff başarılı | `design/editor-spec.md`, `design/ai-spec.md`, `test/2026-10-02/TST-074-*`, `TST-075-*` | F02-A06 handoff; RDP canlı doğrulama açık | Codex |
| 2026-10-01 | Faz02 v0.24.0 / WEB-001 interaction | `main` / `6956a99` | Mega menü/drawer, hero slider, product carousel ve Nobi paneli tasarım prototipine eklendi | TST-060: desktop/mobile interaction başarılı; 5 kırılım × 15/15 görsel, overflow=false | `design/screens/WEB-001/*`, `tools/test-web001-interactions.mjs`, `test/2026-10-01/TST-060-*` | Kullanıcı yerel inceleme/ortak tasarım onayı | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.23.1 / WEB-001 içerik yönetimi | `main` / `476255b` | Admin panelinden yönetilecek dört görsel/içerik alanı geçici `Temsili` açıklamayla ayrıştırıldı | TST-059: 5 kırılım × 14/14 görsel, overflow=false; app/deploy yok | `design/screens/WEB-001/*`, `test/2026-10-01/TST-059-*` | F02-A13/14 etkileşimli prototip/handoff | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.23.0 / F02-A12–A14 | `main` / `996a2a2` | WEB-001 ortak hi-fi HTML/CSS; Creative/Web QA revizyonları; beş responsive PNG | TST-058: 5 kırılım × 14/14 görsel, overflow=false, h1=1; app/deploy yok | `design/screens/WEB-001/*`, `tools/render-web001.mjs`, `test/2026-10-01/TST-058-*` | Kullanıcı ortak tasarım onayı | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.22.0 / F02-A11–A12 | `main` / `b3c94ab` | Ortak brief/art direction, Analiz2 fark matrisi, içerik/medya rehberi ve WEB-001 responsive wireframe | TST-057: K-01–K-21 21/21 ve zorunlu tasarım işaretleri başarılı; app/deploy yok | `design/creative-brief.md`, `analysis2-gap-matrix.md`, `art-direction.md`, `content-hierarchy.md`, `photography-media-guide.md`, `screens/WEB-001-*` | Kullanıcı ortak tasarım onayı; sonra hi-fi WEB-001 | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Tasarım/AI kararları / TST-056 | `main` / `43c05b3` | İki yön kaldırıldı; Creative + Web Designer tek ortak tasarıma bağlandı; Cloudflare Workers AI sağlayıcı olarak onaylandı | TST-056 karar/sınır işaretleri ve diff kontrolü başarılı; AI çağrısı/deploy yok | `ADR-002`, `Prompts/Faz00/01/02/10`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-056-*` | Ortak tasarım üretimi için başlangıç onayı al | Codex |
| 2026-10-02 | Mobil ana sayfa düzeltmesi / TST-073 | `main` / kaynak değişikliği | Çerez paneli kapatma/seçenek hizası ve XINOBI U mobil tam kadrajı düzeltildi | Lint, 23 rota export, 43/43 E2E ve 390/412 px Chrome testi başarılı | `apps/web/src/app/legal-consent.module.css`, `apps/web/src/app/page.module.css`, `test/2026-10-02/TST-073-*` | Kullanıcı isteyene kadar deploy alma; geliştirmeye devam et | Codex |
| 2026-10-02 | DEPLOY-003 hazırlık / TST-070–072 | `main` / `5445569` | Onaylı ana sayfa gerçek Next.js `/` rotasına aktarıldı; çerez düğmesi Nobi’den ayrıldı; 23 rotalık güncel `out` tam paketlendi | Lint, 23 rota export, 43/43 E2E, responsive/çakışma Chrome testi ve 233 girdili ZIP CRC/SHA-256 başarılı | `XinobiYeni-web-5445569.zip`, `deployments/DEPLOY-003-approved-homepage.md`, `test/2026-10-02/TST-070-*`, `TST-071-*`, `TST-072-*` | RDP’de yedekle/değiştir/canlı smoke | Codex |
| 2026-10-01 | Analiz2 plan farkı / TST-055 | `main` / `9f06673` | Creative/Web Designer sırası, Dyson sınırı, Analiz2 K-01–K-21, AI-P01 ve ADR-001 koruması fazlara eklendi | TST-055 belge işaretleri ve diff kontrolü başarılı; uygulama/deploy yok | `Prompts/Faz00/01/02/04/06/10/11`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-055-*` | Kullanıcıdan tasarım yönü ve AI PoC kapsamı onayı iste | Codex + Creative/Web Designer/CTO temsili incelemeleri |
| 2026-10-01 | Faz02 v0.21.0 / F02-A04 | `main` / `7613607` | Web, panel ve Flutter ekran zincirleri; hata, retry, kanal uzlaştırma ve karar bağımlılıkları | TST-054: ekran ID, D-kararı ve belge diff kontrolleri başarılı | `design/flows.md`, `test/2026-10-01/TST-054-*` | F02-A05 editör ve AI ayrıntılı spec | Codex |
| 2026-10-01 | Faz02 v0.20.9 / F02-A03 | `main` / `83ead98` | Web bileşen durum/semantik/klavye/veri sözleşmesi; token ve karar eşliği | TST-053: JSON ve 10 bölüm/zorunlu işaret kontrolü başarılı | `design/components.md`, `design/tokens.json`, `test/2026-10-01/TST-053-*` | F02-A04 `design/flows.md` | Codex |
| 2026-10-01 | Faz02 v0.20.8 / NAV-01 | `main` / `ed95092` | Ana/Xinobi/yasal bağlantı smoke; plan-kod karşılaştırmalı açık kabul listesi | TST-052: navigasyon 3/3; lint ve birleşik E2E 43/43 başarılı | `apps/web/tests/e2e/navigation.spec.ts`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-052-*` | F02-A03 bileşen sözleşmesi | Codex |
| 2026-10-01 | Faz02 v0.20.7 / E2E-04 | `main` / `c062498` | Katalog, varyant, favori, ödeme ve basit kişiselleştirme için beş Playwright senaryosu | TST-051: ilk 15/18; final kritik 18/18, birleşik E2E 40/40 ve lint başarılı | `apps/web/tests/e2e/critical-interactions.spec.ts`, `test/2026-10-01/TST-051-*` | Navigasyon smoke ve Faz02 açık kabul listesi | Codex |
| 2026-10-01 | Faz02 v0.20.6 / A11Y-01 | `main` / `28245e3` | 20 rota axe, iki klavye odağı; kontrast/ad düzeltmeleri ve tek worker | TST-050: ilk 4/22; final a11y 22/22, birleşik E2E 35/35, lint/build 23 rota | `apps/web/tests/e2e/accessibility.spec.ts`, `test/2026-10-01/TST-050-*` | Kalan interaction ve 390 px gerçek cihaz QA | Codex |
| 2026-10-01 | Faz02 v0.20.5 / E2E-03 | `main` / `c0ebaa1` | Üyelik, sipariş, iade, teklif takibi ve editör için beş Playwright senaryosu | TST-049: ara 11/13 ve 12/13; final 13/13, lint ve 23 rota build başarılı | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-049-*` | Odak sırası ve a11y taraması | Codex |
| 2026-10-01 | Faz02 v0.20.4 / E2E-02 | `main` / `f466595` | Sepet, hesap, teklif, AI ve asistan için beş Playwright senaryosu | TST-048: ilk 7/8, seçici düzeltmesi sonrası final 8/8 | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-048-*` | Kalan interaction ve odak/a11y | Codex |
| 2026-10-01 | Faz02 v0.20.3 / E2E-01 | `main` / `8eb5d1c` | Playwright sistem Chrome altyapısı; consent, arama/limit/ESC ve ödeme klavye senaryoları | TST-047: final 3/3 ve build 23 rota başarılı | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-047-*` | Kritik interaction kapsamını genişlet | Codex |
| 2026-10-01 | Faz02 QA-04 | `main` / `3a37380` | WEB-017–020 Chrome 500 px uzun sayfa görsel QA ve hero yükleme tekrar kontrolü | TST-046: dört rota başarılı; interaction/gerçek cihaz açık | `test/2026-10-01/TST-046-*` | Interaction/klavye altyapısı | Codex |
| 2026-10-01 | Faz02 v0.20.2 / QA-03 | `main` / `d083c4c` | WEB-007/011–016 görsel QA; dört üç-öğeli mobil header düzeltmesi ve tekrar render | TST-045: lint/export 23 rota ve Chrome doğrulama başarılı | `test/2026-10-01/TST-045-*` | WEB-017–020 tam sayfa QA | Codex |
| 2026-10-01 | Faz02 QA-02 | `main` / `066c02a` | WEB-003/005/006/008/009/010 altı rota Chrome 500 px render incelemesi | TST-044: ilk görünür alanlar geçti; interaction/gerçek cihaz açık | `test/2026-10-01/TST-044-*` | WEB-007/011–016 QA | Codex |
| 2026-09-30 | Faz02 v0.20.1 / QA-01 | `main` / `1f399f4` | WEB-001/002/004 ve global consent Chrome render; katalog/consent taşma koruması | TST-043: 1440/500 px geçti; lint/export 23 sayfa; 390 gerçek cihaz açık | `test/2026-09-30/TST-043-*` | WEB-003/005–010 QA | Codex |
| 2026-09-30 | DEPLOY-002 hazırlık | `main` / `14be3ea` | Güncel 23 rotalık `out` tam paketlendi; değişen dosya paketi tercih edilmedi | TST-042: 226 girdi, CRC/SHA-256 başarılı | `XinobiYeni-web-14be3ea.zip`, `deployments/DEPLOY-002-web-preview-update.md` | RDP'de yedekle/değiştir/smoke | Codex |
| 2026-09-30 | Faz02 v0.20.0 / WEB-020 | `main` / `406c892` | Taslak yasal merkez ve global, kayıtsız tercih paneli | TST-041: lint/static export 23 sayfa ve kritik sınır smoke başarılı | `apps/web/src/app/yasal/*`, `apps/web/src/app/legal-consent*`, `test/2026-09-30/TST-041-*` | Faz02 browser/responsive QA; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.19.1 / WEB-019 | `main` / `b768b20` | `/xinobi` üst ve alt menü puntoları ana sayfa navigasyonuyla eşitlendi | TST-040: lint/static export 22 sayfa başarılı | `apps/web/src/app/xinobi/xinobi.module.css`, `test/2026-09-30/TST-040-*` | WEB-020 yasal/çerez; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.19.0 / WEB-019 | `main` / `1f24404` | Kurumsal hikâye, tasarım ilkeleri, içerik önizleme ve ana sayfa bağlantıları | TST-039: lint/static export 22 sayfa başarılı; ağ-kısıtlı font denemesi kayıtlı | `apps/web/src/app/xinobi/*`, `test/2026-09-30/TST-039-*` | WEB-020 yasal/çerez; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.18.0 / WEB-018 | `main` / `a856fe6` | Demo konuşma, ürün/kurumsal yönlendirme ve kapalı destek devri | TST-038: lint/static export 21 sayfa ve yerel smoke başarılı | `apps/web/src/app/asistan/*`, `test/2026-09-30/TST-038-*` | WEB-019 kurumsal/içerik; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.17.0 / WEB-017 | `main` / `1b6cfcd` | AI istem/tema/palet, deterministik demo alternatifler, hata ve kapalı aktarım | TST-037: ilk build yolu düzeltildi; lint/static export 20 sayfa başarılı | `apps/web/src/app/studio/ai/*`, `test/2026-09-30/TST-037-*` | DEPLOY-002 preview güncellemesi | Codex |
| 2026-09-30 | Faz02 v0.16.0 / WEB-016 | `main` / `ee1274f` | Teklif çizgisi, iki demo revizyon, not önizleme ve kapalı onay/sipariş eylemleri | TST-033: lint/build/19 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/kurumsal/teklif/takip/*`, `test/2026-09-30/TST-033-*` | WEB-017 AI tasarım | Codex |
| 2026-09-30 | Faz02 v0.15.0 / WEB-015 | `main` / `fcee548` | Firma/iletişim, ürün/adet, kişiselleştirme, termin ve demo teklif özeti | TST-032: lint/build/18 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/kurumsal/teklif/*`, `test/2026-09-30/TST-032-*` | WEB-016 teklif takibi | Codex |
| 2026-09-30 | Faz02 v0.14.0 / WEB-014 | `main` / `c258358` | İptal/iade türü, neden/açıklama, dosya bekleme ve demo özet | TST-031: lint/build/17 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/siparisler/iade/*`, `test/2026-09-30/TST-031-*` | WEB-015 kurumsal teklif | Codex |
| 2026-09-30 | Faz02 v0.13.0 / WEB-013 | `main` / `65e5dff` | Demo sipariş listesi/detayı, teslimat çizgisi ve kapalı kargo işlemleri | TST-030: lint/build/16 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/siparisler/*`, `test/2026-09-30/TST-030-*` | WEB-014 iptal/iade | Codex |
| 2026-09-30 | Faz02 v0.12.0 / WEB-012 | `main` / `9958c77` | Profil/adres sekmeleri, demo düzenleme ve D10 güvenlik sınırları | TST-029: lint/build/15 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/*`, `test/2026-09-30/TST-029-*` | WEB-013 sipariş/takip | Codex |
| 2026-09-30 | Faz02 v0.11.0 / WEB-011 | `main` / `dfec7f6` | Giriş/kayıt/parola yenileme, parola görünürlüğü ve güvenli işlem sınırı | TST-028: ilk lint düzeltildi; lint/build/14 statik sayfa başarılı | `apps/web/src/app/hesap/giris/*`, `test/2026-09-30/TST-028-*` | WEB-012 hesap/adres | Codex |
| 2026-09-30 | Faz02 v0.10.0 / WEB-010 | `main` / `728e719` | Bekleyen/başarısız/başarılı senaryo, işlem sınırı ve doğrulama sırası | TST-027: lint/build/13 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/odeme/sonuc/*`, `test/2026-09-30/TST-027-*` | WEB-011 üyelik/oturum | Codex |
| 2026-09-30 | Faz02 v0.9.0 / WEB-009 | `main` / `10f9ebd` | Teslimat formu, kart/havale yöntem görünümü ve güvenli kapalı ödeme alanı | TST-026: lint/build/12 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/odeme/*`, `test/2026-09-30/TST-026-*` | WEB-010 ödeme sonucu kabukları | Codex |
| 2026-09-30 | Faz02 v0.8.0 / WEB-008 | `main` / `2edab8c` | Demo sepet satırı, adet/çıkarma/boş durum ve güvenli sipariş özeti | TST-025: lint/build/11 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/sepet/*`, `test/2026-09-30/TST-025-*` | WEB-009 ödeme kabuğu | Codex |
| 2026-09-30 | Faz02 v0.7.0 / WEB-007 | `main` / `a64409d` | Katalog favori kontrolü, tarayıcı demo saklama ve favoriler boş/dolu ekranı | TST-024: ilk effect lint hatası düzeltildi; lint/build/10 statik sayfa başarılı | `apps/web/src/app/favoriler/*`, `test/2026-09-30/TST-024-*` | WEB-008 sepet kabuğu | Codex |
| 2026-09-30 | Faz02 v0.6.0 / WEB-003 | `main` / `039ee41` | Canlı arama, hızlı terim, boş durum, en fazla üç ürün ve responsive karşılaştırma tablosu | TST-023: ilk yol hatası düzeltildi; lint/build/9 statik sayfa ve route smoke başarılı | `apps/web/src/app/arama/*`, `test/2026-09-30/TST-023-*` | WEB-007 favoriler kabuğu | Codex |
| 2026-09-30 | Faz02 v0.5.0 / WEB-006 | `main` / `525d4fc` | Araç/tuval/katman editörü, ön/arka yüz, demo taslak, responsive düzen ve logo kaynak taşıması | TST-022: ilk lint düzeltildi; ikinci lint/build/8 statik sayfa ve route smoke başarılı | `apps/web/src/app/urunler/cay-makinesi-101/editor/*`, `design/logo/*`, `test/2026-09-30/TST-022-*` | WEB-006 kullanıcı görsel geri bildirimi | Codex |
| 2026-09-30 | Faz02 v0.4.0 / WEB-005 | `main` / `c25ce02` | Metin, stil ve renk seçimi; temsili ayrı önizleme; oturum içi demo taslak ve güvenli satın alma bekleme durumu | TST-021: lint/build/7 statik sayfa, route HTTP 200 ve kritik güvenlik metinleri başarılı | `apps/web/src/app/urunler/cay-makinesi-101/kisisellestir/*`, `test/2026-09-30/TST-021-*` | WEB-006 gelişmiş editör araç kabuğu | Codex |
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

| ADR-003 / 2026-10-07 | Development'ta SQL Server yerine `services/api/App_Data/local-commerce/state.json` dosya deposu ve tarayıcı localStorage demo hesap/sipariş kaydı; yalnız Development/loopback | Faz03 çekirdeği olmadan demo ilerletme | Faz03–05/10; `docs/decisions/ADR-003-gecici-yerel-ticaret-deposu.md` | TST-088; SQL Server'a geçiş Faz03 03.11 | **Proje sahibi onayladı · 07.10.2026** |
| ADR-002 Ek A / 2026-10-07 | Cloudflare Workers AI gerçek adaptörü ve ücretli çağrı Faz10 kapısından (D05/D08/D10, PoC) önce eklendi (`3db452e`); yalnız Development/loopback, 30/gün | Kullanıcı isteğiyle XINOBI U canlı denemesi | Faz10 10.01A–10.05; `docs/decisions/ADR-002-cloudflare-workers-ai.md` Ek A | TST-XINOBI-U-live; yalnız Development; production'a Faz10 kapısıyla | **Proje sahibi onayladı · 07.10.2026** |

**Plan–kod sapma kaydı (2026-10-07 incelemesi):** (1) Faz03'ün EF Core DbContext/migration, kimlik, rol, audit ve outbox çekirdeği henüz yok; web ve panelin büyük kısmı geçici dosya deposu üzerinde çalışıyor. (2) Faz02 aktifken Faz04/05/06/10 işlevleri demo olarak kodlandı; bu kodlar ilgili fazın kabulü sayılmaz, faz başlarken yeniden doğrulanır. (3) Faz02'nin zorunlu çıktısı `design/a11y-audit.md` yok; BRIEF / ORTAK TASARIM / WEB TASARIM onayları bu tabloya işlenmedi. Bu üç madde kapanmadan ilgili faz kapısı açılmaz.

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

| Faz | Kod/teslim kanıtı | BA | Creative | FE | BE | DBA | Full Stack | Web Des. | CTO | PM nihai | Statü |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Plan var; uygulama kabulü yok | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Planlandı |
| 01 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Planlandı |
| 02 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Planlandı |
| 03 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Planlandı |
| 04 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Planlandı |
| 05 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Planlandı |
| 06 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Planlandı |
| 07 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Planlandı |
| 08 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Planlandı |
| 09 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Planlandı |
| 10 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Planlandı |
| 11 | — | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Planlandı |

`—` o fazda ek rolün zorunlu kaydı olmadığını gösterir.

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

### ProductSurfaces devam notu — 06.10.2026

- Konuşmadaki Phase 1/2/3 özelliğin alt adımlarıdır; proje Faz01/Faz02/Faz03 kabulü değildir. Takip adı `ProductSurfaces Step 1` olarak sabitlendi.
- Step 1 provider-neutral automatic/interactive aday revision, lineage, source-pixel Keep/Exclude doğrulaması, tam source/revision/candidate için açık approve/reject ve stale approval engeli sağlar. Interactive inference yeni sonuçtur; önceki maskeyi düzenlemez. Yeni candidate pending kalır ve mevcut onayı sessizce değiştirmez. Optional provider score yalnız sağlanan anlamıyla korunur.
- `SourceMediaIdentity` metadata değer nesnesidir; ortak Asset sahipliği kurmaz. Gelecekte doğru ürün/varyant/Asset medya sürümüne bağlanır. Maske PrintArea veya fiziksel baskı onayı değildir; SegmentationRevision müşteri DesignVersion'ı değildir; ReviewDecision ortak AuditLog'un yerine geçmez. Reviewer ileride authenticated principal'dan alınır. Ayrıntılı sınırlar: `docs/contracts/domain-contract-draft.md` ProductSurfaces bölümü.
- Mevcut onaylı Canvas önizleme/projeksiyon yalnız approved mask tüketir; ADR-001 Fabric.js müşteri editörü sorumluluğunu değiştirmez. Roboflow/SAM 3 segmentation PoC, ADR-002 Cloudflare görsel üretim kararından ayrıdır; production provider/medya aktarımı/saklama/maliyet/güvenlik açık kalır. Task arayüzü durable job değildir; gerçek adapter adımında ölçülen latency/provider davranışı ve ortak worker/job yönüyle yürütme stratejisi seçilir.
- `docs/sources/README.md` kayıt hash'leri mevcut özgün/kopya çiftleriyle uyuşmuyor; özgün ve kopya içerikleri kendi aralarında aynı. Bu oturumda kaynak dosyaları veya kayıtlı hash'ler değiştirilmedi; kaynak sürüm/provenance uzlaştırması ayrı iştir.
- Belgelerde atıf yapılan `Xinobi_Kavramsal_ve_Teknik_Analiz2.md` çalışma ağacında bulunamadı. İçeriği yeniden kurulmadı; mevcut fark matrisi doğrudan kaynak yerine kabul edilmez.
- Step 1 UNIT/MOCK başarısı gerçek hosted entegrasyon, UAT, fiziksel baskı veya PM faz kabulü değildir. Hiçbir rol onayı veya D kararı bu kayıtla doldurulmaz.


### ProductSurfaces Step 3 — 06.10.2026 oturum kaydı

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok.
- Yalnız development + explicit opt-in, process-local in-memory session/version lock, exact source/candidate kontrolü, automatic init ve yeni interactive pending revisions, approve/reject uygulandı.
- Yerel reference provider aynı maskeyi döndürür; noktalar kaydedilir fakat AI ile yeniden hesaplama yok. Üretim auth/persistence/jobs/provider yok; renderer/Fabric.js ve asset'ler değişmedi.
- Asset/Variant/media sınırı dev fixture üzerinden korunur. Maske PrintArea/DPI/physical production/D04 onayı değildir. D04/D05/D08/D10 açık kaldı.
- Final kanıt TST-093–099: 63/63 backend, 4/4 Admin E2E, Release 0 uyarı/0 hata, Admin typecheck/build/lint, hash/diff. İlk compile, sandbox Event Log, NVM shim, CSS browser desteği, pointer hassasiyeti ve test-host DLL kilidi sorunları raporlarda tekrar sonuçlarıyla korundu.
- Sonraki adım yalnız kullanıcı incelemesi; Step 4 başlamadı.

### ProductSurfaces Step 4B-1 — 06.10.2026 oturum kaydı

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Bu ProductSurfaces alt adımı repository-wide Faz04 değildir.
- Provider-neutral interface/domain korunarak infrastructure Roboflow PCS/PVS adapter, bounded COCO RLE normalization, existing Skia validation ve candidate-specific in-memory mask buffer uygulandı. Request/result HTTP yalnız mocked handler'larla sınandı.
- Default reference provider; ExternalInferenceEnabled default false. Runtime socket-backed provider composition yoktur; flag açılsa bile outbound kapalıdır. Gerçek key okunmadı/eklenmedi/kullanılmadı. Test header'ındaki sentetik string credential değildir. Görsel dışarı gönderilmedi, gerçek inference yok, kasıtlı Roboflow kredi tüketimi sıfır.
- External-provider mode startup/GET/page-load candidate üretmez; explicit “Aday oluştur” POST gerekir. HTTP await sırasında review gate tutulmaz; in-flight conflict, exact-source revalidation, failure/cancellation version ve önceki approval koruması vardır. Hatalarda noktalar korunur; retry yoktur.
- TST-100 final: 111/111 backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin typecheck/build/lint ve diff kontrolü başarılı. İlk nullable/test await compile, sandbox Event Log/browser start, NVM shim ve lint dependency sorunları düzeltme/izinli tekrar kanıtıyla kaydedildi.
- Renderer/Fabric.js/Tea Maker asset'leri ve production Asset/Variant/PrintArea/Design sorumlulukları değişmedi. Persistence/auth/jobs yok. D04/D05/D08/D10 çözülmedi. OpenAPI hash öncesi/sonrası aynı.
- Sonraki tek güvenli adım kullanıcı code-review/onayıdır. Deployed Roboflow wire contract hâlâ smoke doğrulaması ister. Credential configuration/use, exact görselin dış aktarımı veya gerçek inference öncesinde ayrıca açık kullanıcı onayı gerekir. Step 4B-2 başlamadı.

### ProductSurfaces Step 4B-2 — single automatic Roboflow smoke test / 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. UserSecretsId non-secret metadata eklendi; key'i kullanıcı kendi terminalinde ayarladı ve onayladı. Value gösterilmedi veya secret dump yapılmadı.
- Explicit limited approval: yalnız existing Tea Maker WebP, `lower kettle body`, tam bir automatic inference maksimum; interactive/second inference/retry yasak. Preflight source 1066×1600, SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`, provider/gate/credential presence/counter=0 doğrulandı. Atomic single-request guard ve interactive rejection uygulandı; default disabled kaldı.
- Actual requests attempted: **1**. HTTP **200**, **1529 ms**. PCS/RLE mocked wire assumptions eşleşti; parser correction yok. Returned candidate 1, selected index 0, supplied score 0.83984375. Compressed COCO RLE `[1600,1066]` -> exact RGBA PNG; validation başarılı.
- Mask SHA `6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db`; alpha zero/opaque/intermediate 1422315/283285/0. One pending candidate/revision, active approval null. Onay yapılmadı; second automatic, interactive ve retry yapılmadı. Exact credit consumption was not confirmed by the inference response.
- Desktop ve 390px mobile GET-only QA: aligned=true, overflow=false, QA POST=0. Görsel lower body iyi, fakat spout dahil ve alt sınır hafif pürüzlü; candidate insan review gerektirir. Screenshot'lar `%TEMP%/xinobi-product-surfaces-step4b2-desktop.png` ve `...-mobile.png`; safe evidence JSON aynı temp dizininde. Yerel QA localhost 5015 API / 5175 Vite, tek çağrı bütçesi tükenmiş in-memory oturum; restart bu çağrıyı tekrar yetkilendirmez.
- TST-101: 120/120 mocked/local backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin type/build/lint ve diff/hash başarılı. İlk GET-only QA scriptinde Türkçe stdin encoding locator timeout verdi; ASCII selector ile düzeltildi, inference tekrar edilmedi.
- Renderer/Fabric.js/source/reference assets, Asset/Variant/PrintArea/Design sorumlulukları ve OpenAPI değişmedi. D04/D05/D08/D10 açık. Production persistence/jobs/auth yok; runtime restart adayları kaybeder. Retention/training/billing miktarı teyitli değildir.
- Sonraki tek güvenli adım pending adayın kullanıcı tarafından incelenmesidir. Interactive deployed PVS testi için ayrı açık çağrı/point/source/budget onayı gerekir. Bu oturumun inference izni tüketildi; başka çağrı yapılmayacak.

### ProductSurfaces Step 4B-3 — single interactive Roboflow smoke test / 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Explicit limited approval yalnız Tea Maker exact source ve Keep (420,920) / Exclude (245,730) için tek interactive call. Credential değişmedi ve server-side kaldı. Automatic inference/retry/ikinci call yok.
- Actual interactive requests attempted: **1**; HTTP **200**, **1312 ms**. PVS top-level predictions/masks/confidence/format ve compressed COCO RLE [1600,1066] varsayımları doğrulandı; parser correction yok. Tek result, index 0, supplied score 0.9453125; score approval değildir.
- Normalized RGBA PNG 1066×1600; SHA `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`; alpha transparent/opaque/intermediate 1448452/257148/0. Exact source SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414` korundu; empty/full validation geçti, cleanup/resize yok.
- Önceki automatic pending kimlik ve maskesi verified local smoke handoff ile korundu. Yeni pending interactive revision/candidate, exact lineage, candidate-specific bytes; approval null, stateVersion=5. Automatic vs interactive: 26361 changed, 26249 removed, 112 added. Spout dışarıda; ana body korunmuş. Logo işaretlerinde küçük holes ve alt kenarda hafif jaggedness insan incelemesi gerektirir.
- Admin Düzelt/points/regenerate gerçek akışı: click başına inference yok; explicit regenerate tek POST. Desktop/390px mobile aligned, overflow yok. `%TEMP%/xinobi-step4b3-interactive-desktop.png`, `...-mobile.png`, `xinobi-step4b3-automatic-vs-interactive.png`.
- TST-102: 126/126 mocked/local backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin typecheck/build/lint ve diff/hash başarılı. OpenAPI SHA unchanged `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`.
- Exact credit consumption was not confirmed by the inference response. Renderer/Fabric.js/assets/PrintArea/production Asset/persistence/jobs/auth değişmedi; D04/D05/D08/D10 açık.
- Tek çağrı bütçesi tüketildi. Başka inference yok. Technical automatic + correction + pending review kanıtlandı; insan approval/code review sonraki güvenli adımdır. API restart yeni izin değildir.

### ProductSurfaces Step 4C-2 — Tea Maker opt-in enclosed-hole refinement / 06.10.2026

- Branch/HEAD feature/product-personalization / acc0c99; commit yok. Yalnız LOCAL deterministic işlem; gerçek Roboflow call0, credential kullanılmadı, dış medya aktarımı/kredi yok, package0.
- `ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled` default false; exact Tea Maker source/raw fixture ve reference provider + external/smoke gates false gerektirir. Threshold5718 inclusive/connectivity8 yalnız bu fixture policy'sidir; global default değil. Raw provider mask immutable test/development fixture olarak korunur; yeni Asset/persistence modeli yok.
- Provider-independent refiner yalnız enclosed alpha0 components doldurur; border-connected exterior ve mevcut RGBA pikseller değişmez. Branding dependency, bottom cleanup, smoothing, generic morphology yok. Existing validation/SHA pipeline kullanılır.
- Expected ölçümler birebir: foreground257148→262866, components5→1, enclosed holes1→0, filled1 hole/5718pixels. Exterior changed0, outer silhouette changed0. Raw SHA before/after `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`; derived SHA `4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43`.
- New pending derived candidate + exact raw/source/algorithm/version/policy/count/checksum provenance. Raw IDs unchanged; approval null, stale/version protections retained. Admin Ham/Düzenlenmiş comparison changes visualization only; raw view blocks decisions, explicit local refine action, no threshold editor. Desktop1440/mobile390 aligned, no overflow; logo hole fixed, spout/handle/upper/base/bottom silhouette preserved.
- TST-103: focused17/17, full backend/API148/148, Admin6/6, Release0 warnings/errors, Admin type/build/lint/diff successful. Initial test proxy header/CSS cwd/pixmap nullable issues corrected; no tests weakened or expected threshold changed. Raw/source/OpenAPI hashes preserved.
- Evidence `%TEMP%/xinobi-step4c2-review-derived-desktop.png`, `...-mobile.png`, `xinobi-step4c2-raw-vs-derived.png`; final derived QA candidate pending, no approval. Runtime API5016/Vite5176 is local-only and inference disabled; restart resets derived state, raw regression fixture remains.
- Renderer/Fabric.js/assets/PrintArea/Design/production Asset/persistence/jobs/auth unchanged. D04/D05/D08/D10 open. Policy stays Tea-Maker-specific; next safe step human/code review only. No inference/other product/next step begun.

### ProductSurfaces Step 4D-2 — minimal local Add/Remove correction — 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Yalnız development review içinde source-pixel Add/Remove strokes, zoom/pan, radius2/4/8/16, Undo/reset ve explicit yeni düzeltilmiş pending aday eklendi; full editor değil.
- Backend `source-pixel-capsule-strokes` v1 authoritative. Parent/raw/refined immutable; exact source/session/version/parent ve bounded input/work doğrulanır. Yeni provenance parent/output checksum + ordered operations + derived IDs + fixed dev reviewer kaydeder. Approval ayrı; eski onay değişmez.
- Çizim/zoom/pan/Undo sırasında POST0; explicit create1 local POST. Failure strokes/Undo korur, stale409 farklı adaya implicit transfer/retry yapmaz. Unsaved correction mode review/view değişimini engeller. API restart/history kaybı sürer; production persistence/auth/Asset/PrintArea/DesignVersion oluşturulmadı.
- TST-104: 21 focused + full169/169 backend/API, Admin10/10, Release0 warnings/errors, Admin type/build/lint ve diff başarılı. Çalışan API DLL kilidi nedeniyle mevcut süreç kapatılmadan ignored `bin/step4d2/` output kullanıldı. İlk compile/sandbox/pointer scroll/refined-parent QA/lint sorunları ve düzeltmeler test kaydında.
- Exact refined parent4f3fffe... üzerinden alt-kenar temsili human Add stroke88 pixel ekledi; output7979b30e...; pending, approvalnull. Desktop/390 mobile ve local before/after QA incelendi. Tüm sınırlar tamamlandı/ticari uygunluk onaylandı iddiası yok.
- Roboflow calls0, credential unused, external transfer0, packages0. Renderer/Fabric.js/source/manual mask/raw fixture/OpenAPI korunur. PrintArea/D04 ve D05/D08/D10 açık. Geçici QA dosyaları test kaydında; candidate test-host restart ile kaybolur.
- Sonraki tek güvenli adım: kullanıcı UI/QA incelemesi; yeni ürün/inference/production step başlatılmadı.

### ProductSurfaces Step 5B — Development Accepted-Surface → Storefront Renderer Bridge / 06.10.2026

- Yalnız development preview: explicit environment+flag gate, read-only loopback rendering bundle, exact source SHA/dimensions, manuel accepted prototype mask SHA/alignment, required branding SHA/alignment. AI ReviewDecision uydurulmadı; pending/rejected/derived adaylar yayınlanmadı.
- Web adapter + EditorWorkspace props; selected development variant query ürün→studio→editor ve geri bağlantıda korunur. Unsupported renkler blue'ya düşmez. Same-origin versioned assets; renderer algoritmaları ve manuel/source/branding asset'leri değişmedi. Native UI/loading/unavailable korunur.
- TST-105: 18 focused / 187 backend/API, 15 bridge+renderer / 6 mevcut web interaction-accessibility test geçti; API Release 0 warning/error, web typecheck/build/lint başarılı. 1440 desktop/390 mobile QA; outside pixel differences0, branding differences0; Next dev proxy local blue ready/silver unavailable doğrulandı.
- Roboflow0, credential use0, image transfer0, package0; production Asset/Variant/storage/persistence/PrintArea/cart/order yok. D02/D04/D05/D08/D10 açık. Shared Catalog+Asset+approved resolver gelecekte fixture resolver'ın yerini alır; production publishability kanıtlanmadı.
- Başlangıç API output kilidi ayrı ignored build directory ile aşıldı; mevcut Google Font build sandbox hatası izinli build ile giderildi. Test cookie/route-announcer/list-reference assertions düzeltildi; test kuralları zayıflatılmadı. Aktif normal Next dev durdurulmadan isolated preview distDir kullanıldı; Next type includes tsconfig'e eklendi.
- OpenAPI before/after SHA `01f859b52fe8543303c3201364718eef5f0610716a78250c57fde47b12c24fe6`; manuel mask SHA `8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06` korundu. Commit yok; next step yalnız kullanıcı QA/code review.

### Integration çalışma durumu — 06.10.2026

Ayrı integration/product-surfaces-step5b worktree; checkpoint e325dd7 + origin/main 529c107, merge henüz commit edilmedi. Teammate commerce/Admin korunur; ProductPatternPreview tek canonical surface renderer. D kararları ve production Asset/PrintArea açık. Önceki durum tabloları tarihsel kayıttır.

Integration validation — TST-106: backend214/214, Admin10/10, canonical bridge/renderer17/17; full web55/65 (5 preserved contrast + 5 legacy expectation failures). API/Web/Admin builds pass; incoming cached whitespace noted separately. Original worktree unchanged, no merge commit/push/inference. DEMO-P101/DEMO-V101-B explicit media-validated development bridge; no production IDs or D resolution.
