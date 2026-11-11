# DEPLOY-019 — Eksik maskenin listeyi kapatması için düzeltme yayını

- Tarih: 11.11.2026 Europe/Istanbul.
- Durum: **HAZIRLANDI / GITHUB RELEASE YAYIMLANDI; IIS KURULUMU BEKLİYOR**.
- Kaynak main / 9141ff2519dd0f89f3d463fcce7308c9e487b4d7; iki repo aynı uygulama commit'inde.
- Release: [xinobi-9141ff2](https://github.com/mostidea/xinobi_new/releases/tag/xinobi-9141ff2).
- Hedef mevcut XinobiYeni / XinobiYeniApi IIS siteleri, http://109.104.120.91:8014. Hosting/binding ve sağlayıcı ayarları değişmedi. APK yok.

## Sorun ve kapsam

D31903b sonrası canlı ekranında tek ürünün eksik maskesi tüm ürün yüzeyi listesini kapatıyor. MaskDetail dosya doğrulama hatasını tüm GET isteğine taşıyordu. Artık yalnız mask_missing/mask_corrupt ilgili üründe “Maske dosyası sorunu” ve maskIssues olarak görünür; diğer ürünler açılır. Kaynak dosya sağlamsa indirme/prompt/yeni WebP ve açık onayla kurtarma mümkün. Eksik dosya onaylı/boş başarı sayılmaz; public yayın fail-closed kalır. Geçmiş referanslar ve siparişler yeniden yazılmaz. Genel servis/yetki hatası bastırılmaz.

**Bu kod düzeltmesi sunucudaki eksik dosyayı geri getirmez.** Yanlış Storage:LocalRoot, aktarılmamış/silinmiş dosya ve yedek ayrıca kontrol edilmeli. Sunucuya doğrudan erişim yok; fiziksel dosya kurtarması, SQL veya gerçek kullanıcı verisi değişikliği yapılmadı. [Dosya deposu](../docs/runbooks/file-storage.md), [TST-273](../test/2026-11-11/TST-273-missing-mask-list-recovery.md).

## Kanıtlar

API 642 PASS / 30 SKIP / 0 FAIL; odaklı 18 PASS; mevcut admin maske regresyonu + 390/1440 eksik maskeli ürün ve yeni maske yükle/onay kurtarma PASS; admin lint/TS/Vite build PASS (mevcut AuditHistory uyarısı). Sentetik fotoğraf/hesaplar, gerçek veri yazımı yok. Görseller TST-273'te.

`NEXT_PUBLIC_DEV_SURFACE_BRIDGE=0 node tools/package-release.mjs`: web/admin/API temiz commit'ten paketlendi. API detached worktree publish. CRC, 720 arşiv kaydı, release.json commit/hash, Production SqlServer ve yerel secret UTF8/UTF16LE taraması PASS. App_Data/appsettings.Local/Development/Server/commerce-preview/node_modules/Git yok. Sürat yerel test ayarları taşınmadı.

| Dosya | Bayt | SHA256 |
|---|---:|---|
| xinobi.zip | 262729787 | a63a3c52ef29a6d7a9a782ff8dd38df09c75ba8ba83ad7c0dfbef5726b7a557d |
| xinobi.zip.sha256 | 65 | 67c991a387ae6396de2ea8a2395562fa273a572b63db2faf587a0f03643cd50e |
| deploy-release.ps1 | 10745 | 80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a |

## SQL, ayarlar ve geri dönüş

D31903b → 9141ff2 için yeni SQL migration yok. Önceki müşteri silme 0010 gereksinimi devam eder; sunucuda uygulandığı bu oturumda doğrulanmadı. Uygulama deploy'u migration çalıştırmaz. SQL ve medya yedeği alınmalı; Storage:LocalRoot kalıcı dış kökü göstermeli, sunucu SMTP/Production/Preview/AI/kargo bayrakları mevcut güvenli ayarlarında kalmalı.

Deploy-release.ps1 aynı doğrulanmış hash'te. Mevcut akışla -WhatIf ardından seçili release kurulur; eski out/api klasörleri -previous-tarih olarak tutulur. Sağlık kontrolleri sonrası hata olursa dosya rollback denenir; SQL/dosya deposu bu rollback'in parçası değildir. Canlı kurulum ve dış HTTP doğrulaması bekliyor; release yayını IIS başarı kaydı değildir.

## Sunucuda sürüme özel komut

Önce SQL/medya yedeği ve sunucu ayar kontrolleri tamamlanır; bu düzeltme yeni migration eklemez. Yönetici PowerShell'e bu blok yapıştırılır. Bekleme mesajı geldiğinde **yeni repo Contents: read token'ı** kopyalanır, PowerShell'e geri dönüp token yapıştırılmadan Enter basılır. Mac write credential'ı kullanılmaz.

```powershell
$null = Read-Host "mostidea/xinobi_new icin okuma tokenini simdi kopyala; sonra Enter"
try {
    $token = (Get-Clipboard -Raw).Trim()
    if ($token -notmatch '\A[A-Za-z0-9_]+\z') { throw 'Panoda gecerli token yok.' }
    $env:GITHUB_TOKEN = $token
    $headers = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json' }
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/mostidea/xinobi_new/releases/tags/xinobi-9141ff2' -Headers $headers
    $asset = @($release.assets | Where-Object { $_.name -eq 'deploy-release.ps1' })
    if ($release.draft -or $asset.Count -ne 1) { throw 'Release veya deploy araci bulunamadi.' }
    New-Item -ItemType Directory -Path 'C:\XinobiDeploy\tools' -Force | Out-Null
    $file = 'C:\XinobiDeploy\tools\deploy-release.ps1'
    Invoke-WebRequest -UseBasicParsing -Uri $asset[0].url -Headers @{ Authorization = "Bearer $token"; Accept = 'application/octet-stream' } -OutFile $file
    if ((Get-FileHash $file -Algorithm SHA256).Hash -ine '80cb36ee83fde74bc10c31fd60ad6710fc490433c2ce35f52ebc2a092cc64a9a') { throw 'Deploy araci hash uyumsuz.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-9141ff2 -WhatIf
    if ($LASTEXITCODE -ne 0) { throw 'On kontrol basarisiz; durduruldu.' }
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File $file -Release xinobi-9141ff2
    if ($LASTEXITCODE -ne 0) { throw 'Deploy basarisiz; deployment.json ve rollback sonucunu inceleyin.' }
}
finally {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Variable token -ErrorAction SilentlyContinue
}
```


## Canlı salt okunur ek bulgu

Yeni paket kurulmadan önce anonim katalog/yüzey uçları denetlendi. Elektrikli Çay Makinesi 111115 (DEMO-cf5fdee6-3326-425d-8b74-82ed9df546a9) rendering-inputs HTTP404/source_missing döndü. Diğer 6 kişiselleştirilebilir ürün HTTP404/surface_not_available (onaylı yüzey yok) döndü. Bu, kaynak dosyasının mevcut sunucu deposunda çözülemediğini kanıtlar; dosyanın silindiğini, farklı kökte olmadığını veya yedeğinin bulunmadığını kanıtlamaz. Bu üründe kaynak da eksik olduğu için yalnız maske yükleme ile onarım yapılamaz; önce gerçek kaynak dosyası/hash eşliğiyle depo/yedek düzeltmesi gerekir. Kaynak ve maske geçmişi silinmedi.

ZIP'ten çıkarılan gerçek üretim admininde aynı izole maske regresyonu ve eksik-maskeli kurtarma senaryoları PASS. Gerçek API/hesap/dosya yazımı yapılmadı.

GitHub doğrulaması: 2026-11-11T10:48:30Z UTC; üç asset uploaded, boyut ve SHA256 digest eşit; tag tam kaynak commit'e eşit.
