# Elle gösterilen ortak ürün maskesi — geliştirme denemesi

Amaç: Yeni ürünün bir referans renginde kaba boyama yapıp Roboflow SAM3 ile gerçek sınır adayını çıkarmak; aynı konumdaki renk fotoğraflarına tek onayla aynı maskeyi uygulamak.

## Panel akışı

1. Geliştirme panelinde **Ürün yüzeyi incele → Elle gösterilen ortak ürün maskesini dene**.
2. Referans rengi seç. Fırçayla uygulanacak bölgenin içini dolu olarak boya; **Düzeltmeleri uygula**. İnce bir çevre çizgisi yeterli değildir.
3. **Boyadığım bölgeyi Roboflow ile bul**. Bu açık işlem fotoğrafı ve en fazla 12 iç noktayı `/sam3/visual_segment` çağrısına gönderir. Çizim yapmak ve renk seçmek çağrı yapmaz; bu model eğitimi değildir.
4. Dönen taslağı incele, gerekirse fırça veya dahil/hariç noktalarıyla düzelt. Kaba boyama sınırı AI sonucunu kesmez. İçten örnekleme ince kenar taşmalarını azaltmaya yardımcı olur; kusursuz semantik sınır garantisi vermez. Kulp, ağız, metal ve logo alanları kontrol edilir.
5. **Maske içinde örnek desen göster** ile alanı kontrol et. **Önizleme rengi** ile diğer renk fotoğraflarındaki aynı koordinatları incele.
6. Uygulanacak renkleri seç; aynı konum/ölçek/açı ve sınır incelemesini işaretle; **Seçilen renklerde onayla**. Seçili renklerin mevcut maskeleri tek katalog güncellemesinde değiştirilir. Ek inference yoktur.

## Koşullar ve veri

- Mevcut Development + loopback + personel katalog izinleri korunur. API'de `ProductSurfaces:ExperimentalCatalogWorkspace:Enabled=true` açık olmalı; üretim erişimi açılmadı.
- Roboflow anahtarı mevcut workspace ayarı `ProductSurfaces:Roboflow:ApiKey` üzerinden sunucudan okunur. Anahtar istemciye çıkmaz; günlük limit mevcut ayarla uygulanır. Anahtar yokken el ile maskeleme mümkündür, AI düğmesi kapalıdır.
- Maske ve taslak `product-surfaces` workspace'inde; onaylı PNG mevcut dosya deposunda; renklerin `SurfaceMask`/`SurfaceImage` bağlantıları katalogda saklanır. Yerel veri ve görseller Git'e alınmaz.
- Seçili renkler aynı ürüne ait, aynı piksel boyutunda ve admin tarafından aynı konumda doğrulanmış olmalıdır. Otomatik hizalama yapılmaz. Boyut eşitliği geometrik eşitlik kanıtı değildir; farklı kırpım/açıdaki fotoğraflar bu akışa dahil edilmez.
- Fotoğraf bağlantısı veya taslak sürümü değişirse istek reddedilir. Fotoğraf sonradan değişirse mevcut katalog kuralı maskeyi eski kabul eder. Yeni eklenen bir renk için referansı yeniden çizmek gerekmez; onaylı maskeyi fırçayla taslağa alıp o renkle birlikte onaylamak mümkündür.
- Web development renderer'ı exact ürün/varyant için salt okunur `/api/v1/dev/product-surfaces/commerce-mask/{product}/{variant}/rendering-inputs` köprüsünü kullanır. Mevcut opt-in Next proxy'ye bu rota eklendi. Web/API aynı katalog ve medya deposuna yönlenmelidir. Statik/canlı web paketleri otomatik değiştirilmez. Mobil katalog maskesi alanı mevcut sözleşmeyle sunulur; bu değişiklikte cihaz testi yapılmadı.
- Üretim baskı ölçüsü, DPI, `DesignVersion` veya baskı dosyası kabulü değildir. Bu denemede logo korunumu maskenin logoyu dışarıda bırakmasıyla sağlanır; ayrı otomatik logo çıkarımı eklenmedi.

## Doğrulama

[TST-121](../../test/2026-10-16/TST-121-guided-shared-mask.md). Gerçek Roboflow sonucu için sonraki adım: temsilî bir yeni ürünün kaba boyamasıyla açık bir çağrı yapıp kenarları ve aynı konumdaki renkleri görsel olarak değerlendirmek. Bu çalışma sırasında gerçek sağlayıcı çağrısı yapılmadı.
