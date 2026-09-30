# TST-021 — Faz02 WEB-005 basit kişiselleştirme stüdyosu

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `c25ce02` sonrası çalışma ağacı
- Faz/görev: Faz02 / WEB-005 basit kişiselleştirme
- Seviye: STATIC / BUILD / SMOKE / INTERACTION CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP
- Çalıştıran: Codex

## Amaç

Çay Makinesi 101 için D04 baskı alanı kararı uydurulmadan metin, stil ve renk seçimli ilk responsive kişiselleştirme kabuğunu; erişilebilir durumları, güvenli işlem sınırlarını, metadata ve production render açısından doğrulamak.

## Uygulanan kapsam

- `/urunler/cay-makinesi-101/kisisellestir` statik kişiselleştirme rotası.
- En fazla 24 karakterlik canlı metin girişi ve kalan karakter sayacı.
- Sade, Geometrik ve Yumuşak stil seçenekleri.
- Kırık beyaz, Gece ve Xinobi teal renk seçenekleri.
- Fiziksel baskı alanı iddia etmeyen ayrı temsili dijital önizleme.
- Oturum içi demo taslak durumu; API olmadan kalıcı kayıt iddiası yok.
- D04, fiyat ve stok olmadan devre dışı satın alma eylemi.

## Komutlar

```text
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/urunler/cay-makinesi-101/kisisellestir
```

## Gerçek sonuç

- Durum: BAŞARILI; gerçek tarayıcı interaction/piksel QA açık.
- ESLint, TypeScript ve production build başarılı.
- Statik üretim: 7/7; kişiselleştirme rotası statik prerender edildi.
- HTTP rota, metadata ve kritik güvenlik/durum metinleri smoke test ile doğrulandı.
- Ürün detayı ve ana sayfa Studio CTA bağlantıları yeni rotaya yönlendirildi.

## Veri doğruluğu ve erişilebilirlik

- Fiziksel ürün üzerinde kesin baskı konumu veya ölçüsü gösterilmedi.
- Önizleme `Temsili dijital önizleme · Üretim/baskı alanı değildir` etiketi taşır.
- Seçenekler doğal düğme semantiği, `aria-pressed` ve açıklayıcı etiketler kullanır.
- Metin alanı görünür label, karakter sınırı ve `aria-live` durum mesajına sahiptir.
- Gerçek kaydetme/sipariş davranışı olmadığı açıkça belirtilir; satın alma düğmesi devre dışıdır.

## Açık testler

- Metin, stil ve renk etkileşimleri gerçek tarayıcıda klavye, dokunma ve ekran okuyucu ile doğrulanmalı.
- Telefon/tablet/masaüstü görsel kırpma ve layout QA yapılmalı.
- D04 sonrası gerçek baskı alanı/teknik kısıtlar; API sonrası kalıcı taslak ve fiyat etkisi testleri eklenmeli.

## Sonraki adım

WEB-006 gelişmiş editör için yalnız tasarım/araç kabuğu hazırlanabilir; gerçek baskı koordinatı, çıktı üretimi ve satın alma entegrasyonu D04/API kararları gelmeden kesinleştirilmez.
