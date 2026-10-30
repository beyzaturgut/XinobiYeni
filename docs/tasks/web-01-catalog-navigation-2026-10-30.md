# WEB-01 - Katalog gezinmesini gerçek veriyle kabul et

Tarih: 30.10.2026. Başlangıç: `main / 325ce60`. Durum: **Yerel teknik kabul tamamlandı**.

Kapsam: 30 Ekim tamamlama planındaki WEB-01; kategori URL, arama, sıralama, geri/ileri, karşılaştırma (2-4), boş/yükleniyor/hata ve kaldırılan/pasif ürünler. Önerilen sorumlu: Web + QA; kullanıcı bu adımın uygulanmasını istedi.

## Uygulanan düzeltmeler

- Katalog kategori, arama (`q`) ve sıralama (`sort`) durumları URL'den okunur. Kategori/sıralama geçmiş girdisi oluşturur; yazarken arama aynı girdiyi günceller. Detaydan geri dönüş ve tam yenileme seçimi korur.
- Kategori kimliği gerçek ad olarak korunur. Eski kısa etiketli bağlantılar çakışma yokken çalışır. Örneğin `Çay` ve `Çay makineleri` ayrı kategorilerse birleştirilmez; kaldırılmış kategori bütün ürünleri sessizce göstermez.
- Katalog/arama/karşılaştırmada yüklenme, gerçekten boş sonuç ve bağlantı hatası farklıdır. Hata sırasında eski fiyat/stok tablosu veya sahte “0 ürün” gösterilmez; tekrar yükleme vardır.
- Başarılı katalog yanıtında silinmiş/pasif karşılaştırma seçimleri temizlenir. GET hatası mevcut seçimleri silmez. Dört ürün sınırı korunur; paylaşılan URL'de kaldırılan/temizlenen ürünler yenilemede geri gelmez; yinelenen kimlikler limitten önce tekilleştirilir.
- Arama URL durumu, Next.js'in native history desteğiyle ve statik export için Suspense sınırıyla uygulanmıştır.

## Kabul kanıtı

[TST-136...141](../../test/2026-10-30/TST-136-web01-catalog-navigation.md): gerçek yerel katalogda **24 aktif ürün / 8 kategori**, **390/768/1440 px**. Her kategorinin gerçek sayısı, alfabetik sıralama, tam ad araması, yenileme/detaydan dönüş, geri/ileri, 1 ürünle kapalı/2-4 ürünle açık karşılaştırma, beşinci ürünü engelleme ve paylaşılan liste düzenleme geçti. Her üç boyutta sayfa yatay taşması yok; katalog/karşılaştırma ekran görüntüleri incelendi.

Ayrı tarayıcı GET fixture'larıyla geciken yanıt, 503, retry, boş katalog, silinen/pasif ürün ve kategori adı çakışması geçti. Mevcut 3 ilgili Playwright regresyonu, web TypeScript, tam web ESLint ve statik üretim derlemesi geçti. Sonuçlar mock ile gerçek katalog kabulünü ayrı gösterir.

## Sınır

CAT-01'in tüm veri/medya hazır oluşu bu işle kapatılmadı; yalnız mevcut katalogdaki gezinme kontrolü tamamlandı. Gerçek katalog/hesap verisi değiştirilmedi; iş mutasyonu istekleri tarayıcı testinde engellendi. Yeni API/migration/ödeme/AI çağrısı, APK veya deploy yok. Bu kayıt yerel teknik kabul olup canlı IIS kurulumu, gerçek telefon veya resmi iş sahibi UAT onayı değildir.

Tekrar: `node apps/web/tests/catalog-navigation.mjs` (önce mevcut `pnpm dev:local` servisleri çalışmalı; yeniden başlatmayın). Test en az beş aktif ürün bekler. Detaylar `apps/web/tests/README.md` içindedir.
