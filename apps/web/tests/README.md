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
