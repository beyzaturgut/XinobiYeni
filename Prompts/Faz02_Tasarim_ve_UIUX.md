# Faz02 — Xinobi yaratıcı yön, UI/UX ve tasarım teslimi

**Durum (14.10.2026):** Devam · geliştirme ~60 %; ayrıntı "Uygulama durumu — 14.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Planlandı · **Faz sahibi:** Sr. Creative Designer (temsili 20+ yıl uzman rolü) · **Nihai kapı sahibi:** Proje Yöneticisi (PM)  
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

## Uygulama durumu — 14.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~60 % · kalan ~40 % · Statü: Devam (A17 ertelendi)**

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
