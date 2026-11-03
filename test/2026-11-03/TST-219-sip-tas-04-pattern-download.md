# SIP-TAS-04 — Sipariş satırındaki ham desenin ayrı indirilmesi / 03.11.2026

Kapsam: [SIP-TAS-04](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-04---ham-deseni-ayrı-indir). Değişiklik yalnız API, sözleşme ve admin ekranında. Web mağazası, Flutter uygulaması, hosting, deployment ve APK değişmedi.

## Önkoşul ve mevcut temel

- SIP-TAS-02 (`55ed208`), sipariş satırına desen kopyasını ve `Files.Pattern` alanını (SHA-256, tür, bayt) yazar; okuma sırasında özet doğrulanır.
- Mevcut indirme yolu `GET /api/v1/local-commerce/orders/{id}/lines/{n}/design?download=true` idi. Bu uç:
  - yalnız Development panel grubunda vardı ve sözleşmeye girmiyordu;
  - dosyaya `…-source.png` adını veriyordu (ürün kaynak görseliyle karışabilir);
  - MIME'ı baytlardan değil kayıttan alıyordu.

  Uç geriye uyumluluk için korundu; admin indirme düğmesi artık yeni yönetici ucunu kullanıyor.

## Yapılan değişiklik

- **API:** yeni `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` ucu eklendi (`DownloadAdminOrderLinePattern`).
  - **Yetki:** personel oturumu ve `orders.read` izni gerekir.
  - **Dosya çözümü:** dosya yalnız sipariş ve satırdan, SIP-TAS-02 kopyası (`order-{id}-{satır}`) okunarak sunucuda bulunur. İstemciden gelen URL, yol veya dosya kimliği kullanılmaz. SQL deposunda kimliğe göre, Development dosya deposunda sipariş listesinden aranır.
  - **İçerik:** baytlar yeniden render edilmeden aynen döner. Kayıtlı özet farklıysa dosya verilmez (SIP-TAS-02 kuralı).
  - **Tür:** MIME ve uzantı baytlardan belirlenir (PNG, JPEG veya WebP). Kayıttaki türle uyuşmazsa 503 döner; dosya başka bir adla sunulmaz.
  - **Yanıt:** `attachment` olarak, `nosniff` ve `no-store` başlıklarıyla gelir. Dosya adı `xinobi-{sipariş no}-satir-{n}-desen[-rev{revizyon}].{uzantı}` biçimindedir.
  - **Hatalar:** 404 `order_not_found`, `order_line_design_not_found` veya `order_pattern_not_found`; 401, 403 ve bütünlük ya da depo hatasında 503.
  - Development CORS ayarı `Content-Disposition` başlığını açar; panel farklı origin'den dosya adını okuyabilir.
- **Sözleşme:** OpenAPI, TypeScript ve Dart istemcileri yeniden üretildi. Yeni uç dışında değişiklik yok.
- **Admin ekranı:** Ham desen kartındaki eski `?download=true` bağlantısının yerine “Ham deseni indir” düğmesi geldi (`commerceRequest(..., 'file')`).
  - Tıklama kilidi: düğme “Ham desen indiriliyor…” durumundayken devre dışıdır ve ikinci istek gönderilmez.
  - Başarıda “Ham desen indirildi: dosya adı” durumu çıkar.
  - 404'te “indirilecek dosya yok” yazar ve tekrar deneme sunulmaz; 403'te yetki mesajı çıkar; servis hatasında “İndirmeyi tekrar dene” düğmesi çıkar.
  - Önizleme veya güncel tasarımdan yedek dosya üretilmez.
  - Sunucunun verdiği ad okunamazsa aynı kalıpta, dosyanın gerçek türüne göre bir ad kullanılır.
- **Düzen düzeltmesi:** görsel kartı 320 px'te %200 yazıda iç sütun içerik genişliğine büyüyordu (5993 px). Kart ve indirme bloğu `minmax(0,1fr)` ile sınırlandı.
- Ürün fotoğrafı ve giydirilmiş önizleme indirmeleri (SIP-TAS-05/06) ve üretim dosyası bu taskta eklenmedi.

## Kontroller

- **TST-219 / API FIXTURE:** `OrderDesignSnapshotTests` PASS 8/8; bunlardan 3'ü bu task için yeni.
  - İndirilen baytlar sipariş anındaki desenle aynı; SHA-256 `Files.Pattern` ile eşleşiyor. Tasarım silindikten sonra da indirme çalışıyor.
  - Tür `image/png`. Ad `xinobi-{no}-satir-1-desen-rev1.png`; revizyon 2 varken sipariş edilen revizyon 1 adda görünüyor. `attachment`, `nosniff`, `no-store` ve Development CORS başlığı doğrulandı.
  - Tasarımsız satır, olmayan satır ve olmayan sipariş 404 veriyor. Bozulmuş kopya 503, silinmiş kopya 404 `order_pattern_not_found` veriyor.
  - Oturumsuz istek 401, sipariş sahibi müşteri 403, `orders.read` izni olmayan personel 403 alıyor.
  - Eski tip satırda ad revizyonsuz. Kayıtla uyuşmayan tür (JPEG baytı PNG kaydı altında) 503 veriyor.
- **TST-220 / API REGRESYON:** `dotnet test tests/Xinobi.Architecture.Tests` — PASS 506, atlanan 29, başarısız 0.
- **TST-221 / SÖZLEŞME VE STATİK:** hepsi PASS:
  - `pnpm contracts:generate` ve kontrol betiği (103 işlem).
  - Admin `pnpm run lint` (0 hata; 4 eski uyarı), `tsc -b` ve `pnpm run build`.
  - Web `tsc --noEmit`.
  - `flutter analyze`; yalnız üretilen Dart istemcisi değişti.
- **TST-222 / CHROME FIXTURE:** `apps/admin/tests/order-design-detail.mjs` PASS.
  - **Yeni kontroller:** dosya adı ve indirilen baytlar; yavaş istekte kilit (tek istek); doğru sipariş ve satır ucu; 404, 403 ve 503 için açık durum; yalnız 503'te tekrar deneme; başarısız indirmenin “indirildi” olarak görünmemesi.
  - **Önceden de kapsanan:** 4 genişlik, axe ve 320 px %200 yazı.
  - **Regresyonlar:** hepsi PASS:
    - `order-placement`, `admin-consistency-states`, `admin-request`.
    - `test-admin-personalized-orders` (indirme düğmesine güncellendi), `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38).
    - `test-admin-order-states` (15, derlenmiş önizlemede).
  - Görüntüler: [pattern-download/](pattern-download/).

## Başarısız ilk denemeler

- **Ad çakışması:** test fixture'ındaki `pattern` parametresi, SVG desen sabitinin adını gölgeledi ve önizleme yüklenmedi. Parametre `download` olarak yeniden adlandırıldı; bu bir test hatasıydı.
- **Kart genişlemesi:** 320 px %200 yazıda kart iç sütunu 5993 px'e çıktı; yukarıdaki düzen düzeltmesiyle giderildi.
- **Dosya adı okunamadı:** indirmede sunucunun verdiği ad okunamadı ve yedek ad kullanıldı. Development'ta panel ile API farklı origin'de çalışıyor ve `Content-Disposition` CORS ile açılmamıştı. API ve fixture'a `Access-Control-Expose-Headers` eklendi; ayrıca yedek ada gerçek tür uzantısı verildi.

## Sınırlar

- Testlerin hepsi sentetik fixture ile yapıldı. Canlı sunucu (IIS) üzerinde aynı origin indirme ve gerçek SQL siparişiyle kabul yapılmadı.
- Kapsamlı dosya erişim kabulü SIP-TAS-07, eski siparişler SIP-TAS-08, son kabul SIP-TAS-09 kapsamında.
- Rol veya PM onayı verilmedi.
