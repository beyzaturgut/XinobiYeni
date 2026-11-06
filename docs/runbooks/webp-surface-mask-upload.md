# WebP ürün yüzey maskesi

> **06.11.2026:** Admin artık ürün başına kaydedilen tek kaynak fotoğrafla çalışır. Güncel adımlar ve yeni ürün bazlı API: [tek kaynak maskeleme](single-source-masking.md). Aşağıdaki renk/varyant ve toplu onay açıklamaları eski akışın tarihsel/uyumluluk kaydıdır; yeni ekranın kullanım talimatı değildir.

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

## Kayıtlı yerleşim ve sipariş doğrulaması (23.10.2026)

Yeni web yerleşimleri sunucuda konfigürasyon/revizyon olarak saklanır. API ürün/varyant ilişkisini, yerleşim sınırlarını ve güncel yüzey sürümünü hem kayıtta hem checkout'ta denetler. Kaynak fotoğraf değişirse eski yerleşim yeni maskeye sessizce uygulanmaz; kullanıcı güncel yüzeyde yeniden yerleştirir.

Onaylı katalog maskesi kullanılıyorsa mevcut workspace kaynak ve maske dosyalarını doğrular. Yalnız paketlenmiş önizlemeyle çalışılacaksa `ProductSurfaces:PublishedRoot`, API'nin okuyabildiği `assets/product-previews` kök dizinini göstermelidir. Bu dizinde ürün/varyant `inputs.json` dosyası ve referans verdiği sürümlü source/mask/branding dosyaları birlikte bulunmalıdır. Kaynak fotoğraf yolu güncel katalogla eşleşmeli; dosyaların SHA-256 değerleri ve maskenin yüzey sürümü tutarlı olmalıdır. Eksik/bozuk dosya 409 ile kaydı engeller. Bu ayar deploy veya hosting düzenini kendiliğinden değiştirmez.

Sunucuda özellik belgeleri için mevcut `Features:StorageProvider=SqlServer` gerekir. Konfigürasyon `designs` özellik belgesini, sipariş snapshot'ı mevcut sipariş satırı JSON sütununu kullanır; bu geliştirme için yeni fiziksel SQL migration yoktur. Canlı SQL kalıcılığı ayrıca izole test veritabanıyla doğrulanmalıdır.

Admin'deki ham tasarım indirmesi mevcut personel/sipariş yetkilerini kullanır; `?download=true` yalnız Content-Disposition ekler. Yerleşim değerleri piksel/katsayı/derece olarak gösterilir. Birleşik mockup saklanmadığı için geçmiş siparişin güncel yüzey üzerinde birebir yeniden çizileceği veya fiziksel baskıya hazır olduğu iddia edilmez.
