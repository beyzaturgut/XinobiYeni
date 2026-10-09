# TST-109 — MacBook → uzak SQL Server bağlantı teşhisi

Tarih: 09.10.2026. Kullanıcı mevcut bağlantı bilgilerinin kullanılmasını, parolanın çıktıya yazılmamasını ve aşamalı bağlantı kontrolünü istedi.

## Yapılandırma bulgusu

API `ConnectionStrings:Xinobi` değerini hem SQL readiness kontrolü hem EF Core DbContext kaydı için okur. Development’ta `appsettings.Local.json` varsayılan yapılandırma kaynaklarından sonra yüklenir. İlk kontrolde ana/Development/Local JSON dosyalarında, ilgili API user-secrets kaydında ve araç ortamında bu anahtar yoktu. Çalışan 5003 API’si de **HTTP 503 / sql_not_configured** verdi; bu nedenle başlangıçta uzak sunucuya SQL bağlantısı denemiyordu. DbContext için kodda `sql-not-configured` hızlı başarısızlık fallback’i vardır.

Önceden kaydedilen gerçek hedef TST-012/TST-017 ve runbook’tan doğrulandı:

| Alan | Değer |
|---|---|
| Sunucu | `109.104.120.91` |
| TCP portu | `64019` |
| Veritabanı | `XinobiYeniDB` |
| Kimlik doğrulama | SQL Authentication, `xinobiyeni_app` |
| Parola kaynağı | macOS Keychain; değer gösterilmedi |

Eksik `ConnectionStrings:Xinobi` anahtarı mevcut Keychain parolasıyla **Git dışında tutulan** `services/api/appsettings.Local.json` içine eklendi. Diğer ayarlar korundu; dosya erişimi kullanıcıyla sınırlandı. Sunucu `tcp:109.104.120.91,64019`, Encrypt=True, TrustServerCertificate=True (önceki sqlcmd `-C` geliştirme bağlantısıyla aynı), Connect Timeout=10 ve Persist Security Info=False ayarlandı. Tam bağlantı dizesi/parola rapora veya çıktıya yazılmadı. Üretim TLS sertifika kararına ilişkin bir değişiklik yapılmadı.

## TCP testi ve tam hata

Python `socket.create_connection` ile 10 saniye: **TimeoutError: timed out**, yaklaşık 10,04 saniye.

Sistem aracıyla teyit:

```text
nc -vz -G 10 109.104.120.91 64019
nc: connectx to 109.104.120.91 port 64019 (tcp) failed: Operation timed out
Çıkış kodu: 1
```

Hata **TCP erişimi aşamasında** oluştu. TCP bağlantısı kurulamadığından SQL login ve hedef veritabanı erişimi sorguları çalıştırılmadı. Parolanın doğru/yanlış olduğu, login veya veritabanı yetkileri bu koşudan çıkarılamaz.

## Düzeltme sonrası çalışan servis

Yerel API ayarı reload ile okudu: sonuç `sql_not_configured` yerine `sql_timeout` oldu. EF kayıt ayarının da başlangıçta alınması için mevcut `tools/dev-local.mjs` yöneticisinin API/web/admin süreçleri yeniden başlatıldı. Yalnız bu yöneticinin sahip olduğu süreçler sonlandırıldı; ayrı 5004 test API’sine dokunulmadı.

Yeni API liveness HTTP 200. SQL readiness HTTP 503 / `sql_timeout` (probe timeout=3 saniye). Web 3000 ve admin 5173 erişimi yeniden kontrol edildi. Artık gerçek SQL hedefi yapılandırılmıştır; ağ engeli çözülmüş değildir. Development ürün/hesap/sipariş verilerinin dosya deposu mimarisi bu işlemle SQL’e taşınmadı.

## Windows / ağ tarafında kontrol edilecekler

1. Kayıtlardaki `SQLEXPRESS` servisinin çalıştığını doğrula; gerçek instance ve dinlenen TCP portunu SQL ERRORLOG veya SQL Server Configuration Manager’dan belirle.
2. SQL Server Network Configuration → Protocols for SQLEXPRESS → TCP/IP etkin mi? IP Addresses / IPAll altındaki gerçek port sabit mi? Port/protokol değişirse SQL servisinin yeniden başlatılması gerekir.
3. Windows Firewall inbound kuralı doğru TCP portuna ve MacBook’un çıkış IP’sine veya VPN ağına izin veriyor mu?
4. Hosting/bulut firewall, güvenlik grubu ve varsa NAT yönlendirmesi dış `109.104.120.91:64019` adresini doğru iç SQL portuna yönlendiriyor mu? İç portun da 64019 olduğu varsayılmamalı.
5. Şirket yalnız VPN/IP izin listesi kullanıyorsa MacBook’un erişim yolu izinli mi? Timeout tek başına hangi katmanın engellediğini kanıtlamaz.

TCP açıldıktan sonra mevcut Keychain parolasıyla önce SQL login, ardından `XinobiYeniDB` seçimi ve salt okunur `SELECT DB_NAME(), ORIGINAL_LOGIN()` kontrolü yapılmalı. Mevcut testte yanlış parola, Mixed Mode veya DB yetkisi hatası görülmedi; bu aşamalara ulaşılamadı.

Kaynaklar: [Microsoft bağlantı sorunları](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/troubleshoot-connecting-to-the-sql-server-database-engine?view=sql-server-ver17), [Windows Firewall](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/configure-a-windows-firewall-for-database-engine-access?view=sql-server-ver17).

SQL’e veri/şema yazılmadı, migration çalıştırılmadı. Yerel gerçek ayar dosyası ve Keychain içeriği commit edilmedi.
