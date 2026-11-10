# Tek kaynak kişiselleştirme — regresyon ve kabul rehberi

10.11.2026 · KIS-TEK-12. [Güncel kullanım](single-source-personalization.md). Sonuç ve açık kapılar: [TST-269](../../test/2026-11-10/TST-269-single-source-acceptance.md).

## İzolasyon ve çalıştırma

Repo kökünde mevcut bağımlılıklar ile çalıştırılır. API testleri `IsolatedApiFactory` geçici dosya deposu/sentetik hesap/katalog kullanır; SQL, gerçek hesap/sipariş, kargo ve AI sağlayıcısına erişmez. Admin runner kendi proxiesiz Vite sunucusunu açar; tarayıcı guard'ı mock dışı API ve harici host isteklerini engeller. Web testleri mevcut production export'u 3017'de sunar; tüm API'ler fixture ile yakalanır. Port doluysa mevcut süreci sonlandırma veya sunucuyu yeniden kullanma; çakışmayı çözmeden testin geçtiğini söyleme.

Önce statik kontroller ve production export:

```sh
pnpm --filter admin lint
pnpm --filter admin build
pnpm --filter web lint
pnpm --filter web exec tsc --noEmit
NEXT_PUBLIC_COMMERCE_API_URL=/api/v1/local-commerce NEXT_PUBLIC_DESIGN_API_URL=/api/v1/design-studio pnpm --filter web build
pnpm --filter @xinobi/api-client build
pnpm --filter @xinobi/api-client exec openapi-typescript ../../contracts/openapi/v1.json --output /tmp/task12-openapi-schema.d.ts
cmp packages/clients/typescript/src/schema.d.ts /tmp/task12-openapi-schema.d.ts
node tools/check-design-tokens.mjs
```

Ardından API ve tarayıcılar; iki web paketi aynı 3017 portunu kullandığı için sırayla çalıştır:

```sh
dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false --verbosity quiet --logger 'trx;LogFileName=task12.trx' --results-directory /tmp/xinobi-task12-api
dotnet build services/api/Xinobi.Api.csproj -c Release --no-restore -m:1 -p:UseSharedCompilation=false --verbosity quiet
pnpm --filter admin test:isolated
pnpm --filter web exec playwright test --config tests/single-source.config.ts
pnpm --filter web exec playwright test --config tests/order-snapshot.config.ts
node --test tools/export-single-source-previews.test.mjs tools/publish-product-previews.test.mjs
```

Mobil/sözleşme testleri kendi dizinlerinde:

```sh
cd apps/mobile
flutter analyze
flutter test
flutter devices --machine
cd ../../packages/clients/dart
dart test
```

Bu komutlar deploy, APK veya gerçek AI/kargo üretimi yapmaz. SQL testlerini zorlamak için gerçek bağlantı/credential ekleme; ilgili testlerin açık opt-in ve boş/geçici veritabanı koşulu ayrıca sağlanmalıdır. Atlanan testi başarılı sayma.

## Aynı kayıtla API kabul zinciri

`SingleSourceAcceptanceTests.UploadedSourceToRevisionedDemoOrderAndThreeImmutableDownloads` 73×41, 41×73, 79×79 ve 5001×4000 kaynakla aynı HTTP zincirini çalıştırır:

1. Personel multipart kaynak fotoğrafı yükler, candidate hash/gerçek ölçü seçimiyle kaydeder ve indirilen orijinal baytlar eşleşir.
2. Yanlış boyutlu WebP reddedilir; doğru WebP yüklenir, taslak indirilir, gerçek ölçüsü doğrulanır ve açık onay verilir.
3. Ürünün ticari SKU'su açıkça eşlenir; anonim satın alma yanıtı gerçek kaynak boyutu/hash ve aynı SKU bağını verir.
4. Müşteri desen yükler, yerleşim kaydeder ve yeni revizyon oluşturur. Önceki revizyon değişmez. Geçerli JPEG önizleme revizyona yüklenir.
5. Sentetik adresle demo sipariş oluşturulur; aynı SKU'nun normal renkli satırı ile kişiselleştirilmiş satırı ayrı kalır. Aynı istek anahtarı aynı siparişi döndürür; değişen payload 409 olur.
6. Kaynak değiştirilir: yeni kaynak onaysızken yüzey yok (404 `surface_not_available`), yeni maske onaylanınca eski yerleşim bağı geçersiz (409). İki durumda da ikinci sipariş oluşmaz.
7. Personel aynı sipariş/satırın desen, kaynak ürün fotoğrafı ve giydirilmiş önizlemesini ayrı indirir; dosyalar sipariş anındaki baytlarla aynıdır. Müşteri admin dosyalarına 403, anonim 401 alır. Normal katalog/fiyat/stok başlangıçla aynıdır.

Bu API testi UI renderer'ının fiziksel görsel kalitesini doğrulamaz: yüklenen birleşik JPEG sentetik test çıktısıdır. Web/admin tarayıcı ve Flutter testleri ayrıca kendi izole fixture'larında sözleşme/davranış doğrular; tek fiziksel Android/iOS oturumunun uçtan uca kabulü olarak sunulmaz. Eksik/bozuk sipariş dosyası, eski kayıt, yanlış ürün ve kaynak/maske kapasite senaryoları tam paketteki ilgili regresyonlarla kapsanır.

## Gerçek ortam kapanış kapıları

| Açık kabul | Gereken koşul ve kapanış kanıtı |
|---|---|
| İşletmenin gerçek kaynak/SKU seçimi | Her ürün için kaynak fotoğrafı ve fiziksel SKU onayı; gerçek mevcut fiyat/stok doğrulaması. Test fixture'ı işletme kararı değildir. |
| Android | Onaylı izole veriyle eş API/web sürümünde fiziksel cihaz: görsel/AI, galeri, geri/ileri, ağ hatası, yeniden düzenleme, sepet/demo sipariş; TalkBack ve %200 metin kaydı. |
| iOS | Aynı zincir fiziksel iPhone'da; Photos/izin iptali, WebView oturumu, geri hareketi, VoiceOver ve büyük metin; Android sonucu iOS kabulü değildir. |
| SQL çoklu süreç / restore | Yeni boş test veritabanında opt-in testler; eşzamanlı profil/revizyon ve checkout; dosya+DB yedeği/restore, hash ve eski sipariş bütünlüğü. Gerçek kataloğu seed etme. |
| IIS / yayın | Ayrı yayın taskında eş sürümlü API/web/admin, kalıcı medya/feature store, yetkiler ve geri dönüş doğrulanır. Bu task deploy yapmaz. |
| Maske/ürün görseli | İş sahibi logo/parça/sınır ve fiziksel kaynak doğruluğunu kabul eder; otomatik alfa/hash testi görsel kalite veya DPI sertifikası değildir. |

23 ürün içeriği ve SKU 117 fiyatı açık kalır. Gerçek ödeme, kargo sağlayıcı hareketi ve fiziksel üretim kabulü ayrı kapsamdır; bu testlerden geçti sayılmaz.
