# Tek kaynak yüzey API ve yayın sözleşmesi

> **Güncel giriş (10.11.2026):** [Tek kaynak kişiselleştirme](single-source-personalization.md). 03–12 teknik uygulama/izole kabul tamamlandı; gerçek cihaz/SQL/IIS/iş sahibi kabulü açıktır. [Son kabul kaydı](single-source-acceptance.md). Aşağıdaki tarihli testler kendi teslimlerinin kanıtıdır.


09.11.2026 · KIS-TEK-06 · Teknik uygulama tamamlandı. Web ekran geçişi 07, Flutter 08, tasarım/sepet 09, sipariş dosyaları 10 kapsamındadır. Bu teslim gerçek katalog geçişi veya canlıya yayın değildir.

## Güncel akış

Admin katalogdan tek kaynak kaydedilir → kaynakla aynı gerçek tuvalde WebP maske yüklenir → tek taslak incelenip onaylanır. Renk/HEX veya aynı konum/toplu onay isteği yoktur. Normal satış varyantları değişmez.

- Admin liste/detay/yükleme/onay/geri alma/indirme: `/api/v1/local-commerce/surfaces/products` (mevcut catalog.read/write, personel/MFA, origin kuralları).
- Açık salt okunur yayın: `GET /api/v1/product-surfaces/{productId}/rendering-inputs`.
- Dosya: `GET /api/v1/product-surfaces/{productId}/{surfaceId}/{source|mask}?v={sha256}`.
- Onay yayın kapısıdır; ilave üretim veya fiziksel baskı onayı değildir. Taslaklar anonim sunulmaz.
- Şema 1, scope `single-source-preview`, productReference, sourceRevision, surfaceId (`source-{revision}-mask-{maskId}`), inputs.width/height (ham kaynağın gerçek ölçüsü), sourceMediaVersion (kaynak SHA), surfaceVersion (maske SHA), source/mask URL+SHA bulunur. brandingRequired=false, branding=null. Variant/SKU bu görsel sözleşmenin parçası değildir; ticari eşleme task 09'da ayrı doğrulanır.
- Kaynak ve maske baytları yeniden ölçeklenmez/kırpılmaz. Dosya hashleri, türü ve tuvali doğrulanır. Gösterim ölçeği bu metadata'yı değiştiremez.
- Ürün aktif ve personalizable olmalıdır. Güncel kaynağa bağlı onay yoksa 404; bozuk maske 503; değiştirilmiş kaynak 409 döner. İstemci bu hataları başka renk/kaynak seçerek gizlememelidir.
- İlgisiz ürün, yanlış sürüm/hash/rol, kaldırılan onay veya yeni kaynak sonrasında eski yayın URL'si sunulmaz. Her yanıtta no-store vardır. Yeni taslak, mevcut aynı-kaynak onayını açık onay verilene kadar değiştirmez.
- Geçmiş maskeler personel alias'ından okunur; sipariş/tasarım geçmişi ve dosyaları yeniden yazılmaz.

## Kapasite, çözünürlük ve dosyalar

Kaynak için sabit piksel/en-boy oranı zorunluluğu yoktur. 20 MP sabit kontrolü tek kaynak yüklemesinden kaldırılmıştır. `ProductSurfaces:MaskProcessingMemoryMiB` (varsayılan 512; güvenli yapılandırma aralığı 16–1024 MiB), geçici piksel tamponları için 16 bayt/piksel bütçesini belirler. Maske işleme süreç içinde bir semaphore ile seri yürür. Bu değer sunucu başınadır; çoklu süreçte toplam RAM kapasitesi ayrıca planlanmalıdır. Kaynak 25 MB, WebP 8 MB ve dosya bütünlüğü kontrolleri korunur. Bütçe aşımında 413 `mask_processing_capacity`; kaynak korunur, otomatik küçültme olmaz. 5001×4000 (>20 MP) gerçek kaynak/maske izole testte kabul edilmiştir. Diğer tarihsel segmentation araçlarının kendi güvenlik bütçeleri değiştirilmemiştir.

## Geçmiş bağlantı politikası

Eski `/local-commerce/surfaces/{product}/{variant}` liste/detay/taslak GET'leri ve eski `dev/product-surfaces/commerce-mask/.../rendering-inputs` yalnız **kendi tarihsel varyant kaydını** okur; yeni ürün kaynağına yönlendirilmez. Tüm eski maske/approval/approval-colors POST ve approval/draft DELETE yolları personel yetkisinden sonra 410 `variant_surface_retired` döndürür. Payload işlenmez; ortak maske çoğaltma kodu kaldırılmıştır. Eski önizleme dosyaları veya veriler silinmez. Eski medya URL'leri yeni yayın namespace'inin onay geri alma politikasına dönüştürülmüş sayılmaz.

07/08 ile web/Flutter yeni akışları ürün bazlı sözleşmeye geçti; tarihsel okuyucular yalnız eski kayıt uyumluluğu için korunur. 09/10 kayıt/sipariş bağı ve değişmez dosyaları uygular; uyumsuz eski kayıt otomatik taşınmaz.

## Sözleşme ve yayın araçları

OpenAPI'den TS ve Dart istemcileri yeniden üretilmiştir. Dart generator `source` alanını `source_` adıyla sunar; JSON alanı `source` kalır. `SingleSourcePublication`, `SingleSourceRenderingInputs`, `SurfaceMedia` ve ProductSurfacesApi yeni istemci sözleşmeleridir.

Tek kaynak onayını salt okunur doğrulayıp sürüm denetim manifesti çıkarmak için:

```sh
node tools/export-single-source-previews.mjs http://localhost:5003 /tmp/single-source-release.json URUN-ID
```

Yalnız açıkça verilen ürünleri okur; gerçek veri yazmaz. Kaynak/maske hash, tür, gerçek ölçü ve indirme sonrası güncel onayı doğrular. Eksik/iptal/eski onayda durur; varyant veya paket yedeğine geçmez. Çıktı `single-source-release-audit` kapsamındadır; **offline medya paketi veya kendi başına onay/yayın yetkisi değildir**. Sunucudaki güncel API, geri alma ve ürün kapatma için otorite kalır. Çıktıya kimlik bilgisi veya yönetici verisi konmaz.

`publish-product-previews.mjs` yalnız geçmiş kabul edilmiş varyant fixture'larını paketlemeye devam eder; bunlar yeni tek kaynak profillerinden üretilmiş sayılmaz. Bu araç hâlen dev-local.mjs ve package-iis-preview.mjs tarafından tarihsel önizleme uyumluluğu için çağrılır. Yeni tek kaynağın dosyaları bu tarihsel varyant paketine kopyalanmaz. Standart API deploy'u yeni uçları taşır; gerçek profil/kaynak/SKU seçimi, veri geçişi ve sunucudaki dosyaların hazır olması ayrıca gereklidir.

## Kalan kabul

KIS-TEK-07–12 teknik uygulama/izole regresyon tamam; gerçek ortam kabulü açıktır. Gerçek ürün kaynağı ve ticari SKU/fiyat/stok eşleme kabulü; yedek/restore ve gerçek veri geçişi; IIS/SQL çoklu süreç, Android/iOS gerçek cihaz ve fiziksel baskı kabulü bu teknik teslimle kapanmaz. Kargo, ödeme ve stok davranışı bu taskta değiştirilmedi. Deploy/APK yapılmadı.
