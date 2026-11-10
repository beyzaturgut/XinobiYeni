# Katalogdaki tek kaynak fotoğraf bölümünün kaldırılması

10.11.2026 · Kullanıcı, katalog ekranındaki **XINOBI U · Tek kaynak fotoğraf** bölümünü iptal etti ve kaldırılmasını istedi. Kapsam gönderilen ekran görüntüsündeki admin katalog bölümüdür.

Katalogdaki accordion, fotoğraf seçme/yükleme/indirme formu ve bu bölümün içindeki ticari SKU eşleme formu kaldırıldı. Yalnız burada kullanılan PersonalizationSource/FulfillmentBinding ve CSS dosyaları, çağıran taramasından sonra silindi. Eski bölümün tarayıcı testi yerine bölümün yokluğunu, kaynak/fulfillment isteği yapılmamasını ve normal katalog kontrollerinin korunmasını doğrulayan test eklendi. Maske ekranındaki “Kaynağı katalogda kaydet” ve katalogdan kaynak yönetme yönlendirmesi kaldırıldı.

Bu karar **mevcut veri silme veya tüm tek kaynak backend modelini iptal etme** değildir. Kayıtlı profiller, kaynak fotoğrafları, maskeler, ticari bağlar, tasarımlar ve eski siparişin üç dosyası korunur. API ve SQL/TS/Dart sözleşmesi değiştirilmedi; normal katalog renk/medya/fiyat/stok ve web/Flutter satın alma davranışı değiştirilmedi. Yeni kaynak veya SKU tanımlamak için alternatif bir yönetim ekranı bu talep kapsamında eklenmedi.

Önceki KIS-TEK-03/04/09 ve TST-258…269 belgelerinde katalog kaynak formunu anlatan adımlar **önceki teslimlerin tarihsel kaydıdır**; artık mevcut ekran kullanım talimatı değildir. Özellikle TST-269'un başarılı kaynak yönetimi UI testi o tarihteki kaldırılan ekranı doğrular; bu değişikliğin kanıtı olarak kullanılmaz.

[TST-270 ve doğrulama](../../test/2026-11-10/TST-270-catalog-source-section-removal.md). Gerçek veri silme/geçişi, hosting/deploy/APK yok. Yerel geçici süperadmin yapılandırması ve dosyaları Git dışında kalır.
