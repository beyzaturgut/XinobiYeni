# HTTPS girişi ve /api yönlendirmesi (IIS ARR)

Web ve admin `XinobiYeni` sitesinden (8014 ve 443) sunulur. API ayrı `XinobiYeniApi`
sitesinde (`http://localhost:8024`) çalışır. Tarayıcı yalnız tek kaynağı görür:
`https://109.104.120.91/` web, `/admin/` panel, `/api/v1/` API. Mobil uygulama
8024'e doğrudan bağlanmaya devam eder.

## 1. ARR proxy'yi aç

IIS Manager → sunucu düğümü → **Application Request Routing Cache** →
**Server Proxy Settings** → **Enable proxy** işaretle → Apply.
Aynı ekranda **Preserve client IP in the following header** `X-Forwarded-For` kalsın.

## 2. X-Forwarded-Proto sunucu değişkenine izin ver

IIS Manager → **XinobiYeni** sitesi → **URL Rewrite** → sağda
**View Server Variables** → **Add** → `HTTP_X_FORWARDED_PROTO`.

## 2b. Admin'in HTTPS zorunluluğu için kilidi aç

`out/admin/web.config` `<access sslFlags="Ssl" />` kullanır; IIS bu bölümü varsayılan
olarak kilitler ve panel 500.19 (0x80070021) döner. Bir kez, yönetici PowerShell'de:

```powershell
& "$env:windir\system32\inetsrv\appcmd.exe" unlock config -section:system.webServer/security/access
```

## 3. Yönlendirme kuralları

Kurallar web paketinin `out/web.config` dosyasında gelir (`tools/package-iis-preview.mjs`);
elle eklemeye gerek yoktur. `/api/*` istekleri `http://localhost:8024/api/*` adresine
iletilir ve `X-Forwarded-Proto` HTTPS girişinde `https`, aksi halde `http` olarak
yazılır; istemcinin gönderdiği değer her zaman ezilir. 1. ve 2. adım yapılmadan bu
paket kurulursa site 500 döner.

## 4. API ayarları

`C:\inetpub\wwwroot\XinobiYeniApi\api\appsettings.Production.json` paketle gelir ve
`ReverseProxy:Enabled=true` içerir. Admin katalog yazımı için
`live-sql-catalog.md` bölümündeki `AdminCatalog`, `Accounts`, `Email`, `Storage`
ayarlarını ve sunucudaki `ConnectionStrings__Xinobi` değişkenini ekle.
`ReverseProxy:Enabled` yalnız loopback'ten gelen yönlendirme başlıklarına güvenir.

## 5. Doğrulama

- `https://109.104.120.91/api/v1/health/ready` → 200
- `https://109.104.120.91/admin/` → yönetici girişi
- Girişten sonra panel oturumu açılıyor; katalogda bir fiyatı kaydedip geri al.

## Sertifika

Mevcut sertifika kendi imzalı (`CN=109.104.120.91`). Tarayıcı uyarı gösterir ve
mobil uygulama bu adrese HTTPS ile bağlanamaz. Güvenilir sertifika için sunucuya bir
alan adı yönlendirip win-acme ile Let's Encrypt sertifikası alınmalıdır.
