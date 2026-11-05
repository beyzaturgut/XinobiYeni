# Faz02 — Xinobi yaratıcı yön, UI/UX ve tasarım teslimi

## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**Bu fazın işi:** SIP-TAS-01/03/04/05/06/07/09: ekran hiyerarşisi, üç ayrı görsel, okunur yerleşim ve dosya durumları; üretim düğmeleri yok.

**03.11 SIP-TAS-09 son test/kabul kaydı:** SIP-TAS-01…08 kaynak ve test kayıtlarından doğrulandı. Kimlik, yerleşim ve üç dosyanın eşliği; düzenleme, silme, katalog/maske değişimi ve dosya deposunun yeniden başlatılmasından sonra da korunuyor. 320/390/768/1440 px'te normal ve %200 metin, axe (kritik/ciddi 0), klavye, odak ve duyuru kontrolleri geçti; üretim eylemi yok. Admin 18 test dosyası + 4 tools senaryosu, API 514 test (29 atlandı) PASS; web e2e 17/18 (1 bilinen kararsız test). Teknik kabul tamam; izole SQL, canlı IIS, ekran okuyucu/cihaz ve iş sahibi kabulü açık. [Kabul matrisi](../design/order-design-acceptance-2026-11-03.md), [TST-239](../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md). Ekran okuyucu ve handoff kabulü açık.

**03.11 SIP-TAS-07 uygulaması:** Desen, ürün kaynak görseli ve kompozisyon uçları ile müşteri, panel ve açık medya yolları uçtan uca denetlendi. Her istekte personel+MFA+`orders.read` kontrolü yapılıyor; dosya saklı sipariş/satır referansından çözülüyor, hata gövdeleri iç bilgi sızdırmıyor. İzole API matrisi PASS: anonim, müşteri, başka müşteri, izinsiz, MFA'sız ve süresi dolmuş personel; başka sipariş/satır; 404/503. Admin indirmesi: `aria-disabled` kilidi odak koruyarak çalışıyor, hata açıklamasına odak taşınıyor, 503 ve bağlantı kesintisinde tekrar dene var; başarı mesajı yalnız “tarayıcıya verildi” diyor (21 Chrome senaryosu PASS). API 511 test PASS (29 atlandı). İndirmelerin audit kaydı mevcut yaklaşımda yok; ayrı karar açık. [TST-231](../test/2026-11-03/TST-231-sip-tas-07-file-access.md). Bu fazdan SIP-TAS-09 açık.

**03.11 SIP-TAS-06 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/composition` (`orders.read`) siparişe bağlı kompozisyon kopyasını SHA-256 ve JPEG türüyle doğrulayıp veriyor; dosya adı `…-giydirilmis-onizleme-rev{r}.jpg`. Kopya yoksa nedeni yazılıyor; ham desen veya güncel tasarım yedek olarak kullanılmıyor. Admin kartı aynı dosyayı “Temsilidir … Baskıya hazır dosya değildir” etiketiyle gösteriyor ve indiriyor. Web kaydı, önizleme tuvali olmadan yerleşim kaydetmiyor. API 510 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Web design-configuration e2e 16/18; düşen 2 test değişiklik olmadan da kararsız, değişiklikle 2/2 PASS. [TST-227](../test/2026-11-03/TST-227-sip-tas-06-composition.md). Bu fazdan SIP-TAS-07/09 açık.

**03.11 SIP-TAS-03 uygulaması:** Admin sipariş tasarım detayı, sipariş satırındaki kayıtlı yerleşimi salt okunur gösteriyor. Tuval, konum (piksel + tuvale göre gösterim yüzdesi), ölçek, döndürme, mod, maske doldurma, kavis, yüzey sürümü ve gövde/bölge ayarları birim ve anlamıyla etiketli. Sipariş/satır/konfigürasyon/revizyon satırı ve desen–revizyon SHA-256 bağı gösteriliyor. Eksik alan “Kaydedilmemiş” (sıfır/aktif değil); şema 1 dışı yorumlanmadan ham; eski kayıt açıklamalı. Editör varsayılanı, mm/DPI ve baskı uygunluğu yok. Admin lint/TS/build ve fixture testleri (320/390/1440, %200) PASS. [TST-215](../test/2026-11-03/TST-215-sip-tas-03-order-placement.md). Bu fazdan SIP-TAS-04/05/06/07/09 açık.

**03.11 SIP-TAS-01 uygulaması:** Admin sipariş detayında kişiselleştirilmiş her satır için “Sipariş tasarım detayı” alanı eklendi. Alanda sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, okunur kayıtlı yerleşim ve ayrı üç görsel kartı var. Ham desen dosya doğrulanınca önizlenir ve mevcut korumalı uçla indirilir. Ürün kaynak görseli ve giydirilmiş önizleme için açıkça “İndirme hazır değil” yazar. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Fiziksel profil/kalibrasyon/ölçüm ekranı tasarım ekranından kaldırıldı (API/veri korunur); menü “Tasarımlar”. Sipariş/kargo/iptal/iade işlemleri ve tasarımdan siparişe geçiş korundu. Sipariş penceresinde etiket kontrastı ve %200 yazı taşması da düzeltildi. Admin lint/TypeScript/derleme ve izole Chrome regresyonları PASS. [TST-207](../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md). Bu fazdan SIP-TAS-03/04/05/06/07/09 açık; ekran rol/PM kabulü verilmedi.


**03.11 Flutter–web görsel/durum uygulaması:** Flutter ekranları web istek durumlarıyla karşılaştırıldı: favoriler hesap API'sine taşındı, hata/tekrar dene/teyitli başarı/taslak/işlem kilidi eklendi, 192 hücrelik widget matrisi (32 rota × 3 genişlik × 1x/2x) ve Android 14 doğrusal olmayan ölçek testi geçti; 280/280 Flutter testi. Android emülatörde oturum kapalı akışlar ve OS %200 yazı denendi; iOS Bloke (Xcode yok). [Ekran/kusur matrisi](../design/flutter-consistency-audit-2026-11-03.md), [TST-196](../test/2026-11-03/TST-196-flutter-web-consistency.md). Gerçek telefon, oturum açık cihaz akışı, TalkBack/VoiceOver ve handoff kabulü açık; faz onayı/yüzde değiştirilmedi.

**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Devam - web ve Flutter düzeltildi; manuel erişilebilirlik/handoff kabulü açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** WEB-07 (4d32780): 52 rota/boyut, 27 benzersiz test ve 15 ek axe taraması. Flutter ana sayfa önizlemesi (de99958): ürün ayrı satır, soru kartı altta, desen sağında; 7 odaklı test ve 79 tam mobil test. Bu sonuçlar VoiceOver/TalkBack veya tasarım teslim onayı değil.

**Müşteriden / iş sahibinden beklenenler:** Onaylı görsel yön/hi-fi/handoff ve hedef cihaz/erişilebilirlik matrisi. Teknik ekip manuel klavye/ekran okuyucu/zoom ve tasarım kusuru kapatmalarını ayrıca yürütür.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [WEB-07](../docs/tasks/project-closure-2026-10-30.md#web-07) - Duyarlı tasarım ve erişilebilirlik kusurlarını kapat | Kısmen yapıldı | Gerçek Safari/VoiceOver, iOS/Android VoiceOver/TalkBack, tarayıcı zoom/OS ölçeği ve Creative/UX-handoff kabulü açık. |
| [ADM-08](../docs/tasks/project-closure-2026-10-30.md#adm-08) - Panel veri dili ve kullanıcı deneyimini temizle | Kısmen yapıldı | 16 modül görsel/durum kontrolü ve başarısız kayıtta taslak düzeltmeleri uygulandı. Global navigasyon taslak/toplu işlem politikası ve gerçek operasyon kabulü açık. |
| [QA-03](../docs/tasks/project-closure-2026-10-30.md#qa-03) - Erişilebilirlik ve tasarım teslimini kabul et | Kısmen yapıldı | Web/admin/Android/iOS tam matris, gerçek VoiceOver/TalkBack ve Creative/UX/handoff imzaları eksik. |

### Açık alt işler ve özel kabul kayıtları

| Alt iş | Ana task | Durum | Kalan / kanıt |
|---|---|---|---|
| WEB-07-UAT-01 | WEB-07, QA-03 | Açık | Safari/macOS VoiceOver ile gerçek duyurular, hata, başlık ve odak kontrolü. |
| WEB-07-UAT-02 | WEB-07, QA-03 | Açık | Gerçek Android/iOS: TalkBack/VoiceOver, sanal klavye, büyük metin ve yön değişimi. |
| WEB-07-UAT-03 | WEB-07, QA-03 | Açık | Gerçek tarayıcı zoom/OS metin ölçeği ile Creative/UX/handoff kabul kaydı. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [WEB-01](../docs/tasks/project-closure-2026-10-30.md#web-01), [WEB-02](../docs/tasks/project-closure-2026-10-30.md#web-02), [KIS-04](../docs/tasks/project-closure-2026-10-30.md#kis-04), [MOB-05](../docs/tasks/project-closure-2026-10-30.md#mob-05), [MOB-07](../docs/tasks/project-closure-2026-10-30.md#mob-07).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Devam — tasarım ve erişilebilirlik kabulü açık. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| Akışlar / ürün detayı / navigasyon | Uygulandı | abdc87a, c9b1e28, 94aa425, ec1638c, 27fed34, 350cd08: kategori URL/geri-ileri, menü odağı, 2–4 ürün karşılaştırma seçimi; ürün/renk → yöntem → yükleme/AI → yerleşim. Kısa ekran ve 390 px düzenleri iyileştirildi. |
| Mobil ve AI ekranları | Uygulandı | 62d4daf, b5518a4, 6f2fc13, 72808e9: ürün önce, sonuç özeti ve native görünümlü gömülü adımlar; aynı ürün/renk ve giriş sonrası dosya/yerleşim korunur. 2806527 kayıt düğmesi metnini tutarlı kılar. |
| Sipariş önizlemesi / Nobi | Uygulandı | 451581b, 17904ce, 6c56cdc, e2131e7: birleşik ürün görseli, body portalında tam ekran, 1–5x pinch/pan, klavye ve odak dönüşü; Nobi altında kaybolan eylemler için kaydırma alanı. |
| Eski ekranlar / tasarım teslimi | Kısmi | 179c46b ve 078a42e kullanılmayan prototipleri/eski editör arayüzünü kaldırdı. Kod ekranı, hi-fi kaynak/handoff veya Creative/Web Designer onayı değildir. Ekran okuyucu, gerçek cihaz ve erişilebilirlik denetimi açık. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


**Durum (16.10.2026):** Devam · geliştirme ~60 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Planlandı · **Faz sahibi:** Sr. Creative Designer (temsili 20+ yıl uzman rolü) · **Nihai kapı sahibi:** Proje Yöneticisi (PM)
**Kaynak ve öncelik:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2–5, §6.4, D04/D08/D09/D10 ve `Xinobi_Proje_Kapsami(4).md` UI/UX, web, panel, kişiselleştirme, mobil, AI kapsamı. Çelişkide müşteri kapsamı ile doğrulanmış karar kaydı esastır.  
**Kapsam:** Yalnız belirtilen web, yönetim paneli, iOS/Android, basit/gelişmiş editör, AI üretim ve asistan arayüzü; özellik ekleme yetkisi vermez.

## Amaç ve kapı

Müşterinin tasarım seçimini ekibe bıraktığı yetkiye dayanarak güven veren, ürün fotoğrafını ve kişiselleştirmeyi öne çıkaran tek bir Xinobi görsel dili seç; tüm ekranların akışını, durumlarını ve uygulanabilir bileşenlerini üret. Tasarım işi bu fazda teslim edilir; ilgili işlevlerin geliştirmesi sonraki fazlarda yapılır. PM, tasarım teslimini ve her rolün incelemesini imzalamadan Faz02 tamamlandı olarak işaretlenmez. Temsili rol değerlendirmesi gerçek çalışan veya müşteri kabulü yerine geçmez.

**Analiz2 ve kullanıcı onay kapısı:** Ek bağlayıcı girdi `Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` K-01–K-21'dir. Sr. Creative Designer marka/art direction'ı; Web Designer bilgi mimarisi, responsive wireframe, yüksek doğruluk web ekranı ve etkileşim tanımını üstlenir. İki ayrı alternatif üretmezler; brief ve fark matrisi üzerinde birlikte çalışıp **tek ortak Xinobi tasarımı** teslim ederler. Kullanıcı ortak tasarımı ve kritik web ekranlarını açıkça onaylamadan görsel kod refactor'ına başlanmaz. Dyson referansı yalnız ürün merkezli görsel hiyerarşi, geniş beyaz alan, güçlü gerçek ürün görseli, kısa fayda ve net CTA ilkeleri için kullanılır; Dyson fontu, metni, varlığı, markası veya birebir sayfa düzeni kopyalanmaz. **İstisna (07.10.2026, proje sahibi kararı, `design/decisions.md` DES-HDR-01):** global header'ın ölçüleri (şerit yükseklikleri, punto, ağırlık, aralıklar, ikon ve arama kutusu boyutları) dyson.com.tr ile birebir eşlendi; logo, metin ve lisanslı font kopyalanmadı, font yerine açık lisanslı Jost kullanıldı.

**Zorunlu tasarım sırası:** `creative brief ve varlık/lisans envanteri → K-01–K-21 fark matrisi → Creative + Web Designer ortak çalışma → tek art direction/moodboard ve ana sayfa wireframe → KULLANICI ORTAK TASARIM ONAYI → global IA/header/mega menü/footer ve kritik responsive hi-fi → KULLANICI WEB TASARIM ONAYI → tüm ekran/durumlar → a11y ve motion QA → handoff → kodlama`.

## Ön koşullar

1. `Faz00_Proje_Takip_ve_Kesintiden_Devam.md` içindeki kaynak sürümü, mevcut depo/ürün görselleri, kararlar, faz durumu ve blokajlar okunur. Tasarım dosyaları henüz yoksa bu fazda üretilir; varmış gibi kapatılmaz.
2. Faz01'de doğrulanmış aktör, gezinme, yetki, müşteri yolculuğu ve web/mobil/panel işlev listesi bulunur. D04 baskı alanı/üretim standardı, D08 AI seçenek ve limitleri, D09 mobil editör/platform yaklaşımı, D10 yasal metinler/çerez tercihi için gerçek sahip ve kapanış kapısı kayıtlı olur. Karar çıkmadıysa etkilenmeyen ekranlar tamamlanır, bağımlı parçalar `BLOKE` ve karar ID'siyle belgelenir.
3. Xinobi ürün kataloğundan gerçek model, renk, varyant ve fotoğraf örnekleri, logo kullanımı ve yetkili görsel kullanım hakkı alınır; bunlar yoksa örnekler açıkça `temsili` etiketlenir. Ürün fotoğrafı yapay üretilmiş temsili görselle sessizce değiştirilmez.

## Onaylanmak üzere önerilen yaratıcı yön

**Tema: Xinobi / Sessiz teknoloji.** Elektrikli içecek cihazlarının gerçek metal yüzeylerini ve kişiselleştirme gücünü ürün merkezli, açık zeminli, tipografisi net bir mağaza deneyiminde sun. Birincil ürün aksiyonu, seçilmiş varyant ve toplam bedel aynı bakışta anlaşılır; indirim gösterimi ve teslimat vaadi yalnız doğrulanmış veriye dayanır. Kurumsal teklif dili alışveriş dilinden ayrılır fakat aynı görsel sistemde kalır.

| Token | Başlangıç değeri | Kullanım |
|---|---|---|
| `color.ink` | `#15252D` | Ana metin ve koyu başlık |
| `color.canvas` | `#F7F7F4` | Sayfa zemini |
| `color.surface` | `#FFFFFF` | Kart, alan ve modal yüzeyi |
| `color.teal` | `#006C69` | Ana eylem ve bağlantı; zemin üstünde AA kontrastı ölçülecek |
| `color.teal.hover` | `#005755` | Eylem üzerine gelme; renk tek başına durum işareti değildir |
| `color.line` | `#D5DDDB` | Bölücü; metin için kullanılmaz |
| `color.danger` | `#B3261E` | Hata ve kalite uyarısı; simge ve metin eşlik eder |
| `color.success` | `#176B45` | Başarı; simge ve metin eşlik eder |
| `type.ui` | `Inter`, sistem sans yedeği | Lisans ve Türkçe karakter denetimi sonrası kesinleştir |
| `type.display` | `Inter` ağırlık 600–700 | Başlıklar; dekoratif font zorunlu değildir |
| `space` | 4/8/12/16/24/32/48/64 px | 4 px temel ritim; içerikte 16–24 px |
| `radius` | 4/8/12 px | Form, kart, panel; editör çalışma alanı sınırı belirgin |
| `focus` | 2 px yüksek kontrastlı dış çizgi | Klavye odağı; gölge tek işaret olmaz |

Bu tokenler tasarım kararı önerisidir. Creative Designer, gerçek logo ve ürün fotoğraflarıyla örnek sayfada doğrulayıp gerekçeli son sürümü `design/decisions.md` içinde kilitler; değişiklikleri Faz00'da izler. Responsive kırılımlar bir cihaz adı varsayımı yerine içerik taşması, ödeme/editör kullanım ve gerçek cihaz kontrolleriyle seçilir; en az dar telefon, geniş telefon, tablet ve masaüstü prototipi üretilir. Dokunma hedefi, klavye odağı, semantik etiket ve form hata mesajı WCAG 2.2 AA hedefiyle incelenir; renkler ve küçük metin için gerçek kontrast değerleri `design/a11y-audit.md`'ye yazılır. Hareket azaltma tercihi karşılanır.

## Sıralı çalışma talimatı

1. **Envanter ve bilgi mimarisi.** Kaynaktaki her işlevi `design/screen-inventory.md` içinde ekran ID'sine eşle. Web: kurumsal sayfalar/yasal metinler, ana, kategori, liste/arama/filtre/karşılaştırma, ürün detay, favori, hesap/adres, sepet/ödeme, sipariş/takip/iade, teklif/toplu talep, AI. Panel: dashboard; rol/denetim/ayar; katalog/varyant/medya/baskı alanı; fiyat/stok/depo/kampanya; müşteri/teklif/toplu sipariş; sipariş/kargo/iade/tasarım/baskı; CMS/SEO/bildirim/rapor; Mikro/üç pazaryeri eşleme-senkron-hata; AI prompt/bilgi/görüşme/lead/limit/maliyet. Mobil: iOS ve Android'de web kapsamındaki müşteri alışverişi, kişiselleştirme/editör, teklif, AI ve bildirim. Her ekranın rolünü, giriş yolunu, başlıca eylemini, veri ihtiyacını ve sonraki faz sahibini yaz.
2. **Akış ve kabataslak çizimler.** `design/flows.md` ve bağlantılı wireframe'lerde misafir/üye ürün→varyant→sepet→ödeme; giriş/şifre yenileme; kurumsal talep; basit kişiselleştirme→editör→kaydet→yeniden aç→sipariş→baskı; panelden işleme; AI üretim→editleme; AI asistan→ürün/teklif/insana yönlendirme akışlarını çiz. Stoksuz varyantta sepete ekleme pasif ve açıklamalı olur; varyant rengi ile gerçek fotoğraf, stok, fiyat, editör, sepet ve sipariş aynı seçimi taşır. Havale/EFT bekleme ve kart sonucu ayrı durumdur.
3. **Gerçek tasarım sistemi.** `design/tokens.json` veya uygulamanın paylaşılabilir token biçimi ile `design/components.md` üret: tipografi basamakları, renk, boşluk, grid, ikon, resim oranları, düğme/bağlantı, alan/doğrulama, sekme, modal, bildirim, kart, ürün varyantı, stok rozetleri, fiyat ve indirim, kampanya, filtre, tablo, durum etiketi, adım göstergesi, AI kaydı, editör kontrolü. Her bileşene varsayılan/hover/focus/disabled/busy/error/empty durumları ve klavye/dokunma davranışı ekle. Fiyat, stok, kampanya ve vergi metinleri API verisiyle bağlanır; görsel makette uydurulmuş kesin ticari vaat yer almaz.
4. **Yüksek doğruluk ekranları.** `design/screens/` altında ekran envanterinin tamamı için erişilebilir kaynak dosyası veya açık düzenleme bağlantısı ve inceleme için PNG/PDF çıktısı sağla. En az ana sayfa, kategori/liste, ürün ve renk seçimi, basit kişiselleştirme, gelişmiş editör, sepet/ödeme, teklif, hesap/sipariş, panel katalog-varyant, stok, sipariş, teklif, entegrasyon hatası, AI yönetimi, iOS ve Android ana/ürün/editör/ödeme/AI referans ekranları dar ve geniş durumlarıyla detaylandırılır. Diğer ekranlar aynı bileşen kütüphanesinden, gezinme ve veri davranışı tanımlanmış şekilde üretilir; hiçbir kaynak ekranı yalnız isim olarak bırakılmaz.
5. **Editör ve AI özel durumları.** `design/editor-spec.md`: ön/arka yüz, çoklu baskı alanı, güvenli alan/ölçü ölçeği, metin-görsel-şekil katmanları, sıra/kilit/gizle, hizala/döndür/ölçekle/kopyala/sil, undo/redo, şablon kategorisi, kaydet/geçmiş/yeniden aç ve baskı kalite/taşma uyarıları için etkileşim, klavye eşdeğeri ve mobil kontrol yerleşimi. Ekrandaki maske/önizleme gerçek ürün fotoğrafını örterken malzeme dokusunu ve ışığını korur; baskı dışı sap/kulplar ve cam/plastik yüzeylere desen giydirilmez. `design/ai-spec.md`: tasarım istemi/tema/renk/stil/ürün, çoklu alternatif, varyasyon, arka plan kaldırma/iyileştirme/genişletme, editöre aktarım, geçmiş, limit ve uygunsuz içerik; asistan arama/karşılaştırma/öneri/teklif/WhatsApp-canlı destek devri. Boş, beklemede, uzun sürüyor, kısmen hazır, hata, yeniden dene, tamamlandı, limit doldu ve içerik reddedildi durumları gösterilir; tamamlanmamış tasarım siparişe hazır gibi sunulmaz. Alternatif sayısı D08'e bağlıdır.
6. **Panel ve mobil ayrıntıları.** Panelde liste→detay→düzenle→kaydet/hata, yetki yok, filtre ve dış kanal eşleme/hata tekrar deneme akışları; kayıtta işlem sonucu ve denetim izi gösterimi tanımlanır. Mobilde iOS güvenli alanları, Android geri davranışı, klavye görünümü, izin isteme zamanı, düşük bağlantı ve ödeme sağlayıcı dönüşü için platform başına ayrı prototip üret. Editör işlev eşliği D09'a göre korunur; masaüstü hareketine bağımlı sürükle bırak tek kontrol olamaz.
7. **Handoff.** Creative Designer tasarım kaynağını, tokenleri, bileşen varyantlarını, ekran/akış ID'lerini, gerçek medya ve lisanslarını, örnek veri ile API alan eşlemesini, yükleme/hata/boş durumlarını `design/handoff.md` ile UI/UX uygulamasının ortak sorumlusu **Sr. Frontend Developer'a** teslim eder. UI/UX akış ve görsel yön Creative, etkileşim ve erişilebilir uygulama FE tarafından birlikte incelenir; ayrı sekizinci rol varsayılmaz. FE ölçü, etkileşim ve responsive yapılabilirlik incelemesini; BE/DBA veri ve durum uygulanabilirliği incelemesini; Full Stack web/mobil tutarlılık incelemesini kaydeder. Revizyon talepleri ID, karar ve yeni tasarım sürümüyle çözülür.
8. **Analiz2 ana sayfa ve web teslimi.** Web Designer; header/mega menüden sonra tam ekran görsel-video slider, hemen altında XINOBI U bannerı, kategori kolonları, öne çıkan ürün sliderı, keşfet bannerları, footer ve sağ altta sabit Nobi erişimini bu kesin sırayla wireframe ve hi-fi olarak teslim eder. Sliderda pause/oynat, ok/sekme/klavye, swipe, poster/fallback, yalnız aktif videonun oynaması, görünmezken durma ve reduced-motion; Nobi'nin alt navigasyon/güvenli alanla çakışmaması tanımlanır. Yedi menü öğesi: Çay Makineleri, Kahve Makineleri, Tost Makineleri, Pişirme Makineleri, Hava Temizleme, Desenler, XINOBI U.
9. **Yeni kaynak teslimleri ve onay kayıtları.** `design/creative-brief.md`, `design/analysis2-gap-matrix.md`, `design/art-direction.md`, `design/content-hierarchy.md`, `design/photography-media-guide.md` ve ortak düzenlenebilir kaynak/çıktılar hazırlanır. `BRIEF ONAY`, `ORTAK TASARIM ONAY` ve `WEB TASARIM ONAY` kararları tarih, sürüm ve kanıtla Faz00'a yazılır; eksik onay tasarım/kodlama için blokajdır. **Açık (2026-10-07):** bu üç onay Faz00 §6 karar tablosuna henüz işlenmedi; ana sayfa DEPLOY-003'te "onaylı" diye paketlendiği halde onayın tarihi ve kanıtı kayıtlı değil.
10. **Eksik ekran aileleri.** Envantere ve hi-fi'ye şunlar eklenir: (a) teklifsiz **toplu sipariş talebi** ve kurumsal müşteri **başvuru/onay durumu** ekranları (Faz07); (b) panelde **medya kütüphanesi**, **XINOBI U soru havuzu ve eşleme yönetimi** (Faz10), **iletişim formu gelen kutusu** (Faz04); (c) ödeme adımında **mesafeli satış ve ön bilgilendirme onayı**, taksit seçimi, 3D Secure dönüşü ve havale banka bilgisi (Faz05); (d) bildirim tercihleri ve İYS izin metni; (e) **Desenler** sayfası yalnız D13 kararından sonra, o zamana kadar `BLOKE · D13`. Siyah tema panel dokümanındaki kapsam dışı ekranlar Faz00 §4 kararı olmadan envantere alınmaz.

## Çıktı yapısı ve geri dönme noktası

`design/` dizini altında `decisions.md`, `screen-inventory.md`, `flows.md`, `tokens.json`, `components.md`, `editor-spec.md`, `ai-spec.md`, `handoff.md`, `a11y-audit.md`, `screens/`, `assets/` ve `CHANGELOG.md`. Tasarım aracındaki kaynak bağlantısının izinleri ve PNG/PDF dışa aktarımları aynı `handoff.md` içinde listelenir. Bu dosyalar ileride kod deposuna geçecek gerçek teslim isimleridir; henüz mevcut oldukları iddia edilmez. **Açık (2026-10-07):** `design/a11y-audit.md` repoda yok. TST-050'deki axe sonuçları ve renk kontrast ölçümleri bu dosyada toplanmadan Faz02 kapısı açılmaz. Bir iş yarım kalırsa her çalışma sonunda Faz00'a son biten iş/commit, ekran ID'si, tasarım sürümü, açık karar, sıradaki tek somut adım ve bloke eden kişi/sistem yazılır; `CHANGELOG.md` tasarım değişiklik gerekçesini taşır.

## Kabul kanıtları

- Envanterde kaynak kapsamındaki tüm web/panel/iOS/Android ekranları ID ve tasarım teslimiyle eşleşir; test incelemesinde ilgili ekrana gidilir.
- Gerçek bir üründe iki renk varyantı seçilerek fotoğraf, stok ve fiyat, editör önizlemesi, sepet ve sipariş örneğinde aynı varyant kimliği korunur; stoksuz seçimde sepete ekleme imkânsız ve gerekçe okunur.
- Ürün üzerinde yalnız izinli baskı alanına tasarım yerleşir. Ön/arka ve birden çok alan, düşük çözünürlük ve taşma örnekleri görünür ve anlaşılır; D04 onaylanmadan baskı ölçüsü nihai kabul edilmez.
- Klavye ile web formu/alışveriş/editörün temel işlevleri; ekran okuyucu etiketleri, hata odağı ve AA kontrast raporu doğrulanır. Dar telefon/tablet/masaüstünde yatay taşma, kapatılmış ödeme eylemi veya ulaşılamayan editör kontrolü yoktur.
- Panelde yetki yok, boş/kayıt var/hata/yeniden dene; ödeme, dosya yükleme ve AI'da bekleme/başarı/hata durumları açılıp gösterilir. İki mobil platformun akışları ayrı doğrulanır.
- Creative Designer'ın kaynak dosyası ve FE/UI/UX handoff kaydı incelenir. Sadece örnek görsel veya referans pano ile faz kapatılamaz.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~60 % · kalan ~40 % · Statü: Devam (A17 ertelendi)**

**16.10 güncellemesi (kod/commit incelemesi):** Ana sayfa ürün önizlemesi web/mobil boyutları düzeltildi; görselin ekran görüntüsünü alma arayüzü kaldırıldı (`8703cc9`, `fc706b4`, `495eef1`). Mobil Material diyalogları ve tarih seçici Türkçeleştirildi (`1b5cde5`). Tasarım onayı ve cihaz/erişilebilirlik kapıları açık. Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

**20.10 güncellemesi:** Panelde iş alanı/operasyon menüleri ayrıldı ve geliştirme kopyaları kaldırıldı (`76c0f6d`, `6dcb01b`). XINOBI U ürün önizleme ekranı yeniden tasarlandı: masaüstünde büyük sabit sahne + renk/görsel/yerleşim kartları, mobilde ürün önce (`250deff`). Eksik: yeni önizleme için `design/a11y-audit.md` ve gerçek cihaz/ekran okuyucu kontrolü; Creative/Web Designer onayı yok. Oran değişmedi. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

| Madde | Durum | Kanıt / eksik |
|---|---|---|
| 1 Envanter ve IA | Tamam | `design/screen-inventory.md` |
| 2 Akış/wireframe | Tamam | `design/flows.md` (TST-054), WEB-001 wireframe |
| 3 Tasarım sistemi | Tamam | `design/tokens.json` 0.4.0 (web/mobil eşleşiyor), `components.md` |
| 4 Yüksek doğruluk ekranları | Kısmi | Yalnız WEB-001 hi-fi; diğer ekranlar kodda var ama `design/screens/` kaynağı/PNG yok (F02-A08) |
| 5 Editör ve AI spec | Kısmi | `editor-spec.md`, `ai-spec.md` taslak; inceleme kaydı yok; `docs/xinobi-u-art-direction.md` (13.10) eklendi |
| 6 Panel ve mobil ayrıntıları | Kısmi | Panel prototipleri (TST-078–086); iOS/Android referans ekranları yok (F02-A10) |
| 7 Handoff | Kısmi | `handoff.md`, 22 dosyalık manifest; HND-01–05 ve FE/BE/DBA kabulü açık |
| 8 Analiz2 ana sayfa | Tamam | WEB-001 ve canlı ana sayfa (DEPLOY-003/009) |
| 9 Onay kayıtları | Yok | BRIEF/ORTAK/WEB TASARIM onayları Faz00’a işlenmedi; F02-A17 07.10’da ertelendi |
| 10 Eksik ekran aileleri | Kısmi | Teklif takip/hesap ekranları kodda; toplu sipariş, medya kütüphanesi, soru havuzu, iletişim kutusu, mesafeli satış onayı, İYS tercihleri yok; Desenler BLOKE · D13 |
| `design/a11y-audit.md` (F02-A07) | Yok | TST-050/108 sonuçları tek tutanakta toplanmadı |
| Gerçek cihaz ve ekran okuyucu QA (A01/A02/A16) | Yok | — |

**Sonraki adım:** `design/a11y-audit.md`’yi TST-050 ve TST-108 ölçümlerinden oluşturmak.

## Yedi rolün incelemesi ve PM kapısı

Her rol `Faz00_Proje_Takip_ve_Kesintiden_Devam.md` karar/inceleme kaydına `Faz02`, tasarım sürümü, tarih, kanıt bağlantısı, `ONAY / REVİZYON / BLOKE` ve gerekçe girer. Aşağıdaki başlangıç durumları gerçek onay değildir; inceleme sonuçlarına göre güncellenir. **PM onayı her koşulda son ve zorunlu adımdır.** PM diğer altı rolün açık revizyonunu, bağımlı müşteri kararını veya kabul kanıtı eksikliğini sessizce geçemez; bloğu sahip ve sonraki adımla kaydeder.

| Rol | İnceleme sorusu | Durum |
|---|---|---|
| İş Analisti | Tüm müşteri senaryoları ve yasal/kurumsal ekranlar izlenebilir mi? | Bekliyor |
| Sr. Creative Designer | Marka yönü, tüm ekranlar ve handoff bütün mü? | Bekliyor |
| Sr. Frontend Developer | Bileşen, erişilebilirlik ve responsive etkileşim uygulanabilir mi? | Bekliyor |
| Sr. Backend Developer | Durumlar, API verisi, ödeme/AI hata akışları gerçek sözleşmeye uygun mu? | Bekliyor |
| DB Admin | Varyant, tasarım sürümü, yetki ve operasyon durumları veri kayıtlarına bağlanıyor mu? | Bekliyor |
| Sr. Full Stack Developer | Web, panel, iOS ve Android prototipleri aynı iş kurallarını taşıyor mu? | Bekliyor |
| Web Designer (ek zorunlu rol) | IA, responsive wireframe, Analiz2 ana sayfa sırası, etkileşim ve hi-fi web ekranları onaylı tasarıma uygun mu? | Bekliyor |
| Proje Yöneticisi — son kapı | Altı inceleme, kaynak kapsamı, karar/blokaj ve teslim kanıtı tamam mı? | Bekliyor |

**Kapanış:** Yedi satırın her biri kayıtlı `ONAY`, açık kararların ilgili uygulamayı bloke edip etmediği belirlenmiş ve PM ayrıca `Faz02 = TAMAMLANDI` olarak Faz00'ı güncellemişse sonraki bağımlı geliştirmeye geç. Gerçek Xinobi marka/onay veya yasal metin kararı gerekiyorsa ilgili iş sahibi ayrıca doğrular.


## 05.11.2026 — Sipariş, tasarım dosyaları ve kargo UI/UX denetimi

[Öncelikli bulgular](../design/admin-ux-audit-2026-11-05.md), [TST-253](../test/2026-11-05/TST-253-admin-ux-audit.md): 20/20 izole test paketi PASS. Taslak kaybı, kritik işlem onayı ve varsayılan manuel teyit P1; readonly alanlar/etiket mesajı/busy kapanışı/form tutarlılığı P2. Denetim tamam; düzeltme ve PM/cihaz/IIS kabulü açık. Uygulama değişmedi/deploy yok.
