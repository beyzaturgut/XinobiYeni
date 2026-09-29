# Faz02 — Xinobi yaratıcı yön, UI/UX ve tasarım teslimi

**Durum:** Planlandı · **Faz sahibi:** Sr. Creative Designer (temsili 20+ yıl uzman rolü) · **Nihai kapı sahibi:** Proje Yöneticisi (PM)  
**Kaynak ve öncelik:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2–5, §6.4, D04/D08/D09/D10 ve `Xinobi_Proje_Kapsami(4).md` UI/UX, web, panel, kişiselleştirme, mobil, AI kapsamı. Çelişkide müşteri kapsamı ile doğrulanmış karar kaydı esastır.  
**Kapsam:** Yalnız belirtilen web, yönetim paneli, iOS/Android, basit/gelişmiş editör, AI üretim ve asistan arayüzü; özellik ekleme yetkisi vermez.

## Amaç ve kapı

Müşterinin tasarım seçimini ekibe bıraktığı yetkiye dayanarak güven veren, ürün fotoğrafını ve kişiselleştirmeyi öne çıkaran tek bir Xinobi görsel dili seç; tüm ekranların akışını, durumlarını ve uygulanabilir bileşenlerini üret. Tasarım işi bu fazda teslim edilir; ilgili işlevlerin geliştirmesi sonraki fazlarda yapılır. PM, tasarım teslimini ve her rolün incelemesini imzalamadan Faz02 tamamlandı olarak işaretlenmez. Temsili rol değerlendirmesi gerçek çalışan veya müşteri kabulü yerine geçmez.

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

## Çıktı yapısı ve geri dönme noktası

`design/` dizini altında `decisions.md`, `screen-inventory.md`, `flows.md`, `tokens.json`, `components.md`, `editor-spec.md`, `ai-spec.md`, `handoff.md`, `a11y-audit.md`, `screens/`, `assets/` ve `CHANGELOG.md`. Tasarım aracındaki kaynak bağlantısının izinleri ve PNG/PDF dışa aktarımları aynı `handoff.md` içinde listelenir. Bu dosyalar ileride kod deposuna geçecek gerçek teslim isimleridir; henüz mevcut oldukları iddia edilmez. Bir iş yarım kalırsa her çalışma sonunda Faz00'a son biten iş/commit, ekran ID'si, tasarım sürümü, açık karar, sıradaki tek somut adım ve bloke eden kişi/sistem yazılır; `CHANGELOG.md` tasarım değişiklik gerekçesini taşır.

## Kabul kanıtları

- Envanterde kaynak kapsamındaki tüm web/panel/iOS/Android ekranları ID ve tasarım teslimiyle eşleşir; test incelemesinde ilgili ekrana gidilir.
- Gerçek bir üründe iki renk varyantı seçilerek fotoğraf, stok ve fiyat, editör önizlemesi, sepet ve sipariş örneğinde aynı varyant kimliği korunur; stoksuz seçimde sepete ekleme imkânsız ve gerekçe okunur.
- Ürün üzerinde yalnız izinli baskı alanına tasarım yerleşir. Ön/arka ve birden çok alan, düşük çözünürlük ve taşma örnekleri görünür ve anlaşılır; D04 onaylanmadan baskı ölçüsü nihai kabul edilmez.
- Klavye ile web formu/alışveriş/editörün temel işlevleri; ekran okuyucu etiketleri, hata odağı ve AA kontrast raporu doğrulanır. Dar telefon/tablet/masaüstünde yatay taşma, kapatılmış ödeme eylemi veya ulaşılamayan editör kontrolü yoktur.
- Panelde yetki yok, boş/kayıt var/hata/yeniden dene; ödeme, dosya yükleme ve AI'da bekleme/başarı/hata durumları açılıp gösterilir. İki mobil platformun akışları ayrı doğrulanır.
- Creative Designer'ın kaynak dosyası ve FE/UI/UX handoff kaydı incelenir. Sadece örnek görsel veya referans pano ile faz kapatılamaz.

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
| Proje Yöneticisi — son kapı | Altı inceleme, kaynak kapsamı, karar/blokaj ve teslim kanıtı tamam mı? | Bekliyor |

**Kapanış:** Yedi satırın her biri kayıtlı `ONAY`, açık kararların ilgili uygulamayı bloke edip etmediği belirlenmiş ve PM ayrıca `Faz02 = TAMAMLANDI` olarak Faz00'ı güncellemişse sonraki bağımlı geliştirmeye geç. Gerçek Xinobi marka/onay veya yasal metin kararı gerekiyorsa ilgili iş sahibi ayrıca doğrular.
