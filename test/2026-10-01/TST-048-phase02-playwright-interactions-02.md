# TST-048 — Faz02 Playwright kritik etkileşim kapsamı 02

- Tarih: 2026-10-01
- Başlangıç commit: `f466595`
- Tarayıcı: Yerel Google Chrome, Playwright 1.55.1

## Yeni senaryolar

- Sepet: adedi artır, ürün sayısını doğrula, ürünü kaldır, boş durumu ve kapalı checkout'u doğrula.
- Hesap: profili düzenle, oturum içi geri bildirimi gör; adres sekmesine geç, yeni adres formunu aç ve kayıtsız geri bildirimi doğrula.
- Kurumsal teklif: kahve ürününü, 50 adedi ve kişiselleştirmeyi seç; özet geri bildirimini ve kapalı gerçek gönderimi doğrula.
- AI tasarım: minimum istem sınırı, tema, alternatif üretimi, seçim, hata durumu ve boş ekrana dönüş.
- Satış asistanı: kahve konusu, ürün önerisi, demo mesaj bildirimi, konuşmayı temizleme ve kapalı canlı destek.

Önceki üç senaryoyla toplam sekiz test çalışır.

## Koşular

- İlk genişletilmiş koşu: 7/8 başarılı. AI alanında `aside` ve `textarea` aynı erişilebilir isimle eşleştiği için test seçicisi strict mode'da belirsiz kaldı.
- Seçici `textbox` rolüyle daraltıldı; uygulama davranışı değişmedi.
- Final koşu: 8/8 başarılı, 7.8 saniye.
- ESLint ilk koşu öncesinde başarılı.

## Açık kapsam

- Üyelik form sekmeleri/parola görünürlüğü, sipariş seçimi, iade, teklif takibi ve gelişmiş editör araçları.
- Sistematik Tab/Shift+Tab odak sırası ve erişilebilirlik motoru taraması.
- API bağlantıları sonrası gerçek veri ve hata durumları.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
