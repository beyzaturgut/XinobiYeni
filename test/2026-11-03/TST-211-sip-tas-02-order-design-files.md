# SIP-TAS-02: Siparişe bağlı tasarım dosyaları ve revizyon bağı / 03.11.2026

Kapsam: [SIP-TAS-02](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-02---siparişe-bağlı-görsel-ve-revizyon-paketini-tanımla). Değişiklik yalnız API ve sözleşmede. Admin/web ekranı, Flutter uygulaması, hosting, deployment ve APK değişmedi.

## Önkoşul ve mevcut temel

- SIP-TAS-01 (`eb7f3b4`) tamam; admin sipariş detayı bu taskta değişmedi.
- Daha önce siparişe kopyalananlar: ham desen (`order-{id}-{satır}`) ve konfigürasyon revizyonunun önizlemesi (`-preview`).
- Siparişe zaten yazılanlar: ürün/varyant/SKU, tasarım kimliği, konfigürasyon kimliği/revizyonu, yerleşim şeması, yerleşim ve ham desenin SHA-256 değeri.
- Idempotency, sahiplik ve başarısız denemede kopyaları silme davranışı zaten vardı. Bunlar ayrı bir sistem olarak yeniden kurulmadı.
- Eksikler:
  - Ürün kaynak görseli siparişe kopyalanmıyordu.
  - Üç dosyanın referansı ve özeti siparişte tutulmuyordu.
  - Önizleme olmadığında bu durum kayıtta görünmüyordu.
  - Okunan kopyanın bütünlüğü doğrulanmıyordu.

## Yapılan değişiklik

- **Sözleşme:** `OrderPersonalization.Files` (`OrderDesignFiles`) eklendi. Değişiklik ekleme niteliğinde; eski siparişlerde bu alan `null` olur.
  - `Pattern`: ham desen. Her zaman vardır.
  - `ProductSource`: editörün maskelediği ürün fotoğrafı. Yerleşimsiz satırda `null`.
  - `Composition`: sipariş edilen revizyonun giydirilmiş önizlemesi. Önizleme yüklenmemişse `null`.
  - Her dosya `Sha256`, `Mime` ve `Bytes` ile tutulur. Depolama anahtarı istemciye verilmez.
- **Sipariş anı (`PlaceMyOrder`):**
  - `DesignSurfaceValidator.SourceImage` yerleşimi eskisi gibi doğrular. Ardından editörde kullanılan fotoğrafı, yüzeyin kayıtlı kaynak SHA-256 değeriyle karşılaştırarak okur.
  - Fotoğraf `-source` olarak siparişe kopyalanır; güncel katalog URL'sine bağlanmaz.
  - Ham desenin özeti konfigürasyondaki `SourceSha256` ile eşleşmezse sipariş 409 `design_changed` ile reddedilir.
  - Referanslar, satırın bütün kopyaları oluştuktan sonra sipariş kaydına yazılır.
  - Kopyalamada hata olursa veya aynı istek tekrarlanırsa bu denemenin kopyaları silinir. `-source` silmeye eklendi.
- **Okuma:** müşteri ve panel desen uçları ile müşteri önizleme ucu, kayıtlı referans varsa baytları doğrular.
  - Özet farklıysa yanlış dosya verilmez, 503 döner.
  - Referansı olmayan eski siparişler eskisi gibi okunur.
  - Ürün kaynak görseli için uç eklenmedi; indirme SIP-TAS-05 kapsamında. Store metodu da aynı doğrulamayı yapıyor.
- **Değişmeyenler:** üretim sürümü, üretim onayı, baskı kuyruğu, fiziksel profil işi ve yeni bir yetki yüzeyi eklenmedi.

## Kontroller

- **TST-211 / API FIXTURE:** `dotnet test --filter OrderDesignSnapshotTests|SavedDesignTests` — PASS 12/12. Yeni `OrderDesignSnapshotTests` 5 test içeriyor:
  1. **Tasarım, katalog ve maske değişimi:** sipariş sonrası tasarım yeniden adlandırıldı, yeni yerleşim revizyonu ve yeni önizleme yüklendi, katalog fotoğrafı ve maske değiştirildi, tasarım silindi.
     - Siparişteki yerleşim, revizyon ve referanslar değişmedi.
     - Desen, önizleme ve kaynak fotoğraf baytları sipariş anındakiyle aynı kaldı.
     - Müşteri ucu, panel ucu ve store üzerinden okundu.
  2. **Değiştirilmiş kopya:** aynı boyutta farklı bayt yazılınca müşteri ve panel desen ucu ile önizleme ucu 503 döndü; kaynak görsel okuması 503 hatası verdi. Yanlış dosya sunulmadı.
  3. **Tekrar istek ve yarım kayıt:**
     - Son kopyada depolama hatası olunca sipariş oluşmadı ve hiçbir sipariş dosyası kalmadı.
     - Eski revizyon (1), yeni revizyon (2) varken bile kendi yerleşimi ve önizlemesiyle bağlandı.
     - Aynı istek aynı siparişi döndürdü, ek dosya bırakmadı. Farklı revizyonla tekrar 409 `idempotency_conflict` verdi.
     - Yüzey değişince eski yerleşim, kopyalamadan önce `surface_changed` ile reddedildi.
  4. **Yerleşimsiz eski tip satır:** yalnız desen referansı var; kaynak görsel ve önizleme `null`, katalogdan doldurulmadı. Özeti tutmayan desen `design_changed` ile reddedildi ve dosya bırakmadı.
  5. **SQL JSON sütunu:** referanslar, SQL deposunun kullandığı web varsayılanlı JSON ile kayıpsız gidip geldi. Eski JSON'da `Files` `null` kaldı.
- **TST-212 / API REGRESYON:** `dotnet test tests/Xinobi.Architecture.Tests` — PASS 502, atlanan 29, başarısız 0. Bu koşu SQL round-trip testi eklenmeden önce yapıldı; o test yukarıdaki 5 teste dahil. Atlananlar açık SQL bağlantısı veya etkileşimli smoke gerektiren testlerdir.
- **TST-213 / SÖZLEŞME:** `pnpm contracts:generate` (OpenAPI, TypeScript, Dart) ve `node tools/check-generated-contracts.mjs` — PASS (102 işlem, 133 Dart part dosyası). Tüketiciler de kontrol edildi, hepsi PASS:
  - Admin: `pnpm run build` ve `pnpm run lint`.
  - Web: `tsc --noEmit`.
  - Flutter: `flutter analyze`. Yalnız üretilen Dart istemcisi değişti; Flutter uygulama kodu değişmedi.
- **TST-214 / SQL:** AÇIK. `XINOBI_TEST_SQL` tanımlı değil ve izole SQL ortamı yok; gerçek veritabanı kullanılmadı. Sipariş satırı JSON sütununda tutulduğu için şema değişikliği yok. Gerçek SQL'de yeniden başlatma, eşzamanlılık ve kalıcılık kabulü KIS-03 / SIP-TAS-09 altında açık.

## İlk başarısız deneme

- Yeni testte `ClientRequestId` olarak verilen `retry-1`, en az 8 karakter kuralı nedeniyle 400 `invalid_request` aldı. Bu bir test girdisi hatasıydı; `retry-request-1` ile düzeltildi.

## Sınırlar

- Mevcut siparişler geriye dönük doldurulmadı. Bu siparişlerde kaynak görsel ve referans yok; ele alınması SIP-TAS-08 kapsamında.
- Ürün kaynak görseli ve önizleme indirme arayüzleri SIP-TAS-04/05/06, yerleşim gösterimi SIP-TAS-03, kapsamlı dosya erişimi kabulü SIP-TAS-07 kapsamında.
- Ayrı maske dosyası siparişe kopyalanmadı. Maske sürümü yerleşimdeki `surfaceVersion` ile kayıtlı.
- Bu rapor rol/PM onayı ya da gerçek SQL kabulü değildir.
