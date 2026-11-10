# Müşteri hesabını askıya alma, etkinleştirme ve silme

10.11.2026. Admin → **Müşteriler → İncele**. [TST-271](../../test/2026-11-10/TST-271-customer-account-management.md).

| İşlem | Yetki | Sonuç |
|---|---|---|
| Liste/detay | `customers.read` + personel/MFA | Maskeli müşteri dizini. Personel/rol taşıyan hesaplar dışarıda. |
| Askıya al | `customers.read` + `customers.write` | Aktif hesap `disabled` olur; mevcut access/refresh oturumları iptal edilir, giriş ve yeni token/sipariş üretimi engellenir. |
| Yeniden etkinleştir | `customers.read` + `customers.write` | Askıdaki hesap `active` olur; müşteri yeni giriş yapar. Eski oturumları yeniden geçerli olmaz. |
| Hesabı sil | `customers.read` + `customers.delete` | Hesap `deleted` olur ve oturumları iptal edilir. Bu yönetim ekranından yeniden etkinleştirilemez. Siparişler, satırlar, dosyalar, profil ve adresler korunur. |

Mevcut admin/super_admin rolleri bu izinleri mevcut rol kataloğundan alır. Menü gizlemek yetki değildir; her yazma sunucuda ayrıca denetlenir. Bu ekran personel hesabını değiştiremez. Doğrulama bekleyen hesap etkinleştirilerek e-posta doğrulaması atlanamaz; askıya alma yalnız aktif hesapta sunulur. `Silindi` satırı geçmiş inceleme için dizinde kalır. Hesap silme kişisel verilerin dosya/veritabanından fiziksel temizliği işlemi değildir.

## Ekran davranışı

Müşteri kimliği ve maskeli bilgiler incelenir; işlem düğmesi onay alanını açar. Askıya alma/etkinleştirme açık onay kutusu gerektirir. Silmede ayrıca **SİL** yazılır. Sunucu doğrulamadan başarı gösterilmez. İşlem sürerken çift gönderim, pencere kapatma ve panel navigasyonu engellenir. Hata veya belirsiz/yanlış başarı yanıtında onay girdileri korunur; yeni yazma için önce **Güncel müşteri kaydını yükle** kullanılır.

Her işlem listeden/detaydan gelen `version` ile gönderilir. SQL mevcut User.RowVersion değerini, yerel dosya deposu hesap yönetimi sürümünü kullanır. Eski istek 409 alır; başka işlemin sonucunu ezmez. Yetkisiz istek 403, oturumsuz istek 401, müşteri olmayan/hedefi bulunmayan istek 404 olur. SQL bağlantı hatası 503'tür; dosya kopyasından başarı veya boş veri üretmez.

## API / saklama

- GET `/api/v1/admin/customers` ve `/{id}`; mevcut sayfalama, arama ve maskeleme korunur, satıra optional `version` eklenir.
- POST `/{id}/access`: `{status: "disabled" | "active", expectedVersion: "..."}`.
- POST `/{id}/delete`: `{expectedVersion: "..."}`. Access yolundan `deleted` göndermek reddedilir.
- SQL'de registry + aynı hesap application lock altında sürüm, müşteri türü/rol ve durum doğrulanır; durum, oturum iptali ve güvenli audit aynı transaction'da commit olur. Refresh/token/sipariş kilidi aynı hesap üzerinden kontrol edilir; askıya alma sonrası kilide giren checkout sipariş oluşturamaz.
- Development açık file hesabı tek API süreci içindir; aynı işlemler tek semaphore altında çalışır; durum, sürüm, token iptali ve `customerManagementAudits` aynı accounts.json atomik değişiminde saklanır. Disk yazılamazsa 503; başarılı audit veya durum değişimi kaydedilmiş sayılmaz. File yönetim audit geçmişi bu dosyada korunur; önceki transfer aracının SQL'e taşıdığı bir alan değildir.
- Audit kimlik/durum/zaman/trace ve oturum/sipariş koruma bilgisini içerir; parola/token, e-posta veya serbest metin gerekçe eklenmez. SQL ayrıntılı kaydın eylemleri `customer.suspend`, `customer.activate`, `customer.delete` olur.
- Dosya kayıtlarının eski JSON'unda durum yoksa constructor varsayılanı active kalır. Yeni status alanı ve optional managementVersion geriye okuma sağlar; dosyadan SQL import durum alanını korur, silinmiş hesabı aktif hale getirmez.

## SQL yayın önkoşulu: migration 0010

**Bu teslimde gerçek sunucuya uygulanmadı.** Önceki migration `20261013123801_AdminPasswordResetPersistence`; yeni `20261110082212_CustomerAccountDeletion`. [İdempotent script](../../infra/db/migrations/0010_CustomerAccountDeletion.idempotent.sql) yalnız identity.Users üzerindeki CK_Users_Status kısıtına `deleted` değerini ekler. Yeni sütun/tablo veya gerçek kullanıcı durumunu değiştiren backfill yoktur. Kısıt değişimi tablo üzerinde schema kilidi ve veri doğrulaması gerektirebilir; bakım planı ve doğrulanmış yedekle mevcut [migration akışını](database-migrations.md) kullanın.

Uygulama başlangıçta migration çalıştırmaz. SQL'de silme denenmeden önce script uygulanmalı; aynı script ikinci çalıştırmada migration geçmişine göre atlar. [Rollback](../../infra/db/migrations/0010_CustomerAccountDeletion.rollback.sql), deleted kayıt varsa açıklayıcı hata verip durur; hesapları otomatik etkinleştirmez veya silmez. Bu durumda ileri düzeltme/yedek planı değerlendirilir. Gerçek veriyi silerek rollback yapılmaz.

Gerçek SQL kabulü yalnız açık opt-in ile **yeni yerel SQLEXPRESS test veritabanında** hazırlanmıştır:

```powershell
$env:XINOBI_CUSTOMER_MANAGEMENT_DISPOSABLE_SQL = '1'
dotnet test tests/Xinobi.Architecture.Tests --filter FullyQualifiedName~CustomerManagementSqlTests
Remove-Item Env:XINOBI_CUSTOMER_MANAGEMENT_DISPOSABLE_SQL
```

Test kendi rastgele `XinobiCustomerManagementTest_...` veritabanını oluşturur; önce 0009, ardından 0010/tekrar, sürüm/yarış/oturum/sipariş/audit ve korumalı rollback'i kontrol edip yalnız oluşturduğu DB'yi kaldırır. Kullanıcı bağlantısıyla canlı/var olan DB'ye yönlendirilemez. Bu ortamda SQLEXPRESS/opt-in yok; **atlandı, SQL kabulü açık**.

## Yerel çevrimdışı panel

Development'ta açıkça seçilmiş File hesabı artık dizini ve işlemleri kendi kopyasından sağlar. Bu, SQL hatasında otomatik fallback değildir. Geçici süperadminin izole çalışma alanında müşteri kaydı yoksa liste boş kalır; sunucudaki güncel müşteriler kendiliğinden kopyalanmaz. Bu çalışma alanında yapılan işlemler canlı SQL'e aktarılmaz. Geçici erişim ayarları ve credential dosyaları repoya/pakete eklenmez.
