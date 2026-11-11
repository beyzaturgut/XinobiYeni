# Dosya deposu runbook'u

Kapsam: katalog medyası (`media`, vitrinde herkese açık) ve müşteri tasarımları (`designs`, yalnız sahibine). Tüm erişim kontrolü API uçlarındadır; depo kimin okuyabileceğini bilmez. Kod: `services/api/Infrastructure/FileStore.cs` (`IFileStore`).

## Şu anki arka uç: yerel klasör

| Ortam | Kök |
|---|---|
| Development | `LocalCommerce:DataDirectory` (varsayılan `services/api/App_Data/local-commerce`) |
| Sunucu | `Storage:LocalRoot` (ör. `D:\XinobiData\files`) |
| Ayar yok, Development dışı | 503 (`feature_unavailable`), sessiz yazma yok |

Klasör düzeni: `<kök>/media/<32 hex>.<uzantı>`, `<kök>/designs/files/<id>.<uzantı>`. Anahtarlar düz addır; `..`, `/` veya bilinmeyen alan reddedilir. Yazma önce geçici dosyaya yapılır, sonra yerine taşınır.

Tek sunuculu kurulumda (IIS/Windows) bu arka uç üretimde kullanılabilir:

1. Web kökünün **dışında** bir klasör aç (ör. `D:\XinobiData\files`).
2. Uygulama havuzu kimliğine yalnız bu klasörde Değiştir yetkisi ver; başka kullanıcıya yazma verme.
3. `Storage__LocalRoot=D:\XinobiData\files` ortam değişkenini ayarla.
4. Klasörü günlük yedeğe ve SQL yedeğiyle aynı saklama süresine ekle; geri yükleme provası yap.
5. Development'taki dosyaları taşımak için `media/` ve `designs/files/` klasörlerini aynı adlarla kopyala (içerik değişmez, adlar kayıtlarda geçer).

Birden fazla API sunucusu, CDN veya otomatik ölçekleme gerekirse nesne depolamaya geçilir.

## Nesne depolamaya geçiş (S3 uyumlu: Cloudflare R2, AWS S3, MinIO)

Bunun için hesap ve anahtar gerekir; kod tarafı `IFileStore` arayüzüne yeni bir sınıf eklemekten ibarettir.

Senden/müşteriden gerekenler:

1. Sağlayıcı seçimi. Öneri: Cloudflare R2 (çıkış trafiği ücretsiz, S3 API). Alternatif AWS S3 `eu-central-1`. KVKK açısından yurt dışı aktarım bilgilendirmesine eklenmeli.
2. İki bucket: `xinobi-media` (herkese açık okuma veya CDN alan adı, ör. `media.xinobi.com.tr`) ve `xinobi-designs` (tamamen özel, public erişim kapalı).
3. Yalnız bu iki bucket'a okuma/yazma/silme yetkili bir API anahtarı (Access Key ID + Secret). Anahtar repoya girmez; sunucuda ortam değişkeni veya gizli kasada tutulur.
4. R2 için hesap kimliği (endpoint `https://<account-id>.r2.cloudflarestorage.com`), S3 için bölge.
5. Silinen tasarımlar ve sipariş görselleri için saklama kuralı (D10 ile birlikte karar).

Sonra yapılacak kod işi:

1. `AWSSDK.S3` paketi ve `S3FileStore : IFileStore` (`Save`=PutObject, `Open`=GetObject, `Delete`=DeleteObject; anahtar `area/key`).
2. `Storage:Provider=S3`, `Storage:S3:ServiceUrl`, `Storage:S3:MediaBucket`, `Storage:S3:DesignsBucket` ayarları; anahtarlar `Storage__S3__AccessKey` / `Storage__S3__SecretKey`.
3. Medya için `Catalog:AssetBaseUrl` CDN alan adına çevrilir; tasarımlar yine API üzerinden (sahiplik kontrolüyle) sunulur, gerekirse kısa ömürlü imzalı URL.
4. MinIO ile yerel entegrasyon testi, ardından mevcut dosyaların `rclone copy` ile bucket'lara aktarımı ve sayı/boyut karşılaştırması.
5. Yükleme sonrası `media.Assets` satırı (sahip, SHA-256, boyut, durum) yazılması.


## 11.11.2026 — Ürün maskesi kaydı var, dosyası yok

Admin liste/detay mask_missing veya mask_corrupt hatasını ilgili üründe gösterir; diğer ürünleri kapatmaz. Public yayın eksik maskeyi yayınlamaz. Yeni maskeler `<Storage:LocalRoot>/designs/files/surface-mask-{id}.png`; eski media maskeleri `<Storage:LocalRoot>/media/{id}.png`. SQL personalization-profiles belgesinin varlığı fiziksel dosyanın taşındığı anlamına gelmez. Ortam değişkeni/IIS override'ları dahil etkin Storage:LocalRoot kontrol edilir; yapılandırma içeriği/secret loga yazılmaz.

Önce kalıcı depo/yedek ve gerçek dosya hash'i kontrol edilir. Kaynak sağlamsa yeni WebP yüklenip açıkça onaylanabilir; bu yeni yüzey olur, eski sipariş dosyalarını yenilemez. Başka ürün/renk dosyası yedek olarak kullanılmaz; belgeyi silerek hata gizlenmez. [TST-273](../../test/2026-11-11/TST-273-missing-mask-list-recovery.md).
