# XinobiYeni

Xinobi'nin web mağazası, yönetim paneli, mobil uygulamaları ve merkezi ticaret servisleri için monorepo.

Proje yürütme ve karar kaydı `Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md`, bağlayıcı kaynak kopyaları `docs/sources/`, mimari kararlar `docs/decisions/` altındadır.

## Kesinleşen teknik sınırlar

- Veritabanı: Microsoft SQL Server
- Container: Docker ve Kubernetes kullanılmaz
- Web: Next.js + React + TypeScript
- Yönetim paneli: React + TypeScript + Vite
- API/worker: ASP.NET Core, C# ve EF Core
- Mobil: Flutter + Dart
- Mimari: modüler monolit, ayrı worker ve SQL tabanlı outbox/inbox

Araç sürümleri resmi uyumluluk kontrolü ve yerel kurulum tamamlandıktan sonra repoda sabitlenecektir.


## Local ortak içerik

`pnpm dev:local` ile API (5003), web (3000) ve admin (5173) birlikte çalışır. Terminal kapandıktan sonra da çalışması için `pnpm dev:local:background` kullanılabilir; süreç numarası ve `/tmp/xinobi-local.log` yolu yazdırılır. Servisler zaten çalışırken yeniden başlatmayın.
Admin’de kaydedilen ürün, varyant, görsel, fiyat, stok ve banner değişiklikleri web’de en geç iki saniye içinde görünür; deploy gerekmez.
Banner ve ürün görseli yükledikten sonra kaydetmek gerekir. Ürün aktifliği web görünürlüğünü belirler.

Local ASP.NET API, geliştirme kayıtlarını `services/api/App_Data/local-commerce/state.json` dosyasında, yüklenen medyayı aynı klasörün `media/` dizininde tutar. Bunlar git’e dahil edilmez ve yeniden başlatmada korunur. İlk açılışta `LocalCommerce/seed.json` kullanılır. Üretim veritabanı kararı SQL Server olarak korunmuştur; dosya kaynağı yalnız Development ortamında açılır, loopback isteklerini kabul eder ve production’da kayıt uçları bulunmaz.

Web’in ana sayfası, katalog, ürün detayları, arama ve favoriler aynı kaynaktan okunur. Sipariş/ödeme, depo rezervasyonları, kampanya hesaplama ve dış entegrasyonlar mevcut demo kapsamındadır.

Kontroller: `dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false`, `pnpm --filter admin build`, `pnpm --filter web build`. Üç servis çalışırken `pnpm test:local-commerce` admin’den kayıt ve web’de görünme akışını kontrol eder; oluşturduğu test ürününü ve bannerı temizler.

## XINOBI U · Beş sorudan AI tasarımına

`/xinobi-u/` kişiselleştirilebilir ürün/varyantları ortak katalogdan listeler. Admin > Katalog > Genel bilgiler > “XINOBI U ile kişiselleştirilebilir” seçimiyle ürünler yönetilir. Mevcut kayıtlarda bu alan yoksa çay ve kahve kategorileri başlangıç kapsamıdır. Ürün kartına tıklamak yeni anket açar; sayfa yenilemek aynı anketi ve yanıtları korur.

Sürüm `xinobi-u-1`: [question-bank.json](services/api/DesignStudio/question-bank.json) içinde beş eksende 100’er, toplam 500 benzersiz soru bulunur. Havuz AI ile hazırlanmış 20 soru yaklaşımının beş gündelik bağlamda varyasyonlarını içerir. Her oturumda eksen başına bir soru, sekiz anlam grubundan dört seçenek ve her grubun dört ifade varyasyonundan biri seçilir. Aynı tarayıcıda eksen havuzu tüketilene kadar soru tekrarı önlenir; tekrarlanan soruda aynı anlam grubunun son kullanılan şık ifadesi yeniden seçilmez. Anketin tek seferlik rastgele seçimi sunucuda kaydedilir. Havuz genişletilirken sürüm ve benzersiz kimlikler korunmalıdır.

Gerçek görsel üretimi ASP.NET üzerinden Cloudflare Workers AI `@cf/black-forest-labs/flux-1-schnell` REST adaptörüyle yapılır. Kaynaklar: [Cloudflare REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/), [model sözleşmesi](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/). Beş yanıt sunucuda izinli semantik tasarım tercihlerine eşlenir; istemciden serbest prompt veya sağlayıcı model adı kabul edilmez. Sayfa açılışı sağlayıcı çağrısı yapmaz.

Local bağlantıyı açmak için `services/api/appsettings.Local.example.json` dosyasını `services/api/appsettings.Local.json` olarak kopyalayın ve yalnız sunucu tarafında Account ID ve Workers AI tokenı ekleyin. Gerçek dosya git tarafından dışlanır; API dosyayı değiştiğinde yeniden okur. Alternatif olarak `Cloudflare__AccountId` / `Cloudflare__ApiToken` ortam değişkenlerini kullanın. Tokenı frontend ortamına veya git’e eklemeyin. Kimlik bilgileri eksikse uygulama gerçek AI üretimini kapalı gösterir; demo görseli gerçek üretim diye sunmaz.

Üretim işi, anket ve yanıt hash’iyle idempotenttir; aynı yanıtların tekrarı aynı işi döndürür. Değişen yanıtlar yeni oturum gerektirir. Günlük local varsayılan limit 30 üretimdir; tek worker çağrıları sırayla işler. Başarısız/belirsiz çağrı otomatik tekrarlanmaz; yeniden başlatmada tamamlanan varlıklar korunur, kesilmiş işler hata durumuna geçer. Sonuçlar MIME/imza ve boyut açısından doğrulanır, checksum ve sağlayıcı çağrı kimliğiyle local diskte tutulur. Sunucu en fazla 120 saniye bekler. Oturum erişimi 24 saatle sınırlıdır; rastgele 256-bit oturum kimliği bir erişim anahtarıdır. Bu local uçlar yalnız Development ortamında ve loopback üzerinden açılır; üretim yayını için gerçek kullanıcı kimliği, hak sahipliği, çıktı moderasyonu ve saklama/temizlik politikası ayrıca uygulanmalıdır.

`/xinobi-u/onizleme/` seçilen ürünün gerçek fotoğrafına AI görselini perspektif ağıyla uygular. Konum, boyut ve görünürlük ayarlanır; birleşik PNG indirilebilir. Bu dijital mockup'tır, ölçülendirilmiş üretim/baskı onayı değildir. Çay gövdesi ve genel ürün yüzeyi için başlangıç geometrileri vardır; farklı fotoğraf açılarında konum ayarları kullanılabilir.

Doğrulama: `pnpm test:xinobi-u` gerçek local soru API’sini ve masaüstü/mobil akışı test eder; ücretli üretim yanıtını tarayıcıda açıkça simüle eder. API testleri fake sağlayıcıyla quota, idempotency ve yanıt doğrulamasını denetler. Gerçek sağlayıcı testi ancak sunucu kimlik bilgileri bulunduğunda yapılabilir.

### Ücretsiz ürün yüzeyi önizlemesi

Ürüne desen uygulama tarayıcıdaki `product-surface.ts` üzerinden yapılır; FASHN veya başka bir görsel düzenleme API’si çağrılmaz. Standart Çay Makinesi 101 fotoğraflarında iki gövde yüzeyi, Kahve Makinesi 101 fotoğraflarında yan panel için normalize edilmiş maskeler kullanılır. Silindirik UV eşleme, fotoğraftan çıkarılan ışık-gölge, kenar alfa geçişi ve logo kontrast maskesi orijinal ürünün ayrıntılarını korur. Kaydırma/boyut ayarları kaplama sınırını değiştirmek yerine desenin yüzey koordinatlarını değiştirir. Orijinal görüntüyle karşılaştırma ve birleşik PNG indirme vardır.

Yeni/açısı farklı admin fotoğrafları için otomatik kusursuz yüzey tahmini yapılmaz; genel şablon ve açıklama gösterilir. Özel fotoğraflar için ek maskeler kalibre edilmelidir. Bu gerçek üretim/baskı doğrulaması değildir.

`pnpm test:free-preview` önceki gerçek AI çıktısını kullanarak masaüstü/mobilde gövde değişimi, arka plan/sap/ağızlık korunması, karşılaştırma ve PNG indirmeyi kontrol eder; üretim isteği sayısının sıfır olduğunu doğrular. Desen oluşturma ise ayrı Cloudflare işlemidir; ücret durumu hesabın günlük ücretsiz kullanım kotasına bağlıdır: https://developers.cloudflare.com/workers-ai/platform/pricing/.

### Ürün rengi ve sepet

XINOBI U'da renk seçimi yoktur: desen ürün gövdesini kapladığı için renk sonucu değiştirmez. Ürün kartı doğrudan sorulara gider; sunucu önizleme için ürünün görseli olan ilk rengini kullanır (ürün detayından başlanırsa oradaki seçili renk kullanılır). Eski `/xinobi-u/renk` bağlantıları sorulara yönlenir. Ürün detayındaki “Sepete ekle” seçilen varyantı `xinobi-cart-v1` anahtarıyla tarayıcıda saklar. Sepet fiyatları ve stok uygunluğu güncel commerce içeriğinden okunur; fiyatı olmayan veya stoksuz varyantlar eklenemez. Mevcut stok azalırsa sepet kullanıcıdan adedi azaltmasını ister. Sepet gerçek ödeme almaz ve sunucuda stok rezervasyonu yapmaz; aşağıdaki demo ödeme akışına bağlanır.

Kontroller: `node tools/test-xinobi-u-direct-questions.mjs`, `node tools/test-cart.mjs` (izole test verileri; Cloudflare üretim çağrısı yok).

### Tarayıcıda demo alışveriş

`/hesap` üzerindeki "Giriş yap" / "Hesap oluştur" penceresinde kayıt/giriş/parola sıfırlama ile çıkış, `/hesap/siparisler` üzerinde deneme sipariş geçmişi kullanılabilir. Hesaplar web ve mobilde ortaktır: `/api/v1/auth` (e-posta kodu, kayıt, giriş, yenileme, çıkış) ve `/api/v1/me`. Web oturumu HttpOnly cookie + `X-Xinobi-Csrf` başlığı, mobil oturum Keychain/Keystore'daki dönen yenileme jetonu ile taşınır (ADR-004). Geliştirmede hesaplar `services/api/App_Data/local-commerce/identity/accounts.json` içinde (parola ve jetonlar yalnız özet olarak) tutulur; diğer ortamlarda uçlar SQL Server kimlik deposu gelene kadar 503 döner. Testler e-posta göndericisini DI'da önizleme göndericisiyle değiştirmelidir: `appsettings.Local.json` test yapılandırmasından sonra yüklenir ve gerçek SMTP seçebilir. Deneme siparişleri hâlâ yalnız tarayıcıda, hesap kimliğine bağlı saklanır.

Geçerli sepetten `/odeme` sayfasına geçilir. Başarısız senaryo sipariş oluşturmaz; başarılı senaryo fiyat/renk/adet anlık görüntüsünü demo sipariş olarak kaydeder ve sepeti boşaltır. Kart bilgisi, gerçek tahsilat, sunucu siparişi veya stok düşümü yoktur. Teslimat formu deneme içindir ve adres kaydedilmez. Uçtan uca kontrol: `node tools/test-demo-commerce.mjs`.

## Deneme hesabında e-posta doğrulaması

Yeni hesap ekranı önce 6 haneli kod gönderir, kod sunucuda doğrulanınca tarayıcıdaki deneme hesabını oluşturur. Kod 10 dakika geçerlidir, en fazla 5 kez denenebilir, bir kez kullanılabilir; tekrar gönderim için 60 saniye gerekir. Yeniden gönderim eski kodu geçersiz kılar. API yeniden başlarsa yeni kod istenmelidir. Gönderim başarısızken veya servis ayarlanmamışken kayıt tamamlanmaz. Mevcut demo hesaplarının girişleri korunur.

Gönderim adaptörü Resend REST API kullanır: https://resend.com/docs/api-reference/emails/send-email. Resend hesabında gönderen alan adını ekleyin ve sağlayıcının verdiği DNS kayıtlarını alan adı yönetiminde doğrulayın (https://resend.com/docs/dashboard/domains/introduction). Gerçek gönderime geçerken `Email:DeliveryMode` değerini `Resend` yapın. Gönderim yetkili API anahtarı oluşturun; `services/api/appsettings.Local.json` dosyasına `Email:ResendApiKey` ve `Email:From` ekleyin. Diğer mevcut ayarları koruyun. Örnek yapı `appsettings.Local.example.json` içindedir. Alternatif sunucu ortam değişkenleri: `Email__ResendApiKey` ve `Email__From`. Anahtarı frontend'e, Git'e veya mesajlara eklemeyin. Gerçek alıcılara otomatik test e-postası gönderilmez.

Local web varsayılan olarak `http://127.0.0.1:5003/api/v1/email-verification` kullanır. İstemci adresi `NEXT_PUBLIC_EMAIL_VERIFICATION_API_URL` ile ayarlanabilir; bu yalnız API adresidir, anahtar değildir. Uçlar Development ve loopback ile sınırlıdır. Statik IIS yayınında bu uçlar bulunmaz ve yeni kayıt açık bir servis hatası verir. Canlıya geçiş için SQL tabanlı kullanıcı kayıtları, sunucu oturumu ve kalıcı doğrulama durumu ayrıca entegre edilmelidir; bu değişiklik deneme hesaplarını üretim kimlik doğrulamasına dönüştürmez.

Doğrulama: `dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false` fake göndericiyle kodun süre/deneme/tek kullanım sınırlarını, adres bağını, gönderim hatalarını ve HTTP akışını test eder. `node tools/test-demo-commerce.mjs` tarayıcı akışında e-posta uçlarını simüle eder.

Geçici doğrulama Development ortamında varsayılan olarak aktiftir (`Email:DeliveryMode=Preview`). Bu mod gerçek e-posta göndermez; 6 haneli deneme kodunu kayıt ekranında gösterir. Kullanıcı kodu girer ve aynı sunucu süre/deneme/tek kullanım kontrollerinden geçer. Bu, e-posta adresi sahipliğini doğrulamaz. Production ortamında Preview servisi ve doğrulama uçları kaydedilmez. Resend modunda kod API yanıtında veya ekranda gösterilmez. Mod değişikliği sonrası API yeniden başlatılmalıdır.

Hesabım (`/hesap`) üye portalı görünümü, yerel hesap/sipariş kaynağına bağlıdır. Giriş ve hesap oluşturma pencereleri mevcut kod doğrulama akışını kullanır; hesap adı, e-posta, sipariş adedi ve son sipariş oturumdan okunur. SQL `identity.Users` tablosuna henüz bağlı değildir. Tarayıcı kontrolü: `node tools/test-account-portal.mjs` (local servisler ve Preview modu gerekir; gerçek e-posta göndermez).

Gmail test gönderimi: `Email:DeliveryMode=Smtp`, `Email:From=Xinobi <gonderen@gmail.com>` ve `Email:Smtp` altında `Host=smtp.gmail.com`, `Port=587`, `Username=gonderen@gmail.com`, `Password=uygulama-sifresi` ayarlayın. STARTTLS zorunludur; 465 portunda doğrudan TLS kullanılır. Yerel ayar dosyasını Git'e eklemeyin. Mod değiştikten sonra API yeniden başlatılmalıdır. SMTP modunda kod ekranda gösterilmez. Google SMTP ayarları: https://support.google.com/mail/answer/7104828.

SMTP sertifika iptal sorgusu bazı yerel ağlarda tamamlanmayabilir. Böyle bir hata doğrulanırsa yalnız yerel ayarda `Email:Smtp:CheckCertificateRevocation=false` kullanılabilir. Varsayılan `true` değeridir. Bu seçenek sertifika zinciri/alan adı doğrulamasını veya zorunlu TLS'yi kapatmaz.

Admin > Ürünler > ürün düzenle > Stok ve varyant altında her varyant için **Satış fiyatı (TL)** girilebilir. `2499,90` ve `2499.90` biçimleri desteklenir; kayıtlar kuruş olarak mevcut `state.prices[varyantId]` kaynağında tutulur. Pozitif, en fazla iki ondalıklı ve en fazla 9.999.999,99 TL kabul edilir. Yeni varyantta fiyat boş bırakılabilir; tanımlı fiyat boşaltılamaz. Ürün kaydı tamamlandıktan sonra değişen fiyatlar kaydedilir; fiyat kaydı başarısızsa taslak açık kalır ve yeniden kayıt yapılabilir. Toplu fiyat listesine üst menüde **Fiyat ve kampanyalar** üzerinden ulaşılır. Kontrol: `node tools/test-catalog-prices.mjs` (izole kayıtlar; gerçek local ürünler değiştirilmez).
