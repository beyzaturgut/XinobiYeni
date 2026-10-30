# WEB-02 doğrulama kaydı / 30.10.2026

Başlangıç `main / 358d42d`. Ortam: macOS, Chrome headless, mevcut web 3000 ve API 5003. Kullanıcı içerik doldurmayı sonraya bıraktı. Bu raporun bulunduğu commit teknik düzeltmeleri kapsar; açık veri işleri task kaydında izlenir.

## TST-142 - Public medya tarama ve yerel kurtarma

READ-ONLY HTTP / LOCAL MEDIA RESTORE. Aktif ürünlerin kapak, varyant, galeri, yüzey fotoğrafı ve maske alanlarında 110 tekil kaynak. İlk tarama 107 HTTP 200, üç HTTP 404: `3ff3d012f70641eb8959735d19cf05a4.webp`, `6bcd7ab54e82471083aa52a78ac5fccd.webp`, `55152901fe260f9ef17dd56b678e3eda.png`; üçü de “tasarım deneme” ürününe bağlı.

README'de kayıtlı mevcut public origin'de üçü de 200 doğrulandı. Yalnız bu üç referansı içeren geçici JSON ile `node tools/restore-local-media.mjs --origin http://109.104.120.91:8014 --state /tmp/xinobi-web02-missing.json`: **3 restore / 0 overwrite / 0 failure**. Yeniden public GET taraması **110/110 HTTP 200**. Dosyalar ignored yerel medya dizininde; SQL/katalog kaydı veya canlı dosya değiştirilmedi. Geçici audit aracı `/tmp/xinobi-web02-media.cjs`, sonuç `/tmp/xinobi-web02-media.json`; tüm ürün fotoğrafları tarayıcı testinde decode edildi, fiziksel maskeler için kalite kabulü iddia edilmez.

## TST-143 - Gerçek katalog ve GET fixture kabulü

`node apps/web/tests/product-detail-acceptance.mjs`: **PASS**. READ-ONLY LOCAL CATALOG / BROWSER CART / GET FIXTURE.

- 390, 768, 1440 x 900 px: her boyutta 24 ürün / 79 varyant, toplam 237 renk kontrolü.
- Gerçek SKU, fiyat/stok, renk düğmesi, URL, localStorage ürün/varyant/adet, fotoğraf src/decode, mevcut açıklama/teknik özellik ve değerlendirme bölümü kontrolü; eksik metinler mevcutmuş gibi işaretlenmedi.
- GET fixture'ında geçersiz/kaldırılmış renk, eksik/sıfır/negatif/kesirli fiyat, sıfır stok, azalan stok/adet, fazla sepet ekleme, 503/retry, bozuk görsel ve pasif ürün geçti. Gerçek katalogya bu senaryolar yazılmadı; HTTP mutasyonları tarayıcıda engellendi.
- İlk deneme FAIL: test görünür resmi `aria-hidden="false"` ile aradı, uygulamada görünür resmin aria-hidden niteliği yoktur. Seçici gerçek sözleşmeye uygun `img[loading="eager"]:not([aria-hidden="true"])` yapıldı; src ve tam decode beklentisi korunarak tam 237 kontrol tekrar geçti.
- İlk yenileme screenshot'ları resim yüklenmeden alınmıştı; ayrıca decode beklenerek üç boyutta tekrar çekildi ve görsel inceleme yapıldı. Kalıcı testte de screenshot öncesine aynı bekleme eklendi. Bu bir kaynak fotoğraf silinmesi değildi.

Geçici kanıtlar `/tmp/xinobi-web02/results.json`, `detail-390.png`, `detail-768.png`, `detail-1440.png`. Gerçek sepet kullanıcının tarayıcısından değil, izole Chrome context'inden gelir.

## TST-144 - Playwright sözleşme regresyonları

`pnpm --filter web exec playwright test --config /tmp/xinobi-web02-playwright.config.cjs --grep 'maskesiz renk|ürün renk URLsi|ürün detayında renk|review service error|method step requires'`: **5 PASS**. Sonrasında yeni `--grep 'yöntem adımında katalog'`: **1 PASS**.

CHROME FIXTURE / E2E. Mevcut ürün renk/görsel ve değerlendirme retry; URL yenileme/geçmiş; maskesiz rengin normal sepete doğru gitmesi; yöntem ekranında kullanıcının açıkça başka rengi seçmesi; katalog kesilince eski uygunlukla devam edememe kapsanır. Eski otomatik renk değiştirme testi yeni güvenli ürün sözleşmesine güncellendi, yalnız beklenti silinmedi: maskesiz renkte CTA yokluğu ve açık renk seçimi doğrulanır. Kabul girdileri sentetik browser fixture'ıdır, gerçek üretim maskesi/provider çağrısı/insan onayı değildir.

Geçici config mevcut 3000 sunucusunu kullanır, workers=1, viewport=390x900; testMatch `critical-interactions.spec.ts`, `ux-phases.spec.ts`, `variant-preview-readiness.spec.ts`, `web02-detail.spec.ts`. Standalone yüzey spec'inin diğer testleri çalıştırılmadı.

## TST-145 - TypeScript

`pnpm --filter web exec tsc --noEmit`: PASS. Son üretim derlemesi de TypeScript kontrolünden geçti.

## TST-146 - ESLint

Odaklı kaynak/test lint'i ve `pnpm --filter web lint`: PASS, suppression yok.

## TST-147 - Üretim derlemesi

`pnpm --filter web build`: PASS, Next.js 16.3.6 Turbopack, 38 statik sayfa. Derleme yereldir, release/IIS kurulumu değildir.

## TST-148 - Diff kontrolü

`git diff --check`: PASS. Medya, katalog snapshot'ı, kişisel veri, credentials, generated build veya geçici PNG/JSON commit edilmez.

## TST-149 - Gerçek renk yüzey hazır oluşu

READ-ONLY LOCAL API. Yedi kişiselleştirilebilir ürünün 30 renginde `/api/v1/dev/product-surfaces/commerce-mask/{product}/{variant}/rendering-inputs` GET: **30/30 previewAvailable=true**. Sonuç `/tmp/xinobi-web02-surfaces.json`; kullanıcı onayı, fiziksel numune veya gerçek AI üretimi değildir. Olmayan/bozuk maske davranışı TST-144'te sentetik fixture ile doğrulanır.

## Açık veri ve kabul sınırı

23 ürünün açıklaması/teknik özellikleri kullanıcı talebiyle açık. Elektrikli Çay Makinesi 116120 / Metalik Lacivert / SKU 117 fiyatı eksik; satın alma kapalı, tutar atanmadı. WEB-02 teknik çalışma tamamlandı, tüm ticari veri kabulü kapanmadı. Tam API/Flutter/tüm web paketi, ödeme, üretim, mağaza yayını, migration ve deploy bu oturumun kapsamı değildir.
