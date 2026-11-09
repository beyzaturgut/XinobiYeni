# TST-264 — KIS-TEK-07 web tek kaynak geçişi

09.11.2026 · Yalnız web uygulaması. Gerçek veri yazımı, AI üretimi veya deploy yok.

## Ekran bazlı matris

| Ekran/akış | Kontrol | Düzeltme / kalan sınır |
|---|---|---|
| XINOBI U katalog | Kontrol edildi / düzeltildi | Ürün bazlı onaylı fotoğraf, renk/swatches yok; kaynak eksik/hata/yükleniyor ayrımı |
| Normal ürün detayı | Kontrol edildi / düzeltildi | Kişiselleştirme girişi renk bağımsız; normal renk, galeri ve alışveriş kontrolleri korunur |
| Eski /renk yöntemi | Kontrol edildi / düzeltildi | Eski ürün/variant bağlantısı açılır; yeni akış renk istemez, yöntem seçiminden ürünle devam eder |
| Görsel/desen yükleme | Kontrol edildi / düzeltildi | #onizleme geri/ileri, mod ve dosya korunumu; 503 tekrar deneme; eksik ürün/yüzey; başka kaynağa fallback yok |
| Önizleme/yerleşim | Kontrol edildi / düzeltildi | Renk seçicisi yok; yatay/dikey/kare ve büyük kaynak; gerçek koordinatlar, geri al/yinele, zoom |
| AI soru/sonuç | Kontrol edildi / düzeltildi | Renk seçmeden oturum isteği; onaylı ürün fotoğrafı; açık önizleme eylemi; aynı oturuma dönüş; başka ürünün session'ı reddedilir |
| Geçmiş açık varyant editörü | Kontrol edildi | Kendi tarihsel 1066×1600 kaynağını okumaya devam eder; yeni ürün yüzeyine otomatik taşınmaz |
| Kayıtlı tasarım / sepet / checkout | Açık (KIS-TEK-09) | Yeni yüzeyin ticari SKU ve revizyon doğrulaması gerekir; yeni önizlemede kayıt/sepete gönderim kapalı ve nedeni yazılı |

## Test sonuçları

- Web `tsc --noEmit`, ESLint ve Next 16.3.6 üretim derlemesi PASS. Yerel Next Link dokümanı okundu. API/admin/Flutter kaynakları değiştirilmedi.
- **16/16 odaklı izole Chrome senaryosu PASS.** `tests/single-source.config.ts`; API süreci yok, bilinmeyen API/dış host istekleri engelli. Oturum yenilemesi ve AI session cevapları fixture'dır; gerçek gönderim yok.
- 320,390,768,1440 px; yatay 317×213, dikey 213×317, kare 257×257; 5001×4000 kaynakta gerçek x/y kontrol aralığı ve <=2 MP geçici canvas; ekran boyutu değişiminde yerleşim değeri sabit.
- Dosya hazırlama, geri/ileri, undo/redo, 404≠503, tekrar denemede dosyayı koruma, bozuk medya, yanlış ürün sözleşmesi, güncel kaynak sürümünü yeniden okuma, boş katalog, eksik kimlik ve AI sonucu/yanlış ürün senaryoları PASS.
- Gerçek hesaplanan yazı boyutları %200'e çıkarıldı; klavye yöntemi ve main kapsamlı axe (kontrast dahil) 0 ihlal. Gerçek ekran okuyucu/cihaz kabulü değildir.
- Görsel incelemede %200 metinde Alanı doldur düğmesi alttaki satıra taşıyordu. Düğme/link yükseklikleri metne göre büyüyecek şekilde düzeltildi; kontrol yüksekliği regresyonu eklendi. Son 16 paket ve odaklı görsel test PASS.
- Çerez paneli ilk yöntemde ve yerleşimde ayrı kapanabiliyor; ekran kanıtı panel kapalıyken yeniden alındı. Kapanış kaydı prototip hukuk tercihini kalıcı çerez kabulü saymaz.
- İlk koşudaki 5 başarısızlık fixture'ın `/auth/web/refresh` isteğini de tasarım yazımı saymasıydı; filtre düzeltildi. Sonuç testinde Next route announcer ile aynı alert seçiliyordu; seçici main içine daraltıldı. Son AI geri dönüş testi ayrıca 1/1 PASS.

## Görsel kanıt

Bunlar gerçek ürün değil, yalnız izolasyon için oluşturulmuş gri ürün kaynağı + örnek desen fixture'ıdır. %200 metinde masaüstü ve mobil görseller render edilip görsel olarak incelendi.

- [Masaüstü](screenshots/task07-web-200-desktop.png)
- [Mobil](screenshots/task07-web-200-mobile.png)

## Açık işler ve kapanış koşulları

- KIS-TEK-08 native Flutter eşliği: Dart/native ekran ve Android/iOS ayrı kabul.
- KIS-TEK-09 kayıt/sepet: açık ticari SKU/fiyat/stok eşlemesi ve yeni kaynak/revizyon doğrulaması sunucuda tamamlanınca yeni yüzey için kayıt/sepete ekleme açılır. Eski ilk fotoğraflı varyant AI fallback'i de 09 kapsamında.
- Gerçek katalog kaynağı/onayı ve veri geçişi: işletme kaynak seçimi, dosya/hash ve yedek/restore kabulü gerekir; otomatik seçim yapılmadı.
- KIS-TEK-10 sipariş dosyaları, 11 tarihsel belge/araç/eski renk varsayımlı e2e temizliği, 12 tüm zincir regresyonu açık. Tüm web E2E, IIS, SQL çoklu süreç, VoiceOver/TalkBack veya gerçek cihaz kabulü iddia edilmez.

[Operatör rehberi ve sınırlar](../../docs/runbooks/single-source-web.md).
