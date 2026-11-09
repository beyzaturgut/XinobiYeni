# TST-266 — KIS-TEK-09 tasarım revizyonu, sepet ve checkout

09.11.2026 · İzole API / tarayıcı / Flutter / Dart sözleşme doğrulaması. Testler gerçek müşteri, katalog, SQL veya AI/kargo sağlayıcı kaydı oluşturmaz. Yerel servislerin sağlık kontrolü ayrı, salt okunur kontroldür.

## Yapılanlar

- Ürün profilinde açık `FulfillmentVariantId` eşlemesi ve optimistic `ProfileRevision` kontrolü; admin katalogda yetkili SKU seçimi, kaldırma, hata/form koruma, onay ve kaydedilmemiş seçim koruması. Katalogda bağlı SKU/ürün silme 409; önce eşleme kaldırılır.
- Public `GET /api/v1/product-surfaces/{productId}/purchase`: gerçek SKU/fiyat/stok ve doğrulanmış yüzey bağı. Eksik eşlemede ilk renk seçilmez; eksik fiyat sıfırla doldurulmaz.
- Schema-2 configuration: ürün + profil/kaynak revizyonu + surfaceId + ürün fotoğraf SHA + maske SHA + gerçek ölçü + ticari varyant. Mevcut `SourceSha256` desen dosyasının hash'i olarak korunur. `PrintSetup` yeni modelde uydurulmaz.
- Yeni kaynak profilli üründe configuration alanını atlayarak checkout yapılamaz; yeni varyantsız desene legacy yerleşim açılarak bağ kontrolü atlanamaz. Kayıt ve checkout güncel bağı sunucuda doğrular. Eski revision değişmez; kaynak/ticari bağ değişmişse 409 ve açık yeniden yerleştirme gerekir. Yeni akışta başka desenin configuration kimliği kullanılamaz; tek kaynak profili olmayan ürünlerde eski schema-1 revizyon davranışı korunur. Profil açılmış üründe schema-1 ile yeni kayıt/checkout yapılmaz; açık yeni yerleşim gerekir.
- Yeni kaydet/favori/sepet, web ve Flutter'ın paylaşılan WebView editöründe açıldı. Kaydetme/önizleme hatasından sonra başarı gösterilmez; dosya ve yerleşim aynı document içinde korunur. Tasarımlarım varsayılan açılışı mevcut yeni configuration'ı bulur; eski tasarımdan yeni kaynağa geçiş açık yeni yerleşim eylemidir, otomatik dönüşüm değildir.
- Web/Flutter sepet ve checkout’ta kişiselleştirilmiş satırların ticari rengi görsel tercih gibi sunulmaz; normal renkli alışveriş korunur. Farklı desen/configuration/revision satırları ayrılır. Normal ve kişiselleştirilmiş aynı ticari SKU toplam adedi mevcut stok denetiminden geçer. Checkout yeni modelde üç teslim dosyasından eksik olan varsa sipariş oluşturmaz; önceki legacy eksik önizleme okuma politikası korunur.
- AI null-variant oturumu onaylı tek ürün kaynağını kullanır; ilk fotoğraflı renk fallback'i kaldırıldı. Variant nullable sözleşmesi TS/Dart'a üretildi. Açık tarihsel variant oturumları korunur, gerçek AI üretimi kaldırılmadı ve testte sağlayıcı çağrılmadı.

## Kanıt matrisi

| Kontrol | Sonuç |
|---|---|
| Tam API paketi | **618 PASS / 29 SKIP / 0 FAIL** |
| Son SKU/ürün silme koruması dahil odaklı API | **3 PASS / 0 FAIL** |
| API Release | **0 uyarı / 0 hata** |
| Web TypeScript / ESLint / production export | **PASS** |
| Tek kaynak web matrisi | **19/19 PASS**; AI nullable, ham boyut, geçmiş, 320/390/768/1440, %200, klavye/axe, kayıt/sepet ve kaynak değişimi |
| Son metin/görsel sonrası odaklı web | **2/2 PASS**; hazır kayıt/favori/sepet düğmeleri 320/390 ve %200 metinde kesilmiyor |
| Admin build / lint | **PASS**; AuditHistory'de önceden var olan bir set-state-in-effect uyarısı açık, yeni uyarı yok |
| Admin izole kaynak/SKU matrisi | **PASS**; loading/empty/error/denied/stale/success, yanlış yanıt, onay, hızlı ürün değişimi, başarısız SKU formu, salt okunur, responsive/%200, birebir kaynak dosyası |
| Flutter analyze / tüm widget-regresyon | **temiz / 298 PASS** |
| Dart istemci sözleşmeleri | **12 PASS**; yeni iki test ürün/desen hash ayrımı ve null AI variant |

API örnek kaynağı **7001×7** boyutunda doğrulanır, sabit 6000 px sınırına veya eski editör tuvaline küçültülmez. Yanlış ürün/yüzey/hash/revizyon/ölçü, yabancı SKU, optimistic conflict, eksik önizleme, stok toplamı ve tekrar checkout kontrol edilir. Sunucu fixture'ları izole dosya depoları kullanır; gerçek SQL çoklu süreç kabulü değildir.

## Görsel inceleme

`artifacts/task09-save-cart-mobile.png` ve `/tmp/xinobi-source-ui/task09-fulfillment-mapping.png` incelendi. Mobilde kayıt açıklaması yeni sunucu kaydını doğru anlatacak şekilde güncellendi; kanıt alınırken çerez penceresi kapatıldı. Admin seçicisine ayrı erişilebilir etiket eklendi. Hazır kayıt düğmeleri sabit yükseklik yerine metinle büyür; 320/390 ve %200 hedef kontrolü yapıldı. Screenshot fixture ürünüdür; gerçek ürün tasarım/onay kanıtı değildir. Görseller build/test çıktısıdır, repoya eklenmez.

## Açık kapılar ve kapsam

- İşletmenin gerçek ürün → ticari SKU seçimi **yapılmadı**. Adminin yetkili seçimi sonrası onaylı yüzey ve mevcut fiyat/stok varsa yeni akış açılır. 23 ürün içeriği ve SKU 117 fiyatı açık kalır.
- Eski schema-1 tasarım/sipariş/dosyalar yeniden yazılmadı; gerçek geçiş/dry-run/restore kabulü task 02 planına tabidir. FeatureDocument şeması 1'de optional profil alanı, configuration şeması 2 kullanılır; yeni DDL gerekmiyor.
- KIS-TEK-10: sipariş ekranında renk sunumu, yerleşim ve üç dosyanın geçmiş bütünlüğü/indirme kabulü; 11: eski doküman/araç temizliği; 12: bütün zincir ve gerçek cihaz/IIS/SQL kabulü açık.
- Android/iOS gerçek WebView/picker/VoiceOver/TalkBack testi yapılmadı. Otomatik sonuç cihaz kabulü değildir. Native document kapanınca File yeniden seçilmelidir.
- Canlı deploy, release yayını, APK veya gerçek ödeme/baskı/kargo işlemi yapılmadı. Yerel servisler güncel sürümle yeniden açıldı; web/admin HTTP 200. Salt okunur gerçek katalog örneğinde satın alma ucu HTTP 200 / source_missing / bağ yok yanıtladı; test için kaynak/SKU eklenmedi.

[Uygulama rehberi](../../docs/runbooks/single-source-design-checkout.md) · [Task planı](../../docs/tasks/personalization-single-source-tasks-2026-11-06.md).
