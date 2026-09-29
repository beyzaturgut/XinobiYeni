# TST-009 — Doğrulanmış 1433 portuna dış SQL bağlantısı

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / `a07c242`
- Faz/görev: Faz01 erişim envanteri / uzak SQL Server bağlantı kanıtı
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS; kaynak genel IP `85.100.67.212`; Microsoft ODBC Driver 18
- Çalıştıran: Codex

## Amaç

Sunucunun kesin TCP portunun 1433 olduğu bilgisiyle `109.104.120.91:1433` dış erişimini ve ardından `XinobiYeniDB` SQL oturumunu yeniden doğrulamak.

## Önkoşullar ve test verisi

- Hedef: `109.104.120.91:1433`
- Veritabanı: `XinobiYeniDB`
- SQL kullanıcı adı: `administrator`
- Parola yalnız macOS Keychain'den süreç ortamına alındı; komut çıktısına veya rapora yazılmadı.
- Bu test şema, veri veya sunucu yapılandırması değiştirmedi.

## Komut özeti

```text
nc -vz -w 10 109.104.120.91 1433
nc -vz -G 10 109.104.120.91 1433
SQLCMDPASSWORD=<keychain> sqlcmd -S "tcp:109.104.120.91,1433" -d XinobiYeniDB -U administrator -C -l 15 -Q <safe-server-db-query>
curl --fail --silent --show-error --max-time 10 https://checkip.amazonaws.com
```

## Beklenen sonuç

- TCP üçlü el sıkışmasının kurulması.
- SQL Server pre-login ve kullanıcı doğrulamasının tamamlanması.
- `DB_NAME()` sonucunun `XinobiYeniDB` olması.

## Gerçek sonuç

- Durum: BLOKE
- İlk `nc -w 10` çağrısı macOS'ta 15 saniye içinde kendi kendine tamamlanmadı; başarı çıktısı üretmeden kontrollü olarak kesildi.
- macOS bağlantı timeout seçeneğiyle `nc -G 10`: yaklaşık 10 saniyede `Operation timed out`.
- Doğrudan ODBC/sqlcmd: 15 saniyede `Login timeout expired`, `TCP Provider: Error code 0x102`.
- Test istemcisinin dışarıdan görünen kaynak IP'si: `85.100.67.212`.
- TCP bağlantısı kurulmadığı için SQL kullanıcı/parola doğrulaması ve `XinobiYeniDB` seçimi aşamasına ulaşılamadı.

## Hata ve düzeltme

1433'ün SQL Server için doğru port olmasıyla, `109.104.120.91:1433` adresinin internetten bu istemciye açık olması farklı kontrollerdir. Sonuç hedefte portun dinlenmediğini, Windows/AWS güvenlik katmanında filtrelendiğini, NAT/public IP eşlemesinin farklı olduğunu veya yalnız belirli kaynak IP'lere izin verildiğini gösterebilir.

Sunucuda yönetici PowerShell ile şu salt-okunur kontroller yapılmalıdır:

```powershell
Get-NetTCPConnection -LocalPort 1433 -State Listen
Test-NetConnection -ComputerName 127.0.0.1 -Port 1433
Get-NetFirewallRule -Enabled True | Where-Object DisplayName -Match 'SQL|1433'
```

EC2 kullanılıyorsa instance'ın Security Group inbound kurallarında TCP 1433 için kaynak olarak geçici doğrulama amacıyla `85.100.67.212/32` bulunmalıdır. Kalıcı olarak `0.0.0.0/0` açılması önerilmez. Instance private subnet/NAT arkasındaysa public IP doğrudan instance'a yönlenmeyebilir; VPN/SSM tüneli veya uygun özel ağ yolu gerekir.

## Kanıt

Bu rapordaki güvenli hata kodları ve zaman aşımı sonuçları. Parola veya bağlantı dizesi kaydedilmedi.

## Etki ve sonraki adım

Faz01 sağlayıcı/ortam erişim envanterinde SQL erişimi açık blokaj olarak kalır. Sunucu tarafındaki `LISTEN` sonucu ve varsa AWS Security Group/NACL inbound kuralı doğrulandıktan sonra aynı test tekrarlanmalıdır. Faz sırası gereği bu blokaj çözülürken Faz03 kodlamasına devam edilmez.
