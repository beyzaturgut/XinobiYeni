# Faz01 — Keşif, kararlar ve uygulanabilir teslim temeli

**Durum (14.10.2026):** Bloke (müşteri kararları) · geliştirme ~45 %; ayrıntı "Uygulama durumu — 14.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Planlandı · **Sorumlu:** Proje yöneticisi (PM) · **Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §§2–4, 6–8, ek kaynak `Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` K-01–K-21 ve müşteri kapsamı `Xinobi_Proje_Kapsami(4).md`. Bu faz, Faz00'daki ilerleme kaydından yönetilir. Bu belgede iş kararı verilmiş gibi gösterilen hiçbir boşluk yoktur.

## Amaç ve sınır

K0/K1 kapılarını müşteri kanıtlarıyla kapatmak; D01–D10 kararlarını sahip, tarih, dayanak ve ilgili fazlarla izlemek; gerçek operasyonu, varsa mevcut kod/veriyi ve dış sistem erişimini doğrulamak. Çıktı, tüm modüllerin uygulanacağına dair izlenebilir bir temel ve sonraki fazlar için blokaj haritasıdır. Keşif sonucunda kapsam maddesi çıkarılmaz; değişiklik PM'nin kapsam/değişiklik kaydına alınır ve müşterinin açık kararıyla ele alınır.

## Önkoşullar

1. PM müşteri tarafında iş, operasyon, ürün/üretim, kurumsal satış, Mikro ve hukuk karar sahiplerini belirler; karar sahibi bulunamıyorsa bunu açık blokaj yazar.
2. Library'de zaten bulunan `Xinobi_Proje_Kapsami(4).md` ile `Xinobi_Kavramsal_ve_Teknik_Analiz(1).md` doğrulanıp uygulama deposunda `docs/sources/` altına salt okunur kopya olarak alınır; ad, kaynak yol, sürüm/tarih ve kopya kontrolü Faz00'a yazılır. Kopyalar erişilemezse kapsam eşleştirmesi başlatılmaz. Kapsam ve analiz okunur, müşterinin verdiği mevcut kod, veri örneği, erişim ve sözleşmeler yalnız yetki dahilinde incelenir. Kimlik bilgileri belgeye yazılmaz.
3. Faz00, fazın başlangıç zamanı, sorumlusu, kaynak sürümü ve mevcut durum için açılır; Faz01 kapanışı ancak kanıt bağlantıları ve PM kapısıyla oraya işlenir.

## Sıralı uygulama listesi

1. **Kaynak izlenebilirliği:** Analizdeki teslim sınırını satır satır müşteri kapsamıyla eşleştir. Web/CMS/SEO, B2C, panel, basit kişiselleştirme/gelişmiş editör ve baskı, teklif/toplu sipariş, iOS/Android, Mikro, Trendyol/Hepsiburada/N11, merkezi sipariş, AI tasarım ve satış asistanı için `gereksinim ID → kaynak başlığı → ekran/API/veri → hedef faz → UAT` matrisi oluştur. Belirsizleri varsayım/karar olarak ayır; onaylanmış ihtiyaç gibi yazma.
2. **Bugünkü operasyon:** Siparişin üç pazaryerinden gelişi, ürün açma, stok/fiyat güncelleme, muhasebeye geçiş, kargo, iptal/iade, müşteri hizmeti ve kurumsal teklif adımlarını yetkili kullanıcılarla görüşerek `as-is` olarak kaydet. Her akıştan kişisel verileri ayıklanmış örnek sipariş/ürün/varyant/teklif/fiş ve durum ekranı al; olmayan süreçleri açıkça `henüz yok` olarak işaretle. `to-be` süreçte tek panel, üç kanal ve web/mobil ortak kayıtlarını ayrı çiz; fark listesi çıkar.
3. **D01 mevcut sistem kararı:** Mevcut web, mobil, panel, API, veri, medya, altyapı ve varsa repo için erişim ve lisansları envanterle. Repo varsa dal, build/test, migration, bağımlılıklar, entegrasyonlar, veri taşıma uygunluğu, güvenlik ve tasarım varlıklarını çalışan örnekle incele. `yeniden kullan / iyileştir / yeniden geliştir` seçeneklerinin gerekçeli önerisini, korunacak veri ve geri dönüş yolunu PM'ye sun. Repo yoksa `sıfırdan başlangıç` kanıtını kaydet.
4. **D02 veri sahipliği:** Ürün, varyant, depo/stok, fiyat, kanal fiyatı, kampanya, cari, sipariş ve faturanın bugünkü ve hedef ana kayıt sistemini alan bazında belirle. Mikro ile her alanın okuma/yazma yönü, çakışma önceliği, eşleme kimliği, senkron gecikmesi ve mutabakat sorumlusu tablolaştırılsın. Aynı alanı iki sistemin bağımsız yazması karara bağlanmadan geliştirilmesin.
5. **D03 sipariş/ödeme kuralları:** Kart ve havale/EFT, stok rezervasyon süresi, ödeme zaman aşımı/iptali, eksi stok, depo, kargo, iade/iptal geçişleri, ücret/vergiler, kupon/kişiselleştirme farkı ve sipariş kesinleşme anını durum makinesiyle tanımla. Tekrarlanan checkout ve webhook'ta tek sipariş/tek tahsilat/tek stok hareketi değişmezini yaz. İşlem bazında müşteri ve operatör görünürlüğünü belirt.
6. **D04 üretim ve tasarım girdisi:** Ürün/varyant bazlı ön/arka baskı alanının fiziksel ölçüsü, taşma, DPI, kabul edilen format, renk uzayı gerekiyorsa üretim tekniği, font/görsel kullanım koşulları ve insan üretim onayı için fiziksel örnek ve kabul dosyası topla. Sr. Creative Designer için marka, logo, gerçek medya/lisans envanteri ve ekran brief'i hazırla. Tam tasarım sistemi, ekranlar ve Creative → UI/UX → Frontend teslimi **Faz02'nin işi ve kabul koşuludur**; Faz01 kapanışına bağlanmaz. UI/UX sorumluluğunu Creative ve Frontend ortak taşır.
7. **D05–D06 sağlayıcı ve erişim:** Ödeme, kargo, bildirim/e-posta/SMS, AI, canlı destek/WhatsApp, Mikro sürümü/API veya ara katman ve üç pazaryerinin mağaza/test erişimi, sözleşme, kota, yetki, webhook ve test verisi matrisini çıkar. Her bağlantıda `hazır / erişim bekleniyor / yetenek belirsiz` durumu ve teknik muhatap kaydedilsin. Ödeme kart verisi uygulama içinde saklanmaz.
8. **D07 kurumsal süreç:** Kurumsal satış sahibiyle teklif talebi, fiyatlandırma, teklif onayı, geçerlilik, müzakere, e-posta, toplu siparişe dönüşüm ve kurumsal hesabın görünüm modelini kararlaştır. Talep otomatik ödemeli sipariş değildir. Faz07 için zorunlu alan/durum/geçiş ve onay kanıtını üret.
9. **D08–D09 AI ve mobil:** AI alternatif sayısı, limit, maliyet tavanı, içerik kuralları, çıktının düz görsel/katman niteliği ve insan devri; iOS/Android'in kaynakta istenen editör eşliği, cihaz performansı, push izinleri, mağaza hesapları ve dağıtım yaklaşımını örnek akışla kaydet. Uygulama kütüphanesini mevcut kod ve yetenek testinden sonra Sr. Full Stack + Sr. Frontend önerir, PM onaylar.
10. **D10 hukuk ve işletim:** Müşteri hukuk/operasyonundan KVKK ve satış metinleri, izin akışı, veri saklama/silme süreleri alınır. Hedef ortamlar, yedek/geri yükleme, ölçülebilir performans hedefi, RPO/RTO, üretim yetkisi ve yayın hesapları ayrı karar kayıtlarına yazılır. Bunlar müşteri kararı beklerken temel yetki, şifreleme ve denetim tedbirleri planlanır.
11. **Sözleşme taslakları:** Kimlik/rol, katalog-varyant, fiyat-stok, sepet-ödeme-sipariş/iade, tasarım, teklif, CMS, AI, entegrasyon ve rapor için API alan/durum/hata şemaları ve veri varlıkları hazırlanır. Her API'de nesne yetkisi, idempotency gereken komutlar, sayfalama, izleme ve test örneği belirtilir. Bu aşama kod üretimi değil, kodun girdisidir.
12. **Plan ve kapı:** Modüllerin bağımlılık sırasını, gerekli kişi/ortam kapasitesini, tasarım teslim ritmini, test sahiplerini ve her fazın kanıt dosyasını PM takvime bağlar. Gerekli girdisi olmayan iş `blokeli`; bağımsız işler ilerleyebilir. Tüm açık kararlar Faz00'a `ID, sahibi, etki, sonraki eylem, tarih, kanıt` ile aktarılır.
13. **Analiz2 yaratıcı keşif eki:** K-01–K-21'i mevcut ekran ve fazlarla ayrı fark matrisine bağla. Hedef kitle, marka konumlandırma, yetkili logo, gerçek ürün/varyant medyası ve lisansları, fotoğraf/video gereksinimi, XINOBI U ve Nobi görsel kişiliği ile görsel başarı ölçütlerini Creative Designer ve Web Designer brief'ine ekle. Dyson yalnız ürün merkezli hiyerarşi, sade yüzey, güçlü hero, kısa ve kanıtlanabilir fayda ile net CTA referansıdır; logo, metin, varlık, font veya birebir düzen kopyalanmaz.
14. **AI-P01 sağlayıcı kararı:** Proje sahibi 01.10.2026'da Cloudflare Workers AI'ı onayladı. CTO Advisor Faz10 öncesi seçilecek Cloudflare modelinin görsel üretim/düzenleme, dört aday kalitesi, veri işleme, ticari lisans, fiyat/kota, gecikme, gözlemlenebilirlik ve çıkış koşullarını resmi kaynaklarla doğrular. Sağlayıcı seçimi D05/D08'in diğer maliyet, kota, içerik ve veri kararlarını otomatik kapatmaz; entegrasyon Faz10 sırasındadır.
15. **İş planı, sprint ve teslim takvimi:** Kapsamın "proje iş planı" ve "sprint ve teslim takvimi" maddeleri için PM; her faz/alt iş için tahmini süre, sprint uzunluğu, gerçek kişi kapasitesi, bağımlılık yolu, kilometre taşları ve müşteri inceleme tarihlerini hazırlar; Faz00 §1 takvim tablosuna işler. Blokeli işler takvimde karar tarihine bağlanır. Takvim proje sahibinin onayı olmadan kesin sayılmaz.
16. **Türkiye e-ticaret yükümlülükleri (D11):** Hukuk ve muhasebeyle mesafeli satış sözleşmesi ve ön bilgilendirme formunun ödeme öncesi onay ve sürüm saklama kuralı; ETBİS kaydı; İYS kapsamında SMS/e-posta ticari ileti izni ve izin kaydı; e-Fatura/e-Arşiv'in Mikro'da mı, entegratörde mi, uygulamada mı kesileceği; pazaryeri siparişlerinde fatura sorumluluğu belgelenir. Sonuç Faz05/07/08/11'e bağlanır.
17. **Mevcut veri ve geçiş envanteri:** Pazaryerlerindeki mevcut ürün/varyant/SKU, müşteri ve açık sipariş verisinin hacmi, kalitesi ve ilk yükleme yöntemi; varsa eski web sitesi URL'leri (301 haritası için); canlıya geçiş gününde stok çift satışını önleme yaklaşımı. Çıktı Faz04/08/09/11'in ilk yükleme ve geçiş planına girdi olur.
18. **Kalite hedefleri ve maliyet (D14):** Analiz2 §20.1 başlangıç mühendislik hedefleri (sayfa performansı, API p95, hata oranı, eşzamanlı kullanıcı, kullanılabilirlik) müşteriyle ölçülebilir değere dönüştürülür; RPO/RTO ile birlikte Faz00'a yazılır. Altyapı ve sağlayıcıların aylık maliyet tahmini, proje sonrası bakım/garanti ve hata düzeltme süreleri proje sahibiyle kararlaştırılır.
19. **Analiz2 açık kararları:** K-13 "Market hesabı" anlamı (D12) ve "Desenler" menüsünün içerik/lisans/satın alma modeli (D13) iş sahibine sorulur; yanıt gelene kadar ekran veya veri modeli uydurulmaz. Siyah tema panel dokümanındaki kapsam dışı modüller (hızlı satış, bayi, puan/bakiye, tema motoru, sosyal giriş) için alma/almama kararı Faz00 §4'e yazılır.

## Karar defteri ve blokaj koşulu

| ID | Mutlaka kaydedilecek karar/kanıt | İş sahibi; kapanmadan bloke olan iş |
|---|---|---|
| D01 | Repo/env/veri envanteri; reuse kararı ve build kanıtı | PM + teknik ekip; başlangıç mimarisi ve migration |
| D02 | Alan bazlı ana kayıt ve Mikro yönleri | Operasyon + Mikro sahibi; stok/fiyat çift yazımı, entegrasyon kesinleşmesi |
| D03 | Durum geçişleri, ödeme, rezervasyon, iade, kargo | Satış/operasyon; checkout ve sipariş kesinleştirme |
| D04 | Fiziksel baskı ölçüsü/format/DPI ve onay örneği | Ürün/üretim; baskı ve editör üretim kabulü |
| D05 | Sağlayıcı sözleşmesi/test erişimi ve limit | Xinobi + PM; gerçek ödeme/kargo/bildirim/AI/devir testleri |
| D06 | Mikro sürümü/API, üç mağaza erişimi ve yetenek | Xinobi + entegrasyon sahipleri; ilgili canlı senkron |
| D07 | Teklif onayı, fiyat ve siparişe dönüşüm yöntemi | Kurumsal satış; Faz07 dönüşüm ve UAT |
| D08 | AI kota/içerik/alternatif/çıktı/maliyet | Xinobi ürün; AI üretim kabulü |
| D09 | Mobil editör eşliği, cihaz, push ve mağaza hesabı | Ürün + mobil sorumlusu; mobil yayın |
| D10 | Hukuki metin/rıza ve saklama | Xinobi hukuk/operasyon; ilgili metinlerin yayını ve canlı kabul |
| D11 | Mesafeli satış/ön bilgilendirme onayı, ETBİS, İYS, e-Fatura/e-Arşiv sorumluluğu | Hukuk + muhasebe; checkout canlı kabulü, bildirim gönderimi, Mikro fatura akışı |
| D12 | K-13 "Market hesabı" anlamı | Ürün sahibi; ilgili ekran/hesap modeli |
| D13 | "Desenler" içerik/lisans/satın alma modeli | Ürün sahibi + Creative; Desenler sayfası ve editör şablon bağı |
| D14 | Bakım/garanti/SLA ve aylık işletim maliyet tavanı | Proje sahibi + PM; Faz11 devir ve canlı kabul |

Karar kaydı formatı: `ID | soru | seçenekler | seçilen karar | kaynak kanıt/bağlantı | müşteri karar sahibi | tarih | etkilediği faz/API/veri/ekran | alternatif/geri dönüş | durum`. Süresi gelen ama yanıtlanmamış karar açık kalır; PM, iş sahibinin yerine varsayımı imzalamaz. Test sağlayıcısı yoksa mock ile geliştirme kanıtı üretilebilir, gerçek entegrasyon kabulü bloke kalır.

## Doğrulama senaryoları

| ID | Senaryo | Beklenen kanıt |
|---|---|---|
| F01-T01 | Her kaynak kapsam maddesi aranır | Gereksinim matrisinde tekil ID, hedef faz ve UAT; sahipsiz satır yok |
| F01-T02 | Var/yok repo ve örnek operasyon kaydı incelenir | D01 kararı ile as-is kanıtı birbirinden ayrılmış, çalıştırma sonucu kayıtlı |
| F01-T03 | Aynı stok/fiyat iki kaynakta farklıdır | D02 sahip/öncelik kararı veya bloke statüsü; sessizce seçim yapılmaz |
| F01-T04 | Ödeme callback'i iki kez gelir / havale bekler | D03 şemasında tekil sonuç, rezervasyon ve geçiş tanımlı |
| F01-T05 | Baskı alanı ve teklif dönüşümü sorulur | D04/D07 fiziksel örnek ve müşteri onayı veya açık blokaj vardır |
| F01-T06 | Pazaryeri erişimi yok, mobil editör belirsiz | D06/D09 ilgili geliştirme/test ve yayın kapısı blokeli, bağımsız işler planlı |
| F01-T07 | Takvim ve sprint planı istenir | Faz00 §1 takviminde her faz için tarih/kapasite veya karar tarihine bağlı `Belirlenmedi` gerekçesi |
| F01-T08 | Sipariş ödemesi ve bildirim yasal yükümlülüğü sorulur | D11 sahibi ve kararı ya da açık blokaj; Faz05/08 bağlantısı |

## Teslim kanıtları

`gereksinim-matrisi`, `as-is/to-be`, `D01-D10-karar-defteri`, `erişim-ve-sağlayıcı-envanteri`, `alan-sahipliği-ve-durum-geçişleri`, `API-ve-veri-sözleşme-taslağı`, `creative-brief-ve-medya-envanteri`, `faz-bağımlılık-ve-UAT-planı` dosyaları repoda sürümlenir. Tam `design/handoff.md` ve ekran tasarımları Faz02 teslimidir. Adlandırma/konum gerçek repo kurulumunda Faz00'a yazılır; kanıtların erişimi, sürümü ve alıntı ID'si olmadan tamamlandı işareti konmaz. Müşteri kararları ve insan UAT imzaları ayrıca beklenir.

## Bitiş ölçütü

- Kapsamın tamamı gereksinim matrisinde; D01–D10'un her birinde müşteri sahibi, karar/engel, delil ve kapı etkisi bulunur.
- K0 keşif bulgusu ve K1 süreç/veri/rol/API taslağı PM tarafından incelenmiştir; açık kararlar ilgili uygulamayı blokeler ve Faz00'a taşınmıştır.
- Creative için kaynak marka/medya envanteri ve ekran brief'i hazırlanmış; Faz02 tasarım ve handoff işi ön koşul olarak açılmıştır.
- Ekip rolleri ayrı ayrı gerçek inceleme kaydı vermedikçe onay kutusu işaretlenmez; PM her koşulda son kapıyı değerlendirir.

## Uygulama durumu — 14.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~45 % · kalan ~55 % · Statü: Bloke (müşteri kararları)**

| Madde | Durum | Kanıt / eksik |
|---|---|---|
| 1 Kaynak izlenebilirliği | Tamam | `docs/discovery/requirements-traceability.csv` (367 satır) |
| 2 Bugünkü operasyon | Kısmi | `as-is-to-be.md` taslak; yetkili kullanıcı görüşmesi ve anonim örnek kayıt yok |
| 3 D01 | Kısmi | Sıfırdan geliştirme kararı; operasyon/veri örneği ve barındırma envanteri eksik |
| 4–10 D02–D10 | Bloke | `decision-register.md` (30.09’dan beri güncellenmedi), `stakeholder-decision-intake.md`; hiçbir karar müşteri sahibiyle kapanmadı |
| 11 Sözleşme taslakları | Tamam | `docs/contracts/*`, `data-ownership-and-state-transitions.md` |
| 12 Plan ve kapı | Kısmi | `phase-dependency-uat-plan.md`; kapasite ve tarih yok |
| 13 Analiz2 yaratıcı keşif | Tamam | `creative-brief-input.md`, `design/analysis2-gap-matrix.md` |
| 14 AI-P01 | Tamam | ADR-002 (CTO PoC doğrulaması Faz10’a kaldı) |
| 15 İş planı/sprint takvimi | Yok | Faz00 §1 takvim satırı `Belirlenmedi` |
| 16 D11 | Bloke | Hukuk/muhasebe kararı yok |
| 17 Mevcut veri ve geçiş envanteri | Yok | Pazaryeri ürün/SKU/müşteri hacmi, eski URL listesi yok |
| 18 Kalite hedefleri ve maliyet (D14) | Yok | p95/RPO/RTO ve maliyet tavanı yazılmadı |
| 19 D12/D13 ve kapsam dışı modüller | Bloke | Ürün sahibi yanıtı yok |

**Sonraki adım:** `decision-register.md`’yi Faz00 §4 ile eşleyip her D kararına sahip ve hedef tarih yazmak; 01.15 takvimini proje sahibiyle doldurmak.

## Yedi rolün inceleme/onay kaydı

Bu tablo görevlendirme ve bekleyen incelemeyi gösterir; gerçek çalışan imzası veya 20+ yıllık deneyimin doğrulaması değildir.

| Rol | Denetleyeceği kanıt | Durum | İsim/tarih/kanıt |
|---|---|---|---|
| Proje yöneticisi (PM) | D01–D10 sahipleri, kapsam ve bağımlılık kapıları | Beklemede | — |
| İş analisti | Gereksinim izlenebilirliği, as-is/to-be, iş kararları | Beklemede | — |
| Sr. Creative Designer | Marka/medya girdisi ve Faz02 brief'i | Beklemede | — |
| Sr. Frontend Developer | Web/panel ekran ve editör etkileşimi | Beklemede | — |
| Sr. Backend Developer | API, ödeme/sipariş/entegrasyon taslakları | Beklemede | — |
| DBA | Ana kayıt, veri bütünlüğü, taşıma ve saklama | Beklemede | — |
| Sr. Full Stack Developer | Web/mobil/API uygulanabilirliği, ortam ve dağıtım | Beklemede | — |
| CTO Advisor (ek zorunlu rol) | AI-P01 doğrulaması, barındırma/nesne depolama adayları, maliyet ve çıkış planı | Beklemede | — |

**PM nihai onay kapısı:** Yedi rolün değerlendirmesi, müşteri kararları ve blokajlar Faz00'a bağlandıktan sonra PM `KABUL / RED`, tarih ve kanıt referansını yazar. Bağımsız keşif işleri açık kararlarla sürse de blokeli uygulama işi kabul edilmez. Şu an **beklemede**; PM onayı olmadan Faz01 kapatılmaz.
