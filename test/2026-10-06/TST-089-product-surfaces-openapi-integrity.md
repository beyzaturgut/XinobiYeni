# TST-089 — ProductSurfaces çalışmasında OpenAPI korunması

- Kayıt tarihi (Europe/Istanbul): 06.10.2026; önceki Step 1 oturumunun gözlenen hash kontrolleri geriye dönük kaydedildi. Kesin önceki kontrol saati kaydedilmemiştir.
- Commit/branch: `acc0c99` / `feature/product-personalization`.
- Faz/görev: ProductSurfaces Step 1 / dosya güvenliği.
- Seviye: FILE INTEGRITY
- Ortam: Windows PowerShell.
- Çalıştıran: Codex.

## Amaç ve komut

Önceden değiştirilmiş `packages/contracts/openapi/v1.json` dosyasının ProductSurfaces çalışmasıyla değiştirilmediğini doğrulamak.

```text
Get-FileHash packages/contracts/openapi/v1.json -Algorithm SHA256
```

## Gerçek sonuç ve kanıt

BAŞARILI: Step 1 başlangıcı ve sonundaki SHA-256 aynı:

```text
01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6
```

Dokümantasyon uyum oturumunun başlangıcında da aynı hash gözlendi. Dosyanın git durumunda `M` olması önceden mevcut, ilgisiz değişikliktir; temiz HEAD ile eşitlik iddiası değildir. Test/build komutları OpenAPI üretimini `OpenApiGenerateDocumentsOnBuild=false` ile kapattı. Kanıt terminal hash çıktılarıdır; ayrı ham log artefaktı yoktur.

## Etki ve sonraki adım

Dosya değiştirilmedi, revert edilmedi veya yeniden üretilmedi. Gelecekte endpoint adımı ayrı sözleşme değişikliği olarak değerlendirilir; mevcut ilgisiz değişiklik otomatik üretimle ezilmez.
