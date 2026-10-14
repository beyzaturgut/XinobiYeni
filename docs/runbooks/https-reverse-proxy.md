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
Aynı şekilde `HTTP_X_FORWARDED_HOST` ekle. Kurallar dış HTTPS host'unu API'ye
iletir; API `ReverseProxy:AllowedHosts` listesindeki host'lara ve yalnız loopback
proxy'ye güvenir. Böylece admin'in Origin kontrolü backend `localhost:8024`
yerine dış adresle eşleşir. Yeni API paketi izinli host olarak `109.104.120.91`
üretir; alan adına geçilirse bu liste güncellenir.

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
- `https://109.104.120.91/api/v1/catalog/storefront` → 200; yalnız aktif ürünler
- `https://109.104.120.91/admin/` → yönetici girişi
- Girişten sonra panel oturumu açılıyor; katalogda bir fiyatı kaydedip geri al.

## Sertifika

Mevcut sertifika kendi imzalı (`CN=109.104.120.91`). Tarayıcı uyarı gösterir ve
mobil uygulama bu adrese HTTPS ile bağlanamaz. Güvenilir sertifika için sunucuya bir
alan adı yönlendirip win-acme ile Let's Encrypt sertifikası alınmalıdır.

### Arama motoru indeksleme (Faz04 SEO)

Web paketi `NEXT_PUBLIC_SITE_URL` olmadan derlenirse (bugünkü IP'li test sunucusu)
`robots.txt` tüm siteyi engeller, sitemap boştur ve her sayfa `noindex` taşır. Alan
adına geçerken paketi `NEXT_PUBLIC_SITE_URL=https://<alan-adı>` ile derleyin
(`NEXT_PUBLIC_SITE_URL=https://… node tools/package-deploy.mjs`); yalnız `https://`
adresi kabul edilir. Bu derlemede canonical bağlantıları, herkese açık sayfaların
sitemap'i, özel sayfaların (`/hesap/`, `/sepet/`, `/odeme/`, editör ve XINOBI U
adımları, `/admin/`, `/api/`) engellenmesi ve Organization/WebSite verisi etkinleşir.
Yayın sonrası `https://<alan-adı>/robots.txt` ve `/sitemap.xml` kontrol edilip
Search Console'a sitemap bildirilir.

## Webde canlı katalog ve yayın sırası

Yeni web paketi katalog/içeriği `/api/v1/catalog/storefront` üzerinden periyodik
okur; admin `/state` uç noktası personel yetkisi gerektirmeye devam eder.
Mobil typed katalog uçlarıyla aynı SQL kaynağını okur. Pasif ürünler public
yanıta girmez; stok bilgisi sepet sınırı olan 99 ile sınırlanır.

1. IIS yapılandırması, web/admin ve API dizinlerini yedekle.
2. İki forwarded değişkenine izin ver ve ARR proxy'yi etkinleştir.
3. API paketinin `api/` içeriğini `C:\inetpub\wwwroot\XinobiYeniApi\api`
   dizinine uygula. Mevcut SQL, e-posta, depolama ve AdminCatalog ayarlarını koru.
   `Catalog:AssetBaseUrl` HTTPS girişini göstermeli. API pool'unu recycle et.
4. `/api/v1/catalog/storefront` yanıtı 200 olmadan yeni webi uygulama.
5. Birleşik web/admin ZIP'inin `out/` içeriğini
   `C:\inetpub\wwwroot\XinobiYeni\out` dizinine kopyala. `out\admin\index.html`
   ve `out\web.config` bulunmalı; yanlışlıkla `out\out\admin` oluşturmamalı.
   Önceki `out\commerce-preview\state.json` artık kullanılmaz; yayın dizininden kaldır.
6. Anonim web kataloğunu, yönetici girişini ve geçici ürün ekleme/fiyat güncellemesini
   web/mobilde doğrula. Yalnız test ürününü kaldır. Gerçek ürün değiştirme.

HTTPS `/admin/` 404 dönerse IIS access logundaki `s-sitename`/site ID,
`sc-status` ve `sc-substatus` değerlerini kontrol et. 443 binding'i `XinobiYeni`
sitesine ait olmalı; admin API sitesinden sunulmaz. Fiziksel yolun altında
`admin\index.html` bulunduğunu kontrol et. 500.19, 403.4 ve 404 farklı sorunlardır;
404 için access bölümünün kilidini açmak tek başına çözüm değildir.
