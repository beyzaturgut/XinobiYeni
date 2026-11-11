# TST-273 — Eksik maskenin admin ürün listesini kapatmasını düzeltme

11.11.2026. Canlı ekran kanıtı: güncel Ürün yüzeyi inceleme açılıyor, ancak “Kayıtlı maske dosyası bulunamadı.” bütün listeyi kesiyor. Kodda MaskDetail, her ürünün draft/approved dosyasını kontrol ederken tek mask_missing istisnasını liste isteğine taşıyordu. Sunucuda dosyanın niçin olmadığı (yanlış kök, aktarılmamış/silinmiş dosya, yedek) bu oturumda doğrulanmadı.

## Düzeltme

Yalnız mask_missing/mask_corrupt dosya doğrulama hataları ilgili üründe MaskIssues olarak dönüyor. Durum “Maske dosyası sorunu”; boş veya onaylı başarı sayılmıyor. Liste ve diğer ürünler açılıyor. Bozuk/eksik maske nesnesi kullanılabilir önizleme olarak verilmez. Kaynak sağlamsa indir/prompt/yeni WebP yükleme ve inceleyerek onaylama mümkün. Yeni maske açık onayla yayınlanır; eski referans/tarihçe/sipariş dosyaları silinmez. Genel servis/yetki/veri hataları bastırılmaz.

Müşteriye açık yayın ve dosya uçları eksik/bozuk onaylı maskede hata vermeyi sürdürür; başka ürün/renk maskesine dönmez. SQL şeması değişmedi. Gerçek sunucu dosyası taşınmadı veya onay verilmedi.

## Test

- Odaklı API 18/18 PASS: eksik onaylı maske + liste/diğer ürünlerin görünmesi + GET'in belgeyi değiştirmemesi + yeni maskeyle açık onay sonrası yayın + normal katalog ve eski maske referansı korunması. Bozuk maskede detay uyarısı, onay/yayın reddi korunuyor.
- Admin izole tarayıcı PASS: mevcut maske regresyonu, ayrıca 390/1440'ta eksik maske uyarısı, diğer ürünler, kaynak/prompt, onaysız buton kilidi, yeni dosya/yükleme/onay sonrası uyarının kalkması. Gerçek API hesabı/veri yazımı yok.
- Admin lint PASS (mevcut AuditHistory uyarısı), TS/Vite üretim derlemesi PASS.
- Tam API: 642 PASS / 30 SKIP / 0 FAIL.
- [390 px](TST-273-missing-mask-390.png), [1440 px](TST-273-missing-mask-1440.png). Sentetik fotoğraf/maske. Görsel inceleme yapıldı.

## Sunucu kontrolü ve gerçek kapanış

Storage:LocalRoot sunucudaki dış kalıcı dosya deposunu göstermeli; environment/IIS override da kontrol edilmeli. Yeni maskeler `<kök>/designs/files/surface-mask-{id}.png`, eski media maskeleri `<kök>/media/{id}.png` içindedir. SQL kayıtları tek başına dosyaları taşımaz. Release yerel özel tasarım/maske depolarını otomatik yayımlamaz. Önce yedek/önceki kalıcı depoda dosya aranmalı; rastgele dosya kopyalama/başka renk eşleme yapılmamalı. [Dosya deposu runbook](../../docs/runbooks/file-storage.md).

Kaynak da eksikse gerçek orijinal dosya doğrulanarak yedekten geri getirilmeli; yeni maskeyle eski sipariş eksikliği kapanmış sayılmaz. Yeni paket kurulmadan canlı liste düzeltmesi devreye girmez. Bu rapor sunucu dosyasının geri getirildiği veya IIS kurulumunun tamamlandığı anlamına gelmez.
