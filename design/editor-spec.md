# Editör davranış ve teslim sözleşmesi

Sürüm: 0.1.0 · 02.10.2026 · F02-A05

Durum: Belge taslağı tamamlandı; Creative/FE/BE incelemesi ve D04 üretim kabulü bekliyor. Kaynaklar: Faz06 §1–5, `flows.md` §5, `components.md` §7 ve Analiz2 K-12/K-14–K-21.

## Mevcut ekran ve hedef

WEB-005 `/urunler/cay-makinesi-101/kisisellestir/` metin/stil/renk demo taslağıdır. WEB-006 `/urunler/cay-makinesi-101/editor/` metin/şekil ekleme, seçim, kilit/görünürlük ve yüz seçimi sağlar. Mevcut ön/arka seçiminde aynı ürün görseli ve katman listesi kullanılır; gerçek yüz geometrisi uygulanmış değildir. Upload, undo/redo, koordinat, şablon, kalıcı sürüm ve baskı üretimi açık uygulama işleridir.

Hedef girişler ürün/varyant seçimi, WEB-017 AI adayı veya kendi görselini yüklemedir. Hepsi aynı tasarım belgesine ulaşır. Ürün üstündeki önizleme sürekli “Temsilidir” açıklaması taşır; sap/kulp/cam/plastik ve onaysız yüzeylere görsel uygulanmaz.

## Belge ve veri sınırı

| Alan | Sözleşme |
|---|---|
| Kimlik | `schemaVersion`, `designId`, `productId`, `variantId`, `baseVersion`; gerçek API kimlikleri |
| Alan | `printAreaId`, `printAreaVersion`, `face`; her alanın katmanları ayrı tutulur |
| Katman | `id,type,assetId?,text?,fontId?,fill?,x,y,width,height,rotation,zIndex,visible,locked` |
| Kaynak | Sunucuda sahipliği doğrulanmış Asset; AI kaynağının job/asset referansı korunur |
| Sürüm | Sunucunun verdiği değişmez `designVersionId` ve revision; sipariş eski sürüme bağlı kalır |
| Doğrulama | Alan/katman referanslı errors ve warnings, kural sürümü, sunucu fiyat farkı |

Koordinat birimi (mm veya normalize) teknik kararla kesinleşene kadar şema taslağıdır; tarayıcı pikseli kalıcı kaynak olmaz. D04 fiziksel alan, güvenli marj, DPI, dosya/font lisansı ve çıktı profilini belirler. Eşik veya gerçek ölçü bu belgeyle atanmaz. Önizleme ve render aynı dönüşüm/font metriklerini kullanır; rotasyon sonrası sınır kutusunun tamamı doğrulanır.

## Etkileşimler

- Yüz değişimi ilgili alanın katmanlarını açar, diğer yüzü silmez. Varyant değişimi alan eşleşmesi kontrolü ister; uyumsuz tasarım sessizce taşınmaz.
- Metin/görsel/şekil ekleme seçili alana tek katman ekler. Kilitli katmanın konum/içerik/sıra değişimi kapalıdır; kilit açma erişilebilir katman listesinden yapılır. Gizleme baskı belgesindeki görünürlüğü değiştirir.
- Taşıma, boyut, rotasyon, hizalama, kopyalama, silme ve sıra değişimi sayısal alan/düğmelerle de kullanılabilir. Sürükleme tek erişim yolu olmaz.
- Undo/redo belge değişikliklerini oturumda izler; yüz seçimi ve zoom geçmişe yazılmaz. Yeni değişiklik redo dalını temizler. Kalıcı sürüm geçmişi ayrı görünür.
- Dosya önce yüklenir ve taranır; yalnız `ready` Asset katmana bağlanır. MIME/içerik, boyut, piksel, sahiplik ve lisans kontrolleri sunucudadır. Hatalı yükleme mevcut taslağı silmez.
- Kaydetme sırasında taslak korunur. Ağ sonucu belirsizse aynı istek kimliğiyle durum sorgulanır; tekrar tıklama yeni sürüm oluşturmaz. 409'da mevcut ve sunucu sürümleri korunur, yeniden yükle veya yeni taslak olarak devam et seçenekleri sunulur.
- Kaydedilmemiş değişiklikle ayrılmada kal/ayrıl seçimi gösterilir. Çevrimdışı düzenleme kalıcı kayıt diye sunulmaz; yerel saklama ve süre D10 kararı gerektirir.

## Durumlar ve hata dönüşü

| Durum | Görünüm ve izinli eylem |
|---|---|
| Boş / düzenleniyor | Alan ve araçlar, kaydedilmemiş durum metni |
| Yükleniyor / taranıyor | Dosya ilerlemesi; geçersiz katman eklenmez |
| Kaydediliyor / kaydedildi | Busy ve sonuç sürümü; tekrar gönderim korunur |
| Çevrimdışı / kaydetme hatası | Taslak korunur; bağlantı sonrası güvenli tekrar |
| Sürüm çakışması | 409 açıklaması; sessiz üzerine yazma yok |
| Medya/font eksik veya kalite/taşma | Katman listesi ve alan üzerinde metinsel işaret; hataya git eylemi |
| Doğrulanmış | Yalnız sunucu yanıtındaki sürüm, alan ve fiyat gösterilir |
| Üretime kilitli | Sipariş sürümü salt okunur; değişiklik yeni taslak oluşturur |
| Render queued/running/failed/ready | ADM-008 durumu ve yetkili indirme; failed dosya hazır gösterilmez |

Sepete ekleme önce kaydedilmiş sürümü sunucuda doğrular; checkout aynı sürümü tekrar doğrular. D02/D03/D04 ve gerçek API kapanmadan mevcut ticari eylemler açılmaz. Render tekrar kimliği `designVersionId + areaVersion + outputProfileVersion` ile eşlenir.

## Responsive ve erişilebilirlik

1440/1024 px araç–tuval–katman düzeni; 768 px daraltılmış paneller; 390/320 px tek tuval ve adlandırılmış araç/katman bölümleri hedeflenir. Birincil kontroller en az 44 px; sayfa yatay taşmaz. Tuval zoom'u içerik kaydırmasını açıkça ayırır. Sayısal düzenleme ekran klavyesiyle örtülmez. Seçim `aria-pressed`, durum `aria-live=polite`; hata özeti ilk hataya odak verir. Dialog kapatılınca odak açan kontrole döner. MOB-002 aynı belge/API'yi kullanır; native/WebView tekniği D09'a bağlıdır. Fiziksel cihaz ve ekran okuyucu kabulü açıktır.

## Kabul vektörleri

1. Ön yüzde iki, arka yüzde bir katman: geçiş/kaydet/yeniden aç sonrası yüzler ve sıra korunur.
2. Döndürülmüş katmanın köşesi alan dışına çıkar: UI ve sunucu aynı ihlali gösterir.
3. Varyantın alanı uyumsuz: kullanıcı uyarılır ve sepet aktarımı engellenir.
4. İki sekme aynı revision'ı kaydeder: ikinci istek 409; hiçbir sürüm kaybolmaz.
5. Kaydetme cevabı kaybolur: aynı istek kimliği tek sürüme çözülür.
6. Siparişten sonra tasarım düzenlenir: sipariş sürümü/çıktı hash'i değişmez.
7. Yetkisiz Asset veya çıktı isteği reddedilir; render hatası aynı sürümle izlenebilir tekrar sunar.
8. 320/390/768/1024/1440 px klavye ve dokunma ile temel araçlar kullanılabilir; VoiceOver/TalkBack ayrıca kaydedilir.

Bu vektörler gelecek Faz06 kabul senaryolarıdır; mevcut prototipte geçmiş test olarak işaretlenmez.
