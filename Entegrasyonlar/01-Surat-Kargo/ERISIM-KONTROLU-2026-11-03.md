# Sürat Kargo test erişim kontrolü

## Güncel sonuç: .NET test takip erişimi HTTP 200

Ön kontrolde .NET istemcisi ve test hesabıyla gerçek olmayan kontrol referansı sorgulandı. HTTP 200, IsError=true, tam `Sipariş bulunamadı.` ve boş Gonderiler alındı. Bu dar yanıt artık adaptörde şube kabulü/hareket bekleniyor olarak ayrılıyor; kayıt yokluğu veya gerçek gönderi kabulü kanıtı değildir. Önceki 403, farklı istemcinin tarihsel sonucudur; genel bir IP/hesap engeli olduğu sonucu çıkarılmaz. Ana adresler .NET ile 302 yönlendirdi; bu da takip metodunun erişilemediğini göstermiyor.

[Sansürlenmiş JSON](erisim-on-kontrol-2026-11-03.json), [sunucuda ön kontrol komutu](ON-KONTROL.md). Asıl IIS sunucusu üzerinde egress/erişim kabulü henüz yapılmadı.

## İlk kontrol (tarihsel)

03.11.2026. Sağlayıcının e-postada verdiği **test hesabıyla** tek, salt okunur takip sorgusu yapıldı.

- Hedef: `https://api02.suratkargo.com.tr/api/KargoTakipHareketDetayi`
- Yöntem: sözleşmedeki POST/query takip sorgusu; gerçek siparişle ilişkisiz, rastgele `XNB-ACCESS-CHECK-...` referansı.
- Sonuç: **HTTP 403**. Gönderi oluşturma/silme/geri çekme yapılmadı. Canlı hesaba istek yapılmadı.
- Kullanıcı adı/parola belgelere, komut argümanlarına veya çıktıya yazılmadı; özgün yerel RTF'den bellekte okundu. Yeni ortam ayarı veya secret dosyası oluşturulmadı.
- Bu kontrol HTTP erişim denemesidir; uygulamanın tüm sağlayıcı kabulü, hesap parolasının geçersizliği veya gönderi yetkisinin yokluğu kanıtı değildir. 403'ün kesin nedeni yanıt durumundan çıkarılamaz.

## Sağlayıcıdan istenecek teyit

RE-14057 kapsamında test `KargoTakipHareketDetayi` isteği 403 dönüyor. Test hesabının takip erişimi, isteğin sunucu/IP güvenlik kuralları ve gerekiyorsa yurt dışı dışa çıkış IP whitelist'i kontrol edilmeli. Kalıcı çalışacak API/worker sunucusunun gerçek NAT/egress IP'si ayrıca belirlenmeli; geliştirici bilgisayarındaki bu deneme sunucu whitelist kabulü sayılmaz.

Özgün e-posta canlı cari için takip yetkisi bildiriyor; bu, test hesabının erişiminin veya oluşturma yetkisinin doğrulandığı anlamına gelmez. Sorun kapandıktan sonra izinli sandbox gönderi/etiket/şube kabul/takip doğrulaması ayrı yapılır. Canlı pilot ödeme/operasyon uygunluğu ve etiket kabulünden sonra açılır.
