# Webde tek kaynak kişiselleştirme

> **Güncel giriş (10.11.2026):** [Tek kaynak kişiselleştirme](single-source-personalization.md). 03–12 teknik uygulama/izole kabul tamamlandı; gerçek cihaz/SQL/IIS/iş sahibi kabulü açıktır. [Son kabul kaydı](single-source-acceptance.md). Aşağıdaki tarihli testler kendi teslimlerinin kanıtıdır.


> **09.11.2026 / KIS-TEK-09 güncellemesi:** Aşağıdaki 07/08 teslimindeki kayıt/sepet kapısı yeni sürümde tamamlandı. Açık SKU seçimi ve schema-2 doğrulamasıyla kayıt/favori/sepet açılır; eksik eşleme/fiyat/stokta kapalı kalır. AI ilk-renk fallback'i kaldırıldı. [Güncel rehber](single-source-design-checkout.md), [TST-266](../../test/2026-11-09/TST-266-single-source-design-checkout.md). 10 ile sipariş dosyaları, 12 ile izole regresyon tamamlandı; gerçek cihaz kabulü açıktır.

09.11.2026 · KIS-TEK-07 · Web ekran geçişi ve KIS-TEK-09 kayıt/sepet bağları uygulandı.

## Web davranışı

- XINOBI U ürün listesi yalnız ürünün açık/onaylı tek kaynağını gösterir; ilk renk fotoğrafı veya paketlenmiş varyant önizlemesi yeni kaynağın yerine geçmez. Renk adedi ve swatch bu listede gösterilmez. Normal katalog kartları etkilenmez.
- Normal ürün detayının renk, fotoğraf galerisi, fiyat/stok ve Sepete ekle davranışı korunur. XINOBI U uygunluğu seçili satış renginden bağımsız, ürünün tek yüzeyinden kontrol edilir; kişiselleştirme bağlantısı yalnız ürün taşır.
- Eski `/xinobi-u/renk?product=...&variant=...` URL'si yöntem seçimini açmaya devam eder. Renk seçtirmez; yeni devam bağlantıları renk taşımaz. Ürün değişiminde ekran anahtarı ve istek kimliği eski ürünün fotoğraf/durumunun taşınmasını önler.
- Görsel/desen yükleme, #onizleme geçmiş adımı, mod değiştirme ve geri/ileri yerel dosyayı aynı ürün ekranında korur. Tam sayfa yenilemesinde tarayıcı File nesnesi yeniden istenir; sunucuya kaydedildiği iddia edilmez. Kaynak hatasında yerel dosya hook'u kaybolmaz; yeniden denemede kullanılabilir.
- AI soruları ürünün onaylı kaynak fotoğrafını gösterir. Yeni AI oturum isteğinde renk zorunlu değildir (variantId=null). Sunucunun döndürdüğü tarihsel variant alanı yalnız oturum kimliği olarak kalır; yeni önizlemenin kaynağı veya satış SKU'su sayılmaz. AI sonuç sayfası açık eylemle önizlemeye gider; ürün/session parametreleri doğrulanır ve geri bağlantısı aynı session'ı açar. Bir ürünün oturumu başka ürünün önizlemesine açılmaz.
- Yeni önizlemede renk değiştirme, ortak maske/aynı hizalama veya renge yerleşim transferi yoktur. Yerleşim, geri al/yinele, kavis, zoom ve alan doldurma korunur. Görsel koordinatlar ham kaynağın gerçek boyutlarıdır.
- Yeni ProductSurface okuyucusu yalnız `/api/v1/product-surfaces/{product}/rendering-inputs` sözleşmesini kabul eder. Şema/scope/ürün/sürüm/hash/medya yolu doğrulanır; 404 hazır değil, servis/yanlış kimlik hata olarak ayrılır. 15 saniye timeout vardır. Yalnız devam eden istekler paylaşılır; tamamlanmış yüzey sonuçları rotalar arasında süresiz önbellekte kalmaz. Eski varyant/paket yedeğine sessiz geçilmez.

## Gerçek ölçü ve geçici çizim çözünürlüğü

Kaynak metadata'sı, yerleşim kontrolünün x/y aralığı ve dışarı bildirilen yerleşim ham genişlik/yükseklikte kalır. Yeni tek kaynak önizlemesinin geçici canvas'ı en fazla 2 milyon piksel ve en uzun kenarı 2048 olacak şekilde sınırlanır. Bu, kaynak dosyasını veya maskesini yeniden yazmaz; sabit bir yükleme boyutu/en-boy oranı değildir. Renderer x/y ve gövde ofsetlerini geçici piksel ızgarasına, sürükleme geri bildirimini gerçek kaynak koordinatlarına çevirir. Ekran/zoom büyüklüğü yerleşimi değiştirmez. Kaynak ve maske kendi gerçek ölçülerinden farklıysa çizim hata verir. Eski açık varyant önizlemeleri önceki sözleşmesinde kalır.

## Kayıt, geçmiş tasarımlar ve AI

09 ile schema-2 kayıt/favori/sepet/checkout açık ticari SKU ve güncel yüzey bağıyla uygulandı. Kaynak veya ticari eşleme eksikse satın alma kapalıdır; başka renkten fiyat/SKU alınmaz. Eski tasarım kendi tarihsel verisiyle okunur; güncel tek kaynakta düzenlemek için açık yeni yerleşim oluşturulur. İlk fotoğraflı varyant fallback'i yeni AI oturumundan kaldırıldı; null variant oturumu ürünün tek onaylı kaynağını doğrular.

10 ile siparişte kaynak/yerleşim ve üç değişmez dosya doğrulanır; eksik sipariş önizlemesi güncel konfigürasyon veya katalog görseliyle doldurulmaz. [Kayıt ve satın alma](single-source-design-checkout.md), [sipariş dosyaları](single-source-order-files.md).

## Operatör kontrolü

Ürünün XINOBI U işareti açık, tek kaynak ve bu kaynağa bağlı maske onaylı olmalıdır. Satın alma ayrıca açık ticari SKU/fiyat/stok gerektirir. Flutter kod geçişi 08 ile uygulandı; Android/iOS gerçek cihaz kabulü açıktır. Gerçek kaynak/SKU seçimi ve veri geçişi yapılmadı.

## Doğrulama

`NEXT_PUBLIC_COMMERCE_API_URL=/api/v1/local-commerce NEXT_PUBLIC_DESIGN_API_URL=/api/v1/design-studio pnpm --filter web build`

`pnpm --filter web exec playwright test --config tests/single-source.config.ts`

Test sunucusu 3017'de statik export sunar, API başlatmaz. Tarayıcı koruması tanımlanmayan API/dış host isteklerini engeller; katalog/oturum/dosya cevapları fixture'dır. Gerçek hesap, sipariş, SQL veya AI çağrısı kullanılmaz. [TST-264](../../test/2026-11-09/TST-264-single-source-web.md).

Tam web E2E ve eski renk odaklı senaryoların toplu eşlemesi 11/12 kapsamındadır; bu odaklı kabul tüm projenin regresyon kabulü değildir. Gerçek cihaz/VoiceOver, gerçek katalog dosyaları ve canlı IIS ayrı kabul gerektirir. Deploy/APK yapılmadı.
