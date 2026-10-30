# KIS-01 — Fiziksel PrintArea ve üretim profili

30.10.2026. Teknik uygulama hazır; gerçek ürün ölçüleri ve fiziksel referans kabulü bekliyor (KAR-05). Gerçek ürün profili/onayı oluşturulmadı.

## Yapılanlar

- Admin → Tasarım ve baskı → Fiziksel baskı profilleri: gerçek aktif, kişiselleştirilebilir ürün/renk/SKU ve yüz (`front`, `back`, `wrap`) seçimi.
- Fiziksel genişlik/yükseklik, DPI, taşma ve güvenli pay, baskı dışı dikdörtgenler, teknik, renk uzayı/profili, çıktı formatı/şeffaflık; kaynak önizleme boyutları, yüzey SHA256, kalibrasyon referansı ve eşleme türü.
- Eksik ölçülü taslak kaydedilebilir; hiçbir mm/DPI değeri uydurulmaz. Onay bütün alanları, güncel kabul edilmiş yüzeyle birebir eşleşmeyi ve insan kalibrasyon kaydını/gerekçesini gerektirir.
- Değişmez artan sürümler, beklenen sürümle çakışma kontrolü; eski sürüm görüntüleme. Taslak değişikliği önceki onaylı referansı devre dışı bırakmaz. Kaldırma yeni kayıtlarda kullanımı kapatır.
- Kalibre edilmiş düzlemsel referansta piksel → mm merkez/boyut, döndürülmüş sınırlayıcı kutuyla güvenli alan ve muhafazakâr baskı dışı bölge kontrolü; orijinal tasarım piksel boyutundan etkin DPI; taşmalı minimum çıktı piksel boyutu.
- Gerçek mm boyutlu kalibrasyon SVG indirmesi: alan sınırı, güvenli pay, taşma ve baskı dışı bölgeler. Dosya bir tasarım üretim çıktısı değildir.
- Yeni yerleşim kayıtlarına onaylı profilin tam kopyası, sürümü ve SHA256 eklenir. Sipariş aynı yerleşim kopyasını devralır; sonraki onay/kaldırma veya tasarım silinmesi eski sipariş referansını değiştirmez. Eski kayıt ve istemciler için `printSetup` ek ve isteğe bağlıdır.
- Mevcut FeatureDocuments dosya/SQL altyapısı kullanılır; yeni tablo/migration gerekmez. Development dosyası `print/print-profiles.json`; mevcut SQL aktarım listesine eklenmiştir. Gerçek SQL yazma/kabul testi yapılmadı.
- `catalog.read`: panelin mevcut katalog seçicisini yüklemek için gerekir. `print.read`: liste/geçmiş/ölçüm/kalibrasyon. `print.write`: taslak. `print.operate`: onay/kaldırma. Personel ve MFA kapıları korunur.

## Kullanım ve kalan fiziksel kabul

1. Üretimden SKU/yüz bazlı ölçü, DPI, taşma/güvenli pay, yasak bölgeler, teknik, renk/ICC referansı, format ve şeffaflık bilgisi alın.
2. Yeni profil açın; güncel yüzey bilgisini alın. Kalibrasyon alanını kaynak fotoğraf koordinatlarında açıkça tanımlayın. Fotoğraf çözünürlüğü fiziksel ölçü veya tasarım DPI bilgisi değildir.
3. Eğrilik/çok gövde için `manual-template` ve onaylı üretim şablonu kullanın. Bu tür profiller otomatik düzlemsel ölçümü reddeder. Anizotropik kalibrasyonda döndürülmüş tasarım manuel kontrole gider.
4. Tam taslağı kaydedin. SVG’yi gerçek boyutta, yazdırma ölçeklemesi kapalı olarak çıkarın; üretim sahibi alan/konum ölçülerini doğrulasın. Kayıt referansı ve gerekçeyle kaydedilmiş taslağı onaylayın.
5. Yeni yerleşim kaydı profil kopyasını alır. Yeni profil onayı var olan yerleşimi/siparişi değiştirmez; gerekli ise yeni yerleşim revizyonu kaydedilir.

Gerçek ölçü/konum tutarlılığı bir fiziksel numune ile henüz kanıtlanmadı. Mevcut kavisli web/mobil önizleme üretim dosyasına dönüştürülmüş sayılmaz. Ölçüm aracı açıkça girilmiş artwork sınırlarıyla çalışır; müşteri editöründen otomatik yüksek çözünürlüklü üretim render’ı KIS-05/06/07 kapsamındadır. `productionReady` daima `false`; `reference-ready` yalnız kalibrasyon referansının eşleştiğini belirtir. Profil onayı, tasarım/üretim onayı değildir. Eski kayıtlara geriye dönük profil ataması yapılmaz.

## Doğrulama

[Test raporu TST-157–166](../../test/2026-10-30/TST-157-kis01-print-profiles.md). Sentetik kalibrasyonlar gerçek ürün ölçüsü veya üretim kabulü olarak kullanılamaz.
