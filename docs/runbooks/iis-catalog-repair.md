# IIS katalog medya ve hesap yapılandırma onarımı

Canlı tanı: ürün görseli `/api/v1/local-commerce/media/...` 404, aynı dosya
`/assets/deploy-media/...` 200; gerçek olmayan hesapla web login 503
`account_unavailable`. SQL katalog okuması ve readiness 200. Bu, mevcut API
paketinin SQL katalog ayarına sahip olduğunu ancak hesap/admin/medya ayarlarının
eksik veya devre dışı olduğunu gösterir; gerçek bir hesap kullanılmadı.

Sunucuya `tools/repair-iis-catalog.ps1` dosyasını kopyala. Administrator Windows
PowerShell'de (örnek hedef `C:\XinobiTools`):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiTools\repair-iis-catalog.ps1 -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiTools\repair-iis-catalog.ps1
```

Bypass yalnız bu alt süreçte geçerlidir; kalıcı execution policy değiştirilmez.
Script Windows PowerShell 5.1 söz dizimiyle hazırlanmıştır; geliştirme Mac'inde
çalıştırılamadı. Gerçek sunucu çalıştırması ve sonrasında smoke kontrolü gerekir.

Script mevcut production JSON'u web kökü dışında yedekler; diğer ayarları ve
sırları korur. SQL Accounts/Catalog, AdminCatalog, Storage ve HTTPS proxy ayarını
birleştirir. Web paketindeki hash adlı medya dosyalarını kalıcı `media` dizinine
kopyalar; farklı mevcut dosyaların üzerine yazmaz. API pool kimliğine depolama
dizini izni verir ve yalnız API pool'unu recycle eder. SQL migration, import veya
hesap/ürün değişikliği yapmaz. Makine Storage__LocalRoot ayarı varsa onu kullanır.

SQL bağlantısı production JSON'da, IIS environmentVariables'da veya makine
ortamında zaten çalışıyor olmalıdır. Accounts__StorageProvider/AdminCatalog__Enabled
gibi ortam değişkenleri JSON'u ezer: hata sürerse IIS'teki mevcut environment
ayarlarını kontrol et. JSON'da SQL parolasını yeniden yazma veya sohbetle paylaşma.
Email:DeliveryMode=Preview üretimde reddedilir; mevcut gerçek Smtp/Resend ayarını
koru. Giriş mevcut hesabı kullanır; yeni kayıt için e-posta sağlayıcısı gerekir.

Sonrasında readiness 200, bilinen medya 200, var olmayan hesapla login 401 olmalı
(503 değil); gerçek yetkili hesapla panel girişini kontrol et. Sertifika güven
problemi bu onarımdan ayrıdır. Geri alma: yedek production JSON'u geri yükle ve
API pool'unu recycle et; SQL veya medya dosyalarını silme.
