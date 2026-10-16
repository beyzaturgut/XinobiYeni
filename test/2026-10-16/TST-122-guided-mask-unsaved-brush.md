# TST-122 — Kaydedilmemiş boyamadan doğrudan Roboflow işlemi

16.10.2026 · Faz06 · kaynak `98a2c75` sonrası.

Sorun: Roboflow düğmesi kaydedilmemiş fırça çizgileri varsa pasifti; ayrı “Düzeltmeleri uygula” adımı gerekiyordu. Kullanıcı bunu gri/pasif düğme olarak bildirdi.

Düzeltme: Düğme bekleyen çizimle açılır. Açık kullanıcı işlemi önce çizimi kaydeder, dönen taslak sürümüyle segment isteğini gönderir. Kaydetme başarısızsa inference gönderilmez. Sağlayıcı başarısızsa kaydedilen kılavuz tutulur; yeniden deneme fırça çizgilerini tekrar uygulamaz. Anahtar eksikliği, boş çizim ve aktif çizim için pasiflik nedeni görünür.

Kontroller:

- `pnpm --filter admin build`: başarılı.
- `pnpm --filter admin lint`: çıkış 0; mevcut uyarılar, hata yok.
- `node tools/test-guided-surface-admin.mjs`: başarılı; ayrı kaydet düğmesine basmadan boyamadan Roboflow'a, renk/desen önizlemesine ve ortak onaya ilerleniyor.
- `node tools/test-guided-surface-admin.mjs --provider-failure`: başarılı; ilk sahte sağlayıcı hatası sonrası ikinci açık deneme, çizim kaydı yalnız bir kez.
- `git diff --check`: başarılı.

Tüm API ve sağlayıcı çağrıları tarayıcı testinde sahte. Bu düzeltme sırasında gerçek Roboflow çağrısı veya kullanıcı taslağına yazım yapılmadı. Yerel Vite kaynak değişikliğini yükler; kullanıcının kaydedilmemiş boyamasını korumak için sayfayı yenilemeden tekrar denemesi önerilir.
