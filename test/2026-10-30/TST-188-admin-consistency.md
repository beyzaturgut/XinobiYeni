# TST-188–195 — Admin görsel/durum tutarlılığı, 30.10.2026

Kaynak başlangıç: temiz `main / 6a48a3c`. Yalnız admin kaynakları, izole testler ve belgeler. Kullanıcıya ait değişiklik yoktu. Gerçek SQL/katalog/hesap/sipariş/maske/sağlayıcı kaydı değiştirilmedi; test API trafiği intercept edilir. Web/Flutter/API/deploy/hosting/APK kapsam dışı. Vite dev5173 mevcut; üretilen admin çıktısını izole test etmek için preview5174 açıldı. Preview auth gate kapatılmadı.

[Modül matrisi, kusur ve açık işler](../../design/admin-consistency-audit-2026-10-30.md).

| ID | Kontrol | Sonuç |
|---|---|---|
| TST-188 | 16 modül ×4 genişlik ×normal/%200 hesaplanmış metin; 390px axe | PASS; 128 görünüm, 16 taramada critical/serious bulgu yok |
| TST-189 | 48 boş503/403 giriş durumu + 15 odaklı işlem/klavye/yetki senaryosu | PASS; servis kullanan 14 modülde hata alert; kaynak bekleyen ayar/entegrasyon ayrı |
| TST-190 | Mevcut 15 browser regresyon scripti | PASS; ilk başarısızlıklar/düzeltmeler ve kapsam aşağıda; tek bir test sayısına çevrilmedi |
| TST-191 | Ortak admin-request regresyonu | PASS; staff-only/single-flight refresh, late401, bounded retry,401/403/404/409/503, multipart/204 |
| TST-192 | TypeScript/Vite production build | PASS; `tsc -b && vite build`, Vite8.3.1,65 modül |
| TST-193 | Admin lint | PASS exit0 / 0 error; aynı5 mevcut warning aşağıda |
| TST-194 | Görsel inceleme | PASS;390/1440 16 modül dört temas sayfası ve temsili tam boy görseller; kısa yükseklik ayrı navigasyon testi |
| TST-195 | Bağlantı/task/diff/upstream | PASS; yerel link/task kontrolü, diff temiz; fetch sonrası upstream0/0 |

## Komutlar

```sh
ADMIN_UI_URL=http://127.0.0.1:5173/ node apps/admin/tests/admin-consistency.mjs
ADMIN_UI_URL=http://127.0.0.1:5173/ node apps/admin/tests/admin-consistency-states.mjs
node apps/admin/tests/admin-request.mjs
pnpm --filter admin lint
VITE_COMMERCE_API_URL=http://127.0.0.1:5003/api/v1/local-commerce pnpm --filter admin build
# Derlenen admin çıktısında da auth açık, bütün API yanıtları fixture:
pnpm --filter admin exec vite preview --host 127.0.0.1 --port 5174 --strictPort
ADMIN_UI_URL=http://127.0.0.1:5174/ node apps/admin/tests/navigation-ui.mjs
```

Üretim derleme komutundaki loopback API adresi yalnız yerel test çıktısı içindir; deployment paketi/yayın üretilmedi. Lint mevcut uyarıları: AdminAccess render Date.now (purity), AuditHistory effect setState, SurfaceMasks liste/ilk detay/canvas effect setState (3). Kural bastırma eklenmedi. Bunlar başarısız iş verisi veya gerçek cihaz kabulü değildir.

Ek `apps/admin/tests/print-profiles.mjs`: 1440/768/390 profil kaydı/çakışma/taslak/kanıt ve print.read izin kontrolü PASS.

Mevcut browser scriptleri: `admin-operation-results`, `price-results`, `admin-write-permissions`, `admin-data-honesty`, `dashboard-summary`, `catalog-source-states`, `navigation-ui`; tools altında `test-admin-review-reply` (8 senaryo), `test-admin-order-states` (15), `test-admin-notification-states` (18), `test-admin-ai-states` (29), `test-admin-quote-list-states` (26), `test-admin-customer-read`, `test-admin-print-source-state` (38). İlgili `ADMIN_UI_URL`, `REVIEW_UI_ORIGIN`, `ORDER_UI_ORIGIN`, `NOTIFICATION_UI_ORIGIN`, `AI_UI_ORIGIN`, `QUOTE_UI_ORIGIN`, `CRM_UI_ORIGIN`, `PRINT_UI_ORIGIN` değişkenleri5174'e ayarlandı. Hepsi izole fixture; bu sayılar gerçek iş kabulü değildir.

## Başarısız ilk denemeler ve düzeltmeler

- İlk yeni axe scripti `browser.newPage()` için “Please use browser.newContext” hatası verdi; açık context/newPage/close düzeltildi. Test harness hatasıdır.
- İlk tamamlanmış matris 4 bulgu: stok formu320px %200 font taşması; sipariş/teklif alt yazıları ve slider sıra/alt yazı kontrastı. Fieldset/form reflow ve #616161 alt yazıyla sonraki tüm128 görünüm/16axe geçti.
- İlk yeni durum denemesinde katalog ID hücresi yanlış `cell` rolüyle aranıyordu; `rowheader` olarak düzeltildi. Sonraki denemede entegrasyon status locator’ı ortak header status ile çakıştı; uzlaştırma alanına scope verildi. Beklentiler azaltılmadı. Son tam dosya **15 senaryo PASS**.
- Eski navigasyon testi15 modül bekliyordu; var olan Müşteriler ekranı,13 üst/3 yan sahip ve16 hedefle düzeltildi. Sipariş okuma fixture’ı503 dönerken başarı metni bekliyordu; açık orders/order-options fixture eklendi. ArrowRight beklentisi eski sabit sıraydı; merkezi topNavigation sırasından hesaplandı.
- Eski yorum testinin başarısız yazmadan sonra formu gizleme beklentisi bu görevin taslak koruma davranışına aykırıydı. Alan görünürlüğü, korunan yanıt/ret notu ve doğrudan tekrar gönderim payload’ı doğrulanacak şekilde güncellendi;8 senaryo geçti.
- Eski baskı kaynak testi yeni print-profiles GET sözleşmesini tanımıyordu. İzole boş profil fixture’ı eklendi;38 senaryo geçti.
- Navigasyon testi768×400'de yan menü wheel kontrolünde başarısız oldu. Tanılama: yapışkan üst menü253px, yan menü yalnız87px; wheel köke gidiyordu. Kısa yükseklikte üst menü normal sayfa akışına alındı, yan menüye viewport-24px ayrıldı. Test yeni davranışta header static, sınırlı yan menü ve her bağlantının klavye odağıyla viewport içinde kalmasını doğrular. Son navigasyon tekrarı1440/1280/768/390 PASS. Normal yükseklikte sticky kontrolü korunur.
- İlk otomatik TableRegion dönüşümü AI bölümündeki kapanış biçimine takıldı; dosya bazındaki dönüşüm düzeltildi. Son TypeScript/build başarılı; yarım JSX bırakılmadı.

Son ham günlükler: `/tmp/xinobi-admin-consistency-release.log`, `/tmp/xinobi-admin-state-release.log`, `/tmp/xinobi-admin-navigation-verified.log`, `/tmp/xinobi-admin-regressions.log`, `/tmp/xinobi-admin-regressions-repeat.log`; ilk hatalar `/tmp/xinobi-admin-consistency-scan`, `/tmp/xinobi-admin-state-first.log`, `/tmp/xinobi-admin-state-repeat.log` içinde korunur. Günlükler secrets/gerçek kayıt içermez; geçici çıktılar commit edilmez.

Son matris tekrarı referans görüntülerini depodaki public varlık byte’larından sunar; web mağazası servisinin açık olmasına bağlı değildir. İlk fixture’daki bulunamayan görüntü yolu giderildi; son içerik görseli ayrıca incelendi. Gizli skip-link, metin sarıldığında da ekran dışında kalacak şekilde kendi yüksekliğiyle taşınır.

## Kalıcı kanıt ve kabul sınırı

[128 görünüm ve48 durum makine okunur matris](admin-consistency/matrix.json) · [15 odaklı sonuç](admin-consistency/states.json) · [Regresyon özeti](admin-consistency/regressions.json).

- [Katalog390](admin-consistency/catalog-390.png)
- [İçerik390](admin-consistency/content-390.png)
- [Stok390](admin-consistency/inventory-390.png)
- [Sipariş1440](admin-consistency/orders-1440.png)
- [Yüzey390](admin-consistency/surfaces-390.png)
- [Yorum390](admin-consistency/reviews-390.png)
- [Başarısız yorum kaydı390](admin-consistency/review-failure-390.png)

Görseller fixture verisidir. %200 hesaplanmış font gerçek browser zoom/OS ölçeği değildir; axe/Chrome otomasyonu gerçek VoiceOver/TalkBack/Safari/telefon kabulü değildir. Global route-leave taslak/toplu işlem politikası, müşteri ürün içeriği/fiyatı, eksik backend sözleşmeleri, gerçek rol/SQL/operasyon/sağlayıcı/baskı/handoff kabulü açık. ADM-08 kısmen yapıldı; resmi faz/rol/PM kapanışı verilmedi.
