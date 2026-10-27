# DEPLOY-015 — Prompt v5 ve güncel ürün önizlemesi

- Tarih: 27.10.2026; GitHub yayını **15:23:25 Europe/Istanbul** (12:23:25 UTC).
- Sorumlu: Codex (paket hazırlama/yayımlama).
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI**. Yeni sürümün Windows/IIS kurulumu henüz çalıştırılmadı.
- Kaynak: main / `dda85b69566e49aceba918a55eeefc71eb86af51`.
- Release: [xinobi-dda85b6](https://github.com/beyzaturgut/XinobiYeni/releases/tag/xinobi-dda85b6).
- Hedef: mevcut IIS XinobiYeni ve XinobiYeniApi; fiziksel yolları deploy aracı IIS’ten okur. Hosting/binding değiştirilmedi.
- Tür: mevcut birleşik web/admin/API ZIP. APK hazırlanmadı. Migration değişikliği yok ve uygulanmadı.

## İçerik

Prompt v5, rafine çizim/renk rolleri ve açık yazı/imza/logo/ürün/eşya yasakları içerir. Ek yerel denetim kaldırılmıştır; önceki tek aday üretimi kullanılır. Ürün önizlemesinde baskı alanı başlangıçta kapalıdır. Önceki main içindeki tam ekran sipariş önizlemesi ve admin yetki düzeltmeleri de pakete dahildir.

## Paket ve doğrulama

Komutlar: `node tools/package-release.mjs`, `node tools/publish-release.mjs xinobi-dda85b6`. Mevcut yetkili GitHub kimliği yalnız işlem ortamında kullanıldı, kayda yazılmadı.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| xinobi.zip | 261628446 | f8f30998c76e61bee646b22398999129397b7b6ec6f3943af4ef7beff031c5ea |
| xinobi.zip.sha256 | 65 | f1a4bbe71ab1317a285bac64c1ee5f4de57425bd6e8f00f00140525fbec78232 |
| deploy-release.ps1 | 10748 | 6e75f4153ec807d84585381f69c3d324fa6320af17fc11becb1d83ab26db914e |

Web Next.js production/TypeScript, admin TypeScript/Vite ve temiz kaynak worktree üzerinde API Release publish geçti. ZIP bütünlüğü ve hash yan dosyası, release.json commit’i, web/admin/API dosyaları ve SQL sağlayıcısı doğrulandı. Sunucuya özel ayarlar, Development/Local JSON ve App_Data dahil edilmedi. Sunucuda bulunan üç medya dosyası paket dışında kaldı; paketleyicinin mevcut davranışı, canlı veri kopyası alınmadı. Deploy script’i ZIP/yan dosya/repo arasında aynı.

GitHub etiketi tam kaynak commit’e çözüldü. Üç asset’in uploaded, boyut ve SHA256 digest bilgileri yerel dosyalarla aynı. Bu paketleme sırasında yeni ücretli AI üretimi ve tüm uygulama regresyonu yapılmadı; promptun 25 hedefli testi önceki [v5 kaydındadır](../test/2026-10-27/TST-art-direction-v5.md).

## Sunucu adımı

Yönetici PowerShell’de, mevcut [panodan sunucu token’ı alma yöntemi](../docs/runbooks/one-command-deploy.md) ile:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-dda85b6
```

Gerçek kurulumda previous dizinleri ve deployment.json aracı tarafından oluşturulur. Yeni sunucu yedeği/restore veya kurulum sonrası HTTP/HTTPS/telefon smoke bu hazırlıkta yapılmadı. Deployment successful çıktısı ve gerçek deployment.json sonucu geldikten sonra kurulum durumu kaydedilmeli. GitHub yayını IIS kurulumu değildir.
