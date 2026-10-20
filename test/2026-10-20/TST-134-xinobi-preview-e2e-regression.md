# TST-134 — XINOBI önizleme e2e “gerilemesi”: kök neden ve düzeltme

20.10.2026 · Faz06/10 · `feature/surface-masking-preview-20261020`

## Bulgu

11 XINOBI önizleme testi (`xinobi-preview-ui`, `xinobi-preview-composition`, `xinobi-result`) varsayılan e2e ortamında hiç geçmemişti. Testler 14.10 öğleden sonra `feature/xinobi-u-unified-ai-qa`’dan geldi (`62f971a`, `f22a7ae`); TST-120’nin 119/0 sonucu (12:23) bu testlerden önceydi. Kod gerilemesi değil, ortam/veri ve bir yayın hatası:

1. Test kataloğu (`tests/fixtures/demo-commerce.json`) CM121’i içermiyordu; testler CM121’e bağlıydı (QA ortamında gerçek katalog vardı).
2. `serve-export.mjs` yayımlanmış paketin güncellik kontrolü için gereken `GET /api/v1/catalog/products/{id}` isteğini iletmiyordu.
3. e2e derlemesindeki geliştirme köprüsü CM121 için `previewAvailable:false` dönünce kod yayımlanmış pakete hiç bakmıyordu (yalnız 404’te bakıyordu).
4. **Gerçek hata:** `tools/publish-product-previews.mjs`, maskesi küçültülmüş çalışma kopyasında onaylanan CM121 varyantları için 7711×11561 orijinali yayımlıyordu; paket ve maske 2309×3463 olduğundan renderer “Unexpected asset dimensions” ile reddediyordu. Canlı paketlerde CM121 önizlemesini de bozar.
5. İki test yalnız QA’daki `catalog-surfaces` adreslerini dinliyordu.

## Düzeltme

- `publish-product-previews.mjs`: `acceptance.workingCopy` ise kaynak, `catalog-registry.cjs` ile aynı türetmeyle (fill resize, WebP q92) üretilip yayımlanır; orijinal boyutu doğrulanır, URL/sha çalışma kopyasınındır.
- `accepted-surface-api.ts`: köprü “önizleme yok” derse yayımlanmış inceleme paketine düşülür.
- `playwright.config.ts`: test API seed’i = demo katalog + `fixtures/product-surfaces/xinobi-u-accepted/catalog-state.fragment.json`.
- `run-e2e.mjs`: derlemeden sonra paketler bu fragment’ten `out/` içine yayımlanır (geliştiricinin yerel `public/` paketleri kullanılmaz).
- `serve-export.mjs`: salt okunur `GET /api/v1/catalog/products/{id}` iletimi.
- `xinobi-preview-composition.spec.ts`: canlıdaki gibi yayımlanmış paket (`/assets/product-previews/.../inputs.json`) doğrulanır.

## Sonuç

- Önizleme specleri + `local-pattern-optimization`: **24 geçti / 2 başarısız**; 11 önizleme testinin hepsi geçiyor.
- Tam web e2e (kompozisyon düzeltmesinden önce): 145 geçti / 5 başarısız / 1 atlandı; kompozisyonun 2 testi sonradan düzeltildi.
- `node tools/publish-product-previews.test.mjs`: 0 başarısız.

## Önizlemeyle ilgisiz, açık kalan

- `critical-interactions` “katalog favorisi tarayıcı listesine taşınır”: favoriler `754db13` ile hesaba bağlandı, sayfa giriş istiyor; test eski davranışı bekliyor.
- `local-pattern-optimization` “EXIF clockwise JPEG” ve “unchanged EXIF JPEG”: `prepareLocalPattern` “Görsel bu cihazda hazırlanamadı” veriyor; bu oturumda dokunulmayan kod, kök neden incelenmedi.
