# TST-011 — TCP 64019 üzerinden SQL Server kimlik doğrulaması

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / `a3f37f3`
- Faz/görev: Faz01 erişim envanteri / SQL Server kimlik doğrulaması
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS; Microsoft ODBC Driver 18; uzak TCP `109.104.120.91:64019`
- Çalıştıran: Codex

## Amaç

Erişilebilir olduğu doğrulanan TCP 64019 üzerinden SQL Server oturumu açmak ve `XinobiYeniDB` veritabanı erişimini salt okunur sorguyla doğrulamak.

## Önkoşullar ve test verisi

- Parola macOS Keychain'den süreç ortamına alındı ve hiçbir çıktıya/rapora yazılmadı.
- Kullanıcı adının hem daha önce kaydedilen `administrator` hem de bildirilen `Administrator` biçimi denendi.
- Yalnız sunucu adı, aktif veritabanı ve ürün sürümünü okuyacak sorgu kullanıldı; veri veya yapılandırma değiştirilmedi.

## Komut özeti

```text
SQLCMDPASSWORD=<keychain> sqlcmd -S "tcp:109.104.120.91,64019" -d XinobiYeniDB -U administrator -C -l 15 -Q <safe-server-db-query>
SQLCMDPASSWORD=<keychain> sqlcmd -S "tcp:109.104.120.91,64019" -d master -U administrator -C -l 15 -Q <safe-server-db-query>
SQLCMDPASSWORD=<keychain> sqlcmd -S "tcp:109.104.120.91,64019" -d XinobiYeniDB -U Administrator -C -l 15 -Q <safe-server-db-query>
```

## Beklenen sonuç

SQL kimlik doğrulamasının geçmesi, sunucu bilgilerinin okunması ve aktif veritabanının `XinobiYeniDB` olması.

## Gerçek sonuç

- Durum: BLOKE
- Üç denemede de SQL Server `Login failed for user` yanıtı verdi.
- `master` denemesi de reddedildiği için hata yalnız `XinobiYeniDB` kullanıcı eşlemesine özgü görünmüyor.
- TCP timeout veya instance bulma hatası oluşmadı; ağ/port katmanı artık başarılı, blokaj SQL kimlik doğrulama katmanında.

## Hata ve düzeltme

`sqlcmd -U` SQL Authentication kullanır. Verilen `Administrator` hesabı yalnız Windows yerel/yönetici hesabıysa SQL Login olarak kullanılamaz. Diğer olasılıklar SQL Server'ın yalnız Windows Authentication modunda olması, SQL login'in bulunmaması/devre dışı olması veya Keychain'deki parolanın güncel olmamasıdır.

Sunucuda yetkili SSMS oturumuyla şu kontroller yapılmalıdır:

```sql
SELECT SERVERPROPERTY('IsIntegratedSecurityOnly') AS is_windows_auth_only;
SELECT name, type_desc, is_disabled
FROM sys.server_principals
WHERE name IN ('administrator', 'Administrator');
```

Uygulama için Windows Administrator hesabını kullanmak yerine ayrı ve en az yetkili bir SQL Login önerilir. Login'e `XinobiYeniDB` içinde ayrı kullanıcı eşlenmeli; gereken roller migration ve çalışma zamanı için ayrıca sınırlandırılmalıdır. Parola mesaja veya repoya yazılmamalı, Keychain/secret store üzerinden aktarılmalıdır.

## Kanıt

Güvenli hata özeti: `Microsoft ODBC Driver 18 for SQL Server: Login failed for user`. Parola ve connection string kaydedilmedi.

## Etki ve sonraki adım

Faz01 SQL erişim maddesinde port erişimi tamam, kimlik doğrulaması blokeli. Hesap sahibi SQL Authentication/Mixed Mode durumunu ve ayrı SQL Login'i doğruladıktan sonra yeni kullanıcı adıyla Keychain kaydı oluşturulmalı; önce `master`, sonra `XinobiYeniDB` seçimi tekrar test edilmelidir.
