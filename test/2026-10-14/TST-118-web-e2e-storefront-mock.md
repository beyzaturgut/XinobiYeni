# TST-118 — Web e2e: storefront mock ve CM101 yerel veri koruması

- Tarih/saat (Europe/Istanbul): 14.10.2026
- Commit/branch: `main` / `5168f0b` → bu commit
- Faz/görev: Test bakımı (TST-108 sonrası gerileme); Faz02/04/05 web regresyonu
- Seviye: E2E (Playwright 1.55.1, Chrome, statik export 3010 + Development API 5023)
- Çalıştıran: Claude Code

## Kök nedenler

1. `d1639f6` sonrası production derlemesi kataloğu `/api/v1/catalog/storefront`’tan okuyor; `fixtures.ts` yalnız `/local-commerce/state`’i yanıtladığı, `serve-export.mjs` de yalnız onu API’ye ilettiği için testlerde katalog boş geliyordu (sepet, katalog, favori, karşılaştırma, teklif, ödeme, ana sayfa slider senaryoları).
2. `cm101-approval-preview.spec.ts` (`63025e7`/`b6ccad8`) bir inceleyicinin Git dışı `services/api/App_Data` verisini (cm101-sam3-review, catalog-surface-review, real-catalog-qa, questionnaire-preview-sessions) dosya yüklenirken okuyor; veri yoksa **tüm paket** “No tests”/ENOENT ile duruyordu.

## Değişiklik (uygulama kodu değişmedi)

- `apps/web/tests/e2e/fixtures.ts`: `/catalog/storefront` aynı sahte katalogla yanıtlanır.
- `apps/web/tests/serve-export.mjs`: `GET /api/v1/catalog/storefront` test API’sine iletilir.
- `cm101-approval-preview.spec.ts`: yükleme `try` içinde; veri yoksa tek bir gerekçeli `skipped` test raporlanır, veri varsa testler aynen çalışır.

## Komut

```text
cd apps/web && node tests/run-e2e.mjs
```

## Sonuç

| Koşu | Sonuç |
|---|---|
| Değişiklik öncesi (ilk 66 test, sonra durduruldu) | 28 başarısız; paket cm101 spec’i yüzünden tam çalıştırılamıyordu |
| Tam paket, değişiklik sonrası | **70 geçti / 50 başarısız / 1 atlandı** (121), 18,6 dk |
| Karşılaştırılabilir ilk 66 test | Kritik etkileşimlerde 9 hatanın 6’sı giderildi (sepet, arama/karşılaştırma, teklif, katalog filtre, favori, deneme ödeme); yeni hata yok |
| Örnek kontrol: `local-pattern-image:12`, `variant-preview-readiness`, `home-touch-targets` düzeltmeler **olmadan** | 12 başarısız / 4 geçti → düzeltmelerle aynı grupta 9 başarısız (ana sayfa slider 320/390/768 düzeldi) |

## Açık kalan (önceden var olan) hatalar — 50

Kritik etkileşim: gelişmiş editör katmanları, ürün detayında renk varyantı, basit kişiselleştirme → editör. Ana sayfa slider 1024/1440. XINOBI U ve ürün yüzeyi akışı: accepted-surface (1), artwork-drag (5), cm101-demo-byte-regression (1), commerce-surface-integration (7), large-catalog-preview (3), local-pattern-image (15), own-image-entry (2), product-pattern-preview (1), representative-disclosure (2), variant-preview-readiness (4). Bu dosyalar `fixtures.ts` kullanmıyor ve düzeltme öncesinde de başarısız; 13.10 XINOBI U/kişiselleştirme değişiklikleriyle (`fe93107`, `2bb0b6d`, `88d80e0`, `a7ff0e8`) test beklentileri ayrışmış görünüyor. Ayrı onaylı iş olarak ele alınmalı.

Gerçek ödeme/e-posta/AI çağrısı yapılmadı; SQL değişmedi.

## Sonuç kararı

KISMİ BAŞARILI: altyapı hataları giderildi, paket tam çalışır; 50 önceden var olan hata açık.
