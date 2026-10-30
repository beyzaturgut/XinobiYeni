# KIS-01 — baskı profilleri doğrulaması

30.10.2026. Yerel Mac; gerçek Chrome + Vite, .NET 10, Dart/Flutter. Ürün ölçüleri yalnız sentetik fixture; gerçek ürün profili/üretim onayı oluşturulmadı, gerçek SQL’e yazılmadı. SQL ve opt-in dış servis testleri atlandı; fiziksel baskı kabulü yapılmadı.

| ID | Komut / kontrol | Sonuç ve seviye |
|---|---|---|
| TST-157 | `dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false --filter 'FullyQualifiedName~PrintProfileTests\|FullyQualifiedName~SavedDesignTests\|FullyQualifiedName~CatalogTests\|FullyQualifiedName~ApiContractTests'` | PASS 48/48; UNIT + ISOLATED FILE / HTTP INTEGRATION |
| TST-158 | Tam .NET test paketi; son tekrar `dotnet test tests/Xinobi.Architecture.Tests --no-build --no-restore` | PASS 496 / FAIL 0 / SKIP 29, toplam 525; ISOLATED / opt-in SQL SKIP |
| TST-159 | `pnpm contracts:generate` ve tüm izlenen sözleşme kaynaklarının SHA256 karşılaştırmasıyla tekrar üretim | PASS; API Release 0 hata/uyarı, OpenAPI/TypeScript/Dart, tekrar üretimde drift yok; BUILD / CONTRACT |
| TST-160 | `node apps/admin/tests/print-profiles.mjs` | PASS 1440/768/390px + print.read salt okunur; REAL CHROME / MOCK API |
| TST-161 | `pnpm --filter admin exec tsc -b`, `pnpm --filter admin lint`, `pnpm --filter admin build` | PASS; lint 0 hata, mevcut ilgisiz dosyalarda 5 uyarı; STATIC / BUILD |
| TST-162 | `pnpm --filter web lint`, `pnpm --filter web build` | PASS, 38 statik sayfa; STATIC / BUILD |
| TST-163 | `dart analyze`, `dart test` (packages/clients/dart) | PASS; 0 analiz sorunu, 9/9 test; GENERATED CLIENT / UNIT |
| TST-164 | `flutter analyze`, `flutter test` (apps/mobile) | PASS; 0 analiz sorunu, 72/72 test; STATIC / FLUTTER FIXTURE |
| TST-165 | Göreve ait servis grubunu yeniden başlat; web/admin GET ve anonim yeni API GET | PASS: localhost:3000 ve :5173 HTTP 200; :5003/api/v1/admin/print-profiles HTTP 401; READ-ONLY LOCAL |
| TST-166 | `git diff --check`, diff incelemesi, upstream karşılaştırması | PASS, whitespace hatası yok, upstream HEAD başlangıçta 0/0; STATIC / GIT |

## Davranış kanıtı

- Eksik ölçülü taslak onaylanmaz; mm/DPI otomatik dolmaz. Gerçek katalog/renk ve güncel yüzey SHA256 eşleşmesi gerekir.
- Kalibre edilmiş 100×80mm sentetik alanda 400×200px yerleşim → 40×20mm; orijinal 600×300 tasarım → 381 DPI. 3mm taşma ile 300 DPI alan çıktısı 1252×1016px. Düşük DPI, güvenli alan dışı ve baskı dışı bölge ayrı sonuçlar verir.
- Yanlış yüzey, manuel şablon, anizotropik döndürme ve aşırı sayısal girdiler reddedilir. Kalibrasyon SVG 106×86mm; HTTP içerik türü ve nosniff kontrol edildi.
- Aynı beklenen sürümle iki dosya yazıcısından yalnız biri kazanır; eski sürüm korunur. Yeni taslak son onayı değiştirmez; onay/kaldırma eski yerleşim/sipariş kopyasını değiştirmez. Tasarım silinse de sipariş profil sürümü/SHA kalır.
- Girişsiz istek 401; print.read taslak/onay/kaldırma yazamaz (403). UI salt okunur, boş değerler, kayıt çakışmasında input korunması ve gerekçesiz onay kapısı testli.
- Chrome tüm API isteklerini sentetik route’a alır; gerçek SQL, hesap veya üretim profiline yazmaz. Üç boyutta yatay sayfa taşması ve JS hatası yok. 390px ekran görüntüsü görsel incelendi; tablo kendi içinde kayar, form tek kolona iner.
- `productionReady=false` korunur. Sentetik kaynak checksum fixture’ı gerçek fotoğraf/maske görsel kabulü değildir.

## Başarısız denemeler, düzeltme ve tekrarlar

1. Yeni hedefli testlerin ilk derlemesinde xUnit analyzer Assert.Single kullanımını ve çoklu `var` bildirimini reddetti; düzeltildi. İlk 7 testin birinde array içeren record eşitliği yanlış test edildi; JSON içerik karşılaştırmasına düzeltildi. Profil + mevcut tasarım 14/14 geçti.
2. İlk tam paket 485 PASS / 11 FAIL / 29 SKIP: mevcut test fixture’ı testin kendi kalıcı dizinini ezdiğinden hesap/ticaret restart ve audit dosyası kontrolleri bozuldu. Gerçek SQL’e bağlanmadan açık paylaşılan fixture dizini eklendi; cleanup çağıran testin sorumluluğuna alındı. Assertions gevşetilmedi.
3. Ara derlemede iki testin alan adı `directory` yerine `dataDirectory` olmalıydı; düzeltildi. Sonraki tam paket 489 PASS / 7 FAIL / 29 SKIP: xUnit opsiyonel public ctor argümanını fixture sanıyordu; public parametresiz/internal seçenekli ctor yapıldı. Boş katalog testi için açık demo-seed seçeneği eklendi.
4. Sonraki paket 495 PASS / 1 FAIL / 29 SKIP: boş seed yolu varsayılan seed seçmek yerine boş dosya yolu okudu. Boş string yerine null kullanıldı. Profil/SavedDesign/Catalog/API hedefli son tekrar 48/48 geçti. Son tam tekrar: 496 PASS / 0 FAIL / 29 SKIP, toplam 525.
5. İlk Chrome denemesi select label’ın option metinlerini de kapsaması nedeniyle bekledi. Beklemeler 10sn ile sınırlandı; combobox accessible-name seçicileri kullanıldı. Son test iki kez üç genişlikte + readonly geçti. API verisi ve uygulama davranışı bu test düzeltmesiyle değiştirilmedi.
6. Son SVG binary indirme metadatasından sonra istemciler tekrar üretildi; admin build ve Dart analiz/9 test tekrar başarılı. Flutter/web kontrolleri ek alan uyumluluğunu doğrular; gerçek cihaz veya fiziksel baskı UAT değildir.

## Kabul sınırı

Gerçek SKU ölçüleri, üretim renk/format/DPI kararı ve üretim sahibi onaylı ölçek/konum numunesi KAR-05 kapsamında açık. KIS-01 teknik altyapı hazır olsa da fiziksel kabul tamamlandı denmez. Yeni üretim DesignVersion/onay/render kuyruğu ve bitmiş baskı dosyası KIS-05/06/07 kapsamındadır. Mevcut kavisli önizleme otomatik üretim çıktısı sayılmaz; açıkça girilmiş kalibre edilmiş düzlemsel artwork sınırları ölçülür. Gerçek SQL kalıcılık kabulü ayrıca yapılmalıdır.

Son durum: tüm çalıştırılan kontroller başarılı; gerçek fiziksel kabul ve opt-in SQL/dış servis testleri açık. Göreve ait yerel servis root PID 9220; web 3000, admin 5173, API 5003.
