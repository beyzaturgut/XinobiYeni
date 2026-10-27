# DEPLOY-016 — Kategori penceresi ve yeni katalog görseli promptu

- Tarih: 27.10.2026; GitHub yayını **16:42:12 Europe/Istanbul** (13:42:12 UTC).
- Sorumlu: Claude Code (paket hazırlama/yayımlama).
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI**. Yeni sürümün Windows/IIS kurulumu henüz çalıştırılmadı.
- Kaynak: main / `799e1af5663eb59af28c53b3ed728a7af72c7462`.
- Release: [xinobi-799e1af](https://github.com/beyzaturgut/XinobiYeni/releases/tag/xinobi-799e1af).
- Hedef: mevcut IIS XinobiYeni ve XinobiYeniApi; fiziksel yolları deploy aracı IIS’ten okur. Hosting/binding değiştirilmedi.
- Tür: mevcut birleşik web/admin/API ZIP. APK hazırlanmadı. Migration değişikliği yok ve uygulanmadı.

## İçerik

Admin katalog sayfasında kategori ekleme/silme, “Yeni ürün” yanındaki “Yeni kategori” penceresine taşındı (`35a4326`). Katalog görseli promptu tam genişlikte gösterilir; yüzey/referans renk ayarları kaldırıldı, yeni MASTER-recolor şablonundaki renkler ve dosya adları ürünün renk varyantlarından doldurulur (`799e1af`). Önceki `xinobi-dda85b6` içeriği de dahildir.

## Paket ve doğrulama

Komutlar: `node tools/package-release.mjs`, `node tools/publish-release.mjs xinobi-799e1af`. Mevcut yetkili GitHub kimliği yalnız işlem ortamında kullanıldı, kayda yazılmadı.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| xinobi.zip | 261626570 | da7bca315d20e6f53093979ffebaf582e866b57cda68b358722838526a1a5239 |
| xinobi.zip.sha256 | 65 | 6a5eb3b57df5eecc1773d12059615cbb5b956dfdcaf0e28674666aa93995839b |
| deploy-release.ps1 | 10748 | 6e75f4153ec807d84585381f69c3d324fa6320af17fc11becb1d83ab26db914e |

Paketleyici web/admin derlemesi ve API Release publish ile başarıyla tamamlandı (SQL sağlayıcısı: SqlServer). GitHub etiketi tam kaynak commit’e çözüldü; release taslak değil ve üç asset `uploaded`, boyut ve SHA256 digest bilgileri yerel dosyalarla aynı. Admin değişiklikleri TypeScript kontrolü, `apps/admin/tests/catalog-source-states.mjs` ve mock’lu tarayıcı kontrolleriyle (1440/390 px) doğrulandı. Tüm uygulama regresyonu çalıştırılmadı.

## Sunucu adımı

Yönetici PowerShell’de, mevcut [panodan sunucu token’ı alma yöntemi](../docs/runbooks/one-command-deploy.md) ile:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-799e1af
```

Deployment successful çıktısı ve gerçek deployment.json sonucu geldikten sonra kurulum durumu kaydedilmeli. GitHub yayını IIS kurulumu değildir.
