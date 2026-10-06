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
