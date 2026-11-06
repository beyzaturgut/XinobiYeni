# Kişiselleştirilmiş ürünlerde tek kaynak fotoğraf ve maske — task planı

Tarih: **06.11.2026**. Durum: **Yalnız inceleme ve planlama; 12 taskın tamamı açık. Uygulama, veri geçişi, deploy veya APK yapılmadı.**

## Kullanıcı kararı ve korunacak işlevler

Desenli/kişiselleştirilmiş ürün için birden fazla renk fotoğrafı gerekmeyecek. Ürün başına tek kişiselleştirme kaynağı ve maskesi planlanır; renkler arası aynı konum/ölçek/açı gereksinimi kalkar. Normal ürünlerin renk varyantları bu kararla silinmez. Fiziksel modeli farklı ürünler tek yüzeye birleştirilmez.

**Kalacak:** maskeleme kaynak fotoğrafını indirme; ürün fotoğrafı oluşturma promptu; ayrıca kaynağa bağlı maskeleme promptu, WebP maske yükleme/inceleme/onay; desen yerleşim editörü; siparişte desen, maskeleme ürün fotoğrafı ve giydirilmiş önizlemenin ayrı indirilmesi.

**Kritik ayrım:** Renkler arası hizalama kaldırılır. Maskenin kendi kaynak fotoğrafının tuvaliyle örtüşmesi ve müşterinin desen yerleşimi zorunluluğu kaldırılmaz. Bunlar yanlış kaplama ve yanlış sipariş dosyasını engeller.

## İncelemede görülen bağımlılıklar

| Alan | Mevcut durum / ilgili kaynak | Planlanan etki |
|---|---|---|
| Admin yüzey | `apps/admin/src/features/product-surfaces/SurfaceMasks.tsx`: renk bazlı liste, previewColor, colors, samePlacement ve approval/colors | Ürün başına tek yüzey/onay |
| Fotoğraf promptu | `apps/admin/src/features/catalog/catalog-photo-prompt.ts` ve `CatalogPhotoPrompt.tsx`: varyant/HEX listesi, MASTER ve çoklu çıktı | Prompt kalır; tek ürün fotoğrafı üretir |
| Maske promptu/indirme | `MaskPrompt.tsx`, `mask-prompt.ts`, `source-checksum.ts`; kaynak SHA ve piksel boyutu | İşlevler ve kaynak güvenliği korunur; renk metni uyarlanır |
| Yüzey sunucusu | `services/api/Features/ProductSurfaces/Catalog/ProductSurfaceWorkspace.cs`, `ProductSurfaceEndpoints.cs`: ürün/varyant, SurfaceColor, ApproveColors | Açık tek yüzey seçimi ve eski sözleşme uyumluluğu |
| AI | `services/api/XinobiU/XinobiUEndpoints.cs`: VariantId isteğe bağlı; ilk fotoğraflı varyant yaklaşımı mevcut | Renkten bağımsız niyet zaten kısmen var; bütün zincir buna geçirilir |
| Revizyon | `services/api/Designs/DesignConfiguration.cs`: VariantId, SurfaceVersion, kaynak doğrulaması | Ticari varyant/yüzey ayrımı ve eski kayıt korunumu |
| Web | `variant-preview-readiness.tsx`, `rendering/accepted-surface-api.ts`, kabul edilmiş önizlemeler ve ürün girişleri | Renk bazlı seçim/önbellek/uyarı bağımlılığı kaldırılır |
| Flutter | `catalog_repository.dart`, `xinobi_u_screen.dart`, `editor_screen.dart`, `design_configurations.dart` | Renk yönlendirmeleri, cache ve sözleşme güncellenir |
| Sipariş | `services/api/Orders/AdminOrderPatternEndpoints.cs`, admin `OrderDesignDetail.tsx`, SIP-TAS task planı | Yerleşim ve üç değişmez dosya korunur |
| Paket/araç | `tools/publish-product-previews.mjs`, ürün/varyant altındaki manifest ve fixture'lar | Yeni yüzey kimliği ve kontrollü eski bağlantı desteği |

Bu inceleme kaynak kodu ve mevcut dokümanlara dayanır; canlı katalog veya gerçek müşteri kayıtları değiştirilmedi. Eski aile/hizalama dokümanları tarihsel uygulamaları da içeriyor; yeni özellik gibi yeniden yapılmayacak.

## Uygulama sırası ve bağımlılıklar

01 → 02 → 03 → 04/05 → 06 → 07/08 → 09 → 10 → 11 → 12. Task numaraları aşağıda `KIS-TEK-` ön ekiyle kullanılır. Öncelik P1 veri/sözleşme/akış, P2 içerik ve tamamlama işidir; tasklar faz kapanışı anlamına gelmez.

## MostGate taskları

### KIS-TEK-01 — Kişiselleştirilmiş ürünün tek kaynak ve ticari varyant modelini tanımlama

**Konu:** Kişiselleştirilmiş ürünün tek kaynak ve ticari varyant modelini tanımlama

**Açıklama:** Kişiselleştirme için ürün başına açıkça seçilmiş tek kaynak fotoğraf ve sürümlü yüzey tanımla. Bu yüzeyi normal katalog renklerinden ayır. SKU, fiyat, stok ve tedarik eşlemesini açık bir ticari referansla kur; renk gizlenince ilk varyantı rastgele seçme. Farklı fiziksel modelleri aynı ürün altında birleştirme.

**Kabul kriteri:** Tek kaynak seçimi kalıcıdır ve katalog sırası değişince değişmez. Normal satış renkleri korunur. Desenli ürünün hangi SKU/stok/fiyatla satıldığı bellidir; işletme kararı gerektiren eşlemeler açık listelenir.

**Faz:** Faz04 · **Öncelik:** P1 · **Bağımlılık:** — · **Durum:** Açık / başlanmadı.

### KIS-TEK-02 — Mevcut kişiselleştirme verilerinin güvenli geçişini planlama

**Konu:** Mevcut kişiselleştirme verilerinin güvenli geçişini planlama

**Açıklama:** Ürün, varyant, taslak, onaylı maske, paketlenmiş önizleme, kayıtlı tasarım ve sipariş bağlarını salt okunur envanterle çıkar. Ürün başına seçilecek kaynağı ve çakışmaları raporla. Eski kayıtları silmeden yeni yüzey modeline geçiş, deneme çalıştırması, yedek ve geri dönüş adımlarını hazırla; gerekli SQL/özellik belgesi değişikliğini belirle.

**Kabul kriteri:** Geçiş tekrarlanabilir ve önce dry-run çalışır. Belirsiz kaynaklar otomatik seçilmez. Eski siparişler/dosyalar değişmez; eski tasarımlar için okunabilirlik ve yeniden düzenleme politikası ayrılır. Gerçek veri yazımı bu taskın planlama tesliminde yapılmaz.

**Faz:** Faz03 · **Öncelik:** P1 · **Bağımlılık:** 01 · **Durum:** Açık / başlanmadı.

### KIS-TEK-03 — Admin katalog ekranında tek kişiselleştirme kaynağı yönetimi

**Konu:** Admin katalog ekranında tek kişiselleştirme kaynağı yönetimi

**Açıklama:** XINOBI U ürününde tek kaynak fotoğraf seçme/yükleme ve geçerli yüzeyi görüntüleme alanını tasarla ve uygula. Normal katalog renklerini kendi alanında tut. Kaynak değişiminin yeni tasarımlara etkisini açıklayan onay ve kaydedilmemiş değişiklik koruması ekle.

**Kabul kriteri:** Kaynak yok, yükleniyor, hata, yetkisizlik, eski kaynak ve başarı ayrı görünür. Renk/HEX eksikliği kişiselleştirme kaynağı tanımlamayı engellemez. Kaynak değişimi eski sipariş dosyalarını yenilemez.

**Faz:** Faz04 · **Öncelik:** P1 · **Bağımlılık:** 01,02 · **Durum:** Açık / başlanmadı.

### KIS-TEK-04 — Fotoğraf oluşturma promptunu tek ürün görseline uyarlama

**Konu:** Fotoğraf oluşturma promptunu tek ürün görseline uyarlama

**Açıklama:** Mevcut katalog fotoğrafı oluşturma ve kopyalama alanını koru. XINOBI U için çoklu renk, HEX listesi, MASTER üzerinden yeniden renklendirme ve renkler arası piksel eşitliği talimatlarını tek kaynak fotoğraf üretimine dönüştür. Ürün şekli, logo, parça, açı, arka plan, WebP ve tuval kurallarını koru; renkli normal katalog işlevleriyle kapsamı ayır.

**Kabul kriteri:** Tek görsel istenir; renk sayısı kadar dosya veya HEX zorunluluğu yoktur. Prompt kopyalama/hata geri bildirimi çalışır. Kaynak fotoğrafın gerçek ürün doğruluğu ayrıca kontrol edilir; AI çıktısı otomatik onaylanmaz.

**Faz:** Faz04 · **Öncelik:** P2 · **Bağımlılık:** 01,03 · **Durum:** Açık / başlanmadı.

### KIS-TEK-05 — Maskeleme ekranını ürün başına tek yüzeyle sadeleştirme

**Konu:** Maskeleme ekranını ürün başına tek yüzeyle sadeleştirme

**Açıklama:** Renk satırları, önizleme rengi, seçili renk listesi, renklere toplu uygulama ve aynı konum onayını kişiselleştirme akışından çıkar. Ürün başına tek kaynak/maske/taslak/onay göster. Maskeleme için kaynak fotoğrafı indirme, SHA doğrulaması, maskeleme promptu, WebP yükleme, örnek desen, taslak indirme ve onay/geri alma işlevlerini koru.

**Kabul kriteri:** Renkler arası hizalama kontrolü yoktur. Maskenin kendi kaynak fotoğrafıyla aynı boyut/koordinat, logo/kulp koruması ve kaynak hash kontrolü devam eder. Fotoğraf üretim promptu ile maskeleme promptu ayrı ve erişilebilir kalır.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 01,03,04 · **Durum:** Açık / başlanmadı.

### KIS-TEK-06 — Yüzey API ve yayınlama sözleşmesini tek kaynak modeline taşıma

**Konu:** Yüzey API ve yayınlama sözleşmesini tek kaynak modeline taşıma

**Açıklama:** Yüzey liste/detay/yükleme/onay/iptal ve rendering-inputs sözleşmelerini yeni yüzey kimliğine bağla. Yeni kişiselleştirme yolunda colors/samePlacementConfirmed bağımlılığını kaldır. Kaynak hash, yüzey sürümü, eşzamanlı güncelleme ve catalog yetkilerini koru. Paketlenmiş önizleme manifestleri/yayımlama araçları ile TS/Dart sözleşmelerini güncelle; eski istemciler için süreli uyumluluk tanımla.

**Kabul kriteri:** Başka ürüne maske bağlanamaz. Eski fotoğrafa hazırlanan maske reddedilir. Anonim erişimde yalnız onaylı aktif yüzey sunulur. Eski varyant URL desteği açıkça tanımlanır; yeni kayıtlar sessizce yanlış kaynağa yönlendirilmez.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 01,02,05 · **Durum:** Açık / başlanmadı.

### KIS-TEK-07 — Web kişiselleştirme akışından zorunlu renk seçimini kaldırma

**Konu:** Web kişiselleştirme akışından zorunlu renk seçimini kaldırma

**Açıklama:** Katalog ve ürün detayındaki XINOBI U girişlerini, kendi görseli yükleme, AI soru/sonuç, ürün seçimi, önizleme ve editörü tek yüzeyle çalıştır. Renk seçicisi ve “bu renk desteklenmiyor” gibi kişiselleştirmeye özgü mesajları uyarlayarak ürün/yüzey hazır olma durumunu göster. Normal ürün alışverişindeki renk davranışını koru.

**Kabul kriteri:** Yeni ve eski bağlantılar, geri/ileri, yenileme, tasarım açma ve yeniden deneme kontrol edilir. Bir önceki ürünün görseli/durumu taşınmaz. 320/390/768/1440 px ve %200 metinde akış kullanılabilir.

**Faz:** Faz02 · **Öncelik:** P1 · **Bağımlılık:** 06 · **Durum:** Açık / başlanmadı.

### KIS-TEK-08 — Flutter kişiselleştirme akışını tek kaynak modeline eşleme

**Konu:** Flutter kişiselleştirme akışını tek kaynak modeline eşleme

**Açıklama:** Mobilde renk adımı, yönlendirmeler, AI oturumu, yükleme, editör, önizleme ve kayıtlı tasarımları yeni sözleşmeye geçir. Riverpod/yerel önbellek anahtarlarını ürün ve yüzey sürümüne göre güncelle. Eski deep linkleri ve kayıtları kontrollü ele al; normal ürün varyantları korunur.

**Kabul kriteri:** Android ve iOS sonuçları ayrı kaydedilir. Renk seçmeden akış tamamlanabilir. Yüklenme/boş/hata/başarı ve ağ kesintisinde form korunur. Otomatik/widget testi gerçek cihaz kabulü olarak sunulmaz.

**Faz:** Faz11 · **Öncelik:** P1 · **Bağımlılık:** 06,07 · **Durum:** Açık / başlanmadı.

### KIS-TEK-09 — Tasarım revizyonu, sepet ve checkout bağlarını güncelleme

**Konu:** Tasarım revizyonu, sepet ve checkout bağlarını güncelleme

**Açıklama:** Tasarım kaydı ve revizyonunu yeni tek kaynak yüzey sürümüne bağla. Sepet birleştirme, yeniden düzenleme, favoriler/Tasarımlarım, fiyat/stok kontrolü ve checkout doğrulamasında ticari SKU ile görsel yüzey kimliğini ayrı doğrula. AI oturumunda ilk fotoğraflı varyant fallback davranışını açık kaynak seçimine geçir.

**Kabul kriteri:** Aynı ürünün farklı tasarımları yanlış birleştirilmez; revizyon ve yanlış ürün/yüzey hataları reddedilir. Kaynak değişmişse yeniden yerleştirme istenir. Eski tasarım otomatik dönüştürülmez. Fiyat/stok uydurulmaz ve sunucu onayı olmadan başarı gösterilmez.

**Faz:** Faz05 · **Öncelik:** P1 · **Bağımlılık:** 01,06,07,08 · **Durum:** Açık / başlanmadı.

### KIS-TEK-10 — Sipariş baskı detayını ve üç dosyanın geçmiş bütünlüğünü koruma

**Konu:** Sipariş baskı detayını ve üç dosyanın geçmiş bütünlüğünü koruma

**Açıklama:** SIP-TAS-01…09 kapsamındaki sipariş satırı, kaydedilen yerleşim, desen, maskelemede kullanılan ürün fotoğrafı ve giydirilmiş önizlemeyi yeni yüzey kimliğiyle eşle. Yeni kişiselleştirme satırlarında gereksiz renk sunumunu kaldır; eski siparişin kayıtlı rengini ve dosyalarını tarihsel bilgi olarak koru.

**Kabul kriteri:** Üç dosya ayrı ve doğru sipariş/satır/revizyon için iner. Ürün kaynağı katalogda değişse de eski siparişin dosya hashleri/yerleşimi değişmez. Eksik, bozuk ve yetkisiz dosya doğru hatayı verir. Üretime hazırlama veya sevk operasyonu eklenmez.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 02,06,09 · **Durum:** Açık / başlanmadı.

### KIS-TEK-11 — Bağlı dokümanları, araçları ve eski renk/hizalama kurallarını temizleme

**Konu:** Bağlı dokümanları, araçları ve eski renk/hizalama kurallarını temizleme

**Açıklama:** Güncel runbook, ekran metni, fixture üreticisi, yayınlama araçları ve task/faz kayıtlarını yeni kurala geçir. Aile maskesi, renk hizalama ve çoklu renk fotoğrafı belgelerini tarihsel olarak işaretle; halen kullanılan normal katalog araçlarını ayır. Kullanılmayan kod/rota ancak çağıranları doğrulandıktan sonra kaldırılır.

**Kabul kriteri:** Yeni iş akışı tek bir güncel kaynaktan izlenir. Tarihsel test kanıtı silinmez veya yeni davranışın kanıtı sayılmaz. Paylaşılan normal katalog, fiyat/stok ve kargo entegrasyonu etkileri açıkça kayıtlıdır.

**Faz:** Faz00 · **Öncelik:** P2 · **Bağımlılık:** 03–10 · **Durum:** Açık / başlanmadı.

### KIS-TEK-12 — Tek kaynak kişiselleştirme kabulü ve regresyonunu tamamlama

**Konu:** Tek kaynak kişiselleştirme kabulü ve regresyonunu tamamlama

**Açıklama:** Yeni ürün kaynağı → fotoğraf promptu → kaynak indirme → maske promptu/yükleme/onay → web/Flutter tasarım → revizyon → sepet → demo checkout → admin üç dosya teslimi zincirini izole verilerle test et. Eski sipariş/tasarım, kaynak değişimi, yanlış ürün, eksik dosya, yetki, çift gönderim ve normal renkli ürün regresyonunu ekle.

**Kabul kriteri:** API ve TS/Dart sözleşme testleri, web/admin lint-tip-üretim derlemesi, odaklı tarayıcı ve Flutter testleri raporlanır. Android/iOS gerçek cihaz ve gerekiyorsa SQL kabulü ayrı kayıtlıdır. Gerçek müşteri/sipariş verisi değiştirilmez; uygulama testlerinden sonra yayın ayrı task/izin kapsamıdır.

**Faz:** Faz11 · **Öncelik:** P1 · **Bağımlılık:** 01–11 · **Durum:** Açık / başlanmadı.

## Açık kararlar ve kapsam sınırı

- Teknik plan ürün başına açıkça seçilen tek yüzeyi esas alır; gerçek katalogda hangi fotoğrafın esas alınacağı veri geçişi envanterinde belirlenir. Fotoğraf yoksa üretilip incelenmesi gerekir.
- Desenli ürünün fiziksel tedarik SKU’su, gerçek stok ve fiyat bağlantısı task 01’de netleşir. Renk seçimini gizlemek stok/fiyat kaynağını ortadan kaldırmaz; başka SKU’dan varsayılan fiyat alınmaz.
- Korunan kulp/kapak/metal gibi alanların fotoğrafı gerçek ürünü temsil etmelidir. Desen bu parçaları kapatmıyorsa fotoğraf doğruluğu ayrıca kabul edilir.
- Renkler arası hizalama işi kalktığı için maskenin kaynak boyutu, checksum ve yüzey sürümü güvenliği gevşetilmez. Baskı DPI/ölçü ve fiziksel üretim kabulü bu sadeleşmeyle çözülmüş sayılmaz.
- Önceki 120 kapanış görevi veya SIP-TAS-01…09 sıfırlanmaz. Bu 12 task, değişiklik talebinin ek kapsamıdır; uygulandıkça ilgili eski maddelerle eşleme yapılır.
