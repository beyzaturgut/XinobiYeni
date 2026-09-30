# TST-019 — Faz02 WEB-002 ürün kataloğu

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `c3faa18`
- Faz/görev: Faz02 / WEB-002 kategori ve ürün listeleme
- Seviye: STATIC / BUILD / SMOKE / INTERACTION CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP
- Çalıştıran: Codex

## Amaç

Demo ürünlerle kategori/liste rotasını; arama, kategori filtresi, sıralama, sonuç/boş durum sözleşmesi, responsive grid, metadata ve production render açısından doğrulamak.

## Uygulanan kapsam

- `/urunler` rotası ve sayfaya özgü SEO metadata.
- 10 demo ürün varyantı; kategori, aile, renk ve görsel alanları.
- Türkçe locale ile ürün/kategori/renk araması.
- `Tümü`, `Çay`, `Kahve`, `Hava`, `Pişirme` filtreleri.
- Öne çıkanlar ve ürün adına göre sıralama.
- Sonuç sayacı, boş sonuç ve filtre temizleme eylemi.
- Ana sayfa ürün CTA ve navigasyonunun `/urunler` rotasına bağlanması.

## Komutlar

```text
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/urunler
```

## Gerçek sonuç

- Durum: BAŞARILI; gerçek tarayıcı etkileşim/görsel QA açık.
- ESLint: başarılı.
- Production build ve TypeScript: başarılı.
- Statik sayfa üretimi: 5/5; `/` ve `/urunler` statik prerender.
- `/urunler`: HTTP 200, Next.js cache `HIT`.
- Türkçe sayfa başlığı, ana H1, arama placeholder'ı ve 10 ürün varyantı doğrulandı.
- İlk birleşik smoke deseni `10 ürün varyantı` metnini React'in aradaki hydration yorum düğümü nedeniyle bulamadı; ayrı desen gerçek HTML'de `10<!-- --> ürün varyantı` değerini doğruladı. Uygulama hatası yoktu.

## Güvenlik ve veri doğruluğu

- Demo ürünler `Demo` rozetiyle işaretlendi.
- Gerçek fiyat/stok değeri uydurulmadı; `Fiyat bilgisi yakında` kullanıldı.
- D02 ve gerçek API gelmeden filtreler yalnız yerel demo veriyle çalışır; gerçek katalog kabulü değildir.

## Açık testler

- Arama, filtre, sıralama ve filtre temizleme eylemleri gerçek tarayıcıda klavye/dokunma ile doğrulanmalı.
- 390 px telefon, tablet ve masaüstü grid/kırpma piksel QA'sı yapılmalı.
- API bağlandığında fiyat/stok ve varyant kimliği sözleşme testleri eklenmeli.

## Sonraki adım

WEB-002 tarayıcı QA sonrası WEB-004 ürün detay/varyant ekranına geçilebilir. D02 gelene kadar fiyat/stok davranışı kesin kabul edilmez.
