# TST-043 — Faz02 Chrome responsive görsel QA grubu 01

- Tarih: 2026-09-30
- Başlangıç commit: `1f399f4`
- Tarayıcı: Yerel Google Chrome, headless render

## Kapsam

- WEB-001 ana sayfa: 1440×1100 ve dar ekran render.
- WEB-002 katalog: dar ekran render.
- WEB-004 ürün detay: 1440×1100 render.
- WEB-020 global çerez paneli: masaüstü ve dar ekran görünümü.

## Bulgular ve düzeltmeler

- Katalog hero başlığında dar ekran taşma riski görüldü; sayfaya yatay taşma koruması, başlığa daha kontrollü responsive ölçü ve güvenli kelime kırılımı eklendi.
- Çerez paneli metin kolonuna grid içinde küçülebilme sınırı eklendi.
- 1440 px ana sayfa ve ürün detay yerleşimi görsel kontrolde taşma göstermedi.
- 500 px ana sayfa/katalog ve çerez paneli düzeltme sonrası taşmadan render edildi.

## Araç sınırlaması

macOS headless Chrome `--window-size=390` çıktısında görüntüyü 390 px üretirken layout viewport'u yaklaşık 500 px minimumda tuttu; bu nedenle sağ taraf kırpılmış göründü. Bu görüntü 390 px responsive kabul kanıtı sayılmadı. Gerçek cihaz veya device-emulation destekli tarayıcı testi açık bırakıldı.

## Otomatik kontroller

- ESLint başarılı.
- TypeScript başarılı.
- Next.js IIS static export başarılı; 23/23 rota üretildi.

## Deployment etkisi

Bu düzeltmeler daha önce hazırlanmış `XinobiYeni-web-14be3ea.zip` DEPLOY-002 paketine dahil değildir. Paket kendi kaynak commiti için geçerlidir; yeni değişiklikler sonraki açık deploy talebinde paketlenir.
