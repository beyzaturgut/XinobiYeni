# Faz06 — Kişiselleştirme, gelişmiş editör ve baskı dosyası

## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**Bu fazın işi:** Ana sorumluluk KIS-03/KIS-07; SIP-TAS-01...09. KIS-01/05/06 üretim hedefleri kapsam dışı; tamamlandı sayılmaz. KIS-02 görsel maske doğruluğu, KIS-04 genel editör kapsamı ve KIS-08 fiyat/dosya teslim kabulü sürer.

**03.11 SIP-TAS-05 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/source` (`orders.read`), editörün maskelediği ürün fotoğrafının sipariş anındaki kopyasını veriyor. SHA-256, baytlardan saptanan tür ve fotoğraf ölçüsünün kayıtlı editör tuvaline eşitliği doğrulanıyor; dosya adı `…-urun-kaynak-{SKU}`. Kopya yoksa nedeni yazılıyor; katalog fotoğrafı, başka renk veya maske yedek olarak verilmiyor. Admin kartında kilitli indirme düğmesi var. Katalog/renk/maske değişimi, yol aşımı ve keyfi URL senaryoları izole testte PASS. API 508 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. [TST-223](../test/2026-11-03/TST-223-sip-tas-05-source-download.md). SIP-TAS-06…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-04 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` (`orders.read`) siparişe bağlı desen kopyasını sunucuda sipariş/satırdan çözüyor. Baytlar değiştirilmeden, SHA-256 ve baytlardan saptanan MIME doğrulanarak `xinobi-{no}-satir-{n}-desen[-rev{r}].{uzantı}` adıyla indiriliyor. Admin Ham desen kartında kilitli “Ham deseni indir” düğmesi, 404/403 açık durumu ve servis hatasında tekrar dene var. API 506 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Canlı ortam ve SQL kabulü açık. [TST-219](../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md). SIP-TAS-05…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-03 uygulaması:** Admin sipariş tasarım detayı, sipariş satırındaki kayıtlı yerleşimi salt okunur gösteriyor. Tuval, konum (piksel + tuvale göre gösterim yüzdesi), ölçek, döndürme, mod, maske doldurma, kavis, yüzey sürümü ve gövde/bölge ayarları birim ve anlamıyla etiketli. Sipariş/satır/konfigürasyon/revizyon satırı ve desen–revizyon SHA-256 bağı gösteriliyor. Eksik alan “Kaydedilmemiş” (sıfır/aktif değil); şema 1 dışı yorumlanmadan ham; eski kayıt açıklamalı. Editör varsayılanı, mm/DPI ve baskı uygunluğu yok. Admin lint/TS/build ve fixture testleri (320/390/1440, %200) PASS. [TST-215](../test/2026-11-03/TST-215-sip-tas-03-order-placement.md). SIP-TAS-04…09 ve KIS-03 SQL kabulü açık.

**03.11 SIP-TAS-02 uygulaması:** Sipariş satırına `Files` sözleşmesi eklendi: desen, maskelemede kullanılan ürün kaynak görseli ve giydirilmiş önizleme; her biri SHA-256, tür ve bayt ile. Ürün kaynak görseli sipariş anında yüzeyin kayıtlı kaynak özetiyle doğrulanıp siparişe kopyalanıyor. Desen konfigürasyon özetiyle eşleşmezse sipariş reddediliyor; okumada özet farklıysa dosya verilmiyor (503). Tasarım silme/düzenleme, katalog/maske değişimi, eski revizyon, tekrar istek ve yarım kopya izole fixture ile PASS. API 502 test PASS (29 atlandı); sözleşme/admin/web/Flutter analiz PASS. Gerçek SQL kabulü açık (izole SQL yok), eski siparişler geriye dönük doldurulmadı. [TST-211](../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md). KIS-03 SQL kabulü ve SIP-TAS-03…09 açık.

**03.11 SIP-TAS-01 uygulaması:** Admin sipariş detayında kişiselleştirilmiş her satır için “Sipariş tasarım detayı” alanı eklendi. Alanda sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, okunur kayıtlı yerleşim ve ayrı üç görsel kartı var. Ham desen dosya doğrulanınca önizlenir ve mevcut korumalı uçla indirilir. Ürün kaynak görseli ve giydirilmiş önizleme için açıkça “İndirme hazır değil” yazar. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Fiziksel profil/kalibrasyon/ölçüm ekranı tasarım ekranından kaldırıldı (API/veri korunur); menü “Tasarımlar”. Sipariş/kargo/iptal/iade işlemleri ve tasarımdan siparişe geçiş korundu. Sipariş penceresinde etiket kontrastı ve %200 yazı taşması da düzeltildi. Admin lint/TypeScript/derleme ve izole Chrome regresyonları PASS. [TST-207](../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md). KIS-07 açık: SIP-TAS-02…09 yapılmadı; rol/PM kabulü verilmedi.


**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

## Güncel durum - 03.11.2026 (önceki uygulama temeli korunur)

**Durum:** Planlandı - sade sipariş tasarım detayı, kayıtlı yerleşim ve üç görsel teslimi. Üretime hazırlık kapsam dışı; SIP-TAS-01 ekran sadeleştirmesi (TST-207) SIP-TAS-02 dosya/revizyon bağı (TST-211) SIP-TAS-03 yerleşim sunumu (TST-215) SIP-TAS-04 ham desen indirmesi (TST-219) ve SIP-TAS-05 ürün kaynak görseli indirmesi (TST-223) uygulandı, SIP-TAS-06…09 başlamadı. Plan kaynak kesiti `main / e89c649`; önceki uygulama kayıtları aşağıda korunur; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

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
| [KIS-07](../docs/tasks/project-closure-2026-10-30.md#kis-07) - Sipariş tasarım detayını ve ayrı görsel indirmelerini tamamla | Yapılmadı - kapanış açık | SIP-TAS-01 uygulandı (03.11, TST-207): sipariş satırı tasarım detayı ve üç ayrı görsel kartı; fiziksel profil ekranı panelden kaldırıldı. SIP-TAS-02 uygulandı (TST-211): siparişe bağlı üç dosya referansı ve doğrulanmış kopyalar; SQL kabulü açık. SIP-TAS-03 uygulandı (TST-215): kayıtlı yerleşimin okunur sunumu. SIP-TAS-04 uygulandı (TST-219): ham desenin yetkili ayrı indirmesi. SIP-TAS-05 uygulandı (TST-223): ürün kaynak görselinin yetkili ayrı indirmesi. SIP-TAS-06...09 planlandı; indirmeler ve kabul henüz yapılmadı. |
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
