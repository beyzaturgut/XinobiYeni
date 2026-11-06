# TST-258 — KIS-TEK-03 admin tek kaynak yönetimi

06.11.2026. [Runbook](../../docs/runbooks/personalization-source-management.md). Uygulama: admin katalogda bağımsız tek kaynak hazırlığı. Gerçek katalog/tasarım/sipariş değiştirilmedi; tüm yazma senaryoları geçici IsolatedApiFactory veya yakalanan sentetik tarayıcı API’leriyle çalıştı.

## Kontroller

| Kabul kriteri | Kanıt / sonuç |
|---|---|
| Tek kaynak seçme/yükleme ve kayıtlı kaynağı gösterme | Bağımsız katalog bölümü; gerçek kaynak metadata’sı ve sürüm. Web/mobilde kullanılmama ve maske bekleme durumu açık. |
| Renk/HEX bağımsızlığı | API fixture ürününde Color boş/Hex null iken kaynak kaydı PASS; UI ayrı form, normal katalog save çağrısı yok. |
| Kaynak ölçüsü/baytı | 73×41 ve 7001×5 PNG; tam bayt korunumu ve geçmiş kaynak indirmesi API PASS. İstemci normal downscaleImage kullanmıyor; gerçek dosyayı multipart yüklüyor. |
| Eski sipariş/dosyalar | API tasarım alanına yerleştirilen sipariş source sentinel baytları ve katalog JSON’u aynı; kaynak geçmişi korunuyor. Mevcut sipariş dosya/legacy/placement tarayıcı paketleri PASS. Gerçek sipariş dosyalarına yazılmadı. |
| Kalıcılık/eşzamanlılık | Yeni API örneğinde okuma; aynı revision ile iki eşzamanlı kayıttan biri 200 biri 409. Yanlış hash reddi PASS. |
| Null/uyumsuz belge | Null, schemaVersion=2 ve profiles=null GET/PUT 503; belge üzerine yazılmadı. Ortak rejectNull opt-in; mevcut store varsayılanı korunur. |
| Kaynak kayıp/değişmiş | API stale; UI uyarı ve indirme kapalı; aynı fotoğrafın yeniden yüklenmesiyle onarım seçimi mümkün. |
| Yetki | Anonim 401, müşteri 403; readonly UI yazmaz. Yükleme media.write, kaynak catalog.write. |
| Hata/başarı | Yüklenme/none/503/403/bozuk payload/stale ayrımı; başarısız kayıt seçimleri korur; bozuk 200 payload başarı sayılmaz. |
| Taslak ve busy koruması | Ürün değişimi, modül gezinmesi, beforeunload ve logout guard; kayıt onayı iptali sıfır PUT; busy sırasında ikinci kayıt/ayrılma engelli. |
| İndirme | Blob SHA doğrulaması; tarayıcı handoff mesajı; diske yazıldı iddiası yok. |
| Responsive/erişilebilirlik | 320/390/768/1440 px ve kaynak alanında 200% metin: sayfa taşması yok. Klavye Tab odağı PASS; yeni alan axe kritik/ciddi 0. Fiziksel cihaz/VoiceOver/TalkBack kabulü değil. |

## Çalıştırmalar

- Tam .NET API: **601 PASS, 29 SKIP, 0 FAIL**; 6 yeni PersonalizationSourceTests dahil.
- Admin **23/23** test dosyası seri çalışmada PASS. İlk paralel run-isolated çalıştırıcısı iki testte ilerleme vermedi; bu çalıştırma durduruldu, PASS sayılmadı. Aynı testler mevcut loopback Vite üzerinde isolated-browser korumasıyla tek tek çalıştırıldı; fallback beklenmeyen gerçek API erişimini engeller.
- Yeni kaynak tarayıcı paketi ayrıca ayrı çalıştırmalarda PASS. Gerçek kullanıcı verisi kullanılmadı.
- Admin lint: 0 hata, önceki 4 uyarı (AuditHistory/SurfaceMasks); yeni uyarı yok. TypeScript + Vite üretim derlemesi PASS.
- API Release derlemesi: 0 hata/uyarı (son doğrulama çalışma kaydında).
- git diff --check ve belge/task bağlantıları PASS.

## Görsel inceleme

[1440px](personalization-source/single-source-1440.png), [320px / kaynak alanında 2x metin](personalization-source/single-source-320-2x.png). Sentetik görseller görsel olarak incelendi; kontrol/buton kesilmesi veya üst üste binme görülmedi.

## Sınırlar / açık işler

Bu task yalnız kaynak yönetimini tamamlar. Fotoğraf üretim promptu 04’te kaldırılacak. Yeni kaynağa maske hazırlama/onay, renkler arası toplu maskeyi kaldırma ve müşteri akışları 05–10’da açık. Gerçek kaynak/SKU eşlemesi, SQL çoklu süreç, IIS yedek/restore ve cihaz kabulü yapılmadı. SQL+dosya commit atomik değil; başarısız yarışta orphan yeni medya oluşabilir, eski dosyalar silinmez. Mevcut ürün verisi, sipariş/ödeme/kargo durumu değişmedi. Deploy/APK yapılmadı.
