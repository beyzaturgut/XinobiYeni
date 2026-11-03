# SIP-TAS-01 — Sipariş tasarım detayı sadeleştirmesi / 03.11.2026

Kapsam: [SIP-TAS-01](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-01---baskı-alanını-sipariş-tasarım-detayına-sadeleştir). Yalnız `apps/admin` ekranı. API, veri, şema, web mağazası, Flutter, hosting, deployment ve APK değişmedi.

## Yapılan değişiklik

- **Sipariş detayı:** Kişiselleştirilmiş her satırda “Sipariş tasarım detayı · N. satır” alanı var (`OrderDesignDetail.tsx`). Alan üç bölümden oluşur:
  1. **Sipariş ve ürün:** sipariş numarası, ürün, SKU, varyant, renk, tasarım adı ve türü, konfigürasyon, revizyon ve kayıt şeması.
  2. **Kayıtlı yerleşim:** editör tuvali pikselleriyle konum, ölçek, döndürme, eğrilik, mod, maske, yüzey sürümü ve gövde/bölge ayarları. JSON yerine okunur liste gösterilir. Ham dosya SHA-256 değeri de buradadır.
  3. **Görseller:** üç ayrı kart.
     - **Ham desen:** dosya önce yetkili oturumla okunur. Önizleme ile mevcut “aç” ve “indir” bağlantıları ancak dosya gerçekten yüklenince görünür.
     - **Ürün kaynak görseli** ve **giydirilmiş önizleme:** siparişe bağlı kopya olmadığı için “İndirme hazır değil” yazar. Güncel katalog fotoğrafı veya ham desen bunların yerine gösterilmez.
- **Eksik veriler:** eski siparişte olmayan alanlar “Bu siparişte kaydedilmemiş” olarak yazılır, 0 gösterilmez. Yerleşimi olmayan eski siparişte “güncel tasarımdan tahmin edilmez” açıklaması çıkar.
- **Ham desen durumları:** yükleniyor, dosya yok (404), yetki yok (403), servis hatası (tekrar dene), bozuk görsel (tekrar dene) ve oturum (401, ortak oturum akışı) birbirinden ayrı gösterilir.
- **Tasarım ekranı (`?view=print`):** fiziksel baskı profili, kalibrasyon kararı, kalibrasyon SVG indirmesi ve yerleşim ölçümü (mm/DPI) ekrandan kaldırıldı (`PrintProfiles.tsx`, `print-profiles.css`, `tests/print-profiles.mjs`).
  - Menü adı “Tasarımlar”, başlık “Tasarımlar ve sipariş bağlantıları” oldu.
  - Tasarım listesi, tasarım detayı, ilişkili siparişler, siparişe geçiş, URL ve geri/ileri davranışı korundu.
  - Profil API'leri, profil verileri ve eski sipariş profil kopyaları silinmedi. Kaldırılan ekran git geçmişinden geri alınabilir.
- **Sipariş işlemleri:** mevcut ödeme bilgisi, kargo, durum, iptal ve iade işlemleri değişmedi. Eski “Temsilidir; üretim dosyası ayrıca kontrol edilir.” cümlesi ve `<details>` içindeki ham JSON görünümü kaldırıldı.

## Kontroller

- **TST-207 / STATIC:** `apps/admin` içinde `pnpm run lint`, `tsc -b` ve `pnpm run build` — PASS. Lint 0 hata verdi; 4 uyarı var, hepsi bu işten önce de vardı (AuditHistory 1, SurfaceMasks 3). Yeni dosyalarda uyarı yok.
- **TST-208 / CHROME FIXTURE:** yeni `apps/admin/tests/order-design-detail.mjs` — PASS. Kapsam:
  - 1440/768/390/320 px'te ürün, yerleşim ve üç görsel kartı; ürün kaynak görseli ve giydirilmiş önizleme kartlarında görsel, bağlantı ve düğme yok.
  - Ekranda üretim/kalibrasyon/profil kontrolü yok; mevcut sipariş işlemleri duruyor; sayfada ve pencerede taşma yok.
  - 390 px'te pencere içi axe taraması (ciddi/kritik ihlal yok) ve 320 px'te %200 yazı.
  - Eski siparişte 4 eksik alan; ham desen için yükleniyor, 404, 403, 503, bozuk görsel ve tekrar dene durumları.
  - `?view=print` artık profil verisi istemiyor. Hiçbir yazma isteği gönderilmedi.
- **TST-209 / REGRESYON:** Admin izole tarayıcı testleri tek tek çalıştırıldı ve hepsi PASS:
  - `tests/` altındaki 15 dosya: `admin-consistency` (16 modül × 4 genişlik, normal ve %200 yazı, 16 axe, 48 durum), `admin-consistency-states`, `navigation-ui`, `admin-write-permissions`, `admin-data-honesty`, `admin-operation-results`, `admin-proxy`, `admin-request`, `audit-presentation`, `browser-isolation`, `catalog-source-states`, `dashboard-summary`, `price-results`, `source-checksum` ve `order-design-detail`.
  - `tools/` altındaki 4 senaryo dosyası: `test-admin-design-order-detail` (12 senaryo; tasarımdan siparişe geçiş, URL, geri/ileri, yeniden yükleme), `test-admin-print-source-state` (38), `test-admin-personalized-orders` ve `test-admin-order-states` (15).
  - CSS düzeltmelerinden sonra sipariş penceresine dokunan testler yeniden koşuldu ve yine geçti.
- **TST-210 / EKRAN:** Temsilî görüntüler [order-design-detail/](order-design-detail/) klasöründe. 1440 px'te bilgi ve görsel bölümleri, 390 px'te görseller ve 320 px'te üst bölüm incelendi. Kartlar ayrı duruyor, eksik dosyalar açıkça yazıyor ve dar ekranda kartlar alt alta diziliyor.

## Başarısız denemeler ve düzeltmeler

- **Toplu test komutu takıldı:** `pnpm run test:isolated`, iki tutarlılık testi sonuçlarını yazdıktan sonra 10 dakikadan uzun süre kapanmadı. Komut durduruldu ve testler aynı izole sunucuda tek tek, zaman sınırıyla çalıştırıldı. Hepsi kendi başına çıkış kodu 0 ile bitti. Takılmanın nedeni bulunmadı.
- **Yeni testin ilk sürümü:** React geliştirme modu ilk isteği iki kez gönderdiği için tek seferlik 404 fixture'ı görünmedi. Hata, tekrar denemeye kadar süren bir bayrağa çevrildi.
- **axe kontrast ihlali:** Yeni axe kontrolü, sipariş penceresinin mevcut etiket rengindeki ihlali yakaladı (#9a9a9a, 2.81:1). Renk #616161 yapıldı.
- **%200 yazıda taşma:** 320 px'te pencere 982 px'e genişledi. Pencere gövdesi ve satır ızgarası kartların doğal genişliğini aldığı için oldu; not alanı da taşıyordu. İkisi `minmax(0,1fr)` ve tam genişlikle sınırlandı.
- **`test-admin-order-states`:** İlk koşuda dev sunucu üzerinde düştü. Test başlığı, geliştirme modundaki çift isteklerden dolayı derlenmiş önizleme istiyor. Aynı kaynak ayrı bir klasöre derlenip `vite preview` ile çalıştırıldı ve PASS verdi. Derleme çıktısı repoya eklenmedi; yayın paketi üretilmedi.

## Sınırlar

- Ekran görüntüleri sentetik fixture ile alındı; gerçek müşteri, sipariş veya katalog verisi okunmadı ya da yazılmadı.
- Ürün kaynak görseli ve giydirilmiş önizleme dosyaları üretilmedi ve indirilemez:
  - Siparişe bağlı dosyalar ve indirmeler: SIP-TAS-02/04/05/06.
  - Yerleşim alanlarının tamamlanması: SIP-TAS-03.
  - Sunucu yetkisi ve dosya erişimi: SIP-TAS-07.
  - Eski kayıt geçişi: SIP-TAS-08.
  - Kabul: SIP-TAS-09.
- Bu kayıt rol ya da PM onayı, gerçek SQL kabulü veya ekran okuyucu kabulü değildir. SIP-TAS-02…09 yapılmış sayılmaz.
