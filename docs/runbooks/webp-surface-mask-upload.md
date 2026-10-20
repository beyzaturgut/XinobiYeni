# WebP ürün yüzey maskesi

Ürün yüzeyleri ekranı yalnız açıkça XINOBI U işaretlenmiş ürünleri listeler.

1. Bir ürün rengi seç, kaynak fotoğrafı indir ve maskeleme promptuyla birlikte kullan.
2. Maske dosyasını **kayıpsız WebP**, tek kareli ve kaynak fotoğrafla tam aynı piksel boyutunda hazırla. Desen alanı opak beyaz, korunacak alan şeffaf olmalı.
3. **WebP maske yükle** alanından en fazla 8 MB dosya seç. Şeffaf maskede **Şeffaf WebP**, opak siyah-beyaz maskede **Siyah-beyaz** seçeneğini kullan.
4. Taslağı, örnek deseni ve diğer renkleri kontrol et; onayla. **Taslak WebP maskeyi aç / indir** gerçek kayıpsız WebP verir.

API gerçek WebP formatını kontrol eder; PNG/JPEG, bozuk dosya, animasyon, yanlış boyut ve tamamen boş/dolu maskeler reddedilir. Dosya uzantısını değiştirmek dönüştürme değildir.

İstek sözleşmesi: `POST /api/v1/local-commerce/surfaces/{productId}/{variantId}/mask`, alanlar: `image`, `sourceSha256`, `webpBase64`, `mode` (`alpha` / `luminance`). Taslak indirme: `GET .../draft.webp`, `image/webp`.

Sunucu mevcut renderer sözleşmesiyle uyum için kabul edilen maskeyi dahili RGBA PNG'ye normalleştirir. Mevcut onaylı maskeler ve taslaklar korunur; eski `draft.png` okuma adresi uyumluluk için kalır. Yeni yüklemelerde PNG kabul edilmez. WebP indirmesinde piksel boyutu ve alfa korunur.

## Canlı ortam (20.10.2026)

- API, `AdminCatalog:Enabled=true` (SQL katalog + SQL hesaplar) iken `/api/v1/local-commerce/surfaces` uçlarını üretimde de açar; kapatmak için `ProductSurfaces:CatalogWorkspace:Enabled=false`. Kurallar admin katalog grubuyla aynı: personel + `catalog.*` yetkisi, aynı köken, `AdminCatalog:RequireHttps` (IP test sunucusunda `false`). Yerel loopback kuralı yalnız Development’ta.
- Vitrin `GET /api/v1/dev/product-surfaces/commerce-mask/{product}/{variant}/rendering-inputs` ile onaylı maskeyi anonim, salt okunur alır (yalnız aktif ürün ve onaylı maske). Web canlıda önce bunu, yoksa paketlenmiş önizlemeyi kullanır.
- Taslaklar ve `workspace.json`, API’nin `LocalCommerce:DataDirectory` klasöründe (varsayılan `App_Data/local-commerce/product-surfaces`) tutulur; API klasörü silinerek güncellenirse **onaysız taslaklar** kaybolur. Onaylı maskeler medya deposunda ve SQL katalogdadır, etkilenmez.
- Yerelde onaylanan maskelerin dosyaları yerel medya deposundadır; canlı medya deposuna taşınmaz. Canlıda maskeyi canlı admin panelden yeniden yükleyip onaylayın.
