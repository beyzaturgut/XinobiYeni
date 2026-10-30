# WEB-07 - Duyarlı tasarım ve erişilebilirlik kusurlarını kapat

30.10.2026, başlangıç `main / c1ba427`.

**Durum: Teknik düzeltmeler ve tarayıcı/klavye doğrulaması tamamlandı; gerçek cihaz/ekran okuyucu ve QA-03 kabulü açık.**

Katalog ve arama odak çizgileri, mobil menü Escape, duyuru/Nobi odağı, giriş penceresinde Tab döngüsü ve odak dönüşü, ödeme düğmesi kontrastı ve 200% metindeki yerleşim taşmaları düzeltildi. Nobi konuşması adlandırılmış canlı günlük olarak sunulur. Normal ve büyütülmüş metinde kontrollere erişim korunur; taşmalar gizlenmez.

13 güncel kritik sayfa, 320/390/768/1440 px'de 52 rota/boyut kontrolü; mevcut erişilebilirlik paketi ve yeni klavye senaryoları toplam 27 benzersiz test; gerçek yerel public katalogda 15 ek axe taraması. Son odaklı tekrarlar başarılı; ilk başarısızlıklar test raporunda korunur. Lint, TypeScript ve 38 sayfalık statik üretim derlemesi başarılı.

[Denetim ve manuel kabul matrisi](../../design/a11y-audit.md), [TST-150...156](../../test/2026-10-30/TST-150-web07-accessibility.md).

## Açık kabul işleri

- WEB-07-UAT-01: Safari/macOS + VoiceOver ile etiket, başlık, hata, canlı durum ve odak duyurularını dinleyerek doğrula.
- WEB-07-UAT-02: Gerçek iOS/Android cihazda VoiceOver/TalkBack, sanal klavye, büyük metin, yön değişimi ve kritik akışları doğrula.
- WEB-07-UAT-03: Gerçek tarayıcı zoom/işletim sistemi metin ölçeği ve Creative/UX/handoff kabulünü QA-03'e bağla.

Bu üç iş kişi/tarih/kanıt olmadan kapanmaz. Otomatik axe sonucundan ekran okuyucu başarısı türetilmez. API sözleşmesi, ticaret/ödeme sağlayıcısı, katalog verisi, mobil uygulama, hosting veya yayın değişmedi. WEB-02'de kullanıcının açık bıraktığı ürün içeriği ve fiyat işi korunur.
