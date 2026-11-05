# Sipariş tasarım detayı - kapsam kararı ve task planı

**MostGate konu/açıklama ve uygulama promptları:** [9 taskın düzenlenebilir dokümanı](order-design-mostgate-prompts-2026-11-03.md) ve [PDF](../../output/pdf/xinobi-siparis-tasarim-mostgate-tasklar-ve-promptlar-2026-11-03.pdf). Yalnız doküman hazırlandı; tasklar uygulanmadı.

**Tarih:** 03.11.2026  |  **Durum:** SIP-TAS-01 uygulandı (03.11, [TST-207](../../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md)); SIP-TAS-02 uygulandı (03.11, [TST-211](../../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md), SQL kabulü açık); SIP-TAS-03 uygulandı (03.11, [TST-215](../../test/2026-11-03/TST-215-sip-tas-03-order-placement.md)); SIP-TAS-04 uygulandı (03.11, [TST-219](../../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md)); SIP-TAS-05 uygulandı (03.11, [TST-223](../../test/2026-11-03/TST-223-sip-tas-05-source-download.md)); SIP-TAS-06 uygulandı (03.11, [TST-227](../../test/2026-11-03/TST-227-sip-tas-06-composition.md)); SIP-TAS-07 uygulandı (03.11, [TST-231](../../test/2026-11-03/TST-231-sip-tas-07-file-access.md)); SIP-TAS-08 uygulandı (03.11, [TST-235](../../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md)); SIP-TAS-09 teknik kabul kaydı hazır (03.11, [TST-239](../../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md)); SQL, canlı, ekran okuyucu ve iş sahibi kabulü açık.  |  **Kaynak kesiti:** e89c649

Kullanıcının açık kararı: kapsamlı bir üretime hazırlık/üretime gönderme bölümü olmayacak. Panelde siparişe ait kayıtlı editör yerleşimi, desenin ayrı indirilmesi, maskelemede kullanılan ürün görselinin ayrı indirilmesi ve indirilebilir giydirilmiş görsel olacak. Kullanıcı yalnız task/faz planlamasını istedi; kod geliştirmesini durdurdu.

## Teslim sınırı

- **Ekran:** Sipariş detayı içindeki satır bazlı tasarım bilgileri; tasarım listesinden ilgili siparişe geçiş korunabilir.
- **Yerleşim:** Kullanıcının editörde kaydettiği değerler ve revizyon; fiziksel ölçüye dönüştürme veya baskı uygunluğu onayı yok.
- **Üç ayrı görsel:** Ham desen, maskelemede kullanılan ürün/kaynak fotoğrafı, ürün üstüne giydirilmiş temsili kompozisyon. Her biri ayrı indirilebilir.
- Bu plan “maskeleme ürünü” ifadesini **editörde kullanılan ürün kaynak görseli** olarak adlandırır. Ayrı alfa/PNG maske dosyası yeni bir zorunlu teslim olarak eklenmedi; mevcut maskeleme özelliği kaldırılmıyor.
- Sipariş dosyaları sipariş anındaki tasarım/ürün/renk/yerleşim sürümüne bağlı kalır. Sonraki değişiklikler eski siparişi değiştirmez.
- Üretime gönderme, üretim kuyruğu, üretim DesignVersion/onay-red, fiziksel PrintArea/mm-DPI-ICC/taşma/kalibrasyon ve baskıya hazır dosya üretimi bu bölümün teslimi değildir.
- Mevcut ödeme, kargo, iade ve kişiselleştirme fiyatlandırması bu kararla iptal edilmedi. Genel editör araçlarının kapsamı ayrıca korunur; bu sipariş detayı için yeni gelişmiş editör araçları şart koşulmaz.

## Mevcut temel ve gerçek açıklar

Kaynak okumasında admin tasarım listesi, ilişkili sipariş bağlantısı, sipariş satırında ham desen ve yerleşim alanları mevcut. Sipariş kompozisyonunu koruyan müşteri önizleme yolu var; bu, adminin üç indirmesinin hazır olduğu anlamına gelmez. Siparişe bağlı ürün kaynak görselinin korunması/indirilmesi ve admin kompozisyon erişimi planın açık işleridir. Fiziksel profil ekranı planlama anında kodda bulunuyordu; SIP-TAS-01 uygulamasıyla panel ekranından kaldırıldı (API, veri ve eski kayıtlar korunur).

## Alt tasklar

Bu 9 satır KIS-03/KIS-07 ve çapraz güvenlik/kabul işlerinin alt kırılımıdır. Mevcut 120 ana taska dokuz yeni ana task eklenmez. Tüm alt taskların durumu ve açık kabul koşulları [kabul matrisinde](../../design/order-design-acceptance-2026-11-03.md). Kişi ve hedef tarih atanmadı; aşağıdakiler önerilen faz sorumluluğudur.

### SIP-TAS-01 - Baskı alanını sipariş tasarım detayına sadeleştir

**Faz / ana task:** Faz02 / Faz06 / KIS-07
**Açıklama:** Panelde sipariş/satır odaklı bir tasarım detayı planla. Fiziksel profil/kalibrasyon, üretime gönder, üretim onayı ve hazır/red üretim durumlarını bu ekrandan çıkar. Mevcut sipariş, ödeme ve kargo eylemleri ayrı kalır; eski profil/veri silme işi eklenmez.
**Kapanış koşulu:** Ürün/SKU/renk, desen, kayıtlı yerleşim ve üç görsel dosyası bir arada; üretime hazırlama eylemi yok.
**Bağımlılık:** Yok
**Durum (03.11):** Uygulandı - kabul açık. Sipariş detayında her kişiselleştirilmiş satır için “Sipariş tasarım detayı” alanı: sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, kayıtlı yerleşim ve ayrı üç görsel kartı (ham desen önizleme + mevcut korumalı indirme; ürün kaynak görseli ve giydirilmiş önizleme için “İndirme hazır değil” durumu). Fiziksel profil/kalibrasyon ekranı tasarım ekranından kaldırıldı; menü “Tasarımlar”. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Yeni API/dosya saklama yok. Kanıt: [TST-207](../../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md).

### SIP-TAS-02 - Siparişe bağlı görsel ve revizyon paketini tanımla

**Faz / ana task:** Faz05 / Faz06 / KIS-03, KIS-07
**Açıklama:** Sipariş kimliği + satır kimliği/indeksi + ürün/varyant/SKU + tasarım/konfigürasyon revizyonunu ilişkilendir. Desen, maskelemede kullanılan ürün kaynak görseli ve giydirilmiş önizlemeyi sipariş anındaki sürümle koru. Güncel katalog/tasarım sonradan değişince eski sipariş değişmesin.
**Kapanış koşulu:** Tasarım silme/yeniden düzenleme, katalog görseli veya maske değişimi eski dosyaları ve yerleşimi değiştirmiyor.
**Bağımlılık:** SIP-TAS-01
**Durum (03.11):** Uygulandı - SQL kabulü açık. Sipariş satırına `Files` (desen / maskelenen ürün kaynak görseli / giydirilmiş önizleme; SHA-256, tür, bayt) eklendi; ürün kaynak görseli sipariş anında yüzeyin kayıtlı kaynak özetiyle doğrulanıp kopyalanır; desen konfigürasyon özetiyle eşleşmezse sipariş reddedilir; okuma sırasında özet farklıysa dosya verilmez (503). Tasarım silme/düzenleme, katalog/maske değişimi, eski revizyon, tekrar istek ve yarım kopya izole fixture ile doğrulandı. Eski siparişler geriye dönük doldurulmadı (SIP-TAS-08). Kanıt: [TST-211](../../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md).

### SIP-TAS-03 - Müşterinin kaydettiği yerleşim detaylarını göster

**Faz / ana task:** Faz06 / KIS-03, KIS-07
**Açıklama:** Kayıtlı şemadan kaynak tuval boyutu, yatay/dikey konum, ölçek, döndürme, yerleşim modu, kavis ve varsa gövde/bölge ayarlarını okunabilir sun. Birimleri ve seçili sürümü belirt. Gerçekte saklanmayan mm/DPI, fiziksel ölçü veya üretim uygunluğu hesaplama.
**Kapanış koşulu:** Ekran editörde kaydedilen aynı revizyonu gösteriyor; uygulanmayan/eksik alanlar sıfır gibi sunulmuyor.
**Bağımlılık:** SIP-TAS-02
**Durum (03.11):** Uygulandı - kabul açık. Admin sipariş tasarım detayı kayıtlı yerleşimi salt okunur gösteriyor: tuval, konum (px + tuvale göre gösterim yüzdesi), ölçek, döndürme, mod, maske doldurma, kavis, yüzey sürümü ve gövde/bölge ayarları birim ve anlamıyla; sipariş/satır/konfigürasyon/revizyon satırı ve desen–revizyon SHA-256 eşleşmesi; eksik alan “Kaydedilmemiş”, gerçek sıfır ayrı; şema 1 dışı yorumlanmadan ham, şemasız/eski kayıt açıklamalı. Editör varsayılanı kullanılmaz; fiziksel ölçü/baskı uygunluğu yok. Kanıt: [TST-215](../../test/2026-11-03/TST-215-sip-tas-03-order-placement.md).

### SIP-TAS-04 - Ham deseni ayrı indir

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Açıklama:** Sipariş satırında korunmuş kullanıcı/AI desenini ürün görselinden ayrı indirilebilir yap. Dosyanın gerçek türünü ve özgün içeriğini koru; giydirilmiş önizlemeyi desen diye verme.
**Kapanış koşulu:** İndirilen desen doğru sipariş/satır/tasarım sürümüne ait; dosya türü ve adı doğru.
**Bağımlılık:** SIP-TAS-02
**Durum (03.11):** Uygulandı - kabul açık. `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` (`orders.read`): sunucu sipariş/satırdan SIP-TAS-02 kopyasını çözer, SHA-256 ve bayttan saptanan MIME ile doğrular, aynı baytları `xinobi-{no}-satir-{n}-desen[-rev{r}].{uzantı}` adıyla attachment verir. Admin Ham desen kartında kilitli “Ham deseni indir” düğmesi; 404/403 açık durum, servis hatasında tekrar dene; yedek içerik yok. Kanıt: [TST-219](../../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md).

### SIP-TAS-05 - Maskelemede kullanılan ürün görselini ayrı indir

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Açıklama:** Editörde yerleşimin uygulandığı, doğru ürün/SKU/renge ait kaynak ürün görselini ayrı indir. Siparişe bağlı kaynak kopyasını kullan; güncel katalog fotoğrafını sessizce ikame etme.
**Kapanış koşulu:** Dosya editörde kullanılan ürün fotoğrafıyla aynı sürüm ve tuvalde; başka renk veya yeni fotoğraf indirilmiyor.
**Bağımlılık:** SIP-TAS-02
**Durum (03.11):** Uygulandı - kabul açık. `GET /api/v1/admin/orders/{id}/lines/{line}/source` (`orders.read`) yalnız siparişe bağlı `Files.ProductSource` kopyasını verir; SHA-256, bayttan tür ve fotoğraf ölçüsünün kayıtlı editör tuvaline eşitliği doğrulanır; ad `xinobi-{no}-satir-{n}-urun-kaynak-{SKU}.{uzantı}`. Kopya yoksa nedeniyle 404; katalog/başka renk/maske yedek olarak verilmez. Admin kartında kilitli indirme düğmesi. Kanıt: [TST-223](../../test/2026-11-03/TST-223-sip-tas-05-source-download.md).

### SIP-TAS-06 - Giydirilmiş görseli göster ve indir

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Açıklama:** Kayıtlı yerleşimle oluşan ürün üstü kompozisyonu sipariş detayında göster ve ayrı indir. Kaydetme/sipariş akışındaki dijital önizlemeyi sürümüyle koru; üretim dosyası, ICC/DPI renderı veya üretim kuyruğu kurma.
**Kapanış koşulu:** Görünen ve indirilen kompozisyon aynı sipariş revizyonuna ait; temsili önizleme etiketi var, baskıya hazır dosya iddiası yok.
**Bağımlılık:** SIP-TAS-02, SIP-TAS-03
**Durum (03.11):** Uygulandı - kabul açık. `GET /api/v1/admin/orders/{id}/lines/{line}/composition` (`orders.read`) siparişe bağlı kompozisyon kopyasını SHA-256 ve JPEG türüyle doğrulayıp `…-giydirilmis-onizleme-rev{r}.jpg` olarak verir; kopya yoksa nedeniyle 404, ham desen/güncel tasarım yedeği yok. Admin kartı aynı dosyayı “Temsilidir … Baskıya hazır dosya değildir” etiketiyle gösterir ve indirir. Web kaydı önizleme tuvali olmadan yerleşim kaydetmez. Kanıt: [TST-227](../../test/2026-11-03/TST-227-sip-tas-06-composition.md).

### SIP-TAS-07 - Yetki, dosya erişimi ve işlem durumlarını tamamla

**Faz / ana task:** Faz03 / Faz06 / SEC-07, KIS-07
**Açıklama:** Admin sipariş okuma/dosya erişimi izinlerini sunucuda doğrula. Yüklenme, indirme sürüyor, eksik dosya, yetki yok, servis hatası ve yeniden denemeyi ayır; istemciden verilen keyfi dosya URL/kimliklerini güvenilir sayma.
**Kapanış koşulu:** Yetkisiz kullanıcı dosya alamıyor; erişim denetimi sipariş/satır bağına göre; hata veya eksik kayıt başarı görünmüyor.
**Bağımlılık:** SIP-TAS-04, SIP-TAS-05, SIP-TAS-06
**Durum (03.11):** Uygulandı - canlı/SQL kabulü açık. Üç dosya ucu ve müşteri/panel/açık medya yolları uçtan uca denetlendi: personel+MFA+`orders.read` her istekte, dosya saklı sipariş/satır referansından; anonim/müşteri/başka müşteri/izinsiz/MFA'sız/süresi dolmuş, başka sipariş/satır, 404/503 ve sızıntı izole testte PASS. Admin indirmesi `aria-disabled` kilit + odak koruma, hata açıklamasına odak, 503/bağlantı için tekrar dene; başarı yalnız “tarayıcıya verildi” der. Okuma (indirme) audit kaydı mevcut yaklaşım gereği yok; ayrı karar açık. Kanıt: [TST-231](../../test/2026-11-03/TST-231-sip-tas-07-file-access.md).

### SIP-TAS-08 - Eski ve eksik sipariş kayıtlarını dürüst ele al

**Faz / ana task:** Faz05 / Faz06 / KIS-03, KIS-07
**Açıklama:** Eski siparişlerde kayıtlı yerleşim, ürün kopyası veya kompozisyon bulunmayabilir. Kaynak yoksa bunu açık göster; ham deseni kompozisyon diye sunma ve güncel tasarımdan eski yerleşim tahmin etme. Kanıtlanabilen eski veri için güvenli geçiş yaklaşımı belirle.
**Kapanış koşulu:** Eski/eksik kayıtlar ekranı bozmaz; olmayan dosyanın indirmesi kapalı ve nedeni anlaşılır.
**Bağımlılık:** SIP-TAS-02, SIP-TAS-07
**Durum (03.11):** Uygulandı - gerçek envanter/karar açık. Eski/eksik/kısmi kayıtlar kart bazında bağımsız: SIP-TAS-02 öncesi siparişin kendi desen/kompozisyon kopyası “doğrulama özeti kaydedilmedi” etiketiyle (`X-Xinobi-File-Check: unrecorded`) erişilebilir; saklanmamış kaynak/kompozisyon nedeniyle kapalı; servis hatası “kaydın olup olmadığı bilinmiyor” + tekrar dene. Katalog/tasarım yedeği yok. Salt okunur `order-design-files-dry-run` envanteri yalnız kanıtlanabilir desen referansı önerir; [geri dönüş planı](../runbooks/order-design-files-dry-run.md). Gerçek veriye yazma yapılmadı. Kanıt: [TST-235](../../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md).

### SIP-TAS-09 - Sipariş tasarım detayını test et ve kabul kaydını yaz

**Faz / ana task:** Faz02 / Faz06 / Faz11 / KIS-03, KIS-07, QA-03
**Açıklama:** Dar/masaüstü admin görünümü, dosya içeriği/kimliği, eski revizyon, silinen tasarım, değişen katalog, izinler, servis kesintisi ve indirme tekrarını izole fixture ile sınayacak testleri planla. Sipariş snapshot kalıcılığı için izole SQL kabulünü ayrıca tut.
**Kapanış koşulu:** Üç indirme ve yerleşim doğru sürümle eşleşiyor; üretim eylemi yok; gerekli regresyon/erişilebilirlik ve kullanıcı kabulü kanıtlı.
**Bağımlılık:** SIP-TAS-01...08
**Durum (03.11):** Teknik kabul tamam - gerçek kabul açık. SIP-TAS-01…08 kaynak/test kaydından doğrulandı; kimlik/yerleşim/üç dosya eşliği düzenleme, silme, katalog/maske değişimi ve dosya deposu yeniden başlatmasıyla; 320/390/768/1440 normal ve %200 metin, axe, klavye, odak, duyuru; üretim eylemi yok. İzole SQL, canlı IIS, ekran okuyucu/cihaz ve iş sahibi kabulü açık. [Kabul matrisi](../../design/order-design-acceptance-2026-11-03.md), [TST-239](../../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md).

## Ana tasklara etkisi

| Ana task | Yeni durum / kapsam |
|---|---|
| KAR-05 | Fiziksel baskı şartnamesi kapısı yerine sipariş tasarım dosyası teslim sınırı kararı. Kullanıcı kapsam kararı verildi; uygulama ve ekran kabulü açık. |
| KIS-01 | Fiziksel profil/kalibrasyon teslimi kapsam dışı. Eski geliştirme/veri tarihsel olarak korunur. Ekran sadeleştirme SIP-TAS-01. |
| KIS-02 | Dijital ürün/renk/maske görsel doğruluğu devam eder; fiziksel baskı numunesi kapısı eklenmez. |
| KIS-03 | Sipariş yerleşimi ve üç görselin sürüm/kalıcılık bağı; izole SQL kabulü devam eder. |
| KIS-04 | Genel editör araçları için önceki kapsam değişmedi; fiziksel profil zorunlu bağı kaldırılır. |
| KIS-05 | Ayrı üretim sürümü ve insan üretim onayı kapsam dışı; sipariş revizyonu KIS-03 altında devam eder. |
| KIS-06 | Yüksek çözünürlüklü baskı render/worker kuyruğu kapsam dışı. Dijital kompozisyon saklama/indirme SIP-TAS-06. |
| KIS-07 | Ana teslim: sade sipariş tasarım detayı + yerleşim + üç ayrı görsel indirme. |
| KIS-08 | Fiziksel numune yazılım teslim kapısı değil; kişiselleştirme fiyatı ve dosya teslim kabulü devam eder. |
| UAT-04 / UAT-08 | Fiziksel üretim kabul/eğitimi yerine sipariş dosyası inceleme/indirme kabulü ve eğitimi; entegrasyon kabulleri korunur. |

## Planın fazlara dağılımı

| Faz | Sorumluluk |
|---|---|
| Faz00 / Faz01 | Kullanıcı kapsam kararını ve değişen bağımlılıkları izlemek. |
| Faz02 | Sipariş tasarım detayı hiyerarşisi, üç görsel kartı, yerleşim alanları, indirme/hata durumları. |
| Faz03 | Sunucu yetkisi, özel dosya erişimi, güvenli indirme ve izole kalıcılık testleri. |
| Faz05 | Sipariş satırı/sürümü ve detay ekranı bağlantısı; siparişten bağımsız güncel tasarımla karıştırmamak. |
| Faz06 | Yerleşim ve üç görsel tesliminin ana uygulama planı; üretim hazırlık işleri kapsam dışı. |
| Faz11 | Dar ekran/platformtan gelen siparişlerde aynı kayıt/sürümün admin teslimi ve son kabul. Yeni mobil üretim modülü eklenmez. |

## Tarihsel kayıtlar ve sınırlar

Eski faz planları, KIS-01 geliştirmesi ve test raporları silinmez; bu tarihli karar yeni kapsamda önceliklidir. Kapsam dışı tasklar tamamlandı sayılmaz. Önce hazırlanmış [genel durum PDF'i](../../output/pdf/xinobi-proje-durumu-2026-11-03.pdf) bu karardan önceki üretim kapsamını içerir; bu yeni karar için güncel kaynak değildir. Kullanıcı yeni PDF istemediği için yeniden üretilmedi.

**Bu oturum:** Yalnız task ve faz dokümantasyonu. API/UI/Flutter kodu, veri, şema, endpoint, ekran, release, deployment veya APK değişmedi. Uygulama testleri çalıştırılmadı; doküman doğrulaması [TST-205](../../test/2026-11-03/TST-205-order-design-scope-plan.md).


## 05.11.2026 — SIP-TAS-01…09 güncel regresyon

[TST-252](../../test/2026-11-05/TST-252-order-design-regression.md): 36 API PASS / 1 SQL SKIP / 0 FAIL; beş admin tarayıcı paketi, 21 dosya durumu ve 7 eski kayıt senaryosu, dört genişlik/%200 metin, admin build/lint geçti (4 eski lint uyarısı). Yeni uygulama kusuru bulunmadı; kod/veri değiştirilmedi. SQL/IIS/manuel cihaz ve PM kabulü açık; deploy yapılmadı.
