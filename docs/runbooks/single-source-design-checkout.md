# Tek kaynak tasarım kaydı ve satın alma bağı

09.11.2026 · KIS-TEK-09 · Teknik uygulama ve izole kabul tamamlandı. Gerçek kaynak/SKU eşlemesi yetkili işletme kararı bekler.

## Admin kullanımı

1. Katalog → XINOBI U · Tek kaynak fotoğraf alanında ürünü açın. Kaynak fotoğrafı kaydedin; kaynak fotoğrafı ve maske onayı önceki taskların akışıdır.
2. **Kişiselleştirme satış SKU’su** alanında bu ürünün gerçek ticari SKU’sunu açıkça seçin. Stok/fiyat mevcut katalogdan gelir; normal katalog renkleri silinmez.
3. Onayı okuyup kaydedin. Kaynak/profil sürümü kontrol edilir; çakışmada seçiminiz korunur ve güncel kayıt yüklenir. Eşleme boş bırakılırsa kişiselleştirme satışı kapalıdır.
4. Bu SKU veya ürün silinecekse önce eşlemeyi kaldırın. Başka üründeki varyant bağlanamaz. Eşleme değişimi mevcut siparişleri güncellemez; açık yeni tasarım/sepet güncel yüzeyde yeniden yerleştirme ister.

Bu çalışma gerçek kataloğa kaynak/SKU atamaz, fiyat/stock seed etmez. Şirket hangi fiziksel ürünü hangi SKU'dan satacağını seçmelidir. Ürün başına kaynak/maskenin kendi koordinat eşliği zorunludur; renkler arası hizalama yoktur.

## İstemci ve sunucu sözleşmesi

- Rendering: mevcut ürün bazlı `rendering-inputs`. Satış: `GET /api/v1/product-surfaces/{productId}/purchase`. Güncel yüzey ile satış bağının ürün/kaynak/maske kimliği ve gerçek ölçüsü eşleşmeden UI kayıt/sepet açmaz.
- `SingleSourceBinding`: productId, profileRevision, sourceRevision, surfaceId, productSourceSha256, maskSha256, width, height, fulfillmentVariantId.
- `SaveDesignConfiguration` optional surfaceBinding içerir; yeni schema-2 kayıtta zorunlu akış bağıdır. VariantId yalnız ticari kimliktir; surfaceId asla sahte SKU olarak gönderilmez.
- Mevcut `MyDesignConfiguration.SourceSha256` desen dosyasına aittir. Ürün fotoğrafı hash'i ayrı SurfaceBinding alanındadır. Gerçek kaynak ölçüsü korunur; ekran bitmap bütçesi yerleşim koordinatlarını değiştirmez.
- Her kayıt/ekleme öncesi satış bağı sunucudan yeniden okunur. Değişmemiş yerleşim için gereksiz yeni revision açılmaz; sepete güncel stokla eklenir, fiyat değişmişse güncel katalog istenir. Kayıt, preview upload, favori ve sepete ekleme sıralıdır. İlgili istek tamamlanmadan başarı yoktur. Önizleme hatasında kısmi raw desen hesabınızda kalabilir; tamamlanmış yerleşim/sepet başarısı olarak gösterilmez.
- Kişiselleştirilmiş sepet/checkout satırında ticari SKU rengi görsel seçenek olarak sunulmaz; normal satış renkleri korunur. Sepet anahtarı ürün/ticari varyant/desen/configuration/revision içerir. Düzenleme yalnız beklenen mevcut satıra yapılır; kaldırılmış satır yeniden yaratılmaz. Checkout aynı varyantın normal+kişiselleştirme toplam adedini ve güncel fiyatı doğrular.
- Yeni kaynak profilli üründe raw desenin configuration/revision bilgisi atlanarak checkout yapılamaz. Checkout schema-2 bağı tekrar doğrular; desen, ürün fotoğrafı ve giydirilmiş önizleme kopyaları bulunmadan sipariş oluşturmaz. OrderPersonalization, aynı SurfaceBinding'i saklar. Sipariş indirme/görünümünün kapsamlı kabulü task 10'dur.

## Eski kayıtlar ve AI

Schema-1 kayıtlar kendi tarihsel kaynağında okunur; yeni modele otomatik taşınmaz. Tek kaynak profili açılan üründe yeni düzenleme/sipariş için açık yeni yerleşim gerekir; schema-1 üzerinden ticari bağ kontrolü atlanamaz. Henüz tek kaynak profili olmayan ürünlerin eski doğrulanmış düzenleme akışı korunur. Tasarımlarım'ın yeni kayıtlı yerleşimi schema-2 ile açılır. Eski tasarım için **Güncel tek kaynakta yeni yerleşim oluştur** eylemi yeni configuration başlatır; eski revision değiştirilmez. Kaynak değişmiş schema-2 için **Güncel yüzeye yeniden yerleştir** gerekir, eski koordinatlar sessizce uygulanmaz.

AI null variant oturumu ürünün onaylı tek kaynağını gerektirir ve ticari renk seçmez (`variant: null`). Ticari eşleme olmadan desen üretilebilir; satın alma ayrıca açık eşleme/fiyat/stok gerektirir. Oturum üretiminden önce kaynak kimliği yeniden doğrulanır. Eski açık variant oturumları tarihsel destek için kalır. Web ve Flutter WebView aynı kayıt/editör/hesap köprüsünü kullanır; TS/Dart yeni nullable sözleşmeyle üretilmiştir.

## Depolama / geri dönüş

FeatureDocument `personalization/personalization-profiles.json` şema 1 korunur; optional FulfillmentVariantId ve artan ProfileRevision eklenir. Configuration schema 2 alanları optional SurfaceBinding ile eski kayıtlardan ayrılır. SQL DDL değişikliği yok; gerçek veri geçişi yapılmadı. Geri dönüş önce veri/dosya yedeği ve task 02 planıyla değerlendirilir. Schema-2 üreten sürümden önceki istemciye dönmek bu yeni kayıtları legacy'ye çevirmek değildir; eski istemci yeni kayıtları doğru işleyemez. Web/API/admin/Flutter uyumlu sürümle yayınlanmalıdır.

[Doğrulama / açık kapılar](../../test/2026-11-09/TST-266-single-source-design-checkout.md). Gerçek cihaz/IIS/çoklu süreç SQL ve task 10–12 açık; deploy/APK yapılmadı.
