# DEPLOY-018 — Maskeleme ve kişiselleştirme güncel yayını

- Tarih: 11.11.2026 Europe/Istanbul.
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI; IIS KURULUMU BEKLİYOR**.
- Kaynak: main / d31903b0dc7811b33dbd8a9cc0c67cc690ec8f37. Sonraki yayın kayıt commit'i uygulama paketini değiştirmez.
- Release: [xinobi-d31903b](https://github.com/mostidea/xinobi_new/releases/tag/xinobi-d31903b).
- Hedef mevcut XinobiYeni / XinobiYeniApi, http://109.104.120.91:8014. Hosting/site/binding değişmedi. Mobil APK yok.
- Kapsam: tek fotoğraf kişiselleştirme taskları, müşteri askıya alma/silme, mevcut katalog fotoğrafından kaynak indirme/prompt/WebP/tek fotoğraf onayı ve soru ekranında effect replay kaynak durumunun korunması. Başka renklere toplu maske onayı yoktur.

## Kanıtlar

TST-272: API 641 PASS / 30 SKIP / 0 FAIL; admin yeni/mevcut maskeleme testleri, lint/TS/build PASS. Mevcut 1 AuditHistory lint uyarısı korunur. Bu yayında web lint PASS, web/admin/API üretim paketleme PASS, web single-source 19/19 PASS (AI soru/sonuç dahil).

ZIP'ten çıkarılan gerçek admin dosyalarında izole giriş/MFA/nonstaff ret/çıkış testi PASS. İlk deneme birleşik paketteki admin yerine yalnız web out klasörünü sunduğu için 404 aldı; test doğru ZIP admin dosyalarıyla geçti. Gerçek müşteri hesabı/e-posta/sağlayıcı kullanılmadı.

`NEXT_PUBLIC_DEV_SURFACE_BRIDGE=0 node tools/package-release.mjs`: temiz commit. API detached worktree'den publish; appsettings.Local/Development/Server, App_Data, commerce-preview, node_modules ve Git dışlandı. Yerel secret değerlerinin UTF8/UTF16LE taraması eşleşme vermedi. 720 arşiv kaydı, CRC, SHA256 ve release.json commit doğrulandı. Production katalog SqlServer; Sürat Enabled/PollingEnabled/AllowProduction sınıf varsayılanları kapalı, yerel prova secret'ları taşınmadı.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| xinobi.zip | 262728623 | a644c01af21c27d40bd9f6ddffcb5e2d8183e398eb9608955c1d0de744890e6a |
| xinobi.zip.sha256 | 65 | 020b54fcf705db82021fee0e347576f3a76d52747b7d36ac271fb3c2c8b88eb7 |
| deploy-release.ps1 | 10745 | 80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a |

## Veritabanı önkoşulu

Önceki xinobi-d8ea431'den sonra **0010 CustomerAccountDeletion** eklendi. Sunucuda önce SQL yedeği/geri yükleme noktası ve migration geçmişi kontrol edilmeli. 0009 önkoşulu doğrulanıp [0010 idempotent SQL](../infra/db/migrations/0010_CustomerAccountDeletion.idempotent.sql) mevcut [migration prosedürüyle](../docs/runbooks/database-migrations.md) uygulanmalı. Script Users durum kısıtına deleted ekler; gerçek hesapları silmez/askıya almaz. Başlangıç/deploy script'i migration uygulamaz. Gerçek SQL kabulü/uygulaması bu oturumda yapılmadı.

[Rollback](../infra/db/migrations/0010_CustomerAccountDeletion.rollback.sql) deleted kayıt varsa durur. Uygulama dosyası geri alma veritabanı geri alma değildir; veri silerek rollback yapılmaz. Daha önceki migration'ların kurulmuş olduğu varsayılmaz.

## Sunucu ayarları / geri dönüş

C:\XinobiData\config\appsettings.Server.json, SQL/medya/SMTP/AI anahtarları ve veriler hedef out/api dışında kalmalı. Environment Production, gerçek e-posta/MFA ayarları, Preview kapalı, geliştirme köprüleri kapalı ve dosya yetkileri sunucuda doğrulanmalı. Sürat gerçek kabul tamamlanmadan canlı gönderim/polling etkinleştirilmez. Bu oturumda sunucu ayarları okunmadı/değişmedi.

Mevcut deploy aracı SHA256: 80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a. Eski sunucu aracı eski repoyu hedefleyebileceğinden release'teki dosya indirilip hash doğrulanır. -WhatIf ardından sürüme özel çalıştırılır. Araç mevcut readiness/config/hedefleri kontrol eder; web/API pool'larını durdurur, önceki klasörleri -previous-tarih tutar, yeni dosyaları koyar ve readiness/web/admin/katalog kontrollerini yapar. Hata sonrası dosya rollback denenir; SQL geri alınmaz. Aynı anda başka deploy çalıştırılmaz.

## Kurulum öncesi salt okunur HTTP

/ 200; /admin/ 200; /api/v1/health/ready 200; /api/v1/catalog/storefront 200; anonim /api/v1/admin/session 401. Bunlar eski kurulumun erişimidir, d31903b'nin sunucuda çalıştığı kanıtı değildir.

## Erişim sınırı / kapanış

Bu oturumda uzak Windows/IIS bağlantısı yok; kurulum, SQL migration/yedek ve sunucu gizli ayar kabulü yapılamadı. Yalnız paket hazırlama/yayınlama yürütüldü. Windows'ta version-specific komut ve [mevcut runbook](../docs/runbooks/one-command-deploy.md) kullanılır. Deployment successful ve deployment.json geldikten sonra gerçek admin giriş/MFA, maske indirme/yükleme, siparişin üç dosyası ve katalog kontrolü kayda eklenir. Gerçek cihaz/baskı/Sürat şube kabulü otomatik testle kapanmaz.


## Sunucuda sürüme özel komut

Önce yukarıdaki SQL 0010/yedek ve sunucu ayar kontrolleri tamamlanır. Yönetici PowerShell'e bu blok yapıştırılır. Bekleme mesajı geldiğinde **yeni repo Contents: read token'ı** kopyalanır, PowerShell'e geri dönüp token yapıştırılmadan Enter basılır. Mac write credential'ı kullanılmaz.

```powershell
$null = Read-Host "mostidea/xinobi_new icin okuma tokenini simdi kopyala; sonra Enter"
try {
    $token = (Get-Clipboard -Raw).Trim()
    if ($token -notmatch '\A[A-Za-z0-9_]+\z') { throw 'Panoda gecerli token yok.' }
    $env:GITHUB_TOKEN = $token
    $headers = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json' }
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/mostidea/xinobi_new/releases/tags/xinobi-d31903b' -Headers $headers
    $asset = @($release.assets | Where-Object { $_.name -eq 'deploy-release.ps1' })
    if ($release.draft -or $asset.Count -ne 1) { throw 'Release veya deploy araci bulunamadi.' }
    New-Item -ItemType Directory -Path 'C:\XinobiDeploy\tools' -Force | Out-Null
    $file = 'C:\XinobiDeploy\tools\deploy-release.ps1'
    Invoke-WebRequest -UseBasicParsing -Uri $asset[0].url -Headers @{ Authorization = "Bearer $token"; Accept = 'application/octet-stream' } -OutFile $file
    if ((Get-FileHash $file -Algorithm SHA256).Hash -ine '80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a') { throw 'Deploy araci hash uyumsuz.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-d31903b -WhatIf
    if ($LASTEXITCODE -ne 0) { throw 'On kontrol basarisiz; durduruldu.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-d31903b
    if ($LASTEXITCODE -ne 0) { throw 'Deploy basarisiz; deployment.json ve rollback sonucunu inceleyin.' }
}
finally {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Variable token -ErrorAction SilentlyContinue
}
```

GitHub doğrulaması: yayın zamanı 2026-11-11T10:26:16Z UTC; tag tam kaynak commit'e eşit, üç asset uploaded, boyutlar ve GitHub SHA256 digest değerleri yerel dosyalarla eşit.
