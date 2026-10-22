# Xinobi — UX/UI kavramsal ve teknik analiz, faz planı ve uygulama promptları

Tarih: 22 Ekim 2026
Proje: `/Users/beyzaturgut/Desktop/Xinobi`
Kaynak: Page1.jpg ve Page2.jpg, mevcut kaynak kodun salt okunur incelemesi.

## 1. Kapsam ve okuma yöntemi

Bu belge, görsellerdeki geri bildirimleri uygulanabilir gereksinimlere dönüştürür. Görsellerin içindeki emirler bu çalışma sırasında çalıştırılmamıştır. İstenen teslimat analiz ve prompt dosyasıdır; uygulama, commit, push veya deploy yapılmamıştır.

Kaynakta 1–14 numaralı dolu maddeler vardır. 6. madde ikinci sayfada devam eder. 15. madde boştur; yeni gereksinim üretilmemiştir.

Durum ifadeleri:
- **Kodda doğrulandı:** Kaynakta mevcut davranışı destekleyen somut bulgu var.
- **Güçlü olasılık:** Kod olası nedeni gösteriyor; tarayıcıda yeniden üretim gerekir.
- **Karar/öneri:** Belgede açık olmayan ayrıntı için önerilen uygulama yaklaşımı.

Canlı site ve görsel arayüz bu çalışma kapsamında çalıştırılıp denenmedi. Ekran görüntüleri uygulamanın görüntüsü değil, geri bildirim metnidir; bu nedenle piksel düzeyinde tasarım değerlendirmesi yapılmamıştır. Önceki proje incelemesindeki `pnpm lint` başarılıdır; bu belge için yeni build veya test çalıştırılmamıştır.

## 2. Kavramsal analiz

### 2.1 Üç ana kullanıcı yolculuğu

**Keşfet → filtrele → karşılaştır → satın almaya hazırlan:** Menü, katalog ve karşılaştırma aynı kategori ve ürün kaynağını kullanmalıdır. Ürün seçmek ile karşılaştırma tablosunu açmak ayrı eylemlerdir. Kullanıcı bir ürün seçtiğinde bağlamından kopmamalıdır.

**Kişiselleştir → kaydet → yeniden düzenle:** Desen, görsel ve AI tasarımı aynı ürün/varyant bağlamına açılan üç giriş yöntemidir. Seçim ekranları ortak bir görsel dil kullanmalı; kaynak görsel, ürün üzerindeki yerleşim ve kullanıcıya ait kaydedilmiş tasarım birbirinden ayrılmalıdır.

**Sipariş ver → tasarım bilgisini operasyona aktar:** Müşterinin gördüğü sonuç yalnız görsel dosyasından oluşmaz. Konum, ölçek, döndürme, mod ve yüzey sürümü de sonucun parçasıdır. Sipariş, sonradan düzenlenen tasarımdan bağımsız bir anlık görüntü taşımalıdır.

### 2.2 Korunacak deneyim

- Karşılaştırma alt panelinin genel görünümü ve mevcut karşılaştırma tablosunun talep dışındaki özellikleri korunur.
- Yeniden tasarım yalnız kendi görselini/desenini yükleme ve AI ile tasarlama girişleriyle sınırlıdır; tüm mağaza yeniden tasarlanmaz.
- Yorumlar için mevcut teslim edilmiş sipariş ve moderasyon kuralları, yeni karar alınmadıkça korunur.
- Kişiselleştirme düğmesinin görünürlüğü ile gerçek yüzey önizlemesinin hazır olması ayrı kavramlardır. Düğmeyi göstermek, eksik maskeyi var saymak anlamına gelmez.

### 2.3 Netleştirilmesi gereken ürün kararları

Aşağıdaki varsayımlar planı somutlaştırır; uygulanırken veri veya iş kuralıyla çelişirse sessizce değiştirilmez, karar kaydına alınır:

| Konu | Önerilen varsayım | Gerekçe |
|---|---|---|
| Sepet sayacı | Satır sayısı değil toplam adet | Sepet ekranındaki mevcut adet hesabıyla tutarlılık |
| Karşılaştırmayı açma | 2–4 ürünle etkin | Anlamlı karşılaştırma için öneri; kaynak metin minimum belirtmiyor |
| Tüm ürünler | Yayındaki tüm ürünler | Pasif/admin taslaklarını müşteriye açmamak |
| Titanyum serisi | Katalogdaki gerçek kategori/koleksiyon ilişkisi | Ürün adına göre hatalı tahmin yapmamak |
| Favori tasarım | Ürün + varyant + tasarım + yerleşim referansı | Sadece ürün favorisi kişisel sonucu yeniden açamaz |
| Aynı tasarımın farklı yerleşimleri | Düzenleme mevcut hedef satırı günceller; bağımsız kopya ayrı kimlik/revizyon ister | Yanlış sepet satırının değişmesini önlemek |
| Kaydetmeden geri dönme | Açık Kaydet/İptal davranışı | Sepette fark edilmeden değişiklik oluşmasını önlemek |
| Eksik varyant yüzeyi | Düğme görünür; hazırlık durumu anlaşılır biçimde gösterilir | Yanlış renk veya geometrinin kullanılmasını önlemek |
| Desen dosyası | Ürüne giydirilen ham tasarım; birleşik mockup ayrı varlık | Üretim ekibinin hangi dosyayı indirdiğini bilmesi |

## 3. Gereksinim ve mevcut durum matrisi

| ID | Kaynak talep | Kod bulgusu / yorum | Faz |
|---|---|---|---|
| R01 | Kategoriler yanındaki v işaretini iyileştir | `site-header.tsx` içinde SVG chevron var. Estetik tercih; açılır menü erişilebilirliği korunmalı. | 1 |
| R02 | Ürünler → Tüm ürünler | Header masaüstü ve mobilde Ürünler yazıyor. Öncelikle bu navigasyon etiketleri kapsamda. | 1 |
| R03 | Ürünler sayfasındayken header kategori bağlantıları çalışsın | Header query parametresi yazıyor; `catalog.tsx` query değerini yalnız ilk mount sırasında okuyor. Aynı sayfada query değişimine tepki vermemesi güçlü kök neden adayı. | 1 |
| R04 | Titanyum CTA doğru seriyi açsın | `titanium-feature.tsx` doğrudan `/urunler` adresine gidiyor; filtre yok. | 1 |
| R05 | Tüm katalogdan görselli, aramalı, kategorili, en çok 4 ürün seç; sonra karşılaştır | `comparison.tsx` boş durumda `active.slice(0,8)` kullanıyor; seçili ürün varsa tabloya geçiyor. Tabloya ekleme native select ile. Store zaten 4 sınırını uyguluyor. | 2 |
| R06 | Ürün altında değerlendirme/yorum; önce var mı kontrol et | `product-reviews.tsx` zaten var ve detay sayfasına bağlı. Teslim edilmiş sipariş koşulu var. API hatasında `return null` bölümü gizliyor; bu eksikmiş algısı yaratabilir. | 3 |
| R07 | Sepet/favori tasarımını önizlemede yeniden düzenle | Sepet görseli normal detay sayfasına gidiyor. Kaydedilmiş tasarım editörü ve placement deposu var. Favoriler yalnız ürün ID’si temelli. | 6 |
| R08 | Admin XINOBI U siparişlerini ve desenini/ayarlarını görsün, indirsin | `Orders.tsx` kişiselleştirme adı, türü ve görselini zaten gösteriyor. Tam yerleşim bilgisi ve açık indirme/filtreleme eksik. | 5, 7 |
| R09 | Ürün detayında Sepetim ve Karşılaştırmayı aç bağlantılarını kaldır | `add-to-cart.tsx` Sepetim; `product-detail.tsx` Karşılaştırmayı aç bağlantısını içeriyor. Karşılaştırmaya ekleme ayrı kontrol; kaldırılması istenmiyor. | 1 |
| R10 | Header sepetinde ürün sayısı | Header `useCart` okumuyor, sayaç yok. Sepet ekranı toplam adedi zaten hesaplıyor. | 1 |
| R11 | Kişiselleştirilebilir ürünün tüm renklerinde XINOBI U düğmesi | Genel detay sayfası düğmeyi ürünün `personalizable` alanıyla açıyor. Özel ürün akışları ve varyant yüzey hazır oluşu ayrı incelenmeli. | 4 |
| R12 | Desen/Görsel seç alanında tıklama imleci | `local-pattern-preview.tsx` dosya seçimini label üzerinden açıyor. İmleç ve görünür odak stili ilgili CSS ile kontrol edilmeli. | 4 |
| R13 | Yükleme girişlerinin yanında AI ile tasarlayın; sorulara gitsin | Ürün ve varyant bağlamını taşıyan üçüncü giriş gerektiriyor. Sayfa açılışı üretim başlatmamalı. | 4 |
| R14 | Görsel/desen yükleme ve AI ekranlarını yeniden tasarla | Mevcut marka bileşenleriyle sınırlı yeniden tasarım; somut ekran önerisi aşağıda. | 4 |

## 4. Teknik analiz

### 4.1 Navigasyon ve katalog

İlgili dosyalar, proje köküne göredir:
- `apps/web/src/components/site-header.tsx`, `site-header.module.css`
- `apps/web/src/components/titanium-feature.tsx`
- `apps/web/src/app/urunler/catalog.tsx`
- `apps/web/src/components/add-to-cart.tsx`
- `apps/web/src/app/urunler/detay/product-detail.tsx`

Kategori tek doğruluk kaynağı URL olmalı veya URL/state senkronizasyonu açıkça kurulmalıdır. İlk mount'ta `window.location.search` okumak aynı route'taki sonraki kategori seçimlerini kaçırabilir. Projede Next statik export kullanılıyor; query okuyan istemci bileşenlerinin Suspense ve export gereksinimleri kurulu Next dokümanından doğrulanmalıdır. Mevcut kategori etiket normalizasyonu korunmalı; query değerleri URL-encode edilmelidir. Geri/ileri, doğrudan link ve sayfa yenileme aynı filtreyi üretmelidir.

Titanyum serisi katalogda gerçekten kategori mi, koleksiyon mu, özellik mi belirlenmelidir. Olmayan bir kategori string'i üretmek veya bir ürünü yanlış kategoriye taşımak çözüm değildir. Sadece ilişki yoksa veri modelini genişletme ihtiyacı karar olarak raporlanır.

### 4.2 Karşılaştırma için ortak seçici

Mevcut `lib/compare.ts` ürün ID’lerini localStorage'da tutuyor; `maxCompare=4`, `toggleCompare`, `useCompare` yeniden kullanılmalı. İkinci bir seçim deposu oluşturulmamalıdır.

Önerilen akış:
1. Header Karşılaştır → görselli seçim ekranı.
2. Kullanıcı arama ve kategori filtresiyle ürünleri seçer; kartta çerçeve + seçildi işareti + `aria-pressed` görünür.
3. Beşinci seçim listeyi değiştirmez; metin ve canlı durum bildirimi gösterilir.
4. Açık Karşılaştır CTA’sı mevcut tablo görünümünü açar.
5. Tablodaki veya alt paneldeki Bir ürün daha ekle aynı seçiciyi açar; mevcut seçimler korunur.

Öneri: mevcut `/karsilastir` sayfasında URL ile ifade edilen seçim/tablo görünümü. Kesin query adı uygulama kararıdır. Eski paylaşılan ürün ID parametreleri kırılmamalı. Kategori ve arama listesi seçilen ürünleri silmemeli. Pasif/silinmiş seçimler için temizleme ve açıklama gerekir. Çok ürün varsa sayfalama yapılabilir; sekiz ürünlük sabit kesme olamaz.

### 4.3 Yorumlar

`product-reviews.tsx`, `lib/reviews.ts`, `services/api/Reviews/ReviewStore.cs`, `ReviewEndpoints.cs` ve admin `Reviews.tsx` mevcut akışın parçalarıdır. Yeni paralel yorum servisi kurulmamalı.

Herkes onaylı yorumları görür; yazma/düzenleme uygunluğu sunucuda doğrulanır. Teslim edilmiş satın alma koşulu yalnız frontend kontrolü olmamalıdır. Boş durum ile servis hatası ayrılmalı. Ürün değişimi, oturum kapanması ve yeniden denemede önceki ürünün yorum/uygunluk durumu kalmamalıdır. Tasarımdaki revizyon bu mevcut kuralları değiştirmemelidir.

### 4.4 Kişiselleştirme uygunluğu ve ekran tasarımı

`product.personalizable` ürünün programa dahil olduğunu; varyanta ait onaylı maske/render girdisi ise doğru önizlemenin mümkün olduğunu anlatır. `variant-preview-readiness.tsx` bu ayrımı zaten kısmen yapıyor. Ürün kişiselleştirilebilirken düğme tüm renklerde görünmeli; eksik yüzeyin gerçekten tamamlanması ayrı veri/medya çalışmasıdır. Başka rengin fotoğrafı veya maskesi sessizce kullanılamaz.

İlgili alanlar:
- `apps/web/src/features/product-personalization/local-pattern-preview.tsx`
- `apps/web/src/app/xinobi-u/kendi-gorselin/own-image-entry.tsx`
- `apps/web/src/app/urunler/cay-makinesi-101/product-experience.tsx`
- `apps/web/src/app/xinobi-u/sorular/questionnaire.tsx`
- `apps/web/src/app/xinobi-u/onizleme/product-preview.tsx`

Önerilen ekran yapısı:
- Üstte ürün küçük görseli, ürün adı ve seçili renk; kullanıcı bağlamını kaybetmez.
- Aynı hizada Desen yükle, Görsel yükle, AI ile tasarla seçenekleri. Mobilde okunabilir ve erişilebilir yerleşim.
- Yüklemede açık etiketli dosya seçici, sürükle-bırak destekleniyorsa eşdeğer klavye eylemi, geçerli format/boyut bilgisi ve dosya önizlemesi.
- AI girişinde soru akışına yönlendirme; ürün/varyant korunur. Ekrana girmek, sağlayıcı çağrısı yapmaz.
- Boş/yükleniyor/hata/başarılı durumları; açık geri dönüş ve önizlemeye devam eylemi.
- Geçerli tasarım varken yöntem değiştirmek veriyi sessizce silmez.
- Mevcut renk, tipografi ve bileşen ölçekleri korunur; global CSS ile alakasız sayfalar değiştirilmez.

### 4.5 Kritik veri boşluğu: yerleşimden siparişe

`lib/design-placement.ts` şu alanları taşıyor: kaynak genişlik/yüksekliği, yüzey sürümü, x/y, ölçek, döndürme, eğrilik, üst/alt gövde ayarları, pattern/artwork modu ve maske doldurma seçimi.

`lib/cart.ts` yerleşimi `designPlacement` olarak sepete alıyor. Ancak `CustomerContracts.cs` içindeki `PlaceOrderItem` yalnız ürün/varyant/adet/tasarım ID’si; `OrderPersonalization` yalnız ID/tür/ad/MIME/görsel URL'si içeriyor. İncelenen sözleşmelerde yerleşim siparişe taşınmıyor. Adminin tüm ayarları görmesi için uçtan uca veri genişletmesi gerekir.

Önerilen model; adlar taslaktır:

```text
Kişisel tasarım konfigürasyonu
  id, ownerId, productId, variantId, designId, revision
  placementSchemaVersion, placement, surfaceVersion

Sepet satırı
  mevcut alanlar + configurationId/revision veya doğrulanan placement

Sipariş satırı kişiselleştirme anlık görüntüsü
  mevcut alanlar + schemaVersion + placement + surfaceVersion
  kaynak görsel dosyası/checksum
  varsa birleşik mockup referansı
```

Kaynak dosya ile ürün üzerindeki birleşik önizleme ayrı sunulur. Checksum ve yüzey sürümü, eski siparişi yeniden yorumlamayı önler; geçmiş yüzey verisi tutulmuyorsa önizlemenin birebir yeniden üretilemeyeceği açık olmalıdır. Birleşik mockup'ın saklanması bu belirsizliği azaltır; tarayıcıdan yüklenen mockup üretim dosyası veya güvenilir baskı kanıtı sayılmaz.

Sunucu sahipliği, ürün/varyant ilişkisini, sayısal sınırları, şema ve yüzey sürümünü doğrular. Eski siparişlerde alanlar nullable/opsiyonel olmalı; eksik ayarlar tahmin edilmemelidir. SQL değişikliği gerekiyorsa migration ve gerçek kalıcı kayıt yolu birlikte ele alınır. Açık DTO değişikliklerinde OpenAPI ve üretilen TypeScript/Dart istemcileri aynı fazda güncellenir.

### 4.6 Düzenleme ve favoriler

Sepet görseli kişiselleştirilmişse kaydedilmiş tasarım önizlemesine hedef satır bağlamıyla açılmalı. Normal ürün normal detay sayfasına gider. Var olan editör:
`apps/web/src/app/hesap/tasarimlarim/onizleme/saved-design-preview.tsx`.

Mevcut `cartLineKey` ürün + varyant + tasarım ID’sinden oluşuyor. Aynı tasarıma ait farklı yerleşimlerin ayrı satır olması istenirse bu kimlik yetersizdir. Düzenleme mevcut satırı değiştirecekse miktar korunmalı, yeniden Sepete ekle ile miktar yanlışlıkla artmamalıdır. Hedef satır düzenleme sırasında silinmişse yeniden oluşturma sessizce yapılmamalıdır.

Favoriler mevcut kodda yalnız ürün ID'si taşıyor. Tasarımlarım ile Favorilerim otomatik olarak aynı kavram değildir. Kişiselleştirilmiş favori için kalıcı tasarım konfigürasyonu/revizyonu referansı gerekir; sırf localStorage eklemek, mevcut hesaplar arası cihaz senkronizasyonunu bozabilir. Eski normal favoriler çalışmaya devam etmelidir.

### 4.7 Admin operasyon ekranı

`apps/admin/src/Orders.tsx` üzerinde mevcut sipariş listesini genişletmek yeterli olabilir; ikinci bağımsız sipariş sistemi gereksizdir. Öneri: Tümü / Kişiselleştirilmiş / AI / Yüklenen görsel filtreleri ve sipariş satırında tasarım ayrıntı paneli.

Panelde ürün, SKU/varyant, renk, tasarım kaynağı, ham dosya, varsa mockup ve kayıtlı tüm yerleşim alanları görünür. Ham dosyayı açma ile indirme ayrı ve isimleri açık eylemlerdir. Mevcut korumalı görsel uçları, içerik türü ve uygun indirme başlığı kullanılır. Staff izni ve sipariş erişimi sunucuda doğrulanır. Müşteri tasarımını sonradan silse de siparişin mevcut dosya kopyası korunur.

## 5. Faz planı

| Faz | Sonuç | Gereksinimler | Bağımlılık | Büyüklük |
|---|---|---|---|---|
| 0 | Yeniden üretim, karar ve kapsam kaydı | Tümü | Yok | Küçük |
| 1 | Menü, kategori, CTA ve sepet mikro düzeltmeleri | R01–04, R09–10 | 0 | Küçük/orta |
| 2 | İki aşamalı karşılaştırma ve ortak seçici | R05 | 1 | Orta |
| 3 | Mevcut yorumların görünürlük ve hata akışı | R06 | 0 | Küçük/orta |
| 4 | Varyant uygunluğu ve üç yöntemli tasarım girişi | R11–14 | 0 | Orta/büyük |
| 5 | Kalıcı konfigürasyon ve sipariş snapshot sözleşmesi | R07–08 altyapısı | 4 ile model uyumu | Büyük |
| 6 | Sepet ve favorilerden güvenli yeniden düzenleme | R07 | 4, 5 | Büyük |
| 7 | Admin kişiselleştirme ayrıntısı ve indirme | R08 | 5, 6 | Orta |
| 8 | Bütünleşik regresyon ve teslim | Tümü | 1–7 | Orta |

Büyüklükler görecelidir; süre taahhüdü değildir. 3. faz bağımsız ilerleyebilir. 5. faz veri sözleşmesi kesinleşmeden 6–7 tamamlanmış sayılmaz.

## 6. Faz promptları

Aşağıdaki ortak prompt, her faz promptunun başına eklenmelidir. Her faz ayrı bir çalışma olarak uygulanabilir. Bu belgedeki promptlar mevcut inceleme sırasında yürütülmemiştir.

### Ortak uygulama promptu

```text
Proje: /Users/beyzaturgut/Desktop/Xinobi
Bu dosyadaki analizi ve yalnız verilen fazın kapsamını uygula. Önce kök AGENTS.md ile değişecek dizinlerin talimatlarını oku; Next.js kodunu değiştirmeden kurulu sürümün yerel dokümanındaki ilgili kuralları incele. Mevcut çalışma ağacını kontrol et ve ilgisiz değişiklikleri koru.

Kaynak geri bildirimleri gereksinim girdisi olarak kullan. Önce kodda mevcut çözümü ara; aynı store, servis veya ekranın paralel kopyasını kurma. Doğrulanmış bulguları, varsayımları ve çalıştırılamayan kontrolleri ayır. Sırf düğme göstermek için eksik yüzey verisini var sayma.

Mevcut Next statik export, React/Vite admin, ASP.NET Core, SQL Server ve Flutter sınırlarını koru. Container veya yeni hosting düzeni ekleme. Gizli dosya içeriklerini yazdırma; gerçek müşteri verilerini, maskeleri ve dosyaları değiştirme. Testler izole veri ve fake sağlayıcı kullansın; gerçek e-posta veya ücretli AI çağrısı yapmasın.

Fazın gerektirdiği değişiklikleri tamamla, diff'i incele ve uygun kontrolleri çalıştır. API sözleşmesi değişirse OpenAPI ile TypeScript/Dart istemcilerini güncelle. Kök AGENTS.md içindeki doğrulanmış değişikliklerin commit/push akışını uygula; teknik erişim kısıtını aşmaya çalışma. Deploy yapma. Sonunda değişen dosyaları, kabul ölçütlerinin durumunu, test sonuçlarını ve kalan engelleri bildir. Yapılmamış testi yapılmış gibi sunma.
```

### Faz 0 — Doğrulama ve karar kaydı

```text
Amaç: Bu belgedeki R01–R14 taleplerini mevcut uygulamayla doğrula ve uygulama kapsamını sabitle. Bu fazda ürün kodunu değiştirme.

1. Katalog, header, titanyum CTA, karşılaştırma, yorumlar, sepet, favoriler, kaydedilmiş tasarım editörü ve admin siparişlerini incele.
2. Servislerin zaten çalışıp çalışmadığını kontrol et; çalışanları yeniden başlatma. İzole ortamda yeniden üretebildiğin davranışları masaüstü ve mobilde kaydet.
3. R03 için /urunler üzerinde kategori query değişimi ile doğrudan açılışı ayrı dene. R06 için misafir, satın almamış kullanıcı, teslim edilmiş siparişi olan kullanıcı ve API hatasını ayır.
4. R11 için genel detay ve özel ürün akışlarını, ürün uygunluğu ve varyant yüzey hazır oluşunu ayrı listele. Hangi renklerin medya/maske verisinin eksik olduğunu belirt.
5. Titanyum serisinin katalogdaki gerçek ilişkisini bul. Yoksa uydurma filtre ekleme; gerekli veri kararını yaz.
6. Minimum karşılaştırma adedi, sepet toplam adet sayacı, favori tasarım kimliği ve düzenlemede satır güncelleme varsayımlarını karar kaydına geçir.

Çıktı: Gereksinim→dosya→yeniden üretim→karar→kabul ölçütü matrisi. Tarayıcıya/servise erişemediğin maddeleri açık işaretle. Kök neden hipotezini doğrulama sonucu gibi yazma.
```

### Faz 1 — Navigasyon ve küçük arayüz düzeltmeleri

```text
R01, R02, R03, R04, R09 ve R10'u uygula.

- Header masaüstü/mobil Ürünler bağlantısını Tüm ürünler yap. Kategoriler chevron görünümünü marka diline uygun sadeleştir; aria-expanded, klavye ve dokunmatik etkileşimleri koru.
- catalog.tsx ile header kategori bağlantılarının URL/state senkronizasyonunu düzelt. Aynı sayfada art arda kategori seçimi, yenileme, doğrudan URL ve geri/ileri doğru çalışsın. Statik export uyumluluğunu koru.
- Titanyum CTA'yı Faz 0'da doğrulanan seri ilişkisine bağla; olmayan kategori adı üretme.
- Ürün detayındaki Sepetim ve Karşılaştırmayı aç kısayollarını kaldır. Sepete ekle ve karşılaştırmaya ekleme davranışlarını koru. Ortak add-to-cart bileşeninin diğer kullanımlarını kontrol et; talep dışı sayfaları değiştirme.
- Header sepet ikonuna useCart üzerinden toplam adet rozeti ekle. Ekleme, miktar değişikliği, çıkarma, temizleme ve diğer sekmedeki değişikliklerde güncellensin. Boş durumda rozet gizlensin; erişilebilir ad adedi içersin. Sayacı ayrı depoda tutma.

Kabul: Menü gezinmeleri doğru listeyi açıyor; 2 adet A + 1 adet B rozetinde 3 görünüyor; kişiselleştirilmiş satırlar da sayılıyor; header mobilde taşmıyor. pnpm lint ve pnpm --filter web build çalıştır. Navigasyon ve sayaç davranışını hedefli tarayıcı kontrolüyle doğrula.
```

### Faz 2 — Karşılaştırma seçimi ve sonuç ekranı

```text
R05'i uygula. comparison.tsx, lib/compare.ts ve compare-tray.tsx üzerindeki mevcut özellikleri koru.

- Seçim ve tabloyu iki açık aşama yap. Header Karşılaştır seçiciyi açsın; tek ürün seçmek otomatik tabloya geçirmesin.
- Aktif tüm katalog ürünleri görsel, ad, kategori ve uygun temel bilgilerle erişilebilir olsun. slice(0,8) kısıtını kaldır. Büyük listede sayfalama yapılabilir, tüm ürünlere erişim korunmalı.
- Kategori ve Türkçe arama ekle. Filtre değişince seçim kaybolmasın. Seçilen kart belirgin çerçeve, işaret ve erişilebilir seçildi durumuna sahip olsun.
- maxCompare=4 ve ortak store'u kullan. Beşinci seçimde metin/canlı bildirim ver, listeyi değiştirme. Seçileni kaldırmak her zaman mümkün olsun.
- Faz 0 kararıyla uyumlu minimum adetle Karşılaştır CTA'sını etkinleştir. Tablodaki metin select yerine aynı görselli seçiciye dönüş sağla.
- Alt panelin mevcut görünümünü koru. Bir ürün daha ekle metnini işlevli bağlantı/eylem yap; aynı seçiciyi açsın. Karşılaştır CTA'sı tabloyu açsın. Eski paylaşılan bağlantıları ve seçim kalıcılığını koru.

Kabul: 8'den fazla ürünün tamamına ulaşılabiliyor; seçim, kaldırma, 5. seçim uyarısı, arama/kategori, yeniden açma ve mobil akış çalışıyor. Mevcut farkları gösterme ve paylaşım gibi tablo özellikleri bozulmuyor. pnpm lint, web build ve bu akışlara yönelik izole tarayıcı kontrolünü çalıştır.
```

### Faz 3 — Yorum sistemini tamamlama

```text
R06 için yeni yorum sistemi kurma. Mevcut ProductReviews, ReviewStore/Endpoints ve admin moderasyon akışını tamamla.

- Genel detay ve kullanılan özel ürün detaylarında değerlendirme alanının gerçek ürün ID'siyle bağlı olduğunu doğrula.
- Boş yorum listesini, yüklenmeyi ve API hatasını farklı göster. API hatasında bölüm sessizce yok olmasın; anlaşılır hata ve yeniden deneme sun.
- Herkes onaylı yorumları görebilsin. Yazma hakkı mevcut teslim edilmiş satın alma kuralıyla sunucuda doğrulansın. Bekleyen/reddedilen yorumlar herkese açılmasın.
- Oturum/ürün değişiminde eski kullanıcının veya ürünün değerlendirmesi görünmesin. Hesabım ve ürün altındaki durumlar tutarlı olsun.

Kabul: Misafir, uygun olmayan kullanıcı, teslim edilmiş sipariş sahibi, bekleyen yorum sahibi ve servis hatası senaryoları doğrulansın. Mevcut review testlerini çalıştır; değişen davranış için gerekli hedefli kontrolleri ekle. İlgili API değiştiyse sözleşmeleri güncelle; lint ve web build çalıştır.
```

### Faz 4 — Tüm renkler ve üç yöntemli kişiselleştirme girişi

```text
R11, R12, R13 ve R14'ü uygula.

- Genel ve özel ürün detaylarındaki kişiselleştirme girişlerini ortak ürün uygunluğu kuralıyla hizala. Admin'de personalizable=true olan ürünün bütün renklerinde düğme görünsün; seçili ürün/varyant akış boyunca korunsun.
- Varyantın onaylı yüzey girdisi yoksa başka renk verisini kullanma. Giriş görünürlüğünü engellemeden gerçek hazırlık durumunu açık göster. Eksik maske/medya gerektiren renkleri ayrı raporla; tamamlanmamış önizlemeyi çalışıyor sayma.
- Desen seç/Görsel seç dosya alanlarının tıklama imleci, klavye erişimi ve görünür odak stilini düzelt. Dosya seçicinin mevcut güvenli format/boyut sınırlarını koru.
- Desen yükle, Görsel yükle ve AI ile tasarla seçeneklerini aynı seviyede sun. AI seçeneği ürün ve varyantı koruyarak sorulara gitsin; yalnız ekran açıldığı için görsel üretme.
- Yalnız bu giriş/yükleme/AI ekranlarını belgedeki önerilen ekran yapısına göre yeniden tasarla. Mevcut marka stilini kullan; mobil, boş, yükleniyor, hata ve başarı durumlarını tamamla. Yöntem değişiminde kaydedilmemiş girdiyi sessizce silme.

Kabul: Kişiselleştirilebilir ürünün bütün renklerinde giriş görünür; uygun olmayan üründe görünmez; eksik yüzey dürüstçe gösterilir; kaynak/varyant korunur. Gerçek AI veya e-posta çağrısı olmadan izole akış testi, lint ve web build yap. Veri eksikliği varsa hangi renklerde gerçek önizlemenin halen tamamlanamadığını bildir.
```

### Faz 5 — Konfigürasyon, yerleşim ve sipariş anlık görüntüsü

```text
R07 ve R08 için veri temelini tamamla. Bu fazı yalnız frontend state değişikliğiyle bitirme.

- lib/design-placement.ts, cart.ts, kaydedilmiş tasarımlar, checkout, CustomerContracts, account store'lar, SQL kalıcılığı ve sipariş dosya kopyalama akışını birlikte incele.
- Ürün/varyant/tasarım ve yerleşimi ilişkilendiren kalıcı ve revizyonlanabilir konfigürasyonu mevcut depolama mimarisine uygun tasarla. Yerleşim şeması ile yüzey sürümünü ayır. Gerekli en küçük model genişletmesini uygula.
- Sipariş isteğine gerekli konfigürasyon referansı/revizyonu veya doğrulanan yerleşimi ekle. Sunucuda sahiplik, ürün/varyant eşleşmesi, boyut/sayı sınırları, şema ve yüzey sürümünü doğrula.
- Sipariş satırına değişmez kişiselleştirme snapshot'ı kaydet. Ham dosyanın mevcut siparişe kopyalanma davranışını koru; varsa birleşik önizlemeyi ayrı varlık olarak sakla. Kaydedilmiş tasarımın sonradan değişmesi/silinmesi geçmiş siparişi değiştirmesin.
- Eski sepet/sipariş/favori kayıtlarını kırma; eksik placement alanlarını açıkça bilinmiyor göster. Gerekli SQL migration, yerel store uyumu ve OpenAPI/TS/Dart istemci güncellemelerini yap.
- Siparişin idempotent tekrarında farklı konfigürasyonla sessizce yanlış sonucu döndürme; mevcut idempotency sözleşmesine uygun doğrula.

Kabul: Yetkisiz tasarım, yanlış varyant, geçersiz sayılar ve eski yüzey senaryoları kontrollü reddediliyor; geçerli placement kayıt→checkout→sipariş→okuma zincirinde kayıpsız; eski sipariş açılıyor; tasarım silinince sipariş dosyası kalıyor. İzole backend testleri, uygun SQL testleri ve istemci sözleşme kontrollerini çalıştır. SQL erişimi yoksa gerçek kalıcılık doğrulamasını tamamlanmış sayma.
```

### Faz 6 — Sepetten ve favorilerden yeniden düzenleme

```text
R07'yi Faz 5'in modeliyle tamamla.

- Sepette kişiselleştirilmiş ürünün görsel/ürün girişini ilgili kayıtlı tasarım önizlemesine bağla; ürün, varyant, tasarım, konfigürasyon/revizyon ve hedef satır bağlamını koru. Normal ürün normal detaya gitsin.
- Editörü mevcut satırdaki placement ile aç. Kaydet hedef satırı güncellesin, adedi artırmasın; İptal eski değeri korusun. Editör açıkken hedef satır silinmişse bunu açık ele al.
- Aynı ürünün farklı tasarım/konfigürasyon satırları birbirini değiştirmesin. Aynı konfigürasyonun birden fazla adedi ile bağımsız farklı yerleşimleri ayıran kimlik kuralını uygula.
- Mevcut ürün favorilerini koruyarak kişiselleştirilmiş favori desteğini sunucuya bağlı genişlet. Kullanıcı tasarımı favoriye ekleyebilsin; favoride ürün üzerindeki sonucu görüp aynı ayarlarla editöre dönebilsin. Düzenleme sonrası favori doğru revizyonu açsın.
- Oturumun kapanması, başka kullanıcı, silinmiş tasarım, pasif ürün, kaldırılmış varyant ve eski yüzey durumlarını yönet. localStorage'ı kalıcı hesap favorilerinin yerine kullanma.

Kabul: Sepette 2 adet olan bir satırın konumu değişip kaydedilince adet 2 kalır; başka satır değişmez; favoriden geri açmada ayarlar korunur; yetkisiz erişim engellenir; eski ürün favorileri çalışır. İzole tarayıcı ve backend kontrolleri, lint, web build ve API değiştiyse sözleşme kontrolü yap.
```

### Faz 7 — Admin kişiselleştirilmiş sipariş paneli

```text
R08'i tamamla. Orders.tsx içindeki mevcut tasarım görseli ve sipariş yaşam döngüsünü genişlet; ikinci sipariş sistemi kurma.

- Tümü/Kişiselleştirilmiş/AI/Yüklenen görsel filtrelerini veya mevcut admin düzenine uygun eşdeğer ayrımı ekle.
- Sipariş satırında ürün/SKU, varyant/renk, tasarım türü/adı ve Faz 5'teki tüm yerleşim alanlarını okunabilir ayrıntı panelinde göster. Teknik değerleri birimleri ve anlamlarıyla etiketle; normalize değerleri fiziksel baskı ölçüsü diye sunma.
- Ham desen/görseli açma ve indirme, varsa ürün üzerindeki birleşik önizlemeyi ayrı açma/indirme eylemleri ekle. Dosya adları, MIME ve indirme başlıkları uygun olsun; korumalı uçlarda yetkiyi koru.
- Kişiselleştirme verisi bulunmayan eski siparişlerde eksik bilgi açıklaması göster. Güncel tasarımdan eski siparişe veri uydurma.
- Sipariş değişiklikleri ve mevcut admin erişim/MFA kuralları bozulmasın. Dosya indirme kimlik doğrulamayı atlamasın.

Kabul: AI ve yükleme siparişleri filtreleniyor; kayıtlı ayarlar müşteri snapshot'ıyla eşleşiyor; ham dosya doğru içerikle indiriliyor; varsa mockup ayrı; normal sipariş ve eski kayıt açılıyor; yetkisiz indirme reddediliyor. İlgili backend testleri, admin lint/build ve izole admin tarayıcı kontrolünü yap.
```

### Faz 8 — Bütünleşik regresyon ve teslim

```text
R01–R14 kabul ölçütlerini uçtan uca doğrula; bu fazda yeni özellik ekleme.

- Menü→kategori→ürün; karşılaştırma seçici→4 ürün→tablo→ürün ekleme→alt panel akışları.
- Üç kişiselleştirme girişi→önizleme→kaydet→sepet/favori→düzenle→checkout→admin ayrıntı/indirme akışı. Gerçek sağlayıcı yerine açıkça fake/simüle yanıt kullan.
- Yorum boş/hata/onaylı/uygunluk ve moderasyon akışları.
- Mobil/masaüstü, klavye, odak, canlı bildirim, geri/ileri, yenileme ve çok sekme davranışları.
- Eski sepet/favori/sipariş verileri ve API istemcileri için geriye uyumluluk.

pnpm lint, pnpm --filter web build, pnpm --filter admin build ve dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false çalıştır. Mevcut e2e komutlarının veri/sağlayıcı etkisini inceleyerek uygun olanları izole ortamda çalıştır. Sözleşme değiştiyse üretim/drift kontrolünü de tamamla; Flutter'a etki eden istemci değişikliği varsa uygun Dart/Flutter kontrolünü çalıştır. Çalıştırılamayanları gerekçesiyle belirt.

Teslim: R01–R14 için geçti/kaldı/engelli tablosu, doğrulanan ekranlar, değişen dosyalar, test sonuçları, veri/migration gereksinimleri ve kalan iş listesi. README'de yalnız değişen davranışlara ilişkin eski bilgileri güncelle. Deploy yapma; yayın ayrıca istendiğinde mevcut birleşik paketleme akışını kullan.
```

## 7. Son kabul kontrol listesi

- [ ] R01–R04: Header, kategori ve titanyum gezinmesi doğru.
- [ ] R05: Tüm katalog, görsel seçim, kategori/arama, 4 sınırı ve açık karşılaştırma eylemi mevcut.
- [ ] R06: Yorum bölümü boş/hata durumunda anlaşılır; mevcut uygunluk korunuyor.
- [ ] R07: Sepet ve kişisel favori aynı tasarımı ve ayarları yeniden düzenleyebiliyor.
- [ ] R08: Admin sipariş anlık görüntüsü, ham desen ve tüm ayarları gösterip indirebiliyor.
- [ ] R09–R10: İstenen kısayollar kaldırıldı; sepet toplam adedi doğru.
- [ ] R11: Tüm renklerde giriş var; eksik yüzeyler tamamlandı veya açıkça engelli kaydedildi.
- [ ] R12–R14: İmleç/odak, üç yöntemli giriş, AI yönlendirmesi ve sınırlı yeniden tasarım tamam.
- [ ] Eski kayıtlar, statik export ve mevcut karşılaştırma tasarımı korunuyor.
- [ ] Test sonuçları gerçek; engelli veri/servis senaryoları tamamlanmış gösterilmiyor.

En yüksek teknik risk R07–R08 zinciridir: yerleşimin yalnız tarayıcıda kalması admin teslimini eksik bırakır. Bu nedenle ekran düzeltmelerinden sonra veri sözleşmesi tamamlanmalı, ardından yeniden düzenleme ve operasyon ekranları kapatılmalıdır.
