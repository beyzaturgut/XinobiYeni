# TST-250 | Sürat güncel Swagger sözleşmesi incelemesi

05.11.2026. Kullanıcının gerçek prova gönderimi belirsiz, takip sorgusu HTTP200 / Sipariş bulunamadı. Önceki gönderim yeniden yapılmadı; kayıt veya uzlaştırma değiştirilmedi. Deploy yok.

## Bulgu

Kimlik bilgisi göndermeden https://api02.suratkargo.com.tr/swagger/v2/swagger.json indirildi. Belge OpenAPI components/schemas kullanıyor. POST /api/GonderiyiKargoyaGonder, OrtakBarkodOlusturParam gövdesi üzerinden KullaniciAdi/Sifre/Gonderi alıyor. GonderiModel Iademi boolean, BirimDesi ve BirimKg string, OdemeTipi integer. Mevcut kod Iademi=0 ve ölçüleri JSON number gönderiyordu. Bu somut sözleşme uyumsuzluğudur; sağlayıcının bağlayıcısında reddedilmesi mümkündür. Eski ham yanıt/HTTP durum bilgisi saklanmadığından önceki başarısızlığın kesin nedeni kanıtlanamaz. Swagger 200 yanıtını binary string olarak belgeliyor; açık kabul metinleri halen e-posta/PDF temelli.

## Düzeltme

Yalnız outbound request projeksiyonu güncellendi: Iademi=false, ölçüler InvariantCulture metin. Kalıcı domain modeli ve admin/public DTO aynı kaldı; eski kayıtlar dönüştürülmedi. URL, root/alan isimleri ve mağaza kanal değerleri doğru. İsteğe bağlı alanların atlanması şemaya aykırı değil. COD/pazaryeri/iade oluşturma açılmadı. Registered kabulü genişletilmedi, belirsiz kayıt kilidi ve otomatik retry engeli korundu.

## Kanıt ve sınır

- Sürat odaklı izole paket: 75 PASS / 0 SKIP / 0 FAIL. Gerçek sağlayıcıya yazma yok.
- Testler gerçek serialize edilen JSON içindeki boolean/string türlerini ve kesirli 3.5 / 2.25 değerlerini kontrol eder.
- git diff --check geçti.
- Eski create sonucunda HTTP status/hata sınıfı/sağlayıcı hata kodu saklanmaması halen teşhis kısıtıdır. Eski sonuca bunlar geriye dönük uydurulamaz.
- Kullanıcının Swagger takip sonucu kayıt varlığı/yokluğu kanıtı değildir; fiziksel kabul öncesi takip boş olabilir.
- Sonraki adım: mevcut referansın Sürat'te kayıt kontrolü; kanıtlı yokluk teyidi olmadan yeni POST yapılmaz. Onay sonrası güncel kodla kontrollü aynı-ref deneme ayrıca yürütülür. Çalışan yerel API yeni kodu kullanmak için yeniden başlatılmalıdır.
- Tam API, gerçek IIS/SQL çoklu süreç ve fiziksel kabul bu incelemede çalıştırılmadı.

Swagger SHA256: 0789bc608bfda74fc3c9998fdca6b8d709271f4808a4b6d235c68913ce63292c
