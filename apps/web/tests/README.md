# Web uçtan uca testleri

Web bağımlılıkları kurulmuş olmalı. Test sunucusu için API Release çıktısını proje kökünde hazırlayın:

```sh
dotnet build services/api -c Release -p:OpenApiGenerateDocumentsOnBuild=false
```

Web dizininde:

```sh
npm run test:e2e
npm run test:e2e -- accessibility.spec.ts
```

Başlatıcı önce statik webi aynı kökenli katalog, tasarım ve doğrulama API adresleriyle derler; ardından Playwright çalıştırır. Mevcut `out` çıktısı yenilenir. Chrome varsayılan olarak macOS/Windows sistem yolundan açılır; farklı kurulum için `PLAYWRIGHT_CHROME_PATH` verilebilir.

`playwright.config.ts` ayrı 5023 API / 3010 web portlarını kullanır. Portlar `PRODUCT_SURFACES_TEST_API_PORT` ve `PRODUCT_SURFACES_TEST_WEB_PORT` ile değiştirilebilir. `serve-export.mjs` bütün yazma isteklerini reddeder; yalnız katalog ve development yüzey bilgisi için dar GET proxy’si vardır.

`fixtures.ts` hesap, doğrulama, sipariş, iade, teklif ve Nobi isteklerini tarayıcıda sahte cevaplarla karşılar. SQL, gerçek kullanıcı hesabı veya gerçek e-posta/AI gönderimi gerekmez. Bu testler gerçek sağlayıcı entegrasyonunu kanıtlamaz. Diğer yüzey testleri development API’sindeki kabul edilmiş referans maskeyi ve piksel korumalarını ayrıca doğrular.

Ekran görüntüleri `testInfo.outputPath` altında test çıktısına yazılır; ortama bağlı `TEMP` klasörü gerekmez. Test sonuçları ve build çıktıları Git’e eklenmez.


## WEB-01 - Çalışan yerel katalogda salt okunur kabul

Mevcut web (3000) ve API (5003) çalışırken proje kökünden:

```sh
node apps/web/tests/catalog-navigation.mjs
```

Araç gerçek public katalogda en az beş aktif ürün bekler; 390/768/1440 px'de kategori, URL/geçmiş, arama, sıralama ve 2-4 ürün karşılaştırmasını denetler. Silinen/pasif ürün, gecikme, 503, boş katalog ve kategori adı çakışması yalnız tarayıcı GET fixture'larıyla simüle edilir. Test SQL/katalog/hesap yazmaz; tarayıcıdaki mutasyon isteklerini engeller. Çerez prototipi her tam sayfa yüklemesinde kullanıcı gibi kapatılır.

`WEB01_BASE_URL`, `WEB01_CATALOG_URL`, `WEB01_OUTPUT_DIR` ve `PLAYWRIGHT_CHROME_PATH` ile adres/çıktı/Chrome yolu değiştirilebilir. Varsayılan çıktı `/tmp/xinobi-web01` altındaki JSON ve PNG'lerdir; Git'e eklemeyin. Bu test CI'a otomatik eklenmiş değildir ve ödeme, fiziksel cihaz veya canlı yayın kabulü yerine geçmez.


## WEB-02 - Ürün/renk kabulü

Mevcut yerel web/API çalışırken kökten `node apps/web/tests/product-detail-acceptance.mjs` her aktif ürün ve rengini 390/768/1440 px'de denetler. Gerçek fiyat/stok, SKU/renk, galeri decode ve izole browser sepeti kullanılır. Eksik metinler otomatik doldurulmaz. Hata/bozuk görsel/geçersiz fiyat testleri yalnız GET fixture'larıdır; hesap/sipariş/provider mutasyonu engellenir.

`WEB02_BASE_URL`, `WEB02_CATALOG_URL`, `WEB02_OUTPUT_DIR`, `PLAYWRIGHT_CHROME_PATH` ile adres/çıktı değişir. Varsayılan kanıt `/tmp/xinobi-web02`; commit edilmez. `web02-detail.spec.ts` ve güncellenen `variant-preview-readiness.spec.ts` içindeki açık renk seçimi testi sentetik kabul girdileri kullanır; gerçek maske veya fiziksel baskı onayı oluşturmaz.


## WEB-07 - Erişilebilirlik, klavye ve büyük metin

Mevcut yerel web çalışırken kökten:

```sh
pnpm --filter web exec playwright test --config tests/playwright.web07.config.ts
```

19 mevcut rota ve iki klavye testi; güncel 13 kritik rota için 320/390/768/1440 px axe/200% hesaplanan metin matrisi ve iki odak/hata testi: toplam 27 test. `WEB07_BASE_URL`, `WEB07_OUTPUT_DIR`, `PLAYWRIGHT_CHROME_PATH` desteklenir. Config sunucu başlatmaz; hesap/iş istekleri browser fixture'dır. Tek bir çıktı dizininde eşzamanlı koşu başlatmayın. PNG/trace'ler varsayılan OS temp `xinobi-web07-final` dizinine gider ve commit edilmez.

Hesaplanan fontların 2x yapılması, gerçek browser zoom, cihaz veya ekran okuyucu kabulü değildir. Manuel bekleyenler `design/a11y-audit.md` içindedir. Axe critical/serious kapısı tüm WCAG ölçütleri için uygunluk beyanı sayılmaz.
