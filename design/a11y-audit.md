# Web erişilebilirlik denetimi - 30.10.2026

WEB-07 kapsamında yerel teknik denetim. Başlangıç `main / c1ba427`; uygulama ve kanıtlar bu belgenin bulunduğu commit'tedir. **Otomatik/klavye teknik kontrolleri tamamlandı; gerçek ekran okuyucu ve fiziksel cihaz kabulü bekliyor.** Bu belge tüm WCAG ölçütleri için uygunluk sertifikası değildir; tasarım/handoff için Creative/UX onayı verilmez.

## Kapsam ve yöntem

- 19 mevcut rota + üyelik/ödeme klavye testleri korunur.
- Güncel, giriş yapılmış fixture ile 13 kritik rota: ana sayfa, katalog, arama, ürün detayı, karşılaştırma, sepet, ödeme, hesap, adresler, siparişler, Tasarımlarım, kurumsal teklif, XINOBI U yöntem seçimi.
- 320/390/768/1440 x 900 px'de normal görünümde axe `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`; critical/serious bulgular kapanış kapısıdır. Dört boyutta 52 rota/boyut birleşimi.
- Sabit px yazılar da büyüsün diye her HTML öğesinin hesaplanmış font boyutu iki katına çıkarılır. Sayfa yatay taşması, üst menü kontrollerinin ekran dışında kalması ve arama yazısının komşu kontrollere taşması denetlenir. Bu yöntem gerçek tarayıcı zoom veya işletim sistemi Dynamic Type kabulü yerine geçmez.
- Tab/Shift+Tab, Enter, Escape; görünür odak, modal döngüsü, açma/kapama odağı, adlandırılmış konuşma günlüğü ve hata `role=alert` sözleşmesi testlidir. Nobi modal değildir; sayfadan ayrılmayı engelleyen odak tuzağı eklenmedi.
- Gerçek public katalogla beş sayfanın üç boyutta ayrıca 15 axe taraması: kritik/ciddi bulgu yok. Hesap ve iş verisi mutasyonları engellendi; fiziksel cihaz kullanılmadı.

## Kapatılan kusurlar

| Alan | Düzeltme |
|---|---|
| Katalog/arama/hesap alanları | Kaldırılmış odak çizgileri geri getirildi; genel odak rengi yüksek kontrastlı mavi; sabit kontroller için odak kaydırma payı. |
| Mobil menü ve duyuru | Escape menüyü kapatıp summary'ye döner. Duyuru açılınca kapatma kontrolü odaklanır, kapanınca açan düğmeye döner. Kategori menüsünde klavye odağı varken yalnız mouse leave yüzünden içerik gizlenmez. |
| Nobi | Açılışta mesaj alanına odak, kapatma/Escape sonrası açan düğmeye dönüş; Escape yalnız ilgili panel/launcher odağında işlenir. Konuşma akışı `role=log`, ad ve live/relevant bilgisi taşır. |
| Giriş penceresi | Tab/Shift+Tab görünür ve etkin kontroller arasında döner; Escape/kapama önceki kontrole döner. React geliştirme effect tekrarı sırasında gecikmiş close olayı açık pencereyi yanlışlıkla kapatmaz. |
| Ödeme | Etkin sipariş düğmesinin beyaz zeminindeki soluk yazısı koyulaştırıldı; ödeme davranışı veya sağlayıcı değiştirilmedi. |
| Büyük metin | Üst navigasyon sarmalanır; dar aramada erişilebilir isim korunarak ikon gösterilir. Karşılaştırma inputu, değerlendirme başlığı/form/yıldızlar, hesap formları, alt menüler, sipariş kartları, Tasarımlarım başlığı ve sepet özeti küçülebilir/sarmalanabilir. Taşma overflow-x:hidden ile gizlenmedi. |

## Kabul matrisi

| Kontrol | Kanıt / durum |
|---|---|
| Chrome otomatik ve klavye | Teknik PASS; toplam 27 benzersiz test senaryosu son odaklı tekrarlarla doğrulandı. |
| Büyük metin / duyarlı yerleşim | Dört boyutta 13 rota, 52 birleşim PASS; PNG incelemesi yapıldı. |
| Gerçek yerel public katalog | Beş rota x üç boyut, 15 otomatik tarama PASS; müşteri hesabı kabulü değildir. |
| Safari + macOS VoiceOver | BEKLİYOR: başlık/landmark gezinmesi, form etiketleri, hata ve durum seslendirmesi, modal/menü odağı, Nobi yeni mesaj duyurusu gerçek okuyucuyla dinlenecek. |
| iPhone/iPad Safari + VoiceOver | BEKLİYOR: dokunma gezinmesi, metin büyütme, yatay/dikey yön, sanal klavye, kaydırma ve sabit kontroller. |
| Android Chrome + TalkBack | BEKLİYOR: aynı kritik alışveriş/editör akışları, yazı büyütme ve dokunma sırası. |
| Gerçek zoom / işletim sistemi metin ölçeği | BEKLİYOR: cihaz/tarayıcı kombinasyonları ve 200% zoom ayrı kaydedilecek. |
| QA-03 tasarım/handoff/iş sahibi kabulü | BEKLİYOR; test başarısı insan imzası yerine geçmez. |

Manuel kabul kaydı cihaz/OS, tarayıcı/okuyucu sürümü, kaynak sürümü, senaryo, sonuç, kanıt, kusur ID, kontrol eden kişi ve tarih içermeli. Bulunan kusurlar WEB-07 altında yeniden açılmalı.

Tekrar komutu: `pnpm --filter web exec playwright test --config tests/playwright.web07.config.ts` (önce mevcut yerel web/API açık olmalı). Test kaydı: [TST-150...156](../test/2026-10-30/TST-150-web07-accessibility.md).
