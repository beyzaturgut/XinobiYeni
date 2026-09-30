# TST-023 — Faz02 WEB-003 arama ve karşılaştırma

- Tarih: 2026-09-30
- Commit/branch: `main` / `039ee41` sonrası çalışma ağacı
- Faz/görev: Faz02 / WEB-003
- Seviye: STATIC / BUILD / SMOKE / INTERACTION CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP

## Amaç ve kapsam

`/arama` rotasındaki canlı ürün araması, hızlı terimler, boş durum, en fazla üç ürün seçimi ve erişilebilir karşılaştırma tablosunu; D02/API olmadan ticari veri uydurulmadığını doğrulamak.

## Komutlar ve sonuç

```text
rg -n "navActions" apps/web/src/app/page.module.css
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/arama
```

- İlk birleşik komut: BAŞARISIZ; çalışma dizini zaten `apps/web` iken yol tekrar `apps/web/...` verildi. Uygulama testi başlamadı.
- Düzeltilmiş göreli yol sonrası lint: BAŞARILI.
- TypeScript ve production build: BAŞARILI; 9/9 statik sayfa üretildi.
- `/arama` HTTP 200, metadata, arama ve karşılaştırma metinleri: BAŞARILI.

## Güvenli sınırlar ve açık testler

- Fiyat/stok alanı `D02/API bekleniyor` durumundadır.
- Hazır olmayan ürün detayları bağlantı gibi sunulmaz.
- Seçim sınırı butonun devre dışı durumu ve açıklamasıyla görünürdür.
- Gerçek tarayıcıda klavye, dokunma, ekran okuyucu ve responsive tablo QA açıktır.
- Faz04 API sonrasında arama indeksi, ürün kimliği ve güncel özellik verisi bağlanmalıdır.

## Sonraki adım

WEB-007 favoriler kabuğu; gerçek üyelik ve kalıcı kayıt Faz03/04 API'leri gelene kadar demo/yerel durumla açıkça ayrılır.
