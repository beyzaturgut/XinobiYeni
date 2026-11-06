# Sürat destek yanıtı — prova gönderisi yeniden test planı

06.11.2026: kullanıcı bu görüşmede sağlayıcı yanıtını paylaştı; e-postanın kendi gönderim tarihi belirtilmedi. Ham parola/alıcı kişisel verisi burada saklanmadı.

## Sağlayıcının netleştirdiği bilgiler

- İletilen referanslarla kayıt oluşmadığını ve hata alındığını belirtiyor; takipte bulunamama bu kayıtlar için oluşmama sonucuna bağlı.
- Görüşmede açıkça belirtilen referans: `XNB-a31c8aa818da430fa06790300fa6fe22`. Kullanıcı üç sipariş denediğini söylemişti; diğer kayıtların karşılığı/ref listesi ayrıca kontrol edilmeli. Bir e-postadan tüm veritabanı kayıtları otomatik güncellenmedi.
- Prova hesabı için tam JSON örneği verdi. Hesap bilgileri sunucu tarafındaki mevcut Shipping:Surat:Sandbox ayarlarından kullanılacak; kod/istemci/Git’e parola eklenmedi.
- Başarıyla oluşan gönderilerin sipariş kodları e-posta ile iletilirse prova kargolarına hareket ekleyebileceklerini belirtiyor. Sorgulama tek başına hareket oluşturmaz.

## İstek karşılaştırması ve düzeltme

Mevcut istemci Iademi=false, string BirimDesi/BirimKg, KargoTuru=3, TasimaSekli=1, TeslimSekli=1, GonderiSekli=0, Pazaryerimi=0 ve boş EntegrasyonFirmasi değerlerini zaten doğru gönderiyordu.

Destek örneğindeki boş SahisBirim, TelefonEv, TelefonIs, Email, AliciKodu, IrsaliyeSeriNo, IrsaliyeSiraNo, ReferansNo, KargoIcerigi, EkHizmetler, SevkAdresi ve TeslimSubeKodu alanları istekte yoktu. Bunlar açık boş string olarak eklendi. KapidanOdemeTahsilatTipi=0 ve KapidanOdemeTutari=null açıkça eklendi; kapıda tahsilat açılmadı. İstek artık örneğin tam alan kümesini kullanır.

Alıcı/adres/il/ilçe/telefon, OzelKargoTakipNo, koli sayısı, desi/kg ve ödeme sorumlusu gerçek test isteğinden gelir. Destekteki sabit örnek sipariş kodu koda alınmadı; başka kullanıcıların kullanmış olabileceği örnek kodla test yapılmaz. Paket desi/kg değeri 1’e zorlanmadı. BirimDesi/BirimKg ondalık ayıracı kültürden bağımsız noktadır.

Bu alan farklarının eski hatanın kesin nedeni olduğu kanıtlanmış değil; eski create yanıtı/ayrıntılı sağlayıcı hata kodu yok. Gerçek kabul sonrası doğrulama gerekir. Örnekteki telefon 10 hanelidir; sağlayıcının örneğiyle birebir test yapılacaksa verilen test alıcı biçimi esas alınır. Örnekten bütün telefonların zorunlu 10 hane olduğu kuralı türetilmedi; uygulamanın mevcut 5/05/905 doğrulaması değiştirilmedi.

## Operatörün uygulayacağı sıra

1. Admin sipariş detayında ilgili referansı doğrula. Ortam **TEST** olmalı. Sağlayıcının teyit ettiği sonuç: **Kayıt kesinlikle oluşmamış**. Kanıt alanına en fazla 500 karakter, tek satır özet yaz; parolayı/alıcı verisini koyma. Örnek kanıt: `Sürat Kargo destek yanıtında XNB-a31c8aa818da430fa06790300fa6fe22 referansıyla kayıt oluşmadığı ve hata alındığı teyit edildi.`
2. **Sağlayıcı teyidini kaydet** yalnız yerel mutabakat durumunu değiştirir; yeni gönderi oluşturmaz. Bu geliştirmede otomatik mutabakat yapılmadı. Sistemde already registered olan kayıt farklıdır; bu yanıtla zorla sıfırlanmaz.
3. Alıcı/adres ve koli bilgilerini kontrol et. Aynı sipariş kullanılacaksa mevcut alıcı snapshot’ı korunur. Sağlayıcının örnek alıcısıyla test isteniyorsa o bilgilerle ayrı, onaylı demo test siparişi hazırlanmalı; eski siparişin teslimat adresi gizlice değiştirilmemeli.
4. Formdaki paket/desi/kg ve kargo ücretini ödeyen alanlarını girip **Test ortamında gönderi oluştur** işlemini bir kez yap. Mevcut confirmed_not_created akışı aynı XNB referansını korur ve eski attempt geçmişini saklar. Otomatik resend/retry eklenmedi.
5. Gerçek create yanıtı **Tamam** veya **Kayıt Edildi** ise uygulama kayıt oluştu olarak gösterir. HTTP 200 tek başına yeterli değildir. Sonuç yine belirsizse yeniden basma; güvenli HTTP/kategori kaydıyla sağlayıcıya danış.
6. Başarıyla oluşan XNB kodunu Sürat’e iletip prova hareketi eklenmesini iste. Bu görüşmede bir e-posta gönderilmedi. Hareket eklendiği teyidinden sonra takip sorgusunu çalıştır, dönen gerçek statüleri kontrol et.
7. Etiket/Code128, normal takip ve müşteri gösterimini doğrula. Prova hareketi gerçek fiziksel teslim/şube/barkod kabulünü kapatmaz. Production oluşturma koruması, ödeme/sevk uygunluğu ve canlı kabul kapıları açık kalır.

## Doğrulama

[TST-262](../../test/2026-11-06/TST-262-surat-provider-support-example.md): tam alan kümesi/tür/değer, fixture kimliği/ref, ondalıklar ve tek çağrı kontrolü; 82 Sürat testi PASS. Gerçek gönderi oluşturulmadı veya sağlayıcıya mesaj gönderilmedi. Gerçek kabul/takip testi açık. Deployment yapılmadı.
