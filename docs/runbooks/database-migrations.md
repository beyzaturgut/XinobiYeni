# Veritabanı migration runbook'u

Kapsam: `services/shared/Xinobi.Persistence` EF Core migration'ları ve `infra/db/migrations/` altındaki gözden geçirilmiş SQL script'leri. Uygulama başlangıçta migration **çalıştırmaz** (ADR-001, Faz03 03.05).

## Yeni migration üretme

```bash
dotnet tool restore
dotnet ef migrations add <Ad> --project services/shared/Xinobi.Persistence --startup-project services/shared/Xinobi.Persistence --output-dir Migrations
dotnet ef migrations script --idempotent --project services/shared/Xinobi.Persistence --startup-project services/shared/Xinobi.Persistence -o infra/db/migrations/<NNNN>_<Ad>.idempotent.sql
```

`PersistenceModelTests` bekleyen model değişikliği kalmadığını ve commit edilen idempotent script'in migration'larla birebir aynı olduğunu denetler; script yeniden üretilmezse test kırılır. Birden fazla migration olduğunda idempotent script tüm geçmişi içerir; testteki dosya adı son script'e güncellenir.

PR'da Faz03 §5'teki alanlar yazılır: önceki sürüm, yeni tablo/indeks/kısıt, tahmini kilit etkisi, veri dönüşümü ve idempotency varsayımı.

## Uygulama (XinobiYeniDB)

Önkoşullar: SQL Server'a TCP erişimi, `xinobiyeni_app` hesabı (parola macOS Keychain'de `XinobiYeniDB-sql` / `xinobiyeni_app`), hedefin doğru veritabanı olduğu teyidi. Parola terminale, loga veya repoya yazılmaz.

```bash
export SQLCMDPASSWORD="$(security find-generic-password -s XinobiYeniDB-sql -a xinobiyeni_app -w)"
# -I: QUOTED_IDENTIFIER ON. Olmadan filtreli indeks (0003 varsayılan adres) Msg 1934 ile düşer ve işlem geri alınır.
SQL="sqlcmd -S tcp:<sunucu>,<port> -d XinobiYeniDB -U xinobiyeni_app -C -l 15 -b -I"

# 1. Önce: mevcut durum (salt okunur)
$SQL -Q "SELECT MigrationId FROM __EFMigrationsHistory" || echo "geçmiş tablosu yok (boş veritabanı)"

# 2. Yedek: production veya veri içeren her ortamda uygulamadan önce doğrulanmış yedek alınır.

# 3. Uygula
$SQL -i infra/db/migrations/0001_InitialCore.idempotent.sql

# 4. Doğrula ve tekrar çalıştırma testi (ikinci çalıştırma hiçbir şey değiştirmemeli)
$SQL -Q "SELECT MigrationId FROM __EFMigrationsHistory; SELECT s.name + '.' + t.name FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id ORDER BY 1"
$SQL -i infra/db/migrations/0001_InitialCore.idempotent.sql
$SQL -Q "SELECT COUNT(*) FROM __EFMigrationsHistory"
unset SQLCMDPASSWORD
```

Beklenen: `__EFMigrationsHistory` içinde `20261007090524_InitialCore`; `identity`, `ops`, `media` şemalarında 12 tablo; ikinci çalıştırmada hata yok ve geçmiş satır sayısı değişmez.

## Yarıda kalırsa

Faz03 §5.4: önce `__EFMigrationsHistory` ve `sys.tables` ile gerçek durumu oku. Script her adımı geçmiş tablosuna göre koşullu çalıştırdığı için yeniden çalıştırılabilir; ancak kayıt dışı elle SQL uygulanmaz. Son temiz yedek ve tam hata kodu Faz00'a yazılır.

## Geri alma

- **Boş veya yalnız test verisi olan veritabanı:** `infra/db/migrations/0001_InitialCore.rollback.sql` 12 tabloyu siler ve geçmiş kaydını kaldırır. Şemaları (`identity`, `ops`, `media`) bırakır.
- **Gerçek veri içeren veritabanı:** silici geri alma yapılmaz. İleri düzeltme (forward fix) migration'ı veya yedekten geri yükleme kararını PM verir.

## Katalog migration'ı ve yerel aktarım (0002)

`0002_CatalogCommerce.idempotent.sql` tüm migration geçmişini içerir; yeni boş hedefte önce çekirdeği, mevcut InitialCore hedefinde yalnız katalog şemasını oluşturur. `catalog.Categories`, `Products`, `Variants`, `VariantPrices`, `Content`, `Announcements` tablolarını ekler. SKU benzersiz, stok sıfır veya pozitif, fiyat mevcut varyanta bağlı ve 1–999999999 kuruş aralığında olmalıdır. Eksik fiyatlar üretilmez. Ürün/varyant kimlikleri ve görsel referansları korunur; görseller dosya deposunda kalır.

09.10.2026 yedeği `COPY_ONLY,CHECKSUM` ile başarıyla alındı, ancak uygulama hesabında `RESTORE VERIFYONLY` yetkisi yok. **0002 henüz uygulanmadı**. SQL yöneticisi `tools/sql/verify-catalog-backup.sql` dosyasını yetkili hesabıyla çalıştırıp başarılı sonucu paylaşmalı. Microsoft [VERIFYONLY izinleri](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-verifyonly-transact-sql?view=sql-server-ver16), `CREATE DATABASE` kontrolünün nedenini açıklar. Uygulama hesabına geniş sunucu yetkisi eklemek yerine doğrulamayı DBA yapabilir. VERIFYONLY başarılı olması tam restore provası değildir.

Doğrulama sonrası sıra:

1. Mevcut migration geçmişini ve katalog tablo/veri durumunu oku. Yalnız InitialCore varsa 0002 script'ini `sqlcmd -b` ile uygula; 2 geçmiş kaydı ve 6 katalog tablosunu doğrula. Aynı script'i tekrar çalıştırıp geçmişin değişmediğini kontrol et.
2. **Yerel veri aktarılmadan önce**, boş katalog için gerçek SQL entegrasyon testini çalıştır. `XINOBI_TEST_SQL` bağlantıyı yalnız alt süreç ortamından alır; `XINOBI_TEST_EMPTY_CATALOG=1` açık onayı gereklidir. `dotnet test tests/Xinobi.Architecture.Tests --filter FullyQualifiedName~SqlCatalogIntegrationTests.EmptyCatalogImportConcurrencyConstraintsAndRollback`. Test her katalog tablosunun boşluğunu kontrol eder, fixture ile import/tekrar/ret, yarışan stok güncellemeleri, SQL kısıtları ve geri alma testini yapar, fixture'ı kaldırır. Katalogda tek bir mevcut kayıt varsa test veri silme bloğuna girmeden durur. Aktarılmış gerçek katalog üzerinde çalıştırılmaz.
3. Yerel API/panel katalog yazımlarını durdur. `state.json` ve medya dizininin güvenli kopyasını al; verinin aktarım sırasında değişmemesi gerekir.
4. Development ortamında, gerçek yerel bağlantı ayarıyla aktar:

```bash
dotnet run --project services/api --no-launch-profile -p:OpenApiGenerateDocumentsOnBuild=false -- \
  --environment=Development \
  --CatalogTransfer:ImportPath=/tam/yol/services/api/App_Data/local-commerce/state.json \
  --CatalogTransfer:Activate=true
```

Aktarım modu HTTP dinleyicisi veya arka plan worker başlatmaz. İlk aktarım yalnız boş SQL kataloğuna, tek transaction içinde yapılır; SQL'den geri okunan kayıtlar JSON anlamında kaynakla aynı değilse geri alınır. Aynı kaynakla tekrar işlem no-op; farklı SQL verisinin üzerine yazılmaz. Kaynak dosya tekrar kontrol edilmeden etkinleştirme işareti oluşturulmaz. Aktarımda hata oluştuysa önce SQL ve kaynak durumunu oku; farklı kayıtları silip otomatik yeniden deneme yapma.

5. Aktarım doğrulanınca yalnız ilgili veri dizininde ignored `catalog-sql.enabled` oluşturulur. Yerel servisleri yeni kodla yeniden başlat. `/api/v1/local-commerce/state` yanıtındaki `X-Xinobi-Catalog-Storage: SqlServer` ve kaynak/SQL ürün, varyant, fiyat, kategori, galeri, maske, içerik eşitliğini doğrula. Panelde bir test ürününün fiyat/stok değişimini webde ve SQL'de kontrol edip test ürününü kaldır; gerçek ürünü değiştirerek test yapma.
6. Eski `state.json` arşivdir; sonraki katalog yazımları SQL'e gider. Deploy paketleme işareti görünce çalışan yerel API'nin SQL kataloğunu okur; API kapalıysa veya File deposundaysa eski snapshot'a düşmez. Hesap, sipariş, bildirim, tasarım ve teklif depoları bu katalog adımıyla SQL'e geçmiş sayılmaz.

`Catalog:StorageProvider=SqlServer` başka ortamda da SQL okuma kaynağını açıkça seçebilir. Panelin loopback/Development sınırı bu değişiklikte korunur; production yönetim API'sinin yetki ve kalıcı medya bağlantısı ayrı iş adımıdır. `Catalog:StorageProvider=File` yalnız bilinçli yerel geri dönüş içindir; SQL'deki yeni değişiklikler eski dosyada yoktur, otomatik geri dönüş yapılmaz.

`0002_CatalogCommerce.rollback.sql` yalnız boş/test katalogda kullanılabilir, çekirdek tabloları korur; gerçek katalog varsa ileri düzeltme veya doğrulanmış restore uygulanır. Otomatik başlangıç migration'ı yoktur.

## Hesap, oturum, adres ve sipariş şeması (0003)

`0003_CustomerIdentityOrders.idempotent.sql` tüm geçmişi içerir. 0002'den sonra `identity.Users` tablosuna nullable `DisplayName`/`Phone` ekler; `identity.AccessSessions`, `RefreshSessions`, `CustomerAddresses`, `sales.Orders` ve `sales.OrderLines` tablolarını oluşturur. Veri backfill veya hesap taşıma yapmaz. Son migration-script eşleşme testi artık bu script'i denetler.

**09.10.2026 (önceki durum):** Tekrar edilen VERIFYONLY hâlâ Msg262/3013 ile başarısız; 0002/0003 bu nedenle bekletilmişti. Önce DBA yedek doğrulaması, ardından 0002 katalog uygulama/test/aktarımı tamamlanmalıdır. 0003 tek başına SQL hesap deposunu etkinleştirmez; IAccountStore SQL uygulaması ve ayrı doğrulanmış veri aktarımı sonraki iştir. Token veya parola hash'leri çıktıya alınmaz.

**09.10.2026 — uygulandı (bilinçli sapma):** Proje sahibi, veritabanında iş verisi olmadığı (yalnız InitialCore, 12 boş tablo) için VERIFYONLY beklenmeden uygulamayı onayladı. Bu, yukarıdaki "doğrulanmış yedek" adımından kayıtlı bir sapmadır ve veri içeren hiçbir ortam için emsal değildir. 0002 tam uygulandı. 0003'ün ilk denemesi `-I` olmadan Msg 1934 ile düştü; işlem tamamen geri alındı (yarım nesne yok). `-I` ile yeniden uygulandı. Sonuç: 3 geçmiş kaydı, 23 iş tablosu; ikinci çalıştırma değişiklik yapmadı. Gerçek SQL testleri (`SqlCatalogIntegrationTests`, `SqlAccountIntegrationTests`) boş tablolarda geçti ve kendi kayıtlarını temizledi. Katalog ve hesap verisi **aktarılmadı**; aktarım ayrı onayla yapılır.

0003 sonrası toplam 3 migration kaydı, 23 iş tablosu (12 çekirdek + 6 katalog + 5 hesap/sipariş) ve ayrı geçmiş tablosu beklenir. Aynı script ikinci kez çalıştırıldığında bu sayılar değişmemelidir. Gerçek SQL üzerinde tek varsayılan adres, aynı müşteride yinelenen istek reddi, hash oturumları, FK/satır tutarı kısıtları ve katalogdan bağımsız sipariş snapshot'ları ayrıca test edilmelidir; mevcut model testleri bu gerçek kanıtın yerine geçmez.

İade/iptal ve saklama kararları D03/D10 açık kalır. Sipariş müşteri FK'sı silmeye restrict uygular; kullanıcı silmeyle tarihsel siparişleri otomatik silmek yasallaştırılmış bir karar sayılmaz. Mevcut demo akışları ödeme almaz ve gerçek stok rezervasyonu yapmaz.

`0003_CustomerIdentityOrders.rollback.sql` yalnız boş/test veriyle kullanılabilir. Sipariş/oturum/adres verilerini ve yeni profil kolonlarını siler; çekirdek/katalog şemasını korur. Gerçek veri varsa ileri düzeltme/restore ve ilgili iş sahibi kararı gerekir.

## Hesapları SQL'e aktarma (0003 sonrası)

`SqlAccountStore` hesap, oturum (yalnız SHA-256 hash), adres ve demo siparişleri 0003 tablolarına yazar; hesap başına `sp_getapplock` ile süreçler arası kilit kullanır. SQL hatası 503 döner, dosyaya geri düşmez.

Seçim:
- Development: `App_Data/local-commerce/accounts-sql.enabled` işareti varsa veya `Accounts:StorageProvider=SqlServer` ise SQL; yoksa `identity/accounts.json`.
- Diğer ortamlar: yalnız `Accounts:StorageProvider=SqlServer` ile. `Email:DeliveryMode` Smtp veya Resend olmalı (Preview reddedilir); hesap uçları hız sınırlıdır. Ayar yoksa hesap uçları 503 kalır.

Tek seferlik aktarım (Development, API durdurulmuş, hedef hesap tabloları boş):

```bash
cd services/api
dotnet run --no-launch-profile --environment Development -- --AccountTransfer:Run=true                          # dene: aktarır ve doğrular, işaret yazmaz
dotnet run --no-launch-profile --environment Development -- --AccountTransfer:Run=true --AccountTransfer:Activate=true  # boş tabloda: aktar, doğrula, işareti yaz
```

İçe aktarma yalnız boş `identity.Users`/`sales.Orders`/adres/oturum tablolarında çalışır; okuyup kaynağa karşılaştırır, fark varsa tüm işlem geri alınır. Süresi dolmuş oturumlar taşınmaz. Çıktı yalnız sayılardır. Etkinleştirmede dosya aktarım sırasında değiştiyse işaret yazılmaz. `accounts.json` arşiv olarak kalır; geri dönüş için işaret dosyası silinir (SQL'e yazılan yeni kayıtlar dosyaya geri taşınmaz).

## Özellik belgeleri (0004)

`0004_FeatureDocuments.idempotent.sql` tüm geçmişi içerir ve yalnız `ops.FeatureDocuments` tablosunu ekler (ad, JSON, zaman, rowversion; JSON `ISJSON` ile denetlenir). Bildirimler, değerlendirmeler, kurumsal teklifler, kayıtlı tasarımlar ve Nobi henüz ilişkisel modele sahip değil; her biri tek JSON belgesi olarak saklanır ve yazmalar belge başına `sp_getapplock` altında yapılır. Bu geçici bir adımdır; özellik büyüdükçe kendi tablolarına taşınır. Kayıtlı tasarım görsel dosyaları bu tabloya girmez (dosya deposu ayrı iş).

**09.10.2026:** Boş veritabanına `-I` ile uygulandı, ikinci çalıştırma değişiklik yapmadı: 4 geçmiş kaydı, 24 iş tablosu. `SqlFeatureDocumentTests` gerçek SQL'de üç ayrı süreç gibi davranan yazıcıyla kayıp güncelleme olmadığını doğruladı.

Seçim: Development'ta `features-sql.enabled` işareti veya `Features:StorageProvider=SqlServer`; diğer ortamlarda yalnız bu ayar. Ayar yoksa Development dışında bu özellikler 503 döner.

Tek seferlik aktarım (Development, API durdurulmuş, tablo boş):

```bash
cd services/api
dotnet run --no-launch-profile --environment Development -- --FeatureTransfer:Run=true --FeatureTransfer:Activate=true
```

Mevcut JSON dosyaları okunur, geçersiz JSON varsa hiçbir şey yazılmaz; SQL'deki içerik kaynağa karşı karşılaştırılır. Dosyalar aktarım sırasında değiştiyse işaret yazılmaz. `0004_FeatureDocuments.rollback.sql` yalnız boş/test veride kullanılır.
