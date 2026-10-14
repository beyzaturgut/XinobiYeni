# 9–13 Ekim kayıt açığı taskları

Önceki [9 Ekim ekinin](tasks-2026-10-09-addendum.md) devamı. Kesim: `5da3dba` (TST-114) → `b1573d0`. Bu 31 commit Faz00’da ve `test/` altında kayıtsızdı; 14.10.2026’da Git geçmişinden geri dolduruldu.

**Kanıt sınırı:** Durum `Commitlendi`, commit’in main’de olduğunu gösterir; faz kabulü değildir. Commit anında tarihli test raporu yoktu. HEAD için toplu doğrulama [TST-115](../../test/2026-10-14/TST-115-head-regression-and-phase-audit.md) ile yapıldı. DEPLOY-008/009/010 paketleri hazırlandı; uzak IIS uygulaması ve canlı smoke kaydı yok.

[CSV](tasks-2026-10-13-addendum.csv) · 31 task.

### TASK-20261013-ADD-001 — XINOBI U birleşik AI QA ve kaynakla eşleşen kişiselleştirme (branch)

- Faz: Faz10/06 · Durum: Commitlendi · 09.10.2026 10:30 · Aslı Aydın
- Not: Branch commit; b38d13d ile main’e alındı
- Kanıt: [63025e7](https://github.com/beyzaturgut/XinobiYeni/commit/63025e70d3dbfcd1049d3babd35e26d9d2b08606)
- Dosyalar (56): `apps/admin/src/App.tsx`, `apps/admin/src/features/product-surfaces/CatalogSourceSelection.tsx`, `apps/admin/src/features/product-surfaces/LocalMaskEditor.tsx`, `apps/admin/src/features/product-surfaces/ProductSurfaceReview.tsx`, `apps/admin/src/features/product-surfaces/product-surfaces.css`, `apps/admin/tests/e2e/catalog-source-selection.spec.ts` · tam liste `git show --stat 63025e7`

### TASK-20261013-ADD-002 — CM101 maske kontrol noktası paketi (branch)

- Faz: Faz06 · Durum: Commitlendi · 09.10.2026 10:39 · Aslı Aydın
- Not: Branch commit; b38d13d ile main’e alındı
- Kanıt: [083b311](https://github.com/beyzaturgut/XinobiYeni/commit/083b311f4cb2c904a8c33a291358598f67c05e29)
- Dosyalar (12): `fixtures/product-surfaces/cm101-metallic-navy/.gitattributes`, `fixtures/product-surfaces/cm101-metallic-navy/811f44ed-2d47-49b6-ada2-2824b54d72ef/acceptance.json`, `fixtures/product-surfaces/cm101-metallic-navy/811f44ed-2d47-49b6-ada2-2824b54d72ef/branding.png`, `fixtures/product-surfaces/cm101-metallic-navy/811f44ed-2d47-49b6-ada2-2824b54d72ef/current.json`, `fixtures/product-surfaces/cm101-metallic-navy/811f44ed-2d47-49b6-ada2-2824b54d72ef/demo-state.json`, `fixtures/product-surfaces/cm101-metallic-navy/811f44ed-2d47-49b6-ada2-2824b54d72ef/manifest.json` · tam liste `git show --stat 083b311`

### TASK-20261013-ADD-003 — Katalog kişiselleştirme hazırlığı ve korunan marka alanları (branch)

- Faz: Faz04/06 · Durum: Commitlendi · 09.10.2026 13:11 · Aslı Aydın
- Not: Branch commit; b38d13d ile main’e alındı; docs/reports/catalog-readiness-2026-10-09.md
- Kanıt: [fda5c83](https://github.com/beyzaturgut/XinobiYeni/commit/fda5c83e5b1a9ae6384e7d1d5fe3e6c449e4c72e)
- Dosyalar (42): `apps/admin/src/features/product-surfaces/CatalogMaskReview.tsx`, `apps/admin/src/features/product-surfaces/CatalogReadiness.tsx`, `apps/admin/src/features/product-surfaces/CatalogSourceSelection.tsx`, `apps/admin/src/features/product-surfaces/LocalMaskEditor.tsx`, `apps/admin/vite.config.ts`, `apps/web/next.config.ts` · tam liste `git show --stat fda5c83`

### TASK-20261013-ADD-004 — XINOBI U çoklu maske düzenleme ve aile içi maske aktarımı (branch)

- Faz: Faz06 · Durum: Commitlendi · 10.10.2026 14:53 · Aslı Aydın
- Not: Branch commit; 57a1969 ile main’e alındı
- Kanıt: [6ff45a0](https://github.com/beyzaturgut/XinobiYeni/commit/6ff45a0c505df07e0cbaa7fc257a1bd2d6078619)
- Dosyalar (31): `apps/admin/src/features/product-surfaces/CatalogMaskReview.tsx`, `apps/admin/src/features/product-surfaces/CatalogReadiness.tsx`, `apps/admin/src/features/product-surfaces/FamilyMaskTransfer.tsx`, `apps/admin/src/features/product-surfaces/MaskCandidateSelection.tsx`, `apps/admin/src/features/product-surfaces/catalog-readiness-reason.ts`, `apps/web/src/app/urunler/cay-makinesi-101/editor/product-pattern-preview.tsx` · tam liste `git show --stat 6ff45a0`

### TASK-20261013-ADD-005 — feature/xinobi-u-unified-ai-qa 1. birleştirme

- Faz: Entegrasyon · Durum: Commitlendi · 13.10.2026 09:37 · Beyza Turgut
- Not: Çakışma çözümü: main panel görünümleri korundu, deneysel yüzey çalışma alanı bayrağa bağlandı
- Kanıt: [b38d13d](https://github.com/beyzaturgut/XinobiYeni/commit/b38d13db595aecd4b97eca17f9cfbf246a9dc416)
- Dosyalar (97): `apps/admin/src/App.tsx`, `apps/admin/src/features/product-surfaces/CatalogMaskReview.tsx`, `apps/admin/src/features/product-surfaces/CatalogReadiness.tsx`, `apps/admin/src/features/product-surfaces/CatalogSourceSelection.tsx`, `apps/admin/src/features/product-surfaces/LocalMaskEditor.tsx`, `apps/admin/src/features/product-surfaces/ProductSurfaceReview.tsx` · tam liste `git show --stat b38d13d`

### TASK-20261013-ADD-006 — Kabul edilmiş yüzey fixture paketi ve içe aktarıcı

- Faz: Faz06 · Durum: Commitlendi · 13.10.2026 10:46 · Aslı Aydın
- Not: Branch commit
- Kanıt: [5ad393e](https://github.com/beyzaturgut/XinobiYeni/commit/5ad393e59d93bd12dbdb4524aa1b56dce41ac93c)
- Dosyalar (49): `.gitignore`, `fixtures/product-surfaces/xinobi-u-accepted/.gitattributes`, `fixtures/product-surfaces/xinobi-u-accepted/README.md`, `fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json`, `fixtures/product-surfaces/xinobi-u-accepted/manifest.json`, `fixtures/product-surfaces/xinobi-u-accepted/media/01b20091ecaa4fbb86a9a929bf7b56ee.webp` · tam liste `git show --stat 5ad393e`

### TASK-20261013-ADD-007 — Mobil dinamik XINOBI U önizleme akışı (webview)

- Faz: Faz11/06 · Durum: Commitlendi · 13.10.2026 10:57 · Aslı Aydın
- Not: Branch commit; webview_flutter eklendi
- Kanıt: [3b83b12](https://github.com/beyzaturgut/XinobiYeni/commit/3b83b121a0fae43ba4982525ae5f4bdd5812e89d)
- Dosyalar (18): `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/api_config.dart`, `apps/mobile/lib/features/xinobi_u/mobile_preview_screen.dart`, `apps/mobile/lib/features/xinobi_u/questionnaire_screen.dart`, `apps/mobile/lib/features/xinobi_u/xinobi_u_screen.dart`, `apps/mobile/pubspec.lock` · tam liste `git show --stat 3b83b12`

### TASK-20261013-ADD-008 — Katalog yüzey QA araçlarının hizalanması

- Faz: Test · Durum: Commitlendi · 13.10.2026 10:58 · Aslı Aydın
- Not: Branch commit
- Kanıt: [b6ccad8](https://github.com/beyzaturgut/XinobiYeni/commit/b6ccad88f695565131daf13aa840313ee26b159c)
- Dosyalar (16): `apps/admin/src/features/product-surfaces/CatalogMaskReview.tsx`, `apps/admin/src/features/product-surfaces/CatalogReadiness.tsx`, `apps/admin/src/features/product-surfaces/CatalogSourceSelection.tsx`, `apps/web/tests/e2e/cm101-approval-preview.spec.ts`, `apps/web/tests/e2e/large-catalog-preview.spec.ts`, `apps/web/tests/e2e/product-surface-warp.spec.ts` · tam liste `git show --stat b6ccad8`

### TASK-20261013-ADD-009 — IIS API paketinde SQL katalog seçimi

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 11:00 · Beyza Turgut
- Not: Faz03 03.11 canlı tarafı
- Kanıt: [66ea8c4](https://github.com/beyzaturgut/XinobiYeni/commit/66ea8c48771f9714042bf8ab33bc6c2be017579a)
- Dosyalar (3): `docs/runbooks/live-sql-catalog.md`, `tests/Xinobi.Architecture.Tests/CatalogTests.cs`, `tools/package-api-iis.mjs`

### TASK-20261013-ADD-010 — Production’da korumalı SQL katalog yönetimi (panel)

- Faz: Faz04 · Durum: Commitlendi · 13.10.2026 11:09 · Beyza Turgut
- Not: Panel personel oturumu + izin ile
- Kanıt: [81543aa](https://github.com/beyzaturgut/XinobiYeni/commit/81543aa3f5ad489eed304456fe98146fcdd8c9c1)
- Dosyalar (6): `docs/runbooks/live-sql-catalog.md`, `services/api/LocalCommerce/LocalCommerceEndpoints.cs`, `services/api/LocalCommerce/LocalCommerceStore.cs`, `services/api/Program.cs`, `tests/Xinobi.Architecture.Tests/ProductionCatalogAdminTests.cs`, `tools/package-api-iis.mjs`

### TASK-20261013-ADD-011 — feature/xinobi-u-unified-ai-qa 2. birleştirme

- Faz: Entegrasyon · Durum: Commitlendi · 13.10.2026 11:37 · Beyza Turgut
- Not: Mobil çakışma çözümü: hesaba kaydet/giriş/kendi görseli + gelişmiş önizleme
- Kanıt: [57a1969](https://github.com/beyzaturgut/XinobiYeni/commit/57a1969e51ba1f83dce20f1cb03e2892f4a64d56)
- Dosyalar (106): `.gitignore`, `apps/admin/src/features/product-surfaces/CatalogMaskReview.tsx`, `apps/admin/src/features/product-surfaces/CatalogReadiness.tsx`, `apps/admin/src/features/product-surfaces/CatalogSourceSelection.tsx`, `apps/admin/src/features/product-surfaces/FamilyMaskTransfer.tsx`, `apps/admin/src/features/product-surfaces/MaskCandidateSelection.tsx` · tam liste `git show --stat 57a1969`

### TASK-20261013-ADD-012 — API’nin HTTPS site altında IIS ARR ile sunulması

- Faz: Dağıtım/Faz03 · Durum: Commitlendi · 13.10.2026 11:44 · Beyza Turgut
- Not: Tek HTTPS köken; X-Forwarded-* yalnız loopback proxy’den
- Kanıt: [c88ea3e](https://github.com/beyzaturgut/XinobiYeni/commit/c88ea3e4417b512883a0c5a3ad5d0b1d2b7d712e)
- Dosyalar (5): `docs/runbooks/https-reverse-proxy.md`, `services/api/Program.cs`, `tools/package-api-iis.mjs`, `tools/package-deploy.mjs`, `tools/package-iis-preview.mjs`

### TASK-20261013-ADD-013 — HTTPS-only admin için IIS erişim runbook bölümü

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 12:20 · Beyza Turgut
- Not: Belge
- Kanıt: [d89f01b](https://github.com/beyzaturgut/XinobiYeni/commit/d89f01b08cd17962b93e534ecec06285cf7d3501)
- Dosyalar (2): `docs/runbooks/https-reverse-proxy.md`, `tools/package-deploy.mjs`

### TASK-20261013-ADD-014 — Web vitrininin canlı SQL kataloğu okuması ve HTTPS proxy kökeni

- Faz: Faz04/Dağıtım · Durum: Commitlendi · 13.10.2026 14:06 · Beyza Turgut
- Not: DEPLOY-008 hazırlandı
- Kanıt: [d1639f6](https://github.com/beyzaturgut/XinobiYeni/commit/d1639f6c969dd183a73a6f9de6a627d9ecc5108d)
- Dosyalar (10): `apps/web/src/lib/commerce.ts`, `docs/runbooks/https-reverse-proxy.md`, `services/api/Catalog/CatalogEndpoints.cs`, `services/api/Catalog/CatalogProjection.cs`, `services/api/Program.cs`, `tests/Xinobi.Architecture.Tests/CatalogTests.cs` · tam liste `git show --stat d1639f6`

### TASK-20261013-ADD-015 — DEPLOY-008 kaydı

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 14:08 · Beyza Turgut
- Not: Belge; uzak yayın kaydı yok
- Kanıt: [5319534](https://github.com/beyzaturgut/XinobiYeni/commit/531953405c2c09d83a9af26b9537e12948dae3ba)
- Dosyalar (1): `deployments/DEPLOY-008-live-sql-storefront-prepared.md`

### TASK-20261013-ADD-016 — IIS SQL hesapları ve katalog medya onarımı

- Faz: Dağıtım/Faz03 · Durum: Commitlendi · 13.10.2026 14:30 · Beyza Turgut
- Not: docs/runbooks/iis-catalog-repair.md
- Kanıt: [c59c423](https://github.com/beyzaturgut/XinobiYeni/commit/c59c42378567479becf679c01b61e88e0567dd4b)
- Dosyalar (2): `docs/runbooks/iis-catalog-repair.md`, `tools/repair-iis-catalog.ps1`

### TASK-20261013-ADD-017 — PowerShell File.Replace için açık yedek yolu

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 14:34 · Beyza Turgut
- Not: Onarım betiği düzeltmesi
- Kanıt: [4ee33ff](https://github.com/beyzaturgut/XinobiYeni/commit/4ee33ffd4970ebf151cc48ff17ebabb0931f274a)
- Dosyalar (1): `tools/repair-iis-catalog.ps1`

### TASK-20261013-ADD-018 — Ana sayfa giydirilmiş ürün görseli ölçülerinin geri getirilmesi

- Faz: Faz02/04 · Durum: Commitlendi · 13.10.2026 14:42 · Beyza Turgut
- Not: DEPLOY-009 hazırlandı
- Kanıt: [42dc4d8](https://github.com/beyzaturgut/XinobiYeni/commit/42dc4d87c9767a65d0f26af1eb1bd39084abe33f)
- Dosyalar (1): `apps/web/src/components/personalization-feature.module.css`

### TASK-20261013-ADD-019 — DEPLOY-009 kaydı

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 14:43 · Beyza Turgut
- Not: Belge
- Kanıt: [9c37a07](https://github.com/beyzaturgut/XinobiYeni/commit/9c37a07b45c72aab5c5086e4007e81e6adab618c)
- Dosyalar (1): `deployments/DEPLOY-009-homepage-product-image-prepared.md`

### TASK-20261013-ADD-020 — API WebDAV’ın katalog yazımlarını engellemesinin onarımı

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 14:52 · Beyza Turgut
- Not: docs/runbooks/iis-webdav-repair.md
- Kanıt: [c6c889c](https://github.com/beyzaturgut/XinobiYeni/commit/c6c889c7d4b203048bf33666b210cf8398a51020)
- Dosyalar (2): `docs/runbooks/iis-webdav-repair.md`, `tools/repair-iis-webdav.ps1`

### TASK-20261013-ADD-021 — Nobi’nin aynı köken production API’ye bağlanması

- Faz: Faz10 · Durum: Commitlendi · 13.10.2026 15:32 · Beyza Turgut
- Not: DEPLOY-010 hazırlandı; canlıda Features:StorageProvider bekliyor
- Kanıt: [dfbc972](https://github.com/beyzaturgut/XinobiYeni/commit/dfbc9724fedf1268a8e84e9475069628f6088b26)
- Dosyalar (1): `apps/web/src/lib/assistant.ts`

### TASK-20261013-ADD-022 — DEPLOY-010 kaydı ve SQL ayarı

- Faz: Dağıtım · Durum: Commitlendi · 13.10.2026 15:35 · Beyza Turgut
- Not: Belge
- Kanıt: [0ff1af7](https://github.com/beyzaturgut/XinobiYeni/commit/0ff1af7004a8509cb5b27252526b2d442a78a490)
- Dosyalar (1): `deployments/DEPLOY-010-nobi-api-prepared.md`

### TASK-20261013-ADD-023 — İncelenmiş ürün yüzeylerinin canlı vitrine yayımlanması

- Faz: Faz06 · Durum: Commitlendi · 13.10.2026 15:55 · Beyza Turgut
- Not: Önizleme paketi web köküne
- Kanıt: [88d80e0](https://github.com/beyzaturgut/XinobiYeni/commit/88d80e0af7825b06d49409bafec50d4b7d7427e7)
- Dosyalar (5): `.gitignore`, `apps/web/src/app/urunler/cay-makinesi-101/editor/accepted-surface-api.ts`, `tools/package-iis-preview.mjs`, `tools/publish-product-previews.mjs`, `tools/publish-product-previews.test.mjs`

### TASK-20261013-ADD-024 — Yerel webde incelenmiş yüzey ve API görselinin çizimi

- Faz: Faz06 · Durum: Commitlendi · 13.10.2026 16:06 · Beyza Turgut
- Not: —
- Kanıt: [a7ff0e8](https://github.com/beyzaturgut/XinobiYeni/commit/a7ff0e85195fa5694721594180bed2ecd4a1c52d)
- Dosyalar (4): `apps/web/src/app/urunler/cay-makinesi-101/editor/accepted-surface-api.ts`, `apps/web/src/app/urunler/cay-makinesi-101/editor/product-pattern-preview.tsx`, `apps/web/src/app/xinobi-u/onizleme/product-preview.tsx`, `tools/dev-local.mjs`

### TASK-20261013-ADD-025 — Çalışma anı demo ürünlerinin kaldırılması (kayıtlı katalog değişmeden)

- Faz: Faz04 · Durum: Commitlendi · 13.10.2026 16:48 · Beyza Turgut
- Not: —
- Kanıt: [2bb0b6d](https://github.com/beyzaturgut/XinobiYeni/commit/2bb0b6db0863a5d113acabe990d6a0674651e272)
- Dosyalar (41): `apps/admin/src/Inventory.tsx`, `apps/admin/src/PrintOperations.tsx`, `apps/admin/src/catalog-data.ts`, `apps/admin/src/integration-model.ts`, `apps/admin/src/pricing-model.ts`, `apps/web/src/app/arama/search-compare.tsx` · tam liste `git show --stat 2bb0b6d`

### TASK-20261013-ADD-026 — XINOBI U görsel yükleme geri geldi, ürün özelleştirme akışı iyileşti

- Faz: Faz06/10 · Durum: Commitlendi · 13.10.2026 16:53 · Aslı Aydın
- Not: Branch commit; 74032cd ile alındı
- Kanıt: [fe93107](https://github.com/beyzaturgut/XinobiYeni/commit/fe93107724b259b93bcf39830717b85a3b5f9d6f)
- Dosyalar (36): `apps/mobile/android/app/src/main/kotlin/com/xinobi/xinobi_mobile/MainActivity.kt`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/api_config.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/xinobi_u/mobile_preview_screen.dart`, `apps/mobile/lib/features/xinobi_u/questionnaire_screen.dart` · tam liste `git show --stat fe93107`

### TASK-20261013-ADD-027 — feature/xinobi-u-unified-ai-qa 3. birleştirme

- Faz: Entegrasyon · Durum: Commitlendi · 13.10.2026 17:13 · Beyza Turgut
- Not: Commit mesajına göre Flutter 54 test, analyze, web tsc+lint, izole renderer ve tarayıcı smoke; tarihli rapor yoktu
- Kanıt: [74032cd](https://github.com/beyzaturgut/XinobiYeni/commit/74032cd102c7aa1e8e160684a6d0aaf05100abc6)
- Dosyalar (36): `apps/mobile/android/app/src/main/kotlin/com/xinobi/xinobi_mobile/MainActivity.kt`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/api_config.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/xinobi_u/mobile_preview_screen.dart`, `apps/mobile/lib/features/xinobi_u/questionnaire_screen.dart` · tam liste `git show --stat 74032cd`

### TASK-20261013-ADD-028 — Tasarım ekranlarından kişiselleştirilmiş ürünü sepete ekleme (web+mobil)

- Faz: Faz05/06 · Durum: Commitlendi · 13.10.2026 17:21 · Beyza Turgut
- Not: Tasarım hesaba bir kez kaydedilir
- Kanıt: [49d3f35](https://github.com/beyzaturgut/XinobiYeni/commit/49d3f350bdd647377743deb7db676b6e52f56fba)
- Dosyalar (8): `apps/mobile/lib/features/cart/cart_screen.dart`, `apps/mobile/lib/features/designs/designs.dart`, `apps/mobile/lib/features/personalization/editor_screen.dart`, `apps/mobile/lib/features/xinobi_u/questionnaire_screen.dart`, `apps/web/src/app/sepet/basket.module.css`, `apps/web/src/app/sepet/basket.tsx` · tam liste `git show --stat 49d3f35`

### TASK-20261013-ADD-029 — Sepette kişiselleştirilmiş satırın ürün üzerinde tasarımla gösterimi

- Faz: Faz05/06 · Durum: Commitlendi · 13.10.2026 17:29 · Beyza Turgut
- Not: Onaylı yüzey renderer; “Temsilidir” etiketi
- Kanıt: [265c48d](https://github.com/beyzaturgut/XinobiYeni/commit/265c48dd3c948ce726298b1971961bdec9c97c68)
- Dosyalar (5): `apps/mobile/lib/features/cart/cart_screen.dart`, `apps/mobile/lib/features/designs/designs.dart`, `apps/web/src/app/sepet/basket.tsx`, `apps/web/src/components/design-on-product.module.css`, `apps/web/src/components/design-on-product.tsx`

### TASK-20261013-ADD-030 — Xinobi sanat yönleri ve somut anket kuralları

- Faz: Faz10/02 · Durum: Commitlendi · 13.10.2026 17:29 · Beyza Turgut
- Not: docs/xinobi-u-art-direction.md
- Kanıt: [324d129](https://github.com/beyzaturgut/XinobiYeni/commit/324d129d6bba6fce57c75f2013733591dedb01a8)
- Dosyalar (6): `docs/xinobi-u-art-direction.md`, `services/api/DesignStudio/DesignArtDirection.cs`, `services/api/DesignStudio/DesignSessionStore.cs`, `services/api/DesignStudio/QuestionBank.cs`, `tests/Xinobi.Architecture.Tests/DesignArtDirectionTests.cs`, `tests/Xinobi.Architecture.Tests/DesignStudioTests.cs`

### TASK-20261013-ADD-031 — Mobilin web ile aynı yayımlanmış onaylı yüzeyleri kullanması

- Faz: Faz11/06 · Durum: Commitlendi · 13.10.2026 17:36 · Beyza Turgut
- Not: XINOBI_WEB_PREVIEW_URL README’de
- Kanıt: [b1573d0](https://github.com/beyzaturgut/XinobiYeni/commit/b1573d074d8972dec6aff30ac285d1ec2f5046d4)
- Dosyalar (9): `apps/mobile/README.md`, `apps/mobile/lib/core/api_config.dart`, `apps/mobile/lib/features/cart/cart_screen.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/designs/designs.dart`, `apps/mobile/lib/features/personalization/editor_screen.dart` · tam liste `git show --stat b1573d0`
