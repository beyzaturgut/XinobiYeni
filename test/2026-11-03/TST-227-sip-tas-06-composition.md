# SIP-TAS-06 — Siparişin giydirilmiş ürün görselini gösterme ve indirme / 03.11.2026

Kapsam: [SIP-TAS-06](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-06---giydirilmiş-görseli-göster-ve-indir). Değişiklik API, sözleşme, admin ekranı ve web kayıt adımındaki bir korumayla sınırlı. Flutter uygulaması, hosting, deployment ve APK değişmedi.

## Önkoşullar ve mevcut temel

- **SIP-TAS-02 (`55ed208`):** Web editörü her yerleşim revizyonu için dijital kompozisyonu (JPEG) `preview-{konfigürasyon}-{revizyon}.jpg` olarak yükler. Sipariş anında bu dosya `order-{id}-{satır}-preview` olarak siparişe kopyalanır ve satıra `Files.Composition` (SHA-256, tür, bayt) yazılır. Müşterinin sipariş önizleme ucu okumada özeti doğrular.
- **SIP-TAS-03 (`8b38bd2`):** Admin ekranı sipariş edilen revizyonu, yerleşimi, yüzey sürümünü (maske) ve kaynak görsel bağını gösterir. Kompozisyon aynı satıra ve revizyona bağlıdır.
- **Eksik olan:** Yönetici için kompozisyon erişim ucu ve ekranda gösterim yoktu. Bu koruma ayrı bir sistem olarak yeniden kurulmadı; mevcut kopya ve referans kullanıldı.

## Yapılan değişiklik

- **API:** yeni `GET /api/v1/admin/orders/{id}/lines/{line}/composition` ucu (`DownloadAdminOrderLineComposition`, `orders.read`).
  - Yalnız siparişe bağlı kopya okunur. Kayıtlı SHA-256 doğrulanır; baytlardan saptanan tür hem kayıtla hem `image/jpeg` ile eşleşmelidir.
  - Baytlar aynen döner: `attachment`, `nosniff`, `no-store`.
  - Dosya adı: `xinobi-{no}-satir-{n}-giydirilmis-onizleme-rev{r}.jpg`.
  - Kopya yoksa 404 `order_composition_not_recorded` döner ve nedenini yazar:
    - satırda yerleşim yok;
    - sipariş, kopyalar saklanmadan önce verilmiş;
    - bu revizyon için sipariş anında önizleme yüklenmemişti.
  - Diğer hatalar:
    - Kopyanın dosyası silinmişse 404 `order_composition_not_found`.
    - Bozuk ya da türü uyuşmayan kopyada (kompozisyon adı altındaki ham desen dahil) 503.
    - Oturumsuz istek 401, yetkisiz istek 403.
  - Güncel katalog veya tasarımla yeniden giydirme yapılmaz; ham desen yedek olarak verilmez.
- **Sözleşme:** OpenAPI, TypeScript ve Dart istemcileri yeniden üretildi. Yalnız yeni uç eklendi.
- **Admin ekranı:** “Giydirilmiş önizleme” kartı güncellendi.
  - Kompozisyon aynı yönetici ucundan alınıp gösteriliyor. Alt yazı şöyle: “Temsilidir: sipariş anındaki N. revizyon yerleşimin dijital önizlemesi. Baskıya hazır dosya değildir.”
  - “Giydirilmiş önizlemeyi indir” düğmesi var. Kilit ve durum davranışı ortak indirme bileşeninden geliyor.
  - Kompozisyon yoksa resim ve düğme çıkmıyor; nedeni yazıyor ve ham desenin yerine kullanılmadığı belirtiliyor.
  - Görüntülemede 404 için neden, 403 için yetki mesajı, servis hatasında “Önizlemeyi tekrar dene” çıkıyor.
- **Web kayıt adımı (`save-design-button.tsx`):** Yerleşim kaydı artık dijital önizleme tuvali hazır olmadan başlamıyor; açık bir hata mesajı gösteriliyor. Mevcut akışlar bu durumda düğmeyi zaten devre dışı bırakıyordu. Bu koruma, önizlemesi olmayan bir revizyonun kaydedilmesine yol açabilecek tek kod yolunu kapatıyor. Önizleme üretimi ve yükleme davranışı değişmedi.
- Fiziksel baskı renderı, yüksek DPI veya ICC çıktısı, üretim kuyruğu ve üretim onayı eklenmedi.

## Kontroller

- **TST-227 / API FIXTURE:** `OrderDesignSnapshotTests` PASS 12/12; bunlardan 2'si yeni.
  - **Revizyon bağı:** Revizyon 2 varken revizyon 1 sipariş edildi. Ardından revizyon 1'in düzenlenebilir önizlemesi değiştirildi ve tasarım (desen) silindi.
    - Yönetici ucundan iki ayrı indirme yapıldı; ikisi de sipariş anındaki kompozisyonun aynı baytlarını verdi. Bunlar desenden farklı.
    - SHA-256 `Files.Composition` ile eşleşiyor. Tür `image/jpeg`; ad `…-giydirilmis-onizleme-rev1.jpg`; `attachment` ve `nosniff` başlıkları var.
    - Müşterinin sipariş önizleme ucu da aynı baytları döndürdü.
  - **Durumlar:**
    - Yerleşimsiz satır, önizlemesiz revizyon ve referansı olmayan sipariş, nedenleriyle birlikte `not_recorded` döndü.
    - Bozuk kopya ve kompozisyon adı altındaki ham desen 503 aldı; silinmiş kopya 404 `not_found` aldı.
  - **Yetki:** oturumsuz istek 401, müşteri 403, `orders.read` izni olmayan personel 403.
- **TST-228 / API REGRESYON:** `dotnet test tests/Xinobi.Architecture.Tests` — PASS 510, atlanan 29, başarısız 0.
- **TST-229 / SÖZLEŞME VE STATİK:** hepsi PASS.
  - `pnpm contracts:generate` ve kontrol betiği (105 işlem).
  - Admin: lint (0 hata; 4 eski uyarı), `tsc -b`, build.
  - Web: `tsc --noEmit` ve değişen dosyada `eslint`.
  - `flutter analyze`.
- **TST-230 / CHROME FIXTURE VE WEB E2E:**
  - **Admin `order-design-detail.mjs`:** PASS.
    - Kompozisyon admin ucundan gösteriliyor ve “Temsilidir … Baskıya hazır dosya değildir” alt yazısı çıkıyor.
    - İki ardışık indirme, ekranda gösterilen görüntünün baytlarının aynısını verdi; dosya adı doğru.
    - Eski satırda açıklama var; resim veya düğme yok, ham desen gösterilmiyor.
    - `not_recorded` nedeni, 403 ve 503 için tekrar dene doğru çalışıyor.
  - **Admin regresyonlar:** PASS — `order-placement`, `admin-consistency-states`, `test-admin-personalized-orders`, `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38), `test-admin-order-states` (15, derlenmiş önizlemede).
  - **Web `design-configuration.spec.ts`:** 18 testten 16'sı geçti, 2'si düştü (“artwork/pattern can be added, previewed in cart…”).
    - Değişiklik geri alınmış baseline'da aynı iki testten biri yine düştü (canvas `toDataURL` sırasında sayfa geçişi; kararsız test).
    - Değişiklikle bu iki test iki ardışık koşuda 2/2 geçti.
    - Bu düşüş web değişikliğinden kaynaklanmıyor. Kararsız test ayrıca düzeltilmedi; kayıt altına alındı.
  - Görseller [composition/](composition/) klasöründe. Fixture JPEG'i 1×1 olduğu için kartta tek renk görünüyor.

## Sınırlar

- Testler sentetik fixture ile yapıldı. Gerçek ürün kompozisyonları, gerçek SQL siparişi ve canlı sunucu (IIS) ile kabul yapılmadı.
- SIP-TAS-02 öncesi siparişlerde kompozisyon kopyası yok; ele alınmaları SIP-TAS-08'e kalıyor.
- Native (Flutter) istemcinin önizleme yüklemesi incelenmedi; Flutter bu task kapsamında değil.
- Kapsamlı erişim kabulü SIP-TAS-07'ye, son kabul SIP-TAS-09'a kalıyor. Rol veya PM onayı verilmedi.
