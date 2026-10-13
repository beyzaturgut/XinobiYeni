# Canlı API katalog kaynağı

IIS API paketleme aracı (`node tools/package-api-iis.mjs`) katalog için
`Catalog:StorageProvider=SqlServer` üretir. Snapshot yolu artık pakete yazılmaz.
Mevcut API, bu ayarla ürün, kategori ve ana sayfa/duyuru verisini SQL'den okur.

Canlı uygulama sırası:

1. Hedef API site/application, fiziksel dizin, pool ve binding'i doğrula.
   Mevcut API dosyalarını ve sunucuya özel yapılandırmayı yedekle.
2. Hedef SQL'de katalog migration'ı ve doğrulanmış katalog aktarımının tamamlandığını
   kontrol et. Boş SQL kataloğu yayına hazır değildir. Aktarım için
   `database-migrations.md` runbook'unu kullan; mevcut verinin üzerine yazma.
3. `ConnectionStrings__Xinobi` bağlantısını sunucuda güvenli biçimde yapılandır.
   Bağlantı dizesini Git'e, ZIP'e veya deployment kaydına yazma.
4. Mevcut API'yi güncelle. Sunucuya özel ayarları koru; katalog sağlayıcısının
   `SqlServer` olduğunu doğrula. Medya referanslarının hedef dosya deposunda/webde
   mevcut olduğunu kontrol et. Uygulama migration veya veri aktarımı çalıştırmaz.
5. İlgili API pool'unu yeniden başlat. `/api/v1/health/ready`,
   `/api/v1/catalog/products`, `/api/v1/catalog/categories`,
   `/api/v1/content/home`, `/api/v1/content/announcements` ve bilinen bir ürünün
   detayını kontrol et. Ürün/varyant, fiyat/stok ve medya URL'lerini SQL ile karşılaştır.
6. Gerçek yayın sonucunu `deployments/` altında kaynak commit, hedef, yedek,
   migration durumu ve HTTP kontrol kanıtıyla kaydet. Paket hazırlamak canlı yayın değildir.

Geri alma: önceki API dosyalarını/yapılandırmasını geri yükle ve ilgili pool'u
yeniden başlat. SQL verisini silme. SQL hatasında API snapshot'a otomatik dönmez.
Üretim admin katalog uçları aşağıdaki ayrı ayarla açılır.

## Admin katalog yazımlarını etkinleştirme

API'nin sunucuya özel `appsettings.Production.json` dosyasında mevcut ayarları koruyarak:

```json
{
  "AdminCatalog": { "Enabled": true },
  "Catalog": { "StorageProvider": "SqlServer" },
  "Accounts": { "StorageProvider": "SqlServer" },
  "Email": { "DeliveryMode": "Smtp" },
  "Storage": { "LocalRoot": "C:\\XinobiData" }
}
```

SMTP sağlayıcınız Resend ise `DeliveryMode` değeri `Resend` olmalı. SMTP/Resend
kimlik bilgileri ve `ConnectionStrings__Xinobi` sunucuda kalır. Depolama dizini
web kökünün dışında tutulur; API pool kimliğine bu dizinde Modify izni verilir.
Mevcut yüklenen dosyalar bu dizinin `media` alt klasöründe bulunmalıdır.
Admin ve API aynı HTTPS kaynağında sunulmalıdır (örneğin `/admin/` ve `/api/v1/`).
Başka Origin ve HTTP üzerinden katalog yönetimi reddedilir.

İlk yönetici hesabı SQL hesap deposunda kayıtlı olmalıdır. İlk süper yönetici
sunucu konsolunda API dizininden oluşturulur:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
dotnet Xinobi.Api.dll bootstrap-super-admin yonetici@alanadiniz.com
```

E-posta yerine gerçek kayıtlı hesabı kullan. Komut mevcut süper yönetici varsa
ikinci bir hesap yükseltmez. Hesap yoksa önce e-posta doğrulamalı kayıt yapılır.
Ürün/kategori için `catalog.write`, fiyat için `pricing.write`, içerik/duyuru
için `content.write`, yükleme için `media.write` gerekir. `/state` personel ve
`catalog.read` gerektirir. Ürün medya GET'i herkese açıktır. Diğer panel
modülleri bu ayarla açılmaz.

### Gereken bilgileri IIS'ten bulma

1. Sunucuda **IIS Manager → Sites → API sitesi → Basic Settings** aç.
   Site adı, Physical path ve Application pool adını kaydet.
2. **Bindings** aç. HTTPS hostname/port bilgisini kaydet; admin'in adres çubuğundaki
   kaynakla aynı olması gerekir. API ayrı siteyse mevcut `/api/v1/` yönlendirmesini
   web sitesi **URL Rewrite** ekranında kontrol et.
3. API fiziksel dizininde `appsettings.Production.json` aç. Yalnız sağlayıcı
   adlarını ve `Storage:LocalRoot` yolunu kontrol et; sırları paylaşma.
   SQL bağlantısı burada yoksa **System Properties → Advanced → Environment
   Variables** ve API `web.config` içindeki `environmentVariables` bölümünü kontrol et.
4. **Application Pools → ilgili pool → Advanced Settings → Identity** aç.
   Varsayılan ApplicationPoolIdentity için dosya izinlerinde kullanıcı
   `IIS AppPool\\<pool adı>` olur.
5. SQL Server Management Studio'da ilgili veritabanında `catalog.Products`,
   `catalog.Variants` ve `identity.Users` kayıtlarının bulunduğunu kontrol et.
   Migration geçmişi `__EFMigrationsHistory` tablosundadır. Bağlantı parolasını,
   kullanıcı kayıtlarını veya tokenları mesaja kopyalama.
6. Site/pool adı, fiziksel yol, admin/API HTTPS adresi ve sunucuya erişim yöntemini
   paylaş. Bunlar uzaktan uygulama için yeterli başlangıç bilgileridir.

Yayın sonrası anonim katalog yazımı 401, müşteri/yetkisiz personel 403 almalı;
yetkili yöneticiyle geçici bir ürün oluşturup fiyat/stok güncellemesini SQL'de
ve public katalogda doğrula, sonra yalnız test ürününü kaldır. Medya yükleme ve
public GET'i kontrol et. Gerçek ürünleri test amacıyla değiştirme.
