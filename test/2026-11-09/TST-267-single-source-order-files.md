# TST-267 — KIS-TEK-10 sipariş yüzeyi ve üç değişmez dosya

09.11.2026 · Teknik uygulama ve izole kabul. Gerçek müşteri/sipariş/katalog, SQL veya sağlayıcı kaydı test amacıyla değiştirilmedi.

## Teslim

Admin sipariş detayı schema-2 yüzey bağını, kaynak/profil sürümlerini, fotoğraf/maske/desen hashlerini ve gerçek kaynak koordinatlarını gösterir. Yeni satırda ticari SKU ve stok referansı bulunur; görsel renk seçimi sunulmaz. Schema-1 ve normal siparişin kayıtlı rengi korunur. Desteklenmeyen şema yorumlanmadan ham gösterilir; bozuk/eksik schema-2 bağı açık hata verir.

Desen, maskelemede kullanılan özgün ürün fotoğrafı ve giydirilmiş temsili önizleme ayrı sipariş/satır kopyalarından iner. Yüzey kimliği sipariş metadata'sından doğrulanır; güncel katalog, aktif maske veya müşteri configuration'ından dosya yeniden üretilmez. Kaynak ölçüsü schema-2'de ham width/height ile karşılaştırılır; eski koordinat tuvali yalnız legacy kayıtta yorumlanır. Geçmiş kaynak indirmesi 20 MP decoder sınırına veya güncel RAM ayarına bağlanmaz.

Yeni kaynak modelinin üç dosyası siparişe kopyalanmadan önce tam decode ile doğrulanır; giriş baytları kırpılmaz, yeniden boyutlandırılmaz veya tekrar kodlanmaz. JPEG önizleme yüklemesi ve kopyası tüm şemalarda doğrulanır. Başlık olarak JPEG görünen dört baytlık bozuk dosya artık kabul edilmez. Eski checksum/revizyon testlerinin sahte JPEG imzaları geçerli, birbirinden farklı JPEG fixture'larıyla değiştirildi; doğrulama senaryoları kaldırılmadı.

Okumada dosya uzunluğu, SHA-256, tür ve okunabilir görsel başlığı kontrol edilir; unrecorded desen/önizleme de geçerli başlık gerektirir. Yeni kaynak bağındaki yanlış ürün/SKU/tuval/hash/revizyon 503; bulunmayan kopya 404; kimlik/yetki 401/403 olur. Belgesiz geçmiş dosya SHA doğrulanmış sayılmaz ve güncel dosyayla doldurulmaz. Yalnız checksum'sız eski kaydın mevcut uyumluluk önizlemesi ayrı kalır; yeni ve manifestli tüm siparişlerde kayıp önizleme için canlı configuration/katalog fallback'i yapılmaz. Webde eski doğrulanamayan uyumluluk önizlemesi açıklamalıdır.

## Sonuçlar

| Kontrol | Sonuç |
|---|---|
| Tam API regresyonu | **623 PASS / 29 SKIP / 0 FAIL** |
| API Release | **0 uyarı / 0 hata** |
| Admin build / lint | **PASS**; AuditHistory'de önceden var olan tek set-state-in-effect uyarısı sürer, yeni uyarı yok |
| Yeni admin schema-2 matrisi | **PASS**: 4 genişlik + hata/retry + çok küçük ölçek + bozuk bağ; 3 ayrı dosyanın baytları, 320/390/768/1440, gerçek %200 metin, klavye/Enter ve axe |
| Eski admin sipariş paketleri | **5/5 script PASS**; 21 dosya hata/yetki/tekrar senaryosu, 7 legacy/eksik kayıt durumu, yerleşim ve son kabul matrisi |
| Web TS / lint / üretim export | **PASS** |
| Web sipariş/zoom/eksik kopya | **7/7 PASS**; eski uyumluluk ve manifestli sipariş ayrımı, 404/503'te başka önizleme çağrılmaması |
| Flutter analyze | **Temiz** |
| Flutter tüm regresyonlar | **302 PASS / 0 FAIL**; dört yeni missing/error/manifest senaryosu dahil |

Yeni arşiv testi gerçek izole API configuration → preview upload → checkout → staff/customer dosya zincirini kullanır. İki farklı desen ve sipariş satırı, siparişten önce açılmış daha yeni düzenleme revizyonu, kaynak/maske değişimi, ürün ve tasarımların silinmesi sonrası üç dosya aynı kalır. Source fotoğrafı `7001×7` gerçek kaynaktır. Ayrı büyük arşiv fixture'ında `5001×4000` özgün kaynak kopyası tam decode edilip arşivden birebir indirilir; sabit 20 MP kontrolü veya yeni tuval ölçeği uygulanmaz. Bu ikinci fixture gerçek büyük ürün/maskenin canlı kabulü değildir.

Yeni negatif API senaryoları: her rol için byte corruption / silme / geri koyma, yanlış ticari yüzey bağı, dört bayt JPEG, recorded ve unrecorded bozuk eski kompozisyon, müşteri/anonim yetkisiz admin isteği. Önceki kapsamlı rol/MFA, başka müşteri/sipariş/satır, path/query enjeksiyonu ve depolama kesintisi kontrolleri tam pakette korunur. Eski sipariş dosyalarına apply/backfill yapılmadı.

## SIP-TAS-01…09 kabul matrisi

| Alt task | KIS-TEK-10 sonucu | Açık kabul |
|---|---|---|
| 01 Sipariş tasarım detayı | Schema-2 yerleşim/üç dosya ve ticari stok ayrımı; üretim eylemi yok | İş sahibi gerçek ekran kabulü |
| 02 Siparişe bağlı revizyon/kopya | Fotoğraf/desen/önizleme ve yüzey bağı değişmez; katalog/tasarım silinmesi test edildi | Gerçek SQL/IIS ve backup/restore |
| 03 Yerleşim | Şema 1/2, gerçek kaynak ölçüsü, px/yüzde/ölçek/açı/kavis/bölgeler; küçük değer sıfıra yuvarlanmaz | Gerçek baskı/ölçü kabulü bu ekranın kapsamı değil |
| 04 Ham desen | Doğru sipariş/satır/revizyon, ayrı özgün dosya ve tür | IIS indirme/iş sahibi |
| 05 Ürün kaynak fotoğrafı | Orijinal hash/bayt ve ham ölçü; güncel katalog kullanılmaz | Gerçek depo dosyalarının kabulü |
| 06 Giydirilmiş önizleme | Sipariş kopyası; malformed JPEG reddi; müşteri fallback sınırı | Gerçek cihaz görüntü/indirme |
| 07 Yetki/hata | 401/403/404/503, hash/tür/uzunluk ve bozuk metadata; kıyas/kopya yok | Canlı rol/MFA ve gerçek SQL |
| 08 Legacy | Renk/veri korunur, bilinmeyen şema ham, belgesiz dosya unverified, geriye doldurma yok | Eksik eski dosyaların asıl depoda bulunması/yedek kabulü |
| 09 Toplu kabul | API + 6 admin scripti + web + Flutter; görsel inceleme | İnsan/gerçek cihaz/ekran okuyucu/IIS/SQL kabulü |

## Görsel QA ve kapsam

`/tmp/xinobi-task10-admin/single-source-order-390.png` ve `single-source-order-files-1440.png` görsel olarak incelendi. Bilgi/dosya kartları okunur, üç rol ayrıdır, yeni ticari renk gizli, eski renk açık kalır. %200 simülasyonu başlangıç hesaplanmış boyutları bir kez ikiye katlar; üst öğeden miras yoluyla üstel büyütme yapmaz. `0.000001` ölçek `0,000001 kat` gösterilir. Görseller sentetik fixture'tır ve build/test çıktısı olarak repoya alınmaz.

Ortak etkiler: tüm configuration JPEG önizleme yüklemeleri geçerli dosya gerektirir; siparişe ait binary okumalar görsel başlığı ve kayıt bütünlüğünü kontrol eder. Yeni dosya üretimi veya fiziksel baskı onayı yok. Kopya oluştururken mevcut kaynak maskeleme RAM bütçesi (`ProductSurfaces:MaskProcessingMemoryMiB`, varsayılan 512 MiB, 16–1024 MiB) kullanılır ve decode eşzamanlılığı süreç içinde sınırlandırılır; kaynak dosyası değiştirilmez. Arşiv okuması tam bitmap decode etmez. API sözleşmesi/URL/DDL değişmedi.

KIS-TEK-11 ve 12 açık. Gerçek kaynak/SKU iş kararı, 23 ürün içeriği/SKU 117 fiyatı, gerçek veri geçişi, SQL çoklu süreç/IIS ve Android/iOS cihaz/VoiceOver/TalkBack kabulü tamamlanmış sayılmaz. Gerçek ödeme, baskı, kargo veya veri backfill'i yapılmadı; deploy/release/APK yok.

[Uygulama ve uyumluluk rehberi](../../docs/runbooks/single-source-order-files.md) · [Task planı](../../docs/tasks/personalization-single-source-tasks-2026-11-06.md).
