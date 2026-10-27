# DEPLOY-014 — Tam ekran sipariş ürün önizlemesi

- Tarih/saat: 27.10.2026 12:05 Europe/Istanbul; sorumlu: Codex (hazırlık/yayımlama).
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI**. GitHub yayını 27.10.2026 12:06:34 Europe/Istanbul; kaynak commit ve üç asset için uploaded/boyut/SHA256 değerleri doğrulandı. Sunucuda IIS kurulumu henüz uygulanmadı.
- Kaynak: `main`, `e2131e76b6089f3222da6c37fa9fecee8eb39aa3`.
- Release: [`xinobi-e2131e7`](https://github.com/beyzaturgut/XinobiYeni/releases/tag/xinobi-e2131e7).
- Hedef: mevcut 109.104.120.91; IIS `XinobiYeni` ve `XinobiYeniApi`. Fiziksel hedefleri araç IIS'ten okur.
- Tür: tek web/admin/API release; APK hazırlanmadı.
- Komutlar: `node tools/package-release.mjs`, `node tools/publish-release.mjs xinobi-e2131e7`.

| Artefakt | Bayt | SHA256 |
| --- | ---: | --- |
| `paketler/releases/xinobi-e2131e7/xinobi.zip` | 261628289 | `5c2ba526c641daab1fdfa58f7c6633c811c9b2cff9ec27f5077d94007db1841a` |

ZIP bütünlüğü, hash yan dosyası, release.json commit'i, web/admin/API dosyaları ve SQL sağlayıcısı kontrol edildi. Deploy betiği paketin içinde/yanında ve repoda aynı. Sunucu ayarları, yerel sırlar ve App_Data pakette yok.

## İçerik ve doğrulama

Sipariş önizlemesi Flutter gibi tam ekran açılır; liste CSS'inden bağımsızdır. Ürün görseli büyük gösterilir, 1–5x pinch/pan desteklenir, mobilde büyük düğmeler kaldırılır. Kaynak görsel sipariş kompozisyonu veya satın alınan revizyondur. `aa6069f` içindeki güncel admin iptal/stok yetki düzeltmeleri de mevcut main kapsamında pakete dahildir.

- Web production build/TypeScript, admin TypeScript/Vite ve temiz kaynak kopyasında API publish geçti.
- WebKit'te 390/1440 genişlik ve iki görsel kaynağıyla dört tam ekran/gesture testi geçti; `test/2026-10-27/TST-order-preview-fullscreen.md`.
- 26 API AuthorizationTests geçti.
- Admin tarayıcı kontrolü 1440/1280/768/390 genişliklerinde ve stok kaydı/yetki senaryolarında geçti. Testler yalnız mock veri kullanır. Üretim admin paketi `/admin/` base yolu ile kontrol edildi.
- Tam ekran viewer üretim paketinde mevcut; kurulum sonrası doğrulama için JS: `/_next/static/chunks/0dukmovs9t7ld.js`.
- Kurulum öncesi mevcut canlı web, admin ve web-proxy readiness uçları HTTP 200 döndü. Bunlar yeni sürümün kurulduğunu göstermez.

## Sunucu kurulumu

`docs/runbooks/one-command-deploy.md` içindeki panodan token alma yöntemiyle yönetici PowerShell'de:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-e2131e7
```

Sunucuda bu komut henüz çalıştırılmadı. Migration değişikliği yok ve uygulanmadı. Yeni sunucu yedeği alınmadı; gerçek kurulumda araç klasörleri `*-previous-<tarih>` olarak yedekler. Gerçek kurulum sonucu, deployment.json kaydı ve kurulum sonrası HTTP/HTTPS/telefon kontrolleri daha sonra bu kayda eklenmeli.
