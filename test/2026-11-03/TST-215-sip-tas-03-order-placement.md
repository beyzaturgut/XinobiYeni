# SIP-TAS-03 — Sipariş detayında kayıtlı editör yerleşimi / 03.11.2026

Kapsam: [SIP-TAS-03](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-03---müşterinin-kaydettiği-yerleşim-detaylarını-göster). Yalnız admin ekranı değişti; değişiklik salt okunur. API, veri, web mağazası, Flutter, hosting, deployment ve APK değişmedi.

## Önkoşullar

Önkoşullar kod ve testle doğrulandı:

- SIP-TAS-01 (`eb7f3b4`) sipariş tasarım detayı alanını sağlar.
- SIP-TAS-02 (`55ed208`) sipariş satırına şunları yazar:
  - yerleşim, `schemaVersion`, konfigürasyon kimliği ve revizyonu;
  - yerleşimin desen özeti (`sourceSha256`);
  - `Files.Pattern.Sha256`.

Bu task için ek API gerekmedi.

## Yapılan değişiklik (`apps/admin/src/OrderPlacement.tsx`)

- **Kaynak:** değerler yalnız sipariş satırındaki kayıtlı `placement` alanından okunur. Editörün geçici durumu veya varsayılanları kullanılmaz; örneğin kavisin varsayılan 0,75 değeri ve `fillMask` varsayılanı doldurulmaz.
- **Etiketler ve birimler:**

  | Alan | Gösterim |
  |---|---|
  | Kaynak tuval | genişlik × yükseklik, px |
  | Yatay/dikey konum | desen merkezi, px, ürün fotoğrafının sol üst köşesine göre |
  | Ölçek | kat; desenin editördeki temel boyutuna göre |
  | Döndürme | derece; yönü ayrıca yazılır |
  | Yerleşim modu | Desen / Tek görsel; tanınmayan değer kayıttaki haliyle gösterilir |
  | Maske alanını doldurma | Açık / Kapalı |
  | Yüzey kavisi | 0–1 ve anlamı |
  | Yüzey sürümü | maske özeti |

  - Konumun yanında, siparişin kendi tuval ölçüsüne göre hesaplanmış bir yüzde de yazılır. Etiketi “gösterim için; kayıtlı değer piksel” der; kayıtlı değer değişmez.
- **Gövde/bölge ayarları:** Üst gövde / Alt gövde için ek kaydırma (px), ek ölçek (ana ölçekle çarpılır) ve ek döndürme (ana döndürmeye eklenir) gösterilir.
  - Kaydedilmemiş bir alan “Kaydedilmemiş” yazar ve gerçek etkisini belirtir: “Ek kaydırma uygulanmadı” ya da “Ana ölçek aynen uygulanır”.
  - Bölge ayarı yoksa bu açıkça yazılır.
- **Revizyon ve satır bağı:**
  - Üst satır sipariş numarasını, satır numarasını, konfigürasyon kimliğini ve revizyonu gösterir.
  - Siparişe kopyalanan desenin SHA-256 değeri yerleşimin desen özetiyle karşılaştırılır. Sonuç üç durumdan biridir: eşleşiyor (durum), eşleşmiyor (uyarı) veya kayıt olmadığı için doğrulanamıyor.
  - “Tasarım kimliği” satırı eklendi.
- **Eski ve desteklenmeyen şema:**
  - Yerleşimi olmayan eski siparişte “tahmin edilmez” açıklaması çıkar.
  - Şema sürümü kaydedilmemişse bu ayrıca belirtilir.
  - 1 dışındaki bir şema sürümünde değerler yorumlanmaz; kayıttaki ham haliyle gösterilir.
- **Gerçek sıfır ile eksik değer:** 0 px, 0° ve kavis 0 gerçek değer olarak gösterilir. `null` veya eksik alan hiçbir zaman 0, 1 ya da “aktif” olarak gösterilmez.
- **SIP-TAS-02 sonrası düzeltme:** ürün kaynak görseli ve önizleme kartları, sipariş kaydında kopya olup olmadığını doğru söyler (`Files`). İndirme hâlâ “hazır değil”; indirme SIP-TAS-05/06 kapsamında.
- Ekranda mm, DPI ya da ICC hesabı, baskıya uygunluk ya da düzenleme kontrolü yok.

## Kontroller

- **TST-215 / STATIC:** `apps/admin` içinde `pnpm run lint` (0 hata; 4 uyarı, hepsi bu işten önce de vardı), `tsc -b` ve `pnpm run build` — PASS.
- **TST-216 / CHROME FIXTURE:** yeni `apps/admin/tests/order-placement.mjs` — PASS. Ayrıca son halin 2 ardışık koşusu da geçti. Kapsam:
  - **Doğru revizyon:** üst satırda sipariş, satır, uzun konfigürasyon kimliği ve revizyon 7 görünüyor.
  - **Farklı tuval boyutları:** 2000×1000 ve 500×800 tuvalde yüzdeler her siparişin kendi tuvaline göre hesaplanıyor (%0, %25, %50, %100).
  - **Gerçek sıfır ile eksik alan:** 0 px, 0° ve kavis 0 gerçek değer olarak görünüyor. Kaydedilmemiş mod, maske ve bölge alanları “Kaydedilmemiş” yazıyor.
  - **İki bölge:** iki bölge kısmi alanlarla doğru gösteriliyor.
  - **Desen bağı:** desen bağı eşleşmesi ve eşleşmeme uyarısı çıkıyor.
  - **Şema durumları:** şema sürümü 2 yorumlanmadan ham gösteriliyor; şema eksikse açıklama çıkıyor; yerleşimi olmayan eski sipariş doğru açıklanıyor.
  - **Taşma:** 320, 390 ve 1440 px'te, normal ve %200 yazıda pencere ve sayfa taşmıyor. Hiçbir yazma isteği gönderilmedi.
- **TST-217 / REGRESYON:** hepsi PASS:
  - `order-design-detail` (4 genişlik, axe, %200 yazı, dosya durumları; fixture şeması 1'e çekildi).
  - `admin-consistency-states`, `navigation-ui`.
  - `test-admin-personalized-orders` (etiket güncellendi), `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38).
  - `test-admin-order-states` (15, derlenmiş önizlemede).
- **TST-218 / EKRAN:** [order-placement/](order-placement/) klasöründeki 1440 px 1x, 390 px 1x ve 320 px %200 görüntüleri incelendi.
  - Birim ve açıklamalar değerin altında okunuyor.
  - “Kaydedilmemiş” gerçek değerlerden ayrışıyor.
  - Uzun kimlik dar ekranda sarılıyor.

## Başarısız ilk denemeler

- **Locator hatası:** `dl>div` locator'ı bölge listesindeki satırları bulamadı. `:scope>div` kullanıldı; bu ürün hatası değil, test hatasıydı.
- **Eski fixture:** `order-design-detail` fixture'ı şema 2 ile yazılmıştı. Yeni ekran bunu doğru biçimde “yorumlanmadı” olarak gösterdi; fixture şema 1'e çekildi.
- **Tek seferlik taşma:** 320 px %200 kontrolü bir kez taşma bildirdi. Ardından ayrıntılı ölçümle 4 koşu geçti ve taşan öğe bulunamadı. Ölçüm artık ham desen görseli yüklendikten sonra yapılıyor; son halin 2 koşusu daha geçti.

## Sınırlar

- Değerler editörde kaydedilen sayılardır; fiziksel ölçüye çevrilmez.
- Görüntüler ve kontroller sentetik fixture ile yapıldı; gerçek sipariş verisiyle kabul yapılmadı.
- Rol/PM ve ekran okuyucu kabulü açık.
- SIP-TAS-04 ile 09 arası yapılmış sayılmaz.
