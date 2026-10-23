# UX uygulama ve kabul kaydı — 22 Ekim 2026

Kaynak: `Proje Yönetimi/Xinobi_UX_Teknik_Analiz_ve_Faz_Promptlari.md` (R01–R14).

## Faz 0 kararları

- Sepet rozeti satır sayısını değil toplam adedi gösterir.
- Karşılaştırma seçim ekranı varsayılandır; tablo 2–4 yayındaki ürünle açık eylem sonucu açılır. Eski `urunler` paylaşım parametresi korunur.
- URL kategori filtresinin doğruluk kaynağıdır; arama ve kategori değişikliği karşılaştırma seçimlerini silmez.
- Titanyum için mevcut modelde gerçek seri bağı yoktur. Ürün adından tahmin yapılmaz; yönetilebilir kategori bağı gerekir. Bağ yapılandırılmadan seri CTA'sı tamamlanmış sayılmaz.
- Kişiselleştirme uygunluğu ürün alanıdır; yüzey hazır oluşu tam ürün/varyant eşleşmesiyle ayrıca doğrulanır. Eski özel ürün URL'si artık örnek ürünün kaldırıldığını söylüyor.
- Düzenleme Kaydet/İptal ile yapılır; hedef satır ve adet korunur. Silinmiş hedef sessizce yeniden oluşturulmaz.
- Konfigürasyon mevcut özellik belge deposunda revizyonlanır; sipariş yerleşim ve kaynak dosya anlık görüntüsünü taşır. Mevcut SQL JSON kişiselleştirme alanı kullanılabilir; fiziksel şema değişikliği gerekirse ayrıca kaydedilir.
- Kişisel favori konfigürasyona bağlı sunucu kaydıdır; mevcut ürün favorileri korunur.
- Ham tasarım ile ürün üzerindeki temsilî görüntü ayrı kavramlardır. Fiziksel baskı/ödeme/stok rezervasyonu eklenmez.

## Kaynak incelemesi

| Gereksinim | Kaynak ve ilk bulgu | Kabul |
| --- | --- | --- |
| R01–03 | `site-header.tsx`, `catalog.tsx`: kategori yalnız ilk mount'ta okunuyor | Aynı route, doğrudan URL ve geri/ileri filtreyi günceller |
| R04 | `titanium-feature.tsx`: filtresiz katalog bağlantısı; seri bağı yok | Yalnız yapılandırılmış gerçek ilişki açılır |
| R05 | `comparison.tsx`: ilk 8 ürün ve seçince otomatik tablo | Tüm aktif katalog, arama/kategori, 4 sınırı, ayrı tablo |
| R06 | `product-reviews.tsx`: hatada null; ürün/oturum değişiminde eski state | Görünür hata/tekrar deneme, ayrı boş durum, uygunluk korunur |
| R07 | `basket.tsx`, `saved-design-preview.tsx`, `favorites.tsx` | Hedef satır/adet, açık kayıt/iptal, hesap favorisi |
| R08 | `CustomerContracts.cs`, `Orders.tsx`: placement siparişe taşınmıyor | Değişmez snapshot, korumalı ham dosya ve ayar ayrıntısı |
| R09–10 | `add-to-cart.tsx`, detay ve header | Kısayollar kalkar, ortak sepetten toplam adet |
| R11–14 | Genel detay ve kendi görselin/anket girişleri | Ürün/varyant korunur, 3 yöntem, eksik yüzey açık |

İnceleme sırasında mevcut API:5003, web:3000 ve admin:5173 süreçleri bulundu; yeniden başlatılmadı. Gerçek katalog/müşteri kayıtları değiştirilmez. İzole tarayıcı kontrolleri fake API/AI yanıtları kullanır; gerçek sağlayıcıya üretim veya e-posta gönderilmez. Canlı sunucu davranışı bu incelemeyle doğrulanmış sayılmaz.

## Uygulanan veri zinciri

Konfigürasyonlar mevcut `designs` özellik belgesinde hesap sahipliğiyle saklanır. Kimlik ve revizyon yerleşimin kopyasını tanımlar; şema sürümü ile maske sürümü farklıdır. Sipariş satırı mevcut `PersonalizationJson` alanında bu kopyayı, ham kaynak checksum'ını ve SKU'yu korur. Yeni fiziksel SQL migration gerekmez. Tasarımın silinmesi veya yeniden düzenlenmesi geçmiş sipariş dosyasını/yerleşimini değiştirmez.

Sepet satırı kimliği ürün + varyant + tasarım + konfigürasyon + revizyondur. Aynı tasarımın farklı yerleşimleri ayrı satırlardır. Hedefli düzenleme yalnız mevcut satırı değiştirir, adedi korur; İptal veya kaldırılmış hedef satır yeni sepet satırı oluşturmaz. Eşzamanlı değişmiş konfigürasyon reddedilir. Kişisel favoriler sunucuda tutulur; normal ürün favorileriyle karıştırılmaz. Yeni web akışında henüz yerleştirilmemiş ham tasarım, sepete eklenmeden önce ürün editörüne yönlendirilir.

Sunucu hem kayıt hem checkout sırasında sahipliği, ürün/varyant ilişkisini, sayısal sınırları ve yüzey sürümünü doğrular. Yayınlanmış yüzeyler `ProductSurfaces:PublishedRoot` üzerinden kullanılıyorsa kaynak/maske/branding dosyaları da sürüm ve checksum ile denetlenir. Bozuk veya eksik dosya kontrollü hata döndürür. Admin filtreleme, ham dosya açma/indirme ve tüm kayıtlı yerleşim alanlarını mevcut sipariş ekranında gösterir.

## Gereksinim kabul durumu — 23 Ekim 2026

| Gereksinim | Durum | Doğrulama / sınır |
| --- | --- | --- |
| R01 | Geçti | Chevron, açık/kapalı durumu, Escape ve klavye odağı korunur. |
| R02 | Geçti | Masaüstü ve mobil navigasyonda Tüm ürünler. |
| R03 | Geçti | URL tek kaynak; kategori, geri/ileri, yenileme. History API aynı sayfayı yeniden yüklemeden filtreyi günceller. |
| R04 | Kod geçti; veri seçimi gerekli | Admin'de gerçek kategori bağı, kayıtta mevcut kategori kontrolü; silinince bağ temizlenir. Gerçek titanyum kategorisi otomatik seçilmedi. |
| R05 | Geçti | Tüm aktif katalog, arama/kategori, 4 sınırı, 2–4 ürünle açık karşılaştırma; ortak store, tablo/paylaşım/farklar korunur. |
| R06 | Geçti | Boş/yükleniyor/hata/tekrar deneme ayrılır; ürün/oturum değişiminde eski durum taşınmaz. Teslim edilmiş satın alma ve moderasyon API kuralları korunur. |
| R07 | Geçti | Sepetten hedefli Kaydet/İptal; adet ve diğer satırlar korunur; revizyonlar bağımsızdır; kişisel favori ve kayıtlı tasarımdan sunucu ayarlarıyla açılır. |
| R08 | Kod geçti; SQL ortam doğrulaması engelli | Sipariş snapshot'ı, ham dosya kopyası, personel yetkili indirme, ayar/SKU/checksum ve tür filtreleri. Yeni SQL testi mevcut; izole SQL bağlantısı tanımlı değil. |
| R09 | Geçti | Detayda Sepetim ve Karşılaştırmayı aç kısayolları kaldırıldı; ekleme kontrolleri korunur. |
| R10 | Geçti | Ortak sepetten toplam adet; kişiselleştirilmiş satırlar ve tarayıcı storage değişimi dahil. |
| R11 | Giriş geçti; medya/veri koşullu | Kişiselleştirilebilir ürünün bütün renklerinde giriş görünür. Eksik maskeler tamamlanmış sayılmaz, başka rengin yüzeyi kullanılmaz. |
| R12 | Geçti | Dosya seçici tıklama imleci, klavye ve görünür odak. |
| R13 | Geçti | Üç eş düzey yöntem; AI soruları tam ürün/renk bağlamında açılır; giriş sayfası üretim başlatmaz. |
| R14 | Geçti | Sınırlı yükleme/AI girişi tasarımı, ürün/renk kartı, mobil yerleşim, hata/tekrar deneme; dosya bırakmadan yöntem değişiminde açık onay. |

## Testler ve görsel kontrol

- `pnpm lint`: geçti; admin'deki önceden var olan React uyarıları devam eder, hata yok.
- Web ve admin üretim derlemeleri: geçti. Statik export korunur.
- Tam web Playwright koşusu: **156 geçti, 1 atlandı** (157 senaryo). Atlanan CM101 kabul testi yerel inceleme verisi gerektirir. Gerçek AI/e-posta veya müşteri kaydı kullanılmadı.
- Tam .NET koşusu: **475 geçti, 29 atlandı** (504 test). SQL/özel ortam testlerinin atlanması kalıcı SQL entegrasyonunu doğrulamaz.
- Son kategori silme kontrolü dahil LocalCommerceTests: **11 geçti**.
- Admin sentetik tarayıcı kontrolü (`tools/test-admin-personalized-orders.mjs`): tür filtreleri, SKU/yerleşim, attachment indirme, eski kayıt ve sıfır iş verisi yazımı geçti.
- Dart istemci analizi ve mevcut **9 test** geçti; 93 OpenAPI operasyonu TS/Dart'ta, 122 Dart part dosyası mevcut.
- Flutter analyze ve **61 mobil test** geçti. Yeni API `DesignPlacement` tipi ile mevcut mobil önizleme tipinin ad çakışması import sınırında giderildi.
- Yükleme ekranı 1440 ve 390 px görüntülerinde incelendi: ürün/renk bağlamı, üç yöntem ve dosya seçimi görünür; yatay taşma yok.
- Geniş regresyonda bulunan EXIF fotoğraf eksen sorunu düzeltildi; yön ve piksel kontrollerini koruyan iki mevcut test geçti.
- Son taze derlemede **6 ek hedefli kontrol** geçti: çift tıklamada tek kayıt, miktar/diğer satır korunması, İptal/silinen hedef, favoriden açma, Tasarımlarım sunucu konfigürasyonu, bağımsız revizyonlu sepet ve AI sonuç/önizleme geçişi.
- Son backend yerleşim koşusunda **5 test** geçti; bozuk dosya checksum reddi ve nullable yerleşim alanlarının uyumlu JSON çıktısı dahil.
- Sözleşmeler yeniden üretildi; üretim öncesi/sonrası diff aynı kaldı (drift yok). 93 operasyon ve Dart part dosyası kontrolü geçti.

## Ortam ve teslim sınırları

- `XINOBI_TEST_SQL` tanımlı değil. Yeni konfigürasyon revizyonunun SQL üzerinden süreçler arası kalıcılık testi eklendi fakat çalıştırılmadı; bu doğrulama bekliyor. Gerçek müşteri veritabanına test yönlendirilmedi.
- Gerçek katalogdaki her rengin onaylı maske/medya verisi bu çalışmada oluşturulmadı. İzole test kataloğunda DEMO-V101-R/S/G ve DEMO-V102-R eksik yüzey örnekleri olarak doğrulanır. Canlı katalog renkleri ayrıca admin'de kontrol edilmelidir.
- Üretimde katalog onaylı maskesi yerine paketlenmiş yüzey kullanılacaksa API'nin PublishedRoot ve dosya erişimi yapılandırılmalıdır. Bu kod yerelde açılan önizlemenin sunucuda da hazır olduğunu varsaymaz.
- Titanyum kategorisi yönetici tarafından seçilmelidir; olmayan kategori veya ürün adı tahmini eklenmedi.
- Ayrı birleşik mockup varlığı saklama uygulanmadı. Ham tasarım ve kayıtlı yerleşim operasyon bilgisi olarak sunulur; bunlar fiziksel baskı onayı değildir.
- Ödeme tahsilatı, stok rezervasyonu, üretim/baskı ve hosting değişikliği yapılmadı. Deploy yapılmadı.

## Commit akışı

Kullanıcı main'e çalışmayı ve mevcut feature dalını main'e birleştirmeyi onayladı. `0a4d3aa` birleştirme, `abdc87a` ilk UX fazları, `b926844` EXIF düzeltmesidir. `50c6080` gerçek kategoriye bağlı titanyum keşfini ekler. Konfigürasyon/sipariş/favori teslimi, üretilen istemciler ve bu test kaydı birlikte commit edilir; tüm gönderimler main üzerindedir. Önceki duraklatma isteği 23 Ekim'deki “devam et” talebiyle sona erdi.
