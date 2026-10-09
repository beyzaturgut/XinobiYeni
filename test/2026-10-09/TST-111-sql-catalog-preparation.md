# TST-111 — SQL katalog şeması, depo ve aktarım hazırlığı

- Tarih: 09.10.2026.
- Kullanıcı: İlk migration sonrası iş sırasına göre devam edilmesi istendi.
- Başlangıç: `main` / `c6838cb`; InitialCore hedefte uygulanmış.
- Durum: Kod ve migration hazır; **gerçek katalog migration/aktarımı yedek doğrulama yetkisi nedeniyle bekliyor**.

## Hazırlanan değişiklik

Migration `20261009120332_CatalogCommerce`, `catalog` şemasına Categories, Products, Variants, VariantPrices, Content ve Announcements tablolarını ekler. `0002_CatalogCommerce.idempotent.sql` tüm geçmişi içerir; rollback yalnız yeni katalog tablolarını/sürüm kaydını kaldırır, çekirdeği korur. Mevcut tablolara veri dönüşümü/silme yapmaz; boş yeni tablolarda DDL kilidi beklenir.

Kategori/ürün/varyant ilişkileri, benzersiz normalize SKU, negatif stok yasağı, varyanta bağlı pozitif kuruş fiyatı SQL kısıtlarıdır. Ürün/varyant kimlikleri ve sıraları korunur. Fotoğraflar, maskeler, galeri ve teknik özellikler aynı referansları taşır. Ürün/varyant/fiyat/stok ilişkisel; sunum ayarları ve galeri/özellik dizileri JSON kolonlarında tutulur. Medya ikili dosyaları SQL'e gömülmez.

SQL depo ayrı transaction + SQL application lock ile okuma/değiştirme/yazma yapar; farklı API süreçlerindeki güncellemeler sıraya alınır. SQL hatasında eski dosyaya otomatik dönüş yoktur. Varyant ürün düzenlemesinden kaldırıldığında eski fiyatı da kaldırılır; geçersiz FK kalmaz. SQL ortamında sabit `Catalog:StorageProvider=SqlServer` veya yerel veri dizinindeki aktarım işareti, mevcut panel sözleşmesini yeni depoya bağlar. Production panel uçları bu değişiklikle açılmaz.

Aktarım aracı yalnız Development'ta ve hosted worker/listener başlamadan çalışır. Boş katalog şartı, transaction içinde kaynaktan/SQL'den geri okuma eşitliği, aynı kaynakla tekrar no-op ve farklı SQL verisinin üzerine yazmayı reddetme vardır. Aktivasyon yalnız gerçek veri dizininin `state.json` dosyasıyla ve dosya tekrar kontrolünden sonra ignored `catalog-sql.enabled` işareti üzerinden yapılır. Eski dosya arşiv olarak korunur; henüz işaret oluşturulmadı.

Deploy paketleme, işaret sonrasında güncel SQL kataloğunu çalışan API'den okur; API kapalı veya File deposundaysa eski snapshot'a düşmeyi reddeder. Web/admin ZIP birleştirme ve hosting iş akışı değiştirilmedi; paket/deploy yapılmadı.

## Testler

- Tam .NET: **315 geçti, 0 başarısız, 1 atlandı**, toplam 316 (30 saniye). Model/snapshot bekleyen fark testi, son idempotent script eşleşmesi, katalog ilişkileri ve benzersiz anahtar testleri geçti.
- Ek bütünlük: fiyatı olmayan varyant geçerli; sıfır/negatif/çok büyük/boşa bağlı fiyatlar, yinelenen SKU ve kategori, negatif stok reddi. Ürün sırası/eşitlik, varyant kaldırınca kalan fiyatların korunması doğrulandı.
- Gerçek SQL katalog testi **çalıştırılmadı**, `XINOBI_TEST_SQL` ve `XINOBI_TEST_EMPTY_CATALOG=1` ile açıkça etkinleştirilmelidir. İlk yerel aktarımdan önce boş katalog üzerinde import/tekrar/ret, yarışan stok güncellemeleri, SQL kısıtları, SKU değişimi ve geri alma kanıtını üretir. Fixture temizliği yalnız fixture kimliklerini hedefler; test gerçek aktarılmış katalogda çalıştırılmaz.
- `node --check tools/package-iis-preview.mjs` ve `git diff --check` temiz.
- `node --test tools/commerce-snapshot-source.test.mjs`: **1/1**. SQL işareti varken eski dosyanın kullanılmadığı, API kesintisi/503/File deposunun paketi durdurduğu ve başarılı SQL yanıtının seçildiği fixture ile doğrulandı; gerçek paket veya API çağrısı yapılmadı.
- `dotnet build XinobiYeni.slnx --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false`: 0 uyarı / 0 hata. Son fixture temizliği değişikliği de bu derlemede doğrulandı.
- Önceki ilk koşuda mevcut yerel SQL bağlantısı “yapılandırılmamış” sağlık testini bozdu; test configuration'ı izole edildi. Bir tam koşuda e-posta HTTP testinde 500 oluştu, odaklı tekrar geçti; ortak izole factory sonrasında tam paket geçti. Kök neden kesinleşmiş sayılmaz.
- HTTP testleri artık ortak `IsolatedApiFactory` ile geçici dizin/File katalog/boş SQL configuration kullanır; gerçek yerel kayıtlar, SQL aktivasyon işareti ve bildirim worker'ı test tarafından kullanılmaz. E-posta/AI testleri kendi fake sağlayıcılarını korur.

## Gerçek sunucu işlemi ve engel

Yerel katalog yalnız kayıt sayılarıyla incelendi: **17 ürün, 69 varyant, 4 fiyat, 6 kategori, 1 duyuru, 115 medya dosyası**. Boşa bağlı fiyat, boş SKU, yinelenen SKU ve negatif stok yok. 65 varyanta eksik fiyat uydurulmadı. Kayıt içerikleri rapora/Git'e alınmadı.

SQL ön kontrolünde yalnız InitialCore geçmişi bulundu ve katalog tablosu olmadığı doğrulandı. SQL Server varsayılan yedek dizinine `COPY_ONLY,CHECKSUM` yedeği başarıyla alındı (545 sayfa, 0,074 saniye):

```text
C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\XinobiYeniDB_before_Catalog_20261009_8AED07EE7EA440AFBF3C9B6DA0DA1563.bak
```

Ardından `RESTORE VERIFYONLY ... WITH CHECKSUM` başarısız:

```text
Msg 262, Level 14, State 1, Server WIN-09NT6RPD8SB\SQLEXPRESS, Line 9
CREATE DATABASE permission denied in database 'master'.
Msg 3013, Level 16, State 1, Server WIN-09NT6RPD8SB\SQLEXPRESS, Line 9
VERIFY DATABASE is terminating abnormally.
sqlcmd çıkış kodu: 1
```

Bu, migration veya bağlantı hatası değildir; yedek doğrulama aşamasında sunucu yetkisidir. `BACKUP` başarılı olması `VERIFYONLY` veya restore provası geçmiş anlamına gelmez. [Microsoft VERIFYONLY izinleri](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-verifyonly-transact-sql?view=sql-server-ver16). Uygulama hesabına geniş sunucu yetkisi eklenmedi. SQL yöneticisinin yetkili hesabıyla `tools/sql/verify-catalog-backup.sql` çalıştırıp başarılı sonucu paylaşması istenmiştir; yanıt bekleniyor.

`docs/runbooks/database-migrations.md` doğrulanmış yedek şartı nedeniyle 0002 uygulanmadı, gerçek SQL katalog testi/yerel aktarım/işaret aktivasyonu yapılmadı. Yerel ürün, hesap, sipariş ve medya dosyaları değiştirilmedi. Parola Keychain'den alt sürecin ortamına alındı; çıktıya/argümana/Git'e yazılmadı.

Sonraki adım: DBA yedek doğrulama sonucu → 0002 uygula/tekrar kontrol et → boş SQL katalog entegrasyon testi → yerel dosya/medya kopyası ve yazım durdurma → doğrulanmış aktarım ve aktivasyon → API/web/panel gerçek SQL kontrolü. Hesap/oturum/adres/sipariş ve diğer modüller bundan sonraki iş dilimleridir. Faz/üretim kabulü verilmedi.
