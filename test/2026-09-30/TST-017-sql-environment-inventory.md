# TST-017 — Uzak SQL Server ortam ve yetki envanteri

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `efd08af`
- Faz/görev: Faz01 SQL ortam envanteri
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS `sqlcmd` → uzak SQL Server TCP 64019
- Çalıştıran: Codex

## Amaç

TST-012'de doğrulanan uygulama hesabıyla hedef veritabanının sürümünü, durumunu, mevcut kullanıcı tablolarını, EF migration geçmişini ve etkili veritabanı yetkilerini salt okunur olarak belirlemek.

## Güvenlik ve komut

- Parola yalnız macOS Keychain'den süreç ortamına alındı; çıktıya veya repoya yazılmadı.
- Sorgu yalnız sistem kataloglarını ve izin fonksiyonlarını okudu.
- Tekrar kullanılabilir sorgu: `tools/sql/read-only-environment-inventory.sql`.

```text
SQLCMDPASSWORD=<keychain> sqlcmd \
  -S tcp:109.104.120.91,64019 \
  -d XinobiYeniDB \
  -U xinobiyeni_app \
  -C -l 15 \
  -i tools/sql/read-only-environment-inventory.sql
```

## Beklenen sonuç

SQL oturumunun açılması; sürüm, veritabanı durumu, tablo/migration sayısı ve hesap yetkilerinin okunması.

## Gerçek sonuç

- Durum: BAŞARILI
- SQL Server ürün sürümü: `16.0.1000.6`
- Edition: `Express Edition (64-bit)`; engine edition `4`
- Veritabanı: `XinobiYeniDB`, `ONLINE`, recovery `SIMPLE`
- Compatibility level: `160`
- Collation: `SQL_Latin1_General_CP1_CI_AS`
- Kullanıcı tablosu: `0`
- `dbo.__EFMigrationsHistory`: yok (`0`)
- `xinobiyeni_app`: `db_owner=1`, `CREATE TABLE=1`, `VIEW DEFINITION=1`
- Komut çıkış kodu: `0`

## Hata ve düzeltme

İlk tek satırlık metadata komutu, izin sorgusundaki tırnakların kabuk tarafından ayrıştırılması nedeniyle SQL syntax hatası verdi. Sorgu sır içermeyen `.sql` dosyasına taşındı ve tekrar başarıyla çalıştırıldı. İlk hata veritabanı bağlantısı veya yetki hatası değildi.

## Etki ve sonraki adım

Hedef veritabanı boş ve migration geçmişi bulunmuyor; Faz03 ilk EF migration'ı temiz veritabanı senaryosu olarak planlanabilir. Mevcut login migration için yeterli fakat runtime uygulaması için gereğinden geniş `db_owner` yetkisine sahip. Faz03'te migration ve runtime hesapları ayrılmalı, en az yetki uygulanmalı ve gerçek migration öncesi yedek/geri dönüş yöntemi belgelenmelidir.
