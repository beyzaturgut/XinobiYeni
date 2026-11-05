# TST-255 | Yayın öncesi birleşik regresyon ve teknik kontroller

05.11.2026. Başlangıç main/d5eeb41 temiz. Kapsam admin giriş/yetki, sipariş detayları, tasarım dosyaları ve Sürat akışları ile web sipariş/tasarım/takip. Uygulama kodunda yeni kusur bulunmadı; yeni admin giriş/MFA regresyonu eklendi. Gerçek hesap, sipariş, ödeme, katalog ve sağlayıcı kaydı değiştirilmedi. Release paketi/yayını, IIS deploy veya APK üretilmedi.

## Sonuç matrisi

| Kontrol | Komut / ortam | Sonuç |
|---|---|---|
| Tam API regresyonu | dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false --verbosity quiet | 595 PASS / 29 SKIP / 0 FAIL; 624 toplam |
| API üretim | dotnet build services/api/Xinobi.Api.csproj --configuration Release --no-restore -m:1 -p:UseSharedCompilation=false | 0 uyarı / 0 hata |
| Admin lint | pnpm --filter admin lint | 0 hata; 4 önceki AuditHistory/SurfaceMasks effect uyarısı |
| Admin tip/üretim build | pnpm --filter admin build | TypeScript + Vite PASS |
| Admin tüm izole testler | pnpm --filter admin test:isolated | 21/21 dosya PASS, 0 FAIL. Çalıştırıcı başladığında yeni admin-login henüz eklenmemişti; onun kanıtı aşağıda ayrıca. |
| Admin yayın profili | VITE_COMMERCE_API_URL=/api/v1/local-commerce ile vite build --base=/admin/ | PASS; mevcut package-admin-iis sözleşmesi, ayrı loopback preview 5176/admin |
| Üretim admin giriş/MFA | admin-login.mjs, isolated-browser guard, derlenmiş yayın profili | PASS: anonim engeli, login 403, parola tek başına içeri almaz, yanlış MFA içeri almaz, doğru MFA ile sınırlı rol, logout |
| Web lint | pnpm --filter web lint | PASS, çıktı yalnız eslint komutu |
| Web üretim kodunda tarayıcı testleri | pnpm --filter web test:e2e -- design-configuration.spec.ts order-product-preview.spec.ts surat-tracking.spec.ts | 24/24 PASS. 18 tasarım/revizyon, 4 sipariş kompozisyon/zoom ve 2 takip senaryosu |
| Web gerçek yayın profili | Mevcut IIS paketleyicisinin aynı-origin /api yolları; katalog /api/v1/catalog/storefront; DEV_SURFACE_BRIDGE=0; pnpm --filter web build | PASS; static export. Paketleme aracı çalıştırılmadı, yerel medya/katalog arşivi değiştirilmedi. |
| Web tip kontrolü | pnpm --filter web exec tsc --noEmit | PASS |
| Repo/release araçları | git diff --check; node --check tools/publish-release.mjs; node --check tools/package-release.mjs | PASS; yayın araçları mostidea/xinobi_new hedefli |

## Birlikte doğrulanan akışlar

- API tam paketi AdminMfaTests/AuthorizationTests ve admin sipariş/izin testlerini; OrderDesignSnapshotTests ile sipariş/satır/revizyon/üç dosya/hash ve yetkisiz erişimi; Surat kayıt/idempotency/restart/mutabakat/iptal/diagnostic/takip testlerini içerir. Taşıyıcı fake handler, gerçek shipment yazımı yok.
- Admin genel paketi durum/izin, taslak ve kritik onay, mükerrer işlem kilidi, 21 dosya hata senaryosu, legacy ve kaynak/checksum; responsive 320/390/768/1440 ve %200 metin ile klavye/axe kontrollerini içerir.
- Web e2e ayrı API 5023, export sunucusu 3010 ve test veri klasörünü kullanır; Sürat Enabled/PollingEnabled=false, hesap ve feature depoları File olarak process ortamıyla seçildi. E2E sunucusu yazmayı reddeder; müşteri işlemleri fixture yanıtlarıyla. Normal yerel API ayarı değiştirilmedi.
- Next.js 16.3.6 yerel Playwright dokümanı okundu; tarayıcı testi dev yerine build edilmiş UI üzerinde. E2E test köprülü build'i sonradan köprüsüz gerçek yayın profili build'iyle ayrıca doğrulandı.
- Geçmiş rapordaki kararsız pattern/canvas testi bu koşuda geçti; eski başarısızlık bu yeni koşuya taşınmadı, test kapatılmadı veya atlanmadı.

## Giriş testinin ilk denemeleri ve düzeltilen önkoşul

İlk deneme varsayılan admin build'inde başarısız oldu; bu standalone build'de VITE_COMMERCE_API_URL tanımlı değildi. Gerçek paketleyici bunu zaten /api/v1/local-commerce olarak veriyor. Test gerçek yayın parametreleriyle tekrarlandı; uygulama ayarı sessizce uydurulmadı. Yeni test ilk genel alert yerine spesifik giriş 403 yanıtını bekleyecek şekilde de düzeltildi. Nihai üretim/MFA koşusu PASS. Gerçek parola/e-posta/MFA gönderimi yapılmadı.

## Atlanan testler ve kabul sınırı

29 atlama başarılı test sayılmaz. Kaynaklarda SQL opt-in koşulları (izole/boş veritabanı; gerçek yerel credentials okunmaz), onaylı CM101 kaynak görseli ve etkileşimli/harici ortam gereksinimleri bulunuyor. Özellikle admin order/design SQL testleri ve hesap/katalog SQL entegrasyonları bu yerel kabulde kanıtlanmadı. SQL JSON roundtrip/file-store restart gerçek SQL çoklu süreç kabulü değildir.

## Açık bağımlılıklar ve yayın kararı

| Açık / sorumlu | Etki ve kapanış koşulu |
|---|---|
| Sürat / proje yöneticisi: belirsiz 3 test referansı | Sağlayıcı her referansın kaydını teyit etmeden yeniden write yok. Son HTTP200/Sipariş bulunamadı kayıt yokluğu kanıtı değil. Düzeltilmiş wire ve diagnostic testleri gerçek kabul değil. |
| Sürat / operasyon: prova create→etiket→şube kabulü→takip ve onaylı canlı etiket | Canlı Sürat açılışını engeller; gerçek kayıt ve fiziksel barkod/şube kabul kanıtı gerekir. |
| Ticari akış: gerçek ödeme/sevke uygunluk | Production create kod koruması devam eder; sadece AllowProduction ile açılmaz. Demo ödeme gerçek tahsilat değil. |
| DBA/test ortamı: izole SQL restart/çoklu API | Sipariş snapshot ve gönderi claim/iptal yarışını ayrı gerçek SQL ortamında doğrulama gerekir. |
| Sunucu yöneticisi: IIS, HTTPS/same-origin/cookie ve gerçek SMTP/MFA | Yayın sonrası/uygun staging üzerinde gerçek hesap login-MFA-logout, yetkisiz ret, üç indirme, API readiness doğrulanmalı. Mock mail gerçek teslimat kanıtı değildir. |
| Sunucu yöneticisi: yeni GitHub repo | Sunucudaki deploy-release.ps1 yeni repo sürümüyle güncellenmeli; Contents:read token mostidea/xinobi_new erişimli olmalı. Eski release assetleri otomatik taşınmadı. |
| Sunucu yöneticisi: yedek, ayarlar ve geri dönüş | Veritabanı yedeği; dış ayar/medya yolları; migration değerlendirmesi ve dosya rollback önkoşulları mevcut runbook'a göre. Bu görevde schema/app kodu değişmedi. |
| QA/PM: gerçek cihaz, ekran okuyucu, görsel ve operasyon kabulü | Sentetik Chrome/axe yerine ayrı manuel tutanak gerekir. |

Yerel teknik kontrollerde açık başarısız test yok. Bu, koşulsuz canlıya hazır veya deploy tamamlandı onayı değildir. Mevcut korumalarla release hazırlığı yapılabilir; canlı Sürat gönderimini açma kararı dış kabuller kapanana kadar verilmez. Yeni deployment workflow/hosting değişikliği yapılmadı.
