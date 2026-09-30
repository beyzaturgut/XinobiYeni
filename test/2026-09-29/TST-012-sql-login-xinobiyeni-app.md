# TST-012 — `xinobiyeni_app` ile uzak SQL Server bağlantısı

- Tarih/saat (Europe/Istanbul): 2026-09-29 23:37
- Commit/branch: `main` / `8e872a7`
- Faz/görev: Faz01 erişim envanteri / SQL Server kimlik doğrulaması
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS; Microsoft `sqlcmd`; uzak TCP `109.104.120.91:64019`
- Çalıştıran: Codex

## Amaç

Uygulama için oluşturulan `xinobiyeni_app` SQL Login'iyle uzak SQL Server'a bağlanmayı ve `XinobiYeniDB` erişimini salt okunur bir sorguyla doğrulamak.

## Önkoşullar ve güvenlik

- Parola macOS Keychain'den süreç ortamına alındı; terminal çıktısına, rapora veya repoya yazılmadı.
- Sunucu sertifikası bağlantı testi için güvenilir kabul edildi (`-C`).
- Test yalnız aktif veritabanını, oturum adını ve SQL Server instance adını okudu; veri veya şema değiştirilmedi.

## Komut özeti

```text
SQLCMDPASSWORD=<keychain> sqlcmd \
  -S tcp:109.104.120.91,64019 \
  -d XinobiYeniDB \
  -U xinobiyeni_app \
  -C -l 10 \
  -Q <safe-identity-query>
```

## Beklenen sonuç

SQL kimlik doğrulamasının geçmesi; aktif veritabanının `XinobiYeniDB`, oturumun `xinobiyeni_app` ve instance'ın `WIN-09NT6RPD8SB\\SQLEXPRESS` olarak dönmesi.

## Gerçek sonuç

- Durum: BAŞARILI
- Veritabanı: `XinobiYeniDB`
- Login: `xinobiyeni_app`
- SQL Server instance: `WIN-09NT6RPD8SB\\SQLEXPRESS`
- Komut çıkış kodu: `0`

## Sonuç ve etki

TCP 64019 üzerinden ağ erişimi, SQL Authentication ve hedef veritabanı erişimi birlikte doğrulandı. TST-011'deki eski `Administrator` SQL Login blokajı, uygulamaya özel login oluşturulmasıyla giderildi. Faz01 için SQL Server bağlantı bilgileri artık uygulama yapılandırmasına secret store üzerinden aktarılabilir.
