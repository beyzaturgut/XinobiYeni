# SIP-TAS-05 — Maskelemede kullanılan ürün kaynak görselinin ayrı indirilmesi / 03.11.2026

Kapsam: [SIP-TAS-05](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-05---maskelemede-kullanılan-ürün-görselini-ayrı-indir). Değişiklik yalnız API, sözleşme ve admin ekranında. Web mağazası, Flutter uygulaması, maskeleme özelliği, ürün verisi, hosting, deployment ve APK değişmedi.

## Önkoşul

SIP-TAS-02 (`55ed208`) kod ve testle doğrulandı. Sipariş anında `DesignSurfaceValidator.SourceImage`, editörün maskelediği fotoğrafı yüzeyin kayıtlı kaynak SHA-256 değeriyle doğruluyor ve `order-{id}-{satır}-source` olarak kopyalıyor. Satıra `Files.ProductSource` (SHA-256, tür, bayt) yazılıyor. Bu taskta kayıt veya kopyalama değişmedi; yalnız bu kopya okunuyor.

## Yapılan değişiklik

- **API:** `GET /api/v1/admin/orders/{id}/lines/{line}/source` (`DownloadAdminOrderLineProductSource`) eklendi.
  - Personel oturumu ve `orders.read` izni gerekir.
  - Dosya yalnız sunucudaki sipariş kaydından ve `Files.ProductSource` referansından çözülür. Depolama anahtarı rotadaki kimlikten değil, saklı siparişin kimliğinden kurulur. Kimlik doğrulaması ve anahtar deseni (`FileAreas.CheckedKey`) yol aşımını kapatır. Sorgu parametreleri ve istemcinin gönderdiği URL ya da yol kullanılmaz. Dış adres veya katalog dosyası okunmaz.
  - **Doğrulama:**
    - Kayıtlı SHA-256 ve tür kontrol edilir. Baytlardan saptanan tür kayıtla aynı olmalıdır.
    - Fotoğrafın çözülen ölçüsü, editör tuval kuralıyla (`DesignSurfaceValidator.EditorCanvas`; çok büyük fotoğraflarda yaklaşık 16 MP'ye küçültme) siparişteki `placement.sourceWidth/Height` değerini vermelidir. Uyuşmazsa 503 döner.
    - Ürün, varyant, SKU ve renk bağı sipariş satırından gelir. Kopya, sipariş anında aynı satırın ürün/varyant yüzeyi üzerinden doğrulanmıştı.
  - **Yanıt:** baytlar değiştirilmeden `attachment`, `nosniff` ve `no-store` ile döner. Dosya adı `xinobi-{no}-satir-{n}-urun-kaynak-{SKU}.{uzantı}` biçimindedir.
  - **Hatalar:**
    - 404 `order_source_not_recorded`, iki durumda nedenini yazar: kayıtlı yerleşim olmadığında, ya da sipariş kopyalar saklanmaya başlamadan önce verildiğinde.
    - 404 `order_source_not_found`: dosya kaydı var ama dosya bulunamıyor.
    - 404 `order_line_design_not_found` / `order_not_found`.
    - Bozuk kopya, tür veya tuval uyuşmazlığında 503; oturumsuz istek 401, yetkisiz istek 403.
  - Güncel katalog fotoğrafı, başka bir renk veya maske dosyası hiçbir durumda yedek olarak verilmez.
- **Yardımcı:** tuval kuralı `EditorCanvas` olarak çıkarıldı; yüzey doğrulaması aynı kuralı kullanmaya devam ediyor.
- **Sözleşme:** OpenAPI, TypeScript ve Dart istemcileri yeniden üretildi. Yalnız yeni uç eklendi.
- **Admin ekranı:**
  - Ham desendeki indirme düğmesi ortak `FileDownload` bileşenine dönüştü; desen ve ürün kaynak görseli aynı kilit ve durum davranışını kullanıyor.
  - “Ürün kaynak görseli” kartında:
    - Kart, görselin desen uygulanmamış olduğunu ve maske dosyası olmadığını yazıyor.
    - Kopya varsa türü ve boyutu gösteriliyor; “Ürün kaynak görselini indir” düğmesi çıkıyor.
    - Kopya yoksa düğme çıkmıyor ve nedeni yazıyor: yerleşim yok ya da sipariş önceden verilmiş. Katalog veya başka renk görselinin kullanılmadığı belirtiliyor.
    - İndirme hatasında sunucunun nedeni ya da 404/403 durumu gösteriliyor; servis hatasında tekrar deneme var.
- Ayrı maske PNG indirmesi, önizleme indirmesi (SIP-TAS-06) ve üretim dosyası eklenmedi.

## Kontroller

- **TST-223 / API FIXTURE:** `OrderDesignSnapshotTests` PASS 10/10; bunlardan 2'si bu task için yeni. Testlerde SkiaSharp ile üretilmiş gerçek 100×100 PNG kullanıldı.
  - **Kaynak sabitliği:** siparişten sonra yeni fotoğraf ve maske yayımlandı, varyantın katalog görseli değiştirildi ve tasarım silindi. İndirilen dosya yine sipariş anındaki kırmızı fotoğraf oldu; yeni mavi fotoğraf veya desen değil.
    - SHA-256 `Files.ProductSource` ile eşleşiyor.
    - Tür `image/png`, ad `…-urun-kaynak-{SKU}.png`; `attachment` ve `nosniff` başlıkları doğrulandı.
  - **Yol aşımı ve keyfi URL:**
    - `?url=https://…`, `path=../../appsettings.json` ve `key=` parametreleri yok sayıldı; aynı sipariş kopyası indi.
    - `..%2F..%2Fdesigns`, `%2E%2E`, depolama anahtarı ve URL biçimli kimlikler 404 veya 400 verdi; fotoğraf baytları dönmedi.
    - `-1` satırı 404 verdi.
  - **Durumlar:**
    - Yerleşimsiz eski satır ve referansı olmayan (önceden verilmiş) satır 404 `order_source_not_recorded` verdi.
    - Tuval uyuşmazlığı 503 verdi; kayıt düzeltilince indirme geri geldi.
    - Değiştirilmiş kopya 503, silinmiş kopya 404 `order_source_not_found` verdi.
  - **Yetki:** oturumsuz istek 401; sipariş sahibi müşteri 403; `orders.read` izni olmayan personel 403.
- **TST-224 / API REGRESYON:** `dotnet test tests/Xinobi.Architecture.Tests` — PASS 508, atlanan 29, başarısız 0.
- **TST-225 / SÖZLEŞME VE STATİK:** hepsi PASS:
  - `pnpm contracts:generate` ve kontrol betiği (104 işlem).
  - Admin: `pnpm run lint` (0 hata; 4 eski uyarı), `tsc -b` ve `pnpm run build`.
  - Web: `tsc --noEmit`.
  - Flutter: `flutter analyze`; yalnız üretilen Dart istemcisi değişti.
- **TST-226 / CHROME FIXTURE:** `apps/admin/tests/order-design-detail.mjs` PASS.
  - Kopyası olan satırda düğme var, katalog görseli gösterilmiyor; eski satırda neden yazıyor ve düğme yok.
  - İndirilen dosyanın adı ve baytları doğru.
  - `not_recorded` durumunda sunucu nedeni gösteriliyor; 404 ve 403'te tekrar deneme yok, 503'te var; başarısız indirme “indirildi” olarak görünmüyor.
  - Regresyonlar PASS: `order-placement`, `admin-consistency-states`, `test-admin-personalized-orders`, `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38) ve derlenmiş önizlemede `test-admin-order-states` (15).
  - Görseller: [source-download/](source-download/).

## Sınırlar

- Tüm testler sentetik fixture ile yapıldı. Gerçek ürün fotoğrafları, gerçek SQL siparişi ve canlı sunucu (IIS, aynı origin) ile kabul yapılmadı.
- SIP-TAS-02 öncesinde verilmiş siparişlerde kaynak kopyası yok. Bu siparişlerin ele alınması SIP-TAS-08 kapsamında.
- Kapsamlı erişim kabulü SIP-TAS-07, son kabul SIP-TAS-09 kapsamında. Rol veya PM onayı verilmedi.
