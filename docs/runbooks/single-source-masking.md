# Tek kaynak fotoğrafla maskeleme

> **Güncel giriş (10.11.2026):** [Tek kaynak kişiselleştirme](single-source-personalization.md). 03–12 teknik uygulama/izole kabul tamamlandı; gerçek cihaz/SQL/IIS/iş sahibi kabulü açıktır. [Son kabul kaydı](single-source-acceptance.md). Aşağıdaki tarihli testler kendi teslimlerinin kanıtıdır.


06.11.2026 · KIS-TEK-05. Admin → **Ürünler → Ürün yüzeyleri**.

## Güncel akış

1. Katalog → XINOBI U · Tek kaynak fotoğraf alanında ürünün fotoğrafını kaydet. Renk seçimi veya aynı konumda ikinci fotoğraf gerekmez. Kaynak yoksa maskeleme ekranı katalog bağlantısı gösterir; ilk renk görseline geri düşmez.
2. Ürün yüzeyleri ekranında ürünü seç. Ürün başına bir kayıt vardır. Kaynak sürümü, gerçek piksel ölçüsü ve durum görünür.
3. **Maskeleme için kaynak fotoğrafı indir** ile tam kaynak dosyasını al. İndirme SHA-256 kontrolü yapar; dosya kırpılmaz/küçültülmez. **Maskeleme promptu** bu kaynağın boyut/hash/sürüm bilgisini içerir. Logo, kulp, parça, alfa ve kendi kaynak tuvaline hizalama kuralları öncekiyle aynıdır. Fotoğraf üretimi istenmez.
4. Kaynakla aynı boyutta, tek kareli WebP maskeyi yükle. Şeffaf veya siyah-beyaz modunu seç; yalnız bu kaynak için taslak oluşur. En fazla 8 MB WebP; yanlış format/boyut/boş/dolu maske reddedilir. Otomatik esnetme yok.
5. Pembe kaplama veya örnek desenle kontrol et. Önizleme indirilemez/doğrulanamazsa onay kapalı kalır. Taslak WebP indirmesi gerçek kayıpsız WebP verir; hata yanıtı boş dosya başarısı sayılmaz.
6. **Taslağı onayla** onayı yalnız bu ürünün kaynak sürümüne işler. Renkler arası önizleme, seçili renk listesi, aynı konum kutusu ve toplu onay yok. Aktif taslak veya onay kaldırılabilir; geçmiş medya dosyaları silinmez.

Maske onayı güncel ürün kaynağının yayın kapısıdır. Mağaza, Flutter, kayıt/sepet ve sipariş dosyaları 06–10 ile tek kaynak sözleşmesini kullanır. Eski varyant kayıtları ve sipariş dosyaları yeniden yazılmaz. Onay fiziksel baskı/üretim kabulü değildir.

## Kaynak/sürüm güvenliği

Yeni taslaklar sourceRevision + sourceSha256 + expectedRevision ile bağlanır. Onay ayrıca exact draftId ister. Kaynak veya taslak başka işlemde değişirse 409; otomatik yeniden gönderme/başka kaynağa uygulama yok. Başarısız yüklemede seçili dosya korunur. İşlem sürerken ikinci yazma ve gezinme engellenir; kaydedilmemiş dosya/prompt değişiminde vazgeçme onayı vardır.

Kaynak değişince eski maske geçmişte kalır; yeni kaynakta gösterilmez/onaylanamaz. Eski canvas pikselleri kaynak değişiminde temizlenir, yeni maske yüklenmeden onay açılmaz. Eksik/bozuk maske ayrı hata verir. Yeni bir kaynak seçimi maskeleri veya siparişin üç değişmez dosyasını yeniden üretmez.

## Admin API / kalıcılık

Mevcut yüzey feature flag’i, personel/MFA/catalog.read-write, origin/HTTPS ve no-store kuralları altında:

- GET `/api/v1/local-commerce/surfaces/products`: ürün başına tek kaynak/maske özeti.
- GET `.../products/{productId}`: kaynak sürümü, taslak ve onaylı maske.
- POST `.../{productId}/mask`: image, sourceSha256, sourceRevision, expectedRevision, webpBase64, mode.
- POST `.../{productId}/approval`: sourceSha256, sourceRevision, expectedRevision, draftId.
- DELETE `.../{productId}/draft` veya `/approval`: kaynak/sürüm bilgili JSON gövdesi.
- GET `.../{productId}/masks/{maskId}.png`: bu ürünün geçmiş/güncel maske dosyası; personel catalog.read gerekir.
- GET `.../{productId}/draft.webp?sourceRevision=...&maskId=...`: yalnız güncel kaynağın güncel taslağı; eski kimlik 409.

`personalization-profiles` belgesi geriye uyumlu optional masks[], draftId, approvedId alanlarıyla genişledi. Yeni maskeler özel designs dosya alanında `surface-mask-{id}.png` olarak saklanır; preview/download personel catalog.read gerektirir. Her maske değişmez dosya ve sourceRevision/hash taşır. Eski geliştirme maskelerinin media konumu geriye okuma için korunur; yeni yanıtlar bunlar için de korumalı adres verir, eski dosyalar silinmez. ProfileRevision işlemlerde artar; sourceRevision fotoğrafın gerçek sürümüdür ve ayrı döner. Kaynak değişimi maske geçmişini korur. Fiziksel SQL migration veya gerçek veri taşıma yapılmadı.

Aktif pointer kaldırılması dosyayı fiziksel silmez. SQL+dosya commit atomik değildir; başarısız yarışta referanssız yeni medya kalabilir. Mevcut katalog SKU/stock/price ve eski sipariş JSON’larına yazılmaz. Gerçek SQL çoklu süreç/IIS kabulü ayrı açık.

## Kapasite ve sonraki işler

Sabit kaynak tuvali/en-boy oranı yok. Kaynak yükleme 25 MB, maske yükleme 8 MB sınırını korur. 06 ile tek kaynak decoder'ındaki sabit 20 MP kontrolü RAM bütçesine geçti: `ProductSurfaces:MaskProcessingMemoryMiB` varsayılan 512, aralık 16–1024 MiB; geçici tamponlar 16 bayt/piksel. Bütçe aşımı 413 `mask_processing_capacity`; kaynak korunur, otomatik küçültülmez. [Kapasite sözleşmesi](single-source-publication.md).

Eski varyant okuma rotaları kendi tarihsel kaydını sunar; maske/toplu onay yazma uçları 06 ile 410 olarak emekliye ayrıldı. Eski kayıtlar otomatik taşınmadı. Güncel izole maskeleme testi `apps/admin/tests/single-source-mask.mjs`; `tools/test-guided-surface-admin.mjs` tarihsel UI aracıdır.

[TST-261](../../test/2026-11-06/TST-261-single-source-masking.md) yalnız 05 teslimini, [TST-263](../../test/2026-11-09/TST-263-single-source-publication.md) kapasite/yayın geçişini kanıtlar. Task 12 izole regresyonu tamamlandı; gerçek SQL/IIS/cihaz kabulü açıktır. Deploy/APK veya gerçek AI sağlayıcı çağrısı yapılmadı.
