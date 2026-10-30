# Admin görsel ve durum tutarlılığı — 30.10.2026

Başlangıç `main / 6a48a3c`, temiz worktree. AGENTS, Faz00/02/04/05 güncel kayıtları, ADM-08, tasarım kayıtları ve önceki admin-data-honesty/teknik kabul raporları incelendi. Bu çalışma yalnız admin kaynak/test/belgedir. Web/Flutter/API, gerçek kayıt, sağlayıcı, hosting/deploy/APK değiştirilmedi.

## Kapsam ve yöntem

16 `AdminView` modülü × 320/390/768/1440 × normal/%200 hesaplanmış font = 128 görünüm kontrolü. 390px 16 axe taraması; critical/serious bulgu yok. Her modülde 390px boş/sentetik503/sentetik403 girişi ayrı açıldı: 48 durum kaydı. Servis kullanan 14 modülde hata/yetki alert zorunlu; entegrasyon/ayarların bağlı olmayan yazma kaynakları ayrıca açıklanır. Kaynak yokluğu başarı/gerçek sıfır sayılmaz.

Yeni odaklı 15 senaryo: sipariş, teklif, yorum, AI, içerik, duyuru, katalog silme, entegrasyon bilinmeyen sayaç, yüzey yüklenme/hata/retry, fiyat, tablo klavyesi, pencere Tab/Escape/geri odak, 403, salt okunur fiyat/içerik/yüzey. Gerçek API isteği yerine bütün `/api/**` yanıtları intercept edilir. Yazma senaryoları fixture; gerçek hesap/katalog/sipariş/baskı maskesi değişmez. Normal/modüller matrisi her alt sekmenin tüm gerçek veri kombinasyonları için resmi UAT değildir.

## Modül matrisi

Tüm satırlar kontrol edildi; “düzeltildi” ortak tablo/kontrol/form dilini de içerir.

| Modül | Kontrol edildi / düzeltildi | Açık kalan |
|---|---|---|
| `?view=customers` | Müşteri listesi/boş/hata/yetki kontrolü; ortak tablo ve pencere odağı. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=orders` | İşlem hatası artık alert, başarı ayrı; not korunur; pencere Tab/Escape/odak, mevcut sipariş seçenek/stale regresyonu. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=catalog` | Katalog etiketleri bağlı kaynağı anlatır, kayıt ID gizlenmez; silme hata/başarı ayrımı ve kilidi; ortak tablo/pencere. | 23 ürün içeriği, SKU117 fiyatı ve onaylı veri |
| `?view=inventory` | 320px %200 fieldset/input taşması düzeltildi; mevcut stok hata/taslak/kilit regresyonu. | Depo/rezervasyon, kalıcı kampanya/ayar veya sağlayıcı API kaynakları; karar ve gerçek UAT |
| `?view=surfaces` | Yüklenirken/hatada sıfır sayaç ve boş sonuç gösterilmez; liste/detay retry; salt okunur maskede yazma kontrolleri kapalı. | Onaylı gerçek maske/üretim profili, fiziksel numune ve operasyon kabulü |
| `?view=reviews` | Kayıt hatası listeyi ve yanıt/ret nedeni alanlarını kaldırmaz; başarı ayrı duyurulur; metin ve tablo alt yazısı kontrastı. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=quotes` | İşlem hatası başarı durumundan ayrıldı; mesaj taslağı korunur; tablo kontrastı. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=pricing` | Tanımsız fiyat sıfır değildir; ortak tablo/odak; mevcut fiyat ve kampanya kaynak sınırları korunur. | Depo/rezervasyon, kalıcı kampanya/ayar veya sağlayıcı API kaynakları; karar ve gerçek UAT |
| `?view=content` | Kayıt/yükleme kilidi, busy alanları, doğru hata rolü; salt okunur kullanıcı sekmeleri inceler fakat kayıt/yükleme yapamaz; slider kontrastı. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=print` | Fiziksel profil ve tasarım kaydı gerçek API durumları; ortak tablolar/pencere; kaynak/metadata mevcut regresyonu. | Onaylı gerçek maske/üretim profili, fiziksel numune ve operasyon kabulü |
| `?view=integrations` | Katalog yüklenmediyse varyant sayısı bilinmiyor; sahte 0 yerine kaynak yokluğu. Sağlayıcı başarıları uydurulmadı. | Depo/rezervasyon, kalıcı kampanya/ayar veya sağlayıcı API kaynakları; karar ve gerçek UAT |
| `?view=dashboard` | Özet yüklenme/hata/doğrulanmış sıfır ayrımı ve eski yanıt yarışları mevcut regresyonda; ortak kart/buton reflow. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=settings` | Rol/ayar önizlemesi kaydedilmiş görünmez; davet ve denetim kaynakları korunur; ortak tablo/form. | Depo/rezervasyon, kalıcı kampanya/ayar veya sağlayıcı API kaynakları; karar ve gerçek UAT |
| `?view=ai` | Politika/kaynak yazma hatası başarı mesajı değildir; taslak korunur; ortak tablo/geri bildirim. | Gerçek sağlayıcı/kalite/maliyet UAT; bu çalışma AI çağrısı yapmaz |
| `?view=notifications` | Kuyruğa alma teslim değildir; mevcut retry/stale/poll/yetki regresyonu; ortak tablo ve filtre. | Gerçek rol/SQL ve operasyon kabulü |
| `?view=audit` | Boş/hata/403 ayrımı; ortak tablo ve odak; ayarlardaki denetim geçmişine retry eklendi. | Gerçek rol/SQL ve operasyon kabulü |

## Bulgu, tekrar ve öncelik

| ID | Tekrar adımı / boyut | Uygulanan düzeltme |
|---|---|---|
| A01 P1 | Sipariş/teklif/AI yazması 409 veya503,390px | İşlem hatası `role=alert`, teyitli başarı `role=status`; alan değerleri korunur |
| A02 P1 | Değerlendirme yanıtı kaydı403/503 | Liste ve düzenleme alanı görünür kalır; kullanıcı doğrudan tekrar kaydeder |
| A03 P1 | İçerik kaydına hızlı tekrar / yavaş yanıt | ref kilidi, disabled fieldset, busy metni; yükleme aynı kilidi kullanır |
| A04 P1 | Salt okunur içerik/yüzey kullanıcısı | Sekme/önizleme okunabilir, yazma/yükleme kontrolleri engelli; sunucu yetkisi korunur |
| A05 P1 | Yüzey listesi yavaş/503/403 | Yüklenme ayrı; sıfır sayaç/yanlış boş liste yok; liste ve detay retry |
| A06 P1 | Entegrasyon uzlaştırma + katalog503 | Sıfır yerel varyant yerine sayı bilinmiyor |
| A07 P2 | Duyuru yayını/katalog silme hata | Başarıdan ayrı alert ve işlem kilidi; başarısız silmede satır kalır |
| A08 P1 | Stok formu320px %200 font | Fieldset min-width ve sarılan form/kontroller; overflow gizlenmedi |
| A09 P2 | Sipariş/teklif alt yazı, slider sıra/alt yazı390px | Kontrast düzeltildi; axe tekrarında ciddi/kritik bulgu yok |
| A10 P1 | Pencere son/ilk kontrolünde Tab/Shift+Tab | Ortak native AdminDialog sınır odağı; mevcut dirty/close/ref callbackleri korunur |
| A11 P2 | Dar ekranda geniş tablo ve kayıt formu | Ortak TableRegion, adlandırılmış klavye kaydırma alanı; tablo taşması yalnız kendi alanında |
| A12 P2 | Ayarlar denetim geçmişi503 | Aynı filtre ve alanlarla tekrar dene |
| A13 P1 | 768×400 kısa yükseklik | Üst menü statik akışa geçer; yan menüye kullanılabilir yükseklik kalır; tüm işlem bağlantıları klavyeyle erişilir |

## Açık işler ve kapanış koşulları

| Açık iş | Bağımlılık / neden | Kapanış |
|---|---|---|
| Gerçek rol/SQL ve kayıt bazında operasyon UAT | İzole fixture gerçeğin yerine kabul edilmez | Yetkili izole UAT ortamı, rol matrisi, gerçek kayıt okuma/yazma ve operatör kabul tutanağı |
| Kalıcı rol/ayar/kampanya, depo/hareket ve entegrasyon modülleri | Mevcut kaynak/karar/API eksikleri; UI kaydetmiş gibi davranmaz | Onaylı backend sözleşmesi + kaynak/iş kararları + izole entegrasyon testleri |
| Bütün modüllerde navigasyon sırasında kaydedilmemiş taslak ve toplu işlem politikası | Bu iş başarısız kayıtta taslak korumayı genişletir; yeni toplu işlem özelliği veya global route-leave koruması eklemez | Operasyon kararı ve modül bazında kayıt/iptal/yetki senaryoları; ADM-08 kapsamı açık |
| Gerçek cihaz/Safari/ekran okuyucu/OS ölçeği ve Creative/UX kabulü | Chrome/axe/%200 hesaplanmış font fiziksel cihaz veya gerçek zoom kabulü değildir | Cihaz ve ekran bazında manuel kayıt + tasarım/handoff onayı |
| Ürün içeriği ve fiyat | Kullanıcı onaylı veri bekleniyor | 23 ürün dosyası ve SKU117 onaylı fiyatı; bu işte doldurulmadı |
| Baskı numunesi, AI/ödeme/bildirim sağlayıcı kabulleri | Gerçek dış çağrı yapılmadı; üretim/gönderim yok | Onaylı profil/numune ve sağlayıcı sandbox/operasyon kabul kanıtı |

ADM-08 teknik kapsamı ilerledi; resmi task/faz kabulü tamamlanmış sayılmaz. Test komutları, ilk başarısız denemeler ve görsel kanıt [TST-188](../test/2026-10-30/TST-188-admin-consistency.md) altında.
