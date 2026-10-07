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
SQL="sqlcmd -S tcp:<sunucu>,<port> -d XinobiYeniDB -U xinobiyeni_app -C -l 15 -b"

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
