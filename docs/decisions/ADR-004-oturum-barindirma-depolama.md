# ADR-004 — Oturum taşıma, barındırma ve dosya depolama

- Tarih: 07.10.2026
- Durum: Kabul edildi · proje sahibi kararı 07.10.2026
- Karar sahibi: Proje sahibi
- Teknik inceleme: CTO Advisor (temsili öneri), gerçek rol incelemesi bekliyor
- Faz00 karar satırları: T-03, T-05, T-06
- Etkilenen fazlar: Faz03 (03.03, 03.08, 03.10), Faz05, Faz06, Faz10, Faz11

## T-03 — Oturum taşıma: karma model

**Karar:** Web mağazası ve yönetim paneli oturumu `HttpOnly`, `Secure`, `SameSite=Lax` (panel için `Strict`) cookie ile taşır; durum değiştiren isteklerde CSRF koruması zorunludur. Flutter uygulaması kısa ömürlü access token ve her kullanımda döndürülen (rotating) refresh token kullanır; token'lar cihazın güvenli deposunda (iOS Keychain, Android Keystore) tutulur.

**Gerekçe:** Tarayıcıda token JavaScript'e açık olmaz; XSS durumunda oturum çalınma riski azalır. Mobilde cookie yönetimi yerine standart token akışı daha güvenilirdir.

**Sonuçlar:** Sunucu iki kimlik şemasını da aynı kullanıcı, rol ve yetki modeline bağlar; yetki kontrolü şemadan bağımsızdır. Refresh token'lar sunucuda yalnız hash olarak saklanır, aile (family) bazında iptal edilebilir; çalınmış token'ın yeniden kullanımı tüm aileyi iptal eder. Panel ile mağaza farklı cookie adı ve kapsamı kullanır. Uygulama Faz03 03.03'tedir.

## T-05 — Barındırma: mevcut Windows Server + IIS

**Karar:** Canlı ve test ortamları, önizlemenin zaten yayınlandığı Windows Server + IIS sunucusunda çalışır. ASP.NET Core API ve worker IIS/Windows hizmeti olarak, Next.js mağazası ve Vite paneli IIS siteleri olarak barındırılır. Docker kullanılmaz (ADR-001).

**Sonuçlar:**

- Dev/test/prod ayrımı ayrı IIS siteleri, uygulama havuzları, veritabanları ve yapılandırma dosyalarıyla yapılır; sırlar repoda değil, sunucu ortam değişkeni veya şifreli yapılandırmada tutulur.
- TLS sertifikası, alan adı/DNS, otomatik yenileme ve HTTP→HTTPS yönlendirmesi 03.10'da kurulur.
- Next.js'in sunucu gerektiren özellikleri (SSR, ISR) kullanılacaksa IIS arkasında Node süreci gerekir; şu anki statik dışa aktarım bu kararla uyumludur. SEO için sunucu tarafı çıktı ihtiyacı Faz04'te yeniden değerlendirilir.
- Tek sunucu tek arıza noktasıdır; yedekleme, izleme ve geri yükleme provası 03.10 ve Faz11'de zorunludur. Kapasite yetersiz kalırsa bu ADR yeni bir ADR ile değiştirilir.
- **Açık:** SQL Server portu (64019) 07.10.2026'da dışarıdan erişilemedi; geliştirme ortamının erişim yöntemi (VPN, IP kısıtlı güvenlik duvarı kuralı) belirlenmelidir.

## T-06 — Dosya depolama: sunucu diski

**Karar:** Ürün görselleri, baskı dosyaları, kullanıcı yüklemeleri ve AI çıktıları API sunucusunda, web kökü dışındaki bir dizinde saklanır. Dosyalara yalnız API üzerinden, yetki kontrolüyle ve kısa ömürlü imzalı bağlantılarla erişilir. SQL Server'da yalnız `Asset` metadata'sı (depolama anahtarı, MIME, boyut, SHA-256, sahip, durum) tutulur.

**Sonuçlar:**

- Kod, depolama işlemlerini bir arayüzün (`IFileStorage`) arkasında yapar; ileride Cloudflare R2, Azure Blob veya başka bir sağlayıcıya geçiş yalnız yeni bir adaptör ve veri taşıma gerektirir.
- Depolama dizini IIS site kökünün dışında olur ve doğrudan statik dosya olarak sunulmaz; aksi halde yetkisiz erişim riski oluşur.
- Yedekleme sorumluluğu bizdedir: dosya dizini SQL yedekleriyle aynı zaman noktasına göre yedeklenir; restore provası 03.10'dadır.
- Disk kotası, büyük dosya sınırı ve kayıtsız (orphan) dosya temizliği 03.08'de tanımlanır. CDN ve görsel türev üretimi gerekiyorsa ayrıca kararlaştırılır.
- Mevcut geliştirme deposu (`App_Data/local-commerce/media`, ADR-003) 03.11 geçişinde bu yapıya taşınır.

## Geri dönüş

Her üç karar da arayüz ve yapılandırma sınırları arkasındadır. Değişiklik yeni bir ADR, etki analizi ve proje sahibi onayıyla yapılır.
