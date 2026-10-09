# TST-112 — Yedek doğrulama tekrarı ve hesap/sipariş SQL şeması

- Tarih: 09.10.2026.
- Başlangıç: `main` / `2a40725`.
- Kullanıcı bekleyen aşamadan devam edilmesini istedi; mevcut SQL hesabının yetkisi değiştirilmedi.
- Sonuç: Yedek kontrolü hâlâ sunucu yetkisinde bekliyor. Bağımsız hesap/oturum/adres/sipariş şeması ve migration hazırlandı; SQL'e uygulanmadı.

## Tekrar denenen gerçek işlem

`tools/sql/verify-catalog-backup.sql`, mevcut Keychain parolası alt süreç ortamına aktarılıp `sqlcmd -b` ile yeniden çalıştırıldı. Parola çıktıya veya argümana yazılmadı. Aynı yedek için sonuç:

```text
Msg 262, Level 14, State 1, Server WIN-09NT6RPD8SB\SQLEXPRESS, Line 3
CREATE DATABASE permission denied in database 'master'.
Msg 3013, Level 16, State 1, Server WIN-09NT6RPD8SB\SQLEXPRESS, Line 3
VERIFY DATABASE is terminating abnormally.
Çıkış kodu: 1
```

Bu denemede yeni yedek, migration veya veri aktarımı yapılmadı. Veritabanı doğrulama yetkisi kendiliğinden yükseltilmedi. Runbook'un doğrulanmış yedek şartı sağlanmadığı için 0002 ve 0003 canlı uygulamaları bekler. Gerekli dış işlem: SQL yöneticisinin aynı doğrulama dosyasını yetkili hesabıyla çalıştırıp başarılı kanıtı paylaşması; uygulama hesabına sunucu yöneticisi yetkisi verilmesi zorunlu değildir.

## Hazırlanan bağımsız iş

`20261009132316_CustomerIdentityOrders` / `0003_CustomerIdentityOrders.idempotent.sql`:

- `identity.Users`: nullable DisplayName (80) ve Phone (24). Mevcut kullanıcı satırlarını silmez veya uydurma değerlerle doldurmaz; gerçek aktarımda mevcut profil değerleri kullanılmalıdır.
- `identity.AccessSessions`: SHA-256 token hash anahtarı, kullanıcı ve son kullanma zamanı.
- `identity.RefreshSessions`: hash, kullanıcı, aile kimliği, son kullanma/kullanılma/iptal zamanları; yeniden kullanım tespiti için gereken alanlar korunur.
- `identity.CustomerAddresses`: mevcut adres alanları, kullanıcı ilişkisi ve sıralama; filtreli benzersiz indeksle kullanıcı başına en fazla bir varsayılan adres.
- `sales.Orders`: kullanıcıya bağlı istek kimliği benzersizliği, numara/zaman/durum, teslimat adresi anlık görüntüsü, toplam/currency, kargo/geçmiş/iptal-iade JSON ayrıntıları ve rowversion.
- `sales.OrderLines`: sıra, satış anındaki ürün/varyant referansı, ad/renk/görsel ve birim fiyat/adet/toplam. Ürün veya kayıtlı adres tablosuna FK yok; katalog/adres silinmesi geçmiş siparişi etkilemez.

Sipariş satırı miktar ve tutar kısıtları mevcut demo sözleşmesine dayanır. Rastgele demo sipariş numarası için yeni bir global benzersizlik varsayımı yapılmadı; idempotency müşteri + ClientRequestId üzerinden tanımlandı. Kullanıcı silme siparişleri otomatik cascade ile silmez; D10 saklama/silme kararı henüz verilmiş sayılmaz. Ödeme, stok rezervasyonu, tahsilat, iptal/iade iş kuralları değişmedi.

Geri alma script'i yalnız 0003 tablolarını ve yeni profil kolonlarını kaldırır; InitialCore/katalog tablolarını korur. Gerçek veri üzerinde kullanılmaz; forward fix veya doğrulanmış restore gerekir. Idempotent script tüm geçmişi içerir, son script-model eşleşme testi 0003'ü kullanır.

Yerel hesap dosyası yalnız metadata sayılarıyla incelendi: 1 hesap, 1 access kaydı, 1 refresh kaydı; adres/sipariş 0. Hesap kimliği GUID biçiminde. Kişisel veriler, parola özetleri ve token hash'leri rapora/Git'e alınmadı. Dosya değiştirilmedi veya SQL'e taşınmadı.

## Doğrulama ve kapsam sınırı

- `dotnet test tests/Xinobi.Architecture.Tests --no-restore --verbosity minimal`: **321 geçti, 0 başarısız, 1 atlandı**, toplam 322 (32 saniye).
- Yeni testler: token hash/kullanıcı ilişkisi, tek varsayılan adres, tarihsel siparişlerin adres/katalogdan bağımsızlığı, silmenin siparişe cascade olmaması, müşteri bazlı istek tekilliği, sipariş concurrency ve son script/snapshot eşleşmesi.
- Gerçek SQL katalog testi atlandı; yeni şema gerçek SQL'e uygulanıp test edilmiş sayılmaz. Katalog ve hesap/sipariş servisleri canlıda dosya deposunu kullanmayı sürdürür; SQL hesap/oturum/adres/sipariş deposu ve aktarım aracı henüz yazılmadı.
- Diff kontrolü temiz. Otomatik başlangıç migration'ı veya hosting/deploy değişikliği yok.
- `dotnet build XinobiYeni.slnx --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false`: **0 uyarı / 0 hata** (9,99 saniye).

Sonraki sıra: DBA yedek doğrulaması → 0002 ve boş katalog gerçek SQL testi → katalog aktarımı/aktivasyonu → 0003 şema uygulaması ve gerçek SQL bütünlük testleri → IAccountStore SQL uygulaması, oturum/rol/adres/sipariş aktarımı. Rol/izin seed'i, runtime/migration hesap ayrımı ve restore provası ayrıca açık. Faz/üretim kabulü verilmedi.
