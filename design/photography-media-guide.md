# Xinobi fotoğraf ve medya rehberi

## Ürün fotoğrafı

- Orijinal yüksek çözünürlüklü dosya korunur; web/mobile türevleri ayrı üretilir.
- Tercih edilen açı: ürün formunu ve kontrol yüzeyini birlikte gösteren 3/4 ön açı.
- Metal, cam ve plastik yüzeylerin gerçek yansıması/renk tonu korunur.
- Her renk varyantı ayrı `variantId` ve gerçek görselle eşleşir; başka rengin fotoğrafı yer tutucu olmaz.
- Ana ürün zemini nötr açık veya marka koyu yüzeydir; yapay yoğun gölge kullanılmaz.
- Alt metin ürün tipi, model ve görünür renk bilgisini taşır; pazarlama sloganı değildir.

## Responsive kırpma

| Kullanım | Önerilen oran | Kural |
|---|---:|---|
| Masaüstü hero | 16:9 / 3:2 | Metin için güvenli boş alan metadata'sı |
| Mobil hero | 4:5 | Ayrı crop veya ayrı varlık; masaüstü görsel körlemesine kesilmez |
| Ürün kartı | 1:1 | Ürün çevresinde tutarlı nefes alanı |
| Kategori | 4:3 | Kategoriyi tek bakışta anlatan ürün grubu |
| Keşfet banner | 16:9 / 4:5 | İçerik odak noktası ve kanal türevi |

## Video ve slider

- Video poster görseli, sessiz başlangıç ve erişilebilir metin karşılığı taşır.
- Yalnız aktif slide videosu oynar; görünüm dışına çıkınca durur.
- Kullanıcı pause kontrolüne sahiptir; reduced-motion'da autoplay başlamaz.
- Mobil ağ için uygun bitrate/türev sağlanır; video yüklenmezse poster ve CTA çalışır.
- Slider tüm slaytları ilk açılışta indirmez; kritik ilk görsel önceliklendirilir.

## XINOBI U varlıkları

- Kaynak tasarım, temsili preview ve üretim dosyası farklı varlıklardır.
- AI/yüklenen görsel ürünün yalnız onaylı maskesine uygulanır; sap, kulp, cam, düğme ve güvenlik işaretleri korunur.
- D04 öncesinde ürün üstüne gerçeğe yakın sahte baskı alanı çizilmez.
- AI çıktısı, kullanıcı yüklemesi ve ürün fotoğrafının kaynak/lisans/sahiplik metadata'sı tutulur.

## Teslim metadata'sı

Her varlık için: `assetId`, kaynak/sahip, lisans, ürün/variantId, kullanım alanı, odak noktası, alt metin, locale, kanal, boyut/oran, checksum, onaylayan ve tarih.
