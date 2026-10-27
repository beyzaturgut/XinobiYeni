# DEPLOY-013 — Web önizleme temizliği, GitHub release

- Tarih/saat: 27.10.2026 10:51 Europe/Istanbul; sorumlu: Codex (hazırlık/yayımlama).
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI**. GitHub yayını 27.10.2026 10:52 Europe/Istanbul. Sunucuda IIS yayını yapılmadı.
- Kaynak: `main`, `d54c13c593b16060e29fb2f6d38d74877ac8b74b`.
- Release: [`xinobi-d54c13c`](https://github.com/beyzaturgut/XinobiYeni/releases/tag/xinobi-d54c13c).
- Hedef: mevcut 109.104.120.91 test sunucusu; IIS `XinobiYeni` ve `XinobiYeniApi`. Hedef fiziksel yolları deploy aracı IIS'ten okur.
- Tür: tek web/admin/API release; APK istenmedi ve hazırlanmadı.
- Araçlar: `node tools/package-release.mjs`, `node tools/publish-release.mjs xinobi-d54c13c`.

| Artefakt | Bayt | SHA256 |
| --- | ---: | --- |
| `paketler/releases/xinobi-d54c13c/xinobi.zip` | 261623600 | `b74771351ab7c6c788208fd13527b707f0c772f80232da80773aa64609cf8d26` |

Yan dosyalar: `xinobi.zip.sha256` (65 bayt) ve `deploy-release.ps1` (10748 bayt). GitHub API üzerinden release yayımlanmış durumda (`draft=false`), kaynak commit ve üç asset için `uploaded` durumu, boyutlar ve SHA256 digestleri yerel dosyalarla karşılaştırılarak doğrulandı.
ZIP CRC/bütünlük kontrolü, hash yan dosyası, release.json kaynak commit'i, web/admin/API giriş dosyaları ve EF Core SQL sağlayıcısı doğrulandı. Deploy aracı ZIP içinde, yanında ve kaynakta birebir aynı. Yerel/sunucu ayarları ve App_Data pakette yok.

## İçerik ve kontroller

Web siparişinde kişiselleştirilmiş ürün kompozisyonu ve yakınlaştırma, Nobi için kaydırma payı ve eski editör temizliği dahildir. Web, admin TypeScript/Vite ve temiz kaynak kopyasında API publish başarılı; release yayımlama aracının 4 testi geçti. Web değişikliği için 26 ilgili tarayıcı testi önceki temizlik kaydında başarılıdır; mevcut eski test sınırlamaları `test/2026-10-27/TST-web-preview-cleanup.md` dosyasında kayıtlıdır.

## Sunucuda kurulumu başlatma

Yönetici PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-d54c13c
```

Bu komut bu hazırlık sırasında çalıştırılmadı. Mevcut SQL/sunucu ayarları korunur; bu sürümde migration değişikliği yoktur ve migration uygulanmadı. Yeni sunucu yedeği alınmadı; gerçek kurulumda araç hedefleri `*-previous-<tarih>` olarak saklar. Sunucunun deployment.json kaydı, HTTP/HTTPS smoke ve gerçek kurulum sonucu sonradan bu kayda eklenmelidir.
