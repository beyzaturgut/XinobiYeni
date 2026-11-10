# ADR-005 — Tek kaynaklı kişiselleştirme ve ticari SKU bağı

> **10.11.2026:** Bu belge hedef model kararı ve tarihli teslim geçmişidir. Güncel uygulama/kullanım: [tek kaynak rehberi](../runbooks/single-source-personalization.md). 03–11 teknik uygulamaları tamamlandı; 12 ve gerçek ortam kabulü ayrı açıktır.

Tarih: 06.11.2026 · Task: KIS-TEK-01 · Durum: Teknik model tanımlandı; uygulama ve ürün bazlı eşleme yapılmadı.

## Kapsam kararı

Kişiselleştirilmiş ürün başına tek, adminin doğrudan yüklediği kaynak fotoğraf ve bu fotoğrafa ait maske kullanılır. Müşteri renk seçmez. Normal katalogdaki renk varyantları korunur. Fiziksel modeli farklı ürünler aynı yüzey altında birleştirilmez. Fotoğraf oluşturma promptu yoktur; kaynak indirme ve mevcut maskeleme promptu kalır. Maskeleme promptunda ölçü, gerçek kaynak boyutundan alınır; diğer maskeleme talimatları korunur.

Bu task veri modelini ve iş kurallarını tanımlar. Yeni alanlar/rotalar aşağıda hedef sözleşmedir; çalışan API’de varmış gibi kullanılmamalıdır. Uygulama task 03–10’da, gerçek veri geçişi task 02’nin deneme/geri dönüş planıyla yapılır.

## Mevcut yapıda doğrulanan durum

| Kaynak | Kanıt / sonuç |
|---|---|
| `services/api/LocalCommerce/LocalCommerceStore.cs` | CommerceVariant SKU, Stock, Image ve SurfaceMask/SurfaceImage taşır. CommerceProduct üzerinde Personalizable ve OriginalImage bulunur; ayrı kişiselleştirme kaynağı yoktur. |
| `services/api/Catalog/CatalogProjection.cs` | Fiyat `Prices[variant.Id]` üzerinden gelir; eksik/geçersiz fiyat null, satın alınabilirlik fiyat ve stokla hesaplanır. |
| `services/api/Catalog/SqlCommerceStore.cs` | SKU benzersizliği ve fiyatın mevcut varyanta ait olması doğrulanır. |
| `services/api/Features/ProductSurfaces/Catalog/ProductSurfaceWorkspace.cs` | Onaylar varyant görseline bağlı; ApproveColors aynı boyutlu görselleri toplu günceller. Yeni akışta bu yazma davranışı olmayacak. |
| `services/api/DesignStudio/DesignSessionStore.cs` | VariantId verilmezse ilk fotoğraflı varyant seçiliyor; yeni akışta bu fallback kaldırılmalı. |
| `services/api/Designs/DesignConfiguration.cs` | Revizyon VariantId, SourceSha256 ve SurfaceVersion saklar; doğrulayıcı varyant yüzeyini kullanır. |
| `services/api/Identity/CustomerEndpoints.cs` | Checkout fiyat/stok/varyant ve tasarım sahipliğini doğrular; kayıtlı revizyonun varyantını karşılaştırır; üç dosyayı siparişe kopyalar. Demo sipariş gerçek ödeme/stok rezervasyonu değildir. |
| `services/api/Identity/CustomerContracts.cs` | Sipariş satırında varyant ve fiyat, kişiselleştirmede SKU, yerleşim ve değişmez dosya referansları var. |

## Karar: görsel yüzeyi ve ticari bağı ayrı tut

Bir ürünün kişiselleştirme profili ürün kimliğiyle tekildir; renk veya varyant sırasıyla seçilmez. Yüzey kimliği ile satılan ticari varyant kimliği aynı kavram değildir. Aynı ürünün normal satışı mevcut katalog sözleşmesiyle devam eder.

### Hedef alanlar

| Kayıt | Alanlar | Kural |
|---|---|---|
| PersonalizationProfile | productId, profileRevision, enabled, currentSourceRevision, currentApprovedSurfaceVersion, fulfillmentVariantId | Ürün başına en fazla bir güncel profil. Ticari bağ açık seçimdir; hiçbir liste sırası veya ilk görsel fallback’i kullanılmaz. |
| SourceRevision | productId, sourceRevision, sourceAssetId, sourceSha256, mime, byteLength, width, height, createdAt | Adminin yüklediği kaynağın değişmez sürümü; width/height dosyadan okunur. Kaynak dosya başka görselle değiştirilmez. |
| SurfaceRevision | productId, surfaceVersion, sourceRevision, sourceSha256, maskAssetId, maskSha256, width, height, status, approvedAt | Onay kaynağın kesin sürümüne bağlıdır. Bir maske başka fotoğrafa çoğaltılmaz; taslak ve onay ayrıdır. |
| CommercialBinding | profile içindeki fulfillmentVariantId | Aynı productId altındaki mevcut, benzersiz SKU’lu varyantı işaret eder. SKU adı, fiyat ve stok katalogdan sunucuda çözülür; tekrar kopyalanıp ayrı stok havuzu yaratılmaz. |
| Tasarım revizyonu | productId, sourceRevision, surfaceVersion, sourceSha256, placement, configurationId/revision, commercialVariantId, profileRevision | Yeni kayıtlar görsel ve ticari bağı ayrı taşır. Eski VariantId alanı okuma uyumluluğu içindir; yüzey kimliği olarak yeniden yorumlanmaz. |
| Sipariş snapshot’ı | productId, commercialVariantId, sku, unitPrice/currency, quantity, profileRevision, sourceRevision, surfaceVersion, configurationId/revision, placement, sourceSha256, files | Sunucunun doğruladığı ticari ve görsel bağ birlikte sabitlenir; katalogdaki sonraki değişiklik siparişi değiştirmez. |

`sourceAssetId` ve `maskAssetId` sunucunun medya deposunda çözdüğü kimliklerdir; istemciden gelen keyfi dosya yolu/URL okunmaz. Kimlik biçimi, SQL tablo/sütun seçimi ve OpenAPI değişiklikleri task 02/06’da mevcut depolama mimarisine göre uygulanır; bu belge yeni bir depo/servis açmaz.

Profil değişiklikleri profileRevision üzerinden iyimser eşzamanlılıkla yapılır. Aynı ürün için iki güncel profil veya eski revizyonla üzerine yazma reddedilir. Geçmiş kaynak/yüzey sürümleri sipariş referansları nedeniyle korunur; temizleme saklama politikası task 02’de belirlenir.

## SKU, fiyat ve stok kuralları

1. Admin ürünün fiziksel tedarik varyantını açıkça seçer. fulfillmentVariantId aynı üründe bulunmalı ve geçerli SKU taşımalıdır. Başka ürünün varyantı veya sadece serbest yazılmış SKU kabul edilmez.
2. Fiyat mevcut `Prices[fulfillmentVariantId]` kaynağından, para birimi mevcut katalog kuralından çözülür. Fiyat tanımlı değilse satın alma kapalıdır; sıfır/örnek fiyat veya en ucuz/ilk varyant fallback’i yoktur. Kişiselleştirme ek ücret kuralı bu taskta üretilmez; mevcut fiyatlandırma politikası ayrı doğrulanır.
3. Stok seçilen varyantın mevcut stok kaynağıdır. Aynı varyantın normal ve kişiselleştirilmiş satışı ayrı stok havuzları gibi toplanmaz. Sepette aynı ticari varyanta bağlı tüm satırların toplam adedi limit kontrolüne girer.
4. Mevcut demo checkout gerçek stok ayırmıyor. Bu model gerçek rezervasyon/ödeme eklendiğini iddia etmez; ileride gerçek stok rezervasyonu aynı ticari varyant üzerinde yapılmalıdır.
5. Eşleme değiştirilince profileRevision artar. Açık sepet/kayıtlı tasarım eski bağla yeni sipariş oluşturamaz; `commercial_binding_changed` ile güncelleme/yeniden inceleme istenir. Yeni SKU’ya sessiz geçiş yapılmaz. Önceden oluşan sipariş eski SKU/fiyat/snapshot ile korunur.
6. Ticari varyant silinecekse aktif profil bağı çözülmeden silme engellenir. Stok/fiyat eksikliği tasarımın salt okunur görüntülenmesini engellemez; satın alma uygunluğunu engeller.
7. Tedarik varyantının gerçek fiziksel rengi veya korunacak parçaları kaynak fotoğrafla çelişmemelidir. Müşteriye seçim sunulmaması, yanlış fiziksel ürünü teslim etme hakkı vermez; doğrulama ürün bazlı eşleme kabulünün parçasıdır.

## Ölçü ve kaynak kuralları

Sabit 1333×2000 veya belirli bir en-boy oranı yoktur. Kaynak fotoğraf otomatik kırpılıp standart tuvale çevrilmez; indirme yüklenen kaynak dosyanın hashini ve gerçek boyutunu korur. Maske aynı kaynak dosyasının width/height ve koordinatlarında hazırlanır. Logo, kulp, parça ve alfa kuralları korunur.

Mevcut kodda hâlâ `PlacementRules` eksen başına 6000 kontrolü, `AlignedImageInspector` 20 MP kontrolü ve `EditorCanvas` ölçek dönüşümü bulunuyor. Bunlar yeni isteğin uygulandığı anlamına gelmez. Task 04–06 ve 12’de sabit tuval varsayımları ile dosya/bellek korumaları ayrılarak gözden geçirilmeli. Ekran için küçültme gerekiyorsa kaynak değiştirilmeden açık koordinat dönüşümü kullanılmalı; büyük kaynak maskesine yanlış ölçek uygulanmamalı. Kaynak indirmenin veya AI aracının her çözünürlükte sınırsız işlem yapacağı taahhüt edilmez.

## Durumlar ve işlem uygunluğu

| Durum | Sonuç |
|---|---|
| Ürün aktif değil veya Personalizable değil | Yeni kişiselleştirme kapalı; geçmiş sipariş salt okunur kalır. |
| Profil/kaynak eksik | `source_missing`; kaynak yükleme yönlendirmesi. İlk renk görseli seçilmez. |
| Kaynak var, onaylı maske yok | `mask_missing` / `mask_draft`; yeni yerleşim ve satın alma kapalı, admin maske hazırlayabilir. |
| Kaynak değişmiş veya hash uyuşmuyor | `surface_changed`; önceki maske onaylı sayılamaz, yeniden maskeleme gerekir. |
| Ticari bağ eksik/geçersiz | `commercial_binding_missing` / `commercial_binding_invalid`; satın alma kapalı, maske hazırlama mümkün. |
| Fiyat yok / stok yok | `price_unavailable` / `out_of_stock`; doğru ayrı mesaj, satın alma kapalı. |
| Kaynak+maske geçerli | Önizleme/editör uygun; satın alma ayrıca ticari uygunluk ve mevcut kimlik/checkout kurallarına bağlı. |
| Tüm koşullar uygun | Satın alma için teknik uygunluk; gerçek ödeme/sevk kabulü anlamına gelmez. |

Kodlar hedef hata sınıflarıdır; mevcut istemci hata sözleşmesiyle uyumu task 06/09’da sağlanacak. Bir servis hatası eksik veri veya stok sıfır şeklinde gösterilmez.

## Revizyon ve geçmiş kayıt korunumu

Kaynak değişince yeni sourceRevision açılır; onaylı maske bu kaynağa yeniden hazırlanır. Aynı dosya adı aynı kaynak olduğu anlamına gelmez. Tasarım sahipliği, ürün/yüzey/revizyon doğrulaması sunucuda yapılır. Sepet birleştirme anahtarı ürün + commercialVariantId + configurationId/revision + surfaceVersion + profileRevision bağını korur; farklı desen/yerleşimler tek satır yapılmaz.

Eski siparişin desen, kaynak ürün fotoğrafı ve giydirilmiş önizleme kopyaları güncel kataloğa yeniden bağlanmaz. Eksik geçmiş dosya yeni görselle doldurulmaz. Eski tasarım okunabilir; yeni düzenleme/sipariş gerektiğinde kontrollü yeni revizyon açılır. Renk satırını UI’dan gizlemek geçmiş Color bilgisini veritabanından silmek değildir.

## Sentetik örnekler ve karar doğrulaması

Bu örnek kimlikler gerçek katalog kaydı değildir.

| Senaryo | Beklenen sonuç |
|---|---|
| p-demo kaynak 900×1400, bağlı varyant v-b; katalog sırası v-a/v-b iken v-b/v-a olur | Aynı kaynak, aynı v-b, aynı SKU/fiyat kaynağı; davranış değişmez. |
| Kaynak 2048×1152, maske 2048×1152 | Sabit oran gerekmez; diğer kontroller uygunsa geçerli. |
| Kaynak 2048×1152, maske 1333×2000 | Boyut uyuşmazlığı; onaylanmaz. |
| Ticari bağ yok, ilk varyant fotoğraflı ve stoklu | Otomatik eşleme yapılmaz; satın alma kapalı. |
| v-b fiyatı eksik, v-a fiyatı var | v-a fiyatı alınmaz; eksik fiyat gösterilir. |
| Normal v-b satırı 2, kişiselleştirilmiş v-b satırı 2, katalog limiti 3 | Toplam 4 olduğundan checkout reddedilir; iki ayrı stok havuzu sayılmaz. |
| Aynı SKU, iki farklı tasarım revizyonu | Ayrı sepet satırları; stok kontrolünde aynı ticari varyantın toplam adedi. |
| Kaynak veya ticari bağ sepet açıkken değişir | Eski istek reddedilir, kontrollü yenileme istenir; sessiz geçiş yok. |
| Ürün p-demo profiline başka ürünün v-other varyantı bağlanır | Reddedilir; fiziksel ürün sınırı korunur. |
| Siparişten sonra kaynak/fiyat/SKU değişir | Eski üç dosya, yerleşim ve sipariş fiyatı değişmez. |

Bu tablo sözleşmenin masa başı doğrulamasıdır; çalışan kod testi veya ürün kabulü değildir.

## İşletmeden doğrulanacak ürün bazlı bilgiler

- Her kişiselleştirilebilir ürünün tek fiziksel tedarik SKU’su/variantId’si; normal renkli stokla aynı mı yoksa ayrı mevcut SKU mu kullanılacak?
- Seçilen SKU’nun yüklenen kaynakla ve desende kaplanmayan parçalarla fiziksel uyumu.
- Geçerli katalog fiyatının kişiselleştirilmiş satış fiyatını kapsayıp kapsamadığı; ek ücret varsa mevcut fiyatlandırma taskına girdi.
- Kaynak görselin ve taslakların geçiş envanterinde seçimi (task 02/03).

Bunlar henüz alınmış sayılmaz; gerçek SKU ataması, katalog/stok/fiyat değişikliği ve sıfır/örnek veri yazımı yapılmadı. Teknik tasarım tamam; ürün bazlı eşleme kabulü bekliyor. Önceden açık 23 ürün içeriği ve SKU 117 fiyatı bu kararla kapanmaz.

## Sonraki tasklara teslim

02: Salt okunur envanter, eşleme şablonu, çakışma/dry-run/rollback. 03: Tek kaynak ve ticari bağ admin yönetimi. 04: Fotoğraf promptunu kaldırıp doğrudan kaynak yükleme. 05/06: Tek maskenin onayı, gerçek boyutlar ve yeni sözleşmeler. 07/08: Renk seçimsiz web/Flutter. 09: Ticari bağ ve revizyonlu checkout. 10: Üç değişmez dosya. 11/12: Doküman ve regresyon.

## 06.11.2026 — KIS-TEK-02 alan anlamı düzeltmesi

Kaynak kodun ayrıntılı incelemesi: mevcut MyDesignConfiguration.SourceSha256, SaveConfiguration içinde **müşterinin desen dosyasından** hesaplanıyor; ürün fotoğrafı hash’i değil. Yukarıdaki hedef modelde ürün kaynağı sourceSha256 ile desen patternSha256 ayrı tutulacak. Eski SourceSha256 alanı ve sipariş değeri ürün fotoğrafı hash’i olarak dönüştürülmeyecek. ProductSource dosyasının hash’i mevcut sipariş manifestinde ayrıca bulunur. [Geçiş planı](../reports/personalization-migration-plan-2026-11-06.md).

## 06.11.2026 — KIS-TEK-03 uygulama kaydı

[Admin kaynak yönetimi](../runbooks/personalization-source-management.md) yeni personalization-profiles belgesinde schemaVersion=1/profiles[productId]/profileRevision/sources[] ile kaynak hazırlığını uyguladı. Bu, yukarıdaki hedef modelin kaynak alt kümesidir; ticari bağ, maske ve müşteri sözleşmesi henüz tamamlanmadı. Renklerden bağımsız kaydetme, gerçek ölçü/hash, immutable kaynak kopyası, revizyon çakışması ve eski siparişleri koruma mevcut. Gerçek veri taşınmadı.
