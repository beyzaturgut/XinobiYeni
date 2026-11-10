# Tek kaynak kişiselleştirme — güncel kullanım rehberi

10.11.2026 · KIS-TEK-11 · Yeni iş akışının giriş noktası. Teknik uygulama 03–11 ve 12 yazılımsal birleşik regresyon tamam; gerçek cihaz/SQL/IIS/iş sahibi kabulü ayrı açıktır. [Sonuçlar ve tekrar adımları](single-source-acceptance.md).

## Kaynağı ve maskeyi hazırlama

1. Admin → Katalog → **XINOBI U · Tek kaynak fotoğraf**: ürünü aç, bir fotoğrafı doğrudan yükle veya mevcut katalog medyasından açıkça seç ve kaydet. İlk renk fotoğrafı otomatik kaynak değildir. Normal katalog renklerini silme.
2. Ürünler → **Ürün yüzeyleri**: aynı ürünü aç; kaynak sürümünü ve gerçek genişlik/yüksekliği kontrol et. **Maskeleme için kaynak fotoğrafı indir** ile hash'i doğrulanan orijinal dosyayı indir. Ekran görüntüsü veya küçültülmüş tarayıcı önizlemesini kaynak olarak kullanma.
3. **Maskeleme promptu** metnini bu dosyayla birlikte kullan. Prompt gerçek kaynak boyutunu, SHA ve sürümü taşır. Fotoğraf üretme aşaması yoktur. Logo, kulp, metal, ayrık gövdeler ve şeffaflık talimatları korunur; renkler arası hizalama veya bir maskeyi başka fotoğraflara uygulama yoktur.
4. Aynı gerçek kaynak tuvalinde tek kareli, kayıpsız **WebP maske** yükle. Alfa veya siyah-beyaz modunu dosyaya göre seç. Kaynak ve maskeyi kırpma, esnetme veya standart 1333×2000 tuvale çevirme. Maskenin kendi kaynak koordinatlarıyla eşleşmesi zorunludur.
5. Taslağı pembe kaplama ve örnek desenle incele; logo, parçalar ve sınırları kontrol et. Doğrulanamayan önizlemeyi onaylama. Gerekirse taslağı WebP indir, düzelt ve yeniden yükle. **Taslağı onayla** yalnız bu ürünün güncel kaynak sürümünü onaylar.

Kaynak için sabit piksel/en-boy oranı şartı yoktur. Bu, sınırsız işlem kapasitesi anlamına gelmez: kaynak 25 MB, yüklenen WebP maske 8 MB; geçici işlem RAM bütçesi `ProductSurfaces:MaskProcessingMemoryMiB` varsayılan 512 MiB, yapılandırma aralığı 16–1024 MiB ve 16 bayt/piksel hesabıdır. Kapasite aşımı 413 ile açıklanır; otomatik küçültme yapılmaz. Kaynak PNG/JPEG/tek kareli WebP olabilir. AI çıktısının boyutu ve gerçek sınır kalitesi ayrıca kontrol edilir; başarılı dosya aktarımı görsel kabul değildir.

## Tasarım, satış ve sipariş

Katalogdaki **Kişiselleştirme satış SKU’su** gerçek fiziksel ürüne işletme tarafından açıkça eşlenir. Bu ticari bağ görsel renk seçimi değildir. Fiyat/stok mevcut katalogdan doğrulanır; eksik fiyat başka renkten alınmaz. Onaylı kaynak/maskeyle web veya Flutter'da görsel yükleme ve AI desen üretimi devam eder. Kaldırılan özellik ürün fotoğrafı üretim promptudur; müşterinin AI desen üretimi korunur.

Yerleşim kaydı yüzey/SKU/revizyon bağıyla saklanır; kaynak değişiminde yeniden yerleştirme gerekir. Sipariş detayında kayıtlı yerleşim ve üç ayrı dosya bulunur: **desen**, **maskelemede kullanılan kaynak ürün fotoğrafı**, **giydirilmiş temsilî önizleme**. İkinci dosya alfa maskesi değildir. Eski sipariş dosyaları güncel katalogdan yeniden üretilmez; eksik dosya başka görselle doldurulmaz. Üretime hazırlama, baskıya gönderme veya sevk operasyonu bu akışa eklenmez.

## Ayrıntılar ve geçerli araçlar

| İhtiyaç | Güncel kaynak |
|---|---|
| Kaynak seçimi, revizyon, yetki ve kayıt koruması | [Kaynak yönetimi](personalization-source-management.md) |
| Maske yükleme, prompt, taslak ve onay | [Tek kaynak maskeleme](single-source-masking.md) |
| API, kapasite, onay geri alma ve sürümlü medya | [Yayın sözleşmesi](single-source-publication.md) |
| Web / Flutter | [Web](single-source-web.md), [Flutter](single-source-mobile.md) |
| Ticari SKU, kayıt, favori, sepet, checkout | [Satın alma bağı](single-source-design-checkout.md) |
| Yerleşim ve üç değişmez dosya | [Sipariş dosyaları](single-source-order-files.md) |
| Araç / tarihsel belge / çağıran envanteri | [Araç uyumluluk envanteri](../reports/single-source-workflow-inventory-2026-11-10.md) |
| Veri geçişi, dry-run, yedek/geri dönüş | [Geçiş planı](../reports/personalization-migration-plan-2026-11-06.md) |
| Task sırası ve kapanış koşulları | [Task planı](../tasks/personalization-single-source-tasks-2026-11-06.md) |

Yerel standart başlatıcı `node tools/start-local.mjs` (web 3000, admin 5173, API 5003). Port doluysa bilinmeyen süreçleri sonlandırma. Eski D: QA/3046 editör zinciri yeni tek kaynak ortamının başlatıcısı değildir.

Onaylı yüzeyi salt okunur denetlemek için repo kökünden, yalnız seçilmiş ürünlerle:

```sh
node tools/export-single-source-previews.mjs http://localhost:5003 /tmp/single-source-audit.json URUN-ID
```

Bu araç hash/boyut/son onayı doğrular; katalog, fiyat, stok veya dosyaları değiştirmez. Çıktı medya paketi, onay verme veya deploy işlemi değildir; güncel API otorite kalır. Eksik yüzeyde eski varyant paketine düşmez.

## Hata ve geçmiş politikası

Kaynak yoksa fotoğraf seç; onay yoksa bu kaynağa maske hazırla. 409 kaynak/sürüm çakışmasında güncel kaydı incele; kör tekrar veya başka renge geçiş yapma. 401/403 için yetkili oturum gerekir; 404 eksik/onaysız kaynak, 503 servis/dosya bütünlüğü ayrı görünür. Kayıt hatasında taslak korunur; sunucu doğrulamadan başarı yoktur.

Eski varyant okuma rotaları yalnız kendi tarihsel kayıtlarını okur. Eski maske ve toplu onay yazma rotaları yetki kontrolünden sonra 410 döner. Eski test raporları ve fixture'lar tarihsel kanıttır; yeni akışın kabulü sayılmaz. Schema-1 tasarımların okunabilirliği yeni yüzeyde düzenleme hakkı değildir; kontrollü yeni yerleşim gerekir.

## Kapsam ve açık kabul

Normal katalog renk/HEX/galeri araçları korunur. Ticari SKU, fiyat/stok ve normal alışveriş davranışları değişmez. Kargo entegrasyonu, sağlayıcı test/canlı ayarları ve ödeme bu taskta değiştirilmez. 23 ürün içeriği ve SKU 117 fiyatı açık kalır.

Gerçek kaynak/SKU seçimi ve veri taşıma yapılmadı. [Task 12 yazılımsal birleşik regresyonu](single-source-acceptance.md) tamamlandı; Android/iOS gerçek cihaz, VoiceOver/TalkBack, SQL çoklu süreç/IIS, yedek/restore ve iş sahibi kabulü ayrı izlenir. Otomatik test bunların yerine geçmez. Deploy, release veya APK bu task kapsamında değildir.
