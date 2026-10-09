# TST-108 — SQL dışındaki web regresyonlarının giderilmesi

- Tarih: 09.10.2026, Europe/Istanbul.
- Kapsam: TST-092’deki 19 başarısız web testi; güncel tüm web paketi.
- Ortam: Chrome headless, Playwright 1.55.1, ayrı 3010 statik web / 5023 development API.
- Kontrast ve satın alma düğmesi CSS düzeltmesi: `dfcdfe5`.

## Sonuç

`npm run test:e2e -- --timeout=15000 --output=/tmp/xinobi-web-green-results --reporter=json`:

**107 başarılı / 0 başarısız / 0 atlanan / 0 flaky**, süre 96,1 saniye (test kısmı). Başlatıcı web build’ini önce tamamladı. Web build/TypeScript ve tam ESLint başarılı.

Ham birleşik build/test çıktısı: `/tmp/xinobi-web-green.log`. Ekran görüntüleri ve izler `/tmp/xinobi-web-green-results`; Git’e eklenmedi.

## Ürün düzeltmeleri

- Ana sayfa kişiselleştirme düğmesinde beyaz yazı için kırmızı ton koyulaştırıldı. Küçük kahverengi başlıklar ve değer kartı numaraları okunaklı tonlara taşındı.
- Yasal sayfasındaki beyaz zeminde açık gri hak açıklamaları ve teklif takibinin aktif düğmeleri koyulaştırıldı.
- Ürün detayındaki genel `.actions button` kuralı içteki gerçek Sepete ekle düğmesini açık gri ve pasif imleçle gösteriyordu. Kural doğrudan çocuk demo düğmeleriyle sınırlandı; satın alma düğmesinin kendi stili korunur.
- Tam koşuda 320/390/768 genişliklerinde 34 px arama dokunma alanı bulundu. Aramanın tıklama yüksekliği 44 px yapıldı, görünen beyaz şerit 34 px kaldı. Menü dokunma genişliği 44 px oldu; 16 px simgenin konumu korundu.
- Taranan 20 rotada WCAG etiketli Axe taramasının critical/serious ihlali kalmadı. Testlerin ihlal filtresi ve 44 px dokunma beklentisi zayıflatılmadı.

TST-092’nin asistan/Xinobi dünyası kontrast bulguları güncel koşuda yeniden çıkmadı; bu sayfalara gereksiz CSS değişikliği yapılmadı.

## Test düzeltmeleri

Eski demo metinlerini arayan testler, güncel hesap/teklif/sipariş/Nobi akışlarına geçirildi. Kontroller sepet adedi ve yenilemede kalıcılık, dört ürün karşılaştırma sınırı, e-posta doğrulamasıyla kayıt, profil/adres kaydı, teklif ürün/adet/kişiselleştirme isteği, teklif mesajı/kabulü, teslimat takibi, seçilen adetle iade, başarısız ödeme senaryosunda sipariş oluşmaması ve tekrarında sepetin temizlenmesini doğrular.

`fixtures.ts` bu akışların API isteklerini tarayıcıda sahte verilerle yanıtlar. Gerçek hesaba, posta kutusuna, SQL’e veya AI/SMS/ödeme sağlayıcısına yazı yapılmaz. Testler gerçek ödeme ya da e-posta tesliminin çalıştığını kanıtlamaz. Development yüzey testleri gerçek salt okunur referans köprüsünü ve renderer/piksel korumalarını ayrıca sınar.

`test:e2e` başlatıcısı webi katalog/tasarım/doğrulama için aynı kökenli test adresleriyle yeniden derler. Böylece önceki statik export’un eksik API ayarları sonucu etkilemez. Ekran görüntüleri artık ortamda bulunmayabilen `TEMP` yerine Playwright `testInfo.outputPath` altına kaydedilir. Tekrar çalışma koşulları `apps/web/tests/README.md` dosyasında.

## Kapsam sınırı

İlk eski paket koşusu uzun süren kaldırılmış kontrol beklentilerini gösterdi ve durduruldu; o kısmi koşu tam baseline sonucu olarak kullanılmadı. Güncel akış/erişilebilirlik odaklı koşu önce 39/40; kalan iade seçim alanı sorgusu düzeltildi. Tam paket 104/107 ile üç gerçek dokunma alanı hatası buldu; ürün düzeltmesinden sonra son tam paket 107/107 geçti.

SQL bağlantısı, migration veya sunucu güvenlik duvarı değiştirilmedi. Gerçek sanal POS/fatura/sağlayıcı ve hukuk kararları bu işten bağımsız olarak açık kalır.
