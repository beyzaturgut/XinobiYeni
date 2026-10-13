# API katalog yazımlarında IIS WebDAV 405 onarımı

13.10.2026 canlı tanı: anonim `PUT /api/v1/local-commerce/prices/diagnostic-nonexistent-variant`
(geçersiz sıfır fiyat, gerçek veri değiştirilmedi) API 401 yerine IIS 405.0 döndü.
IIS ayrıntılı hata sayfası `Module=WebDAVModule`, `Handler=aspNetCore`,
`Notification=MapRequestHandler` gösterdi. Katalog GET 200 ve admin state GET 401.

Microsoft, bu çakışmada ilgili uygulamanın WebDAV modül/handler kaydının
kaldırılmasını önerir:
[405 açıklaması](https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/site-behavior-performance/http-error-405-website),
[ASP.NET Core IIS modülleri](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/modules?view=aspnetcore-10.0).

RDP'de `tools/repair-iis-webdav.ps1` dosyasını `C:\XinobiTools` içine kopyala ve
Administrator PowerShell'de çalıştır:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiTools\repair-iis-webdav.ps1 -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiTools\repair-iis-webdav.ps1
```

Script önce hedef site/pool eşleşmesini ve etkin modül/handler kayıtlarını okur;
IIS configuration backup alır. Yalnız XinobiYeniApi için WebDAVModule ve WebDAV
çıkarılır; apphost'a site kapsamında yazılır, sonraki paketle kaybolmaz. API
pool'u recycle edilir. Global WebDAV kurulumu ve diğer siteler değiştirilmez;
SQL, kullanıcı, ürün ve sırlar değişmez. Kayıt zaten yoksa işlem no-op.

Geliştirme ortamında Windows/IIS olmadığı için script burada çalıştırılamadı.
Gerçek sunucu uygulaması sonrası anonim PUT/DELETE 401 olmalı. Yetkili adminle
geçici ürün/kategori/fiyat ekleme, güncelleme ve silme; public web/mobil okuması
kontrol edilmeli. Gerçek ürün üzerinde test yapılmamalı.

Kilitleme hatası çıkarsa çıktıyı paylaş; global modül/section kilitlerini
körlemesine açma. Site kapsamlı config değişiklikleri geri alınabilir; oluşturulan
IIS backup tüm configuration'ı kapsar, restore başka sitelerdeki sonraki
değişiklikleri de geri alabileceğinden önce farkı incele.
