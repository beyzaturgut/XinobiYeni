# TST-087 — ProductSurfaces Step 4B-1 mocked HTTP

Tarih: 06.10.2026. Seviye: UNIT / MOCK HTTP / LOCAL API / ADMIN E2E / BUILD / FILE INTEGRITY.

## Final sonuçlar

- `dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false --verbosity minimal`: **111/111**, skipped 0. Önceki 63 case + 48 yeni case; Step 1/2/3 ve API/architecture regresyonları dahil.
- `dotnet build services/api/Xinobi.Api.csproj --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false --verbosity minimal`: 0 uyarı / 0 hata.
- Admin: mevcut Node 24.20.0 executable ile `node_modules/typescript/bin/tsc -b --pretty false`, `node_modules/vite/bin/vite.js build`, `node_modules/oxlint/bin/oxlint`: başarılı, final lint uyarısı yok.
- `apps/web/node_modules/@playwright/test/cli.js test --config apps/admin/playwright.config.ts`: **5/5**, final 12.5s. Desktop/mobile source-alpha overlay, correction/regenerate/approve/reject, stale reload, failure point preservation, coordinates ve source-only explicit create mock akışı dahil.
- `git diff --check`: başarılı. Yeni source/test dosyaları whitespace kontrolüne ayrıca dahil edildi. OpenAPI üretimi/generator komutları çalıştırılmadı.

OpenAPI SHA-256 öncesi/sonrası: `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`. Önceden mevcut değişiklik korunmuştur.

## Sınanan kurallar

Automatic/PVS serialization, endpoint, base64 source, server-controlled prompt, sentetik Bearer header; source-point order/decimal/Keep/Exclude; actual score/sıra seçimi; strict PCS/PVS envelopes; COCO column-major, asymmetric/hole/compressed runs, wrong size, invalid/negative/truncated/overflow/empty/full guards; timeout/cancellation; 400/422/401/403/429/5xx/network/malformed/unsupported response; safe errors/no raw key/image leak; disabled configuration/transport; explicit automatic generation; GET zero provider calls; candidate-specific immutable mask bytes, source/version binding, new interactive lineage/pending/approval preservation; in-flight readable state/409, failure version, cancellation finalization ve HTTP beklenirken source değişiminin commit'i engellemesi.

Normal provider testleri yalnız test-defined `MockHandler` kullanır; socket fallback yoktur. Runtime Step 4B-1 composition yalnız socket açamayan handler ve false gate kullanır, configured API key okumaz. Local API/E2E reference provider veya intercepted JSON kullanır. Gerçek credential yok; yalnız `unit-test-only-not-a-credential` sentetik header fixture'ı vardır. Gerçek Roboflow isteği/image transfer/inference yapılmadı; kasıtlı kredi tüketimi sıfır. Adapter raw request/error body loglamaz; safe Problem Details mevcut requestId/timestampUtc sözleşmesini korur.

## İlk deneme/tekrarlar

- Nullable candidate HTTP sözleşmesi eski reference testlerinin nullable compile uyarılarını açtı; reference-only test erişimleri explicit non-null olarak güncellendi, assertions kaldırılmadı.
- İki awaited byte dizisini aynı span expression'da karşılaştırma CS4007 verdi; await sonuçları ayrı locals'a alınarak düzeltildi.
- İlk sandbox backend koşusunda Windows Event Log erişim engeli nedeniyle 21 fail / 81 pass oldu; izinli tekrar 102/102. Yeni safety testlerinden sonra 104/104, 109/109 ve final 111/111 geçti.
- NVM shim aktif Node sürümü bulamadı; kurulu Node 24.20.0 executable doğrudan kullanıldı, kurulum yapılmadı.
- İlk lint effect dependency uyarısı maske URL local/dependency ile düzeltildi; final type/build/lint temiz.
- İlk sandbox Playwright local server start ilerlemedi; interrupt edildi. İzinli local-only tekrar 5/5, son UI değişikliği sonrası final 5/5 geçti. NO_COLOR/FORCE_COLOR runner uyarısı uygulama lint hatası değildir.

## Kabul sınırı

Mock HTTP sağlayıcı wire/AI kalite/billing/privacy kabulü değildir. Seçilen PCS prompt_results/PVS top-level predictions/RLE dictionary deployed service üzerinde henüz doğrulanmadı. Gerçek WebP/orientation/decimal coordinates/billing/retention ayrıca doğrulanmalı. Future external execution exact product media'yı aktarır; credential ve credit-consuming execution öncesi ayrı açık kullanıcı onayı gerekir. Smoke test eklenmedi veya çalıştırılmadı.

Development-only, in-memory, production authentication/persistence/jobs yok. Mask approval PrintArea/DPI/manufacturing/D04 onayı değildir. D04/D05/D08/D10 açık; renderer/Fabric.js ve source/reference-mask asset'leri değişmedi. Paket eklenmedi.
