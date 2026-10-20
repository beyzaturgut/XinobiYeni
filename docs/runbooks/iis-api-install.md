# API'yi IIS'e kurma (ayarları koruyarak)

**Sorun (20.10.2026):** Sunucuya özel ayarlar `XinobiYeniApi\api\appsettings.Production.json` içindeydi; güncellemede `api` klasörü silinince veya paketteki aynı adlı dosya üzerine yazılınca `AdminCatalog:Enabled` gibi ayarlar kayboluyor, ürün görselleri (`/api/v1/local-commerce/media/...`) ve admin katalog 404 oluyordu.

**Çözüm:** Windows'ta ve Development dışında API, `C:\XinobiData\config\appsettings.Server.json` dosyasını da okur (yol `XINOBI_SERVER_SETTINGS` ortam değişkeniyle değişir). Bu dosya paketteki `appsettings.Production.json` varsayılanlarını ezer; ortam değişkenleri ve komut satırı yine en üsttedir. Dosya `api` klasörünün dışında olduğu için güncellemede korunur.

## Kurulum

API ZIP'ini sunucuda bir klasöre açın; yönetici Windows PowerShell'de o klasörde:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-api.ps1 -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-api.ps1
```

Betik:
1. `appsettings.Server.json` yoksa (ilk kez) ayarları çalışan `api\appsettings.Production.json`'dan, o da katalog ayarı içermiyorsa `C:\XinobiBackups` altındaki en yeni yedekten kopyalar. `AdminCatalog.Enabled=true` içeren dosya bulamazsa hiçbir şeyi değiştirmeden durur.
2. API havuzunu durdurur, eski `api` klasörünü `api-previous-<tarih>` olarak saklar (silmez), yenisini kopyalar, havuzu başlatır. Kopyalama hata verirse eski klasörü geri koyar.
3. `health/ready` ve admin katalog (`/api/v1/local-commerce/state` → 401 beklenir) kontrolünü yazar.

Geri alma: havuzu durdur, `api` → `api-failed`, `api-previous-<tarih>` → `api`, havuzu başlat.

`repair-iis-catalog.ps1` artık aynı dış ayar dosyasına yazar (yoksa önce `api` klasöründekini oraya kopyalar).

Betikler Windows PowerShell 5.1 için yazıldı; geliştirme Mac'inde çalıştırılamadı. İlk kullanımda `-WhatIf` ile planı görün.
