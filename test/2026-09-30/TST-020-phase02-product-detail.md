# TST-020 — Faz02 WEB-004 ürün detay ve varyant ekranı

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `af74060`
- Faz/görev: Faz02 / WEB-004 ürün detay-varyant
- Seviye: STATIC / BUILD / SMOKE / INTERACTION CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP
- Çalıştıran: Codex

## Amaç

Çay Makinesi 101 için ürün detay kabuğunu; dört renk varyantı, görsel eşleme, veri bekleme durumları, kişiselleştirme bağımlılığı, metadata ve production render açısından doğrulamak.

## Uygulanan kapsam

- `/urunler/cay-makinesi-101` statik ürün detay rotası.
- Lacivert, gümüş gri, kırmızı ve rose gold erişilebilir varyant düğmeleri.
- Seçilen varyanta göre gerçek demo ürün görseli ve alt metin değişimi.
- Fiyat/stok için D02 bekleme durumu; satın alma düğmesi devre dışı.
- D04 üretim kararına bağlı Xinobi Studio placeholder'ı.
- Özellik kartları ve katalog breadcrumb/navigation bağlantıları.

## Komutlar

```text
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/urunler/cay-makinesi-101
```

## Gerçek sonuç

- Durum: BAŞARILI; gerçek tarayıcı interaction/piksel QA açık.
- ESLint, TypeScript ve production build başarılı.
- Statik üretim: 6/6; `/urunler/cay-makinesi-101` statik prerender edildi.
- Ürün detay route'u HTTP 200 ve Next.js cache `HIT`.
- Metadata başlığı `Çay Makinesi 101 | Xinobi` doğrulandı.
- Dört `rengini seç` erişilebilir adı, `Ürün verisi bekleniyor` ve `Satış bilgisi hazırlanıyor` durumları HTML'de doğrulandı.

## Veri doğruluğu ve erişilebilirlik

- Gerçek fiyat/stok değeri veya teslimat vaadi üretilmedi.
- Stok/fiyat olmadan satın alma eylemi `disabled` ve açıklama metniyle sunuldu.
- Varyant düğmeleri `aria-pressed`, açıklayıcı `aria-label` ve klavye ile çalışabilir doğal button semantiği kullanır.
- Görsel alt metni seçilen renk ile değişir; renk yalnız swatch ile değil metinle de gösterilir.
- `prefers-reduced-motion` durumunda varyant görsel animasyonu kapatılır.

## Açık testler

- Dört varyant seçimi gerçek tarayıcıda klavye ve dokunma ile doğrulanmalı.
- Telefon/tablet/masaüstü görsel kırpma ve layout QA yapılmalı.
- D02 sonrası varyant ID, fiyat ve stok; D03 sonrası sepete ekleme entegrasyon testleri eklenmeli.
- D04 sonrası gerçek baskı alanı ve kişiselleştirme kabulü yapılmalı.

## Sonraki adım

WEB-004 tarayıcı QA ile birlikte WEB-005 basit kişiselleştirme akışının D04'ten bağımsız görsel/etkileşim kabuğu hazırlanabilir; fiziksel baskı ölçüsü uydurulmaz.
