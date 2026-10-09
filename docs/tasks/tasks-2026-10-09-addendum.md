# 9 Ekim ek taskları — müşteri özeti ve yeni commitler

Önceki [125 tasklık dökümün](tasks-2026-10-07-09.md) eki. Kesim: `baf83e4`. Bu ek yalnız önceki kesimden sonra gelen 14 geliştirme/karar commitini ve kullanıcı tarafından bildirilen kalan işleri kapsar. Önceki listede zaten bulunan sipariş/bildirim ve Temsilidir işleri tekrar açılmadı.

**Kanıt sınırı:** commitler Git geçmişinde kontrol edildi; paylaşılan test sayıları kullanıcı bildirimi olarak [doğrulama raporuna](../../test/2026-10-09/REP-20261009-owner-validation-summary.md) alındı. Bu kayıt sırasında test, gerçek sağlayıcı çağrısı, maske onayı veya servis yeniden başlatma yapılmadı.

[CSV](tasks-2026-10-09-addendum.csv) · 54 ayrı task.

### TASK-20261009-ADD-001 — Teslim alınmış ürünler için satın alma doğrulamalı değerlendirme API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [3591c8e](https://github.com/beyzaturgut/XinobiYeni/commit/3591c8ea7dff3d3027884bf8ac2627aa7b6f54a2).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CatalogApi.md`, `packages/clients/dart/doc/MyReview.md`, `packages/clients/dart/doc/ProductDetail.md`, `packages/clients/dart/doc/ProductSpec.md`, `packages/clients/dart/doc/PublicReview.md` · Tam liste CSV’de.

### TASK-20261009-ADD-002 — Ürün teknik özellikleri API desteği

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [3591c8e](https://github.com/beyzaturgut/XinobiYeni/commit/3591c8ea7dff3d3027884bf8ac2627aa7b6f54a2).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CatalogApi.md`, `packages/clients/dart/doc/MyReview.md`, `packages/clients/dart/doc/ProductDetail.md`, `packages/clients/dart/doc/ProductSpec.md`, `packages/clients/dart/doc/PublicReview.md` · Tam liste CSV’de.

### TASK-20261009-ADD-003 — Web ürün değerlendirmelerini göster

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-004 — Web karşılaştırma bağlantısı ve ürün sayacını başlığa ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-005 — Web ürün kartlarına karşılaştırma düğmesi ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-006 — Sayfalar arasında kalıcı karşılaştırma alt çubuğunu ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-007 — Dört ürünlük karşılaştırma ekranı ve yalnız farklar filtresi

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-008 — Paylaşılabilir karşılaştırma bağlantısını ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-009 — Web ürün teknik özelliklerini göster

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2e15c6f](https://github.com/beyzaturgut/XinobiYeni/commit/2e15c6fd93c04c205b907d268147a342f6713c9c).
- İlgili dosyalar: `apps/web/src/app/arama/search-compare.tsx`, `apps/web/src/app/karsilastir/compare.module.css`, `apps/web/src/app/karsilastir/comparison.tsx`, `apps/web/src/app/karsilastir/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/urunler/catalog.module.css`, `apps/web/src/app/urunler/catalog.tsx`, `apps/web/src/app/urunler/detay/product-detail.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-010 — Admin ürün teknik özellikleri düzenleyicisi

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [c1c6b1a](https://github.com/beyzaturgut/XinobiYeni/commit/c1c6b1a9be078529a8b1c1b9c62c18edd492d04b).
- İlgili dosyalar: `apps/admin/src/App.tsx`, `apps/admin/src/Catalog.tsx`, `apps/admin/src/Reviews.tsx`, `apps/admin/src/catalog-data.ts`, `apps/admin/src/panel.css`

### TASK-20261009-ADD-011 — Admin değerlendirme onay ve moderasyon ekranı

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [c1c6b1a](https://github.com/beyzaturgut/XinobiYeni/commit/c1c6b1a9be078529a8b1c1b9c62c18edd492d04b).
- İlgili dosyalar: `apps/admin/src/App.tsx`, `apps/admin/src/Catalog.tsx`, `apps/admin/src/Reviews.tsx`, `apps/admin/src/catalog-data.ts`, `apps/admin/src/panel.css`

### TASK-20261009-ADD-012 — Mobil ürün karşılaştırmasını ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [1bbfffb](https://github.com/beyzaturgut/XinobiYeni/commit/1bbfffb8f03a440b1ebbc6c14864ae9ea266a609).
- İlgili dosyalar: `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/catalog/product_detail_screen.dart`, `apps/mobile/lib/features/catalog/product_reviews.dart`, `apps/mobile/lib/features/compare/compare.dart`, `apps/mobile/lib/features/compare/compare_button.dart`, `apps/mobile/lib/features/compare/compare_screen.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-013 — Mobil ürün teknik özelliklerini göster

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [1bbfffb](https://github.com/beyzaturgut/XinobiYeni/commit/1bbfffb8f03a440b1ebbc6c14864ae9ea266a609).
- İlgili dosyalar: `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/catalog/product_detail_screen.dart`, `apps/mobile/lib/features/catalog/product_reviews.dart`, `apps/mobile/lib/features/compare/compare.dart`, `apps/mobile/lib/features/compare/compare_button.dart`, `apps/mobile/lib/features/compare/compare_screen.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-014 — Mobil ürün değerlendirmelerini göster

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [1bbfffb](https://github.com/beyzaturgut/XinobiYeni/commit/1bbfffb8f03a440b1ebbc6c14864ae9ea266a609).
- İlgili dosyalar: `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/catalog/catalog_repository.dart`, `apps/mobile/lib/features/catalog/product_detail_screen.dart`, `apps/mobile/lib/features/catalog/product_reviews.dart`, `apps/mobile/lib/features/compare/compare.dart`, `apps/mobile/lib/features/compare/compare_button.dart`, `apps/mobile/lib/features/compare/compare_screen.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-015 — AI ve yüklenen tasarımları hesapta saklama API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2703379](https://github.com/beyzaturgut/XinobiYeni/commit/270337938933c4a173a4d453f3d46598770d104d).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/MyDesign.md`, `packages/clients/dart/doc/RenameDesign.md`, `packages/clients/dart/doc/SaveDesignFromSession.md`, `packages/clients/dart/lib/src/api/account_api.dart`, `packages/clients/dart/lib/src/model/my_design.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-016 — Kayıtlı tasarımları yeniden adlandırma ve silme API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [2703379](https://github.com/beyzaturgut/XinobiYeni/commit/270337938933c4a173a4d453f3d46598770d104d).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/MyDesign.md`, `packages/clients/dart/doc/RenameDesign.md`, `packages/clients/dart/doc/SaveDesignFromSession.md`, `packages/clients/dart/lib/src/api/account_api.dart`, `packages/clients/dart/lib/src/model/my_design.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-017 — Web Tasarımlarım ekranı ve hesaba tasarım kaydetme

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [350f394](https://github.com/beyzaturgut/XinobiYeni/commit/350f394c168aa3e7b72d88a03cf6cec21ac13d1f).
- İlgili dosyalar: `apps/web/src/app/hesap/account-dashboard.tsx`, `apps/web/src/app/hesap/tasarimlarim/designs.module.css`, `apps/web/src/app/hesap/tasarimlarim/my-designs.tsx`, `apps/web/src/app/hesap/tasarimlarim/onizleme/page.tsx`, `apps/web/src/app/hesap/tasarimlarim/onizleme/saved-design-preview.tsx`, `apps/web/src/app/hesap/tasarimlarim/page.tsx`, `apps/web/src/app/xinobi-u/kendi-gorselin/own-image-entry.tsx`, `apps/web/src/app/xinobi-u/onizleme/product-preview.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-018 — Kayıtlı tasarımı ürün üzerinde yeniden gösterme

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [350f394](https://github.com/beyzaturgut/XinobiYeni/commit/350f394c168aa3e7b72d88a03cf6cec21ac13d1f).
- İlgili dosyalar: `apps/web/src/app/hesap/account-dashboard.tsx`, `apps/web/src/app/hesap/tasarimlarim/designs.module.css`, `apps/web/src/app/hesap/tasarimlarim/my-designs.tsx`, `apps/web/src/app/hesap/tasarimlarim/onizleme/page.tsx`, `apps/web/src/app/hesap/tasarimlarim/onizleme/saved-design-preview.tsx`, `apps/web/src/app/hesap/tasarimlarim/page.tsx`, `apps/web/src/app/xinobi-u/kendi-gorselin/own-image-entry.tsx`, `apps/web/src/app/xinobi-u/onizleme/product-preview.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-019 — Kurumsal teklif talebi oluşturma API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [7c60103](https://github.com/beyzaturgut/XinobiYeni/commit/7c60103983724ba12adec04071aa6cbd79f76412).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CreateQuote.md`, `packages/clients/dart/doc/Quote.md`, `packages/clients/dart/doc/QuoteDecision.md`, `packages/clients/dart/doc/QuoteEvent.md`, `packages/clients/dart/doc/QuoteItem.md` · Tam liste CSV’de.

### TASK-20261009-ADD-020 — Kod ve e-postayla teklif takibi API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [7c60103](https://github.com/beyzaturgut/XinobiYeni/commit/7c60103983724ba12adec04071aa6cbd79f76412).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CreateQuote.md`, `packages/clients/dart/doc/Quote.md`, `packages/clients/dart/doc/QuoteDecision.md`, `packages/clients/dart/doc/QuoteEvent.md`, `packages/clients/dart/doc/QuoteItem.md` · Tam liste CSV’de.

### TASK-20261009-ADD-021 — Teklif mesajlaşma API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [7c60103](https://github.com/beyzaturgut/XinobiYeni/commit/7c60103983724ba12adec04071aa6cbd79f76412).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CreateQuote.md`, `packages/clients/dart/doc/Quote.md`, `packages/clients/dart/doc/QuoteDecision.md`, `packages/clients/dart/doc/QuoteEvent.md`, `packages/clients/dart/doc/QuoteItem.md` · Tam liste CSV’de.

### TASK-20261009-ADD-022 — Teklif sunma, kabul ve ret API’si

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [7c60103](https://github.com/beyzaturgut/XinobiYeni/commit/7c60103983724ba12adec04071aa6cbd79f76412).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AccountApi.md`, `packages/clients/dart/doc/CreateQuote.md`, `packages/clients/dart/doc/Quote.md`, `packages/clients/dart/doc/QuoteDecision.md`, `packages/clients/dart/doc/QuoteEvent.md`, `packages/clients/dart/doc/QuoteItem.md` · Tam liste CSV’de.

### TASK-20261009-ADD-023 — Web kurumsal teklif formu

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [0d16e2a](https://github.com/beyzaturgut/XinobiYeni/commit/0d16e2a140d0ad3aabeb3b7e75206ef99865571c).
- İlgili dosyalar: `apps/admin/src/quote-model.ts`, `apps/web/src/app/kurumsal/teklif/quote-form.tsx`, `apps/web/src/app/kurumsal/teklif/quote.module.css`, `apps/web/src/app/kurumsal/teklif/takip/page.tsx`, `apps/web/src/app/kurumsal/teklif/takip/quote-tracking.tsx`, `apps/web/src/app/kurumsal/teklif/takip/tracking.module.css`, `apps/web/src/lib/quotes.ts`, `tools/test-admin-quotes.mjs` · Tam liste CSV’de.

### TASK-20261009-ADD-024 — Web kod/e-posta ile teklif takibi ve mesajlaşma

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [0d16e2a](https://github.com/beyzaturgut/XinobiYeni/commit/0d16e2a140d0ad3aabeb3b7e75206ef99865571c).
- İlgili dosyalar: `apps/admin/src/quote-model.ts`, `apps/web/src/app/kurumsal/teklif/quote-form.tsx`, `apps/web/src/app/kurumsal/teklif/quote.module.css`, `apps/web/src/app/kurumsal/teklif/takip/page.tsx`, `apps/web/src/app/kurumsal/teklif/takip/quote-tracking.tsx`, `apps/web/src/app/kurumsal/teklif/takip/tracking.module.css`, `apps/web/src/lib/quotes.ts`, `tools/test-admin-quotes.mjs` · Tam liste CSV’de.

### TASK-20261009-ADD-025 — Web teklif kabul ve ret akışı

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [0d16e2a](https://github.com/beyzaturgut/XinobiYeni/commit/0d16e2a140d0ad3aabeb3b7e75206ef99865571c).
- İlgili dosyalar: `apps/admin/src/quote-model.ts`, `apps/web/src/app/kurumsal/teklif/quote-form.tsx`, `apps/web/src/app/kurumsal/teklif/quote.module.css`, `apps/web/src/app/kurumsal/teklif/takip/page.tsx`, `apps/web/src/app/kurumsal/teklif/takip/quote-tracking.tsx`, `apps/web/src/app/kurumsal/teklif/takip/tracking.module.css`, `apps/web/src/lib/quotes.ts`, `tools/test-admin-quotes.mjs` · Tam liste CSV’de.

### TASK-20261009-ADD-026 — Admin kurumsal teklif operasyon masası

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [d69241a](https://github.com/beyzaturgut/XinobiYeni/commit/d69241adef6e88c80f5115642591fc8591f40232).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/App.tsx`, `apps/admin/src/Quotes.tsx`, `apps/admin/src/panel.css`

### TASK-20261009-ADD-027 — Nobi yanıtlarını sunucu katalog fiyatı ve stokuna dayandır

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [d800931](https://github.com/beyzaturgut/XinobiYeni/commit/d800931034cad9cb200ac306d32f332e4832be2b).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AssistantAction.md`, `packages/clients/dart/doc/AssistantApi.md`, `packages/clients/dart/doc/AssistantConfig.md`, `packages/clients/dart/doc/AssistantConversationView.md`, `packages/clients/dart/doc/AssistantHandoff.md`, `packages/clients/dart/doc/AssistantHandoffRequest.md` · Tam liste CSV’de.

### TASK-20261009-ADD-028 — Cloudflare metin modeli ve kural tabanlı geri dönüşü ekle

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [d800931](https://github.com/beyzaturgut/XinobiYeni/commit/d800931034cad9cb200ac306d32f332e4832be2b).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AssistantAction.md`, `packages/clients/dart/doc/AssistantApi.md`, `packages/clients/dart/doc/AssistantConfig.md`, `packages/clients/dart/doc/AssistantConversationView.md`, `packages/clients/dart/doc/AssistantHandoff.md`, `packages/clients/dart/doc/AssistantHandoffRequest.md` · Tam liste CSV’de.

### TASK-20261009-ADD-029 — Nobi karşılaştırma, teklif ve XINOBI U yönlendirmeleri

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [d800931](https://github.com/beyzaturgut/XinobiYeni/commit/d800931034cad9cb200ac306d32f332e4832be2b).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AssistantAction.md`, `packages/clients/dart/doc/AssistantApi.md`, `packages/clients/dart/doc/AssistantConfig.md`, `packages/clients/dart/doc/AssistantConversationView.md`, `packages/clients/dart/doc/AssistantHandoff.md`, `packages/clients/dart/doc/AssistantHandoffRequest.md` · Tam liste CSV’de.

### TASK-20261009-ADD-030 — Nobi WhatsApp devri ve onaylı iletişim talebi akışı

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [d800931](https://github.com/beyzaturgut/XinobiYeni/commit/d800931034cad9cb200ac306d32f332e4832be2b).
- İlgili dosyalar: `packages/clients/dart/.openapi-generator/FILES`, `packages/clients/dart/README.md`, `packages/clients/dart/doc/AssistantAction.md`, `packages/clients/dart/doc/AssistantApi.md`, `packages/clients/dart/doc/AssistantConfig.md`, `packages/clients/dart/doc/AssistantConversationView.md`, `packages/clients/dart/doc/AssistantHandoff.md`, `packages/clients/dart/doc/AssistantHandoffRequest.md` · Tam liste CSV’de.

### TASK-20261009-ADD-031 — Nobi metin modeli kullanımını ADR-002 Ek C’ye kaydet

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [1bfc60e](https://github.com/beyzaturgut/XinobiYeni/commit/1bfc60ee9bec66c15e57224524210b9cc8903390).
- İlgili dosyalar: `apps/web/src/app/asistan/sales-assistant.tsx`, `docs/decisions/ADR-002-cloudflare-workers-ai.md`, `services/api/Assistant/AssistantEngine.cs`

### TASK-20261009-ADD-032 — Nobi’yi tüm web sayfalarında açılabilir hale getir

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [b38b24c](https://github.com/beyzaturgut/XinobiYeni/commit/b38b24c77ec59a3dfc1a97deed119748e7917b0d).
- İlgili dosyalar: `apps/web/src/app/asistan/assistant.module.css`, `apps/web/src/app/asistan/page.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.module.css`, `apps/web/src/app/page.tsx`, `apps/web/src/components/nobi/nobi-chat.tsx`, `apps/web/src/components/nobi/nobi-launcher.tsx`, `apps/web/src/components/nobi/nobi-mark.tsx` · Tam liste CSV’de.

### TASK-20261009-ADD-033 — Admin sürümlü AI politika yönetimini gerçek veriye bağla

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [ed8cc70](https://github.com/beyzaturgut/XinobiYeni/commit/ed8cc700cf083e45f9c3ee9b13895d2ba3b139d6).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/AiAdmin.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/ai-admin-model.ts`, `tools/test-admin-ai.mjs`, `tools/test-ai-admin-model.mjs`

### TASK-20261009-ADD-034 — Admin bilgi kaynakları onay akışını gerçek veriye bağla

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [ed8cc70](https://github.com/beyzaturgut/XinobiYeni/commit/ed8cc700cf083e45f9c3ee9b13895d2ba3b139d6).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/AiAdmin.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/ai-admin-model.ts`, `tools/test-admin-ai.mjs`, `tools/test-ai-admin-model.mjs`

### TASK-20261009-ADD-035 — Admin maskelenmiş Nobi konuşma ekranı

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [ed8cc70](https://github.com/beyzaturgut/XinobiYeni/commit/ed8cc700cf083e45f9c3ee9b13895d2ba3b139d6).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/AiAdmin.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/ai-admin-model.ts`, `tools/test-admin-ai.mjs`, `tools/test-ai-admin-model.mjs`

### TASK-20261009-ADD-036 — Admin iletişim taleplerini yönetme ekranı

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [ed8cc70](https://github.com/beyzaturgut/XinobiYeni/commit/ed8cc700cf083e45f9c3ee9b13895d2ba3b139d6).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/AiAdmin.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/ai-admin-model.ts`, `tools/test-admin-ai.mjs`, `tools/test-ai-admin-model.mjs`

### TASK-20261009-ADD-037 — Admin tahmini AI maliyet raporu

- Durum: Commitlendi
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [ed8cc70](https://github.com/beyzaturgut/XinobiYeni/commit/ed8cc700cf083e45f9c3ee9b13895d2ba3b139d6).
- İlgili dosyalar: `apps/admin/README.md`, `apps/admin/src/AiAdmin.tsx`, `apps/admin/src/App.tsx`, `apps/admin/src/ai-admin-model.ts`, `tools/test-admin-ai.mjs`, `tools/test-ai-admin-model.mjs`

### TASK-20261009-ADD-038 — Mobil Nobi düğmesi ve asistan akışı

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-039 — Mobil kurumsal teklif formu, takip ve Tekliflerim

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-040 — Mobil Tasarımlarım kaydetme, yeniden adlandırma ve silme

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-041 — Mobil editörde onaylı yüzey kaplaması

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-042 — Mobil editörde görsel büyütme, döndürme ve sürükleme

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-043 — Mobil editör tasarımını hesaba kaydetme

- Durum: Kod commitlendi; mobil emülatör doğrulaması bekliyor
- Kapsam/engel: Kullanıcı özeti ve commit kanıtı; bu kayıtta testler yeniden çalıştırılmadı.
- Kanıt: [baf83e4](https://github.com/beyzaturgut/XinobiYeni/commit/baf83e4811316ada7fa74bb3efd459ed42784307).
- İlgili dosyalar: `apps/mobile/android/app/src/main/AndroidManifest.xml`, `apps/mobile/ios/Runner/Info.plist`, `apps/mobile/lib/app/router.dart`, `apps/mobile/lib/core/ids.dart`, `apps/mobile/lib/features/account/account_screen.dart`, `apps/mobile/lib/features/account/auth.dart`, `apps/mobile/lib/features/assistant/nobi.dart`, `apps/mobile/lib/features/designs/designs.dart` · Tam liste CSV’de.

### TASK-20261009-ADD-044 — Son mobil Nobi/teklif/Tasarımlarım/editör sürümünü emülatörde doğrula

- Durum: Doğrulandı — yalıtılmış cihaz testleri
- Kapsam/engel: 5/5 Android emülatör testi; Nobi, teklif ekranları, tasarım adlandırma/silme ve editör kontrolleri geçti. Tüm teklif kabul/mesajlaşma akışı kapsam dışı.
- Kanıt: [TST-107](../../test/2026-10-09/TST-107-pending-work-validation.md).

### TASK-20261009-ADD-045 — Mobil push için Firebase projesi ve uygulama dosyalarını bağla

- Durum: Harici erişim bekliyor
- Kapsam/engel: Sunucu desteği mevcut; Firebase proje/APNs/hizmet hesabı erişimi gerekli. Mobil SDK, bildirim izni ve token kaydı da henüz eklenmedi. Gerçek push doğrulanmadı.

### TASK-20261009-ADD-046 — Netgsm SMS adaptörünü gerçek test hesabıyla doğrula

- Durum: Doğrulama bekliyor
- Kapsam/engel: Önizleme modu aktif; gerçek hesapla deneme yapılmadı.

### TASK-20261009-ADD-047 — İade süresi ve iptal/iade kurallarını kesinleştir

- Durum: Karar bekliyor — D03
- Kapsam/engel: 14 gün geçici uygulama değeri; nihai ürün/hukuk kararı verilmiş sayılmaz.

### TASK-20261009-ADD-048 — Kabul edilmiş teklifin siparişe dönüşümünü kararlaştır

- Durum: Karar bekliyor — D07
- Kapsam/engel: Kabul siparişe dönüşümün tamamlandığı anlamına gelmez.

### TASK-20261009-ADD-049 — Nobi WhatsApp numarasını panelden yapılandır

- Durum: Yapılandırma bekliyor
- Kapsam/engel: Numara boş; gerçek iletişim adresi sağlanmalı.

### TASK-20261009-ADD-050 — Nobi konuşma saklama süresini ve aydınlatma metnini kesinleştir

- Durum: Karar bekliyor — D10
- Kapsam/engel: 90 gün geçici değer; nihai saklama/aydınlatma kararı yok.

### TASK-20261009-ADD-051 — Yerel ürün varyantları için yüzey maskelerini onayla

- Durum: Veri onayı bekliyor
- Kapsam/engel: Onaylı maske yokken ürün üzerinde önizleme kullanılamıyor; otomatik onay verilmedi.

### TASK-20261009-ADD-052 — Temsilidir generated web e2e vakasının maske önkoşulunu düzelt

- Durum: Tamamlandı
- Kapsam/engel: Test kataloğu ve tam varyant izole edildi; doğru tasarım API ayarıyla web build ve 3/3 Playwright başarılı. Gerçek ürün maskeleri onaylanmadı.
- Kanıt: [TST-107](../../test/2026-10-09/TST-107-pending-work-validation.md).

### TASK-20261009-ADD-053 — DevelopmentAcceptedSurfaceTests aralıklı hatasını araştır

- Durum: Araştırıldı — yeniden üretilemedi
- Kapsam/engel: Tam .NET 306/306, iki odaklı koşu 18/18 geçti. İlk hatanın logu/test adı eksik; kök neden çözülmüş sayılmaz.
- Kanıt: [TST-107](../../test/2026-10-09/TST-107-pending-work-validation.md).

### TASK-20261009-ADD-054 — Emülatör uygulamasını yalıtılmış API’den normal API’ye geri bağla

- Durum: Tamamlandı
- Kapsam/engel: Normal APK 10.0.2.2:5003 ile derlendi ve emülatöre yüklendi; API sağlık kontrolü başarılı.
- Kanıt: [TST-107](../../test/2026-10-09/TST-107-pending-work-validation.md).

## Bekleyen işlerin güncel doğrulaması — 09.10.2026

Bu dökümün ilk kayıt anından sonra kontroller gerçekten çalıştırıldı. [TST-107](../../test/2026-10-09/TST-107-pending-work-validation.md) sonuçları esas alınır; önceki kullanıcı bildirimi tarihsel olarak korunur.
