# TST-133 — Admin maskelemede yalnız PNG

20.10.2026 · Faz06 · Sahip kararı: çalışan PNG maske akışı dışındaki sistemler kaldırılsın (admin + API; web dokunulmadı).

## Kaldırılan

- Admin: eğrili çizim, fırça, Roboflow tarifi/noktaları, elle gösterilen bölge, renk başına hizalama; "Mevcut katalog incelemesi" ekranı ve bileşenleri (aday/revizyon, düzeltme noktaları, yerel maske düzeltme, katalog kaynak seçimi, hazırlık tablosu, aile aktarımı). İlgili admin Playwright spec'leri, `playwright.config.ts`, eski Vite proxy'leri ve araç betikleri (`test-admin-candidate-click`, `test-catalog-surface-flow`, `test-mask-selection-admin`, `test-catalog-readiness-reasons`).
- API (`/api/v1/local-commerce/surfaces`): `segment`, `strokes`, `curves` uçları; Roboflow kotası/anahtarı, eğri belgeleri ve hizalama kayıtları; `ManualGuidePoints`, `GuidedMaskBounds`, eğri/hizalama üretimi; `roboflow` HttpClient kaydı.

## Kalan akış

Ürün rengi seç → kaynak fotoğrafı indir → maske istemini kopyala → PNG maskeyi (şeffaf veya siyah-beyaz) taslağa yükle → örnek desen ve önizleme rengiyle kontrol → "Taslağı onayla" ya da aynı boyuttaki renklerde "Seçilen renklerde onayla". Web `commerce-mask/.../rendering-inputs` köprüsü aynen sürer.

## Bilerek bırakılan

Ayrı ayarlarla açılan eski geliştirme/QA sistemleri (Tea Maker inceleme API'si, CM 101 aday komutu/uçları, `tools/local-mask-editor`) ve web'in CM 101/CM 121 önizleme yolları kodda duruyor; varsayılan olarak kapalılar ve admin artık onları çağırmıyor.

## Kontroller

- Admin `tsc -b` hatasız; lint'te yeni uyarı yok.
- API derlemesi 0 uyarı / 0 hata.
- `ProductSurfaceWorkspaceTests` PNG akışına göre yeniden yazıldı (onay → katalog, ortak onay + anonim rendering-inputs, red/çakışma, PNG modları, kaldırılan uçlar 404).
- Tam .NET: 424 başarılı / 23 atlandı / 1 başarısız — `AuthorizationTests.OnlyListedAreasArePublic` (TST-130'dan beri bilinen, bu değişiklikten bağımsız).
- `node tools/test-guided-surface-admin.mjs` varsayılan, `--expired-session`, `--expired-session --failed-refresh`, `--mask-prompt`: başarılı. Eski araçların görünmediği doğrulanır.
