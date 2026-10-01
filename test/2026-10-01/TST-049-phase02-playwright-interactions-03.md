# TST-049 — Faz02 Playwright kritik etkileşim kapsamı 03

- Tarih: 2026-10-01
- Başlangıç commit: `c0ebaa1`
- Tarayıcı: Yerel Google Chrome, Playwright 1.55.1

## Yeni senaryolar

- Üyelik: giriş/yeni hesap sekmeleri, parola gösterme ve parola yenileme görünümü.
- Sipariş: ikinci demo siparişi seçme, ürün detayı ve kargo çizgisi güncellemesi.
- İade: işlem türü, neden ve açıklama ile demo özet hazırlama; gerçek gönderimin kapalı kalması.
- Teklif takibi: revizyon seçme, revizyon notu hazırlama ve gerçek onayın kapalı kalması.
- Gelişmiş editör: metin katmanı ekleme, görünürlük/kilit, ön-arka yüz ve demo taslak bildirimi.

Önceki sekiz senaryoyla toplam 13 kritik etkileşim testi çalışır.

## Koşular ve düzeltmeler

- Sandbox içindeki ilk deneme yerel `3010` portu açılamadığı için başlamadı; izinli yerel tarayıcı ortamında tekrarlandı.
- İlk tam tarayıcı koşusu 11/13: parola alanı ve sipariş liste/detay metni seçicileri belirsizdi.
- İkinci tam koşu 12/13: editör aracının erişilebilir adına görsel simge metni de katıldığı için seçici zaman aşımına uğradı.
- Editör senaryosu tekil tekrar: 1/1 başarılı.
- Final tam regresyon: `pnpm --filter web test:e2e` — 13/13 başarılı, 11.3 saniye.
- `pnpm --filter web lint` — başarılı.
- Sandbox build denemeleri `next/font/google` ağ isteği aşamasında çıktı vermeden bekledi ve kontrollü durduruldu. Üretilmiş eski `.next` önbelleği silinmeden `/tmp/Xinobi-web-next-stuck-20261001-1` altına taşındı.
- Ağ erişimli temiz `pnpm --filter web build` — başarılı; TypeScript geçti ve 23/23 statik rota üretildi.

## Açık kapsam

- Sistematik Tab/Shift+Tab odak sırası.
- Otomatik erişilebilirlik motoru taraması ve bulunan ihlallerin giderilmesi.
- Gerçek cihaz, API ve sağlayıcı entegrasyonları.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
