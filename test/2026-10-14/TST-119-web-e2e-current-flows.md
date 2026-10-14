# TST-119 — Web e2e: güncel XINOBI U akışına uyum

- Tarih/saat (Europe/Istanbul): 14.10.2026
- Commit/branch: `main` / `2497bba` → bu commit
- Faz/görev: Test bakımı; Faz02/04/06/10 web regresyonu (TST-118’in devamı)
- Seviye: E2E (Playwright 1.55.1, Chrome, statik export 3010 + Development API 5023)
- Çalıştıran: Claude Code

## Kök nedenler (TST-118’de açık kalan 50 hata)

1. **Boş test kataloğu:** `2bb0b6d` demo ürünleri `seed.json`’dan `tests/fixtures/demo-commerce.json`’a taşıdı; .NET testleri `LocalCommerce:SeedFile` ile yeni dosyayı kullandı ama Playwright test API’si kullanmadı.
2. **Görsel adresi:** Storefront, Development’ta asset adresini `:3000` web portuna göre mutlak üretiyor (`Catalog:AssetBaseUrl` yoksa); test web’i 3010’da. Ürün davranışı doğru, test ortamı yapılandırması eksikti.
3. **Geliştirme önizleme köprüsü:** `88d80e0` ile production derlemesi yalnız yayımlanmış önizleme paketini okuyor (canlı için doğru). E2E production derlemesiyle çalıştığından `/api/v1/dev/...` köprüsünü test eden yüzey senaryoları hiç önizleme bulamıyordu.
4. **Bilinçli ürün değişiklikleri:** Sabit Çay Makinesi demo sayfası ve basit kişiselleştirme girişi `2bb0b6d` ile kaldırıldı; XINOBI U renk adımı `/xinobi-u/renk`’e taşındı ve “Kendi görselinizi ekleyin” oraya alındı (`fe93107`). Eski testler kaldırılan sayfaları arıyordu.

## Değişiklik

- `apps/web/playwright.config.ts`: test API’sine `LocalCommerce__SeedFile` (demo katalog) ve `Catalog__AssetBaseUrl` (test web portu).
- `accepted-surface-api.ts`: production derlemesi yalnız `NEXT_PUBLIC_DEV_SURFACE_BRIDGE=1` olduğunda geliştirme köprüsünü kullanır; bu değişkeni yalnız `tests/run-e2e.mjs` verir. **Canlı/IIS derlemesinde tanımlı değil; canlı davranış değişmedi.**
- `home-touch-targets`: slider görseli için yalnız yol eşleşmesi (mutlak storefront adresi).
- Taşınan/yenilenen testler (kapsam korunarak):
  - Ürün detayında renk/görsel/sepet + XINOBI U bağlantısının varyantı taşıması → `/urunler/detay/?id=DEMO-P101`.
  - Hazır olma durumu, yükleniyor → hata → “Tekrar dene”, yalnız hazır renkte “Sorulara başla” ve “Kendi görselinizi ekleyin” → `/xinobi-u/renk`.
  - Kaldırılan demo ürün ve kişiselleştirme adresleri: kullanıcı güncel ürünlere yönlendirilir, soru/editör/üretim başlamaz (eski 4 Tea Maker giriş testi tek testte birleşti).
  - Renk sayfasında yeniden açılan çerez paneli kapatılır (tercih D10 kararına kadar kalıcı değil).

## Komut

```text
cd apps/web && pnpm exec tsc --noEmit -p . && pnpm lint && node tests/run-e2e.mjs
```

## Sonuç

| Koşu | Sonuç |
|---|---|
| TST-118 sonrası | 70 geçti / 50 başarısız / 1 atlandı (121), 18,6 dk |
| Bu iş sonrası | **116 geçti / 1 başarısız / 1 atlandı (118)**, 1,7 dk |
| Taşınan dört dosya ayrıca | 38/38 |

Toplam test sayısı 121 → 118: dört eski Tea Maker giriş testi tek testte birleşti.

## Açık

- `cm101-demo-byte-regression`: güncel editör çıktısı 7 Ekim referansından **40.380 bayt** (1066×1600×4 = 6.822.400 baytın ~%0,6’sı) farklı. Editör `fe93107` ile `EditorWorkspace` yerine `LocalPatternPreview` kullanıyor ve yerleştirme kuralı değişti; farkın bilinçli olup olmadığı ürün/tasarım kararı → kullanıcı onayı bekleniyor.
- Atlanan: `cm101-approval-preview` (Git dışı yerel inceleme verisi yok, TST-118).

## Sonuç kararı

BAŞARILI. Uygulama davranışı canlıda değişmedi; tam web e2e yeşil (ek bölüm).

## Ek — CM101 piksel referansı güncellendi (kullanıcı onayı, 14.10.2026)

Kullanıcı 13 Ekim editör çıktısını yeni doğru kabul etti. `cm101-demo-byte-regression.spec.ts` artık 7 Ekim hattını yeniden üretmek yerine güncel editör çıktısının piksel SHA-256’sını (`9d70df5b…40aaa3`, `bccef08`) bayt bayt karşılaştırır; iki ayrı koşuda aynı özet üretildi. Işık/çarpıtma yardımcıları Tea Maker için eski davranışı koruyor (`fda5c83`), fark editör birleştirme hattından (`fe93107`).

**Son tam koşu: 117 geçti / 0 başarısız / 1 atlandı (118), 1,7 dk.** Atlanan: `cm101-approval-preview` (Git dışı yerel veri).
