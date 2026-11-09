# Siparişin tek kaynak yüzeyi ve üç ayrı dosyası

09.11.2026 · KIS-TEK-10 teknik uygulama ve izole kabul tamamlandı.

Admin → Siparişler → Sipariş detayı → ilgili satırın **Sipariş tasarım detayı** alanını açın. Schema-2 için ürün/SKU/ticari stok referansı, configuration/revision, yüzey kimliği, kaynak/profil sürümleri, fotoğraf/maske/desen hashleri ve kaydedilmiş gerçek yerleşim gösterilir. Bunlar siparişin kaydıdır; güncel katalogdan doldurulmaz. Yeni satır renk seçimi sunmaz; eski siparişin rengi tarihsel bilgi olarak görünür.

## Üç dosya

1. **Ham deseni indir:** Müşterinin yüklediği/AI'ın oluşturduğu özgün dosyanın sipariş kopyası.
2. **Ürün kaynak görselini indir:** Editörde maskelenen tek ürün fotoğrafının sipariş kopyası. Alfa maske dosyası veya güncel katalog fotoğrafı değildir.
3. **Giydirilmiş önizlemeyi indir:** Aynı sipariş satırı ve kaydedilen yerleşim revizyonunun temsili JPEG'i. Baskıya hazır üretim dosyası değildir.

Uçlar `/api/v1/admin/orders/{id}/lines/{line}/{pattern|source|composition}`; `orders.read` ve mevcut staff/MFA kuralları geçerlidir. İsimler sipariş, 1-based satır ve rol/revizyon/SKU bilgisini taşır. Baytlar sipariş kopyasından gelir. Dosyayı tarayıcıya vermek cihazda kaydedildiğinin kanıtı değildir; indirmeler listesinden kontrol edilir.

Schema-2 kayıtta SurfaceBinding ile ürün/ticari varyant, tuval, maske ve fotoğraf özeti; configuration/revision ve desen özeti denetlenir. Güncel ProductSurface/SKU seçimi sorgulanmaz. Kaynak/maske veya müşteri tasarımı değişince eski sipariş güncellenmez. Arşiv kaynak fotoğrafı orijinal ölçüde iner; eski EditorCanvas dönüşümü yalnız legacy koordinat anlamını doğrulamak içindir, dosya dönüştürmez.

## Eksik ve hatalı veri

- 401: oturum/MFA doğrulanmalı; 403: rol/yetki gerekli.
- 404: kayıtlı kopya/dosya bulunmadı veya bu siparişte hiç tutulmadı; katalogdan veya başka siparişten tamamlanmaz.
- 503: depolama ya da bütünlük doğrulaması yapılamadı. Boyut/hash/tür/başlık veya yüzey bağı bozuksa dosya verilmez. Uygun yedek ve kayıt karşı kontrolü gerekir; uydurma başarı yoktur.
- Yeni ve manifestli eski siparişlerde müşteri önizlemesi de yalnız sipariş kopyasını kullanır; dosya eksik/hatalıyken canlı configuration/katalog görseli gösterilmez.
- Checksum'sız gerçekten eski kayıtlar ayrı uyumluluk yoludur; mevcut kopyalar `unrecorded` olarak işaretlenir, geçmiş kayda hash/kopya uydurulmaz. Bilinmeyen şema ham gösterilir.

Geçerli JPEG zorunluluğu tüm yeni configuration preview yüklemelerine uygulanır. Yeni kaynak modelinin pattern/source/composition kopyaları tam decode ile kontrol edilir. İşlem dosyayı yeniden kodlamaz veya tuvale ölçeklemez. Bellek kabulü mevcut maskeleme RAM ayarını kullanır; kaynak için sabit çözünürlük/oran şartı yoktur. Geçmiş indirme, güncel bitmap decode bütçesine bağlanmaz; dosya başlığı ve kaydedilmiş checksum/ölçü okunur.

## Doğrulama ve açık kapılar

[TST-267](../../test/2026-11-09/TST-267-single-source-order-files.md): API 623 PASS/29 SKIP, admin yeni + 5 legacy paket PASS, web 7, Flutter 302; build/type/lint ve görsel inceleme. Tek mevcut admin AuditHistory lint uyarısı sürer. Otomatik axe/widget kontrolü gerçek ekran okuyucu veya cihaz kabulü değildir.

Dosya deposu ve FeatureDocument/SQL satırı birlikte yedeklenmelidir; bu task gerçek migration/backfill/restore çalıştırmaz. API wire sözleşmesi ve DDL değişmedi. Gerçek SQL çoklu süreç/IIS, iş sahibi, Android/iOS WebView/indirme/VoiceOver/TalkBack kapıları 12/UAT kapsamında açık. Sıradaki task 11'dir; deploy/release/APK yapılmadı.
