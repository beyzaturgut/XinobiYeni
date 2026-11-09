# Flutter tek kaynak kişiselleştirme

09.11.2026 · KIS-TEK-08 · Kod geçişi/otomatik kabul tamam; Android/iOS gerçek cihaz kabulü açık.

## Uygulanan akış

- Mobil XINOBI U ürün listesi ve yöntem ekranı ürüne ait tek aktif/onaylı kaynağı kullanır. Renk rozeti, renk maskesi araması ve ilk uygun satış varyantını seçme yeni akışta yoktur. Normal ürün kataloğu, renk/galeri, fiyat/stok ve sepet davranışı korunur.
- `CatalogRepository.singleSourceSurface` üretilmiş ProductSurfacesApi üzerinden `/api/v1/product-surfaces/{product}/rendering-inputs` okur. Product/scope/schema/revision/surfaceId, ham boyutlar, kaynak/maske SHA ve kesin aynı-origin medya yolu doğrulanır. 404=null (onaylı kaynak yok), servis/bağlantı veya bozuk sözleşme güvenli hata olarak ayrılır; eski varyant/paket fallback'i yapılmaz.
- Riverpod ürün bazlı provider autoDispose kullanır; rotadan çıkınca tamamlanmış onay süresiz tutulmaz. Medya URL'leri source revision/surfaceId/hash içerir. Thumbnail decode bütçesi ham kaynak dosyasını/metadata'sını değiştirmez.
- Eski `/xinobi-u/renk?urun=...&renk=...` ve editör girişleri açılır; yeni yöntem/galeri/anket bağlantıları yalnız ürün taşır. Legacy renk parametresi yeni görsel veya SKU seçmek için kullanılmaz. Route key ürün/session/configuration değişiminde önceki controller veya ekran durumunun taşınmasını önler.
- Yeni AI oturumu variantId seçmeden oluşturulur. Kalıcı oturum anahtarı ayrı namespace altında ürün + kaynak sürümü + surfaceId + iki hash ile kurulur. Eski renk anahtarları silinmez/otomatik alınmaz. Yanıtlar aynı session altında korunur; uygulama yeniden açılınca aynı yüzeye ait soru/üretim/sonuç devam eder. Kaynak/maske sürümü değişirse eski oturum yeni yüzeye sessizce bağlanmaz.
- Kaynak beklenirken ekran kapanırsa oturum oluşturulmaz; asenkron sonuçların yeni ürüne taşınmasını önleyen generation guard bulunur. Başarısız üretim yanıtı tercihleri silmez. Tek üretim ve polling kuralları korunur.
- Kendi görseli/deseni ve AI önizlemesi webin aynı gerçek kaynak koordinatlı renderer'ını WebView'da kullanır. Eski alternatif native renk editörü doğrudan aynı paylaşılan ekrana yönlendirilmiştir; galeriyi 2400 tuvale çevirip rastgele varyanta kaydeden kullanılmayan yazma yolu kaldırılmıştır. Native Android galeri köprüsü, sistem geri ve güvenilir origin sınırı korunur; gerçek cihaz kabulü ayrıca gereklidir.
- Yükleniyor/boş/onaysız/hata/yeniden dene ayrı görünür. Büyük metinde ürün kartının başka ürün düğmesi alt satıra iner; liste durum metni ortak kart tipografisini kullanır. Yeniden denemede seçilmiş yöntem korunur.

## Tarihsel kayıt ve kapsam sınırı

`design_configurations.dart` ve geçmiş tasarım/sipariş DTO'ları kendi configuration/revision/variant bağlarını okumaya devam eder; dosyalar veya yerel tarihsel placement anahtarları yeniden yazılmaz. Yeni yüzeyin ticari SKU/fiyat/stok ve revizyon kaydı **KIS-TEK-09**'da tamamlanacaktır. Bu nedenle yeni sonuç/önizlemede kaydet/sepete ekle yerine henüz kullanılamadığı açıkça yazılır; başka renkten fiyat/SKU alınmaz. Eski kayıtların yeni yüzeye edit edilmesi otomatik kabul edilmiş sayılmaz.

AI sunucusunun null variant için tarihsel ilk fotoğraflı varyantı seçme iç davranışı 09'da açık kalır; mobil bunu önizleme kaynağı veya ticari SKU yapmaz. Gerçek ürün kaynağı/SKU eşleme ve veri geçişi yapılmadı. WebView'ın hedefi KIS-TEK-06 API ve KIS-TEK-07 web ile eş sürüm olmalıdır; eski canlı web bu kod teslimiyle güncellenmiş sayılmaz.

## Ağ kesintisi ve operatör kabulü

Web içi API hatası/tekrar deneme aynı document içindeki dosya ve yerleşimi korur (web 07 kabulü). Ana document yüklenemediğinde native yeniden yükleme tarayıcı File nesnesini geri getiremez; kullanıcı dosyayı yeniden seçmelidir. Süreç kapanması/yeniden kurulum/gerçek native picker için kalıcı dosya kabulü iddia edilmez. Önizleme adresi eksikse kullanıcıya sade kullanılamıyor mesajı verilir; `API_BASE_URL` ve `XINOBI_WEB_PREVIEW_URL` yalnız build/runbook ayarlarıdır, ekrandaki uygulama detayı değildir.

## Doğrulama ve kapanış

- `flutter analyze`: temiz.
- `flutter test`: **298 PASS / 0 FAIL**; normal katalog/hesap/sepet/sipariş/kargo ve geçmiş tasarım regresyonları dahil.
- Yeni sözleşme, kaynak sürüm anahtarı, 404/503 ayrımı, yanlış ürün/hash/medya reddi, 5001×4000 ve 7001×5 metadata, loading/retry/onaysız ve ekran kapanışı testleri mevcut.
- Android/iOS platform temalarında 320/390/768 ve %200 metin ayrı test edildi. [Android](../reports/mobile-single-source-android-2026-11-09.md), [iOS](../reports/mobile-single-source-ios-2026-11-09.md), [TST-265](../../test/2026-11-09/TST-265-single-source-mobile.md).
- Entegrasyon testindeki artık kullanılmayan native galeri scripti ürün bazlı yöntem girişine güncellendi; fiziksel cihazda çalıştırılmadı. Paylaşılan renderer koordinat kabulü web 07 kanıtına dayanır; native WebView/picker gerçek cihaz kabulünün yerine geçmez.
- Sonraki kod taskı 09'dur. 08'in gerçek cihaz kapısı 12/UAT ile açık takip edilir. Deploy/APK/iOS arşivi oluşturulmadı.
