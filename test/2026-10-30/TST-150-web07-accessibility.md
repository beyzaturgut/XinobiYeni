# WEB-07 - Erişilebilirlik ve büyük metin doğrulaması

30.10.2026, başlangıç `main / c1ba427`; bu kayıtla birlikte commit edilen kaynaklar. Chrome headless / macOS, mevcut web `127.0.0.1:3000`. API/account/order testleri browser fixture'dır; gerçek hesap, sipariş, ödeme veya AI üretimi yazılmadı. Fiziksel cihaz ve gerçek ekran okuyucu yok.

## TST-150 - Mevcut paket

`pnpm --filter web exec playwright test --config /tmp/xinobi-web07-playwright.config.cjs` ilk yalnız `accessibility.spec.ts` config'i: **21 PASS**, 19 rota + iki klavye testi. Giriş yapılmış güncel ekranları veya büyük metni tek başına kapsamıyordu; yeni matris bunun için eklendi.

## TST-151 - Güncel sayfalar, büyük metin ve klavye

Kalıcı tekrar: `pnpm --filter web exec playwright test --config tests/playwright.web07.config.ts`. Varsayılan çıktı OS temp `xinobi-web07-final`; `WEB07_OUTPUT_DIR` ve `WEB07_BASE_URL` değiştirilebilir.

Sonuç **27 benzersiz senaryo son odaklı tekrarlarla PASS**. Tek koşunun hatasız olduğu iddia edilmez: son geniş koşuda **26 PASS / 1 FAIL (320px)**; iki son yerleşim düzeltmesinden sonra `WEB07_OUTPUT_DIR=/tmp/xinobi-web07-320-verified ... --grep '320px'`: **1 PASS**. Görsel incelemede dar arama yazısı komşu ikona taşınca ek Range kontrolü eklendi; son dört boyut matrisi `WEB07_OUTPUT_DIR=/tmp/xinobi-web07-reflow-final ... --grep 'critical pages'`: **4 PASS**. Kalan aynı senaryolar tekrar edilmedi.

Kapsam: 320/390/768/1440 x 900 px, her boyutta 13 güncel sayfa = 52 rota/boyut. Girişli fixture, sepet, ürün değerlendirme formu, XINOBI U hazır yüzey girdisi. Normal ölçekte axe critical/serious kontrolü; hesaplanan fontları 2x yapınca sayfa ve üst kontrol taşması + arama metni çakışması. Bu gerçek tarayıcı zoom veya ekran okuyucu denemesi değildir.

Yeni klavye senaryoları: arama odak çizgisi; mobil menü Enter/Tab/Escape/summary dönüşü; Nobi açılış mesaj odağı ve Escape/kapatma sonrası launcher; giriş penceresinde 14 Tab adımıyla içeride kalma, Escape/geri odak, axe dialog taraması ve login hata `role=alert`. Mevcut üyelik klavye testi de korunur.

### İlk hatalar ve düzeltmeler

- İlk yeni matris, kurumsal/editör sayfasında bulunmayan “Sepet” bağlantısını yüklenme işareti saydı. Gerçek rota içerik işaretleriyle değiştirildi; sayfalar taramadan çıkarılmadı.
- 200% metinde gerçek kusurlar: değerlendirme başlığı/input/yıldızlar, karşılaştırma inputu, hesap inputları/alt menüler, sipariş kartı, Tasarımlarım başlığı, sepet fiyat satırı, desktop üst kontrol taşması. Grid min-width/minmax, wrap ve doğru genişliklerle düzeltildi; overflow gizleme veya font küçültme yok.
- Girişli ödeme düğmesinde contrast bulgusu: etkin yazı koyulaştırıldı. Test kuralı veya tag filtresi gevşetilmedi.
- İlk modal testinde odağın native dialog sınırında belgeye kaçması izlendi; açık Tab/Shift+Tab döngüsü eklendi. Yeni effect cleanup, React geliştirme tekrarında gecikmiş close olayıyla pencereyi kapattı; açık dialog için eski close olayını yok sayan guard ile düzeltildi. `WEB07_OUTPUT_DIR=/tmp/xinobi-web07-modal-final ... --grep 'account dialog|üyelik akışında'`: **2 PASS**.
- Erken denemelerde hatalı e-posta alan etiketi testte “E-posta adresi” olarak düzeltildi. Aynı geçici dizine eşzamanlı raporlama trace ENOENT üretti; sonraki koşular ayrı çıktı dizinlerine ayrıldı. Bu hata uygulama veya veri deposu hatası diye sunulmaz.

## TST-152 - Gerçek yerel katalog

`node /tmp/xinobi-web07-live.cjs`: READ-ONLY LOCAL CATALOG / CHROME / AXE. Ana sayfa, katalog, arama, gerçek ilk aktif ürün detayı ve karşılaştırma; 390/768/1440 px = **15/15 tarama**, critical/serious bulgu 0. Temiz browser context, mutasyon istekleri engelli. İlk yardımcı deneme Axe için `browser.newPage` yerine açık `browser.newContext` gerektirdi; düzeltilip yeniden çalıştırıldı. Son JSON ve üç normal ürün screenshot'ı `/tmp/xinobi-web07-live/` altındadır. Tüm katalog ürünleri veya gerçek oturum kabulü değildir.

## TST-153 - Statik kaynak

`pnpm --filter web lint`, ayrıca `pnpm --filter web exec tsc --noEmit`: **PASS**. Son build TypeScript kontrolünü tekrar içerir; yeni bağımlılık/suppression yok.

## TST-154 - Üretim derlemesi

`pnpm --filter web build`: **PASS**, Next.js 16.3.6 Turbopack, 38 statik sayfa. Kaynak değişikliklerinden sonraki son komutta da çalıştırıldı. Derleme canlı yayın değildir.

## TST-155 - Diff

`git diff --check`: **PASS**. Geçici PNG/trace/JSON, dependencies, build, sır, gerçek müşteri verisi ve medya commit dışı.

## TST-156 - Yerleşim tanılama

`NODE_PATH=... pnpm --filter web exec playwright test --config /tmp/xinobi-web07-diagnostic.config.cjs`: LOCAL DOM DIAGNOSTIC. 390/1440 ve ek 320 px'de viewport dışına çıkan elementlerin tag/class/rect ölçümleriyle gerçek nedenler bulundu. Son 320 px ürün/karşılaştırma/sepet çıktısı üçünde de boş offender listesi. Tanılama script'i geçici; kalıcı testte gerçek taşma assertion'ları korunur.

## Kanıt ve manuel sınır

52 birleşimin PNG'leri seçili ürün detayı için geçici çıktı dizinlerinde, normal gerçek katalog PNG'leri ayrı live dizinindedir. 320/390/1440 büyük metin ve gerçek ürün normal ekranları görsel incelendi. [Manuel matris](../../design/a11y-audit.md) VoiceOver/TalkBack, gerçek iOS/Android/Safari, gerçek zoom ve QA-03/handoff kabulünü **BEKLİYOR** bırakır. Tam WCAG uygunluğu, fiziki cihaz başarısı, UAT imzası, migration veya deploy iddia edilmez.
