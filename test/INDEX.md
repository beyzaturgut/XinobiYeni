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
