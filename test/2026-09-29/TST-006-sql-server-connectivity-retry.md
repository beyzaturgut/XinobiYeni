# TST-006 — SQL Server bağlantı tekrar denemesi

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / `f957ab2`
- Faz/görev: Faz03 / uzak geliştirme SQL Server erişimi
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS; `sqlcmd`; Microsoft ODBC Driver 18 for SQL Server
- Çalıştıran: Codex

## Amaç

Sunucuda TCP/IP etkinleştirildikten sonra aynı IP, SQL kullanıcısı ve `XinobiYeniDB` bilgileriyle uzak SQL Server erişimini; önce ağ portu, sonra named instance ve doğrudan TCP oturumu seviyesinde yeniden doğrulamak.

## Önkoşullar ve test verisi

- Sunucu IP: `109.104.120.91`
- Beklenen instance: `SQLEXPRESS`
- Beklenen veritabanı: `XinobiYeniDB`
- SQL kullanıcı adı: `administrator`
- Parola macOS Keychain'den süreç ortamına alındı; komuta, rapora veya çıktıya yazılmadı.
- Sertifika zinciri geliştirme bağlantısı için `sqlcmd -C` ile güvenilir kabul edildi. Bu seçenek ağ erişimi veya kimlik doğrulaması sağlamaz.

## Komutlar

Gizli değer içermeyen temsili biçim:

```text
nc -vz -w 8 109.104.120.91 1433
SQLCMDPASSWORD=<keychain> sqlcmd -S "109.104.120.91\SQLEXPRESS" -d XinobiYeniDB -U administrator -C -l 10 -Q <server-and-db-query>
SQLCMDPASSWORD=<keychain> sqlcmd -S "tcp:109.104.120.91,1433" -d XinobiYeniDB -U administrator -C -l 10 -Q <server-and-db-query>
```

## Beklenen sonuç

- TCP portuna bağlantı kurulması.
- SQL Server instance'ının bulunması.
- SQL kimlik doğrulamasının geçmesi.
- `DB_NAME()` sonucunun `XinobiYeniDB` olması.

## Gerçek sonuç

- Durum: BLOKE
- TCP 1433: yaklaşık 8 saniye sonra `Operation timed out`.
- Named instance: yaklaşık 11 saniye sonra `Login timeout expired` ve `Error Locating Server/Instance Specified`.
- Doğrudan TCP 1433: yaklaşık 10 saniye sonra `Login timeout expired`, `TCP Provider: Error code 0x102`.
- SQL Server'a ağ oturumu kurulamadığı için kullanıcı/parola ve `XinobiYeniDB` erişimi doğrulanamadı. Bu sonuç parolanın yanlış olduğunu göstermez; kimlik doğrulama aşamasına ulaşılamadı.

## Hata ve düzeltme

TCP/IP etkin olsa da dış istemci IP:1433'e ulaşamıyor. Muhtemel kalan nedenler:

1. `SQLEXPRESS` sabit 1433 yerine dinamik bir TCP portunda dinliyor.
2. SQL Server servisi TCP/IP değişikliğinden sonra yeniden başlatılmadı.
3. Windows Firewall gerçek dinleme portuna inbound izin vermiyor.
4. Modem/router/NAT veya hosting güvenlik duvarı dış portu Windows sunucuya yönlendirmiyor.
5. Named instance keşfi için SQL Server Browser çalışmıyor veya UDP 1434 dışarıya açık değil.

Sunucuda SQL Server Configuration Manager altında `Protocols for SQLEXPRESS > TCP/IP > IPAll` bölümündeki `TCP Dynamic Ports` boşaltılıp `TCP Port` için sabit bir port (tercihen 1433 veya bildirilecek başka port) girilmeli; SQL Server servisi yeniden başlatılmalı. Aynı port Windows Firewall ve varsa dış firewall/NAT katmanında yalnız gerekli kaynak IP'lere açılmalı. Ardından gerçek port numarası paylaşılmalıdır.

## Kanıt

Bu rapordaki güvenli hata özetleri. Parola, bağlantı dizesi veya başka sır kaydedilmedi.

## Etki ve sonraki adım

SQL migration, şema ve gerçek veritabanı entegrasyon testleri hâlâ başlatılamaz. Sunucunun gerçek dinleme TCP portu ve dış firewall/NAT erişimi doğrulandıktan sonra aynı üç aşamalı test tekrarlanmalıdır.
