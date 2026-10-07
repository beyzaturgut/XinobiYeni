# TST-091 — Faz03 03.05 çekirdek şema ve ilk migration

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~12:00–12:20
- Commit/branch: `main` / `a05264c` üzerinde çalışma ağacı
- Faz/görev: Faz03 03.05 (ilk göç) + ADR-004 kararları
- Seviye: UNIT / CONTRACT / BUILD / CONNECTIVITY
- Ortam: LOCAL · .NET SDK 10.0.401, EF Core 10.0.12, dotnet-ef 10.0.12 (yerel araç) · uzak SQL Server `109.104.120.91:64019`
- Çalıştıran: Claude Code

## Amaç

Faz03 §4 çekirdek şemasını (kimlik/rol/yetki, audit, outbox/inbox, sync job/attempt, dış eşleme, asset metadata) EF Core ile kurmak; gözden geçirilebilir idempotent SQL ve geri alma script'i üretmek; boş XinobiYeniDB'ye uygulamak (proje sahibi onayı 07.10.2026).

## Yapılanlar

- Yeni proje `services/shared/Xinobi.Persistence` (API ve test projesine bağlı; worker 03.07'de bağlanacak).
- `XinobiDbContext`: `identity`, `ops`, `media` şemalarında 12 tablo; 6 CHECK kısıtı (durum/tür değerleri, `Bytes >= 0`); 19 indeks, 9'u benzersiz; `Users.RowVersion` iyimser eşzamanlılık; `InboxEvents` birincil anahtarı `(Provider, ExternalEventId)`.
- Migration `20261007090524_InitialCore`; `infra/db/migrations/0001_InitialCore.idempotent.sql` (34 `IF NOT EXISTS` koruması) ve `0001_InitialCore.rollback.sql` (12 `DROP TABLE`, şemaları bırakır).
- API `AddXinobiPersistence` ile DbContext'i kaydeder; başlangıçta bağlantı açmaz ve migration çalıştırmaz. Bağlantı dizesi yoksa uygulama yine açılır.
- Runbook: `docs/runbooks/database-migrations.md`.

## Komut

```text
dotnet ef migrations add InitialCore …
dotnet ef migrations script --idempotent … -o infra/db/migrations/0001_InitialCore.idempotent.sql
dotnet ef migrations script InitialCore 0 … -o infra/db/migrations/0001_InitialCore.rollback.sql
dotnet test tests/Xinobi.Architecture.Tests -p:OpenApiGenerateDocumentsOnBuild=false
dotnet build XinobiYeni.slnx -c Release; git status --short packages
sqlcmd … -Q "SELECT DB_NAME() …"   # salt okunur erişim kontrolü
nc -vz -G 8 109.104.120.91 64019 ; nc -vz -G 8 109.104.120.91 8014
```

## Gerçek sonuç

- Durum: **KISMİ BAŞARILI · uygulama BLOKE**
- Testler: **38/38 başarılı** (26 mevcut + 12 yeni `PersistenceModelTests`: bekleyen model değişikliği yok, 8 benzersizlik kuralı, inbox anahtarı, iyimser eşzamanlılık, commit edilen idempotent script = migration'ların ürettiği script).
- Kayma testi doğrulaması: script'in sonuna satır eklenince ilgili test başarısız oldu, geri alınınca geçti.
- Release derlemesi (OpenAPI üretimi dahil) başarılı; `packages/` altında değişiklik yok.
- **XinobiYeniDB'ye uygulama yapılamadı:** `sqlcmd` "Login timeout expired / TCP Provider 0x102"; `nc` TCP 64019 iki denemede zaman aşımı. Aynı sunucunun IIS portu 8014 erişilebilir. Sunucu ayakta, SQL Server portu dışarıdan kapalı (güvenlik duvarı, IP kısıtı veya SQL servisi). TST-013'teki aralıklı kesintiyle aynı belirti.

## Hata ve düzeltme

- İlk taslakta `EnableRetryOnFailure` vardı; 03.07 outbox'ında gereken elle açılan transaction'larla çakışacağı için kaldırıldı, karar 03.07'ye bırakıldı.
- Keychain'de aynı servis adıyla iki kayıt var (`administrator` ve `xinobiyeni_app`); runbook hesabı açıkça (`-a xinobiyeni_app`) belirtir.

## Kanıt

`services/shared/Xinobi.Persistence/**`, `infra/db/migrations/0001_*`, `tests/Xinobi.Architecture.Tests/PersistenceModelTests.cs`, `docs/runbooks/database-migrations.md`, `docs/decisions/ADR-004-*`.

## Etki ve sonraki adım

03.05'in kod tarafı tamam; "boş veritabanında migrate up + tekrar çalıştırma" kanıtı SQL portu açılınca runbook ile alınacak. Sunucu sahibinden 64019 erişiminin (IP izni veya VPN) açılması gerekiyor. Bu arada bağımsız iş: 03.04 rol/yetki kataloğu ve 03.03 kimlik (ADR-004 T-03 karma model).
