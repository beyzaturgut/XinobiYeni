# TST-110 — İlk SQL migration uygulaması

- Tarih: 09.10.2026; seviye: LOCAL MODEL / REAL SQL INTEGRATION.
- Yetki: Proje sahibi migration iş sırasına göre başlanmasını istedi.
- Hedef: Mevcut yerel bağlantıdaki `XinobiYeniDB`, SQL Authentication / `xinobiyeni_app`.
- Önceki sürüm: Kullanıcı tabloları ve migration geçmişi yok.
- Yeni sürüm: `20261007090524_InitialCore` (EF Core 10.0.12).

## Kanıt

1. `dotnet test tests/Xinobi.Architecture.Tests --filter FullyQualifiedName~PersistenceModelTests --no-restore --verbosity minimal`: **12/12**, atlanan 0. Model/snapshot ve repo SQL script'i eşleşiyor. İlk sandbox koşusu MSBuild named pipe erişim hatası verdi; izinli koşu geçti.
2. Yazımdan hemen önce hedef adı, metadata erişimi ve tablo sayısı doğrulandı. Yanlış hedef, metadata yetkisi yokluğu veya mevcut herhangi bir kullanıcı tablosunda duracak ön kontrol kullanıldı. Hedef `XinobiYeniDB`, kullanıcı tablo sayısı **0**. Boş geliştirme hedefi olduğu için runbook'un production/verili ortam yedek şartı tetiklenmedi; yedek/restore provası yapılmış sayılmaz.
3. `infra/db/migrations/0001_InitialCore.idempotent.sql`, `sqlcmd -b` ile başarılı uygulandı. Parola Keychain'den yalnız alt sürecin ortamına aktarıldı; argümana/loga/Git'e alınmadı.
4. Tam olarak **1** migration kaydı, doğru sürüm ve `identity`, `ops`, `media` şemalarında **12** tablo doğrulandı.
5. Aynı script ikinci kez başarılı uygulandı; migration ve tablo listesi ilk sonuçla birebir eşit kaldı.
6. Çalışan API `/api/v1/health/ready`: **ready**, `sqlServer.isReady=true`, `code=ok` (11:49:35 UTC).

## Tablolar ve sınır

- `identity`: Users, Roles, Permissions, UserRoles, RolePermissions.
- `ops`: AuditLogs, OutboxEvents, InboxEvents, SyncJobs, SyncAttempts, ExternalMappings.
- `media`: Assets.
- Ek sürüm tablosu: `dbo.__EFMigrationsHistory`.

Yeni boş tablolar, ilişkiler, indeksler ve kısıtlar oluşturuldu; veri dönüşümü yok. Kilit etkisi boş hedefte DDL süresiyle sınırlıdır. Rollback script'i hazır fakat çalıştırılmadı; verili hedefte ileri düzeltme/restore runbook'u izlenmelidir. Uygulama açılışına otomatik migration eklenmedi.

Bu sonuç yalnız ilk adımı / 03.05 uygulama kanıtını tamamlar. Tüm Faz03 veya üretim geçişi kabulü değildir. Rol/izin seed'i, runtime/migration hesap ayrımı ve yedek/restore ayrıca yapılmalıdır. Yerel ürün/hesap/sipariş kayıtları ve dosyalar taşınmadı; Development depoları hâlâ dosya tabanlıdır. Gerçek e-posta, ödeme veya AI çağrısı yapılmadı.

## Sonraki iş

Mevcut sözleşmeleri koruyan kategori/ürün/varyant, kuruş cinsinden fiyat, stok, galeri ve teknik özelliklerin SQL modeli/migration'ı. Yerel ürün/varyant kimlikleri ve görsel referansları korunmalı; ikili görseller SQL'e gömülmemelidir. D02 ana veri sahipliği kesinleştirilmeden dış ERP/Mikro/pazaryeri fiyat/stok eşitlemesi başlatılmamalıdır.

Ardından hesap/oturum/adres/sipariş ve kalan modüllerin SQL depoları; son olarak doğrulanmış veri kopyasıyla idempotent aktarım, API yanıtı karşılaştırması ve kontrollü geçiş.
