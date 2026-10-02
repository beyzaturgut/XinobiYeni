# TST-073 — Mobil çerez paneli ve XINOBI U banner yerleşimi

- Tarih: 02.10.2026
- Seviye: UI REGRESSION / RESPONSIVE / E2E / VISUAL
- Kapsam: Ana sayfanın 390 px ve 412 px mobil görünümü

## Düzeltilenler

- Çerez panelinin kapatma düğmesi mobilde yüzde 100 genişleyen aksiyon seçicisinden ayrıldı ve panelin sağ üst köşesine sabitlendi.
- Çerez aksiyonları tek sütunda eşit genişlikte düzenlendi; başlık için kapatma düğmesi boşluğu ayrıldı.
- Tercih seçeneklerinin mobil iç boşluğu daraltıldı ve yatay taşma önlendi.
- XINOBI U görseli mobilde `cover` ile kırpılmak yerine kendi `1942 / 809` oranında tam kadraj gösterildi.
- Sabit kırmızı tasarım butonu mobil banner ölçüsüne küçültülerek banner içinde konumlandırıldı.

## Doğrulama

- `pnpm --filter web lint`: başarılı.
- `pnpm --filter web build`: başarılı; 23/23 statik rota üretildi.
- `pnpm --filter web test:e2e`: başarılı; 43/43 test geçti.
- `node tools/test-mobile-consent-personalize.mjs`: başarılı.
  - 390 px ve 412 px görünümde kapatma düğmesi sağ üst sınır içinde.
  - Üç tercih seçeneği panel içinde ve yatay taşma yok.
  - XINOBI U banner oranı korunuyor, görsel `contain`, CTA banner sınırları içinde.
- Görsel kanıtlar:
  - `TST-073-cookie-mobile-390.png`
  - `TST-073-cookie-mobile-412.png`
  - `TST-073-home-mobile-390.png`
  - `TST-073-home-mobile-412.png`

## Yayın notu

Kullanıcının talimatı gereği bu değişiklik için deploy paketi hazırlanmadı ve canlı ortama gönderilmedi.

Durum: Başarılı.
