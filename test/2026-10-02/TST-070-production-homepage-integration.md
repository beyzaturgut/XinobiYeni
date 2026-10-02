# TST-070 — Onaylı ana sayfanın gerçek web uygulamasına aktarılması

- Tarih: 02.10.2026
- Seviye: BUILD / E2E / ACCESSIBILITY / RESPONSIVE / VISUAL
- Kapsam: Next.js `/` rotası ve 23 rotalık web regresyonu

## Aktarılan yapı

- Üç görselli otomatik ve nokta kontrollü ana slider
- Ürünler / Kategoriler / Xinobi Dünyası headerı ve üç hızlı işlem ikonu
- Sabit görselli, sabit CTA’lı XINOBI U bannerı
- Beş kartlı yatay kategori alanı
- Eşit medya yüksekliği ve taban çizgisine sahip üç öne çıkan ürün
- Xinobi değerleri, hikâye ve footer
- Ortak robot sembollü Nobi tetikleyicisi ve açılır panel

## Koşular

1. İlk tam E2E: ana sayfada iki bulgu verdi; Nobi buton adı eksikti ve kırmızı CTA kontrastı `4.25` idi.
2. Nobi’ye `aria-label` eklendi, CTA kırmızısı erişilebilir tona koyulaştırıldı.
3. Final lint: başarılı.
4. Final Next.js static export: 23/23 rota başarılı.
5. Final Playwright: 43/43 test başarılı.
6. Statik `out` üzerinde özel Chrome testi: üç slider, beş kategori, ürün hizası, Nobi paneli ve masaüstü/mobil taşma kontrolü başarılı.

## Görsel kanıt

- `TST-070-production-home-desktop.png`
- `TST-070-production-home-mobile.png`

Durum: Başarılı.
