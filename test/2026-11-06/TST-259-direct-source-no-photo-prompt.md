# TST-259 — KIS-TEK-04: doğrudan kaynak yükleme, fotoğraf üretim promptunu kaldırma

06.11.2026 · Task 04 tamam. [Güncel kullanım](../../docs/runbooks/personalization-source-management.md).

## Değişiklik

Katalog ana ekranındaki ve ürün düzenleme/Medya sekmesindeki fotoğraf üretim/kopyalama girişleri kaldırıldı. Kullanılmayan CatalogPhotoPrompt.tsx, catalog-photo-prompt.ts ve ilgili CSS silindi. MASTER, çoklu renk/HEX üzerinden fotoğraf üretme ve sabit 1333×2000 tuval kuralları uygulama kodunda kalmadı. Eski fotoğraf üretim runbook’u tarihsel olarak işaretlendi; eski kayıt/test kanıtı silinmedi.

Task 03’te eklenen bağımsız tek kaynak alanı kullanılır. Kaynak yükleyici normal katalog görsel küçültücüsünü kullanmaz; mevcut piksel ölçüsü ve baytlar korunur. Kaynak değişti diye normal katalog renkleri, fiyat/stok veya eski sipariş dosyaları güncellenmez. Mevcut PNG/JPEG/WebP ve 25 MB dosya sınırı sürer; sabit çözünürlük/en-boy oranı şartı değildir.

Maskeleme promptu (MaskPrompt.tsx, mask-prompt.ts) ve kaynak checksum modülü bu değişiklikte aynen korundu. Yeni profil kaynağına maske promptu/tek maske onayı bağlantısı ile eski toplu renk onayının kaldırılması task 05/06’da açık; bu teslimde yapılmış gibi sayılmadı.

## Doğrulama

- Genişletilen personalization-source.mjs: ana katalog ve Medya sekmesinde fotoğraf üretim promptu yok; orijinal ürün medyası alanı mevcut. Tüm API/medya istekleri sentetik fixture ile karşılandı.
- Multipart yüklemede gerçek dosya bölümü çıkarıldı ve orijinal PNG baytlarıyla birebir karşılaştırıldı. İndirilen dosya da birebir karşılaştırıldı.
- 5001×3730 PNG test dosyası (repodaki maske fixture’ı yalnız medya test girdisi olarak): kaynağı yükle → kaydet → indir; ham bayt eşliği PASS. Görselin testte maske PNG’si olması onaylı bir ürün fotoğrafı/katalog kaydı üretildiği anlamına gelmez. Bu ölçü normal katalog küçültme eşiğinden büyüktür.
- Yüklenme, none, hata/403/bozuk payload, stale, başarısız kayıt sonrası seçim korunumu, dirty/busy/onay, kaynak indirme ve readonly senaryoları PASS.
- 320/390/768/1440 px ve kaynak alanında %200 metin PASS; klavye odağı ve yeni alan axe kritik/ciddi 0. Gerçek cihaz veya ekran okuyucu kabulü değildir.
- catalog-source-states.mjs: dört genişlikte katalog/stok/fiyat/içerik hata/yetki/ağ kesintisi/boş sonuç ayrımı ve normal ekran davranışları PASS.
- PersonalizationSourceTests: 6 PASS, 0 SKIP/FAIL. Gerçek dosya deposu yerine geçici API fixture’ları; 73×41 ve 7001×5 kaynak, hash, sürüm, eski dosya, null belge ve yetki kontrolleri korunur.
- Admin lint: 0 hata / önceki 4 uyarı; TypeScript ve Vite üretim derlemesi PASS.
- Kaldırılan modül/import referansı taraması, mask prompt dosyalarının HEAD ile eşliği ve git diff --check PASS.

Runtime API veya web/Flutter kodu değişmediğinden tam 601-test API ve bütün admin paketleri yeniden çalıştırılmadı; ilgili kaynak/katalog senaryoları doğrulandı.

## Görsel inceleme ve sınırlar

[1440px](direct-source-task04/single-source-1440.png), [320px / 2x metin](direct-source-task04/single-source-320-2x.png). Görüntüler sentetik verilerle alınıp görsel olarak incelendi. Üretim promptu görünmüyor; kaynak alanı ve normal katalog korunuyor.

Gerçek katalog veya müşteri verisi değiştirilmedi; gerçek kaynak/SKU seçimi, AI sağlayıcı çağrısı, SQL/IIS kabulü, deploy veya APK yapılmadı. Yükleme/indirme korunumu kabulü maske/editor zincirinin her çözünürlükte tamamlandığı anlamına gelmez; bu zincir sonraki tasklarda doğrulanacak.
