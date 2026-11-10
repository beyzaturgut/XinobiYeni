# TST-270 — Katalogdaki iptal edilen tek kaynak bölümünün kaldırılması

10.11.2026 · Taban `00a794e`. [Kapsam kararı](../../docs/decisions/catalog-source-section-removal-2026-11-10.md).

## Değişiklik

Katalogdaki **XINOBI U · Tek kaynak fotoğraf** bölümü, onu içe aktaran/render eden satırlar ve yalnız bu bölümün kullandığı PersonalizationSource, FulfillmentBinding ve CSS kaldırıldı. `rg` çağıran taraması sonrası bu modüllere başka uygulama bağımlılığı bulunmadı. Kaldırılan bölümün eski tarayıcı testi yeni yokluk/normal katalog regresyonuyla değiştirildi. Maske ekranının iptal edilen alana yönlendiren metni ve katalog bağlantısı temizlendi.

Bölümle birlikte içindeki fotoğraf seçme/yükleme ve ticari SKU eşleme kontrolleri de artık katalogda görünmez. Yerine yeni yönetim yolu eklenmedi. Bu, tüm backend tek kaynak modelini kaldırma veya veri silme değildir; mevcut profil/kaynak/maske/SKU bağları/tasarım/sipariş dosyaları korunur. API/SQL/TS/Dart, web/Flutter ve kargo/ödeme değiştirilmedi.

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| Admin lint | PASS, sıfır hata; mevcut AuditHistory react(set-state-in-effect) uyarısı aynı |
| Admin TypeScript + Vite üretim derlemesi | PASS |
| `catalog-source-section-removed.mjs` | PASS 390/1440: bölüm ve kaynak yükleme alanı yok; kaynak/fulfillment API isteği veya yazma yok; normal ürün/kategori ve Medya diyaloğu var; sayfa taşması yok |
| `catalog-source-states.mjs` | PASS 1280/768/390: dört modülde 503/403/bağlantı ile boş 200 ayrımı; retry, stok sekmeleri ve kampanya kaynağı/tarih |
| `single-source-mask.mjs` | PASS: mevcut kayıtlı kaynakta maske/prompt/indir/onay ve hata/yetki/duyarlı görünüm/axe; kaldırılan kaynak alanına bağımlı değil |
| Yerel tarayıcı gözlemi | Gerçek yerel admin katalog sayfası açıldı: 17 ürün, normal filtre/ürün/kategori düğmeleri ve tablo var; iptal edilen bölüm yok |
| Görsel inceleme | `/tmp/xinobi-catalog-source-removed/catalog-1440.png` incelendi; filtrelerden sonra sonuç sayısı ve tablo gelir. Görsel sentetik test fixture'ıdır. |

Tarayıcı testleri `--import ./apps/admin/tests/helpers/isolated-browser.mjs` ve mockPanel ile çalışır; gerçek katalog/SQL/hesap/sipariş dosyalarına yazma yapılmadı. Yerel açık panel salt okunur gözlemlendi. Geçici süperadmin/çevrimdışı yapılandırma ve credential dosyaları ignore altında kaldı; commit edilmez.

Loglar: `/tmp/catalog-source-removal-lint.log`, `/tmp/catalog-source-removal-build.log`, `/tmp/catalog-source-removal-browser.log`, `/tmp/catalog-source-removal-states.log`, `/tmp/catalog-source-removal-mask.log`. Önceki TST-269 sayıları bu teslimin yeni test sonucu olarak sayılmadı; bu admin değişikliğinde API/Flutter/web paketleri tekrar çalıştırılmadı.

Önceki kaynak formunu anlatan 03/04/09 rehber ve test teslimleri tarihsel olarak işaretlendi; yeni kapsam kullanıcı kararıyla üstün gelir. Gerçek veri silme/geçişi, alternatif kaynak/SKU ekranı, hosting/deploy/release/APK yok.
