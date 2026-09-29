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
