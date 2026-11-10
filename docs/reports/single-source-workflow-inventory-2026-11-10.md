# Tek kaynak iş akışı — belge ve araç uyumluluk envanteri

10.11.2026 · KIS-TEK-11. [Güncel giriş](../runbooks/single-source-personalization.md). İnceleme 2f3e431 task-10 tabanı üzerinde; gerçek kayıt yazılmadı.

## Çağıranlar ve kararlar

| Kaynak | Çağıran / kullanım | Karar ve sınır |
|---|---|---|
| `apps/admin/src/features/product-surfaces/mask-prompt.ts` | `MaskPrompt.tsx` → `SurfaceMasks.tsx`; tek kaynak revision/hash/gerçek boyut gönderir | Kullanılmayan color/variant prompt dalı kaldırıldı; sourceRevision zorunlu. Logo/parça/alfa talimatları korunur. Başka üretim çağıranı bulunmadı. |
| `tools/export-single-source-previews.mjs` | Açık ürün kimlikleriyle manuel salt okunur denetim; `.test.mjs` izole test | Güncel araç; dosya hash/boyut ve son onay kontrolü. JSON denetim manifestidir; fiziksel paket/onay/deploy değildir. |
| `tools/publish-product-previews.mjs` | `tools/dev-local.mjs`, `tools/package-iis-preview.mjs`, kendi `.test.mjs` | Kullanılıyor; silinmedi. Yalnız eski kabul edilmiş varyant fixture'larını statik dizine yazar. Yeni profile, kaynağa veya SKU'ya dönüştürmez. Eski working-copy resize kuralı yeni kaynak yüklemesine uygulanmaz. |
| `tools/import-xinobi-u-fixtures.cjs` | Taşınabilir eski fixture paketinin kontrollü kurulumu ve fixture testleri | Silinmedi; CLI kapsam uyarısı eklendi. Varsayılan dry-run korunur; `--apply` gerçek katalog geçişi için talimat değildir. Bu taskta import çalıştırılmadı. |
| `fixtures/product-surfaces/xinobi-u-accepted` | Publisher/importer ve eski regresyonlar | README tarihsel olarak işaretlendi; kimlik/hash/medya/manifest aynı kaldı. Yeni kabul kanıtı değildir. |
| `tools/start-xinobi-qa.cjs` | Eski D: QA ortamı, `tools/test-xinobi-qa.cjs`, checkpoint testleri | Silinmedi; CLI tarihsel kapsam uyarısı eklendi. Portlar, sağlayıcı opt-in ve dış istek sınırları değişmedi. Yeni standart başlatıcı `tools/start-local.mjs`. |
| `tools/local-mask-editor/*`, family-registry/alignment, mask-selection | Eski Node editör/QA, `test-family-mask-registry.cjs`, `test-family-mask-pilot.cjs`, `test-mask-selection.cjs`, checkpoint/readiness araçları | Bağımlılıklar mevcut: silinmedi veya yeni akışa bağlanmadı. README tarihsel. Bu kodların eski piksel/branding/geometry limitleri yeni kaynak gereksinimi değildir. |
| `tools/install-cm101-checkpoint.cjs`, `install-personalization-checkpoint.cjs` | Eski checkpoint/restore testleri ve D: QA fixture kurulumu | Geçmiş dosya bütünlüğü için korunur; yeni profil veya çoklu fotoğraf maskesi hazırlama yolu değildir. |
| `tools/test-guided-surface-admin.mjs` | Eski renk/toplu onay UI kabul aracı | Tarihsel; yeni task kabulünde çalıştırılmadı. Güncel alternatif `apps/admin/tests/single-source-mask.mjs`. |
| Eski varyant/API okuma rotaları | Schema-1/tarihsel bağlantı okuyucuları | Kendi kaydını okur; yeni ürüne yönlendirme yok. Rotalar silinmedi. Emekli maske/çoklu onay yazmaları 410; bu task yeniden açmaz. |
| Normal katalog medya/renk/HEX/SKU formları | Katalog, normal web/Flutter alışverişi | Korunur; tek kaynak fotoğraf seçimiyle karıştırılmaz. Ticari varyant fiyat/stok doğrulaması 09 rehberinde. |

Çağıran araştırması `rg` ile import/require, iş akışı/paket scriptleri ve doküman girişlerinde yapıldı. Kullanılmayan bir dal dışında kod/rota silinmedi; yalnız bir eski testin başarısız olması rota kaldırma gerekçesi sayılmadı.

## Belge kararları

Güncel kaynak yönetimi, maskeleme, yayın, web, Flutter, satın alma ve sipariş rehberleri ortak girişe bağlandı. Önceki teslimlerin “06–10 henüz açık”, “20 MP sabit sınır”, “ilk fotoğraflı varyant fallback” ve “09 ileride” anlatımları güncellendi. README yeni kullanıcıyı eski editöre yönlendirmiyor.

Fotoğraf üretim promptu, aile geometrisi/transferi, kontrollü çoklu maske seçimi, eğri/PNG denemesi, eski WebP varyant yükleme, katalog segmentation incelemesi ve eski alışveriş/önizleme belgeleri tarihsel olarak işaretlendi. Asıl içerik, eski test raporları, PDF'ler ve kabul dosyaları silinmedi. Tarihli faz günlükleri geçmiş kanıttır; yeni durum faz sonundaki 11 kaydıyla izlenir. ADR-005 hedef model kararıdır; alttaki tarihli 01–03 teslimleri tarihsel kalır, güncel giriş bağlantısı eklenir.

## Paylaşılan etkiler ve açık işler

Kaynak değiştirme onayı/açıklaması artık yeniden maske onayına kadar önizlemenin kapanacağını söyler. Maske onay başarısı yeni tasarımların güncel yüzeyi kullanacağını ve eski sipariş dosyalarının korunacağını açıklar; eski “mağazadaki önizleme değişmedi” mesajları kaldırıldı.

Prompt tipinin daraltılması yalnız güncel admin maskeleme çağıranını etkiler; API/TS-Dart wire sözleşmesi veya SQL DDL değişmez. Normal katalog görsel küçültücüsü/renkleri, fiyat/stok kaynağı, kargo ve ödeme entegrasyonları değişmedi. Kaynak/maske ve eski sipariş/tasarım baytları değiştirilmedi.

Task 12 birleşik kabul/regresyon ayrı kalır. Gerçek SKU/kaynak seçimi, 23 ürün içeriği, SKU 117 fiyatı; Android/iOS gerçek cihaz ve ekran okuyucu, SQL/IIS/restore kabulü açık. Sağlayıcı kargo hareketi veya canlı ödeme kabulü bu belge temizliğiyle kapanmaz. Deploy/release/APK yapılmadı.
