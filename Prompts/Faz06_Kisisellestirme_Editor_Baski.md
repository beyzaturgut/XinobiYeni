# Faz06 — Kişiselleştirme, gelişmiş editör ve baskı dosyası

## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**Bu fazın işi:** Ana sorumluluk KIS-03/KIS-07; SIP-TAS-01...09. KIS-01/05/06 üretim hedefleri kapsam dışı; tamamlandı sayılmaz. KIS-02 görsel maske doğruluğu, KIS-04 genel editör kapsamı ve KIS-08 fiyat/dosya teslim kabulü sürer.

**03.11 SIP-TAS-09 son test/kabul kaydı:** SIP-TAS-01…08 kaynak ve test kayıtlarından doğrulandı. Kimlik, yerleşim ve üç dosyanın eşliği; düzenleme, silme, katalog/maske değişimi ve dosya deposunun yeniden başlatılmasından sonra da korunuyor. 320/390/768/1440 px'te normal ve %200 metin, axe (kritik/ciddi 0), klavye, odak ve duyuru kontrolleri geçti; üretim eylemi yok. Admin 18 test dosyası + 4 tools senaryosu, API 514 test (29 atlandı) PASS; web e2e 17/18 (1 bilinen kararsız test). Teknik kabul tamam; izole SQL, canlı IIS, ekran okuyucu/cihaz ve iş sahibi kabulü açık. [Kabul matrisi](../design/order-design-acceptance-2026-11-03.md), [TST-239](../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md). KIS-03 SQL ve KIS-07 gerçek kabul açık.

**03.11 SIP-TAS-08 uygulaması:** Eski, eksik ve kısmi sipariş tasarım kayıtları her kartta bağımsız değerlendiriliyor. SIP-TAS-02 öncesi siparişin kendi desen ve kompozisyon kopyası, “doğrulama özeti kaydedilmedi” etiketiyle (`X-Xinobi-File-Check: unrecorded`) erişilebilir kalıyor. Saklanmamış dosyalarda indirme kapalı ve nedeni yazıyor. Servis hatası eksik kayıt sayılmıyor; “kaydın olup olmadığı bilinmiyor” mesajı ve tekrar dene var. Katalog/tasarım yedeği kullanılmıyor. Salt okunur `order-design-files-dry-run` envanteri ve geri dönüş planı hazır; gerçek veriye yazma yapılmadı. API 513 test PASS (29 atlandı); 7 durumlu Chrome matrisi ve regresyonlar PASS. [TST-235](../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md). SIP-TAS-09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-07 uygulaması:** Desen, ürün kaynak görseli ve kompozisyon uçları ile müşteri, panel ve açık medya yolları uçtan uca denetlendi. Her istekte personel+MFA+`orders.read` kontrolü yapılıyor; dosya saklı sipariş/satır referansından çözülüyor, hata gövdeleri iç bilgi sızdırmıyor. İzole API matrisi PASS: anonim, müşteri, başka müşteri, izinsiz, MFA'sız ve süresi dolmuş personel; başka sipariş/satır; 404/503. Admin indirmesi: `aria-disabled` kilidi odak koruyarak çalışıyor, hata açıklamasına odak taşınıyor, 503 ve bağlantı kesintisinde tekrar dene var; başarı mesajı yalnız “tarayıcıya verildi” diyor (21 Chrome senaryosu PASS). API 511 test PASS (29 atlandı). İndirmelerin audit kaydı mevcut yaklaşımda yok; ayrı karar açık. [TST-231](../test/2026-11-03/TST-231-sip-tas-07-file-access.md). SIP-TAS-08/09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-06 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/composition` (`orders.read`) siparişe bağlı kompozisyon kopyasını SHA-256 ve JPEG türüyle doğrulayıp veriyor; dosya adı `…-giydirilmis-onizleme-rev{r}.jpg`. Kopya yoksa nedeni yazılıyor; ham desen veya güncel tasarım yedek olarak kullanılmıyor. Admin kartı aynı dosyayı “Temsilidir … Baskıya hazır dosya değildir” etiketiyle gösteriyor ve indiriyor. Web kaydı, önizleme tuvali olmadan yerleşim kaydetmiyor. API 510 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Web design-configuration e2e 16/18; düşen 2 test değişiklik olmadan da kararsız, değişiklikle 2/2 PASS. [TST-227](../test/2026-11-03/TST-227-sip-tas-06-composition.md). SIP-TAS-07…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-05 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/source` (`orders.read`), editörün maskelediği ürün fotoğrafının sipariş anındaki kopyasını veriyor. SHA-256, baytlardan saptanan tür ve fotoğraf ölçüsünün kayıtlı editör tuvaline eşitliği doğrulanıyor; dosya adı `…-urun-kaynak-{SKU}`. Kopya yoksa nedeni yazılıyor; katalog fotoğrafı, başka renk veya maske yedek olarak verilmiyor. Admin kartında kilitli indirme düğmesi var. Katalog/renk/maske değişimi, yol aşımı ve keyfi URL senaryoları izole testte PASS. API 508 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. [TST-223](../test/2026-11-03/TST-223-sip-tas-05-source-download.md). SIP-TAS-06…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-04 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` (`orders.read`) siparişe bağlı desen kopyasını sunucuda sipariş/satırdan çözüyor. Baytlar değiştirilmeden, SHA-256 ve baytlardan saptanan MIME doğrulanarak `xinobi-{no}-satir-{n}-desen[-rev{r}].{uzantı}` adıyla indiriliyor. Admin Ham desen kartında kilitli “Ham deseni indir” düğmesi, 404/403 açık durumu ve servis hatasında tekrar dene var. API 506 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Canlı ortam ve SQL kabulü açık. [TST-219](../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md). SIP-TAS-05…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-03 uygulaması:** Admin sipariş tasarım detayı, sipariş satırındaki kayıtlı yerleşimi salt okunur gösteriyor. Tuval, konum (piksel + tuvale göre gösterim yüzdesi), ölçek, döndürme, mod, maske doldurma, kavis, yüzey sürümü ve gövde/bölge ayarları birim ve anlamıyla etiketli. Sipariş/satır/konfigürasyon/revizyon satırı ve desen–revizyon SHA-256 bağı gösteriliyor. Eksik alan “Kaydedilmemiş” (sıfır/aktif değil); şema 1 dışı yorumlanmadan ham; eski kayıt açıklamalı. Editör varsayılanı, mm/DPI ve baskı uygunluğu yok. Admin lint/TS/build ve fixture testleri (320/390/1440, %200) PASS. [TST-215](../test/2026-11-03/TST-215-sip-tas-03-order-placement.md). SIP-TAS-04…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-02 uygulaması:** Sipariş satırına `Files` sözleşmesi eklendi: desen, maskelemede kullanılan ürün kaynak görseli ve giydirilmiş önizleme; her biri SHA-256, tür ve bayt ile. Ürün kaynak görseli sipariş anında yüzeyin kayıtlı kaynak özetiyle doğrulanıp siparişe kopyalanıyor. Desen konfigürasyon özetiyle eşleşmezse sipariş reddediliyor; okumada özet farklıysa dosya verilmiyor (503). Tasarım silme/düzenleme, katalog/maske değişimi, eski revizyon, tekrar istek ve yarım kopya izole fixture ile PASS. API 502 test PASS (29 atlandı); sözleşme/admin/web/Flutter analiz PASS. Gerçek SQL kabulü açık (izole SQL yok), eski siparişler geriye dönük doldurulmadı. [TST-211](../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md). KIS-03 SQL kabulü ve SIP-TAS-03…09 açık.

**03.11 SIP-TAS-01 uygulaması:** Admin sipariş detayında kişiselleştirilmiş her satır için “Sipariş tasarım detayı” alanı eklendi. Alanda sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, okunur kayıtlı yerleşim ve ayrı üç görsel kartı var. Ham desen dosya doğrulanınca önizlenir ve mevcut korumalı uçla indirilir. Ürün kaynak görseli ve giydirilmiş önizleme için açıkça “İndirme hazır değil” yazar. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Fiziksel profil/kalibrasyon/ölçüm ekranı tasarım ekranından kaldırıldı (API/veri korunur); menü “Tasarımlar”. Sipariş/kargo/iptal/iade işlemleri ve tasarımdan siparişe geçiş korundu. Sipariş penceresinde etiket kontrastı ve %200 yazı taşması da düzeltildi. Admin lint/TypeScript/derleme ve izole Chrome regresyonları PASS. [TST-207](../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md). KIS-07 açık: SIP-TAS-02…09 yapılmadı; rol/PM kabulü verilmedi.


**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

## Güncel durum - 03.11.2026 (önceki uygulama temeli korunur)

**Durum:** Planlandı - sade sipariş tasarım detayı, kayıtlı yerleşim ve üç görsel teslimi. Üretime hazırlık kapsam dışı; SIP-TAS-01 ekran sadeleştirmesi (TST-207) SIP-TAS-02 dosya/revizyon bağı (TST-211) SIP-TAS-03 yerleşim sunumu (TST-215) SIP-TAS-04 ham desen indirmesi (TST-219) SIP-TAS-05 ürün kaynak görseli indirmesi (TST-223) SIP-TAS-06 giydirilmiş önizleme gösterimi/indirmesi (TST-227) SIP-TAS-07 dosya yetkisi/işlem durumları (TST-231) SIP-TAS-08 eski/eksik kayıtlar (TST-235) uygulandı; SIP-TAS-09 teknik kabul tamam (TST-239), gerçek kabul açık. Plan kaynak kesiti `main / e89c649`; önceki uygulama kayıtları aşağıda korunur; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** 42bee88: ürün/renk/yüz bazlı mm-DPI-taşma-renk-format, boş ölçülü taslak, kanıtlı onay/kaldırma ve geçmiş; düzlemsel mm/DPI/korunan bölge ölçümü ve fiziksel kalibrasyon SVG. Yeni yerleşim/sipariş profil kopyası ve SHA alır. Gerçek SKU profili oluşturulmadı; productionReady=false.

**03.11 yeni kapsamda beklenenler:** Ürün/renk kaynak görseli ve doğru sipariş yerleşimi/dosya eşliği için örnek kabul. Fiziksel mm/DPI/ICC/kalibrasyon/numune dosyası bu bölümün yazılım teslim şartı değil.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [KIS-01](../docs/tasks/project-closure-2026-10-30.md#kis-01) - Fiziksel PrintArea ve üretim profilini kur | Kapsam dışı - 03.11.2026 kararı | Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı. |
| [KIS-02](../docs/tasks/project-closure-2026-10-30.md#kis-02) - Tüm gerçek renklerin maske kabulünü yap | Yapılmadı - kapanış açık | Her gerçek renk için logo/kenar/kulp ve geometriyi insanın görsel inceleyip SKU bazında imzalı kabul etmesi eksik. |
| [KIS-03](../docs/tasks/project-closure-2026-10-30.md#kis-03) - Revizyon ve sipariş bağımsızlığını SQL'de doğrula | Yapılmadı - kapanış açık | Bu senaryoların izole gerçek SQL üzerinde restart/eşzamanlılık ve kalıcılık kabulü bu task için yapılmadı. Üç görselin siparişe bağlı korunması ve eski/eksik kayıt davranışı ayrıca tamamlanmalı. |
| [KIS-04](../docs/tasks/project-closure-2026-10-30.md#kis-04) - Kaynak kapsamdaki editör araçlarını tamamla | Yapılmadı - kapanış açık | Onaylı kapsamın metin/font/şekil/katman-kilit/şablon/çoklu yüz araçları ve font lisansı kabulü eksik. Bu karar genel editör araçlarını iptal etmez; sade sipariş tasarım detayının önkoşulu da değildir. |
| [KIS-05](../docs/tasks/project-closure-2026-10-30.md#kis-05) - Değişmez üretim sürümü ve insan onayı ekle | Kapsam dışı - 03.11.2026 kararı | Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı. |
| [KIS-06](../docs/tasks/project-closure-2026-10-30.md#kis-06) - Baskı render kuyruğunu uygula | Kapsam dışı - 03.11.2026 kararı | Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı. |
| [KIS-07](../docs/tasks/project-closure-2026-10-30.md#kis-07) - Sipariş tasarım detayını ve ayrı görsel indirmelerini tamamla | Yapılmadı - kapanış açık | SIP-TAS-01 uygulandı (03.11, TST-207): sipariş satırı tasarım detayı ve üç ayrı görsel kartı; fiziksel profil ekranı panelden kaldırıldı. SIP-TAS-02 uygulandı (TST-211): siparişe bağlı üç dosya referansı ve doğrulanmış kopyalar; SQL kabulü açık. SIP-TAS-03 uygulandı (TST-215): kayıtlı yerleşimin okunur sunumu. SIP-TAS-04 uygulandı (TST-219): ham desenin yetkili ayrı indirmesi. SIP-TAS-05 uygulandı (TST-223): ürün kaynak görselinin yetkili ayrı indirmesi. SIP-TAS-06 uygulandı (TST-227): giydirilmiş önizlemenin gösterimi ve indirmesi. SIP-TAS-07 uygulandı (TST-231): dosya yetkisi ve indirme durumları. SIP-TAS-08 uygulandı (TST-235): eski/eksik kayıtlar ve salt okunur envanter. SIP-TAS-09 teknik kabul tamam (TST-239); indirmeler ve kabul henüz yapılmadı. |
| [KIS-08](../docs/tasks/project-closure-2026-10-30.md#kis-08) - Kişiselleştirme fiyatı ve sipariş dosya teslimini kabul et | Yapılmadı - kapanış açık | Kişiselleştirme fiyatlandırma/checkout-iade kabulü ve SIP-TAS dosya teslim kabulü açık; fiziksel numune yazılım kapısı olarak beklenmiyor. |

### Açık alt işler ve özel kabul kayıtları

| Alt iş | Ana task | Durum | Kalan / kanıt |
|---|---|---|---|
| KIS-01-DATA-01 | KIS-01, KAR-05 | Kapsam dışı (03.11) | Tarihsel beklenti; yeni sipariş detayı için istenmiyor.  Gerçek SKU ölçü, konum, DPI, pay, renk/format ve kavisli ürün üretim şablonu. |
| KIS-01-UAT-01 | KIS-01, KIS-08 | Kapsam dışı (03.11) | Tarihsel fiziksel kabul; yeni teslim kapısı değil.  Ölçekleme kapalı kalibrasyon çıktısı ve gerçek numunede alan/konumu üretim sahibiyle ölçerek kabul et. |
| KIS-01-SQL-01 | KIS-01, KIS-03, QA-02 | Revize (03.11) | Fiziksel profil kabulü değil; SIP-TAS-02/09 altında sipariş yerleşimi ve görsel kalıcılığı devam eder.  İzole gerçek SQL’de sürüm kalıcılığı/restart/yazma yarışı ve eski sipariş kopyası kontrolü. Dosya fixture’ı SQL kabulü değil. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [KAR-05](../docs/tasks/project-closure-2026-10-30.md#kar-05), [AI-04](../docs/tasks/project-closure-2026-10-30.md#ai-04), [CAT-01](../docs/tasks/project-closure-2026-10-30.md#cat-01), [WEB-02](../docs/tasks/project-closure-2026-10-30.md#web-02), [MOB-05](../docs/tasks/project-closure-2026-10-30.md#mob-05), [SEC-07](../docs/tasks/project-closure-2026-10-30.md#sec-07), [UAT-04](../docs/tasks/project-closure-2026-10-30.md#uat-04).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


**27.10 görünürlük güncellemesi:** Web ve mobil WebView ortak PlacementStudio önizlemesinde “Baskı alanını göster” başlangıçta kapalıdır; kullanıcı isteğe bağlı açar. Maske ve kayıtlı yerleşim değişmedi. [Kontrol kaydı](../test/2026-10-27/TST-print-area-default.md).

## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Devam; üretim baskısı D04/T-04 ile bloke. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| Onaylı maske / production önizleme | Uygulandı | 9e69a74, cdd8ed3 ve TST-135: SQL admin kataloğunda maske araçları ve onaylı yüzey renderer yolu production için açıldı. a96d3d9 çalışma kopyası kaynaklarını yayımlar, preview e2e fixture/proxy bağımlılığını giderir. Tüm gerçek renklerde maske/piksel kalitesi ayrıca kabul edilmelidir. |
| Yükleme / yerleşim | Uygulandı | b926844 EXIF eksenlerini düzeltir; 32d92f2 iptal/takılma kurtarma; 6abc71e içeriğe göre görüntü algılama. Güncel PlacementStudio görsel/desen, konum/ölçek/dönüş/kavis, yakınlaştırma ve geri alma/yineleme kontrollerini paylaşır. Bu, tam katmanlı üretim editörü kabulü değildir. |
| Sürümlü kaydet / yeniden düzenle | Uygulandı | 9933fef, 47d8016, d2d8f8d, 72808e9: hesap tasarımı + konfigürasyon revizyonu, renk/kaynak değişimi, sepet ve favoriden aynı yerleşime dönüş; girişte tasarım kaybolmaz. 902066f ürün seçilmemiş mobil editör bağlantısını beyaz ekran yerine native seçiciye yönlendirir. |
| Sipariş / panel tasarım kayıtları | Uygulandı; baskı kısmi | 34556fa, 469d9bd, 503fe50: gerçek tasarım metadata ve yetkili görsel; 068e976 kaynak yokken sahte baskı eylemlerini kapatır. 902066f sipariş kompozisyonunu tasarım silinmesinden bağımsız korur. JPEG önizleme üretim baskı dosyası değildir. |
| Eski editörün kaldırılması | Uygulandı | 179c46b/078a42e eski prototipleri, EditorWorkspace ve sahte metin/şekil/ön-arka kontrollerini kaldırır; AI ve referans önizlemesi ortak rendering/PlacementStudio kullanır. Eski URL ürün seçimine gider. Yerel referans sayfası gerçek ticari kimlik veya kaydetme hakkı üretmez. |
| Üretim kapısı | Bloke / açık | Konfigürasyon revizyonu üretim DesignVersion kabulünü kapatmaz. Fiziksel PrintArea mm, DPI/taşma/renk/format, üretim onayı, baskı render worker ve indirme, şablon/metin/katman/çoklu yüz ve fiyat farkı eksikleri sürer. Eski Roboflow/Tea Maker yerel araçlarının tamamı silindi varsayılmadı. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


**Durum (20.10.2026):** Bloke (D04) · geliştirme ~47 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Uygulanmayı bekliyor. **Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §3.1, §4, §5, §6.3–6.5, §8 ve `Xinobi_Proje_Kapsami(4).md` kişiselleştirme/editör maddeleri. **Yürütme ve karar kaydı:** `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`. Onay kutuları gerçek onay verilince işaretlenir.

## 1. Amaç, bağımlılık, karar kapısı

Seçili ürün ve varyantta basit yazı/isim/logo/görsel kişiselleştirmesi ile metin, görsel, şekil katmanları olan gelişmiş editörü; ön/arka çoklu baskı alanını; kayıtlı tasarım sürümünü; sunucuda doğrulanan baskı çıktısını; sepet/sipariş bağı ve panel indirmesini teslim et. Faz04 ürün/varyant/medya ve Faz05 sepet, fiyat hesaplama, sipariş/satır anlık görüntüsü gerekir. Faz02 Creative/UIUX tasarımı ve Faz03 güvenli dosya/kimlik altyapısı gerekir. D04 fiziksel ölçü, baskı yöntemi, güvenli boşluk, çıktı formatı, DPI eşiği, font lisansı, üretim onayı ve varyanta özel alan farkı ürün/üretim sahibinden **fiziksel örnekle** doğrulanmadan üretime hazır baskı dosyası kabul edilmez; bu arada editör sözleşmesi, önizleme ve test alanı geliştirilebilir. D03 fiyat/sipariş kesinleşme ve D08 AI çıktısının aktarım biçimi Faz00 karar defterine bağlanır. AI üretiminin kendisi sonraki fazın işidir.

## 2. Creative → UI/UX → Frontend teslim zinciri

Sr. Creative Designer ürün üstü gerçekçi görsel önizleme biçimini, ön/arka yüz ayrımını, alan sınırını, katman panelini, araç çubuğunu, şablon küçük resimlerini, kalite ve taşma uyarılarını, masaüstü/tablet/telefon düzenlerini ve renge göre gerçek ürün fotoğrafı kullanımını tasarlar. UI/UX işlevi Creative Designer ve Sr. Frontend tarafından ortak yürütülür: basit akış/gelişmiş akış geçişi, dokunma/sürükleme, klavye kullanımı, erişilebilir alternatif komutlar, kaydetme başarısızlığı, tekrar açma ve siparişe bağlama prototipi. FE'ye ölçü/token, bileşen durumları, hareket ve test örnekleriyle teslim edilir; PM tasarımı ve üretim kuralları uyumunu onaylar. Aynı görsel belgedeki önizleme ve sunucu çıktısı geometrik olarak karşılaştırılır; estetik mockup baskı doğruluğu kanıtı sayılmaz.

Analiz2 K-12 ve K-14–K-21 için Web Designer iki ayrı giriş yolunu tasarlar: `(a) ürün seç → beş eksenden beş soru → her soruda dört seçenek → dört kullanılabilir AI adayı`, `(b) ürün seç → kendi görselini yükle`; iki yol ortak temsili ürün önizlemesi, kayıt ve uygunluk kontrolünde birleşir. “Temsilidir” etiketi kalıcı okunabilir metindir. Creative art direction; ürün malzemesi, ışık ve gölgeyi korur, sap/kulp/cam/plastik ve onaysız yüzeyleri maskenin dışında bırakır. Fiziksel örnek ve D04 onayı olmadan önizleme üretime uygunluk kanıtı sayılmaz.

## 3. İş ve dönüşüm kuralları

1. Ürün/varyant yalnız `personalizationEnabled=true` ve en az bir etkin `PrintArea` ise editörü açar. Varyant değişirse mevcut tasarım otomatik olarak başka alana taşınmaz: alan eşleşmesi doğrulanır, kullanıcıya uyarı gösterilir; uyumsuz tasarım sepete gidemez.
2. `PrintArea` fiziksel genişlik/yükseklik, güvenli marj, yüz (`front/back`), koordinat başlangıcı, izinli katman/dosya türü ve gerekirse seçili varyant kimliği içerir. Tuval normalize koordinatla veya mm cinsinden tutulur; tercih Faz00 teknik kararında tekleştirilir. Önizleme ve baskı motoru aynı dönüşüm ve font metriklerini uygular. Ölçek/rotasyonla taşan katman, yalnız merkezi nokta içeride diye geçerli sayılmaz; dönüştürülmüş sınır kutusu ölçülür.
3. Basit akışta metin/isim, font, boyut, renk, logo/görsel yükleme, taşıma, ölçekleme, döndürme, alan/yüz seçme, canlı önizleme ve not. Gelişmiş editörde metin/görsel/şekil katmanı, sıralama, kilit/gizle, hizalama, kopyala/sil, sürükle-bırak, geri/ileri al, kategorili şablon ve tasarım geçmişi bulunur. Yüklemenin ve AI görsel aktarmanın durumu `bekliyor/başarısız/yeniden dene/hazır` görünür; başarısız medyaya baskı referansı yazılmaz.
4. Kalite kontrolü orijinal piksel çözünürlüğünü fiziksel baskı ölçüsüne karşı hesaplar; tarayıcı uyarısı kullanıcıya anlaşılır bilgi verir, sunucu kritik kuralı tekrar uygular. D04'ün ürüne özel eşikleri ve operatör istisna/onay politikası ayrı konfigürasyonda tutulur. Ön/arka alanların baskı operatörü tarafından ayrı çıktısı alınır.
5. Tasarım `Design → DesignVersion → DesignLayer` olarak sürümlenir. Kaydetme yeni değişmez sürüm üretir, eşzamanlı eski sürüm kaydı 409 ile çatışma gösterir. Undo/redo açık editör oturumunda işlemleri geri sarar; kalıcı geçmiş sürümler ayrı saklanır. Sipariş satırı `designVersionId`, varyant ve fiyat farkının değişmez anlık görüntüsünü taşır; sonradan tasarım düzenleme eski siparişi ve baskı dosyasını değiştirmez.
6. Sepete eklemeden önce backend ürün/varyant/alan, medya sahipliği, sınır, DPI, font lisansı ve güncel fiyat farkını doğrular. Sepet anlık görüntüsünün süresi/yeniden doğrulaması Faz05 sözleşmesindedir. Checkout aynı sürümü yeniden doğrular ve sipariş satırına sabitler. Çıktı işlemi beklerken operatör “hazır” görmez; çıktı üretilmezse denetlenebilir hata ve güvenli yeniden deneme vardır. Dosya yalnız ilgili operatör yetkisiyle indirilebilir.
7. **Kullanıcının yüklediği görsel ve logo:** Teknik kontrollerin (MIME, boyut, zararlı içerik) yanında içerik uygunluğu ve hak kontrolü yapılır. Kullanıcı yükleme sırasında görselin kullanım hakkına sahip olduğunu açıkça beyan eder; beyan sürümü ve zamanı tasarım sürümüne bağlanır. Uygunsuz içerik (şiddet, müstehcenlik, nefret, açık marka/telif ihlali şüphesi) otomatik moderasyonla veya baskı öncesi operatör incelemesiyle işaretlenir. İşaretli tasarım "baskıya hazır" olamaz, müşteriye gerekçe bildirilir. Moderasyon aracı ve operatör onay politikası D04/D10 ile kararlaştırılır; AI çıktısı moderasyonu Faz10'dadır.
8. AI'dan üretilmiş görsel gelecek fazda `Asset` olarak alınır ve ayrı görsel katmana konur; katmanlı içerik vaat edilmez. İçerik/medya lisansı, kabul edilen dosya formatları ve notun baskı dosyasına işlenip işlenmeyeceği D04 ürün kararıdır.

## 4. Somut geliştirme iş listesi

### Veri, API ve çıktı

- DB Admin: `PrintArea(productId,variantId?,face,widthMm,heightMm,safeMarginMm,version,enabled)`, `Template(category,assetId,status)`, `Design(ownerId,productId,variantId,status)`, `DesignVersion(designId,version,printAreaVersion,document,notes,createdAt)`, `DesignLayer` veya sürüm içi belgede katmanlar, `GeneratedAsset` referansı, `PrintOutput(designVersionId,face,format,status,assetId,checksum,error)`, sipariş satırı bağını migration ile oluşturur. Var olan Faz04 `Asset` ve Faz05 `OrderLine` tablolarıyla anahtar/kısıt kurar. D04 basım standardını versiyonlu saklar; siparişte alan kuralı anlık görüntüsünü korur. Büyük belge/çıktı nesne deposunda, DB'de adres ve bütünlük hash'i bulunur.
- Backend sözleşmesi örneği: `GET /catalog/variants/{id}/print-areas`, `GET /design/templates?productId=&category=`, `POST /designs` (ürün/varyant/alan kimliği), `PUT /designs/{id}/versions` (`baseVersion`, belge), `GET /designs/{id}/versions/{version}`, `POST /designs/{id}/validate`, `POST /designs/{id}/versions/{version}/render`, `GET /designs/{id}/history`, `GET /admin/orders/{orderId}/lines/{lineId}/print-outputs` ve yetkili kısa ömürlü indirme URL'si. Dosya yükleme Faz03 güvenli medya API'sini kullanır. Metot/yol sürümü Faz00 ortak sözleşmesine göre sabitlenir.
- Belge sözleşmesi: `{schemaVersion,productId,variantId,printAreas:[{printAreaId,printAreaVersion,face,layers:[{id,type,assetId?,text?,fontId?,fill?,x,y,width,height,rotation,zIndex,visible,locked}]}],notes}`; şema/koordinat birimi, izinli alanlar, kaynak medya boyutu, font ve minimum çözünürlük birlikte sürümlenir. İstemci tarayıcı canvas piksel koordinatını kalıcı kaynak yapmaz. `DesignVersion` yanıtı `{id,revision,validation:{errors,warnings},personalizationPrice}` içerir. Sunucu geçersiz şema/alan için 422, başka kullanıcı tasarımı için 403/404, eski sürüm için 409 ve çıktı henüz hazır değilse açık iş durumu döner.
- Render worker çıktıyı gerçek fiziksel alana, baskı profiline ve D04 formatına göre üretir; aynı `designVersionId + areaVersion + outputProfileVersion` işi için tekrar istekleri aynı kayıtla eşler. `queued/running/ready/failed` durumu, hata ve tekrar sayısı panelde izlenir. Siparişte referanslanan sürüm asla üstüne yazılmaz; render testi fiziksel ölçü/DPI/font/görsel konumu karşılaştırmasını içerir.
- Dosyaların sahiplik, MIME/gerçek içerik, boyut, piksel, kötü amaçlı içerik ve erişim süresi doğrulanır; SVG/uzak URL/font kullanımı güvenli listeye tabidir. Sipariş dosyası halka açık URL olmaz. Şablon ve fontun kullanım lisansı Creative/ürün ekibiyle kaydedilir.

### Frontend ve panel

- Ürün detayındaki “kişiselleştir” eylemi seçili **aynı** `variantId` ve doğru ürün görseliyle basit akışı açar. Şablon seçimi/yeni tasarım, ön/arka yüz ve alanlar, metin/logo/görsel, font/boyut/renk, taşı/çevir/ölçekle, kaydet/yeniden aç, not ve fiyat farkı. Gelişmiş araçlarda katman listesi ve sürükleme yanında klavye ile değer girme/hizalama/kilit/görünürlük/sıra ve geri/ileri al.
- Taşma ve kalite uyarıları alan üzerinde ve katman listesinde gösterilir; yoğun editörde yükleme/kaydetme göstergesi ve yeniden deneme vardır. Kullanıcı sayfadan ayrılırken kaydedilmemiş değişiklik uyarısı alır. Mobil dar ekranda araçlar kullanılabilir kalır; Faz mobil uygulama aynı API ve tasarım belgesi davranışını korur, yalnız web editörü için ayrı gerçeklik oluşturulmaz.
- Sepete tasarım sürüm kimliği, varyant, yüz/alan ve fiyat farkı bağlanır; satır özetinde küçük önizleme ve not gösterilir. Düzenleme varsa yeni sürüm oluşturulur ve ancak kullanıcı sepet satırını güncellerse yeni sürüme geçilir. Sipariş tamamlandığında müşteri kayıtlı önizleme ve sürümü; operatör panelde çıktı durumu, alan, sürüm, kalite uyarısı ve izinli indirme bağlantısını görür. İş kuralı onayı gerektiren tasarım “baskıya hazır” diye işaretlenmez.
- Panelde ürün/varyant baskı alanı ve kuralları, şablon/kategori, tasarım listesi, sürüm görüntüleme, çıktı indirme, yeniden oluşturma ve hata izi yer alır. Alan değişikliği eski sipariş sürümlerinin üretilebilirliğini bozmaz.

### Önerilen repo yerleşimi

`apps/web/src/features/{personalization,editor}`, `apps/admin/src/features/{print-areas,templates,designs}`, `packages/design-document/{schema,geometry}`, `packages/contracts/design.openapi.yaml`, `services/api/modules/{design,print}`, `services/worker/jobs/render-print`, `design/screens/Faz06/`. Yollar öneridir; Faz00 repo kararına göre kesinleştirilir. UI ile çıktı motorunun ortak şema/koordinat test vektörleri sürümlü dosyada tutulur.

## 5. Hata, test ve kabul senaryoları

| Senaryo | Ölçülebilir beklenen sonuç |
|---|---|
| Ön/arka alan, döndürülmüş kenar katmanı | Ekran ve baskı çıktı alanı aynı koordinatı verir; döndürme sonrası gerçek sınır taşma olarak işaretlenir; fiziksel ölçü örneğiyle karşılaştırılır. |
| Yüklenen düşük çözünürlüklü logo | Fiziksel basım boyutunda sunucu ve UI aynı D04 kalite sonucunu verir; politika engelliyorsa checkout başarısız, izinli istisnaysa operatör kararı kayıtlıdır. |
| Gri varyanttan mavi varyanta geçiş | Görsel ve baskı alanı mavi varyanta göre tekrar yüklenir; uyumsuz gri tasarım satıra sessizce taşınmaz. |
| Ağ kesintisiyle çift kaydetme veya iki sekme | Tek sürümün tekrar gönderimi mükerrer sürüm yapmaz; eski temel sürüm 409 ve çözüm ekranı gösterir. |
| Kaydet, kapat, yeniden aç, undo/redo | Katman sırası/konum/font/ön-arka/not ve kaydedilmiş sürüm korunur; undo/redo oturum işlemlerini doğru tersler. |
| Sepet sonrası tasarımı değiştir | Sipariş/sepette bağlanan eski sürüm kendiliğinden güncellenmez; yeni sürüm açık eylemle bağlanır. |
| Baskı işleyicisi hata/zaman aşımı | Sipariş kaydı kaybolmaz; çıktı başarısız görünür, güvenli yeniden deneme aynı sürüm için izlenir, indirilemeyen dosya “hazır” gösterilmez. |
| Başka müşteri veya yetkisiz personel dosyayı ister | API 403/404 verir; kısa süreli indirme adresi yetki sonrası üretilir, denetim izi tutulur. |
| Kullanıcı hak beyanı vermeden veya uygunsuz görsel yükler | Hak beyanı yoksa görsel tasarıma eklenmez; uygunsuz işaretli tasarım sepete/baskıya gidemez, operatör kararı auditlidir. |
| Geçmiş siparişin baskı alanı sonra değişir | Eski siparişin çıktı alanı o siparişte kayıtlı kural sürümünden yeniden üretilebilir; yeni alan yalnız yeni tasarımlara uygulanır. |

**Kabul kapısı:** Xinobi ürün/üretim yetkilisi D04 baskı örneği ve eşikleriyle gerçek baskı dosyası önizleme uyumunu onaylar; basit ve gelişmiş akış, ön/arka/çok alanlı tasarım, sürüm, sepet/checkout/sipariş ve panel indirme uçtan uca gösterilir. Webde ve mobil API sözleşme testlerinde aynı tasarım sürümü kullanılır; mobil uygulama gerçek cihaz kabulü kendi fazında ayrıca kapanır. Kritik taşma/çözünürlük/güvenlik hatası açıksa faz kapatılmaz.

**Teslim kanıtı:** Creative tasarım dosyası/prototip ve FE teslim notu; D04 fiziksel ölçü/çıktı profili kararı; migration/OpenAPI/JSON şema; geometri ve render karşılaştırma vektörleri; ekran ve panel kaydı; örnek sipariş satırı/sürüm/çıktı hash'i; erişim, eşzamanlılık, hatadan dönüş test raporu; Faz00 commit/karar/sonraki adım girdisi.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~47 % · kalan ~53 % · Statü: Bloke (D04, T-04)**

**16.10 güncellemesi (kod/commit incelemesi):** Görsel yükleme optimizasyonu, varyantlar arasında kompozisyonun korunması, editör → Tasarımlarım → sepet boyunca fotoğraf yerleşiminin web/mobilde taşınması eklendi (`62f971a`, `865f20a`, `8d99783`, `f4adc49`). HTTP tasarım oturumu ve herkese açık katalog önizlemesi düzeltildi (`19ac66f`). Baskı sürümü/PrintArea/çıktı kabulü açık. Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

| İş | Durum | Kanıt / eksik |
|---|---|---|
| Ürün yüzey maskeleri | Tamam (20.10 sadeleşti) | Resim yüklemeli akış: kaynak indir → maske promptu → kayıpsız WebP maske taslağı → tek renkte veya aynı boyut/konumdaki renklerde tek onay (`12455a4`, TST-133). Roboflow, fırça, eğri ve renk başına hizalama admin+API’den kaldırıldı; tarihsel kanıt: Step 1–5B, `6ff45a0`, TST-121–131 |
| Basit kişiselleştirme / XINOBI U önizleme | Tamam | Web + mobil onaylı yüzey renderer (`88d80e0`, `b1573d0`); ortak maskeli renkler arasında geçiş ve ekran yeniden tasarımı (`250deff`, TST-132). Önizleme e2e testleri TST-134 ile geçiyor; CM121 yayın paketinin boyut hatası düzeltildi |
| Kendi görselini yükleme, taşı/boyut/döndür | Kısmi | Web+mobil (`fe93107`, TST-107); metin, şekil, katman listesi, ön/arka, geri/ileri yok |
| Kaydet/yeniden aç (Tasarımlarım) | Kısmi | Hesaba bağlı tasarımlar; değişmez `DesignVersion` ve geçmiş yok |
| Sepet/siparişe tasarım bağlama | Kısmi | Sunucu sahiplik denetimi, siparişe görsel kopyası (`49618a1`); fiyat farkı ve sürüm güncelleme akışı yok |
| Fiziksel `PrintArea` (mm), DPI/taşma kontrolü | Bloke | D04, T-04 |
| Şablon kategorisi | Yok | — |
| Baskı çıktısı render işçisi ve panel indirme | Yok | `PrintOperations.tsx` prototip |

**16.10 ortak maske denemesi:** Kaba fırça kılavuzundan iç noktalarla Roboflow visual aday üretimi, seçili aynı konumdaki renklere tek onay, örnek desen/renk önizlemesi ve web Development rendering köprüsü eklendi. [Akış ve sınırlar](../docs/runbooks/guided-shared-product-mask.md), [TST-121](../test/2026-10-16/TST-121-guided-shared-mask.md). Gerçek AI kenar kalitesi denenmedi; %45 tahmini ve faz kabulü değişmedi.

**16.10 boyama sınırı:** Elle gösterme çıktısı artık kılavuzla kesiştirilir; varsayılan tolerans 0, açık seçimle 0–16 kaynak pikseli. Örtüşmeyen sonuçta boyama korunur. [TST-125](../test/2026-10-16/TST-125-guided-mask-containment.md), 62/62 ve admin akışı başarılı. Önceki geniş AI taslakları değişmedi; gerçek kalite kabulü verilmedi.

**20.10 güncellemesi:** Maskeleme yalnız resim yüklemeye indirildi; aynı tuvalde üretilmiş renk fotoğraflarına tek ortak maske uygulanıyor (Demo Tasarım 5 renk, 1333×2000). Renk fotoğrafı üretimi için hizalı prompt (`docs/runbooks/colour-photo-generation-prompt.md`, panel Katalog → Medya). Web önizleme ortak maskeyi yerel API’den okuyor; aynı maskeli renklerde yerleşim aktarımı atlanıyor. Kendi desenini yükleme modu eklendi. **Açık eksikler:** ~~11 XINOBI önizleme e2e gerilemesi~~ TST-134 ile düzeltildi (CM121 yayın paketi orijinal boyutta yayımlanıyordu; test kataloğu/proxy eksikti); maske üretiminin piksel hizası garantisiz (AI/elle panel dışı); eski Tea Maker inceleme API’si, CM101 aday komutu ve `tools/local-mask-editor` varsayılan kapalı ama kodda; `068e976` ile baskı kaynağı yokken prototip baskı işlemleri kapatıldı, baskı çıktısı yine yok; PrintArea/DesignVersion D04/T-04. Değişiklikler `feature/surface-masking-preview-20261020` branch’inde, `main`/canlıda değil. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

**Sonraki adım:** D04 baskı ölçülerini almak; T-04 tuval birimini karara bağlamak.

## 6. Yedi rol inceleme ve PM nihai onayı

Her imza Faz00 içinde tarih, gerçek kişi, kanıt bağlantısı, açık bulgu ve çözümle kaydedilir. Şimdiki kutular **beklemede**.

- [ ] İş Analisti — kişiselleştirme iş kuralı, D04 sahibi ve uçtan uca kullanıcı senaryosunu onayladı.
- [ ] Sr. Creative Designer — ürün görselleştirme, baskı alanı sunumu, şablon/font lisansı ve UI/UX teslimini onayladı.
- [ ] Sr. Frontend Developer — tasarım uygunluğu, etkileşim, erişilebilirlik, sürüm ve hata durumunu onayladı.
- [ ] Sr. Backend Developer — şema, sahiplik, render tekrar güvenliği, doğrulama ve sipariş bağını onayladı.
- [ ] DB Admin — sürüm bütünlüğü, alan anlık görüntüsü, varlık/çıktı referansı ve migration'ı onayladı.
- [ ] Sr. Full Stack Developer — web/panel/API/sepet/çıktı uçtan uca akışı ve mobil sözleşme uyumunu onayladı.
- [ ] Web Designer (ek zorunlu rol) — XINOBI U iki giriş yolu (beş soru / kendi görseli), "Temsilidir" etiketi ve önizleme etkileşiminin onaylı tasarıma uygunluğunu onayladı.
- [ ] Proje Yöneticisi — **zorunlu nihai onay**; altı inceleme, D04 üretim kararı, gerçek baskı örneği ve kabul kanıtlarını Faz00'a işleyerek fazı kapattı.


## 05.11.2026 — SIP-TAS-01…09 güncel regresyon

[TST-252](../test/2026-11-05/TST-252-order-design-regression.md): 36 API PASS / 1 SQL SKIP / 0 FAIL; beş admin tarayıcı paketi, 21 dosya durumu ve 7 eski kayıt senaryosu, dört genişlik/%200 metin, admin build/lint geçti (4 eski lint uyarısı). Yeni uygulama kusuru bulunmadı; kod/veri değiştirilmedi. SQL/IIS/manuel cihaz ve PM kabulü açık; deploy yapılmadı.


## 05.11.2026 — Admin UI/UX denetimi

[TST-253](../test/2026-11-05/TST-253-admin-ux-audit.md): 20/20 izole admin test dosyası PASS; 64 responsive matris satırı, 48 boş/hata/yetki durumu. Sipariş/kargo odaklı denetimde 3 P1 ve 4 P2 bulgu; taslak kaybı, kritik onaylar ve varsayılan sağlayıcı teyidi öncelikli. Bu teslim denetim/önceliklendirme; uygulama düzeltmesi yapılmadı, gerçek veri/deploy yok. Rapor: `design/admin-ux-audit-2026-11-05.md`.


## 05.11.2026 — UI/UX bulguları düzeltme turu

[TST-254](../test/2026-11-05/TST-254-admin-ux-fixes.md): ADM-UX-01…07 için taslak/ayrılma ve busy koruması, kritik işlem özeti/onayı, tarafsız manuel teyit, readonly alanlar, dürüst etiket handoff mesajı ve ortak form düzeni uygulandı. Gerçek veri/sağlayıcı/deploy yok. SQL/IIS/manuel cihaz ve PM kabulü açık. Nihai test sonuçları raporda.


## 05.11.2026 — Yayın öncesi birleşik regresyon

[TST-255](../test/2026-11-05/TST-255-pre-release-regression.md): API 595 PASS / 29 SKIP / 0 FAIL; admin 21/21 dosya + ayrıca üretim profilinde MFA/login/logout testi PASS; web 24/24 e2e, lint/tip ve üretim derlemeleri PASS. Yerel yazılım engeli bulunmadı. Sürat gerçek kabulü, ödeme/sevk uygunluğu, SQL çoklu süreç, IIS/SMTP/cihaz/PM ve yeni repo sunucu erişimi raporda açık. Canlı Sürat kapalı; deploy/paket yayını yapılmadı.


## 06.11.2026 — Kişiselleştirmede tek kaynak fotoğraf/maske planı

Kullanıcı kararı: desenli ürünler için çoklu renk ve renkler arası hizalama gerekmiyor. Güncel revizyon: fotoğraf üretim promptu kaldırılacak; doğrudan yüklenen tek görsel kaynak olacak ve sabit piksel boyutu/en-boy oranı şartı olmayacak. Kaynak indirme ve maskeleme promptu korunacak; prompt boyutu kaynağın gerçek ölçüsünden alınacak, diğer maskeleme kuralları aynen kalacak. Birden fazla görsele aynı maskeyi uygulama/toplu renk onayı kaldırılacak. Maskenin kendi fotoğrafıyla ölçü/koordinat eşliği ve sipariş dosya güvenliği sürecek. Task 01–03 aynı; 04–12 revize edildi. [12 tasklık değişiklik planı](../docs/tasks/personalization-single-source-tasks-2026-11-06.md); bu fazla ilişkili tasklar: **KIS-TEK-05,06,10**. Hepsi açık; yalnız plan hazırlandı, uygulama/veri geçişi/deploy yapılmadı. Normal ürün renkleri ve tarihsel siparişler korunacak.


## 06.11.2026 — KIS-TEK-02 salt okunur envanter ve geçiş planı

[Envanter/plan](../docs/reports/personalization-migration-plan-2026-11-06.md): SQL 24 ürün/79 varyant/39 tasarım/19 revizyon; 7 kişiselleştirilebilir ürünün kaynak ve SKU seçimleri boş bırakıldı. 2 taslak ve 8 published önizleme güncel varyantlardan kopuk. 28 tasarım dosyası yerelde yok; IIS kaybı diye yorumlanmaz. Manifestli 2 sipariş satırında 6 dosya hash/boyut PASS; 7 legacy satır korunur. Eski SourceSha256 desen hash’idir; ürün kaynağı hash’ine dönüştürülmeyecek. Task 02 planlama tamam; seçim, restore/apply ve IIS karşı kontrolü yapılmadı. Gerçek veriye yazma/deploy yok.


## 06.11.2026 — KIS-TEK-03 admin tek kaynak yönetimi

Katalogda bağımsız kaynak seç/yükle/kaydet/indir alanı; renk/HEX bağımsızlığı, değişmez kaynak kopyası, revizyon çakışması, kaynak yok/hata/yetki/stale/başarı, taslak/ayrılma/çıkış koruması eklendi. Yeni kaynak mağazadaki önizlemeye henüz bağlanmıyor; maske ve web/Flutter/checkout 05–10’da, fotoğraf promptunu kaldırma 04’te açık. [Runbook](../docs/runbooks/personalization-source-management.md), [TST-258](../test/2026-11-06/TST-258-personalization-source-management.md). API 601 PASS/29 SKIP/0 FAIL; admin seri 23/23 paket, yeni alan responsive/klavye/axe PASS. Gerçek veri değişmedi; yerel servisler yenilendi; deploy/APK yok.


## 06.11.2026 — KIS-TEK-04 doğrudan kaynak, fotoğraf üretim promptu kaldırıldı

Katalog ana ekranı ve Medya sekmesindeki fotoğraf üretim promptu; üretici/MASTER/renk/HEX/1333×2000 kodu ve kullanılmayan CSS kaldırıldı. Doğrudan kaynak yükleme/indirme korunur; 5001×3730 PNG bayt karşılaştırması PASS. Maskeleme promptu değişmedi. [TST-259](../test/2026-11-06/TST-259-direct-source-no-photo-prompt.md). Task 04 tamam; yeni kaynağın maske onayı ve çoklu renge uygulama temizliği 05/06’da, müşteri akışı 07–10’da açık. Gerçek veri veya sunucu ayarı değiştirilmedi; deploy/APK yok.


## 06.11.2026 — Kullanıcı isteğiyle KIS-TEK-03/04 tekrar kontrolü

3. task 191c45a, 4. task fc668e7 içinde mevcut. Yeniden incelemede katalog yenilenmesinin kaydedilmemiş kaynak seçimini farklı ürüne geçirip kaybettirebildiği bulundu ve düzeltildi: seçim ürün kimliğine sabitlendi; işaret kaldırılır/silinirse taslak korunur, kayıt kapanır. Yeniden açılınca devam edilir. 4. taskın iki prompt girişi yokluğu ve 5001×3730 PNG tam bayt yükleme/indirmesi yeniden PASS. [TST-260](../test/2026-11-06/TST-260-source-task03-04-recheck.md). Gerçek veri/deploy yok; 5. taska geçilmedi.


## 06.11.2026 — KIS-TEK-05 tek kaynak maskeleme

Ürün başına tek kaynak/sürümle maske yükleme, taslak, tek onay, geri alma ve gerçek WebP indirme uygulandı. Renk önizlemesi, ortak renk listesi, aynı konum kutusu ve toplu onay UI’dan kaldırıldı. Promptun maskeleme kuralları korundu; gerçek kaynak boyutu/hash/sürümü kullanılır. Kaynak değişimi eski maskeyi uygulamaz; geçmiş dosyalar korunur. [Runbook](../docs/runbooks/single-source-masking.md), [TST-261](../test/2026-11-06/TST-261-single-source-masking.md). API 607 PASS/29 SKIP; yeni maske tarayıcı paketi ve admin durum regresyonu PASS. Eski yazma rotaları/public yayın/istemci uyumu ve 20 MP bütçe 06’da açık. Gerçek veri/AI/deploy/APK yok.

## 09.11.2026 — KIS-TEK-06 tek kaynak yayın API

Ürün bazlı güncel kaynak/onay yayın ucu, sürüm/hash kontrollü dosyalar ve gerçek boyut metadata'sı uygulandı. Eski renk/toplu onay yazma yolları 410; tarihsel GET ve dosyalar korunur. Tek kaynak maske işleme sabit 20 MP yerine ayarlanabilir RAM bütçesi kullanır; otomatik küçültme yok. OpenAPI/TS/Dart ve salt okunur yayın manifest aracı hazır. API 615 PASS / 29 SKIP / 0 FAIL; Dart 10, tools 5; Release 0 hata/uyarı. [TST-263](../test/2026-11-09/TST-263-single-source-publication.md), [rehber](../docs/runbooks/single-source-publication.md). KIS-TEK-07–12, gerçek kaynak/SKU eşlemesi ve veri geçişi açık; deploy/APK yapılmadı. Kullanıcı talimatıyla bundan sonraki doğrulanmış commitler iki repoda aynı geçmişle tutulur: mostidea/xinobi_new ve beyzaturgut/XinobiYeni.

## 09.11.2026 — KIS-TEK-07 web tek kaynak akışı

XINOBI U katalog, ürün girişi, yöntem, yükleme, AI soru/sonuç ve önizleme ürünün tek onaylı yüzeyine bağlandı; yeni akış renk seçtirmez. Normal katalog renk/fiyat/stok alışverişi ve tarihsel açık varyant okuyucusu korunur. Gerçek x/y koordinatları değiştirilmeden geçici canvas bütçesi kullanılır. 320/390/768/1440, %200 metin, klavye/axe, geri/ileri, dosya ve hata ayrımı dahil 16 izole tarayıcı testi; web lint/TS/üretim derlemesi PASS. %200 düğme çakışması görsel incelemede düzeltilip doğrulandı. [TST-264](../test/2026-11-09/TST-264-single-source-web.md), [rehber](../docs/runbooks/single-source-web.md). Yeni yüzey için kayıt/sepete ekleme ve ticari SKU/revizyon doğrulaması 09 kapsamında açık; bu aşamada yanlış varyantla yazma yapılmaz. AI sunucusundaki eski ilk-fotoğraflı varyant fallback'i de 09'da açık. Sırada 08 Flutter vardır; 09–12, gerçek kaynak/SKU seçimi/veri geçişi ve cihaz/IIS kabulü sürer. Deploy/APK/gerçek AI üretimi yapılmadı.

## 09.11.2026 — KIS-TEK-08 Flutter tek kaynak geçişi

Ürün bazlı sıkı yüzey API/DTO, autoDispose provider, ürün+source revision+mask/hash oturum anahtarı ve renk istemeyen yöntem/anket/WebView girişleri uygulandı. Normal satış renkleri ve tarihsel configuration/placement kayıtları korunur; yeni yerleşim web ile aynı renderer'da çalışır. Eski native ilk-varyant/renk editör yazma yolu compatibility yönlendirmesine taşındı. %200 ürün kartı/liste taşmaları giderildi. Flutter 298/298 PASS, analiz temiz. Android/iOS tema hedeflerinde 320/390/768 × %200 ayrı 3/3 PASS; gerçek cihaz/OS/WebView/galeri/VoiceOver-TalkBack kabulü açık (cihaz yok, simctl yok). [TST-265](../test/2026-11-09/TST-265-single-source-mobile.md), [rehber ve ayrı platform kayıtları](../docs/runbooks/single-source-mobile.md). Sırada 09 kayıt/sepet ve ticari SKU/revizyon bağı var; yeni kaydet/sepete ekleme henüz kapalı. 10–12, gerçek veri geçişi ve 08 cihaz kapısı sürer. Deploy/APK/iOS arşivi yapılmadı.

## 09.11.2026 — KIS-TEK-09 tasarım revizyonu ve satın alma bağı

Ürün başına açık ticari SKU seçimi admin kataloğa eklendi; fotoğraf/renk sırası fallback değildir. Schema-2 configuration ürün, profil/kaynak revizyonu, yüzey, fotoğraf/maske hashleri, ham ölçü ve ticari varyantı ayrı saklar. Web/Flutter WebView kayıt/favori/sepet ve checkout bu bağı doğrular; yanlış desen/ürün/yüzey, stale revizyon, eksik fiyat/stok ve eksik yeni önizleme güvenli reddedilir. Eski kayıt/siparişler yeniden yazılmaz; yeni kaynağa geçiş açık yerleştirme eylemidir. AI null variant artık onaylı tek ürün kaynağını kullanır; TS/Dart sözleşmesi nullable'dır. API **618 PASS / 29 SKIP / 0 FAIL**, son odaklı 3; web **19/19 + 2 odaklı**, admin kaynak/SKU matrisi PASS; Flutter **298 PASS**, analiz temiz; Dart **12 PASS**. Web/admin/API derleme ve ilgili lint/TS geçti; admin AuditHistory'de bir mevcut lint uyarısı kaldı. [TST-266](../test/2026-11-09/TST-266-single-source-design-checkout.md), [rehber](../docs/runbooks/single-source-design-checkout.md). İşletmenin gerçek ürün/SKU seçimi, 23 içerik/SKU 117 fiyatı ve gerçek veri geçişi yapılmadı. Sırada KIS-TEK-10 sipariş görünümü/üç dosya geçmiş kabulü; 11–12 ve Android/iOS gerçek cihaz/IIS/SQL çoklu süreç kapıları açık. Yerel servisler güncellendi; deploy/release/APK yok.

## 09.11.2026 — KIS-TEK-10 sipariş yüzeyi ve üç dosya

Admin sipariş detayı schema-2 yüzey/kaynak/profil kimliğini, gerçek ham koordinatları ve fotoğraf/maske/desen hashlerini yorumlar. Yeni satırın ticari rengi gizlenir; eski sipariş rengi ve kopyaları korunur. Desen, orijinal ürün fotoğrafı ve giydirilmiş önizleme yalnız sipariş kopyalarından ayrı iner; güncel katalog/tasarım kullanılarak doldurulmaz. Source indirmesinde eski 20 MP/EditorCanvas varsayımı yeni modele taşınmadı. Bozuk JPEG başlığı artık dosya sayılmaz; tüm preview yüklemeleri ve sipariş kopyaları ilgili decode/hash/tür/uzunluk kontrollerinden geçer. Yeni/manifestli müşteri siparişinde kayıp önizleme canlı configuration ile değiştirilmez. API **623 PASS / 29 SKIP / 0 FAIL**, admin yeni matris + 5 legacy script PASS, web **7/7**, Flutter **302 PASS**; analiz/type/lint/build ve görsel QA tamam. Admin AuditHistory'deki mevcut bir lint uyarısı açık. [TST-267 / 9 alt task matrisi](../test/2026-11-09/TST-267-single-source-order-files.md), [rehber](../docs/runbooks/single-source-order-files.md). Gerçek kaynak/SKU seçimi, veri geçişi/backfill, SQL/IIS, iş sahibi ve cihaz/ekran okuyucu kabulü açık. Sırada KIS-TEK-11; 12/UAT sürer. Üretim/sevk eylemi, deploy/release/APK eklenmedi.


## 10.11.2026 — KIS-TEK-11 güncel akış ve tarihsel araç temizliği

[Güncel tek kaynak rehberi](../docs/runbooks/single-source-personalization.md) tek giriş noktası oldu; eski fotoğraf üretimi, aile/renk hizalama ve ortak maske belgeleri tarihsel olarak işaretlendi. [Çağıran/araç envanteri](../docs/reports/single-source-workflow-inventory-2026-11-10.md) kullanılan legacy yayınlama/import/QA araçlarının neden korunduğunu kaydeder. Admin kaynak/maske ekranındaki yanıltıcı eski önizleme mesajları ve kullanılmayan renk prompt dalı temizlendi. [TST-268](../test/2026-11-10/TST-268-single-source-workflow-cleanup.md) odaklı doğrulama kaydıdır; 12 birleşik regresyon ve gerçek cihaz/SQL/IIS kabulü açık kalır. Normal katalog, fiyat/stok, kargo/ödeme ve eski dosyalar değiştirilmedi; gerçek veri geçişi, deploy/release/APK yok.


## 10.11.2026 — KIS-TEK-12 yazılımsal birleşik kabul

[TST-269](../test/2026-11-10/TST-269-single-source-acceptance.md): kaynak yükle/indir → doğru WebP maske/onay → açık ticari SKU → revizyonlu tasarım → demo sipariş → üç değişmez dosya, aynı izole API kaydıyla 73×41 / 41×73 / 79×79 / 5001×4000 için PASS. Tam API 627 PASS/29 SKIP; web 19+7, Flutter 302, Dart 12, araç 5 PASS; admin 24 paket + genel ekran matrisi tekli tekrar PASS (ilk Chrome beklemesi raporda ayrı). API/web/admin lint-tip-üretim ve TS/OpenAPI eşliği PASS; adminin eski AuditHistory uyarısı aynı. [Kabul/tekrar rehberi](../docs/runbooks/single-source-acceptance.md), [Android](../docs/reports/single-source-acceptance-android-2026-11-10.md), [iOS](../docs/reports/single-source-acceptance-ios-2026-11-10.md). **Gerçek cihaz, SQL çoklu süreç/IIS/restore ve iş sahibi kabulü açık.** Gerçek kaynak/SKU seçimi ve veri geçişi, 23 ürün içeriği/SKU 117 fiyatı, ödeme/kargo sağlayıcı kabulü bu taskla kapanmaz. Gerçek veri yazımı/deploy/release/APK yok; fazın canlı kabulü tamamlandı sayılmaz.


## 10.11.2026 — Kullanıcı kararı: katalog tek kaynak bölümünü kaldırma

Katalogdaki “XINOBI U · Tek kaynak fotoğraf” accordion'u ve yalnız bu alanda kullanılan fotoğraf/SKU yönetimi bileşenleri kaldırıldı; maske ekranının bu alana yönlendirmesi temizlendi. [Kapsam kararı](../docs/decisions/catalog-source-section-removal-2026-11-10.md), [TST-270](../test/2026-11-10/TST-270-catalog-source-section-removal.md). Önceki 03/04/09 UI teslimleri tarihsel kalır; tüm backend modelini veya mevcut profil/maske/tasarım/sipariş dosyalarını silme kararı değildir. Normal katalog renk/medya/fiyat/stok korunur. Alternatif kaynak/SKU ekranı eklenmedi; gerçek veri/geçiş/deploy/APK yok. Yerel geçici süperadmin ayarları Git dışında kalır.
