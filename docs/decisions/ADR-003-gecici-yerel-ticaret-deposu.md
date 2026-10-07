# ADR-003 — Geçici yerel ticaret deposu ve tarayıcı demo kayıtları

- Tarih: 07.10.2026 (uygulama 06.10.2026, `3db452e` ve sonrası)
- Durum: Kabul edildi · proje sahibi onayı 07.10.2026 (sohbet onayı: "onaylıyorum")
- Karar sahibi: Proje sahibi
- Teknik inceleme: CTO Advisor ve DB Admin (bekliyor)
- Etkilenen fazlar: Faz03 (03.03–03.08, 03.11), Faz04, Faz05, Faz06, Faz10

## Bağlam

ADR-001 kalıcı veri için SQL Server ve EF Core migration'larını zorunlu kılar. Faz03'ün kimlik, rol, migration, audit ve outbox çekirdeği henüz kurulmadan, admin'de girilen ürün, kategori, banner ve duyuruların web'de görünmesi ve XINOBI U akışının yerelde uçtan uca denenmesi istendi. Bu ihtiyaç için SQL Server yerine geçici bir dosya deposu ve tarayıcıda saklanan demo hesap/sipariş kayıtları kullanıldı. Bu ADR, Faz00 §6'da "yazılmadı" diye işaretlenen açığı kapatmak için mevcut durumu kayda geçirir.

## Mevcut uygulama

- **Sunucu dosya deposu:** `services/api/LocalCommerce` ürün, varyant, kategori, fiyat, stok, banner, duyuru ve öne çıkan ürün kayıtlarını `services/api/App_Data/local-commerce/state.json`, yüklenen medyayı aynı klasörün `media/` dizininde tutar. İlk açılışta `LocalCommerce/seed.json` kullanılır. Yazma tek bir `SemaphoreSlim` ile sıraya alınır, geçici dosyaya yazılıp atomik taşıma ile değiştirilir.
- **XINOBI U oturumları:** `services/api/DesignStudio/DesignSessionStore.cs` anket oturumlarını ve üretilen varlıkları yerel diskte tutar. Oturum ömrü 24 saattir.
- **Erişim sınırı:** Her iki uç grubu yalnız `Development` ortamında kayıt edilir ve loopback dışından gelen isteğe 403 döner (`LocalCommerceEndpoints.cs`, `DesignStudioEndpoints.cs`). Production'da bu uçlar yoktur.
- **Tarayıcı kayıtları:** Sepet `xinobi-cart-v1`, demo kullanıcı, tuzlanmış PBKDF2 parola özeti ve demo siparişler `xinobi-demo-commerce-v1` localStorage anahtarında tutulur. Gerçek kimlik doğrulama, tahsilat, sunucu siparişi ve stok düşümü yoktur.
- **Yayın:** DEPLOY-004 statik paketi o anki `state.json` ve medya kopyasını içerir; canlı sunucuda API ya da dosya deposu çalışmaz.

## Karar (önerilen)

1. Dosya deposu ve localStorage kayıtları **yalnız Development ve demo** amaçlıdır; hiçbir faz kabulünde kalıcı veri katmanı sayılmaz.
2. Production'a veya müşteri verisine giden her yol SQL Server + EF Core (ADR-001) üzerinden kurulur. Geçiş Faz03 03.11 görevidir.
3. Geçiş tamamlandığında `seed.json` Development fixture olarak kalabilir; `state.json` yazma yolu ve localStorage demo kimliği kaldırılır.
4. Bu süre boyunca dosya deposuna gerçek müşteri kişisel verisi, gerçek parola ya da ödeme bilgisi girilmez.

## Riskler

- İş kuralları (fiyat, stok, varyant, sepet uygunluğu) şu an dosya deposu ve istemci koduna dağılmış durumda; SQL Server'a geçişte yeniden yazım ve davranış farkı riski var.
- Tek dosya ve tek kilit yalnız tek süreçte güvenlidir; çok örnekli çalışma, eşzamanlı yazım çatışması (ETag/409), audit ve yedek/restore yoktur.
- localStorage kayıtları istemci tarafından değiştirilebilir ve cihazlar arasında eşitlenmez; demo siparişler gerçek sipariş sayılmaz.
- Statik pakete gömülen içerik kopyası canlıda admin değişiklikleriyle güncellenmez.

## Geri dönüş ve geçiş

- SQL Server şeması Faz03/04/05 migration'larıyla kurulur; `state.json` içeriği tek seferlik içe aktarma aracıyla taşınır ve aynı seed ile iki deponun API yanıtları karşılaştırılır.
- Geçiş başarısız olursa Development ortamı dosya deposuna dönebilir; production'da dosya deposu bulunmadığı için geri dönüş SQL Server yedek/restore prosedürüyle yapılır.
- `pnpm test:local-commerce` ve ilgili `tools/test-*.mjs` testleri geçişten sonra SQL Server'a karşı tekrar çalıştırılır.

## Test

- TST-088 (07.10.2026): mimari testler 26/26, admin ve web lint/build mevcut HEAD'de başarılı.
- Development dışında uçların bulunmadığı ve loopback dışı isteğin 403 aldığı geçiş öncesinde otomatik testle ayrıca doğrulanmalıdır (açık).

## Açık noktalar

- ~~Proje sahibinin bu geçici kararı onaylaması.~~ 07.10.2026'da onaylandı.
- 03.11 geçişinin takvimi (Faz00 §1).
- Yerel medyanın taşınacağı nesne depolama kararı (Faz00 T-06).
