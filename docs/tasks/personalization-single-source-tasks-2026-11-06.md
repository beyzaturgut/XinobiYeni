# Kişiselleştirilmiş ürünlerde tek kaynak fotoğraf ve maske — task planı

Tarih: **06.11.2026**. Durum: **Aşamalı uygulama; KIS-TEK-01 teknik model tamam; ürün bazlı ticari eşleme kabulü bekliyor. KIS-TEK-02 planlama teslimi tamamlandı; KIS-TEK-03, 04, 05 ve 06 uygulandı; KIS-TEK-07…12 açık. Gerçek veri geçişi, deploy veya APK yapılmadı.**

## Kullanıcı kararı ve korunacak işlevler

Desenli/kişiselleştirilmiş ürün için birden fazla renk fotoğrafı gerekmeyecek. Ürün başına tek kişiselleştirme kaynağı ve maskesi planlanır; renkler arası aynı konum/ölçek/açı gereksinimi kalkar. Normal ürünlerin renk varyantları bu kararla silinmez. Fiziksel modeli farklı ürünler tek yüzeye birleştirilmez.

**Kalacak:** doğrudan yüklenen kaynak fotoğrafını indirme; kaynağa bağlı maskeleme promptu, WebP maske yükleme/inceleme/onay; desen yerleşim editörü; siparişte desen, maskeleme ürün fotoğrafı ve giydirilmiş önizlemenin ayrı indirilmesi.

**Güncel karar (06.11.2026 revizyonu):** Fotoğraf oluşturma promptu kaldırılacak; doğrudan yüklenen görsel kaynak olacak. Sabit piksel boyutu veya en-boy oranı şartı olmayacak; 1333×2000 gibi standart tuvale dönüştürülmeyecek. Maskeleme promptunun kuralları korunacak, piksel bilgisi yüklenen kaynağın gerçek genişlik/yüksekliğinden alınacak. Birden fazla görsele aynı maskeyi uygulama, renkler arası önizleme ve toplu onay adımları kaldırılacak. Task 01–03 değişmedi; 04–12 bu karara göre revize edildi.

**Kritik ayrım:** Renkler arası hizalama kaldırılır. Maskenin kendi kaynak fotoğrafının tuvaliyle örtüşmesi ve müşterinin desen yerleşimi zorunluluğu kaldırılmaz. Bunlar yanlış kaplama ve yanlış sipariş dosyasını engeller.

## İncelemede görülen bağımlılıklar

| Alan | Mevcut durum / ilgili kaynak | Planlanan etki |
|---|---|---|
| Admin yüzey | `apps/admin/src/features/product-surfaces/SurfaceMasks.tsx`: renk bazlı liste, previewColor, colors, samePlacement ve approval/colors | Ürün başına tek yüzey/onay |
| Fotoğraf promptu | `apps/admin/src/features/catalog/catalog-photo-prompt.ts` ve `CatalogPhotoPrompt.tsx`: varyant/HEX listesi, MASTER ve çoklu çıktı | XINOBI U fotoğraf üretim promptu kaldırılır; doğrudan yükleme kullanılır |
| Maske promptu/indirme | `MaskPrompt.tsx`, `mask-prompt.ts`, `source-checksum.ts`; kaynak SHA ve piksel boyutu | Kaynak indirme ve mevcut maskeleme kuralları korunur; piksel boyutu gerçek kaynaktan alınır |
| Yüzey sunucusu | `services/api/Features/ProductSurfaces/Catalog/ProductSurfaceWorkspace.cs`, `ProductSurfaceEndpoints.cs`: ürün/varyant, SurfaceColor, ApproveColors | Açık tek yüzey seçimi; çoklu görsele uygulama kaldırılır; eski kayıt okuma uyumluluğu |
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

**Faz:** Faz04 · **Öncelik:** P1 · **Bağımlılık:** — · **Durum:** Teknik model tamamlandı; işletmenin ürün bazlı SKU/fiyat/stok eşleme kabulü bekliyor.

**Teslim:** [ADR-005 — veri modeli, ticari bağ, durumlar ve kabul senaryoları](../decisions/ADR-005-personalization-single-source.md). Kaynak kodu veya katalog verisi değiştirilmedi; task bütünüyle kapatılmadı.

### KIS-TEK-02 — Mevcut kişiselleştirme verilerinin güvenli geçişini planlama

**Konu:** Mevcut kişiselleştirme verilerinin güvenli geçişini planlama

**Açıklama:** Ürün, varyant, taslak, onaylı maske, paketlenmiş önizleme, kayıtlı tasarım ve sipariş bağlarını salt okunur envanterle çıkar. Ürün başına seçilecek kaynağı ve çakışmaları raporla. Eski kayıtları silmeden yeni yüzey modeline geçiş, deneme çalıştırması, yedek ve geri dönüş adımlarını hazırla; gerekli SQL/özellik belgesi değişikliğini belirle.

**Kabul kriteri:** Geçiş tekrarlanabilir ve önce dry-run çalışır. Belirsiz kaynaklar otomatik seçilmez. Eski siparişler/dosyalar değişmez; eski tasarımlar için okunabilirlik ve yeniden düzenleme politikası ayrılır. Gerçek veri yazımı bu taskın planlama tesliminde yapılmaz.

**Faz:** Faz03 · **Öncelik:** P1 · **Bağımlılık:** 01 · **Durum:** Planlama teslimi tamamlandı; gerçek geçiş yapılmadı.

**Teslim:** [Envanter ve güvenli geçiş planı](../reports/personalization-migration-plan-2026-11-06.md); SQL sorgusu ve tekrarlanabilir salt okunur analiz aracı hazır. Kaynak/SKU seçimi, IIS dosya kabulü ve gerçek restore/apply ayrı açık koşullardır.

### KIS-TEK-03 — Admin katalog ekranında tek kişiselleştirme kaynağı yönetimi

**Konu:** Admin katalog ekranında tek kişiselleştirme kaynağı yönetimi

**Açıklama:** XINOBI U ürününde tek kaynak fotoğraf seçme/yükleme ve geçerli yüzeyi görüntüleme alanını tasarla ve uygula. Normal katalog renklerini kendi alanında tut. Kaynak değişiminin yeni tasarımlara etkisini açıklayan onay ve kaydedilmemiş değişiklik koruması ekle.

**Kabul kriteri:** Kaynak yok, yükleniyor, hata, yetkisizlik, eski kaynak ve başarı ayrı görünür. Renk/HEX eksikliği kişiselleştirme kaynağı tanımlamayı engellemez. Kaynak değişimi eski sipariş dosyalarını yenilemez.

**Faz:** Faz04 · **Öncelik:** P1 · **Bağımlılık:** 01,02 · **Durum:** Uygulandı ve izole doğrulandı (06.11.2026).

**Teslim:** [Kaynak yönetimi](../runbooks/personalization-source-management.md), [TST-258](../../test/2026-11-06/TST-258-personalization-source-management.md). **Yeniden kontrol:** [TST-260](../../test/2026-11-06/TST-260-source-task03-04-recheck.md); katalog güncellemesinde ürün/ kaynak taslağının kaybolması düzeltildi, 4. task bağımlılığı tekrar doğrulandı. Yeni kaynak hazırlığı ayrı saklanır; gerçek ürün seçimi yapılmadı. Maske onayı ve web/Flutter geçişi 05–10 kapsamında açık; fotoğraf promptu 04 ile kaldırıldı.

### KIS-TEK-04 — Fotoğraf üretim promptunu kaldırma ve doğrudan kaynak yükleme

**Konu:** Fotoğraf üretim promptunu kaldırma ve doğrudan kaynak yükleme

**Açıklama:** Kişiselleştirilmiş ürün akışındaki katalog fotoğrafı üretim/kopyalama alanını, MASTER ve çoklu renk görsel üretim yönlendirmelerini kaldır. Adminin doğrudan yüklediği tek görseli kişiselleştirme ve maskeleme kaynağı yap. Sabit piksel boyutu/en-boy oranı şartı koyma; yüklenen görseli standart tuvale yeniden boyutlandırma veya kırpma. Kaynak dosyanın gerçek genişlik, yükseklik ve SHA bilgisini kaydet; kaynak fotoğraf indirme işlevini koru.

**Kabul kriteri:** Farklı boyut/orandaki geçerli görseller yalnız ölçüleri nedeniyle reddedilmez. Ürün fotoğrafı üretim promptu görünmez; maskeleme promptu kalır. İndirilen kaynak, maskeye esas alınan dosyayla aynı hash ve boyuttadır. Normal katalog renkleri bu işlemle silinmez. Format/dosya bütünlüğü ve mevcut güvenli dosya işleme kontrolleri korunur; sabit tuval dayatmasına dönüşmez.

**Faz:** Faz04 · **Öncelik:** P1 · **Bağımlılık:** 01,03 · **Durum:** Uygulandı ve doğrulandı (06.11.2026).

**Teslim:** [TST-259](../../test/2026-11-06/TST-259-direct-source-no-photo-prompt.md). Fotoğraf üretim promptunun iki girişi ve kullanılmayan modülleri kaldırıldı; 5001×3730 PNG ham yükleme/indirmede birebir korundu. Maskeleme promptu aynen kaldı; yeni kaynağa bağlanması ve toplu renk maskesi temizliği 05/06’da açık.

### KIS-TEK-05 — Maskeleme ekranını tek görsele indirme ve prompt boyutunu dinamikleştirme

**Konu:** Maskeleme ekranını tek görsele indirme ve prompt boyutunu dinamikleştirme

**Açıklama:** Renk satırlarını, önizleme rengi seçimini, seçili renk listesini, aynı maskeyi birden fazla görsele uygulamayı, aynı konum onayını ve toplu renk onayını kaldır. Yalnız yüklenen kaynak için taslak/örnek desen/onay göster. Kaynak indirme, SHA doğrulaması, maskeleme promptu kopyalama, WebP yükleme, taslak indirme ve onay/geri alma işlevlerini koru. Maskeleme promptunun yalnız piksel boyutu bilgisini kaynağın gerçek genişlik/yüksekliğine bağla; logo, kulp, parça, şeffaflık ve diğer mevcut maskeleme talimatlarını aynen koru.

**Kabul kriteri:** Prompt her kaynak için doğru gerçek ölçüyü gösterir; fotoğraf üretimi veya başka renge uygulama istemez. Maske kendi kaynağıyla aynı boyut/koordinattadır; farklı boyutta maske reddedilir. Sabit bir kaynak çözünürlüğü zorunluluğu yoktur. Kaynak değişince ölçü/prompt güncellenir; eski maske yeni kaynağa sessizce uygulanmaz. Çoklu görsel seçimi ve renkler arası hizalama ekranı bulunmaz.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 01,03,04 · **Durum:** Admin tek kaynak maskeleme uygulandı ve izole doğrulandı (06.11.2026).

**Teslim:** [Tek kaynak maskeleme](../runbooks/single-source-masking.md), [TST-261](../../test/2026-11-06/TST-261-single-source-masking.md). Renk/toplu onay UI’sı kaldırıldı; tek kaynak sürümüne taslak/onay/indirme çalışır. Eski API yazma rotalarının kapatılması, public yayın/istemci sözleşmesi ve 20 MP decoder bütçesi 06’da açık. Müşteri akışı veya fiziksel baskı kabulü değildir.

### KIS-TEK-06 — Yüzey API ve yayınlamayı dinamik boyutlu tek kaynağa taşıma

**Konu:** Yüzey API ve yayınlamayı dinamik boyutlu tek kaynağa taşıma

**Açıklama:** Liste/detay/yükleme/onay/iptal ve rendering-inputs sözleşmelerini tek kaynak yüzeyine bağla. Sabit kaynak çözünürlüğü varsayımlarını kaldır; gerçek genişlik/yükseklik metadata’sını önizleme ve dosya doğrulamasına taşı. Yeni akışta colors/samePlacementConfirmed ve çoklu hedef onayı kullanılmasın. Eski toplu uygulama yazma uçlarını devreden çıkarırken kullanılan istemcileri kontrol et; eski kayıtları okumak için maske çoğaltma işlemini açık tutma. Kaynak hash/sürüm, eşzamanlılık ve yetki kontrollerini koru; manifest/yayınlama araçları ve TS/Dart sözleşmelerini güncelle.

**Kabul kriteri:** Kaynak farklı oran/boyutta olabilir; maske o kaynağın gerçek ölçüsüyle doğrulanır. Onay yalnız seçili tek yüzeyi etkiler. Başka ürüne/görsele toplu uygulama yapılamaz. Anonim erişim yalnız aktif/onaylı yüzeyi sunar. Eski bağlantılar/kayıtlar yanlış kaynağa sessizce yönlendirilmez; uyumluluk politikası belgelenir.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 01,02,04,05 · **Durum:** Uygulandı ve izole doğrulandı (09.11.2026).

**Teslim:** [Tek kaynak yayın API/sözleşme/araç rehberi](../runbooks/single-source-publication.md), [TST-263](../../test/2026-11-09/TST-263-single-source-publication.md). Güncel aktif/onaylı yüzey gerçek ölçülerle sunulur; eski renk yazma uçları 410, geçmiş okumalar korunur. 20 MP sabit sınırı tek kaynak maske akışında RAM bütçesine geçirildi. Web/Flutter ve sipariş tüketici geçişi 07–10 kapsamında açık.

### KIS-TEK-07 — Web kişiselleştirme akışından zorunlu renk seçimini kaldırma

**Konu:** Web kişiselleştirme akışından zorunlu renk seçimini kaldırma

**Açıklama:** Katalog ve ürün detayındaki XINOBI U girişlerini, kendi görseli yükleme, AI soru/sonuç, ürün seçimi, önizleme ve editörü tek yüzeyle çalıştır. Renk seçicisi ve “bu renk desteklenmiyor” gibi kişiselleştirmeye özgü mesajları uyarlayarak ürün/yüzey hazır olma durumunu göster. Yüklenen kaynağın gerçek en-boy oranıyla responsive önizleme sun; sabit 1333×2000 tuval veya çoklu renk maskesi varsayma. Normal ürün alışverişindeki renk davranışını koru.

**Kabul kriteri:** Yeni ve eski bağlantılar, geri/ileri, yenileme, tasarım açma ve yeniden deneme kontrol edilir. Bir önceki ürünün görseli/durumu taşınmaz. Yatay, dikey ve kare kaynakta maske/desen yerleşimi aynı kaynak koordinatlarını kullanır; görüntüleme ölçeği kayıtlı yerleşimi değiştirmez. 320/390/768/1440 px ve %200 metinde akış kullanılabilir.

**Faz:** Faz02 · **Öncelik:** P1 · **Bağımlılık:** 06 · **Durum:** Açık / başlanmadı.

### KIS-TEK-08 — Flutter kişiselleştirme akışını tek kaynak modeline eşleme

**Konu:** Flutter kişiselleştirme akışını tek kaynak modeline eşleme

**Açıklama:** Mobilde renk adımı, yönlendirmeler, AI oturumu, yükleme, editör, önizleme ve kayıtlı tasarımları yeni sözleşmeye geçir. Riverpod/yerel önbellek anahtarlarını ürün ve yüzey sürümüne göre güncelle. Gerçek kaynak boyutunu/oranını render ve editöre taşı; birden fazla renk görseline maske uygulama varsayımını kaldır. Eski deep linkleri ve kayıtları kontrollü ele al; normal ürün varyantları korunur.

**Kabul kriteri:** Android ve iOS sonuçları ayrı kaydedilir. Renk seçmeden akış tamamlanabilir; farklı kaynak boyutları/oranları bozulmadan görüntülenir ve web ile aynı yerleşim verisini üretir. Yüklenme/boş/hata/başarı ve ağ kesintisinde form korunur. Otomatik/widget testi gerçek cihaz kabulü olarak sunulmaz.

**Faz:** Faz11 · **Öncelik:** P1 · **Bağımlılık:** 06,07 · **Durum:** Açık / başlanmadı.

### KIS-TEK-09 — Tasarım revizyonu, sepet ve checkout bağlarını güncelleme

**Konu:** Tasarım revizyonu, sepet ve checkout bağlarını güncelleme

**Açıklama:** Tasarım kaydı ve revizyonunu yeni tek kaynak yüzey sürümüne bağla. Sepet birleştirme, yeniden düzenleme, favoriler/Tasarımlarım, fiyat/stok kontrolü ve checkout doğrulamasında ticari SKU ile görsel yüzey kimliğini ayrı doğrula. AI desen oturumunda ilk fotoğraflı varyant fallback davranışını açık kaynak seçimine geçir. Yüklenen kaynak ve maskenin gerçek piksel ölçülerini revizyon doğrulamasında kullan; sabit tuval veya ortak renk maskesi varsayma. Fotoğraf üretim promptunun kaldırılması müşterinin AI desen üretimini kaldırmaz.

**Kabul kriteri:** Aynı ürünün farklı tasarımları yanlış birleştirilmez; revizyon ve yanlış ürün/yüzey hataları reddedilir. Kaynak değişmişse yeniden yerleştirme istenir. Eski tasarım otomatik dönüştürülmez. Fiyat/stok uydurulmaz ve sunucu onayı olmadan başarı gösterilmez.

**Faz:** Faz05 · **Öncelik:** P1 · **Bağımlılık:** 01,06,07,08 · **Durum:** Açık / başlanmadı.

### KIS-TEK-10 — Sipariş baskı detayını ve üç dosyanın geçmiş bütünlüğünü koruma

**Konu:** Sipariş baskı detayını ve üç dosyanın geçmiş bütünlüğünü koruma

**Açıklama:** SIP-TAS-01…09 kapsamındaki sipariş satırı, kaydedilen yerleşim, desen, maskelemede kullanılan ürün fotoğrafı ve giydirilmiş önizlemeyi yeni yüzey kimliğiyle eşle. Yeni kişiselleştirme satırlarında gereksiz renk sunumunu kaldır; eski siparişin kayıtlı rengini ve dosyalarını tarihsel bilgi olarak koru.

**Kabul kriteri:** Üç dosya ayrı ve doğru sipariş/satır/revizyon için iner. İndirilen maskeleme ürün fotoğrafı yüklenen kaynak dosyasıdır; yerleşim gerçek kaynak ölçülerine göre gösterilir, sabit çözünürlüğe zorlanmaz. Ürün kaynağı katalogda değişse de eski siparişin dosya hashleri/yerleşimi değişmez. Eksik, bozuk ve yetkisiz dosya doğru hatayı verir. Üretime hazırlama veya sevk operasyonu eklenmez.

**Faz:** Faz06 · **Öncelik:** P1 · **Bağımlılık:** 02,06,09 · **Durum:** Açık / başlanmadı.

### KIS-TEK-11 — Bağlı dokümanları, araçları ve eski renk/hizalama kurallarını temizleme

**Konu:** Bağlı dokümanları, araçları ve eski renk/hizalama kurallarını temizleme

**Açıklama:** Güncel runbook, ekran metni, fixture üreticisi, yayınlama araçları ve task/faz kayıtlarını yeni kurala geçir. Fotoğraf üretim promptu, sabit tuval gereksinimi, aile maskesi transferi, renk hizalama ve çoklu görsele ortak maske uygulama belgelerini tarihsel olarak işaretle; yeni akıştan bu yönlendirmeleri kaldır. Halen kullanılan normal katalog araçlarını ayır. Kullanılmayan kod/rota ancak çağıranları doğrulandıktan sonra kaldırılır.

**Kabul kriteri:** Yeni iş akışı tek bir güncel kaynaktan izlenir: görsel yükle → kaynağı indir → gerçek ölçülü maskeleme promptunu kullan → WebP maskeyi yükle/incele/onayla. Fotoğraf üretimi veya çoklu görsele uygulama aşaması yoktur. Tarihsel test kanıtı silinmez veya yeni davranışın kanıtı sayılmaz. Paylaşılan normal katalog, fiyat/stok ve kargo entegrasyonu etkileri açıkça kayıtlıdır.

**Faz:** Faz00 · **Öncelik:** P2 · **Bağımlılık:** 03–10 · **Durum:** Açık / başlanmadı.

### KIS-TEK-12 — Tek kaynak kişiselleştirme kabulü ve regresyonunu tamamlama

**Konu:** Tek kaynak kişiselleştirme kabulü ve regresyonunu tamamlama

**Açıklama:** Doğrudan kaynak görsel yükleme → kaynak indirme → gerçek boyutlu maske promptu/yükleme/onay → web/Flutter tasarım → revizyon → sepet → demo checkout → admin üç dosya teslimi zincirini izole verilerle test et. Eski sipariş/tasarım, kaynak değişimi, yanlış ürün, eksik dosya, yetki, çift gönderim ve normal renkli ürün regresyonunu ekle. Küçük/büyük, yatay/dikey/kare kaynaklar, kaynak-maskede boyut uyuşmazlığı ve çoklu onay uçlarının devreden çıkmasını test et; fotoğraf üretim promptunun görünmediğini doğrula. Gerçek AI çağrısı olmadan prompt içeriği doğrulanabilir; farklı boyutta çıktı veren sağlayıcı sonucu otomatik doğru sayılmaz.

**Kabul kriteri:** API ve TS/Dart sözleşme testleri, web/admin lint-tip-üretim derlemesi, odaklı tarayıcı ve Flutter testleri raporlanır. Android/iOS gerçek cihaz ve gerekiyorsa SQL kabulü ayrı kayıtlıdır. Gerçek müşteri/sipariş verisi değiştirilmez; uygulama testlerinden sonra yayın ayrı task/izin kapsamıdır.

**Faz:** Faz11 · **Öncelik:** P1 · **Bağımlılık:** 01–11 · **Durum:** Açık / başlanmadı.

## Açık kararlar ve kapsam sınırı

- Teknik plan ürün başına açıkça seçilen tek yüzeyi esas alır; gerçek katalogda hangi fotoğrafın esas alınacağı veri geçişi envanterinde belirlenir. Kaynak, admin tarafından doğrudan yüklenir; bu akışta ürün fotoğrafı ürettirme adımı yoktur.
- Desenli ürünün fiziksel tedarik SKU’su, gerçek stok ve fiyat bağlantısı task 01’de netleşir. Renk seçimini gizlemek stok/fiyat kaynağını ortadan kaldırmaz; başka SKU’dan varsayılan fiyat alınmaz.
- Korunan kulp/kapak/metal gibi alanların fotoğrafı gerçek ürünü temsil etmelidir. Desen bu parçaları kapatmıyorsa fotoğraf doğruluğu ayrıca kabul edilir.
- Kaynak için sabit piksel boyutu/en-boy oranı şartı yoktur. Maskenin kendi kaynağıyla boyut/koordinat eşliği, checksum ve yüzey sürümü doğrulaması korunur. Sınırsız dosya/bellek tüketimi taahhüt edilmez; mevcut dosya işleme korumaları sabit tuval gereksinimi olarak kullanılmaz. Baskı DPI/ölçü ve fiziksel üretim kabulü bu sadeleşmeyle çözülmüş sayılmaz.
- Önceki 120 kapanış görevi veya SIP-TAS-01…09 sıfırlanmaz. Bu 12 task, değişiklik talebinin ek kapsamıdır; uygulandıkça ilgili eski maddelerle eşleme yapılır.
