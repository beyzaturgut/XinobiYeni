# HTTP test sunucusunda hesap, MFA, Gmail ve AI servisleri

Health 200 yalnız readiness denetiminin başarılı olduğunu gösterir; MFA/özellik tablolarının,
SMTP tesliminin veya Cloudflare model çağrısının çalıştığını kanıtlamaz.

## Dosya ve SQL hazırlığı

1. API dosyalarını, production JSON'u, API web.config'i ve veritabanını yedekle.
2. `tools/diagnose-iis-services.sql` dosyasını SSMS'te API'nin kullandığı veritabanında
   çalıştır. Çıktı kullanıcı verisi/sır içermez. Eksik tabloları ve migration geçmişini karşılaştır.
3. `infra/db/migrations/` altındaki **idempotent** script'lerden yalnız eksik migration'ları
   sırasıyla uygula: 0001 çekirdek, 0002 katalog, 0003 hesap/sipariş, 0004 özellik belgeleri,
   0005 kişiselleştirme, 0006 davet, 0007 favori, 0008 MFA, 0009 admin parola kurtarma.
   SSMS'te doğru veritabanı seçili olmalı; sqlcmd kullanılırsa `-I -b` gerekir.
   0008/0009 yalnız kendi artımlı değişikliklerini içerir; önceki script'ler yerine geçmez.
   Migration geçmişi var ama tablo yoksa veya CREATE hatası çıkarsa dur; tablo/geçmiş silerek zorlama.
   Betikler veri aktarımı yapmaz; hesaplar başka depodaysa ayrı doğrulanmış aktarım gerekir.

## Yeni API ve ayar birleştirme

MFA ve kurtarma için yeni API gereklidir: eski sürüm üretimde gerçek e-posta akışını
reddeder. `node tools/package-api-iis.mjs` çıktısındaki `api/` içeriğini
`C:\inetpub\wwwroot\XinobiYeniApi\api` içine uygula; production JSON ve web.config'teki
sunucuya özel ayarları koru. İç içe `api\api` oluşturma.

Güncel `tools/repair-iis-catalog.ps1` dosyasını sunucuda şu konuma kopyala:
`C:\inetpub\wwwroot\XinobiYeni\XinobiTools\repair-iis-catalog.ps1`.

JSON'daki `Storage:LocalRoot` ve varsa makine `Storage__LocalRoot` değeri
`C:\inetpub\wwwroot\XinobiYeni\XinobiData` olmalı. Betik mevcut değeri öncelikli kullanır;
önceki depodaki dosyaları koru. Paket medyası `XinobiDeploy\out\assets\deploy-media` içindedir.

Yönetici PowerShell'de (önce sonuna `-WhatIf` ekleyerek önizlenebilir):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass `
  -File "C:\inetpub\wwwroot\XinobiYeni\XinobiTools\repair-iis-catalog.ps1" `
  -ApiDirectory "C:\inetpub\wwwroot\XinobiYeniApi\api" `
  -WebDirectory "C:\inetpub\wwwroot\XinobiYeni\XinobiDeploy\out" `
  -StorageRoot "C:\inetpub\wwwroot\XinobiYeni\XinobiData" `
  -BackupRoot "C:\inetpub\wwwroot\XinobiYeni\XinobiBackups" `
  -ApiPool "XinobiYeniApi" `
  -PublicOrigin "http://109.104.120.91:8014" `
  -EnableServices
```

Bu seçenek Gmail SMTP (587), `Accounts`/`Features` SQL sağlayıcıları, `Admin:PublicOrigin`,
admin katalog ve AI etkinlik ayarlarını birleştirir. Şifre/token eklemez, migration veya
harici AI çağrısı yapmaz. Duran API pool'unu başlatır, çalışanı recycle eder.
IIS web kökü **yalnız** `C:\inetpub\wwwroot\XinobiYeni\XinobiDeploy\out` olmalı;
yedekler, araçlar ve veri klasörleri HTTP ile sunulmamalı.

## Sunucuda kalan sırlar

Mevcut çalışan sırları koru; değerlerini sohbete, Git'e veya ZIP'e koyma.
API production JSON'unda SMTP parolası saklanacaksa mevcut `Email.Smtp` nesnesine yalnız
`Password` alanını ekle; normal Gmail parolası yerine bu hesap için uygulama parolası kullan.
Alternatif mevcut ortam anahtarları: `Email__Smtp__Password`, `ConnectionStrings__Xinobi`,
`Cloudflare__AccountId`, `Cloudflare__ApiToken` (son ikisi için `CLOUDFLARE_ACCOUNT_ID` ve
`CLOUDFLARE_API_TOKEN` de desteklenir). Ortam değişkenleri JSON'u ezer; iki Cloudflare
adlandırmasını farklı eski değerlerle birlikte bırakma. Makine ortamı değiştiyse yalnız pool
recycle yeni ortamı almayabilir; bakım penceresinde IIS servislerini yeniden başlat.

Gmail gönderen/kullanıcı: `xinobi.verify@gmail.com`, SMTP `smtp.gmail.com:587`, zorunlu STARTTLS.
Uygulama parolası: https://support.google.com/accounts/answer/185833
SMTP: https://support.google.com/mail/answer/7104828

Cloudflare anahtarının ilgili hesapta Workers AI model çağrısı yetkisi olmalı. Hesap ID 32 hex
karakterdir. `configured=true` anahtarın biçim/yapılandırma kontrolüdür; gerçek yetki/kota kanıtı değildir.

## Doğrulama

```powershell
curl.exe -sS -D - -o NUL "http://109.104.120.91:8014/api/v1/health/ready"
curl.exe -sS -D - -o NUL "http://109.104.120.91:8014/api/v1/catalog/storefront"
curl.exe -sS "http://109.104.120.91:8014/api/v1/assistant/config"
curl.exe -sS "http://109.104.120.91:8014/api/v1/design-studio/status"
```

İlk ikisi 200; Nobi config 200 ve AI isteniyorsa `aiAnswers=true`; tasarım durumu
`configured=true` olmalı. Ardından gerçek müşteri girişi, kayıt doğrulama e-postası,
admin e-posta MFA (kod yöneticinin kendi hesap adresine gider), tek kullanımlık kurtarma,
geçici ürün görsel/fiyat/stok, Nobi mesajı ve bir tasarım üretimi kontrol edilir.
Gerçek AI üretimi sağlayıcı kotası kullanır. Her birinin sonucu ayrı kaydedilir;
durum uçlarının 200 dönmesi tüm akışların tamamlandığı anlamına gelmez.

HTTP girişinde parola/oturum şifrelenmez; IP test kurulumu için kullanılır.
