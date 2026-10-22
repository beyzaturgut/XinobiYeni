# Xinobi yönetim paneli

React, TypeScript ve Vite uygulaması. Güncel ortam koşulları ve alışveriş sınırları için [kök README](../../README.md) esas alınmalıdır. Kodun veya bir ekranın bulunması ilgili servisin yayında açık olduğunu kanıtlamaz.

## Çalıştırma ve erişim

`pnpm dev:local` API, web ve admin'i birlikte açar; admin varsayılan portu 5173'tür. Yalnız panel için `pnpm --filter admin dev` kullanılabilir; API bağlantısı ayrıca gerekir. Kontroller: `pnpm --filter admin lint`, `pnpm --filter admin build`.

Panel gerçek admin oturumunu ve API'nin döndürdüğü izinleri kullanır. Menü ve yazma kontrollerine ek olarak API uçlarında yetkilendirme uygulanır. Yönetici daveti, e-posta MFA, SQL MFA deposu, parola kurtarma ve denetim kodu mevcuttur; sunucu ayarları, SQL şeması ve gerçek e-posta gönderimi yapılandırılmalıdır. Development erişim istisnaları sunucu yetkilendirmesinin yerine geçmez.

Development dışındaki katalog düzenleme ve ürün yüzeyi uçları için `AdminCatalog:Enabled=true`, `Catalog:StorageProvider=SqlServer`, `Accounts:StorageProvider=SqlServer` ve `ConnectionStrings:Xinobi` gerekir. Diğer özelliklerin SQL ve dosya depolama koşulları kök README'deki ortam tablosundadır.

## Modüller ve sınırları

- Katalog, varyant, medya, fiyat, web stoğu ve içerik ortak API üzerinden kaydedilir. Ürün aktifliği mağaza görünürlüğünü belirler. Dosya yüklemek ürün/içerik kaydını tek başına tamamlamaz.
- Operasyon özeti, müşteri ve sipariş ekranları yönetim API'lerini okur. Sipariş durumları, kargo kaydı ve iptal/iade taleplerinin yönetimi mevcuttur. Gerçek ödeme, para iadesi, taşıyıcı entegrasyonu ve atomik stok rezervasyonu tamamlanmış kabul edilmez.
- Stok ekranındaki web stokları kaydedilebilir. Depo/rezervasyon ve sayım önizlemeleri gerçek depo kaynağına bağlı değildir.
- Fiyat/kampanya bölümünde varyant fiyat kaydı ve oturumluk kampanya taslağı/hesaplama bulunur. Gerçek kupon tüketimi ve ödeme entegrasyonu yoktur. Hesaplama testi: `node tools/test-pricing-model.mjs`.
- Ürün yüzeyleri kaynak fotoğraf, maske prompt'u, WebP maske yükleme, önizleme ve onay akışını kullanır. Bu işlem fiziksel üretim veya baskı onayı değildir. Ayrıntılar: `docs/runbooks/webp-surface-mask-upload.md`.
- Kurumsal teklifler API üzerinden gelen talepleri, mesajları ve teklif kararlarını yönetir. Kabulün toplu siparişe dönüşümü tamamlanmış kabul edilmez.
- Tasarım/baskı ekranındaki prototip inceleme, gerçek üretim dosyası ve üretime onay akışının yerine geçmez; bağlı veri ve uçların durumu ekrandaki açıklamalardan kontrol edilmelidir.
- Entegrasyon ekranları Mikro/Trendyol/Hepsiburada/N11 için bağlı veri kaynağı olmadığını gösterir. Gerçek sağlayıcı bağlantısı, senkronizasyon veya retry başarısı iddia edilmez.
- AI yönetimi Nobi politikası, bilgi kaynakları, konuşmalar, iletişim talepleri ve Nobi/XINOBI U kullanım raporlarını API üzerinden yönetir. Sağlayıcı bağlantısı ve özellik deposu ayrıca yapılandırılır.
- Rol izinleri oturumdan salt okunur gösterilir. Genel rol ve sistem ayarı düzenleme API'leri bağlı değildir; sistem ayarları kaydedilemeyen sabit önizlemedir. Yönetici daveti ve denetim geçmişi kendi API'lerini kullanır.

## Tarayıcı kontrolleri

Güncel regresyon araçları `apps/admin/tests` altındadır; her dosyanın başındaki sunucu/port koşulları okunmalıdır. `admin-data-honesty.mjs`, varsayılan 5174 portunda sentetik API yanıtlarıyla ayar/entegrasyon ekranlarını, stok kaydını ve farklı ekran genişliklerini kontrol eder. API çağrılarını karşılayan bir test gerçek SQL veya sağlayıcı entegrasyonunu doğrulamaz.

Kök `.github/workflows/ci.yml` panel lint ve build işlemlerini çalıştırır; tarayıcı uçtan uca test adımı içermez. `tools/` altındaki eski prototip testleri topluca güncel kabul testi sayılmamalıdır.
