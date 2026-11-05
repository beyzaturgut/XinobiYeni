# DEPLOY-017 — Doğrulanmış web/admin/API sürümü

- Tarih: 05.11.2026. GitHub yayını 15:31:46 Europe/Istanbul (12:31:46 UTC).
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI; IIS KURULUMU BEKLİYOR**.
- Kaynak main / d8ea43160e9704a90bb756369c2fb5cedb421ae5. Bu kayıt daha sonra commit edilir; uygulama paketi yukarıdaki kaynak commit'tir.
- Release: [xinobi-d8ea431](https://github.com/mostidea/xinobi_new/releases/tag/xinobi-d8ea431).
- Hedef: mevcut XinobiYeni / XinobiYeniApi IIS siteleri, http://109.104.120.91:8014. Binding/hosting değiştirilmedi.
- Birleşik web/admin/API, mobil APK yok. Mevcut GitHub Releases → deploy-release.ps1 akışı korundu.

## Doğrulananlar

TST-255: 595 API PASS / 29 SKIP, 21/21 admin test dosyası, ayrıca üretim profilinde giriş/MFA/çıkış, 24/24 web testi; lint/tip/üretim build başarılı. 4 önceki admin lint uyarısı mevcut.

`NEXT_PUBLIC_DEV_SURFACE_BRIDGE=0 node tools/package-release.mjs` tamamlandı. API temiz detached worktree'den publish edildi. Yerel prova hesabı ve appsettings.Local.json, Development/Server JSON, App_Data, node_modules/Git ve commerce-preview snapshot paket dışında. Bilinen yerel parola/secret değerleri UTF8/UTF16LE tarandı; arşivde bulunmadı. Hash, CRC, 720 arşiv kaydı ve release.json kaynak commit eşleşmesi doğrulandı. API Production katalog deposu SqlServer; yerel Shipping ayarı pakette yok, sınıf varsayılan Enabled/Polling/AllowProduction kapalı; Production create uygunluk engeli kodda sürüyor.

Paket ZIP'inden çıkarılan gerçek admin dosyaları geçici loopback statik sunucuda admin-login testiyle doğrulandı: anonim/nonstaff reddi, parola tek başına erişim yok, yanlış MFA reddi, doğru MFA sınırlı rol, çıkış PASS. Bütün auth yanıtları sentetik; gerçek sunucu hesabı veya e-posta kullanılmadı.

GitHub repo private, mevcut push yetkisi doğrulandı. Taslak release'e üç dosya yüklendi, sonra yayımlandı. Tag tam commit'e eşit; üç asset uploaded, boyut ve GitHub SHA256 digest yerelle aynı.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| xinobi.zip | 262653147 | 9f308f664bbf74c33fce7ddad8b3bc3997e847bc3f9871a2b587904c9b56760c |
| xinobi.zip.sha256 | 65 | c02d3fb70549bf576ab736a71bccbdb5f79133cf6a9d063ddb65cdbeaa4f9891 |
| deploy-release.ps1 | 10745 | 80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a |

## Mevcut canlı ortam — kurulum öncesi salt okunur kontrol

| Yol | HTTP |
|---|---:|
| / | 200 |
| /admin/ | 200 |
| /api/v1/health/ready | 200 |
| /api/v1/catalog/storefront | 200 |
| /api/v1/admin/session (anonim) | 401 |

Bunlar mevcut eski kurulumun sonuçlarıdır; yeni commit kurulmuş sayılmaz. HTTPS/gerçek MFA/dosya teslimi veya yeni binary doğrulanmadı.

## Veritabanı, ayarlar ve rollback

799e1af → d8ea431 karşılaştırmasında EF migration ve infra/db/migrations değişikliği yok. Uygulama startup migration çalıştırmaz; bu release için yeni schema/data script'i eklenmedi ve veriye müdahale edilmedi. Sunucunun mevcut migration seviyesi okunamadı; eski eksik migration olmadığı varsayılmaz. DBA güncel yedek ve geçmişi kontrol etmeli.

Server settings C:\XinobiData\config\appsettings.Server.json içinde, değiştirilen api/out klasörleri dışında kalmalı. SQL/medya/SMTP ve gerçek sağlayıcı secret'ları sunucuda kalır. Paketin temiz olması sunucudaki mevcut ayarların doğru olduğunu kanıtlamaz. Sunucunun Environment=Production, Email Preview kapalı, geliştirme köprüleri kapalı, gerçek SMTP/MFA ayarları ve yetkili dosya yolları sunucuda kontrol edilmeli. Sürat gerçek kabul açık olduğundan Enabled/PollingEnabled/AllowProduction etkinleştirilmez; yerel Sandbox hesabı taşınmaz. IIS pool/web.config/machine env override'ları da kontrol edilmeli.

Deploy script dosyalardan önce mevcut readiness, dış ayar dosyasının varlığı/JSON geçerliliği, ayrı hedef/ayar yolları ve paralel deploy kilidini kontrol eder. API/web eski klasörleri -previous-tarih olarak saklanır. Sonrası readiness/web/admin/katalog kontrolü başarısızsa otomatik dosya rollback denenir. DB rollback yok; gerçek veride silici rollback çalıştırılmaz. Dosya yedekleri başarı sonrası otomatik silinmez.

## Somut erişim sınırı

Bu oturumda SSH config veya açık uzak Windows/RDP bağlantısı yok. Sunucu komutu çalıştırılmadı; gerçek server secret içerikleri okunmadı, SQL yedeği alınmadı, pool veya dosya değişimi yapılmadı. Installer SUCCESS/deployment.json olmadan bu kayıt BAŞARILI'ya çevrilmez.

## Sunucuda yapılacak işlem

[Mevcut runbook](../docs/runbooks/one-command-deploy.md) uygulanır. Yeni repo Contents:read yetkili sunucu token'ı kullanılmalı; Mac yazma credential'ı sunucuya taşınmaz. Eski sunucu deploy-release.ps1 eski repoyu hedefleyebilir; aşağıdaki blok yeni release'in scriptini indirir ve hash doğrular.

Önce yönetici PowerShell'de sunucu ayarlarını/yedeği kontrol edin. Sürat bayrakları ve geliştirme/Preview ayarları kapalı olmalı. Aşağıdaki komut ayarları değiştirmez; bu kontrolün yerine geçmez.

```powershell
$null = Read-Host "mostidea/xinobi_new için Contents: read token'ını kopyala; sonra Enter"
try {
    $token = (Get-Clipboard -Raw).Trim()
    if ($token -notmatch '\A[A-Za-z0-9_]+\z') { throw 'Panoda geçerli token yok.' }
    $env:GITHUB_TOKEN = $token
    $headers = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json' }
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/mostidea/xinobi_new/releases/tags/xinobi-d8ea431' -Headers $headers
    $asset = @($release.assets | Where-Object { $_.name -eq 'deploy-release.ps1' })
    if ($release.draft -or $asset.Count -ne 1) { throw 'Yayın veya deploy aracı doğrulanamadı.' }
    New-Item -ItemType Directory -Path 'C:\XinobiDeploy\tools' -Force | Out-Null
    $file = 'C:\XinobiDeploy\tools\deploy-release.ps1'
    Invoke-WebRequest -UseBasicParsing -Uri $asset[0].url -Headers @{ Authorization = "Bearer $token"; Accept = 'application/octet-stream' } -OutFile $file
    if ((Get-FileHash $file -Algorithm SHA256).Hash -ine '80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a') { throw 'Deploy aracı hash uyumsuz.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-d8ea431 -WhatIf
    if ($LASTEXITCODE -ne 0) { throw 'Ön kontrol başarısız; yayın durduruldu.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-d8ea431
    if ($LASTEXITCODE -ne 0) { throw 'Yayın başarısız; deployment.json ve rollback sonucunu inceleyin.' }
}
finally {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Variable token -ErrorAction SilentlyContinue
}
```

Bu blok gerçek Windows'ta bu oturumda çalıştırılmadı. Sonuçta Deployment successful ve C:\XinobiDeploy\...\deployment.json beklenir. Ardından gerçek personel MFA/login/logout, yetkisiz ret, üç dosya indirmesi ve kargo ayarları doğrulanır. Deployment.json ve ilgili sonuçlar geldiğinde kayıt güncellenir.
