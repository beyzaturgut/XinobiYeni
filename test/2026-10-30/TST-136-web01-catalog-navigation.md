# WEB-01 - Katalog gezinme kabulü / 30.10.2026

Başlangıç `main / 325ce60`; bu kaydın bulunduğu commit WEB-01 uygulamasını içerir. Ortam: macOS, sistem Google Chrome headless, web `127.0.0.1:3000`, API `127.0.0.1:5003`. Yalnız public katalog GET kullanıldı; tarayıcıdaki tüm iş mutasyonu istekleri engellendi. API'nin doğal arka plan işleri bu testin parçası değildir.

## TST-136 - Gerçek katalog E2E ve tarayıcı fixture kenar durumları

Komut: `node apps/web/tests/catalog-navigation.mjs`.

**READ-ONLY LOCAL CATALOG / E2E**: 24 aktif ürün, 8 kategori; 390, 768, 1440 x 900 px. Her kategorinin gerçek sayısı; Türkçe alfabetik sıralama; tam ad araması; URL q/sort/category; yenileme ve ürün detayından geri dönüş; geri/ileri; kaldırılmış kategori; arama Escape; karşılaştırma 1/2/4/5 ürün sınırı; sayfalar arası liste; paylaşımda silme/temizleme ve tekrar eden kimlikler başarılı. Her boyutta yatay sayfa taşması kontrolü ve katalog/karşılaştırma PNG incelemesi başarılı; tarayıcı pageerror yok.

**BROWSER GET FIXTURE**: gerçek public katalog yanıtının bellekteki kopyasıyla gecikme, 503, tekrar yükleme, gerçekten boş katalog, silinen/pasif ürün, korunması gereken karşılaştırma listesi ve `Çay`/`Çay makineleri` çakışması başarılı. Bunlar gerçek SQL yazımı veya gerçek bir servis kesintisi değildir.

İlk iki deneme **FAIL**: tam sayfa yenilemesinde yeniden açılan mevcut çerez taslağı “Filtreleri temizle” düğmesini örttü (30s ve 12s click timeout). Test, her tam navigasyon/yenilemede paneli kullanıcı gibi kapatacak şekilde düzeltildi; force click, CSS gizleme veya beklenti zayıflatma yapılmadı. Son tekrarlar **PASS**, son kodda üç ekran matrisi ve kenar durumları tekrar başarılı. Çerez tercihi kalıcılığı bu taska eklenmedi; mevcut hukuk/izin işi ayrı kalır.

Geçici kanıt: `/tmp/xinobi-web01/results.json`, `catalog-{390,768,1440}.png`, `compare-{390,768,1440}.png`. Bu dosyalar Git'e eklenmedi; public katalog kopyası da commit edilmedi.

## TST-137 - Mevcut fixture regresyonları

Komut: `pnpm --filter web exec playwright test --config /tmp/xinobi-web01-playwright.config.cjs --grep 'katalog kategori|arama Escape|category URL'`.

**CHROME FIXTURE / E2E: 3 PASS / 0 FAIL.** `critical-interactions.spec.ts` içindeki arama Escape/dört ürün sınırı ve katalog filtre/sıralama; `ux-phases.spec.ts` içindeki kategori geçmişi/sepet rozeti/açık karşılaştırma seçimi. Geçici config mevcut 3000 web sunucusuna bağlandı; API veya yeni sunucu başlatmadı. Workers=1, viewport=390x900, testDir=`apps/web/tests/e2e`; yalnız bu iki spec seçildi. Gerçek hesap, ödeme veya sağlayıcı kabulü değildir.

## TST-138 - TypeScript

`pnpm --filter web exec tsc --noEmit`: **PASS**. Üretim derlemesindeki TypeScript adımı son kodda tekrar başarılı.

## TST-139 - ESLint

Değişen kaynak/test dosyaları için odaklı ESLint ve ardından `pnpm --filter web lint`: **PASS**. Suppression eklenmedi.

## TST-140 - Statik üretim derlemesi

`pnpm --filter web build`: **PASS**, Next.js 16.3.6 Turbopack, 38 statik sayfa. Arama Suspense sınırı ve q/category/sort istemci durumu export ile uyumlu. Derleme deploy değildir.

## TST-141 - Diff bütünlüğü

`git diff --check`: **PASS**. Generated output, bağımlılıklar, katalog/hesap verisi, sır ve geçici kanıtlar commit kapsamı dışındadır.

## Kapanış sınırı

WEB-01 yerel teknik kabul tamamlandı. CAT-01 veri/medya tamlığı, WEB-02 ürün detay kabulü, canlı kurulum ve iş sahibi UAT ayrı işlerdir. Tam API/Flutter veya bütün web E2E paketi çalıştırılmadı. SQL migration, sağlayıcı yazımı, gerçek AI üretimi, APK ve deploy yapılmadı.
