# XinobiYeni

Xinobi'nin web mağazası, yönetim paneli, mobil uygulamaları ve merkezi ticaret servisleri için monorepo.

Proje takibi `Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md`, kaynak kopyaları `docs/sources/`, mimari kararlar `docs/decisions/` altındadır. Bu belge repodaki uygulamayı anlatır; bir özelliğin kodda bulunması canlı sunucuda açık veya doğrulanmış olduğu anlamına gelmez.

## Teknik yapı

- Web: Next.js, React ve TypeScript (`apps/web`).
- Yönetim paneli: React, TypeScript ve Vite (`apps/admin`).
- API: ASP.NET Core, C# ve EF Core (`services/api`); veritabanı Microsoft SQL Server.
- Mobil: Flutter ve Dart (`apps/mobile`); API sözleşmeleri `packages/contracts` ve üretilen istemciler `packages/clients` altında.
- Container, Docker ve Kubernetes kullanılmaz.

Node sürümü `.node-version`, pnpm sürümü kök `package.json`, CI SDK sürümleri `.github/workflows/ci.yml` içinde sabitlenmiştir.

Uygulama modüler monolittir. Bildirim kuyruğu, bakım ve AI üretimi API içindeki hosted service'lerde yürütülür. Ayrı `services/worker` projesi şu anda yalnız periyodik log yazan bir iskelettir; bildirim veya bakım işlerini devralmaz. SQL tabanlı bildirim işi sahiplenme uygulaması, ayrı worker projesinin tamamlandığı anlamına gelmez.

## Yerel geliştirme ve sunucu koşulları

`pnpm dev:local` API (5003), web (3000) ve admin (5173) süreçlerini birlikte açar. Terminal kapandıktan sonra da çalışmaları için `pnpm dev:local:background` kullanılabilir; araç süreç numaralarını ve log yolunu bildirir. Servisler zaten çalışırken yeniden başlatmayın.

Development ortamındaki dosya deposu varsayılan olarak `services/api/App_Data/local-commerce` altındadır: katalog `state.json`, hesaplar `identity/accounts.json`, medya `media/` içinde tutulur. İlk katalog `LocalCommerce/seed.json` üzerinden açılır. Bu veriler Git'e dahil edilmez ve yeniden başlatmada korunur. Development'ta da SQL seçilebilir; tek seferlik içe aktarmalar ve geçiş işaretçileri için [ADR-003](docs/decisions/ADR-003-gecici-yerel-ticaret-deposu.md) ve [ADR-004](docs/decisions/ADR-004-oturum-barindirma-depolama.md) esas alınmalıdır.

Development dışındaki seçimler `services/api/Program.cs` içinde yapılır:

| Alan | Sunucu koşulu ve davranış |
| --- | --- |
| Hesaplar, adresler, siparişler | `Accounts:StorageProvider=SqlServer`, çalışan SQL bağlantısı ve şema gerekir; SQL hesap deposu seçilmezse hesap servisi 503 döner. |
| Katalog okuma | `Catalog:StorageProvider=SqlServer` SQL kaynağını seçer. SQL seçilmemişse `Catalog:SnapshotPath` ile salt okunur kaynak kullanılabilir; kaynak yoksa 503 döner. |
| Admin katalog ve yüzey düzenleme | `AdminCatalog:Enabled=true`, SQL katalog, SQL hesap deposu ve `ConnectionStrings:Xinobi` gerekir. API yetkileri ayrıca uygulanır. |
| Bildirim, değerlendirme, teklif, kayıtlı tasarım ve asistan belgeleri | `Features:StorageProvider=SqlServer` gerekir; Development dışındaki dosya deposuna geri dönülmez. |
| Ürün medyası ve tasarım dosyaları | `Storage:LocalRoot` ile sunucuda yazılabilir ve yedeklenen dosya alanı gerekir; yapılandırılmamışsa dosya servisi kullanılamaz. |
| XINOBI U üretim uçları | Development dışında `XinobiU:Enabled=true`; tarayıcı origin'leri için `XinobiU:AllowedOrigins`, üretim için ayrıca Cloudflare kimlik bilgileri gerekir. |
| E-posta ve admin MFA | Development dışında gerçek `Smtp` veya `Resend` gönderimi gerekir; Preview kabul edilmez. Admin MFA ayrıca SQL hesap deposunu kullanır. |

SQL sağlayıcı seçimi bağlantının, migration'ların veya servis erişiminin sağlıklı olduğunu tek başına kanıtlamaz. Eksik bağlantı/şema servis hatasına neden olabilir. Yerelde çalışan dosya tabanlı bir akışın sunucuda da açık olduğu varsayılmamalıdır.

Sunucuya özel yapılandırma `XINOBI_SERVER_SETTINGS` ile gösterilen dosyadan; Windows'ta varsayılan olarak `C:\XinobiData\config\appsettings.Server.json` üzerinden yüklenir. Bu dosya deploy edilen API klasörünün dışında tutulur. Ortam değişkenleriyle geçersiz kılınabilir. Gerçek ayar dosyaları, bağlantı parolaları, tokenlar, ticaret kayıtları ve yüklemeler Git'e eklenmez.

Yerel katalog SQL'den okunurken yüklenmiş görseller yalnız canlı medya deposunda bulunabilir. Katalogdaki yolun dönmesi dosyanın yerelde bulunduğunu göstermez; medya GET isteği 404 döner. Aynı katalogdaki eksik herkese açık dosyaları mevcut dosyaların üzerine yazmadan indirmek için:

```sh
node tools/restore-local-media.mjs --origin http://109.104.120.91:8014 --state-url http://127.0.0.1:5003/api/v1/local-commerce/state
```

`--origin` erişilebilir gerçek yayın adresi olmalıdır. API yerine dosya kataloğu kullanılacaksa `--state` ile JSON yolu verilebilir; varsayılan `services/api/App_Data/local-commerce/state.json` dosyasıdır. Araç yalnız katalogda referans verilen medya dosyalarını yerel `media/` dizinine ekler; katalog/SQL kayıtlarını değiştirmez, kimlik bilgisi göndermez. Farklı dosya deposu kullanılıyorsa `--media` ile doğru dizin seçilmelidir. Medya Git'e eklenmez. Kontrol: `node --test tools/restore-local-media.test.mjs`.

## Hesaplar, yetkilendirme ve e-posta

Web ve mobil ortak `/api/v1/auth` ve `/api/v1/me` sözleşmesini kullanır. Kayıt, e-posta kodu, giriş, yenileme, çıkış, profil, parola ve e-posta değiştirme, parola sıfırlama ve hesap silme uçları mevcuttur. Web oturumu HttpOnly cookie ve `X-Xinobi-Csrf` başlığıyla; mobil oturum dönen yenileme jetonuyla taşınır. Ayrıntılar [ADR-004](docs/decisions/ADR-004-oturum-barindirma-depolama.md) içindedir.

SQL hesap deposu (`SqlAccountStore`) uygulanmıştır. Development'ta dosya deposu veya SQL seçilebilir; diğer ortamlarda yalnız yapılandırılmış SQL deposu kullanılır. `/hesap` portalı ve `demo-commerce.ts` isimli istemci modülü bu API'leri çağırır; dosya/fonksiyon adındaki “demo” ifadesi hesapların tarayıcıda saklandığı anlamına gelmez.

Adresler `/api/v1/me/addresses`, siparişler `/api/v1/me/orders`, hesaba bağlı favoriler `/api/v1/me/favorites` üzerinden sunucuda yönetilir. Tarayıcı belleğindeki görünüm bunların önbelleğidir; kalıcı hesap kaynağı değildir.

Admin oturum kontrolü, API tarafında izin politikaları, yönetici daveti, e-posta MFA ve parola kurtarma kodu mevcuttur. SQL MFA deposu challenge ve izin kayıtlarını kalıcı tutar. Development dışındaki MFA, SQL ve gerçek e-posta gönderimi olmadan açılmaz. Paneldeki rol ve genel sistem ayarı düzenleme API'leri ise bağlı değildir; sistem ayarları sabit ve kaydedilemeyen önizlemedir.

E-posta modu `Email:DeliveryMode` ile seçilir. Development'taki `Preview` gerçek e-posta göndermez; deneme kodunu yanıtta gösterebilir ve adres sahipliğini doğrulamaz. Sunucuda `Smtp` veya `Resend` yapılandırılmalıdır. Örnek anahtarlar `services/api/appsettings.Local.example.json` içindedir; gerçek değerler yalnız sunucu ayarlarında tutulur. SMTP için `Email:Smtp` ayarları, Resend için `Email:ResendApiKey` ve `Email:From` kullanılır.

Kayıt ekranı `/auth/email-verification` ve kayıt uçlarını kullanır. Eski `/api/v1/email-verification` uçları Development denemeleri için kodda bulunur; güncel web kayıt akışının API'si değildir. Testlerde e-posta göndericisi fake/preview göndericiyle değiştirilmelidir; yerel ayar dosyası test yapılandırmasını etkileyebilir.

## Katalog ve alışveriş sınırları

Ana sayfa, katalog, ürün detayları ve arama ortak katalog kaynağını kullanır. Admin'de kaydedilen ürün, varyant, görsel, fiyat, stok ve banner değişiklikleri web'in yenileme mekanizmasıyla görünür; içerik kaydı için tekrar deploy gerekmez. Yüklenen medya ve düzenlenen ürün ayrıca kaydedilmelidir. Ürün aktifliği web görünürlüğünü belirler.

Fiyatlar kuruş olarak tutulur. Admin varyant fiyatı `2499,90` ve `2499.90` biçimlerini kabul eder; pozitif, en fazla iki ondalıklı değer gerekir. Kampanya taslağı ve fiyat önizlemesi, gerçek kupon tüketimi veya ödeme entegrasyonu değildir.

Sepet `xinobi-cart-v1` anahtarıyla tarayıcıda tutulur; fiyat ve uygunluk katalogdan okunur. `/odeme` kayıtlı teslimat adresi seçtirir. Sipariş oluşturma isteği `/api/v1/me/orders` üzerinden sunucuya gider; sunucu adres sahipliğini, ürün/varyant uygunluğunu ve miktarı kontrol eder, fiyatı katalogdan hesaplar ve sipariş anlık görüntüsünü saklar. Aynı sepet ve `clientRequestId` tekrarlandığında aynı sipariş döndürülür; farklı içerikle tekrar kullanım reddedilir.

**Alışveriş hâlâ demo ödeme sınırındadır.** Gerçek kart işleme, tahsilat, stok rezervasyonu veya siparişle atomik stok düşümü tamamlanmış kabul edilmemelidir. Stok uygunluğunun kontrol edilmesi rezervasyon değildir. İptal ve iade işlemleri para iadesi yapmaz.

Sipariş geçmişi, detay, durum geçişleri, kargo kaydı, iptal/iade talepleri ve bunların admin yönetimi uygulanmıştır. Bunların sunucuda tutulması gerçek ödeme, taşıyıcı entegrasyonu veya fiziksel teslimatın doğrulandığı anlamına gelmez. Dış pazar yeri/ERP entegrasyon ekranları bağlı sağlayıcı ve senkronizasyon başarısı iddia etmez. Baskı/üretim onayı ve gerçek üretim dosyası akışı da tamamlanmış değildir.

## XINOBI U ve ürün yüzeyleri

`/xinobi-u/` ürünleri ortak katalogdan listeler. Kapsam, admin'deki “XINOBI U ile kişiselleştirilebilir” alanıyla yönetilir. Ürün seçiminden sonra görsel/desen yükleme veya beş soruluk AI anketi seçilir; anket soruları ve yanıtlar sunucu oturumunda tutulur. `services/api/DesignStudio/question-bank.json`, beş eksende toplam 500 soruluk sürümlü havuzdur.

Görsel üretimi `CloudflareImageProvider` üzerinden `@cf/black-forest-labs/flux-1-schnell` modelini kullanır. Beş yanıt sunucuda izinli tasarım tercihlerine çevrilir; istemciden serbest prompt/model adı kabul edilmez. Sayfa açılışı üretim çağrısı yapmaz. `Cloudflare:AccountId` ve `Cloudflare:ApiToken` sunucu tarafında yapılandırılır; `Cloudflare__AccountId` / `Cloudflare__ApiToken` ortam değişkenleri kullanılabilir. Kimlik bilgileri eksikse gerçek üretim kapalı gösterilir.

Üretim işi oturum ve yanıtlarla idempotenttir; başarısız veya belirsiz sağlayıcı çağrısı otomatik tekrarlanmaz. Sonuçlar MIME/imza ve boyut kontrollerinden geçer. Development'ta worker ve dış inference `DesignStudio:WorkerEnabled` ve `DesignStudio:ExternalInferenceEnabled` ile kapatılabilir. Sunucudaki açılış koşulları yukarıdaki ortam tablosundadır; origin kısıtları, günlük üretim limiti ve oturum erişimi üretim yetkilendirmesi/moderasyonu için tamamlanmış bir çözüm kabul edilmemelidir.

Desenin ürüne uygulanması tarayıcıda yapılır; bu adım ayrıca görsel düzenleme API'si çağırmaz. Güncel admin akışı kaynak fotoğrafı indirme, maske prompt'unu kopyalama, WebP maske yükleme, önizleme ve onaylamadır. Onaylı maskeler fotoğraf/renk bilgileriyle eşleştirilerek mağaza önizlemesinde kullanılır. Yeni fotoğraf için maske ve geometri uygunluğu ayrıca kontrol edilmelidir; otomatik kusursuz yüzey tespiti varsayılmaz.

Web'de Desen yükle, Görsel yükle ve AI ile tasarla girişleri aynı ürün/renk bağlamını korur. Kişiselleştirilebilir ürünün tüm renklerinde giriş görünür; bu, her renk için onaylı maske bulunduğu anlamına gelmez. Yüzeyi olmayan renk açıkça belirtilir ve başka rengin maskesi kullanılmaz.

Yerleşim konfigürasyonları `/api/v1/me/design-configurations` ile hesaba bağlı saklanır. Konfigürasyon kimliği ve revizyonu, maske sürümünden ayrı tutulur. Sepette aynı tasarımın farklı konfigürasyon/revizyonları ayrı satırlardır. Sepet görselinden açılan editörde Kaydet yalnız hedef satırın yerleşimini değiştirir; adet korunur, İptal değişiklik yapmaz. Tasarım favorileri sunucudaki konfigürasyona bağlıdır; normal ürün favorileri korunur. Mobil WebView, aynı editörü uygulamanın oturumu ve cihaz sepetiyle kullanır; oturum jetonları WebView'e verilmez. Tasarım favorileri ve kayıtlı yerleşimler hesap üzerinden web/mobilde ortaktır; cihazlar arasında sepet listesini otomatik eşitleme yapılmaz. Uygulama ve yayınlama ayrıntıları [kişiselleştirilmiş alışveriş akışı](docs/ux/2026-10-23-personalized-shopping.md) belgesindedir.

Web ve mobil kişiselleştirme akışlarında yerleşim kimliği ve revizyonu checkout'a aktarılır. Sipariş, konfigürasyon revizyonunu, şema/yüzey sürümünü, konum/ölçek/döndürme ve gövde ayarlarını, ham dosya checksum'ını ve SKU'yu kendi snapshot'ında saklar. Tasarımın sonradan değiştirilmesi veya silinmesi sipariş kopyasını değiştirmez. Eski veya konfigürasyonsuz API siparişlerinde bu alanlar bilinmiyor olarak kalır. Aynı sipariş anahtarının farklı konfigürasyonla tekrar kullanılması reddedilir.

Admin siparişleri kişiselleştirme türüne göre filtreleyebilir, kayıtlı ayarları okuyabilir ve mevcut yetkili görsel uçlarında `?download=true` ile ham tasarımı indirebilir. Sepet ve tasarım favorileri için ürünle birleşik küçük JPEG önizlemesi, hesabın ilgili yerleşim revizyonuna bağlı saklanır. Bu dosya fiziksel üretim dosyası değildir. Ayrıntılı kabul ve test kaydı [UX uygulama kaydı](docs/ux/2026-10-22-implementation.md) içindedir.

Sunucuda onaylı katalog maskeleri varsa konfigürasyon doğrudan bu dosyalarla doğrulanır. Paketlenmiş önizleme kullanılacaksa API için `ProductSurfaces:PublishedRoot` gerçek `assets/product-previews` dizinine ayarlanmalıdır; kaynak ve maske dosyaları sürüm/checksum ile kontrol edilir. Klasör veya doğru yüzey yoksa konfigürasyon kaydı/siparişi 409 döner; tarayıcıdaki bir görselin açılması sunucu doğrulamasının hazır olduğunu kanıtlamaz. Yeni SQL migration gerekmez: konfigürasyon mevcut özellik belgesinde, sipariş ayarları mevcut `PersonalizationJson` alanında tutulur; `Features:StorageProvider=SqlServer` ve mevcut şema yine gereklidir.

Titanyum seri bağlantısı admin İçerik > Titanyum kaplama bölümünde seçilen gerçek katalog kategorisini kullanır (`content.titaniumCategory`). Yapılandırılmamış veya kaldırılmış kategori için seri bağlantısı gösterilmez; ürün adına göre seri tahmini yapılmaz.

AI veya yüklenen tasarım hesaba kaydedilebilir, ürün üzerinde önizlenebilir ve kişiselleştirilmiş sepet satırına bağlanabilir. Dijital ürün önizlemesi fiziksel baskı ölçüsü, DPI veya üretim onayı değildir. Akış ve maske ayrıntıları `docs/runbooks/webp-surface-mask-upload.md` ve `tools/local-mask-editor/README.md` içindedir.

## Arka plan işleri

`services/api/Program.cs` içindeki kayıtlar belirleyicidir:

- `NotificationWorker`: bildirim işlerini işler. Varsayılan olarak Development'ta veya `Features:StorageProvider=SqlServer` seçiliyken açıktır; `Notifications:WorkerEnabled` ile kontrol edilir. Gerçek gönderim kanal yapılandırmasına bağlıdır.
- `MaintenanceWorker`: SQL hesap deposundaki süresi dolmuş oturumları temizler; dosya deposunda iş yapmaz. `Maintenance:WorkerEnabled` varsayılan olarak açıktır.
- `DesignGenerationWorker`: XINOBI U görsel üretim kuyruğunu API sürecinde işler; kayıt koşulları ortam ve özellik ayarlarına bağlıdır.

Ayrı `services/worker` uygulamasını başlatmak bu işleri çalıştırmaz.

## Doğrulama ve CI

Temel kontroller:

```sh
dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false
pnpm lint
pnpm --filter admin build
pnpm --filter web build
```

API testleri yetkilendirme, hesaplar, katalog, sipariş yaşam döngüsü, SQL depoları, MFA, bildirimler ve ürün maskelerini kapsar. SQL veya özel fixture gerektiren bazı testler koşulları sağlanmadığında atlanır; başarılı varsayılan test koşusu bütün SQL entegrasyonlarının çalıştırıldığı anlamına gelmez. Test koşusunun atlanan sonuçları ayrıca değerlendirilmelidir.

Web tarayıcı testleri `apps/web/tests/e2e` altında; `pnpm --filter web test:e2e` derleme ve Playwright akışını çalıştırır. Admin tarayıcı regresyonları `apps/admin/tests` altında bulunur; her aracın başındaki sunucu/port ve fixture koşulları okunmalıdır. Örneğin `admin-data-honesty.mjs` varsayılan olarak 5174 portunu kullanır ve API çağrılarını test yanıtlarıyla karşılar. Eski `tools/test-*.mjs` araçlarının bir bölümü tarihsel prototip akışlarına aittir; güncel kabul testi oldukları varsayılmamalıdır.

`.github/workflows/ci.yml` .NET build/test, üretilen API sözleşme kontrolü, web/admin lint ve build, Dart istemci ve Flutter analyze/test adımlarını çalıştırır. **Mevcut CI'da Playwright/tarayıcı uçtan uca testlerini çalıştıran adım yoktur.** Tarayıcı testlerinin repoda bulunması CI kapsamında çalıştıkları anlamına gelmez.

Deploy istendiğinde `node tools/package-deploy.mjs` web ve admin'i tek birleşik ZIP olarak paketler. Yayın koşulları ve sunucu yapılandırması için `deployments/README.md` ve `docs/runbooks/` incelenmelidir; GitHub'a push yapılması deploy değildir.
