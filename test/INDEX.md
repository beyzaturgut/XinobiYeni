# Test raporu indeksi

| Rapor ID | Tarih | Kapsam | Sonuç | Ortam/seviye | Rapor |
|---|---|---|---|---|---|
| TST-001 | 29.09.2026 | Başlangıçtan bugüne tüm doğrulama geçmişi | Kısmi başarılı; SQL dış erişimi bloke | LOCAL / CONNECTIVITY / MOCK | `2026-09-29/TST-001-initial-validation-history.md` |
| TST-002 | 29.09.2026 | Test raporu klasör ve kayıt bütünlüğü | Başarılı | LOCAL | `2026-09-29/TST-002-report-integrity.md` |
| TST-003 | 29.09.2026 | Docker'sız CI komut zinciri | Başarılı; bir yerel dizin çağrısı düzeltilerek tekrarlandı | LOCAL / CI CONTRACT | `2026-09-29/TST-003-ci-workflow.md` |
| TST-004 | 29.09.2026 | API health, request ID, Problem Details ve OpenAPI sözleşmesi | Başarılı; Release build 0/0, test 6/6 | INTEGRATION / CONTRACT | `2026-09-29/TST-004-api-contract-integration.md` |
| TST-005 | 29.09.2026 | Build-time OpenAPI, ortak TypeScript istemci ve CI drift kontrolü | Başarılı; ilk peer/şema sorunları düzeltildi, tüm regresyonlar geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-005-openapi-typescript-client.md` |
| TST-006 | 29.09.2026 | TCP/IP etkinleştirme sonrası uzak SQL Server ve XinobiYeniDB tekrar bağlantısı | Bloke; 1433 timeout, named instance bulunamadı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-006-sql-server-connectivity-retry.md` |
| TST-007 | 29.09.2026 | OpenAPI Dart/Dio istemcisi ve Flutter paket entegrasyonu | Başarılı; ara jeneratör/analyzer sorunları düzeltildi, tam regresyon geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-007-openapi-dart-flutter-client.md` |
| TST-008 | 29.09.2026 | API liveness ve gerçek SQL bağlantı probe'lu readiness ayrımı | Başarılı; .NET 9/9, istemci/web/panel ve mobil regresyonlar geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-008-liveness-readiness.md` |
| TST-009 | 29.09.2026 | Kesin 1433 bilgisiyle dış SQL Server ve XinobiYeniDB bağlantısı | Bloke; TCP ve ODBC login timeout, kimlik doğrulamaya ulaşılamadı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-009-sql-1433-external-connectivity.md` |
| TST-010 | 29.09.2026 | Uzak sunucu TCP 64019 aday SQL portu | Başarılı; TCP bağlantısı kuruldu | CONNECTIVITY | `2026-09-29/TST-010-sql-external-port-64019.md` |
| TST-011 | 29.09.2026 | TCP 64019 üzerinden SQL Server ve XinobiYeniDB kimlik doğrulaması | Bloke; port erişilebilir, SQL login üç denemede reddedildi | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-011-sql-login-on-64019.md` |
| TST-012 | 29.09.2026 | `xinobiyeni_app` ile uzak SQL Server ve XinobiYeniDB kimlik doğrulaması | Başarılı; veritabanı, login ve instance doğrulandı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-012-sql-login-xinobiyeni-app.md` |
| TST-013 | 30.09.2026 | Uzak SQL Server süreklilik ve metadata envanteri tekrar kontrolü | Bloke; SQL login öncesi ve ham TCP bağlantısında timeout | CONNECTIVITY / INTEGRATION | `2026-09-30/TST-013-sql-availability-recheck.md` |
| TST-014 | 30.09.2026 | Faz01 veri sahipliği ve durum geçişi teslim kontrolü | Başarılı; kapsam, açık karar ayrımı ve belge bağlantıları doğrulandı | DOCUMENT / CONTRACT | `2026-09-30/TST-014-phase01-data-state-document.md` |
| TST-015 | 30.09.2026 | Bildirilen tam `nc -vz 109.104.120.91 64019` komutuyla tekrar | Bloke; 30 saniyede yanıt yok, önceki süreli kontrolde timeout | CONNECTIVITY | `2026-09-30/TST-015-sql-exact-nc-retry.md` |
| TST-016 | 30.09.2026 | Faz01 iş sahibi karar formu kapsam kontrolü | Başarılı; D01–D10 ve kapanış alanları doğrulandı | DOCUMENT / CONTRACT | `2026-09-30/TST-016-stakeholder-decision-intake.md` |
| TST-017 | 30.09.2026 | Uzak SQL Server sürüm, şema, migration ve yetki envanteri | Başarılı; SQL 2022 Express, boş DB ve geçici db_owner yetkisi doğrulandı | CONNECTIVITY / INTEGRATION | `2026-09-30/TST-017-sql-environment-inventory.md` |
| TST-018 | 30.09.2026 | Faz02 tasarım sistemi ve responsive ana sayfa başlangıcı | Başarılı build/smoke; gerçek tarayıcı görsel QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-018-phase02-home-foundation.md` |
| TST-019 | 30.09.2026 | Faz02 WEB-002 responsive ürün kataloğu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-019-phase02-product-catalog.md` |
| TST-020 | 30.09.2026 | Faz02 WEB-004 ürün detay ve dört renk varyantı | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-020-phase02-product-detail.md` |
| TST-021 | 30.09.2026 | Faz02 WEB-005 basit kişiselleştirme stüdyosu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-021-phase02-simple-personalization.md` |
| TST-022 | 30.09.2026 | Faz02 WEB-006 gelişmiş editör araç ve katman kabuğu | Başarılı; ilk lint apostrof kaçışı düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-022-phase02-advanced-editor.md` |
| TST-023 | 30.09.2026 | Faz02 WEB-003 arama ve karşılaştırma | Başarılı; ilk komut yolu düzeltildi, lint/build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-023-phase02-search-compare.md` |
| TST-024 | 30.09.2026 | Faz02 WEB-007 favoriler | Başarılı; ilk React effect lint hatası düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-024-phase02-favorites.md` |
| TST-025 | 30.09.2026 | Faz02 WEB-008 sepet kabuğu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-025-phase02-basket.md` |
| TST-026 | 30.09.2026 | Faz02 WEB-009 güvenli ödeme form kabuğu | Başarılı lint/build/HTTP smoke; gerçek sağlayıcı ve browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-026-phase02-checkout.md` |
| TST-027 | 30.09.2026 | Faz02 WEB-010 ödeme sonucu senaryoları | Başarılı lint/build/HTTP smoke; sağlayıcı/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-027-phase02-payment-result.md` |
| TST-028 | 30.09.2026 | Faz02 WEB-011 üyelik/oturum kabuğu | Başarılı; ilk JSX apostrof lint hataları düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-028-phase02-account-access.md` |
| TST-029 | 30.09.2026 | Faz02 WEB-012 hesap/adres kabuğu | Başarılı lint/build/HTTP smoke; kimlik API ve browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-029-phase02-account-address.md` |
| TST-030 | 30.09.2026 | Faz02 WEB-013 sipariş/kargo takip kabuğu | Başarılı lint/build/HTTP smoke; D03/kargo API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-030-phase02-orders-tracking.md` |
| TST-031 | 30.09.2026 | Faz02 WEB-014 iptal/iade form kabuğu | Başarılı lint/build/HTTP smoke; D03/D10/API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-031-phase02-return-request.md` |
| TST-032 | 30.09.2026 | Faz02 WEB-015 kurumsal teklif formu | Başarılı lint/build/HTTP smoke; D07/dosya API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-032-phase02-corporate-quote.md` |
| TST-033 | 30.09.2026 | Faz02 WEB-016 teklif takip/revizyon kabuğu | Başarılı lint/build/HTTP smoke; D07/API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-033-phase02-quote-tracking.md` |
| TST-034 | 30.09.2026 | IIS statik yayın artefaktı | Artefakt başarılı; uzak IIS deployment erişim bekliyor | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-09-30/TST-034-iis-static-export.md` |
| TST-035 | 30.09.2026 | DEPLOY-001 IIS sunucu içi ve dış bağlantı | Sunucu içi başarılı; dış TCP 8014 timeout | DEPLOYMENT / CONNECTIVITY / SMOKE | `2026-09-30/TST-035-iis-preview-connectivity.md` |
| TST-036 | 30.09.2026 | Firewall sonrası DEPLOY-001 dış HTTP smoke | Başarılı; üç rota HTTP 200, HTTPS bekliyor | DEPLOYMENT / CONNECTIVITY / SMOKE | `2026-09-30/TST-036-iis-external-http-smoke.md` |
| TST-037 | 30.09.2026 | Faz02 WEB-017 AI tasarım senaryo kabuğu | Başarılı; ilk görsel yolu build hatası düzeltildi, static export geçti | STATIC / BUILD / INTERACTION CONTRACT | `2026-09-30/TST-037-phase02-ai-design.md` |
| TST-038 | 30.09.2026 | Faz02 WEB-018 AI satış asistanı kabuğu | Başarılı lint/build/static smoke; sağlayıcı/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-038-phase02-ai-sales-assistant.md` |
| TST-039 | 30.09.2026 | Faz02 WEB-019 kurumsal/içerik kabuğu | Başarılı lint ve 22 sayfalık static export; iki ağ-kısıtlı deneme kayıtlı | STATIC / BUILD / CONTENT CONTRACT | `2026-09-30/TST-039-phase02-corporate-content.md` |
| TST-040 | 30.09.2026 | WEB-019 menü tipografi eşlemesi | Başarılı lint, TypeScript ve 22/22 static export | STATIC / BUILD / VISUAL TOKEN | `2026-09-30/TST-040-web019-menu-typography.md` |
| TST-041 | 30.09.2026 | Faz02 WEB-020 yasal/çerez tercih kabuğu | Başarılı lint, 23/23 static export ve kritik sınır smoke | STATIC / BUILD / CONSENT CONTRACT / SMOKE | `2026-09-30/TST-041-phase02-legal-consent.md` |
| TST-042 | 30.09.2026 | DEPLOY-002 güncel IIS tam paket bütünlüğü | Başarılı; 226 girdi, ZIP CRC ve SHA-256 doğrulandı | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-09-30/TST-042-deploy-002-package.md` |
| TST-043 | 30.09.2026 | Faz02 ilk Chrome responsive görsel QA grubu | Kısmi başarılı; 1440/500 px geçti, iki taşma koruması düzeltildi, 390 px gerçek cihaz açık | BROWSER / RESPONSIVE / BUILD | `2026-09-30/TST-043-phase02-browser-responsive-qa-01.md` |
| TST-044 | 01.10.2026 | Faz02 ikinci Chrome responsive görsel QA grubu | Kısmi başarılı; altı rota 500 px görsel kontrolden geçti, interaction/gerçek cihaz açık | BROWSER / RESPONSIVE / VISUAL | `2026-10-01/TST-044-phase02-browser-responsive-qa-02.md` |
| TST-045 | 01.10.2026 | Faz02 üçüncü Chrome responsive görsel QA grubu | Başarılı görsel grup; yedi rota geçti, dört mobil header düzeltildi ve tekrar doğrulandı | BROWSER / RESPONSIVE / BUILD | `2026-10-01/TST-045-phase02-browser-responsive-qa-03.md` |
| TST-046 | 01.10.2026 | Faz02 dördüncü Chrome uzun sayfa görsel QA grubu | Başarılı; WEB-017–020 500 px uzun görünüm geçti, gecikmeli görsel yükleme ayrıştırıldı | BROWSER / RESPONSIVE / VISUAL | `2026-10-01/TST-046-phase02-browser-responsive-qa-04.md` |
| TST-047 | 01.10.2026 | Faz02 Playwright kritik etkileşim/klavye altyapısı | İlk koşu 2/3, fixture beklentisi düzeltildi; final 3/3 ve 23 rota build başarılı | E2E / KEYBOARD / BUILD | `2026-10-01/TST-047-phase02-playwright-critical-interactions.md` |
| TST-048 | 01.10.2026 | Faz02 Playwright kritik etkileşim kapsam genişletme | İlk koşu 7/8; belirsiz test seçicisi düzeltildi, final 8/8 başarılı | E2E / INTERACTION / KEYBOARD | `2026-10-01/TST-048-phase02-playwright-interactions-02.md` |
| TST-049 | 01.10.2026 | Faz02 Playwright kalan kritik etkileşimler | Ara koşular 11/13 ve 12/13; seçiciler düzeltildi, final 13/13, lint ve 23 rota build başarılı | E2E / INTERACTION / BUILD | `2026-10-01/TST-049-phase02-playwright-interactions-03.md` |
| TST-050 | 01.10.2026 | Faz02 otomatik erişilebilirlik ve klavye odağı | İlk tarama 4/22; kontrast ve ad sorunları düzeltildi, final a11y 22/22 ve birleşik E2E 35/35 başarılı | E2E / A11Y / WCAG / KEYBOARD / BUILD | `2026-10-01/TST-050-phase02-accessibility.md` |
| TST-051 | 01.10.2026 | Faz02 katalog, ürün, favori, ödeme ve kişiselleştirme etkileşimleri | İlk genişletilmiş koşu 15/18; seçiciler düzeltildi, final kritik 18/18 ve birleşik E2E 40/40 başarılı | E2E / INTERACTION / REGRESSION | `2026-10-01/TST-051-phase02-playwright-interactions-04.md` |
| TST-052 | 01.10.2026 | Ana sayfa, Xinobi dünyası ve yasal merkez navigasyon smoke | İç hedefler ve tüm dahili rota yanıtları başarılı; 3/3 | E2E / NAVIGATION / SMOKE | `2026-10-01/TST-052-phase02-navigation-smoke.md` |
| TST-053 | 01.10.2026 | Faz02 web bileşen sözleşmesi ve token eşliği | JSON geçerli; 10 sözleşme bölümü ve zorunlu durum/erişilebilirlik/karar işaretleri mevcut | DOCUMENT / DESIGN CONTRACT / A11Y | `2026-10-01/TST-053-phase02-component-contract.md` |
| TST-054 | 01.10.2026 | Faz02 web, panel ve Flutter kanal akış sözleşmesi | Başarılı; WEB 20/20, ADM 12/12, MOB 6/6 ve D02–D10 izlenebilir | DOCUMENT / DESIGN CONTRACT / FLOW TRACEABILITY | `2026-10-01/TST-054-phase02-channel-flows.md` |
| TST-055 | 01.10.2026 | Analiz2 yaratıcı/web tasarım ve CTO AI karar kapısının fazlara eklenmesi | Başarılı; K-01–K-21, kullanıcı tasarım onayları, AI-P01 ve ADR-001 sınırı planlandı | DOCUMENT / REQUIREMENTS / DECISION-GATE | `2026-10-01/TST-055-analysis2-plan-gap-update.md` |
| TST-056 | 01.10.2026 | Cloudflare Workers AI sağlayıcı ve Creative/Web Designer ortak tek tasarım kararı | Başarılı; ADR-002, Faz10 uygulama sınırı ve iki kullanıcı tasarım kapısı kayıtlı | DOCUMENT / ARCHITECTURE DECISION / DESIGN GOVERNANCE | `2026-10-01/TST-056-cloudflare-and-single-design-decision.md` |
| TST-057 | 01.10.2026 | Creative Designer ve Web Designer ortak tasarım başlangıç paketi | Başarılı; K-01–K-21 21/21, ortak art direction, medya/içerik rehberi ve WEB-001 responsive wireframe hazır | DOCUMENT / DESIGN TRACEABILITY / RESPONSIVE WIREFRAME | `2026-10-01/TST-057-shared-creative-direction.md` |
| TST-058 | 01.10.2026 | WEB-001 ortak yüksek doğruluklu HTML/CSS tasarım ve beş responsive render | Başarılı; her kırılımda 14/14 görsel, yatay taşma yok, Creative/Web QA revizyonları işlendi; etkileşim kabulü açık | DESIGN / BROWSER RENDER / RESPONSIVE / VISUAL QA | `2026-10-01/TST-058-web001-hifi-render.md` |
| TST-059 | 01.10.2026 | WEB-001 admin yönetimli alanların geçici/temsili içerik açıklamaları | Başarılı; dört içerik alanı etiketlendi, beş responsive renderda 14/14 görsel ve taşmasız görünüm | DESIGN / CONTENT GOVERNANCE / RESPONSIVE RENDER | `2026-10-01/TST-059-web001-admin-placeholder-labels.md` |
| TST-060 | 01.10.2026 | WEB-001 etkileşimli yerel tasarım prototipi | Başarılı; masaüstü mega menü/hero/Nobi, mobil drawer/carousel ve beş taşmasız responsive render doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE | `2026-10-01/TST-060-web001-interactive-prototype.md` |
| TST-061 | 01.10.2026 | WEB-001 kullanıcı tasarım geri bildirimi 01 | Başarılı; görsel-only slider, kategori menüsü/rayı, inceltilmiş XINOBI U, küçük ürün görselleri ve Keşfet kaldırma doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE | `2026-10-01/TST-061-web001-design-feedback-01.md` |
| TST-062 | 01.10.2026 | Ana sayfa ve admin slider geri bildirimi | Başarılı; header ayrımı, kategori dropdown, kişiselleştirme bannerı ve fotoğraf/video slider yönetimi doğrulandı | DESIGN / ADMIN UI / BROWSER / BUILD | `2026-10-01/TST-062-home-admin-slider-feedback.md` |
| TST-063 | 01.10.2026 | WEB-001 XINOBI U sabit CTA bannerı | Başarılı; sabit kalınlık, admin görsel alanı, sabit CTA rotası ve düzenlenebilir buton rengi doğrulandı | DESIGN PROTOTYPE / ADMIN UI / RESPONSIVE / BROWSER | `2026-10-01/TST-063-xinobi-u-fixed-cta-banner.md` |
| TST-064 | 02.10.2026 | WEB-001 slider ve XINOBI U banner yenilemesi | Başarılı; üç yeni slider görseli, yeni XINOBI U bannerı ve küçültülmüş CTA beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / ADMIN UI / RESPONSIVE / BROWSER | `2026-10-02/TST-064-web001-banner-refresh.md` |
| TST-065 | 02.10.2026 | WEB-001 öne çıkan ürün hizalama | Başarılı; üç ürünün medya alanı, taban çizgisi ve bilgi satırları eşitlendi, mobil karusel korundu | DESIGN PROTOTYPE / BROWSER / RESPONSIVE / VISUAL | `2026-10-02/TST-065-featured-product-alignment.md` |
| TST-066 | 02.10.2026 | WEB-001 slider görsel yenilemesi 02 | Başarılı; hava temizleyici, kahve makinesi ve çay makinesi görsellerinin üçü de SHA-256 ve Chrome slider testiyle doğrulandı | DESIGN PROTOTYPE / ASSET INTEGRITY / BROWSER / RESPONSIVE | `2026-10-02/TST-066-slider-image-refresh-02.md` |
| TST-067 | 02.10.2026 | WEB-001 header ikonları ve Nobi robot işareti | Başarılı; üç ikonlu header, erişilebilir adlar, yeni robot sembolü ve Nobi etkileşimi beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE / ACCESSIBILITY | `2026-10-02/TST-067-header-icons-nobi-mark.md` |
| TST-068 | 02.10.2026 | WEB-001 ortak Nobi sembolü | Başarılı; launcher ve panel başlığı tek SVG robot kaynağına bağlandı, gelecek tüm Nobi temas noktaları için tasarım kuralı kaydedildi | DESIGN SYSTEM / BROWSER / INTERACTION / RESPONSIVE / VISUAL | `2026-10-02/TST-068-shared-nobi-symbol.md` |
| TST-069 | 02.10.2026 | WEB-001 Nobi tetikleyici boyutu | Başarılı; masaüstü ve mobil Nobi tetikleyicisi küçültüldü, panel simgesi korundu ve beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / BROWSER / RESPONSIVE / INTERACTION | `2026-10-02/TST-069-nobi-launcher-size.md` |
| TST-070 | 02.10.2026 | Onaylı WEB-001 tasarımının gerçek Next.js ana sayfasına aktarılması | Başarılı; lint, 23 rota build, 43/43 E2E ve statik masaüstü/mobil görsel test geçti | BUILD / E2E / ACCESSIBILITY / RESPONSIVE / VISUAL | `2026-10-02/TST-070-production-homepage-integration.md` |
| TST-071 | 02.10.2026 | DEPLOY-003 güncel IIS tam paket bütünlüğü | Başarılı; doğru `out/` kökü, 233 girdi, ZIP CRC ve SHA-256 doğrulandı | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-10-02/TST-071-deploy-003-package.md` |
| TST-072 | 02.10.2026 | Çerez tercihleri ve Nobi konum ayrımı | Başarılı; çerez düğmesi sol alta taşındı, masaüstü/mobil koordinat testi ve 43/43 regresyon geçti | UI REGRESSION / RESPONSIVE / E2E / VISUAL | `2026-10-02/TST-072-cookie-nobi-position.md` |
| TST-073 | 02.10.2026 | Mobil çerez paneli ve XINOBI U banner yerleşimi | Başarılı; 390/412 px konum, taşma ve tam kadraj testi ile 43/43 regresyon geçti; deploy alınmadı | UI REGRESSION / RESPONSIVE / E2E / VISUAL | `2026-10-02/TST-073-mobile-consent-personalize.md` |

- 02.10.2026 · [TST-074 mobil deploy paketi](2026-10-02/TST-074-mobile-deploy-package.md) — Build/mobil/ZIP başarılı; canlı yayın açık.
- 02.10.2026 · [TST-075 editör/AI spec](2026-10-02/TST-075-editor-ai-spec.md) — Belge taslağı kontrolü başarılı; rol kabulü açık.

- 02.10.2026 · [TST-076 handoff bütünlüğü](2026-10-02/TST-076-handoff.md) — 22 varlık ve API durumu doğrulandı; kabul açık.

- 02.10.2026 · [TST-077 ana sayfa dokunma alanları](2026-10-02/TST-077-home-touch-targets.md) — Lint/build ve 48/48 E2E başarılı.

- 02.10.2026 · [TST-078 yönetim paneli](2026-10-02/TST-078-admin-panel.md) — Build/lint ve dashboard/sipariş/CMS tarayıcı kontrolleri başarılı.

- 03.10.2026 · [TST-079 katalog ve varyantlar](2026-10-03/TST-079-admin-catalog.md) — Build/lint, katalog akışı ve mevcut panel regresyonu başarılı.

- 03.10.2026 · [TST-080 stok/depo yönetimi](2026-10-03/TST-080-admin-inventory.md) — Build/lint, stok/mutabakat/sayım ve panel regresyonu başarılı.

- 03.10.2026 · [TST-081 fiyat/kampanya yönetimi](2026-10-03/TST-081-admin-pricing.md) — Hesaplama ve UI testleri, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-082 kurumsal teklifler](2026-10-03/TST-082-admin-quotes.md) — Revizyon modeli/UI, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-083 tasarım/baskı operasyonları](2026-10-03/TST-083-admin-print.md) — Build/lint, sürüm/çıktı/not ve panel regresyonu başarılı.

- 03.10.2026 · [TST-084 entegrasyon izleme](2026-10-03/TST-084-admin-integrations.md) — Model/UI, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-085 AI yönetimi](2026-10-03/TST-085-admin-ai.md) — Model/UI, build/lint ve panel regresyonu başarılı.

- [TST-086 — ADM-002 rol, ayar ve denetim](2026-10-03/TST-086-admin-settings.md)

- 07.10.2026 · [TST-087 faz eksiklik maddeleri](2026-10-07/TST-087-phase-gap-update.md) — Faz00–Faz11 belge revizyonu; diff temiz, işaretler tutarlı, kod değişmedi.

- 06.10.2026 · [XINOBI U yerel gerçek Cloudflare doğrulaması](2026-10-06/TST-XINOBI-U-live.md) — Numarasız rapor; 07.10.2026'da indekse eklendi. İki gerçek üretim, API 21 test, web/admin build ve uçtan uca akış başarılı.

- 06.10.2026 · [Ücretsiz ürün yüzeyi önizlemesi](2026-10-06/TST-XINOBI-U-free-preview.md) — Numarasız rapor; 07.10.2026'da indekse eklendi. Masaüstü/mobil, orijinal piksel koruma ve PNG indirme başarılı; ücretli çağrı yok.

- 07.10.2026 · [TST-088 kayıt açığı sonrası HEAD doğrulaması](2026-10-07/TST-088-retroactive-head-validation.md) — Mimari testler 26/26, admin/web lint ve build başarılı; uçtan uca yerel testler çalıştırılmadı.

- 07.10.2026 · [TST-089 yerel uçtan uca regresyon](2026-10-07/TST-089-local-e2e-regression.md) — 22 araçtan 16 başarılı, 6 başarısız: 5 eski test (kasıtlı UI değişiklikleri), 1 süresi dolmuş oturum; ürün hatası bulunmadı, kullanıcı verisi değişmedi.
