# TST-271 — Müşteri hesabı yönetimi

10.11.2026 · Taban `c7139a4`. Admin Müşteriler → İncele altında askıya al / yeniden etkinleştir / hesap sil eklendi. [Kullanım, yetki ve SQL yayın önkoşulu](../../docs/runbooks/customer-account-management.md).

## Uygulama ve güvenlik

- Görüntüleme `customers.read`; askıya alma/etkinleştirme ayrıca `customers.write`; silme ayrıca yeni `customers.delete` gerektirir. Personel/MFA, origin/no-store ve cookie CSRF kuralları korunur. Personel/rol taşıyan hesap hedef olamaz. Access yolundan deleted durumu göndererek ayrı yetki atlanamaz.
- Askıya alma disabled; yeniden etkinleştirme active; silme deleted durumudur. Silinmiş hesap bu ekrandan açılamaz. Pending verification hesabı aktive edilerek doğrulama atlanamaz. Silme profili/adresleri/siparişleri ve dosyaları fiziksel silmez; müşteri dizininde Silindi olarak kalır.
- Access/refresh tokenlar atomik iptal edilir; eski oturum reaktivasyonda geri gelmez. Login, refresh, token üretimi ve access-token okuma aktif hesap gerektirir. Sipariş oluşturma, hesap kilidi içinde aktifliği yeniden denetler; askıya alma sonrası kilide ulaşan in-flight checkout yeni sipariş oluşturmaz.
- Opaque müşteri version değeri eski isteği 409 ile reddeder. SQL User.RowVersion, registry+hesap application lock; dosya deposunda semaphore + managementVersion kullanılır. Normal profil/şifre, müşteri yetkileri ve sipariş bağı korunur; dosyadan SQL aktarım hesabın status değerini korur.
- SQL'de durum+session iptali+güvenli audit aynı transaction; Development File'da aynı atomik accounts.json değişimindedir. Disk hatasında değişmiş durum veya başarılı audit kalmaz. Audit serbest metin, ham iletişim bilgisi, parola veya token içermez; aktör, hedef kimliği, durumlar, zaman/trace tutulur.
- UI açık onay, silmede SİL girişi, rol bazlı kontroller, bekleme/çift gönderim/kapama/navigasyon kilidi içerir. Sunucunun kimlik/durum/yeni sürüm yanıtı doğrulanmadan başarı yoktur. Hata veya belirsiz sonuçta form korunur; yeniden işlem için güncel kayıt GET ile yüklenir.
- Açık Development File seçimi müşteri liste/detayını da sağlar. SQL hatasında File'a düşmez; erişilemeyen SQL 503 olur. Mevcut yerel çevrimdışı kopya bu modda çalışır; yeni gerçek müşteri kaydı eklenmedi.

## Son doğrulama

| Paket | Sonuç |
|---|---|
| Tam API paketi (son kod) | **637 PASS / 30 SKIP / 0 FAIL**, toplam 667 |
| API Release | **0 uyarı / 0 hata** |
| Odaklı müşteri / eski AI test izolasyonu | 11 PASS / 1 SKIP; tam pakette de yeniden geçti |
| CustomerManagementTests | Yaşam döngüsü, eski token/refresh/IssueTokens, in-flight sipariş reddi, sipariş/adres/audit korunumu; staff hedefi, çift yazma/409; MFA/read/write/delete ayrımı, invalid status/sürüm, disk hatası, SQL fail-closed ve fixture dizin izolasyonu PASS |
| Admin müşteri tarayıcı paketi | PASS 320/390/768/1440, %200 metin, axe; suspend/activate/delete, SİL/onay, bağımsız yetki, çift tıklama/navigasyon kilidi, hata ve yanlış başarı sonrası yalnız GET ile yeniden yükleme |
| Ortak admin durumları | 15 senaryo PASS; loading/empty/error/403, doğrulanmayan başarı ve modal/klavye odağı regresyonları |
| Admin lint / TS / üretim build | PASS; mevcut AuditHistory set-state-in-effect uyarısı aynı |
| OpenAPI / TS / Dart üretimi | `pnpm contracts:generate` PASS; yeni request tipleri, admin uçları ve optional row version birlikte üretildi |
| TS istemci / web TS / ESLint / production export | PASS |
| Dart istemci testleri | **13 PASS**; yeni müşteri erişim/silme sürümleri ve deleted durum round-trip testi dahil |
| Flutter analiz / tüm testler | **No issues found / 302 PASS** |
| SQL model/migration | Bekleyen model farkı yok; 0010 ileri script ve migration aralığı eşliği, mevcut rollback/model kontrolleri PASS; gerçek DB'ye uygulanmadı |
| Yerel gerçek tarayıcı | Geçici superadmin ile yeni sürümde giriş yapıldı; müşteri ekranı açık, bu ayrı kopyada 0 müşteri olduğu doğru boş durumla gösterildi. Gerçek müşteri üzerinde suspend/delete çalıştırılmadı. |

Başarı sayıları son TRX'teki test sonuçlarından okunur; atlananlar başarılı sayılmaz. Yeni gerçek SQL kabulü `CustomerManagementSqlTests.SqlMigrationConcurrencySessionRevocationAuditAndGuardedRollback` yalnız açık `XINOBI_CUSTOMER_MANAGEMENT_DISPOSABLE_SQL=1` ile yeni, rastgele isimli yerel SQLEXPRESS DB'de çalışır. Mevcut/uzak kullanıcı DB'sine bağlanamaz; bu ortamda **atlandı**. Önceki 29 dış bağımlılıkla toplam 30 skip vardır.

## Test izolasyonu düzeltmesi

İlk tam koşuda iki eski AI testi, yerel çevrimdışı ayarlardaki WorkerEnabled=false nedeniyle queued kaldı. Ayrıca Storage:LocalRoot ve DesignStudio:DataDirectory ayarlarının fixture'lara sızması engellendi. IsolatedApiFactory bunları kendi geçici klasörüne sabitler ve dış AI'ı kapatır. İlgili iki test kendi sahte sağlayıcı işleyicisini açıkça kaydeder. Yeni test bu köklerin geçici dizin olduğunu denetler. Ardından tüm paket temiz geçti. İlk başarısız koşu son sonuç olarak sunulmadı; gerçek AI/kargo sağlayıcısı veya canlı SQL çağrısı yapılmadı. Yerel kurtarma kopyasındaki dosyalara körlemesine temizlik/geri yazım yapılmadı.

## Görsel ve çalışma kayıtları

`/tmp/xinobi-customer-management/customer-confirmation-390.png` görsel olarak incelendi; sentetik, maskeli test müşterisi ve iki sipariş içerir. Bu görüntü gerçek müşteri işlemi değildir. 1440 görüntüsü aynı klasördedir. Dar modal, onay metni, kimlik ve butonlar okunabilir; otomatik axe gerçek ekran okuyucu kabulü sayılmaz.

Komutlar: `dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false`; `pnpm contracts:generate`; admin/web lint/build/tsc; `node --import ./apps/admin/tests/helpers/isolated-browser.mjs apps/admin/tests/customer-management.mjs` ve admin-consistency-states.mjs (`ADMIN_UI_URL=http://127.0.0.1:5173/`); packages/clients/dart içinde `dart test`, apps/mobile içinde `flutter analyze` / `flutter test`.

Geçici loglar: `/tmp/customer-management-api-verified.log`, `/tmp/xinobi-customer-management-api/customer-management-verified.trx`, `/tmp/customer-management-api-release-final.log`, `/tmp/customer-management-ui.log`, `/tmp/customer-management-admin-states.log`, `/tmp/customer-management-contracts.log`, admin/web lint/build, TS/Dart ve Flutter logları. Kalıcı sonuç özeti bu rapordadır; loglar, ekran görüntüleri, yerel config ve credential dosyaları repoya eklenmez.

## Açık yayın kapıları

- **0010 migration gerçek SQL'de uygulanmadı.** Yeni silme durumu için önce doğrulanmış yedek ve idempotent script gerekir. Kısıt değişiminin kilit/tarama etkisi gerçek sunucuda değerlendirilir.
- Gerçek SQL çoklu süreç, audit atomikliği, migration tekrar/rollback ve IIS kabulü hazırlanmış opt-in testle doğrulanmalıdır. Kod/model testi bunun yerine geçmez.
- Rollback deleted hesap varsa durur; veri silerek veya hesapları aktif yaparak ilerlemez. Profil/adres/siparişler ve tasarım dosyaları korunur.
- Çevrimdışı yerel File işlemleri canlı SQL'e senkronlanmaz; gerçek müşteriler/siparişler hosting sorunu çözülmeden görünmeyebilir.
- Gerçek hesap askıya alma/silme, veri aktarımı, hosting/deploy/release/APK yapılmadı.
