# Mobil editör girişi ve sipariş ürün önizlemesi

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


Tasarımlarım ekranındaki “Editörde tasarla” düğmesi ürünsüz açıldığında `/tasarim-editoru`
üzerinde yerel ürün seçimi gösterilir. Sekme kabuğuna redirect yapılmaz. Ürün seçildikten
sonra mevcut yöntem seçimi ve paylaşılan WebView önizlemesi kullanılır. Kayıtlı tasarım,
renk, yerleşim revizyonu ve sepet satırıyla açılan bağlantılar korunur.

Sipariş detayındaki küçük görsel, ham desen yerine siparişin ürün üstündeki önizlemesidir.
Dokunulduğunda ayrı tam ekran açılır; iki parmakla 5 kata kadar büyütülebilir.

## Önizleme saklama

Önizleme ekranı mevcut API'ye yerleşim revizyonuyla birlikte JPEG yükler. Sipariş
oluşturulurken mevcut JPEG `order-<id>-<line>-preview` anahtarıyla Designs depolama alanına
kopyalanır. Kaynak desen ayrıca eskisi gibi korunur. Sonraki yerleşim değişiklikleri veya
Tasarımlarım'dan silme sipariş kopyasını değiştirmez. Başarısız/tekrarlanan sipariş
isteğinin sahipsiz kopyaları temizlenir.

`GET /api/v1/me/orders/{id}/lines/{line}/preview` oturum sahibi müşteri için JPEG döner;
başka müşterinin siparişi veya olmayan önizleme 404 döner. Oturumsuz istek 401 döner.
Bu ikili medya yolu mobilin mevcut yetkili görsel yükleyicisiyle çağrılır; generated
JSON istemci sözleşmesi değişmez.

Eski siparişte sipariş kopyası yoksa kayıtlı configuration/revision önizlemesi denenir.
Bu da yoksa eski yerleşimsiz kayıtlarda, aynı varyantın onaylı maskesi ve siparişin
korunmuş deseniyle yalnız temsili yerleşim gösterilebilir. Kaynak/maskesi olmayan veya
modern yerleşimi kaybolmuş siparişlerde normal ürün resmi “Tasarım önizlemesi mevcut
değil” açıklamasıyla gösterilir. Ham desen, tasarlanmış ürün gibi sunulmaz. Kaydedilmemiş
eski bir kompozisyonun birebir geri getirilmesi garanti edilemez.

## Yayın ve kontrol

Yeni siparişlerin bağımsız önizleme kopyası için API deploy'u ve güncel APK gerekir.
Web önizleme kaydı en uzun kenarda 480 yerine 1440 piksele kadar detay korur; küçük
kaynaklar büyütülmez. JPEG kalitesi gerekirse düşürülerek 2 MB API sınırı korunur.
Bu çözünürlük iyileştirmesi için web paketinin de güncellenmesi gerekir.
Veritabanı migration'ı yoktur. Canlıya bu çalışma sırasında yayın yapılmaz.
Android cihazda Tasarımlarım → Editörde tasarla → ürün → yöntem → önizleme → sepete
akışı; ardından sipariş detayındaki küçük ürün, dokunarak büyütme, iki parmakla
zoom ve geri tuşu doğrulanmalıdır. Eski siparişler için kaydedilmiş önizlemenin
bulunmadığı durum ayrıca kontrol edilmelidir.
