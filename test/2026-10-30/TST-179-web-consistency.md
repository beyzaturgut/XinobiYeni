# TST-179–187 — Web görsel/durum tutarlılığı, 30.10.2026

Başlangıç `main / 632bf38`, temiz worktree. Yalnız web + belge/test değişikliği. Gerçek katalog yalnız GET; hesap/sipariş/sağlayıcı yazmaları fixture ile izole. Admin/Flutter/API/hosting/deploy/APK çalıştırılmadı. Geliştirme servisleri mevcut yerel servislerdir.

[Ekran bazında 33 rota / kusur ve bağımlılık matrisi](../../design/web-consistency-audit-2026-10-30.md).

| ID | Kontrol | Sonuç |
|---|---|---|
| TST-179 | Envanter, AGENTS/faz/tasarım/Next16.3.6 yerel doküman ve diff inceleme | PASS; 33 page.tsx, modal ve parametreli akışlar ayrıca ayrıldı |
| TST-180 | 4 genişlik × 33 rota × normal/%200 metin; 390px axe | PASS; 264 kontrol, 33 axe taramasında critical/serious yok |
| TST-181 | İzole hata/boş/yüklenme/retry/taslak/modal/AI/upload/Nobi | PASS; yeni test dosyası 19/19 (matris dahil) |
| TST-182 | Mevcut regresyon + yeni testler tam paket | PASS; **97/97**, tek worker, 4.4 dakika |
| TST-183 | Web TypeScript ve lint | PASS; `pnpm --filter web exec tsc --noEmit`, `pnpm --filter web lint` |
| TST-184 | Web production build | PASS; `pnpm --filter web build`, Next16.3.6, 38/38 statik çıktı |
| TST-185 | Görsel inceleme | PASS; 390/1440 tüm rota görüntüleri altı temas sayfasında + ürün/upload/AI özeti tam boy incelendi |
| TST-186 | Gerçek yerel katalog salt okunur | PASS; 390/768/1440, 24 aktif ürün, 8 kategori; sentetik loading/empty/outage/removed/persistence senaryoları |
| TST-187 | Doküman bağlantıları, 120 task korunması, diff/upstream | PASS; yerel bağlantılar ve 120 benzersiz ID; diff temiz; fetch sonrası upstream 0/0 |

Son temiz tam tekrar: `/tmp/xinobi-web-consistency-complete.log`, **97 passed (4.4m)**. Bu tekrar AI reflow ve son Nobi/iade/katalog düzeltmelerinin tamamını içerir; önceki başarısız denemeler aşağıda korunmuştur.

## Tekrarlama

Repo kökünden, mevcut web 3000 portunda açıkken:

```sh
WEB_CONSISTENCY_OUTPUT=/tmp/xinobi-web-consistency-complete pnpm --filter web exec playwright test --config tests/playwright.consistency.config.ts
pnpm --filter web exec tsc --noEmit
pnpm --filter web lint
pnpm --filter web build
```

Test config kendi API/admin başlatmaz; mevcut localhost webi kullanır, bir worker ve sistem Chrome ile çalışır. Build tarayıcı testlerinden ayrı yürütülür. Fixture yanıtları gerçek kayıtları değiştirmez. Ürün/maske referans testinde yalnız depodaki public varlık byte’ları ve hashleri kullanılır; CORS izni yalnız fixture yanıtındadır.

## İlk başarısızlıklar ve tekrarlar

Başarısız denemeler başarı olarak sayılmadı:

- İlk matris 2/4: 320/390 uzun değerlendirme başlığı ve 320 editör hata başlığı taştı. Grid/header ve ortak h1/skip-link reflow sonrası tüm 4 matris geçti.
- İlk durum testi 3/4: native dialog tek başına son Tab’da odağı doküman dışına bırakıyordu. Sınır odak döngüsü eklendi; tekrar 4/4.
- İlk ek upload denemesinde fixture shared-medya URL’si yanlış API köküyle 404 verdi. İzole medya alias/hash düzeltildi; canvas ve yerleşim geçti. Bir sonraki denemede fixture auth refresh POST’u yanlışlıkla “yazma” diye sayan assertion düzeltildi; tasarım/üretim/sipariş POST yasağı korundu.
- Ara tam paket 60 başarılı/8 başarısız: slider testleri geliştiricinin gerçek slide verisine bağlıydı; preview testi gerçek development bridge’e bağlıydı; 320 başlık taşması da vardı. Testler açık fixture’a alındı, beklentiler azaltılmadı. Sonraki paket 72/73; tek uzun editör başlığı ortak h1 ile düzeltildi.
- Ara 92 test paketi 91 başarılı/1 başarısız: etkin AI sorularında %200 metin taşması. Soru seçenek/özet grid ve aksiyon reflow düzeltildi. Yeni test dosyasının son tekrarı 19/19 başarılı. Tanılama assertion’ı sayfa dışındaki gizli menü elemanlarını overflow saymayacak şekilde sayfa scrollWidth sonucunu kullanır.
- Önceki tam paket ve opsiyonel gerçek WEB02 scripti testler bittikten/Chrome kapandıktan sonra CLI seviyesinde bekledi; yalnız ilgili test processlerine SIGINT gönderildi. Tam paket sonucu 91/1 olarak korundu. Gerçek WEB02 denemesi sadece ilk 390px görüntüsünü üretti, sonuç JSON’u üretmedi: **tamamlanmadı**, PASS değildir. Önceki tarihli WEB02 237 kontrol kanıtının yerine bu deneme yazılmadı. Bu görevin ürün hata/stok/fiyat testleri son fixture regresyonunda ve gerçek katalog gezinmesi ayrı TST-186’da doğrulanır.
- Ara TypeScript/ESLint: adres cancel callback, JSX parantezi, eksik fixture importu ve test any tipi düzeltildi. Son tsc/lint ve production build başarılı.

Yerel tam günlükler `/tmp/xinobi-web-*` altında; geçici çıktılar commit edilmez. Son yeni paket: `/tmp/xinobi-web-final-new.log` (19 passed, 2.0m). Derleme: `/tmp/xinobi-web-consistency-build.log`; lint: `/tmp/xinobi-web-consistency-lint-final.log`. Gerçek katalog: `/tmp/xinobi-consistency-real-catalog/results.json`.

[Kalıcı makine okunur matris](web-consistency/matrix.json): 33 rota × dört genişlik, normal/%200 scrollWidth sonucu ve 390px ciddi/kritik axe sonucu.

## Kalıcı temsili görseller

Tamamı izole test verisidir; mock fiyat/hesap gerçek müşteri verisi değildir.

- [Ana sayfa 1440](web-consistency/home-1440.png)
- [Adresler 390](web-consistency/addresses-390.png)
- [Değerlendirmeler 390](web-consistency/reviews-390.png)
- [Sepet 390](web-consistency/basket-390.png)
- [Ürün 390](web-consistency/product-390.png)
- [Yüklenen görsel yerleşimi 390](web-consistency/uploaded-placement-390.png)
- [AI özeti %200 metin](web-consistency/questionnaire-summary-text200.png)
- [Fixture AI sonuç](web-consistency/ai-result-fixture-390.png)

## Kabul sınırları

Hesaplanmış font boyutlarının ikiye katlanması gerçek browser zoom/OS ölçeği değildir. Chrome/axe/klavye otomasyonu fiziksel cihaz veya VoiceOver/TalkBack kabulü değildir. Parametresiz preview/mask test sayfaları gerçek aktif üretim olarak sunulmaz. Onaylı yasal metin, 23 ürün içeriği ve SKU117 fiyatı, gerçek sağlayıcı/SQL/ödeme/e-posta/SMS UAT, baskı numunesi ve Creative/UX/PM kabulü açık. Faz durumu/onayı yapay biçimde kapatılmadı.
