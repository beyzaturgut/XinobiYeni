# WebP ürün yüzey maskesi

Ürün yüzeyleri ekranı yalnız açıkça XINOBI U işaretlenmiş ürünleri listeler.

1. Bir ürün rengi seç, kaynak fotoğrafı indir ve maskeleme promptuyla birlikte kullan.
2. Maske dosyasını **kayıpsız WebP**, tek kareli ve kaynak fotoğrafla tam aynı piksel boyutunda hazırla. Desen alanı opak beyaz, korunacak alan şeffaf olmalı.
3. **WebP maske yükle** alanından en fazla 8 MB dosya seç. Şeffaf maskede **Şeffaf WebP**, opak siyah-beyaz maskede **Siyah-beyaz** seçeneğini kullan.
4. Taslağı, örnek deseni ve diğer renkleri kontrol et; onayla. **Taslak WebP maskeyi aç / indir** gerçek kayıpsız WebP verir.

API gerçek WebP formatını kontrol eder; PNG/JPEG, bozuk dosya, animasyon, yanlış boyut ve tamamen boş/dolu maskeler reddedilir. Dosya uzantısını değiştirmek dönüştürme değildir.

İstek sözleşmesi: `POST /api/v1/local-commerce/surfaces/{productId}/{variantId}/mask`, alanlar: `image`, `sourceSha256`, `webpBase64`, `mode` (`alpha` / `luminance`). Taslak indirme: `GET .../draft.webp`, `image/webp`.

Sunucu mevcut renderer sözleşmesiyle uyum için kabul edilen maskeyi dahili RGBA PNG'ye normalleştirir. Mevcut onaylı maskeler ve taslaklar korunur; eski `draft.png` okuma adresi uyumluluk için kalır. Yeni yüklemelerde PNG kabul edilmez. WebP indirmesinde piksel boyutu ve alfa korunur.
