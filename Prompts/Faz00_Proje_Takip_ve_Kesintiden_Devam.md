# Faz00 — Xinobi yürütme, karar ve kesintiden devam defteri

## 11.11.2026 — Maskeleme akışının geri getirilmesi

Ayrı kaynak fotoğraf kaydı zorunluluğu kaldırıldı. Ürün yüzeyleri mevcut katalog fotoğrafını indirme, gerçek boyutlu prompt kopyalama, WebP maske yükleme, önizleme ve yalnız seçilen fotoğrafa onayı destekler. Başka renkler için toplu onay/kopyalama yoktur. GET salt okunur; ilk geçerli maske yüklemesi kaynak kopyasıyla taslağı kaydeder. Eski kaynaklar/siparişler ve normal katalog korunur. [Kapsam kararı](../docs/decisions/catalog-photo-mask-workflow-2026-11-11.md), [TST-272](../test/2026-11-11/TST-272-catalog-photo-mask-workflow.md). Gerçek veri taşıma veya deploy yapılmadı.

## 04.11.2026 - Sürat uçtan uca test (TST-249)

Gerçek API/adaptör/depo zinciri bellek içi sağlayıcıyla ve admin/müşteri ekranları sahte API ile test edildi. Formun hata sonrası kaybolması ve boş takip belgesinin başarı sayılması düzeltildi; güvenli hata neden sınıfları kalıcı kayda eklendi. Nihai API 589 geçti / 29 atlandı / 0 başarısız; API Release 0 uyarı/hata, admin lint/build ve 8 Chrome fixture senaryosu, web üretim derlemesi ve 2 takip testi, bağımsız yazılımsal Code128 okuma geçti. [Senaryo bazlı sonuç ve bağımlılıklar](../test/2026-11-04/TST-249-surat-end-to-end.md). Onaylı test alıcı/paket verisi ve güvenli yerel test hesabı yok: gerçek gönderi/takip zinciri çalıştırılamadı. Yeni gerçek ön kontrol yalnız kimliksiz edge 302; Windows/IIS sonucu değildir. Production koruması korunuyor; gerçek SQL çoklu süreç ve fiziksel barkod/şube kabulü açık. Deploy/APK yok; TIC-08 kısmen yapıldı.

## 04.11.2026 - Sürat iptal yarışı ve takip geçmişi

KRG-SUR-01 / TIC-08: admin gönderiminden önce atomik sipariş rezervasyonu; müşteri/panel iptali ve manuel sevk çakışmasının engellenmesi; aynı parça için eski sağlayıcı yanıtlarının kalıcı arşivi eklendi. Sipariş/ödeme statüsü değiştirilmez. Gerçek tahsilat/operasyon verisi olmayan demo modelinde Production oluşturma kapalı kalır. [TST-248](../test/2026-11-04/TST-248-surat-hardening.md): nihai API 572 PASS / 29 SKIP / 0 FAIL, Release 0 uyarı/hata; admin build/lint (4 mevcut uyarı) ve altı Chrome senaryosu PASS. Rezervasyon otomatik bırakılmaz; eski denemelere rezervasyon uydurulmaz. Sağlayıcı/etiket/fiziksel kabul, IIS erişimi ve gerçek SQL çoklu süreç kabulü açık. Güncel açık matrisi ve sonraki uçtan uca senaryolar raporda; gerçek sağlayıcı çağrısı, deploy ve APK yok. Entegrasyon tamamen tamamlandı sayılmaz.

## 03.11.2026 - Sürat gerçek takip erişimi ve bağımsız ön kontrol

.NET istemcisiyle test takip metodu HTTP 200 / `Sipariş bulunamadı.` / boş Gonderiler yanıtladı. Önceki istemcinin 403 sonucu genel IP/hesap blokajı sayılmaz. Bu dar yanıt AwaitingAcceptance olarak düzeltildi; diğer hatalar ayrılır ve boş sonuç tekrar gönderime izin vermez. [Sunucu ön kontrol komutu/paket yönergesi](../Entegrasyonlar/01-Surat-Kargo/ON-KONTROL.md), [sansürlenmiş kanıt](../Entegrasyonlar/01-Surat-Kargo/erisim-on-kontrol-2026-11-03.json). [TST-246](../test/2026-11-03/TST-246-surat-preflight-access.md): 51 odaklı PASS; tam API 565 PASS / 29 SKIP / 0 FAIL. [TST-247](../test/2026-11-03/TST-247-surat-preflight-package.md): ayrı klasörde çalışabilen ön kontrol ZIP paketi bütünlük/secret/smoke kontrolünden geçti; paket Git dışında. Gerçek gönderi, asıl IIS egress/erişim, etiket/SQL/cihaz ve canlı uygunluk kabulleri açık.

## 03.11.2026 - Sürat sipariş ekranı, etiket ve takip teslimi

KRG-SUR-01: admin sipariş/entegrasyon ekranı, test Code128 etiketi, kanıtlı uzlaştırma ve kontrollü aynı-ref denemesi, lease/backoff takip işi, müşteri sahiplik kontrollü DTO ve web/Flutter gösterimi eklendi. Ticari sipariş statüsü/ödeme otomatik değiştirilmez. [Kurulum ve kabul kapıları](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). Salt okunur gerçek test erişimi HTTP 403; nedeni sağlayıcı teyidi bekliyor. [TST-245](../test/2026-11-03/TST-245-surat-shipment-delivery.md): 38 odaklı; tam API 552 PASS / 29 SKIP / 0 FAIL; admin 20/20, Flutter 283, web 2/2. Gerçek gönderi/Production açılışı/deploy yok. COD/pazaryeri/tarife ve gerçek SQL/cihaz/barkod kabulleri ayrı açık; TIC-08 tamamlandı sayılmaz.

## 03.11.2026 - Sürat kalıcı gönderi ve admin API

Ortak FeatureDocuments transaction/kilidiyle kalıcı referans, attempt, paket/adres kopyası ve sonuç kaydı; çift istek/yeniden başlatmada write tekrarını engelleme eklendi. GET/POST admin orders/{id}/surat-shipment, sunucu orders.read/write kontrolüyle açık. Canlı mod uygunluk doğrulanmadığından engelli; sipariş statüsü değişmez. Admin ekranı, uzlaştırma, etiket ve polling açık. [TST-244](../test/2026-11-03/TST-244-surat-persistent-admin-api.md): 26 odaklı PASS; tam API 540 PASS / 29 SKIP / 0 FAIL; TS/Dart PASS. [Kurulum/sınırlar](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md).

## 03.11.2026 - Sürat Kargo ilk sunucu adaptörü

KRG-SUR-01 başladı: kapalı varsayılan/test-canlı ayrımı, doğrudan taşıyıcı JSON istemcisi, katı kabul yanıtı, write retry olmadan belirsizlik, takip belge/ID/durum ayrımı eklendi. [Kurulum ve sınırlar](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). Kalıcı idempotency, admin sipariş bağlantısı, Code128 etiket ve takip işi henüz yok; entegrasyon tamamlandı sayılmaz. Gerçek çağrı/secret/deploy yok. [TST-243](../test/2026-11-03/TST-243-surat-server-adapter.md): 17/17 odaklı; tam API 531 PASS / 29 SKIP / 0 FAIL.

**03.11 SIP-TAS-09 son test/kabul kaydı:** SIP-TAS-01…08 kaynak ve test kayıtlarından doğrulandı. Kimlik, yerleşim ve üç dosyanın eşliği; düzenleme, silme, katalog/maske değişimi ve dosya deposunun yeniden başlatılmasından sonra da korunuyor. 320/390/768/1440 px'te normal ve %200 metin, axe (kritik/ciddi 0), klavye, odak ve duyuru kontrolleri geçti; üretim eylemi yok. Admin 18 test dosyası + 4 tools senaryosu, API 514 test (29 atlandı) PASS; web e2e 17/18 (1 bilinen kararsız test). Teknik kabul tamam; izole SQL, canlı IIS, ekran okuyucu/cihaz ve iş sahibi kabulü açık. [Kabul matrisi](../design/order-design-acceptance-2026-11-03.md), [TST-239](../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md). KIS-07 kapanmadı.

## 03.11.2026 - Sürat iletilen bilgiler eki

Sürat klasöründe e-posta bilgileri ve teknik plan birleşik yerel PDF/Markdown olarak hazırlandı. Test/canlı hesap bilgileri alındı; parola değerleri çoğaltılmadan özgün RTF kaynak gösterildi. RTF/ekler ve yerel nüsha Git dışında. Bağlantı veya gönderi testi yapılmadı.

**03.11 SIP-TAS-08 uygulaması:** Eski, eksik ve kısmi sipariş tasarım kayıtları her kartta bağımsız değerlendiriliyor. SIP-TAS-02 öncesi siparişin kendi desen ve kompozisyon kopyası, “doğrulama özeti kaydedilmedi” etiketiyle (`X-Xinobi-File-Check: unrecorded`) erişilebilir kalıyor. Saklanmamış dosyalarda indirme kapalı ve nedeni yazıyor. Servis hatası eksik kayıt sayılmıyor; “kaydın olup olmadığı bilinmiyor” mesajı ve tekrar dene var. Katalog/tasarım yedeği kullanılmıyor. Salt okunur `order-design-files-dry-run` envanteri ve geri dönüş planı hazır; gerçek veriye yazma yapılmadı. API 513 test PASS (29 atlandı); 7 durumlu Chrome matrisi ve regresyonlar PASS. [TST-235](../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md). Gerçek veride envanter/geri doldurma kararı, SIP-TAS-09 ve rol/PM onayı açık.

## 03.11.2026 - Entegrasyon klasörleri

[Entegrasyonlar](../Entegrasyonlar/README.md) altında 13 ayrı hazırlık klasörü açıldı; kapsam, açık kararlar ve faz bağlantıları eklendi. Sürat plan/PDF kaynaklarına bağlandı. Sağlayıcı seçimi açık başlıklar adlandırılmadı; geliştirme/bağlantı testi yapılmadı ve task statüleri değiştirilmedi.

**03.11 SIP-TAS-07 uygulaması:** Desen, ürün kaynak görseli ve kompozisyon uçları ile müşteri, panel ve açık medya yolları uçtan uca denetlendi. Her istekte personel+MFA+`orders.read` kontrolü yapılıyor; dosya saklı sipariş/satır referansından çözülüyor, hata gövdeleri iç bilgi sızdırmıyor. İzole API matrisi PASS: anonim, müşteri, başka müşteri, izinsiz, MFA'sız ve süresi dolmuş personel; başka sipariş/satır; 404/503. Admin indirmesi: `aria-disabled` kilidi odak koruyarak çalışıyor, hata açıklamasına odak taşınıyor, 503 ve bağlantı kesintisinde tekrar dene var; başarı mesajı yalnız “tarayıcıya verildi” diyor (21 Chrome senaryosu PASS). API 511 test PASS (29 atlandı). İndirmelerin audit kaydı mevcut yaklaşımda yok; ayrı karar açık. [TST-231](../test/2026-11-03/TST-231-sip-tas-07-file-access.md). SIP-TAS-08/09, gerçek SQL/canlı kabul ve rol/PM onayı açık.

## 03.11.2026 - Belge arşivi düzeni

Üç önceki PDF ile bugünkü üç PDF [Proje Yönetimi/Belgeler](../Proje%20Y%C3%B6netimi/Belgeler/README.md) altında tarihli klasörlere alındı. Düzenlenebilir kaynaklar bağlandı; eski paylaşım yolları korundu. İçerik/task durumları değiştirilmedi; dosya hashleri manifestte.

## 03.11.2026 - Sürat Kargo entegrasyon hazırlığı (yalnız plan)

KRG-SUR-01 planlandı. E-posta ve ZIP (17 PDF sayfası, 6 Postman isteği) incelendi; MostGate konusu/açıklaması, alan/config yerleşimi, alt işler ve uygulama promptu hazır. Kod/secret/gerçek gönderi değişikliği ve sağlayıcı çağrısı yapılmadı. [Task, alan eşleştirmesi ve prompt](../docs/tasks/surat-kargo-integration-plan-2026-11-03.md). [PDF](../output/pdf/xinobi-surat-kargo-entegrasyon-task-ve-uygulama-plani-2026-11-03.pdf).


**03.11 SIP-TAS-06 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/composition` (`orders.read`) siparişe bağlı kompozisyon kopyasını SHA-256 ve JPEG türüyle doğrulayıp veriyor; dosya adı `…-giydirilmis-onizleme-rev{r}.jpg`. Kopya yoksa nedeni yazılıyor; ham desen veya güncel tasarım yedek olarak kullanılmıyor. Admin kartı aynı dosyayı “Temsilidir … Baskıya hazır dosya değildir” etiketiyle gösteriyor ve indiriyor. Web kaydı, önizleme tuvali olmadan yerleşim kaydetmiyor. API 510 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Web design-configuration e2e 16/18; düşen 2 test değişiklik olmadan da kararsız, değişiklikle 2/2 PASS. [TST-227](../test/2026-11-03/TST-227-sip-tas-06-composition.md). SIP-TAS-07…09 yapılmadı; gerçek veri/canlı kabul ve rol/PM onayı açık.

**03.11 SIP-TAS-05 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/source` (`orders.read`), editörün maskelediği ürün fotoğrafının sipariş anındaki kopyasını veriyor. SHA-256, baytlardan saptanan tür ve fotoğraf ölçüsünün kayıtlı editör tuvaline eşitliği doğrulanıyor; dosya adı `…-urun-kaynak-{SKU}`. Kopya yoksa nedeni yazılıyor; katalog fotoğrafı, başka renk veya maske yedek olarak verilmiyor. Admin kartında kilitli indirme düğmesi var. Katalog/renk/maske değişimi, yol aşımı ve keyfi URL senaryoları izole testte PASS. API 508 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. [TST-223](../test/2026-11-03/TST-223-sip-tas-05-source-download.md). SIP-TAS-06…09 yapılmadı; gerçek veri/canlı kabul ve rol/PM onayı açık.

**03.11 SIP-TAS-04 uygulaması:** Yeni yönetici ucu `GET /api/v1/admin/orders/{id}/lines/{line}/pattern` (`orders.read`) siparişe bağlı desen kopyasını sunucuda sipariş/satırdan çözüyor. Baytlar değiştirilmeden, SHA-256 ve baytlardan saptanan MIME doğrulanarak `xinobi-{no}-satir-{n}-desen[-rev{r}].{uzantı}` adıyla indiriliyor. Admin Ham desen kartında kilitli “Ham deseni indir” düğmesi, 404/403 açık durumu ve servis hatasında tekrar dene var. API 506 test PASS (29 atlandı); sözleşme, admin, web ve Flutter analizi PASS. Canlı ortam ve SQL kabulü açık. [TST-219](../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md). SIP-TAS-05…09 yapılmadı; rol/PM kabulü verilmedi.

**03.11 SIP-TAS-03 uygulaması:** Admin sipariş tasarım detayı, sipariş satırındaki kayıtlı yerleşimi salt okunur gösteriyor. Tuval, konum (piksel + tuvale göre gösterim yüzdesi), ölçek, döndürme, mod, maske doldurma, kavis, yüzey sürümü ve gövde/bölge ayarları birim ve anlamıyla etiketli. Sipariş/satır/konfigürasyon/revizyon satırı ve desen–revizyon SHA-256 bağı gösteriliyor. Eksik alan “Kaydedilmemiş” (sıfır/aktif değil); şema 1 dışı yorumlanmadan ham; eski kayıt açıklamalı. Editör varsayılanı, mm/DPI ve baskı uygunluğu yok. Admin lint/TS/build ve fixture testleri (320/390/1440, %200) PASS. [TST-215](../test/2026-11-03/TST-215-sip-tas-03-order-placement.md). SIP-TAS-04…09 yapılmadı; rol/PM kabulü verilmedi.

**03.11 SIP-TAS-02 uygulaması:** Sipariş satırına `Files` sözleşmesi eklendi: desen, maskelemede kullanılan ürün kaynak görseli ve giydirilmiş önizleme; her biri SHA-256, tür ve bayt ile. Ürün kaynak görseli sipariş anında yüzeyin kayıtlı kaynak özetiyle doğrulanıp siparişe kopyalanıyor. Desen konfigürasyon özetiyle eşleşmezse sipariş reddediliyor; okumada özet farklıysa dosya verilmiyor (503). Tasarım silme/düzenleme, katalog/maske değişimi, eski revizyon, tekrar istek ve yarım kopya izole fixture ile PASS. API 502 test PASS (29 atlandı); sözleşme/admin/web/Flutter analiz PASS. Gerçek SQL kabulü açık (izole SQL yok), eski siparişler geriye dönük doldurulmadı. [TST-211](../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md). SIP-TAS-03…09 yapılmadı.

**03.11 SIP-TAS-01 uygulaması:** Admin sipariş detayında kişiselleştirilmiş her satır için “Sipariş tasarım detayı” alanı eklendi. Alanda sipariş/ürün/SKU/varyant/renk/tasarım/konfigürasyon/revizyon, okunur kayıtlı yerleşim ve ayrı üç görsel kartı var. Ham desen dosya doğrulanınca önizlenir ve mevcut korumalı uçla indirilir. Ürün kaynak görseli ve giydirilmiş önizleme için açıkça “İndirme hazır değil” yazar. Eksik alanlar “Bu siparişte kaydedilmemiş” olarak gösterilir. Fiziksel profil/kalibrasyon/ölçüm ekranı tasarım ekranından kaldırıldı (API/veri korunur); menü “Tasarımlar”. Sipariş/kargo/iptal/iade işlemleri ve tasarımdan siparişe geçiş korundu. Sipariş penceresinde etiket kontrastı ve %200 yazı taşması da düzeltildi. Admin lint/TypeScript/derleme ve izole Chrome regresyonları PASS. [TST-207](../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md). SIP-TAS-02…09 yapılmadı; rol/PM kabulü verilmedi.

**03.11 task prompt dokümanı:** SIP-TAS-01...09 için MostGate konusu/açıklaması ve bağımsız uygulama promptları [Markdown](../docs/tasks/order-design-mostgate-prompts-2026-11-03.md) / [PDF](../output/pdf/xinobi-siparis-tasarim-mostgate-tasklar-ve-promptlar-2026-11-03.pdf) olarak hazırlandı. Bu doküman çalışmasında uygulama yapılmadı ve MostGate kaydı açılmadı; önceki kapsam ve task durumları değiştirilmedi. [TST-206](../test/2026-11-03/TST-206-mostgate-prompt-document.md).

## 03.11.2026 - Kapsam kararı: sade sipariş tasarım detayı

**Karar sahibi/kaynak:** Kullanıcının bu sohbetteki açık talebi. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, üretim onayı ve baskı render kuyruğu istenmiyor. Kullanıcı yalnız plan/task/faz kaydı istedi; geliştirme yetkisi bu iş için verilmedi.

**Teslim:** Kayıtlı editör yerleşimi + ayrı desen + maskelemede kullanılan ürün kaynak görseli + gösterilebilir/indirilebilir giydirilmiş görsel. Üç dosya doğru sipariş/satır/revizyona bağlı kalır. [SIP-TAS-01...09 planı](../docs/tasks/order-design-detail-scope-2026-11-03.md).

**Plan etkisi:** KAR-05 revize; KIS-01/05/06 kapsam dışı (tamamlandı değil); KIS-03/07 sipariş dosya/sürüm teslimi; KIS-08 dosya kabulü/fiyatlandırma. Faz01/02/03/05/06/11 ve 120 ana task listesi eşlendi. Geçmiş kapsamlar tarihsel; bu karar çelişkide öncelikli. Genel editör, ödeme/kargo/iade ve entegrasyon işleri iptal edilmedi. Faz/PM uygulama onayı verilmedi.

**Durum:** 9 alt task planlandı; API/admin/web/Flutter kodu veya veri değiştirilmedi. [Doküman kontrolü TST-205](../test/2026-11-03/TST-205-order-design-scope-plan.md).

**03.11 Flutter eşlik incelemesi:** Kaynak5da96ed; analiz ve280 test PASS, favori iptal/taşıma kaybı P1 ve açılış oturum hatası P2 açık. [TST-203](../test/2026-11-03/TST-203-flutter-parity-review.md). İnceleme yapıldı, kod düzeltmesi veya platform kabulü verilmedi.

**03.11 Flutter–web görsel/durum uygulaması:** Flutter ekranları web istek durumlarıyla karşılaştırıldı: favoriler hesap API'sine taşındı, hata/tekrar dene/teyitli başarı/taslak/işlem kilidi eklendi, 192 hücrelik widget matrisi (32 rota × 3 genişlik × 1x/2x) ve Android 14 doğrusal olmayan ölçek testi geçti; 280/280 Flutter testi. Android emülatörde oturum kapalı akışlar ve OS %200 yazı denendi; iOS Bloke (Xcode yok). [Ekran/kusur matrisi](../design/flutter-consistency-audit-2026-11-03.md), [TST-196](../test/2026-11-03/TST-196-flutter-web-consistency.md). Gerçek telefon, oturum açık cihaz akışı, TalkBack/VoiceOver ve handoff kabulü açık; faz onayı/yüzde değiştirilmedi.

**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

**30.10 güncel kayıt:** Tüm 120 kapanış taskı Faz01-11 ile eşlendi; müşteri girdileri, teknik geliştirme ve gerçek kabul açıkları ayrıldı. [Ana liste](../docs/tasks/project-closure-2026-10-30.md), [faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Son uygulama kaynağı `de99958`; faz onayı/yüzde güncellemesi yok.

**27.10 son üretim tercihi:** Ek yerel denetim ve bağlı kurulum kullanıcı isteğiyle kaldırıldı; tek aday üretimi geri geldi. Prompt v5 her isteme açık yazı/imza/logo/ürün/eşya yasakları ekler, rafine çizim kuralları korunur. [Test kaydı](../test/2026-10-27/TST-art-direction-v5.md).

> **Bu dosyanın ilk hali bir plan ve doldurulabilir çalışma kaydıdır.** Bu ifade başlangıç planının durumunu anlatır; güncel uygulama, test ve yayın durumu §5’te, tarihli kabul kayıtları §7’dedir. Her çalışma oturumu başında okunur, anlamlı her değişiklikten sonra ve oturum kapanışında güncellenir.

## 0. Önce bunu oku

1. Kaynak sıra: müşteri kapsamı `Xinobi_Proje_Kapsami(4).md` → hazırlanan kavramsal/teknik analiz `Xinobi_Kavramsal_ve_Teknik_Analiz.md` (kalıcı dosya adı `Xinobi_Kavramsal_ve_Teknik_Analiz(1).md`) → bu Faz00 → ilgili Faz01–Faz11 → mevcut kod/ADR/gerçek test kanıtı. **Yeni depoda ilk iş**, Library'deki bu iki var olan kaynağı `docs/sources/` altına salt okunur kopya olarak alıp özgün ad, sürüm/tarih ve doğrulanmış yol eşlemesini Faz00'a yazmaktır; kaynak okunamıyorsa kapsam işini başlatma. Kaynaklar çelişirse müşteri kapsamında açık teslimi silme; çelişkiyi karar kaydına taşı. **Ek kaynaklar:** `Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` (K-01–K-21; Faz01/02/04/06/10/11'de bağlayıcı) ve `Proje Yönetimi/Yonetim_Paneli_Siyah_Tema_Teknik_Analiz_ve_Promptlar.md` (yalnız panel görsel dili/kabuk referansı) da `docs/sources/` altına SHA-256 ile salt okunur kopya olarak alınmalı ve sıraya müşteri kapsamı ile Analiz1'den sonra eklenmelidir. **Tamam (07.10.2026):** iki kopya SHA-256 ile `docs/sources/` altına salt okunur alındı (`docs/sources/README.md`). Panel dokümanındaki hızlı satış, bayi/riskli müşteri, bakiye/puan, tema/CSS-JS motoru, sosyal giriş ve ödeme/kargo ayar ekranları müşteri kapsamında yoktur; ancak §4 karar kaydıyla kapsama alınır, aksi halde yalnız görsel referanstır.
2. Çalışma başlangıcında bu dosyanın **Anlık durum**, **Blokajlar**, **Kesintiden devam** ve ilgili fazın önkoşul bölümünü oku; ardından `git status --short`, `git branch --show-current`, `git log -1 --oneline`, çalışma ortamı ve ilgili test komutlarını doğrula. Git deposu henüz yoksa Faz01'de mevcut repo/yeniden kullanım D01 kararıyla kurulacak.
3. Değişiklikten önce görevi küçük, doğrulanabilir adıma ayır; değişiklikten sonra gerçek komutu ve sonucunu kaydet. Üretim sırlarını, erişim anahtarlarını, müşteri kişisel verilerini veya gerçek bağlantı dizelerini asla Faz00'a yazma.
4. Bir hata/ara verme olursa yalnız **başarıyla biten** adımı işaretle; yarım dosyaları, hata mesajını ve güvenli yeniden başlatma komutunu yaz. Bir sonraki geliştirici Faz00 ile kodu karşılaştırır; kod kanıtsızsa önce doğrular.
5. Fazı yalnız yedi rolün uygulama inceleme kayıtları ve PM'nin **ayrı, açık son onayı** sonrası `Tamamlandı` yap. Doküman inceleme onayı, uygulamanın yapıldığı anlamına gelmez. PM şart gözetmeksizin her kapıyı değerlendirir; şart eksikse `RED` ve eksik kanıt verir.
6. Her test, build, lint, smoke, bağlantı veya entegrasyon doğrulaması sonrasında sonucu `test/` altında tarihli rapora ve `test/INDEX.md` indeksine işle. Başarısız denemeyi silme; düzeltme ve başarılı tekrar kimliğini bağla. Faz00 yalnız son özeti taşır, ayrıntılı kanıt `test/` klasöründedir.

## 1. Sınır ve teslim haritası

Toplam **12 dosya: Faz00–Faz11**. Faz00 bir kere yazılıp bırakılmaz; uygulama boyunca güncellenen tek ilerleme defteridir. Fazlar bağımlılığa göre yürür, uygun alt işlerin paralelliği Faz00'a yazılır. Tüm son kapsam: kurumsal web/CMS/SEO, B2C, panel, kişiselleştirme/editör/baskı, kurumsal teklif/toplu sipariş, Mikro, Trendyol–Hepsiburada–N11, AI tasarım ve satış asistanı/yönetimi, iOS/Android, test/eğitim/canlı geçiş.

| Dosya | İş paketi | Zorunlu bağımlılık | Başlangıç uygulama durumu |
|---|---|---|---|
| Faz00 | Bu kayıt, karar, değişiklik ve onay mekanizması | — | Plan dosyası hazır; uygulama yapılmadı |
| Faz01 | Keşif, D01–D10, iş akışları, ADR ve sözleşmeler | Faz00 | Planlandı |
| Faz02 | Creative yön, UI/UX, tasarım sistemi ve handoff | Faz01 temel marka/akış girdisi | Planlandı |
| Faz03 | Monorepo, API, SQL Server, güvenlik/rol, altyapı | Faz01 mimari/erişim kararları; panel 03.09 için Faz02 tasarım teslimi | Planlandı |
| Faz04 | Katalog, stok, fiyat, promosyon, CMS, SEO; gerçek dashboard, temel rapor ve sistem ayarları | Faz02 görselleri + Faz03 veri/API | Planlandı |
| Faz05 | B2C web, müşteri yönetimi, sepet/ödeme, sipariş/kargo/iade, ürün ve sipariş değerlendirmesi, e-posta/SMS/bildirim yönetimi | Faz03–04; D03/D05 | Planlandı |
| Faz06 | Basit kişiselleştirme, editör, baskı | Faz02–05; D04 | Planlandı |
| Faz07 | Teklif, kurumsal müşteri yönetimi ve toplu sipariş | Faz03–04; D07 | Planlandı |
| Faz08 | Mikro | Faz03–05; D02/D06 | Planlandı |
| Faz09 | Üç pazaryeri ve merkezi sipariş | Faz03–05; D02/D06 | Planlandı |
| Faz10 | AI tasarım ve satış asistanı/yönetimi | Faz03–04/06–07; D05/D08 | Planlandı |
| Faz11 | iOS/Android, bütünleşik UAT, eğitim, canlı/mağaza | Önceki modüllerin kabulü; D09/D10 | Planlandı |

**Takvim ve sprint planı — açık:** Müşteri kapsamı "proje iş planı" ve "sprint ve teslim takvimi"ni teslim olarak ister. Faz01 01.15 ile hazırlanacak takvim aşağıya işlenir; tarih uydurulmaz, sahipsiz satır `Belirlenmedi` kalır.

| Faz | Planlanan başlangıç | Planlanan bitiş | Sprint sayısı / süresi | Kapasite (kişi/rol) | Kilometre taşı |
|---|---|---|---|---|---|
| 01–11 | Belirlenmedi | Belirlenmedi | Belirlenmedi | Belirlenmedi | Belirlenmedi |

**Paralellik:** Mobil tasarım/Faz11 kabuğu Faz02–03'te, editör/mobile API sözleşmeleri Faz06'da başlayabilir. Faz08–10 bağlayıcılarının mock sözleşmeleri erken geliştirilebilir; gerçek uçtan uca kabul erişim ve müşteri kararına bağlıdır. Faz11'in final kapısı diğer tüm modülleri birleştirir.

## 2. Ekip, görev ayrımı ve onay

Yedi rolün her biri **20+ yıl deneyimli uzman bakışını temsil eden çalışma rolüdür**; burada gerçek kişilerin öz geçmişi veya imzası iddia edilmiyor. Uygulamayı yürütecek gerçek kişiler bu alanlara kendi adını/kanıtını ekler.

| Rol | Sorumluluk ve her fazda inceleme sorusu |
|---|---|
| PM (lead) | Bağımlılık, kapsam, risk, karar, kanıt, tüm rol değerlendirmeleri; **her koşulda nihai KABUL/RED** |
| İş Analisti | Kaynak gereksinimi, iş kuralı, senaryo/UAT, ürün sahibinin karar ve kapsam sahipliği |
| Sr. Creative Designer | Marka ve görsel yön, bileşen/varlık teslimi, görsel kalite, baskı ve mobil uygunluğu |
| Sr. Frontend Developer | Creative tesliminin UI/UX uygulanışı, web/panel/editör erişilebilirliği ve responsive davranış |
| Sr. Backend Developer | API, ödeme/sipariş tutarlılığı, adapter/AI güvenliği ve hata/tekrar işleme |
| DB Admin | Veri sahipliği, SQL Server bütünlüğü, migration, yedek/geri yükleme ve sorgu/erişim |
| Sr. Full Stack Developer | Web/mobil/API uçtan uca sözleşme, dağıtım, test ve geri alma |
| Web Designer | Creative yönü web bilgi mimarisi, responsive wireframe, yüksek doğruluk ekran, motion ve erişilebilir etkileşim tanımına dönüştürür; kodlama öncesi kullanıcı web tasarım onayını hazırlar |
| CTO Advisor | Teknoloji ve sağlayıcı adaylarını güvenlik, maliyet, veri işleme, taşınabilirlik ve işletim açısından karşılaştırır; ürün sahibinin onayı olmadan yığını veya sağlayıcıyı değiştirmez |

**Rol sayısı netleştirmesi:** Kabul kapısındaki "yedi rol" PM, BA, Creative, FE, BE, DBA ve Full Stack'tir. **Web Designer** ve **CTO Advisor** bu yediye ek, zorunlu inceleme rolleridir: Web Designer Faz02/04/06/11, CTO Advisor Faz01/03/10/11 kapılarında ayrı `ONAY / REVİZYON / BLOKE` kaydı verir. Bu fazlarda onların kaydı yoksa PM kapıyı kapatamaz. §7 tablosu ve ilgili faz rol tabloları buna göre genişletilmiştir.

**Creative → UI/UX → Frontend teslim sözleşmesi:** Designer marka konsepti, tokenlar, ekran prototipi, varlık lisansı, baskı yerleşimi ve durumları üretir. UI/UX sorumluluğunu Designer (akış/görsel) ile Frontend (etkileşim/erişilebilirlik/uygulama) ortak taşır. Frontend `handoff kabul` kaydı, eksik durum/ölçü/asset listesini Faz00'a işler; kabulden sonra bile tasarıma uymayan ekran bitmiş sayılmaz. Yedi rolün yanında ayrı bir UI/UX kadrosu varmış gibi onay yazılmaz.

**İki ayrı onay türü:** (a) şimdi verilen **plan dokümanı incelemesi**, yedi temsili rolün 12 dosyanın tutarlılığına bakması; (b) gelecekte her fazın **gerçek uygulama kabulü**, kod/test/görsel kanıtı ve gerçek iş sahibinin gerekli ürün kararı. İlk tür ikinci yerine geçmez. Bir fazın onay tablosundaki boş alan `BEKLİYOR` kalır; PM dahil onaylar önceden doldurulmaz. PM ret gerekçesi ve düzeltme adımı yazar; bağımlı faza geçiş durur.

## 3. Teknik çalışma sözleşmesi

**Onaylanmış uygulama yığını (ADR-001):** kurumsal web/B2C için Next.js + React + TypeScript; yönetim paneli için React + Vite + TypeScript; ortak UI tokenları; API ve arka plan işleri için ASP.NET Core/C#; veri için SQL Server + EF Core migrations; iOS/Android için Flutter + Dart; dosya/baskı varlıkları için erişim kontrollü nesne depolama; modüler monolit + ayrı worker ve SQL outbox/inbox. Docker ve Kubernetes kullanılmaz. Sürümler resmi uyumluluk tablolarına göre sabitlenir ve lockfile'a işlenir. Mobil editör, ödeme ve push uyumu D09'da gerçek cihazla doğrulanır.

`Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md` içindeki Node.js, PostgreSQL, React Native ve konteyner seçenekleri belgenin de belirttiği gibi öneri/adaydır; proje sahibinin daha önce verdiği ADR-001 kararını değiştirmez. Teknoloji omurgası ancak ayrı değişiklik önerisi, etki/geri dönüş analizi ve proje sahibinin açık onayıyla değişebilir.

**Önerilen repo sözlüğü:** `apps/web`, `apps/admin`, `apps/mobile`, `services/api`, `services/worker`, `packages/contracts`, `packages/ui`, `infra/db/migrations`, `design` (Faz02 kaynak ve handoff), `docs/decisions`, `tests`. C# paketleri TS paketlerine kaynak olarak otomatik kopyalanmaz; OpenAPI'den tipli istemci üretilir ve CI'da sürüm farkı denetlenir. Repo varsa yerleşimi bozma: mevcut gerçek yolları Faz00'da düzelt, bu haritayı yalnız örnek kabul et.

**Ortak API/veri ilkeleri:** Açıkça `/api/v1` sürümü, `requestId`, UTC zaman, tutar için para birimiyle decimal, müşteri ve panel nesne yetkisi, hatalarda kod/mesaj/alan, sayfalama; `variantId` ürün ekranından editör, sepet ve siparişe aynı kalır. Sunucu fiyat/vergi/indirim/kişiselleştirme/stok otoritesidir; `(channel, externalOrderId)`, ödeme sağlayıcı işlem ID ve checkout idempotency benzersiz; `OrderLine` anlık görüntüsü ve `DesignVersion` değişmez; outbox aynı yerel transaction'da. D02 veri sahipliği ve D03 ödeme/rezervasyon kapanmadan ilgili şema ve davranış kesinlenmez. Gereken tüm dış sistemlerde `IProviderAdapter` benzeri arayüz, mock/sandbox ve gerçek adaptör ayrılır. **Mock testi gerçek entegrasyon kabulü değildir.**

**Yerel çalışma varsayımı:** Mac üzerinde SQL Server'a bağlantı yöntemi (erişilebilir geliştirme SQL Server örneği/container/uzak test sunucusu), .NET ve JS araçları Faz01'de doğrulanır; DBeaver yalnız SQL istemcisidir, sunucu değildir. Hiçbir ücretli bulut kaynağı gerçek hesap/limit kontrolü yapılmadan zorunlu sayılmaz. `.env.example` yalnız anahtar isimleri içerir. Komutların gerçek hali repo kurulduktan sonra aşağıya yazılır.

### 3.1 Faz00'da sabitlenmesi gereken teknik kararlar

Faz03–06 belgeleri aşağıdaki kararları "Faz00'da sabitlenir" diye buraya bırakır. Karar verilene kadar ilgili kod geçici kabul edilir; karar ADR ile kapanır ve satır güncellenir.

| ID | Karar | Bağlı faz | Sahip | Durum |
|---|---|---|---|---|
| T-01 | API sürüm öneki ve son yol düzeni (`/api/v1`) | 03–10 | BE + Full Stack | Kısmi · `/api/v1/health`, `/api/v1/catalog/*`, `/api/v1/content/*`, `/api/v1/xinobi-u/*` sözleşmede (TST-093/094); geliştirme uçları `/api/v1/local-commerce`, `/api/v1/design-studio` sözleşme dışı |
| T-02 | Para formatı: minör birim tam sayı mı, `decimal(19,4)` + ISO para birimi mi | 04,05,07,08,09 | BE + DBA | **API önerisi uygulandı (07.10.2026):** `{amountMinor: long, currency: "TRY"}`; veritabanı sütun biçimi Faz04 migration'ında DBA kararıyla kesinleşecek |
| T-03 | Web/mobil oturum taşıma (HttpOnly cookie + CSRF / bearer + refresh) | 03,05,11 | BE + FE + CTO | **Karar · 07.10.2026** · karma: web/panel cookie+CSRF, Flutter access+rotating refresh (ADR-004) |
| T-04 | Editör tuval birimi (mm / normalize) ve geometri test vektörü konumu | 06,10,11 | FE + BE + Creative | Açık |
| T-05 | Barındırma: Windows Server/IIS mi, başka hedef mi; dev/test/prod ayrımı | 03,11 | CTO + Full Stack + proje sahibi | **Karar · 07.10.2026** · mevcut Windows Server + IIS (ADR-004); SQL portu erişim yöntemi açık |
| T-06 | Nesne depolama sağlayıcısı (Docker'sız), CDN ve medya türev üretimi | 03,04,06,10 | CTO + DBA | **Karar · 07.10.2026** · sunucu diski, web kökü dışında, `IFileStorage` arayüzü arkasında (ADR-004); CDN/türev açık |
| T-07 | Yüklenen dosya için zararlı içerik tarama aracı | 03,06,07 | BE + CTO | Açık |
| T-08 | Gözlemlenebilirlik: log, metrik, iz, alarm kanalı ve saklama | 03,08,09,11 | Full Stack + CTO | Açık |
| T-09 | Özellik bayrağı mekanizması (XINOBI U, Nobi, sağlayıcı adaptörleri) | 03,10,11 | BE + Full Stack | Açık |
| T-10 | CI güvenlik taraması: SAST, bağımlılık ve sır taraması aracı | 03,11 | Full Stack + CTO | Açık |
| T-11 | Performans ve yük testi aracı, ölçülecek başlangıç hedefleri (Analiz2 §20.1) | 03,11 | Full Stack + PM | Açık |
| T-12 | Önerilen ama repoda olmayan yollar: `infra/db/migrations`, `infra/dev`, `packages/ui`, `docs/runbooks`; gerçek karşılıklar | 03–11 | Full Stack | **Kısmi** · EF migration'ları `services/shared/Xinobi.Persistence/Migrations`, gözden geçirilmiş SQL `infra/db/migrations`, runbook'lar `docs/runbooks` (07.10.2026); `infra/dev`, `packages/ui` açık |

## 4. Müşteri kararları ve blokaj kaydı

Analizdeki D01–D10 hiçbirine bu plan **müşteri kararı verilmiş** demez. Her satır gerçek sahibi, tarih, kanıt URL/dosya, tercih, alternatif, etkilediği faz ve PM kaydı ile doldurulur. Bu tablo ilk andaki blokaj haritasıdır.

| ID | Karar | Bağlı işler | Durum / kanıt |
|---|---|---|---|
| D01 | Mevcut kod/veri ve yeniden kullanım | Faz01–03 | Kısmi karar · mevcut uygulama kodu yok, sıfırdan yeni geliştirme; private monorepo ve araç zinciri doğrulandı. Mevcut operasyon/veri örneği ve barındırma envanteri bekliyor |
| D02 | Ürün-varyant-fiyat-stok ana kaynak ve Mikro yazma yönü | Faz04,08,09 | Açık / operasyon + Mikro sahibi |
| D03 | Sipariş/ödeme, havale, stok rezervasyon, iptal-iade/kargo | Faz05,08,09,11 | Açık / satış-operasyon |
| D04 | Sipariş yerleşimi ve üç görsel teslimi; fiziksel üretim hazırlığı yok | Faz06,05,02,03,11 | 03.11.2026 kullanıcı kapsam kararı kaydedildi; SIP-TAS-01 (TST-207), SIP-TAS-02 (TST-211, SQL kabulü açık) SIP-TAS-03 (TST-215), SIP-TAS-04 (TST-219), SIP-TAS-05 (TST-223), SIP-TAS-06 (TST-227), SIP-TAS-07 (TST-231), SIP-TAS-08 (TST-235) uygulandı, SIP-TAS-09 teknik kabul (TST-239); gerçek kabul açık |
| D05 | Ödeme/kargo/SMS/e-posta/AI ve destek erişimleri | Faz05,10,11 | Açık / sağlayıcı hesapları |
| D06 | Mikro sürüm/API ve üç pazaryeri mağaza/sandbox | Faz08,09 | Açık / entegrasyon sahipleri |
| D07 | Tekliften toplu siparişe onay ve fiyatlama | Faz07 | Açık / kurumsal satış |
| D08 | AI alternatif/limit/politika/maliyet | Faz10 | Açık / ürün sahibi |
| D09 | Mobil editör tekniği, push, mağaza hesapları | Faz11 | Açık / ürün + mobil |
| D10 | Hukuki sayfalar, rıza, saklama | Faz04,05,10,11 | Açık / hukuk-operasyon |
| D11 | Türkiye e-ticaret yükümlülükleri: mesafeli satış/ön bilgilendirme onayının sipariş kaydı, ETBİS, İYS ticari ileti izni, e-Fatura/e-Arşiv'i hangi sistemin keseceği | Faz05,07,08,11 | Açık / hukuk + muhasebe + Mikro sahibi |
| D12 | K-13 "Market hesabı" ifadesinin anlamı (Analiz2'de "anlamı netleşmeli") | Faz01,05,11 | Açık / ürün sahibi |
| D13 | "Desenler" menüsü: içerik modeli, lisans, seçme ve satın alma davranışı | Faz02,04,06 | Açık / ürün sahibi + Creative |
| D14 | Proje sonrası bakım/garanti, hata düzeltme süresi (SLA) ve aylık sağlayıcı/altyapı maliyet tavanı | Faz01,11 | Açık / proje sahibi + PM |

**Karar son tarihi kuralı:** Her açık D kararına PM bir sahip ve hedef tarih yazar. Tarih geçerse PM iş sahibine bir kez hatırlatır, ikinci kez kaçırılırsa proje sahibine taşır ve kayda `Gecikti` yazar. Bu süre boyunca yalnız bağımsız iş ve mock ilerler. Geliştirici tahmini hiçbir koşulda karar yerine geçmez; ancak proje sahibi yazılı olarak "varsayımla devam" derse varsayım, geri dönüş maliyetiyle birlikte ADR'ye yazılır.

**AI-P01 sağlayıcı kararı — ONAYLANDI, 01.10.2026:** Proje sahibi AI görsel sağlayıcısı olarak **Cloudflare Workers AI** seçimini açıkça onayladı. Uygulama sağlayıcıdan bağımsız `IImageGenerationProvider` / `IImageEditingProvider` adaptör sınırını korur; model, fiyat/kota, veri işleme, ticari lisans ve bölge Faz10 başlangıcında resmi dokümanla yeniden doğrulanır. API hesabı, secret, SDK/REST adaptörü ve ücretli çağrı Faz10 sırası gelmeden eklenmez; bu karar erken entegrasyon yetkisi değildir. Ayrıntı: `docs/decisions/ADR-002-cloudflare-workers-ai.md`.

Blokaj nedeniyle bağımsız iş ve mock yapılabilir; ilgili faz **gerçek entegrasyon/iş kabulü** alınmaz. Bu kararlar Xinobi iş sahibine aittir; geliştirici tahminini `varsayım` yazabilir, gerçek onay diye işaretleyemez.

**27.10 prompt v3 ek kaydı:** AI desen üretimine olumlu motif tarifi, ana/yardımcı motif hiyerarşisi, zemin/ana/destek/vurgu renk rolleri ve kısa yazısızlık kuralları eklendi (`xinobi-art-direction-3`). Model ve dört adım korunur. Yeni ücretli üretim/estetik kabul veya canlı deploy yapılmadı; görsel sonuçlar kullanıcıyla iteratif değerlendirilecek. [Kurallar](../docs/xinobi-u-art-direction.md), [test kaydı](../test/2026-10-27/TST-art-direction-v3.md).

## 5. Anlık durum — her oturum başında güncelle

| Alan | Şu anki kayıt |
|---|---|
| Son güncelleme ve sorumlu | 30.10.2026 / Codex; kaynak main / de99958. [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md); Faz00-11 güncellendi. |
| Aktif görev | Şimdiye kadarki tüm eksik/karar/kabul işlerini fazlara işleme; teknik kapanış ile müşteri/üretim/UAT girdilerini ayırma. |
| Repo/branch/HEAD | Desktop/Xinobi / main / de99958 denetlenen uygulama kaynağı. Bu güncelleme dokümantasyondur. |
| Ortam / migration | Önceki SQL 0001-0005 uygulama kanıtı korunur; sonraki migration hedefleri bu oturumda doğrulanmadı. KIS-01 mevcut FeatureDocuments/PersonalizationJson kullanır; yeni SQL migration yok. |
| Yerel başlatma | pnpm dev:local:background; API 5003, web 3000, admin 5173. Bu dokümantasyon oturumunda servis değiştirilmedi. |
| Gerçek IIS durumu | Canlı /admin/ giriş formu/anonim 401 30.10 kontrolünde doğrulandı; deployment.json 404 nedeniyle canlı kaynak sürümü bu kontrolden bilinmiyor. Önceki kullanıcı kurulum bildirimleri tarihsel. |
| Son kayıtlı release | DEPLOY-016 / xinobi-799e1af GitHub yayını; güncel de99958 için paket/IIS/telefon kurulumu yapılmadı. Yayın, kurulum ve UAT ayrı. |
| Son test kanıtları | 42bee88: API 496 PASS/29 SKIP, Dart 9, contracts/lint/build. de99958: Flutter analiz ve 79/79. WEB-01/02/07 testleri ayrı kaynak/ortam kayıtları. Bu oturumda uygulama regresyonu koşulmadı. |
| Tamamlanan teknik alt işler | WEB-01 yerel teknik kabul; WEB-02 ve WEB-07 teknik düzeltmeleri; KIS-01 profil altyapısı; Flutter ana sayfa yerleşimi. Gerçek admin giriş sistemi var, e-posta teslimi ayrı açık. |
| Müşteri/veri bekleyenler | 23 ürün açıklama/özellik dosyası ve SKU 117 fiyatı; üretim ölçü/şablon/şartname ve numune sahibi; KAR-01-08 karar/erişim/hukuk/mağaza/işletim girdileri. |
| Teknik ekipte kalanlar | Gerçek ödeme/sepet/rezervasyon/kargo, üretim onayı/render/indirme, editör, panel/rol/ayar, CMS/kupon/depo/medya, AI SQL/kota/denetim, B2B, Mikro/kanallar; SQL/cihaz/posta/restore/güvenlik/yük/CI/UAT/mağaza/devir. Ayrıntı ana listede. |
| Sonraki güvenli adımlar | UAT-01 kişi/takvim; izinli gerçek yönetici posta testi ADM-MAIL-01; izole SQL ve gerçek cihaz kabulü. İçerik/üretim bilgisi gelmeden veri veya fiziksel onay uydurulmaz. APK/deploy ayrıca yetkili kapsamla. |
| Güvenli geri dönüş | Mevcut birleşik deploy/rollback ve dış veri/ayar koruma yolu değişmedi. Restore provası ve runtime yetki ayrımı açık. |

### 5.0 Güncel faz özeti - 30.10.2026

| Faz | Güncel durum | Ana task sayısı / ayrıntı |
|---|---|---|
| 00 | Devam; 120 task fazlarda, takvim/atamalar ve nihai kabuller açık | [Ana liste](../docs/tasks/project-closure-2026-10-30.md) |
| 01 | Bloke - iş kararları ve müşteri girdileri açık | 8 / [Faz01](./Faz01_Kesif_ve_Kararlar.md) |
| 02 | Devam - web ve Flutter düzeltildi; manuel erişilebilirlik/handoff kabulü açık | 3 / [Faz02](./Faz02_Tasarim_ve_UIUX.md) |
| 03 | Devam - temel regresyon kayıtlı; SQL/güvenlik/posta/işletim kabulü açık | 21 / [Faz03](./Faz03_Teknik_Altyapi_Kimlik_Veritabani.md) |
| 04 | Devam - katalog teknik kabulü var; veri ve ticari altyapı eksikleri açık | 14 / [Faz04](./Faz04_Katalog_Stok_Fiyat_Icerik_SEO.md) |
| 05 | Bloke - gerçek ödeme, rezervasyon, kargo ve ticari kabul açık | 13 / [Faz05](./Faz05_ETicaret_Odeme_Siparis.md) |
| 06 | Devam - KIS-01 teknik profil hazır; fiziksel ve üretim dosyası kabulü açık | 8 / [Faz06](./Faz06_Kisisellestirme_Editor_Baski.md) |
| 07 | Bloke - D07 ve firma/teklif-sipariş teslimleri açık | 8 / [Faz07](./Faz07_Kurumsal_Teklif_Toplu_Siparis.md) |
| 08 | Bloke - Mikro erişim/alan sözleşmesi ve gerçek adaptörler açık | 8 / [Faz08](./Faz08_Mikro_Muhasebe_Entegrasyonu.md) |
| 09 | Bloke - üç kanalın erişimi, adaptörleri ve mutabakatı açık | 8 / [Faz09](./Faz09_Pazaryerleri_Merkezi_Siparis.md) |
| 10 | Devam - üretim mevcut; SQL/kota/moderasyon/kalite kabulü açık | 8 / [Faz10](./Faz10_AI_Tasarim_Satis_Asistani.md) |
| 11 | Devam - Flutter eşliği düzeltildi; kurulum, cihaz, push, mağaza ve final UAT açık | 21 / [Faz11](./Faz11_Mobil_UAT_Canliya_Gecis.md) |

**Sayım:** 120 ana task, her biri tek ana faz; ortak bağımlılıklar ayrıca bağlıdır. Alt işler task sayısını artırmaz. Hiçbir faza yeni rol/PM onayı verilmedi; eski yüzdeler güncel oran değildir. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

### 5.0B Tarihsel faz özeti — 27.10.2026

| Faz | Güncel durum | Ayrıntı |
|---|---|---|
| 00 | Devam; kayıtlar güncellendi, takvim ve onaylar açık | Bu kayıt ve commit envanteri |
| 01 | Bloke — müşteri kararları | [Faz01_Kesif_ve_Kararlar](./Faz01_Kesif_ve_Kararlar.md) güncel uygulama bölümü |
| 02 | Devam — tasarım ve erişilebilirlik kabulü açık | [Faz02_Tasarim_ve_UIUX](./Faz02_Tasarim_ve_UIUX.md) güncel uygulama bölümü |
| 03 | Devam — güvenlik ve işletim doğrulamaları kısmi | [Faz03_Teknik_Altyapi_Kimlik_Veritabani](./Faz03_Teknik_Altyapi_Kimlik_Veritabani.md) güncel uygulama bölümü |
| 04 | Devam — katalog iyileştirildi, ticari altyapı eksikleri açık | [Faz04_Katalog_Stok_Fiyat_Icerik_SEO](./Faz04_Katalog_Stok_Fiyat_Icerik_SEO.md) güncel uygulama bölümü |
| 05 | Bloke — gerçek ödeme ve ticari kabul açık | [Faz05_ETicaret_Odeme_Siparis](./Faz05_ETicaret_Odeme_Siparis.md) güncel uygulama bölümü |
| 06 | Devam; üretim baskısı D04/T-04 ile bloke | [Faz06_Kisisellestirme_Editor_Baski](./Faz06_Kisisellestirme_Editor_Baski.md) güncel uygulama bölümü |
| 07 | Bloke — D07; panel akışı iyileştirildi | [Faz07_Kurumsal_Teklif_Toplu_Siparis](./Faz07_Kurumsal_Teklif_Toplu_Siparis.md) güncel uygulama bölümü |
| 08 | Bloke — D02/D06/D11 | [Faz08_Mikro_Muhasebe_Entegrasyonu](./Faz08_Mikro_Muhasebe_Entegrasyonu.md) güncel uygulama bölümü |
| 09 | Bloke — D02/D03/D06 | [Faz09_Pazaryerleri_Merkezi_Siparis](./Faz09_Pazaryerleri_Merkezi_Siparis.md) güncel uygulama bölümü |
| 10 | Devam — AI üretim ve UI iyileşti; kalite kabulü açık | [Faz10_AI_Tasarim_Satis_Asistani](./Faz10_AI_Tasarim_Satis_Asistani.md) güncel uygulama bölümü |
| 11 | Devam — birleşik yayın var; UAT/mağaza kabulü açık | [Faz11_Mobil_UAT_Canliya_Gecis](./Faz11_Mobil_UAT_Canliya_Gecis.md) güncel uygulama bölümü |

**Kabul ve ölçüm:** Hiçbir faza yeni rol/PM onayı verilmedi. Aşağıdaki 20.10 yüzdeleri tarihsel tahmindir; bu denetimde yeni yüzde veya ağırlıksız genel tamamlanma oranı üretilmedi. 27.10 tablosu tarihsel kesittir; güncel kapsam her fazın 30.10 bölümü ve 120 task ana listesindedir.

### 5.1 Tarihsel faz ilerleme ve eksik özeti — 20.10.2026

**Ölçüm kuralı:** "Geliştirme %" her faz dosyasındaki görev listesinin kod/belge/test kanıtına göre tahminidir (tamam = 1, kısmi = 0,5 civarı, yok/bloke = 0). "Kabul" §7’deki rol + PM kapısıdır. **Hiçbir faz kabul edilmedi; bu nedenle resmi olarak tamamen biten faz yoktur.** Ayrıntılı görev tabloları ilgili faz dosyasının "Uygulama durumu — 16.10.2026" bölümünde ve altındaki 20.10 güncellemelerindedir.

| Faz | Geliştirme % | Kalan % | Statü | Başlıca eksikler |
|---|---|---|---|---|
| 00 | 85 | 15 | Devam | Takvim/sprint tablosu boş; D kararlarına sahip ve hedef tarih yazılmadı; §7 rol/PM kayıtları boş |
| 01 | 45 | 55 | Bloke (müşteri kararları) | D02–D14 açık (D01 kısmi); gerçek as-is görüşme kanıtı, takvim (01.15), veri/geçiş envanteri (01.17), kalite/maliyet hedefleri (01.18) yok |
| 02 | 60 | 40 | Devam | `design/a11y-audit.md` yok (F02-A07); gerçek cihaz ve ekran okuyucu QA (A01/A02/A16); WEB-001 dışındaki ekran kaynakları (A08); mobil referans ekranlar (A10); BRIEF/ORTAK/WEB TASARIM onayları kayıtsız, A17 ertelendi |
| 03 | 75 | 25 | Devam | 03.06 kritik modül audit kapsamı; güncel SQL uçtan uca doğrulaması ve gerçek oturum açmış panel kabulü; `OnlyListedAreasArePublic` başarısız (rendering-inputs public listesi); kalıcı ayar yazma sözleşmesi/şeması yok; inbox/dead-letter ve ayrı worker işlevsiz; zararlı dosya taraması (T-07); yedek doğrulama/restore provası; T-08/09/10/11; sepet hâlâ tarayıcıda |
| 04 | 52 | 48 | Devam | Kampanya/kupon, depo bazlı stok hareketi/rezervasyon (D02/D03), marka/doküman; CMS sayfa/blog/SSS/iletişim formu; ürün sitemap’i ve analitik; medya kütüphanesi; CSV içe aktarma; 301 haritası; ödeme/net ciro ve ziyaret/dönüşüm raporu (SQL sipariş/müşteri özeti 19.10 var); Desenler (D13) |
| 05 | 52 | 48 | Bloke (D03/D05/D11) | Ödeme (kart/3DS/havale), sunucu sepeti, stok rezervasyonu, kargo firma/ücret, yasal onay kaydı, İYS izni, iade ödemesi, push gönderimi (Firebase yok) |
| 06 | 47 | 53 | Bloke (D04/T-04) | maske üretimi panel dışında (WebP yükleme), piksel hizası garantisiz; fiziksel `PrintArea` (mm), değişmez `DesignVersion`, şablonlar, metin/katman, ön/arka yüz, geri/ileri, baskı çıktısı render işçisi, panelde çıktı indirme, fiyat farkı; eski Roboflow/Tea Maker kodu temizlenmedi |
| 07 | 45 | 55 | Bloke (D07) | Teklif → sipariş dönüşümü, firma/kurumsal başvuru, teklifsiz toplu sipariş, ek dosya, outbox e-posta şablonları, rapor |
| 08 | 5 | 95 | Bloke (D02/D06) | Yalnız panel prototip ekranı; `IMikroClient`, eşleme/senkron/mutabakat yok |
| 09 | 5 | 95 | Bloke (D06) | Yalnız panel prototip ekranı; Trendyol/Hepsiburada/N11 adaptörleri, merkezi sipariş yok |
| 10 | 50 | 50 | Devam | moderasyon, kota/maliyet ölçümü (D08), soru havuzu yönetimi (10.09A), resmi özellik bayrağı (10.09B/T-09), arka plan kaldırma/genişletme, WhatsApp devri, PoC/CTO kaydı |
| 11 | 22 | 78 | Devam (mobil) | iOS kanıtı, push, ödeme, UAT, güvenlik/yük testi, yedek-geri yükleme provası, mağaza yayını, eğitim, teknik doküman, cutover, D09/D14 |

**Ağırlıksız ortalama geliştirme:** ~45 % (20.10: 12 fazın eşit ağırlıklı ortalaması %45,3; Faz01–11: %41,6. 16.10: %44,9 / %41,3). **Kayıtsız adım denetimi (14.10):** `5da3dba..b1573d0` arası 31 commit Faz00’da ve `test/` altında kayıtsızdı → [tasks-2026-10-13-addendum](../docs/tasks/tasks-2026-10-13-addendum.md) ve TST-115 ile kapatıldı. DEPLOY-008/009/010 kayıtları mevcut fakat uzak uygulama/smoke sonucu yok. Faz04–11 dosyalarında daha önce hiç durum notu yoktu; bu denetimle eklendi.

**16.10 güncel kayıt:** [Commit → faz eşlemesi ve ölçüm gerekçesi](../docs/tasks/phase-audit-2026-10-16.md). Yönetici daveti/MFA, audit farkı, favori API’si ve yerleşim koruma işleri işlendi. Eski deploy/SQL satırları son doğrulanmış tarihsel kanıttır; DEPLOY-011 de yalnız hazırlanmış olarak kayıtlı. 0006–0009 dosyalarının varlığı hedef veritabanına uygulandıkları anlamına gelmez. Yeni uygulama testi veya resmi kabul verilmedi.

**16.10 ortak yüzey denemesi:** Faz06/10: kaba boyamadan iç noktalarla Roboflow aday üretimi; seçili aynı konumlu renklerde ortak maske onayı; web Development renderer bağlantısı. [TST-121](../test/2026-10-16/TST-121-guided-shared-mask.md): .NET 422/23 atlandı/0, izole admin tarayıcı akışı ve web adapter kontrolü başarılı. Gerçek Roboflow çağrısı ve canlı yayın yok; sonraki adım gerçek bir ürünle görsel kenar/hizalama denemesi. Faz oranları/kabul değişmedi.

**16.10 panel geri bildirimi:** Gri/pasif Roboflow düğmesi düzeltildi; ayrı fırça kaydı gerekmeden önce kaydet/sonra segment akışı, pasiflik nedeni ve hata sonrası tekrar güvenliği. [TST-122](../test/2026-10-16/TST-122-guided-mask-unsaved-brush.md); gerçek sağlayıcı çağrısı yapılmadı.

**16.10 yüzey API 401:** Yüzey ekranına paylaşılan personel cookie yenilemesi eklendi; 401 sonrası tek refresh/tekrar, tam oturum kaybında boyamayı koruyan giriş açıklaması. [TST-123](../test/2026-10-16/TST-123-surface-admin-session-refresh.md); gerçek inference yok.

**16.10 Roboflow genel maske hatası:** Geçerli boş sonuç ile bozuk maske/yanıt ayrıldı; kısa metin hedefi açıklaması eklendi. [TST-124](../test/2026-10-16/TST-124-roboflow-empty-result-diagnostics.md), 59/59. Gerçek geçmiş çağrı kök nedeni belirlenmedi; yeni kredili çağrı yapılmadı.

**16.10 boyama sınırı:** Elle gösterme çıktısı artık kılavuzla kesiştirilir; varsayılan tolerans 0, açık seçimle 0–16 kaynak pikseli. Örtüşmeyen sonuçta boyama korunur. [TST-125](../test/2026-10-16/TST-125-guided-mask-containment.md), 62/62 ve admin akışı başarılı. Önceki geniş AI taslakları değişmedi; gerçek kalite kabulü verilmedi.

**16.10 yerel eğri/PNG denemesi — PUSH YOK:** Kullanıcı yalnız yerel deneme ve “geri dön” talimatında başlangıca dönme istedi. Başlangıç `adac37a`, checkpoint `/private/tmp/xinobi-curve-trial-20261016-adac37a/manifest.json`. Eğri çizimi ve PNG importu eklendi; [kullanım/geri dönüş](../docs/runbooks/local-curve-png-trial.md), [TST-126](../test/2026-10-16/TST-126-local-curve-png-trial.md). Commit/push yapılmadı; faz oranı/kabul değişmedi.

**16.10 yerel PNG hizalama desteği — PUSH YOK:** Yüklemenin uzun kenarı 2000 px küçülttüğü doğrulandı. Aktif varyant fotoğrafını SHA kontrollü, resize/crop olmadan indirme düğmesi eklendi. [TST-127](../test/2026-10-16/TST-127-exact-mask-source-download.md); bildirilen gerçek maske kaymasının tek nedeni kesinleştirilmedi. Geri dönüş `adac37a` aynı.

**16.10 kaynak tabanlı maske promptu — PUSH YOK:** Seçili ürün/renk ve fotoğraf boyutu/SHA ile otomatik prompt; (0,0), ölçek1, RGBA alpha ve crop/trim kuralları, düzenlenebilir yüzey hedefi, kopyala ve pano reddinde seçim. [TST-128](../test/2026-10-16/TST-128-source-bound-mask-prompt.md), admin build/lint ve browser başarılı. Gerçek AI çağrısı yok; hizalama garantisi verilmedi. Geri dönüş `adac37a` korunuyor.

**20.10 faz denetimi:** `cd96d5c..42553c3` 30 commit fazlara eşlendi → [phase-audit-2026-10-20](../docs/tasks/phase-audit-2026-10-20.md). Faz04 %50→%52 (SQL özet raporu, müşteri dizini), Faz06 %45→%47 (resim yüklemeli ortak maske, önizleme yeniden tasarımı). 16.10’daki “PUSH YOK” yerel denemeleri (TST-126–131) kullanıcı talimatıyla `feature/surface-masking-preview-20261020` branch’ine alındı; eğri/fırça/Roboflow/hizalama TST-133 ile kaldırıldı. Yeni açıklar: 11 XINOBI önizleme e2e gerilemesi (TST-134 ile kök neden bulundu ve düzeltildi: CM121 yayın paketi orijinal boyutta yayımlanıyordu), `OnlyListedAreasArePublic`. Faz kabulü değişmedi.

### 27.10.2026 — kümülatif faz denetimi

20.10 denetim sınırı `42553c3` ile `5791181` arasındaki tüm merge olmayan commitler tek tek fazlara eşlendi; merge commitleri ayrıca raporlandı. Daha önce kaydedilmiş yan dal commitleri yeni teslim olarak iki kez sayılmadı. [Denetim raporu](../docs/tasks/phase-audit-2026-10-27.md), [doküman doğrulaması](../test/2026-10-27/TST-phase-audit.md). Uygulama kodu/ortamı, müşteri kararları ve onay imzaları değiştirilmedi.

### Oturum kaydı şablonu — yeni satır üste

| Tarih/saat TR | Faz/görev | Branch / commit öncesi-sonrası | Yapılan dosya ve işlem | Çalıştırılan komut/sonuç | Kanıt | Sonraki atomik adım | Kim |
|---|---|---|---|---|---|---|---|
| 2026-10-14 | Faz04 SEO temeli | `main` / `925842d` → bu commit | `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts`, sayfa canonical/Open Graph, ana sayfa sarmalayıcı + Organization JSON-LD, ürün detayı Product JSON-LD, runbook alan adı adımı | TST-120: seo.spec 2/2, tam web e2e 119/0/1; alan adı yokken indeks kapalı | `test/2026-10-14/TST-120-*` | Sonraki iş için onay | Claude Code |
| 2026-10-14 | Test bakımı: web e2e güncel akış | `main` / `2497bba` → bu commit | Playwright test API seed/asset adresi; `NEXT_PUBLIC_DEV_SURFACE_BRIDGE` (yalnız e2e); kaldırılan demo sayfalarına bağlı 9 test `/urunler/detay` ve `/xinobi-u/renk`’e taşındı; TST-118 sayım hatası düzeltildi | TST-119: **117 geçti / 0 başarısız / 1 atlandı** (önce 70/50/1); CM101 piksel referansı kullanıcı onayıyla 13.10 editör çıktısına güncellendi | `test/2026-10-14/TST-119-*` | Onaylı: Faz04 SEO | Claude Code |
| 2026-10-14 | Test bakımı: web e2e | `main` / `5168f0b` → bu commit | `fixtures.ts` + `serve-export.mjs` storefront ucu; `cm101-approval-preview.spec.ts` yerel veri yoksa atlanır; uygulama kodu değişmedi | TST-118: 70 geçti / 50 başarısız / 1 atlandı (önceki koşu paket yüklenemiyordu); kritik etkileşim hatalarının 6/9’u giderildi | `test/2026-10-14/TST-118-*` | Onay bekliyor: kalan 50 XINOBI U/yüzey e2e hatası | Claude Code |
| 2026-10-14 | Faz03 03.03 parola sıfırlama | `main` / `2a60693` → bu commit | `/auth/password-reset{,/confirm}`, `IAccountStore.ResetPassword` (dosya+SQL), amaçlı e-posta metni, OpenAPI/TS/Dart istemcileri, web `password-reset.tsx`, mobil `/hesap/parola-sifirla`; Dart eski test verisi düzeltildi. Onaylı temizlik: `paketler/` altındaki 11 eski/ayrı ZIP silindi (Git dışı) | TST-117: .NET 389/14/0, Dart 4/4, Flutter 56/56, hedefli e2e 4/4 | `test/2026-10-14/TST-117-*` | Onaylı: web e2e storefront mock ve cm101 spec onarımı | Claude Code |
| 2026-10-14 | Faz03 03.06 denetim kaydı | `main` / `880cff0` → bu commit | `Infrastructure/AuditTrail.cs` (depo + middleware), `GET /local-commerce/audit` (`audit.read`), `PanelAccess` audit kaynağı, panel `AuditLog.tsx`, `AuditTrailTests` + koşullu SQL testi | TST-116: 2/2, tam .NET 387/14 atlandı/0, admin tsc/lint/build temiz | `test/2026-10-14/TST-116-*` | 03.03 parola sıfırlama | Claude Code |
| 2026-10-14 | Faz00 kayıt açığı + faz denetimi | `main` / `b1573d0` → bu commit | 31 kayıtsız commit task kaydına alındı (`docs/tasks/tasks-2026-10-13-addendum.{md,csv}`); Faz00 §5, §5.1, §6, §7 ve Faz01–11 dosyalarına "Uygulama durumu — 14.10.2026" eklendi; kod değişmedi | TST-115: .NET 385/13 atlandı/0, Flutter analyze temiz + 55/55, lint + web/admin tsc temiz | `test/2026-10-14/TST-115-*` | DEPLOY-008–010’u RDP’de uygula ve canlı smoke yaz; 03.06 AuditLog | Claude Code |
| 2026-10-13 09:37–17:36 · *geri dolduruldu* | Faz06/10 XINOBI U, Faz05 sepet, Faz03 canlı SQL, dağıtım | `5da3dba` → `b1573d0` (27 commit + 4 branch commit’i, 3 merge) | Aslı Aydın’ın `feature/xinobi-u-unified-ai-qa` branch’i üç kez alındı (çoklu maske, aile maske aktarımı, kabul edilmiş yüzey fixture’ları, mobil dinamik önizleme, görsel yükleme); panelde production SQL katalog yönetimi (`81543aa`); API HTTPS site altında IIS ARR (`c88ea3e`); vitrin canlı SQL kataloğu (`d1639f6`); IIS SQL hesapları, medya ve WebDAV onarımı (`c59c423`, `c6c889c`); Nobi aynı köken API (`dfbc972`); onaylı yüzey yayını (`88d80e0`, `a7ff0e8`); demo ürünlerin kaldırılması (`2bb0b6d`); tasarım ekranlarından sepete ekleme ve sepette tasarım gösterimi (`49d3f35`, `265c48d`); sanat yönleri (`324d129`); mobil yayımlanmış yüzeyler (`b1573d0`) | Commit anında tarihli rapor yok; `74032cd` mesajında Flutter 54 test, analyze, web tsc+lint. Geriye dönük TST-115 başarılı | `docs/tasks/tasks-2026-10-13-addendum.md`, DEPLOY-008–010 | Uzak IIS uygulaması ve canlı smoke | Beyza Turgut, Aslı Aydın (Codex: DEPLOY kayıtları); kayıt: Claude Code |
| 2026-10-09 | Faz00 kayıt açığı | `main` / `84bf964` → bu commit | 07.10 17:37 – 08.10 17:12 arasındaki 52 commit (merge dahil ana hatta 45 + merge ile gelen 7 branch commit'i) aşağıda beş satırda geri dolduruldu; Anlık durum tablosu güncellendi; kod değişmedi | Belge değişikliği; test yok. Yerel stack (API 5003, web 3000, admin 5173) ve Pixel_8 emülatörü açıldı | Bu satır, commit mesajları, DEPLOY-005–007 | Varyant yüzey maskeleme ve hesap/sipariş demosu için tarihli test raporu; web e2e 19 hata | Claude Code |
| 2026-10-08 16:26–17:12 · *geri dolduruldu* | Faz06 ürün yüzeyleri / kişiselleştirme | `85d3752` → `84bf964` (merge + 4 commit) | `feature/product-personalization` main'e alındı (`4c5ccb7`; Aslı Aydın'ın 7 commit'i: panelde yüzey inceleme, kabul edilmiş yüzey önizlemesi, kendi görselini kullan ve önizlemede sürükleme). Merge düzeltmeleri: branch'in Development uçlarına `AllowAnonymous` (yalnız Development + loopback + bayrak), ana sayfa XINOBI U örneği statik fotoğrafa düşer. Varyant başına yüzey maskesi API'si: Roboflow SAM3 metin/nokta, fırça, onay/geri alma/eskime, günde en çok 50 çağrı, anahtar user-secrets'ta (`1cdd475`); panelde **Ürün yüzeyleri** ekranı (`cb3a303`); web (`ba166e1`) ve mobil (`84bf964`) XINOBI U tasarımı onaylı yüzeye kırpılır | Merge commit'i: .NET 281/281 (üç koşu), Flutter 45/45, analyze temiz; web/admin tsc, lint ve production build başarılı. Sonraki 4 commit için tarihli rapor yok; testlerde Roboflow sahte | TST-106 (branch entegrasyonu), `4c5ccb7` mesajı | Gerçek Roboflow ile bir varyantı maskeleyip onaylama ve web/mobil önizlemesini tarihli raporla doğrulama | Claude Code; branch: Aslı Aydın |
| 2026-10-08 14:16–16:13 · *geri dolduruldu* | Faz05 hesap ve demo sipariş / Faz02 Hakkımızda | `0689f9b` → `85d3752` (15 commit) | Xinobi dünyası: metin sayfası denendi, proje sahibi isteğiyle geri alındı (`8d59e96`, `9c8756e`); sonra `Hakkımızda.docx` metniyle sade sayfa ve ana sayfanın siyah footer'ı (`2621e34`, `2566f69`, `825b7bd`). Hesap: ad değiştirme ve parola değişikliği (`32cce9b`); mobil ve web hesap sayfaları gerçek ayarlarla yeniden kuruldu (`0518fa6`, `6862ef1`, `866c42b`). `/api/v1/me`: telefon, kodla e-posta değişikliği, hesap silme, en çok 10 adres, ödeme almayan sunucu fiyatlı demo sipariş ve idempotent istek kimliği (`1354a08`); mobil (`31139ef`) ve web (`f91479f`) bunlara bağlandı. Sipariş görseli istek başına çözümleniyor (`b450604`); katalog kartında `swatchHex` (`c87af64`); release mobilde yalnız test sunucusuna cleartext istisnası (`85d3752`, proje sahibi onaylı) | Commit anında tarihli rapor yok | Commit mesajları | D03 ödeme kararı; yasal metinler; hesap/sipariş akışı için e2e raporu | Claude Code |
| 2026-10-08 12:27–13:46 · *geri dolduruldu* | Faz04 ürün galerisi / Faz02 masaüstü yoğunluk | `649653e` → `0689f9b` (9 commit) | Ürün başına en çok 12 ek fotoğraf (`55bee0b`); web/mobil galeri ve panelde ek fotoğraf yükleme (`b74e4a2`); renk değişiminde galeri davranışı, Safari ve performans düzeltmeleri (`25efe52`, `5746887`, `37ce66f`, `3d26c5a`, `40d9e4f`); panel yüklemede fotoğrafları 2000/2560 px'e küçültür (`40d9e4f`); ürün detayı ve ana ekranlar 1245×623 görünümde kaydırmasız (`08c3223`, `0689f9b`) | Commit anında tarihli rapor yok; ölçümler commit mesajlarında (1280×720, 1440×790, 1920×960, 1245×623) | Commit mesajları | — | Claude Code |
| 2026-10-08 10:13–11:27 · *geri dolduruldu* | Dağıtım / test sunucusu / mobil tasarım | `0b02837` → `649653e` (11 commit) | Mobilde header logosu ana sayfaya döner, 44 px dokunma alanı, Inter başlık ve siyah düğmeler (`d23f42d`, `6b44c17`, `e57510d`); varsayılan birleşik web+admin paketi (`34dd3d9`, Codex); paketler `paketler/{web,mobil,apk}` altına (`22ad2cf`, `e1924dd`, yeni `tools/build-apk.mjs`); API, `Catalog:SnapshotPath` ile yayınlanan katalog anlık görüntüsünü Development dışında salt okunur sunar (`a91b0d1`); API IIS paketi temiz worktree'den alınır ve EF Core'suz paket reddedilir (`3378116`, `5f67b30`); test sunucusunda `XinobiU:Enabled` arkasında XINOBI U (ADR-002 Ek B; günde 30 üretim, köken listesi) ve paketlerin bağlanması (`6de24d7`, `649653e`) | DEPLOY-007: `XinobiYeni-deploy-0b02837.zip` hazırlandı; IIS'e aktarım ve canlı smoke kaydı yok | `deployments/DEPLOY-007-*`, ADR-002 Ek B | Test sunucusunda IIS smoke ve DEPLOY kaydı | Claude Code; `34dd3d9` Codex |
| 2026-10-07 17:24–17:56 · *geri dolduruldu* | Panel fiyat / DEPLOY-005–006 / mobil palet | `e66bd73` → `0b02837` (5 commit; aradaki `a216b1e`, `9b07d43`, `c440137` ayrıca kayıtlı) | Katalog düzenleyicide varyant satış fiyatı (`436829a`); DEPLOY-005 web paketi kaydı (`c5ffb26`); HTTPS IIS admin paketi ve personel oturum kapısı, üretim önkoşulları (`b6a41eb`, `68c838c`); mobil, web'in siyah-beyaz paletine ve ana sayfasına geçti; `design/tokens.json` web ile eşlendi, emekli XINOBI U raster banner alanı sözleşmeden çıktı (`0b02837`) | DEPLOY-006: admin tsc/lint ve tarayıcıda oturum kapısı başarılı; canlı HTTPS doğrulanmadı | `deployments/DEPLOY-005-*`, `DEPLOY-006-*` | — | Codex (`436829a`, `c5ffb26`, `b6a41eb`, `68c838c`); Claude Code (`0b02837`) |
| 2026-10-07 | Mobil header + duyurular | `main` / `9b07d43` → bu commit | DES-MOB-01 rev.1: header'da arama yerine Favorilerim ve Haber ve duyurular; `features/news/*`, `/duyurular`, okunmamış rozeti (cihazda) | TST-102: Flutter 34/34; emülatörde doğrulandı | `test/2026-10-07/TST-102-*` | Mobil: içerik sayfaları, Nobi veya deneme ödeme akışı | Claude Code |
| 2026-10-07 | Mobil favoriler | `main` / `a216b1e` → bu commit | `apps/mobile/lib/features/favorites/*` (web ile aynı `xinobi-demo-favorites` biçimi, cihazda), kart ve ürün sayfasında kalp, `/favoriler`, Hesap bağlantısı | TST-101: Flutter 30/30; emülatörde doğrulandı | `test/2026-10-07/TST-101-*` | Mobilde sıradaki: ödeme öncesi adımlar D03'e bağlı; panel girişi | Claude Code |
| 2026-10-07 | Faz03 03.04 rol/yetki | `main` / `e66bd73` → bu commit | `Identity/Permissions.cs` (17 kaynak, özel işlemler, `super_admin`, `RequirePermission`), varsayılan ret + açık herkese açık alan listesi, `/api/v1/admin/{session,permissions}`, `bootstrap-super-admin` konsol komutu ve runbook; istemciler yenilendi | TST-100: 82/82; analyze/tsc temiz | `test/2026-10-07/TST-100-*`, `docs/runbooks/super-admin-bootstrap.md` | Panel girişi ve panel uçlarının yetkiye geçmesi | Claude Code |
| 2026-10-07 | Mobil SMTP zaman aşımı + kaynak kopyaları | `main` / `84b5804` → `e66bd73` | Mobil istemci alma süresi 3 sn → 20 sn (Gmail SMTP ile kod gönderimi); Analiz2 ve panel belgesi `docs/sources/` altına SHA-256 ile | flutter 25/25 | `docs/sources/README.md` | 03.04 | Claude Code |
| 2026-10-07 | Web hesabı API'ye | `main` / `0eace5b` → bu commit | `/api/v1/auth/web/*` (HttpOnly cookie, CSRF başlığı), CORS credentials; web `demo-commerce.ts` API'ye bağlandı, siparişler hesap kimliğine bağlı demo; e2e testi sahte hesap sunucusuyla | TST-099: 78/78; gerçek tarayıcı + yalıtılmış API; mobil hesapla web girişi | `test/2026-10-07/TST-099-*` | dev:local yeniden başlatma | Claude Code |
| 2026-10-07 | Ortak hesap API + mobil hesap | `main` / `8aa43ca` → bu commit | `services/api/Identity/*` (kayıt/giriş/yenileme/çıkış/profil, geliştirme deposu, Production 503), mobil Hesap sekmesi ve güvenli jeton deposu | TST-098: 77/77, 25/25; emülatörde doğrulandı. 5 test e-postası olayı kaydedildi | `test/2026-10-07/TST-098-*` | Web hesabını API'ye geçir | Claude Code |
| 2026-10-07 | Mobil sepet | `main` / `53d8017` → bu commit | `VariantDetail.maxQuantity` sözleşmesi; mobil sepet (web biçimi, cihazda), Sepete ekle, rozetli Sepet sekmesi, sorunlu satırlar, ödeme yok | TST-097: 70/70, 20/20, 4/4; emülatörde kopya veriyle doğrulandı | `test/2026-10-07/TST-097-*` | dev:local yeniden başlatma; favoriler/hesap | Claude Code |
| 2026-10-07 | XINOBI U gerilemesi + uygulama ikonu | `main` / `0222194` → bu commit | Web ürün kartı yeniden yeni anket açar; mobilde biten tasarım üründen yeniden açılmaz; uygulama ikonu Xinobi logosu (`0222194`) | `test-xinobi-u` ve `test-xinobi-u-direct-questions` başarılı; Flutter 16/16. `test-shared-header` başka oturumun `20cc424` değişikliği nedeniyle başarısız (`/hesap/giris` header yok) | `test/2026-10-07/TST-096-*` ek | Mobil sepet | Claude Code |
| 2026-10-07 | Mobil XINOBI U + DES-XU-01 | `main` / `5ed9bd4` → bu commit | Mobil anket akışı (5 soru, özet, üretim, durum sorgusu, sonuç), cihazda devam; proje sahibi kararıyla renk adımı web+mobilden kaldırıldı, sunucu varsayılan rengi seçer; sözleşme `variantId` isteğe bağlı | TST-096: 66/66, 15/15, 4/4; gerçek Cloudflare 1 test + 2 proje sahibi denemesi | `test/2026-10-07/TST-096-*`, `design/decisions.md` DES-XU-01 | Dev API yeniden başlatılınca web XINOBI U e2e | Claude Code |
| 2026-10-07 | Mobil iskelet | `main` / `c070df3` → bu commit | `apps/mobile`: Riverpod + go_router, 3 sekme, ana sayfa/ürünler/detay/XINOBI U, `CatalogRepository`, tokenlardan tema (`tools/generate-mobile-tokens.mjs`, tokens v0.3.0), Jost/Inter fontları (OFL), platform ağ ayarları; DES-MOB-01 | TST-095: analyze temiz, 10/10, emülatörde gerçek veri; 3 taşma + 1 a11y hatası düzeltildi | `test/2026-10-07/TST-095-*`, `design/decisions.md` DES-MOB-01 | Mobil XINOBI U akışı | Claude Code |
| 2026-10-07 | 1. adım: XINOBI U sözleşmesi | `main` / `9c3a4ac` → bu commit | `services/api/XinobiU/*` (5 uç, mevcut depo, korumalar aynen, Production'da 503), OpenAPI + TS/Dart istemcileri, 4 .NET + 1 Dart testi | TST-094: 58/58, Dart 4/4, Flutter temiz, kayma 0 | `test/2026-10-07/TST-094-*` | Flutter iskeleti | Claude Code |
| 2026-10-07 | 1. adım: katalog API sözleşmesi | `main` / `7958924` → bu commit | `services/api/Catalog/*` (5 salt okunur uç, iş kuralları sunucuda, Production'da 503), katı JSON sayıları, OpenAPI + TS/Dart istemcileri, 16 .NET + 2 Dart testi | TST-093: 54/54, Dart 3/3, Flutter temiz, kayma 0, duman testi | `test/2026-10-07/TST-093-*` | XINOBI U oturum sözleşmesi; Flutter iskeleti | Claude Code |
| 2026-10-07 | Faz02 F02-A17 karar | `main` / `ad2f418` → bu commit | Proje sahibi WEB TASARIM ONAY'ı müşteriye bağlı tasarım değişiklikleri nedeniyle erteledi; 25 ekranlık inceleme sayfası hazır bekliyor; mobil için tasarım tokenları tek kaynaktan beslenecek | Belge değişikliği; test yok | `design/faz02-open-acceptance.md` F02-A17 | 1. adım: katalog API sözleşmesi | Claude Code |
| 2026-10-07 | Faz02 web / DES-HDR-01 rev.1 | `main` / `4b11891` → bu commit | Proje sahibi revizyonu: header tek 64 px şerit, logo en solda 44 px (mobil 40 px), Xinobi dünyası XINOBI U yanında, Kurumsal teklif/Destek header'dan çıktı | Lint/build başarılı; 10 header testi başarılı (`test-home-navigation-feedback` yeni yapıya göre güncellendi); kullanıcı verisi değişmedi | `design/decisions.md` DES-HDR-01 rev.1 | Web tasarım onay sayfasındaki kararları uygula | Claude Code |
| 2026-10-07 | Faz02 web / DES-HDR-01 | `main` / `6d52883` → bu commit | Proje sahibi talebiyle global header ölçüleri dyson.com.tr ile eşlendi (şeritler 53/64 px, 14/16 px ağırlık 300, 1270 px içerik, 245×34 arama, 24 px ikon, ≤1024 px tek şerit); font Jost; Faz02 Dyson kuralına header istisnası | TST-092: lint/build, 16 yerel araç başarılı; web e2e 29/48, başarısızlıklar değişiklik öncesiyle birebir aynı | `test/2026-10-07/TST-092-*`, `design/decisions.md` DES-HDR-01 | 4 kontrast hatası + 15 eski e2e testi; sonra Faz03 03.04 | Claude Code |
| 2026-10-07 | Faz03 03.05 + ADR-004 | `main` / `a05264c` → bu commit | Proje sahibi ADR-003 ve ADR-002 Ek A'yı onayladı; T-03/T-05/T-06 kararları ADR-004; `Xinobi.Persistence` projesi, 12 tablolu çekirdek şema, ilk migration, idempotent ve geri alma script'leri, runbook | TST-091: 38/38 test, Release temiz; XinobiYeniDB uygulaması BLOKE (TCP 64019 zaman aşımı) | `test/2026-10-07/TST-091-*`, `docs/decisions/ADR-004-*` | SQL erişimi açılınca migration uygula; 03.04 | Claude Code |
| 2026-10-07 | Test bakımı | `main` / `4abc8e5` → bu commit | `tools/test-{local-commerce,home-navigation-feedback,product-listing,home-category-products,xinobi-u,free-product-preview}.mjs` güncel davranışa uyarlandı; uygulama kodu değişmedi; oturumda oluşan 8 test görseli scratchpad'e taşındı | TST-090: 22/22 başarılı; `state.json` değişmedi; ücretli çağrı yok | `test/2026-10-07/TST-090-stale-test-updates.md` | ADR onayı; Faz03 03.12 | Claude Code |
| 2026-10-07 | Uçtan uca regresyon | `main` / `0ff8f38` → bu commit | Çalışan servislerde 22 test aracı; `state.json` yedeklenip sonra hash ile doğrulandı | TST-089: 16 başarılı / 6 başarısız; başarısızlıklar eski test (5) ve süresi dolmuş oturum (1); ücretli çağrı yok, veri değişmedi | `test/2026-10-07/TST-089-local-e2e-regression.md` | Beş testi güncelle, free-preview fixture'ını kalıcı yap | Claude Code |
| 2026-10-07 | Faz00 kayıt açığı | `main` / `a97650b` → bu commit | 37 commit aşağıya geri dolduruldu; ADR-003 yazıldı; ADR-002'ye Ek A eklendi; iki numarasız 06.10 raporu indekse alındı | TST-088: dotnet test 26/26, admin/web lint+build başarılı | `test/2026-10-07/TST-088-*`, `docs/decisions/ADR-003-*` | ADR onayı; uçtan uca yerel testler | Claude Code |
| 2026-10-07 10:11–11:13 · *geri dolduruldu* | Faz02 web / Faz05 demo | `8891586` → `0a18bba` (9 commit) | XINOBI U'da soru öncesi renk seçimi (`b344844`); sepet varyant saklama ve katalog uygunluk kontrolü (`b669eaa`); ortak mağaza navigasyonu (`a8859d7`); tarayıcı demo hesap, ödeme ve sipariş geçmişi (`e191174`); hesap alanı/etiket düzeltmeleri (`3b6ff8d`); kare kategori şeridi (`e0df447`); iki katlı siyah header ve 112 px sıkıştırma (`bd25ad6`, `fbbfe57`, `0a18bba`) | Commit anında rapor yok; geriye dönük TST-088 başarılı | README `test-studio-color-selection`, `test-cart`, `test-demo-commerce` araçları (çalıştırılmadı) | Uçtan uca araçları çalıştır | Codex (kayıt: Claude Code) |
| 2026-10-06 16:43–17:33 · *geri dolduruldu* | Faz02 web / Faz04 içerik | `a51a3b8` → `8891586` (5 commit) | XINOBI U raster bannerı etkileşimli bölümle değişti (`529c107`); Japon dalga deseni ve ürün görselleri (`7e96a8e`); koleksiyon/değer kartı referans eşleşmesi (`e5633a8`); kategori fotoğrafı yükleme ve eski XINOBI U sekmesinin kaldırılması (`92913f0`); titanyum banner yerine düzenlenebilir görsel bölüm (`8891586`) | Commit anında rapor yok; TST-088 başarılı | `tools/test-category-photo.mjs`, `test-production-homepage.mjs` (çalıştırılmadı) | — | Codex (kayıt: Claude Code) |
| 2026-10-06 15:10–15:40 · *geri dolduruldu* | Faz04 içerik / DEPLOY-004 | `7a5af3b` → `a51a3b8` (3 commit) | Header duyuru kutusu (`5271842`); güncel ticaret içeriği ve medyasıyla IIS önizleme paketi (`c323e13`) ve yayın adımları (`a51a3b8`) | DEPLOY-004: 27 statik rota, geçici HTTP sunucusunda smoke başarılı; IIS smoke yapılmadı | `deployments/DEPLOY-004-current-commerce-preview.md`, `XinobiYeni-web-c323e13.zip` | IIS'e aktar ve canlı smoke | Codex (kayıt: Claude Code) |
| 2026-10-06 11:47–14:42 · *geri dolduruldu* | Faz04 katalog/içerik | `fd1b07e` → `7a5af3b` (16 commit) | HEX renkler ve orijinal ürün görseli (`b23d5ae`, `c40e5e9`); admin kategorileri ve web filtreleri, kategori silme/ürün taşıma (`dd51b21`, `28873a2`); ana sayfa kategori görseli seçimi (`3bd1728`, `8b8550d`); header kategori bağlantıları (`a742fe1`); ürün detay HEX paleti (`46884c0`); kart/header birleştirme (`ca2191f`); titanyum banner (`cf0c3ef`); stüdyo görsel düzeltmeleri (`29d5071`, `05abd5f`); başlık ve arka plan stilleri (`e08bbe1`, `c40a00b`); admin'den dört öne çıkan ürün (`fe87326`); yalnız son beş stokta stok sayısı (`7a5af3b`) | Commit anında rapor yok; TST-088 başarılı | `tools/test-category-management.mjs`, `test-featured-products.mjs`, `test-product-detail-palette.mjs` (çalıştırılmadı) | — | Codex (kayıt: Claude Code) |
| 2026-10-06 11:31–11:37 · *geri dolduruldu* | Faz03 dışı demo / Faz10 erken | `acc0c99` → `fd1b07e` (4 commit) | Yerel dosya ticaret deposu ve Cloudflare tasarım işleri API'si (`3db452e`); admin ticaret yönetimi ve operasyon modülleri bağlantısı (`d82332b`); XINOBI U ve ücretsiz yüzey önizleme (`d7870f0`); handoff ve yerel entegrasyon belgeleri (`fd1b07e`) | `test/2026-10-06/TST-XINOBI-U-live.md` (iki gerçek Cloudflare üretimi, API 21 test) ve `TST-XINOBI-U-free-preview.md` başarılı | ADR-003, ADR-002 Ek A | ADR onayı | Codex (kayıt: Claude Code) |
| 2026-10-07 | Faz00–11 plan revizyonu | `main` / `0a18bba` → `a97650b` | Kapsam–faz eksiklikleri 12 faz dosyasına işlendi: ek roller, T-01–T-12, D11–D14, takvim, kayıt açığı, ADR-003/ADR-002 istisnası, mevzuat/ödeme/push/kargo, toplu sipariş, soru havuzu, cutover ve dokümantasyon | TST-087: diff temiz, işaretler tutarlı; kod/migration/deploy yok | `test/2026-10-07/TST-087-phase-gap-update.md` | 37 commitlik kayıt açığını geri doldur; ADR-003 ve ADR-002 istisnasını yaz | Claude Code |
| 2026-10-06 | ProductSurfaces Step 2 | `feature/product-personalization` / `acc0c99`; commit yok | SkiaSharp 4.153.1 infrastructure decoder, dev fixture source registration, gerçek RGBA mask/source validation ve 15 yeni test case | NuGet sandbox restore başarısız, izinli tekrar başarılı; test final 39/39, Release build 0 uyarı/0 hata, diff başarılı, OpenAPI aynı | TST-090–092; `docs/contracts/domain-contract-draft.md` Step 2 sınırları/istatistikler | Kullanıcı Step 2 incelemesi; Step 3 uygulama yok | Codex |
| 2026-10-06 | ProductSurfaces Step 1 / geriye dönük kanıt ve dokümantasyon uyumu | `feature/product-personalization` / `acc0c99`; yeni commit yok | Faz00 + domain sözleşme sınırları + test indeksi/üç tarihli rapor; uygulama/test kaynakları değişmedi | Önceki Step 1: final 24/24 test ve Release build 0 uyarı/0 hata; Debug kilit hatası/Release tekrarları TST-087'te korundu; OpenAPI hash aynı | `docs/contracts/domain-contract-draft.md`, TST-087–089 | Kullanıcı talimatıyla Step 2 kapsamını kesinleştir; uygulama başlatma | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-002 | `main` / `acc0c99`; çalışma ağacı | Rol matrisi, sürümlü ayar ve güvenli demo denetim kayıtları | TST-086 model/UI, build/lint ve panel regresyonu başarılı; ilk seçici testi timeout sonrası erişilebilir ad düzeltildi | `test/2026-10-03/TST-086-admin-settings.md` | F02-A10 mobil tasarım kapsamı; gerçek kimlik/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-012 | `main` / `acc0c99`; çalışma ağacı | Politika/istem sürümü, kullanım/hata, kaynak uygunluğu ve destek devri | TST-085 model/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-085-admin-ai.md` | ADM-002 rol/ayar/denetim; gerçek kimlik/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-010/011 | `main` / `acc0c99`; çalışma ağacı | Dört sağlayıcı eşleme/iş/hata/uzlaştırma izleme | TST-084 model/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-084-admin-integrations.md` | ADM-012 AI yönetimi; gerçek sağlayıcı/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-008 | `main` / `acc0c99`; çalışma ağacı | Tasarım/sürüm/kalite/yüz çıktısı ve demo inceleme notu | TST-083 build/lint, baskı testi ve panel regresyonu başarılı | `test/2026-10-03/TST-083-admin-print.md` | ADM-010/011 entegrasyon izleme; gerçek D06/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-007 | `main` / `acc0c99`; çalışma ağacı | Kurumsal talep listesi, sürüm geçmişi ve revizyon taslağı | TST-082 model/UI, build/lint ve panel regresyonu başarılı; TS import hatası düzeltildi | `test/2026-10-03/TST-082-admin-quotes.md` | ADM-008 baskı operasyonu; D04/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-004 | `main` / `acc0c99`; çalışma ağacı | Örnek varyant fiyatı, kampanya koşulları ve indirim önizlemesi | TST-081 hesaplama/UI, build/lint ve panel regresyonu başarılı | `test/2026-10-03/TST-081-admin-pricing.md` | ADM-007 teklif yönetimi; gerçek D07/API açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-005 | `main` / `acc0c99`; çalışma ağacı | Depo bakiyeleri, geçmiş, mutabakat ve sayım önizlemesi | TST-080 build/lint/stok; katalog/panel regresyonu başarılı | `test/2026-10-03/TST-080-admin-inventory.md` | ADM-004 fiyat/kampanya; gerçek API kapıları açık | Codex |
| 2026-10-03 | Faz02 F02-A09 / ADM-003 | `main` / `acc0c99`; çalışma ağacı | Katalog filtre/sayaç, yeni ürün, dört bölümlü düzenleme, SKU/stok ve taslak koruması | TST-079 build/lint/katalog ve TST-078 regresyon başarılı | `test/2026-10-03/TST-079-admin-catalog.md` | ADM-005 stok/depo; D02/D03 gerçek yazım açık | Codex |
| 2026-10-02 | Faz02 F02-A09 / ADM-001/006/009 | `main` / `acc0c99`; değişiklikler commit edilmedi | Siyah panel kabuğu, 13 kart, sipariş filtre/detay ve korunmuş içerik editörü | TST-078 build/lint ve dört genişlikte tarayıcı başarılı; iki etiket hatası düzeltildi | `test/2026-10-02/TST-078-admin-panel.md` | ADM-003 katalog/varyant prototipi; gerçek API kapıları açık | Codex |
| 2026-10-02 | Faz02 HND-02 | `main` / `acc0c99`; çalışma ağacı | Slider/mobil header hedefleri 44 px, beş yeni E2E | Lint/build, 48/48 E2E ve diff başarılı | `test/2026-10-02/TST-077-home-touch-targets.md` | HND-01 banner gerçek oranı; yayın kullanıcıda | Codex |
| 2026-10-02 | Faz02 F02-A06 | `main` / `acc0c99`; belgeler commit edilmedi | Handoff, 22 medya ölçü/hash envanteri ve API hedef alanları; HND-01–05 | TST-076 manifest ve mevcut üç sağlık ucu doğrulandı; diff başarılı | `design/handoff.md`, `design/assets/manifest.json`, `test/2026-10-02/TST-076-handoff.md` | HND-02 dokunma hedefleri; yayın kullanıcıda | Codex |
| 2026-10-02 | Faz02 F02-A05 / deploy hazırlığı | `main` / `acc0c99` → belgeler çalışma ağacında | Editör/AI spec, kabul listesi ve güncel anlık durum | TST-074 build/mobil/ZIP; TST-075 belge/diff başarılı | `design/editor-spec.md`, `design/ai-spec.md`, `test/2026-10-02/TST-074-*`, `TST-075-*` | F02-A06 handoff; RDP canlı doğrulama açık | Codex |
| 2026-10-01 | Faz02 v0.24.0 / WEB-001 interaction | `main` / `6956a99` | Mega menü/drawer, hero slider, product carousel ve Nobi paneli tasarım prototipine eklendi | TST-060: desktop/mobile interaction başarılı; 5 kırılım × 15/15 görsel, overflow=false | `design/screens/WEB-001/*`, `tools/test-web001-interactions.mjs`, `test/2026-10-01/TST-060-*` | Kullanıcı yerel inceleme/ortak tasarım onayı | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.23.1 / WEB-001 içerik yönetimi | `main` / `476255b` | Admin panelinden yönetilecek dört görsel/içerik alanı geçici `Temsili` açıklamayla ayrıştırıldı | TST-059: 5 kırılım × 14/14 görsel, overflow=false; app/deploy yok | `design/screens/WEB-001/*`, `test/2026-10-01/TST-059-*` | F02-A13/14 etkileşimli prototip/handoff | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.23.0 / F02-A12–A14 | `main` / `996a2a2` | WEB-001 ortak hi-fi HTML/CSS; Creative/Web QA revizyonları; beş responsive PNG | TST-058: 5 kırılım × 14/14 görsel, overflow=false, h1=1; app/deploy yok | `design/screens/WEB-001/*`, `tools/render-web001.mjs`, `test/2026-10-01/TST-058-*` | Kullanıcı ortak tasarım onayı | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Faz02 v0.22.0 / F02-A11–A12 | `main` / `b3c94ab` | Ortak brief/art direction, Analiz2 fark matrisi, içerik/medya rehberi ve WEB-001 responsive wireframe | TST-057: K-01–K-21 21/21 ve zorunlu tasarım işaretleri başarılı; app/deploy yok | `design/creative-brief.md`, `analysis2-gap-matrix.md`, `art-direction.md`, `content-hierarchy.md`, `photography-media-guide.md`, `screens/WEB-001-*` | Kullanıcı ortak tasarım onayı; sonra hi-fi WEB-001 | Codex + Creative Designer + Web Designer |
| 2026-10-01 | Tasarım/AI kararları / TST-056 | `main` / `43c05b3` | İki yön kaldırıldı; Creative + Web Designer tek ortak tasarıma bağlandı; Cloudflare Workers AI sağlayıcı olarak onaylandı | TST-056 karar/sınır işaretleri ve diff kontrolü başarılı; AI çağrısı/deploy yok | `ADR-002`, `Prompts/Faz00/01/02/10`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-056-*` | Ortak tasarım üretimi için başlangıç onayı al | Codex |
| 2026-10-02 | Mobil ana sayfa düzeltmesi / TST-073 | `main` / kaynak değişikliği | Çerez paneli kapatma/seçenek hizası ve XINOBI U mobil tam kadrajı düzeltildi | Lint, 23 rota export, 43/43 E2E ve 390/412 px Chrome testi başarılı | `apps/web/src/app/legal-consent.module.css`, `apps/web/src/app/page.module.css`, `test/2026-10-02/TST-073-*` | Kullanıcı isteyene kadar deploy alma; geliştirmeye devam et | Codex |
| 2026-10-02 | DEPLOY-003 hazırlık / TST-070–072 | `main` / `5445569` | Onaylı ana sayfa gerçek Next.js `/` rotasına aktarıldı; çerez düğmesi Nobi’den ayrıldı; 23 rotalık güncel `out` tam paketlendi | Lint, 23 rota export, 43/43 E2E, responsive/çakışma Chrome testi ve 233 girdili ZIP CRC/SHA-256 başarılı | `XinobiYeni-web-5445569.zip`, `deployments/DEPLOY-003-approved-homepage.md`, `test/2026-10-02/TST-070-*`, `TST-071-*`, `TST-072-*` | RDP’de yedekle/değiştir/canlı smoke | Codex |
| 2026-10-01 | Analiz2 plan farkı / TST-055 | `main` / `9f06673` | Creative/Web Designer sırası, Dyson sınırı, Analiz2 K-01–K-21, AI-P01 ve ADR-001 koruması fazlara eklendi | TST-055 belge işaretleri ve diff kontrolü başarılı; uygulama/deploy yok | `Prompts/Faz00/01/02/04/06/10/11`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-055-*` | Kullanıcıdan tasarım yönü ve AI PoC kapsamı onayı iste | Codex + Creative/Web Designer/CTO temsili incelemeleri |
| 2026-10-01 | Faz02 v0.21.0 / F02-A04 | `main` / `7613607` | Web, panel ve Flutter ekran zincirleri; hata, retry, kanal uzlaştırma ve karar bağımlılıkları | TST-054: ekran ID, D-kararı ve belge diff kontrolleri başarılı | `design/flows.md`, `test/2026-10-01/TST-054-*` | F02-A05 editör ve AI ayrıntılı spec | Codex |
| 2026-10-01 | Faz02 v0.20.9 / F02-A03 | `main` / `83ead98` | Web bileşen durum/semantik/klavye/veri sözleşmesi; token ve karar eşliği | TST-053: JSON ve 10 bölüm/zorunlu işaret kontrolü başarılı | `design/components.md`, `design/tokens.json`, `test/2026-10-01/TST-053-*` | F02-A04 `design/flows.md` | Codex |
| 2026-10-01 | Faz02 v0.20.8 / NAV-01 | `main` / `ed95092` | Ana/Xinobi/yasal bağlantı smoke; plan-kod karşılaştırmalı açık kabul listesi | TST-052: navigasyon 3/3; lint ve birleşik E2E 43/43 başarılı | `apps/web/tests/e2e/navigation.spec.ts`, `design/faz02-open-acceptance.md`, `test/2026-10-01/TST-052-*` | F02-A03 bileşen sözleşmesi | Codex |
| 2026-10-01 | Faz02 v0.20.7 / E2E-04 | `main` / `c062498` | Katalog, varyant, favori, ödeme ve basit kişiselleştirme için beş Playwright senaryosu | TST-051: ilk 15/18; final kritik 18/18, birleşik E2E 40/40 ve lint başarılı | `apps/web/tests/e2e/critical-interactions.spec.ts`, `test/2026-10-01/TST-051-*` | Navigasyon smoke ve Faz02 açık kabul listesi | Codex |
| 2026-10-01 | Faz02 v0.20.6 / A11Y-01 | `main` / `28245e3` | 20 rota axe, iki klavye odağı; kontrast/ad düzeltmeleri ve tek worker | TST-050: ilk 4/22; final a11y 22/22, birleşik E2E 35/35, lint/build 23 rota | `apps/web/tests/e2e/accessibility.spec.ts`, `test/2026-10-01/TST-050-*` | Kalan interaction ve 390 px gerçek cihaz QA | Codex |
| 2026-10-01 | Faz02 v0.20.5 / E2E-03 | `main` / `c0ebaa1` | Üyelik, sipariş, iade, teklif takibi ve editör için beş Playwright senaryosu | TST-049: ara 11/13 ve 12/13; final 13/13, lint ve 23 rota build başarılı | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-049-*` | Odak sırası ve a11y taraması | Codex |
| 2026-10-01 | Faz02 v0.20.4 / E2E-02 | `main` / `f466595` | Sepet, hesap, teklif, AI ve asistan için beş Playwright senaryosu | TST-048: ilk 7/8, seçici düzeltmesi sonrası final 8/8 | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-048-*` | Kalan interaction ve odak/a11y | Codex |
| 2026-10-01 | Faz02 v0.20.3 / E2E-01 | `main` / `8eb5d1c` | Playwright sistem Chrome altyapısı; consent, arama/limit/ESC ve ödeme klavye senaryoları | TST-047: final 3/3 ve build 23 rota başarılı | `apps/web/tests/e2e/*`, `test/2026-10-01/TST-047-*` | Kritik interaction kapsamını genişlet | Codex |
| 2026-10-01 | Faz02 QA-04 | `main` / `3a37380` | WEB-017–020 Chrome 500 px uzun sayfa görsel QA ve hero yükleme tekrar kontrolü | TST-046: dört rota başarılı; interaction/gerçek cihaz açık | `test/2026-10-01/TST-046-*` | Interaction/klavye altyapısı | Codex |
| 2026-10-01 | Faz02 v0.20.2 / QA-03 | `main` / `d083c4c` | WEB-007/011–016 görsel QA; dört üç-öğeli mobil header düzeltmesi ve tekrar render | TST-045: lint/export 23 rota ve Chrome doğrulama başarılı | `test/2026-10-01/TST-045-*` | WEB-017–020 tam sayfa QA | Codex |
| 2026-10-01 | Faz02 QA-02 | `main` / `066c02a` | WEB-003/005/006/008/009/010 altı rota Chrome 500 px render incelemesi | TST-044: ilk görünür alanlar geçti; interaction/gerçek cihaz açık | `test/2026-10-01/TST-044-*` | WEB-007/011–016 QA | Codex |
| 2026-09-30 | Faz02 v0.20.1 / QA-01 | `main` / `1f399f4` | WEB-001/002/004 ve global consent Chrome render; katalog/consent taşma koruması | TST-043: 1440/500 px geçti; lint/export 23 sayfa; 390 gerçek cihaz açık | `test/2026-09-30/TST-043-*` | WEB-003/005–010 QA | Codex |
| 2026-09-30 | DEPLOY-002 hazırlık | `main` / `14be3ea` | Güncel 23 rotalık `out` tam paketlendi; değişen dosya paketi tercih edilmedi | TST-042: 226 girdi, CRC/SHA-256 başarılı | `XinobiYeni-web-14be3ea.zip`, `deployments/DEPLOY-002-web-preview-update.md` | RDP'de yedekle/değiştir/smoke | Codex |
| 2026-09-30 | Faz02 v0.20.0 / WEB-020 | `main` / `406c892` | Taslak yasal merkez ve global, kayıtsız tercih paneli | TST-041: lint/static export 23 sayfa ve kritik sınır smoke başarılı | `apps/web/src/app/yasal/*`, `apps/web/src/app/legal-consent*`, `test/2026-09-30/TST-041-*` | Faz02 browser/responsive QA; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.19.1 / WEB-019 | `main` / `b768b20` | `/xinobi` üst ve alt menü puntoları ana sayfa navigasyonuyla eşitlendi | TST-040: lint/static export 22 sayfa başarılı | `apps/web/src/app/xinobi/xinobi.module.css`, `test/2026-09-30/TST-040-*` | WEB-020 yasal/çerez; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.19.0 / WEB-019 | `main` / `1f24404` | Kurumsal hikâye, tasarım ilkeleri, içerik önizleme ve ana sayfa bağlantıları | TST-039: lint/static export 22 sayfa başarılı; ağ-kısıtlı font denemesi kayıtlı | `apps/web/src/app/xinobi/*`, `test/2026-09-30/TST-039-*` | WEB-020 yasal/çerez; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.18.0 / WEB-018 | `main` / `a856fe6` | Demo konuşma, ürün/kurumsal yönlendirme ve kapalı destek devri | TST-038: lint/static export 21 sayfa ve yerel smoke başarılı | `apps/web/src/app/asistan/*`, `test/2026-09-30/TST-038-*` | WEB-019 kurumsal/içerik; deploy yok | Codex |
| 2026-09-30 | Faz02 v0.17.0 / WEB-017 | `main` / `1b6cfcd` | AI istem/tema/palet, deterministik demo alternatifler, hata ve kapalı aktarım | TST-037: ilk build yolu düzeltildi; lint/static export 20 sayfa başarılı | `apps/web/src/app/studio/ai/*`, `test/2026-09-30/TST-037-*` | DEPLOY-002 preview güncellemesi | Codex |
| 2026-09-30 | Faz02 v0.16.0 / WEB-016 | `main` / `ee1274f` | Teklif çizgisi, iki demo revizyon, not önizleme ve kapalı onay/sipariş eylemleri | TST-033: lint/build/19 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/kurumsal/teklif/takip/*`, `test/2026-09-30/TST-033-*` | WEB-017 AI tasarım | Codex |
| 2026-09-30 | Faz02 v0.15.0 / WEB-015 | `main` / `fcee548` | Firma/iletişim, ürün/adet, kişiselleştirme, termin ve demo teklif özeti | TST-032: lint/build/18 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/kurumsal/teklif/*`, `test/2026-09-30/TST-032-*` | WEB-016 teklif takibi | Codex |
| 2026-09-30 | Faz02 v0.14.0 / WEB-014 | `main` / `c258358` | İptal/iade türü, neden/açıklama, dosya bekleme ve demo özet | TST-031: lint/build/17 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/siparisler/iade/*`, `test/2026-09-30/TST-031-*` | WEB-015 kurumsal teklif | Codex |
| 2026-09-30 | Faz02 v0.13.0 / WEB-013 | `main` / `65e5dff` | Demo sipariş listesi/detayı, teslimat çizgisi ve kapalı kargo işlemleri | TST-030: lint/build/16 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/siparisler/*`, `test/2026-09-30/TST-030-*` | WEB-014 iptal/iade | Codex |
| 2026-09-30 | Faz02 v0.12.0 / WEB-012 | `main` / `9958c77` | Profil/adres sekmeleri, demo düzenleme ve D10 güvenlik sınırları | TST-029: lint/build/15 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/hesap/*`, `test/2026-09-30/TST-029-*` | WEB-013 sipariş/takip | Codex |
| 2026-09-30 | Faz02 v0.11.0 / WEB-011 | `main` / `dfec7f6` | Giriş/kayıt/parola yenileme, parola görünürlüğü ve güvenli işlem sınırı | TST-028: ilk lint düzeltildi; lint/build/14 statik sayfa başarılı | `apps/web/src/app/hesap/giris/*`, `test/2026-09-30/TST-028-*` | WEB-012 hesap/adres | Codex |
| 2026-09-30 | Faz02 v0.10.0 / WEB-010 | `main` / `728e719` | Bekleyen/başarısız/başarılı senaryo, işlem sınırı ve doğrulama sırası | TST-027: lint/build/13 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/odeme/sonuc/*`, `test/2026-09-30/TST-027-*` | WEB-011 üyelik/oturum | Codex |
| 2026-09-30 | Faz02 v0.9.0 / WEB-009 | `main` / `10f9ebd` | Teslimat formu, kart/havale yöntem görünümü ve güvenli kapalı ödeme alanı | TST-026: lint/build/12 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/odeme/*`, `test/2026-09-30/TST-026-*` | WEB-010 ödeme sonucu kabukları | Codex |
| 2026-09-30 | Faz02 v0.8.0 / WEB-008 | `main` / `2edab8c` | Demo sepet satırı, adet/çıkarma/boş durum ve güvenli sipariş özeti | TST-025: lint/build/11 statik sayfa ve route güvenlik smoke başarılı | `apps/web/src/app/sepet/*`, `test/2026-09-30/TST-025-*` | WEB-009 ödeme kabuğu | Codex |
| 2026-09-30 | Faz02 v0.7.0 / WEB-007 | `main` / `a64409d` | Katalog favori kontrolü, tarayıcı demo saklama ve favoriler boş/dolu ekranı | TST-024: ilk effect lint hatası düzeltildi; lint/build/10 statik sayfa başarılı | `apps/web/src/app/favoriler/*`, `test/2026-09-30/TST-024-*` | WEB-008 sepet kabuğu | Codex |
| 2026-09-30 | Faz02 v0.6.0 / WEB-003 | `main` / `039ee41` | Canlı arama, hızlı terim, boş durum, en fazla üç ürün ve responsive karşılaştırma tablosu | TST-023: ilk yol hatası düzeltildi; lint/build/9 statik sayfa ve route smoke başarılı | `apps/web/src/app/arama/*`, `test/2026-09-30/TST-023-*` | WEB-007 favoriler kabuğu | Codex |
| 2026-09-30 | Faz02 v0.5.0 / WEB-006 | `main` / `525d4fc` | Araç/tuval/katman editörü, ön/arka yüz, demo taslak, responsive düzen ve logo kaynak taşıması | TST-022: ilk lint düzeltildi; ikinci lint/build/8 statik sayfa ve route smoke başarılı | `apps/web/src/app/urunler/cay-makinesi-101/editor/*`, `design/logo/*`, `test/2026-09-30/TST-022-*` | WEB-006 kullanıcı görsel geri bildirimi | Codex |
| 2026-09-30 | Faz02 v0.4.0 / WEB-005 | `main` / `c25ce02` | Metin, stil ve renk seçimi; temsili ayrı önizleme; oturum içi demo taslak ve güvenli satın alma bekleme durumu | TST-021: lint/build/7 statik sayfa, route HTTP 200 ve kritik güvenlik metinleri başarılı | `apps/web/src/app/urunler/cay-makinesi-101/kisisellestir/*`, `test/2026-09-30/TST-021-*` | WEB-006 gelişmiş editör araç kabuğu | Codex |
| 2026-09-30 | Faz02 v0.3.0 / WEB-004 | `main` / `af74060` | Çay Makinesi 101 detay; dört renk seçimi, güvenli satın alma bekleme, özellik ve Studio placeholder | TST-020: lint/build/6 statik sayfa, route HTTP 200 ve dört varyant adı başarılı | `apps/web/src/app/urunler/cay-makinesi-101/*`, `test/2026-09-30/TST-020-*` | WEB-005 basit kişiselleştirme kabuğu | Codex |
| 2026-09-30 | Faz02 v0.2.0 / WEB-002 | `main` / `c3faa18` | 10 demo varyantlı katalog; arama, kategori, sıralama, sonuç/boş durum; ana CTA bağlantıları | TST-019: lint/build/5 statik sayfa ve `/urunler` HTTP 200; browser interaction QA açık | `apps/web/src/app/urunler/*`, `test/2026-09-30/TST-019-*` | WEB-004 ürün detay görsel kabuğu | Codex |
| 2026-09-30 | Faz02 v0.1.0 / WEB-001 | `main` / `57b6d93` | Logo/demo ürün envanteri, Inter tabanlı tokenlar, ekran envanteri ve responsive ana sayfa uygulandı | TST-018: lint/build/static render ve HTTP asset smoke başarılı; görsel browser QA bekliyor | `design/*`, `apps/web/src/app/*`, `test/2026-09-30/TST-018-*` | WEB-001 gerçek tarayıcı responsive görsel QA | Codex |
| 2026-09-30 | Faz01 SQL ortam envanteri | `main` / `efd08af` | SQL sürüm/edition, DB durum/collation, tablo/migration sayısı ve login yetkileri salt okunur sorgulandı | TST-017 başarılı; SQL 2022 Express, boş DB, db_owner doğrulandı | `tools/sql/read-only-environment-inventory.sql`, `test/2026-09-30/TST-017-*` | D02/D03/D07 iş sahibi girdilerini al | Codex |
| 2026-09-30 | Faz01 karar toplama | `main` / `2abb59e` | D01–D10 için sahip/tarih/kanıt formatlı tek karar formu hazırlandı; tam `nc` komutu tekrar kaydedildi | TST-015 bloke; TST-016 belge kontrolü başarılı | `docs/discovery/stakeholder-decision-intake.md`, `test/2026-09-30/TST-015-*`, `TST-016-*` | İş sahiplerinden öncelikle D02/D03/D07 girdilerini al | Codex |
| 2026-09-30 | Faz01 D02/D03/D07 hazırlığı | `main` / `8e872a7` | Alan bazlı veri sahipliği; sipariş/ödeme/stok/teklif öneri durumları; dış durum eşleme ve karar listesi hazırlandı | Belge yapısı, açık karar işaretleri ve diff kontrolü TST-014 ile doğrulandı | `docs/discovery/data-ownership-and-state-transitions.md`, `test/2026-09-30/TST-014-phase01-data-state-document.md` | Gerçek iş sahiplerinden D02/D03/D07 yanıtlarını al | Codex |
| 2026-09-30 09:26 | Faz01 SQL ortam envanteri | `main` / `8e872a7` | TST-012 başarısı sonrası sürüm/şema/yetki metadata sorgusu ve ham TCP süreklilik kontrolü yapıldı | TST-013: iki kontrol de login öncesi timeout; DB yazımı/migration yok | `test/2026-09-30/TST-013-sql-availability-recheck.md` | Sunucu erişilebilirken aynı salt okunur envanteri tekrarla | Codex |
| 2026-09-29 23:37 | Faz01 SQL login | `main` / `8e872a7` | Uygulamaya özel `xinobiyeni_app` ile uzak DB, login ve instance salt okunur sorguyla doğrulandı | TST-012: başarılı, çıkış kodu 0 | `test/2026-09-29/TST-012-sql-login-xinobiyeni-app.md` | SQL sürüm/şema/yetki envanteri | Codex |
| 2026-09-29 | Faz01 SQL login | `main` / `a3f37f3` | 64019 üzerinden XinobiYeniDB/master ve iki kullanıcı adı biçimiyle salt okunur SQL oturumu denendi | TST-011: ağ başarılı; üç giriş de `Login failed for user` | `test/.../TST-011-sql-login-on-64019.md` | Mixed Mode + ayrı SQL Login + Keychain güncellemesi | Codex |
| 2026-09-29 | Faz01 SQL aday port | `main` / `3da1c41` | `109.104.120.91:64019` ham TCP erişimi test edildi | TST-010: bağlantı başarılı, çıkış kodu 0 | `test/.../TST-010-sql-external-port-64019.md` | 64019 üzerinden SQL login ve DB seçimi | Codex |
| 2026-09-29 | Faz01 SQL erişim kanıtı | `main` / `a07c242` | Kesin TCP 1433 bilgisiyle ham bağlantı ve doğrudan sqlcmd/XinobiYeniDB yeniden denendi; kaynak genel IP belirlendi | TST-009: nc ve ODBC timeout; SQL kimlik doğrulamaya ulaşılmadı | `test/.../TST-009-sql-1433-external-connectivity.md` | Sunucuda LISTEN + Windows/AWS ağ kuralı kanıtı; Faz01 girdileri | Codex |
| 2026-09-29 | Faz03/03.02 health | `main` / `5079ddf` → yerel commit tamam, push bekliyor | DB bağımsız liveness; gerçek SqlClient bağlantı probe'lu readiness; güvenli 503 kodları; TS/Dart istemci üretimi | TST-008: ilk 8/8, başarı yolu sonrası 9/9; tüm web/mobil/istemci regresyonları; temiz commit üzerinde iki drift kontrolü başarılı | `SqlServerReadinessProbe.cs`, `ReadinessResponse.cs`, `test/.../TST-008-liveness-readiness.md` | Standart API hata gövdesi | Codex |
| 2026-09-29 | Faz03/03.02+03.09 Dart istemci | `main` / `400917c` → yerel commit tamam, push bekliyor | OpenAPI Generator 7.25.0 ile Dart/Dio+BuiltValue istemci; Flutter path dependency; serializer/mobil sözleşme testleri; CI drift | TST-007: ara pnpm/serializer/template sorunları düzeltildi; .NET 6/6, Dart 1/1, Flutter 2/2, TS/web/panel ve temiz commit drift kontrolleri başarılı | `packages/clients/dart`, `apps/mobile/test/api_client_contract_test.dart`, `test/.../TST-007-openapi-dart-flutter-client.md` | Liveness/readiness ayrımı | Codex |
| 2026-09-29 | Faz03 SQL erişim tekrarı | `main` / `f957ab2` | TCP/IP etkinleştirme sonrası 1433, named SQLEXPRESS ve doğrudan sqlcmd bağlantısı yeniden denendi; parola Keychain dışında tutuldu | TST-006: üç deneme de ağ/instance katmanında timeout; login ve DB seçimine ulaşılamadı | `test/.../TST-006-sql-server-connectivity-retry.md` | Gerçek sabit TCP portu + servis restart + firewall/NAT doğrulaması | Codex |
| 2026-09-29 | Faz03/03.02 OpenAPI istemcisi | `main` / `7a5b901` → yerel commit tamam, push bekliyor | Build-time OpenAPI, açık health DTO şeması, ortak tip güvenli TypeScript istemci ve CI drift kontrolü | TST-005: ilk TS peer ve anonim yanıt şeması sorunu düzeltildi; .NET 6/6, TS/web/panel ve Flutter regresyonları; deterministik hash ve temiz commit üzerinde gerçek drift komutu başarılı | `packages/contracts`, `packages/clients/typescript`, `test/.../TST-005-openapi-typescript-client.md` | Flutter/Dart istemci üretimi ve drift kontrolü | Codex |
| 2026-09-29 | Faz03 erken API sözleşmesi | `main` / `b51e6fd` → commit bekliyor | WebApplicationFactory ile gerçek uygulama health, request ID, 404 Problem Details ve OpenAPI testleri eklendi | TST-004: iki Release doğrulaması 0 uyarı/0 hata ve 6/6 test; diff, rapor indeksi ve sır taraması başarılı | `ApiContractTests.cs`, `test/.../TST-004-api-contract-integration.md` | OpenAPI istemci üretme stratejisi ve drift kontrolü | Codex |
| 2026-09-29 | Faz03 erken CI | `main` / commit bekliyor | Docker'sız GitHub Actions: .NET Release build/test, pnpm frozen lint/build, Flutter analyze/test; salt okunur izin ve concurrency | TST-003: tüm hedefler başarılı; bir yerel Flutter dizin hatası kaydedilip doğru dizinden geçti | `.github/workflows/ci.yml`, `docs/operations/ci.md`, `test/.../TST-003-ci-workflow.md` | Push sonrası gerçek Actions sonucunu izle; SQL CI job'u erişim gelene kadar ekleme | Codex |
| 2026-09-29 | Faz00/test raporlama | `main` / commit bekliyor | Kök `test/` klasörü, indeks, rapor şablonu ve bugüne kadarki 27 tekil test/bağlantı kaydı oluşturuldu; gelecekte her test için zorunlu kayıt kuralı eklendi | Rapor bütünlük ve diff kontrolü bekliyor | `test/README.md`, `test/INDEX.md`, `test/2026-09-29/TST-001-initial-validation-history.md` | Her yeni testte indeks ve tarihli raporu güncelle | Codex |
| 2026-09-29 | Faz01/01.07,01.12 | `main` / commit bekliyor | Sağlayıcı/test erişim matrisi, Creative brief girdisi ve faz bağımlılık/UAT planı hazırlandı; erişim varmış gibi işaretlenmedi | `git diff --check` bekliyor | `provider-access-inventory.md`, `creative-brief-input.md`, `phase-dependency-uat-plan.md` | Gerçek iş sahibi/erişim girdisi olmadan dur; Faz01'i kapatma | Codex |
| 2026-09-29 | Faz01/01.11 sözleşmeler | `main` / commit bekliyor | API kuralları ve modül sözleşme taslağı; `X-Request-Id`, Problem Details 404 ve otomatik middleware testleri | İlk test eski restore grafiğiyle 2 hata; `dotnet restore` sonrası build 0 uyarı/hata, 3/3 test; health 200 ve problem 404 smoke başarılı | `docs/contracts/*`, `RequestCorrelationMiddleware.cs`, testler | Müşteri karar girdileri; bağımsız faz plan/kapı dosyası | Codex |
| 2026-09-29 | Faz01/01.02–01.10 hazırlık | `main` / commit bekliyor | As-is/to-be görüşme ve kanıt formu; D01–D10 sahip/kanıt/etki/geri dönüş karar defteri oluşturuldu; bilinmeyen kararlar doldurulmadı | `git diff --check` bekliyor | `docs/discovery/as-is-to-be.md`, `decision-register.md` | Yetkili iş sahibi girdilerini ve maskeli örnekleri al | Codex |
| 2026-09-29 | Faz01/01.01 + D01 | `main` / commit bekliyor | Kapsamdaki 366 madde ve Android eşliği için 367 tekil gereksinim satırı; faz/yüzey/API/veri/UAT/D kararı eşlemesi ve ortam envanteri üretildi | Generator iki kez aynı hash; satır kapsam testi 367/367; `git diff --check` başarılı | `docs/discovery/requirements-traceability.csv`, `environment-inventory.md` | As-is/to-be operasyon girdilerini topla | Codex |
| 2026-09-29 | Faz01/F01-D01 + Faz03 erken iskelet | `main` / `2b6099b` | .NET API/worker/shared/test, Next.js web, Vite admin ve Flutter mobil iskeleti; sürümler sabitlendi; API sağlık ucu eklendi; private origin'e pushlandı | .NET build/test, pnpm lint/build, Flutter analyze/test başarılı; health 200 | `XinobiYeni.slnx`, `apps/*`, `services/*`, `tests/*`, lockfile'lar | Faz01 gereksinim matrisi ve ortam envanteri | Codex |
| 2026-09-29 | Faz01/F01-D01 | `main` / commit yok | Git deposu ve origin kuruldu; kaynaklar hash ile `docs/sources` altına alındı; ADR-001 ve başlangıç dosyaları yazıldı | Kaynak SHA-256 başarılı; Node/npm var; .NET/Flutter/pnpm yok; SQL `109.104.120.91:1433` login timeout | `docs/sources/README.md`, `docs/decisions/ADR-001-teknoloji-omurgasi.md` | Araç zincirini kur ve sürümleri sabitle | Codex + proje sahibi kararları |
| 2026-09-28 | Faz00/P-00 | — | Plan defteri oluşturuldu; kod yazılmadı | Belge incelemesi | Faz00–Faz11 | D01 envanteri | Temsili plan ekibi |

### Kesintiden devam — olay başına kopyala

```text
Olay ID / tarih-saat:
Faz / görev / beklenen kabul:
Son doğrulanmış branch ve commit:
Kirli çalışma ağacı (git status):
Tamamlanan son atomik adım ve test kanıtı:
Yarım kalan dosyalar / migration / dış işlem ve sonucu:
Gerçek hata, tekrar üretme komutu ve log yolu (sır yok):
Gerçek ödeme/sipariş/entegrasyon oluştu mu? İç ve dış işlem ID'leri güvenli referansla:
Güvenli yeniden deneme veya geri alma adımı; idempotency kontrolü:
Açık müşteri kararı / engel / sahibi:
Tek sonraki işlem:
İnceleyen ve PM kararı:
```

**Yeniden başlatma kuralı:** Önce son doğrulanmış commit/test ve dış işlem durumunu kontrol et; aynı ödeme, sipariş, fatura veya baskı işini yeniden üretmeden önce idempotency anahtarını ve sağlayıcı durumunu sorgula. Migration yarım kaldıysa geçmişi/şemayı incele, körlemesine tekrar çalıştırma. Hata kanıtını ve çözümü bu deftere ekle.

## 6. Değişiklik, ADR ve test kayıtları

| ID / tarih | Karar veya değişiklik | Kaynak gerekçe | Etkilenen dosya/faz/API/migration | Test/geri alma | İş sahibi / PM |
|---|---|---|---|---|---|
| ADR-001 / 2026-09-29 | Next.js web, React/Vite panel, ASP.NET Core/EF/MS SQL, Flutter mobil, modüler monolit + worker/outbox-inbox; Docker yok | Proje sahibi kararları, analiz §6 ve temsili CTO incelemesi | Faz03–11; `docs/decisions/ADR-001-teknoloji-omurgasi.md` | Araç/build ve gerçek SQL testi bekliyor; ADR ile geri dönüş | Proje sahibi onayladı / uygulama kanıtı bekliyor |

| ADR-003 / 2026-10-07 | Development'ta SQL Server yerine `services/api/App_Data/local-commerce/state.json` dosya deposu ve tarayıcı localStorage demo hesap/sipariş kaydı; yalnız Development/loopback | Faz03 çekirdeği olmadan demo ilerletme | Faz03–05/10; `docs/decisions/ADR-003-gecici-yerel-ticaret-deposu.md` | TST-088; SQL Server'a geçiş Faz03 03.11 | **Proje sahibi onayladı · 07.10.2026** |
| ADR-002 Ek A / 2026-10-07 | Cloudflare Workers AI gerçek adaptörü ve ücretli çağrı Faz10 kapısından (D05/D08/D10, PoC) önce eklendi (`3db452e`); yalnız Development/loopback, 30/gün | Kullanıcı isteğiyle XINOBI U canlı denemesi | Faz10 10.01A–10.05; `docs/decisions/ADR-002-cloudflare-workers-ai.md` Ek A | TST-XINOBI-U-live; yalnız Development; production'a Faz10 kapısıyla | **Proje sahibi onayladı · 07.10.2026** |

**Plan–kod sapma kaydı (2026-10-07 incelemesi):** (1) Faz03'ün EF Core DbContext/migration, kimlik, rol, audit ve outbox çekirdeği henüz yok; web ve panelin büyük kısmı geçici dosya deposu üzerinde çalışıyor. (2) Faz02 aktifken Faz04/05/06/10 işlevleri demo olarak kodlandı; bu kodlar ilgili fazın kabulü sayılmaz, faz başlarken yeniden doğrulanır. (3) Faz02'nin zorunlu çıktısı `design/a11y-audit.md` yok; BRIEF / ORTAK TASARIM / WEB TASARIM onayları bu tabloya işlenmedi. Bu üç madde kapanmadan ilgili faz kapısı açılmaz. **14.10.2026 güncellemesi:** (1) kısmen kapandı — DbContext, 5 migration, kimlik/rol ve outbox sahiplenme SQL’de; audit yazımı, inbox işleyicisi ve ayrı worker hâlâ yok. (2) aynen geçerli; demo kodun büyük kısmı artık SQL’e bağlı ama faz kabulü yok. (3) aynen açık.

Her önemli karar `docs/decisions/ADR-###.md` ile şu alanları taşısın: problem, kaynak maddesi, seçenekler, karar/sahip/tarih, güvenlik/veri etkisi, geriye dönüş, test, etkilenen fazlar. Sözleşme ya da şema değişince ilgili önceki fazın regresyonunu yeniden çalıştır; Faz00 satırı ve Faz dosyası bağlantısını güncelle.

**Gerçek komut kayıtları** (kurulumdan sonra boşlukları doldur):

| Tür | Komut / ortam | Son sonuç / tarih |
|---|---|---|
| API başlatma | `dotnet run --project services/api/Xinobi.Api.csproj` | Sağlık ucu doğrulandı · 2026-09-29 |
| Web/panel/mobil başlatma | `pnpm dev:local:background`; `cd apps/mobile && flutter run -d emulator-5554` | Android emülatörde çalışıyor (TST-095–107); iOS cihaz çalıştırması yok |
| Veritabanı migration/seed | `infra/db/migrations/000N_*.idempotent.sql` (sqlcmd, runbook `docs/runbooks/database-migrations.md`) | 0001–0005 XinobiYeniDB’ye uygulandı · 2026-10-09 (TST-110/113/114) |
| Birim/entegrasyon/e2e | `dotnet test XinobiYeni.slnx`; `pnpm lint`; web/admin `tsc`; `cd apps/mobile && flutter analyze && flutter test`; web e2e `apps/web/tests/e2e` | 385/13 atlandı/0, Flutter 55/55, lint/tsc temiz · 2026-10-14 (TST-115); web e2e 107/107 · 2026-10-09 (TST-108) |
| Geri yükleme/rollback | `infra/db/migrations/*.rollback.sql`; yedek doğrulama `tools/sql/verify-catalog-backup.sql` | Rollback script’leri var; VERIFYONLY Msg262 yetki hatası, restore provası **denenmedi** |

## 7. Faz kabul kayıtları — gerçek uygulamada doldur

İzin verilen statüler: `Planlandı`, `Devam`, `Bloke`, `İncelemede`, `RED`, `Tamamlandı`. Her fazda yedi rol ayrı ayrı `BEKLİYOR / ONAY / RED`, gerekçe, kanıt, tarih ve gerçek kişinin kimliğiyle kaydedilir. Tüm roller onaylasa bile PM'nin **ayrı nihai kararı olmadan** tamamlanmış olmaz. Ürün sahibinin D kararını PM yerine veremez.

| Faz | Kod/teslim kanıtı | BA | Creative | FE | BE | DBA | Full Stack | Web Des. | CTO | PM nihai | Statü |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Defter, ADR-001–004, test/INDEX, task dökümleri; TST-115; 27.10 faz denetimi ve commit envanteri | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Devam |
| 01 | `docs/discovery/*` (368 satır izlenebilirlik, karar defteri, as-is/to-be, sözleşme taslağı); D kararları açık; güncel main/runtime envanteri; D kararları açık | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Bloke |
| 02 | `design/*` (tokens, components, flows, editor/ai-spec, handoff, WEB-001 hi-fi); TST-053–086; 23.10 UX; 27.10 tam ekran/Nobi kontrolleri | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Devam |
| 03 | Persistence + 5 migration uygulandı; kimlik/izin/panel girişi; IFileStore; TST-091–114; TST-135; aa6069f yetki düzeltmesi | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Devam |
| 04 | SQL katalog/varyant/fiyat/stok, panel katalog, galeri; TST-111/113; titanyum kategori bağı, HTTP medya araçları ve inventory.write | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Devam |
| 05 | Hesap, adres, ödemesiz sipariş, iptal/iade talebi, değerlendirme, bildirim; TST-098/099/114; web/mobil ortak favori, revizyonlu sepet ve sipariş ürün snapshot | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Bloke |
| 06 | Ürün yüzey maskeleri, XINOBI U önizleme, editör, kayıtlı tasarım → sepet/sipariş; TST-106/114; PlacementStudio, revizyonlu yerleşim, korumalı önizleme; baskı kapısı açık | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bloke |
| 07 | Teklif talep/takip/mesaj/kabul-ret, panel teklifleri; tasks-2026-10-09-addendum; yükleme/hata, yazma yetkisi, salt okunur özet, yerel arama/sayfalama | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Bloke |
| 08 | Yalnız panel prototip (TST-084); 27.10: yeni Mikro adaptörü yok | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Bloke |
| 09 | Yalnız panel prototip (TST-084); 27.10: yeni kanal adaptörü yok | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | — | Bekliyor | Bloke |
| 10 | XINOBI U (Cloudflare, ADR-002 Ek A/B), Nobi + AI yönetimi (Ek C); TST-XINOBI-U-live; prompt v2; ürün bağlamı, AI panel izin/tarih filtreleri | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | — | Bekliyor | Bekliyor | Devam |
| 11 | Flutter Android; iOS/UAT/mağaza kabulü yok; DEPLOY-012–014; kullanıcı 25.10 kurulum bildirimi, son release IIS bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Bekliyor | Devam |

`—` o fazda ek rolün zorunlu kaydı olmadığını gösterir. **14.10.2026:** "Kod/teslim kanıtı" ve statü sütunları güncellendi; rol ve PM hücreleri gerçek inceleme yapılmadığı için `Bekliyor` bırakıldı. Bu nedenle hiçbir faz `Tamamlandı` değildir. **27.10.2026:** teslim kanıtları güncellendi; rol, PM ve faz kabul statüsü hücreleri değiştirilmedi.

PM her fazda kontrol eder: ① kaynak kapsamı ve Creative/UIUX handoff ② D kararlarının gerçek sahibi ③ kod/şema/API kanıtı ④ otomatik ve manuel test sonucu ⑤ yedi rol incelemesi ⑥ güvenlik, veri, rollback ⑦ Faz00 güncelliği. PM kendi rol incelemesini `PM-İNCELEME: ONAY/RED`, ardından ayrı nihai kararı `PM-KAPI: KABUL/RED` ve iki ayrı kanıt/tarihle aynı hücreye veya bağlantılı tutanağa yazar. Herhangi biri yoksa gerekçe yazıp `RED`; koşullu kabul ile sonraki bağımlı fazı başlatma. Plan dosyaları için ayrı temsili doküman inceleme sonucu aşağıya yazılır; uygulama tablosunu değiştirmez.


## 8. Plan dokümanı inceleme kaydı

Yedi temsili rol 12 dosyayı çapraz incelemiş, somut revizyonları tekrar denetlemiş; PM her fazı ayrıca son kez incelemiştir. **28.09.2026 plan belge kararı: PM KABUL.** Bu sonuç yalnızca metin planı içindir; müşteri kararları veya yazılımın tamamlandığı anlamına gelmez. §7 uygulama tablosundaki bütün gerçek onaylar beklemede kalır.

| Rol | Belge inceleme sonucu | Açık düzeltme |
|---|---|---|
| BA | ONAY · 28.09.2026 · 00–11 | 00/04/05/07/11 kapsam ve kabul revizyonları işlendi |
| Sr Creative Designer | ONAY · 28.09.2026 · 00–11 | 01 tasarım döngüsü ve 08 panel handoff düzeltildi |
| Sr Frontend Developer | ONAY · 28.09.2026 · 00–11 | 02 UI/UX, 05/09 sözleşme yolu, 11 PM kapısı düzeltildi |
| Sr Backend Developer | ONAY · 28.09.2026 · 00–11 | 05 belirsiz ödeme ve 09 belirsiz dış işlem politikası düzeltildi |
| DB Admin | ONAY · 28.09.2026 · 00–11 | 04/05/09 tablo sahipliği ve göç tekrarları düzeltildi |
| Sr Full Stack Developer | ONAY · 28.09.2026 · 00–11 | 02 UI/UX ve 09 repo yolu düzeltildi |
| PM (zorunlu son kapı) | KABUL · 28.09.2026 · 00–11 | Kaynak kopyası ve tüm faz kapıları dahil son inceleme |

**Faz bazlı temsili belge incelemesi:** Her hücre ilgili rolün son sürüm dosyaya plan düzeyinde onayını gösterir; gerçek uygulama kapısının alanı değildir.

| Faz | BA | Creative | FE | BE | DBA | Full Stack | PM son plan kararı |
|---|---|---|---|---|---|---|---|
| 00 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 01 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 02 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 03 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 04 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 05 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 06 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 07 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 08 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 09 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 10 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |
| 11 | ONAY | ONAY | ONAY | ONAY | ONAY | ONAY | KABUL |

## 9. Tamamlanma tanımı

Faz11 sonunda kaynak analizdeki tüm teslimler canlı ortamda kanıtlanmış, üç pazaryeri/Mikro gerçek erişimle mutabık, ödeme/kargo gerçek sağlayıcıyla doğrulanmış, iOS/Android mağaza süreçleri tamamlanmış, baskı çıktısı fiziksel kabulden geçmiş, AI limit/maliyet ve insan devri işler, güvenlik/yedek-geri yükleme ve eğitim/tam teknik doküman teslim edilmişse proje tamamlanır. Gerçek sağlayıcının kabul etmediği bir işlem veya Xinobi iş sahibinin vermediği karar, `mock tamamlandı` diye işaretlenip proje kapanışına geçirilmez.

## 10. Başka bir geliştirici veya kodlama ajanına verilecek devam talimatı

Her yeni oturumda aşağıdaki talimatı, bu dosyayı, ilgili FazXX dosyasını, kaynak kapsam/analizi ve mevcut repo erişimini birlikte ver. Bir oturumda tek kabul edilebilir alt işi tamamla; sonraki oturum yine Faz00'dan başlayabilir.

> Xinobi geliştirmesine kaldığı yerden devam et. Önce `Faz00_Proje_Takip_ve_Kesintiden_Devam.md` anlık durum, kesintiden devam, açık D kararları, rol/PM kapıları ve son oturum kaydını; sonra aktif `FazXX_<konu>.md` görev ve testini oku. Kaynak kapsam ile analizi karşılaştır. Repo gerçek durumu için `git status`, son commit, son migration ve ilgili testleri doğrula; Faz00'da yazanı kanıt olmadan doğru varsayma. Aktif fazın sıradaki **tek atomik işini** uygula, yalnız o işe bağlı kodu değiştir, test/manuel kanıt üret, regresyonu kontrol et, sonuç ve başarısızlıkları Faz00'a yaz. Dış ödeme, AI, fatura veya pazaryeri işlemi yeniden denenmeden önce sağlayıcı durumunu ve idempotency kimliğini doğrula. Müşteri D kararını uydurma; erişim olmadan mock sonucu gerçek entegrasyon diye kapatma. Fazın yedi ayrı rol incelemesini ve PM'nin ayrıca nihai KABUL/RED kararını talep edilen kanıtlarla kaydet; eksikse fazı Bloke/İncelemede tut. Oturum bitmeden aktif branch/commit, değişen dosyalar, son başarılı komut/sonuç, hata, blokaj sahibi ve **sonraki tek güvenli adımı** Faz00'a işle.

Bu talimat yazılımı kendi başına onaylayan bir vekil değildir. Sağlayıcı kimliği/izinleri, üretim baskı standardı, hukuk metinleri ve gerçek Xinobi iş kuralları gibi D01–D10 müşteriye ait girdiler gelene kadar ilgili canlı kapı açık kalır; bağımsız kod ve test işleri devam eder.

### ProductSurfaces devam notu — 06.10.2026

- Konuşmadaki Phase 1/2/3 özelliğin alt adımlarıdır; proje Faz01/Faz02/Faz03 kabulü değildir. Takip adı `ProductSurfaces Step 1` olarak sabitlendi.
- Step 1 provider-neutral automatic/interactive aday revision, lineage, source-pixel Keep/Exclude doğrulaması, tam source/revision/candidate için açık approve/reject ve stale approval engeli sağlar. Interactive inference yeni sonuçtur; önceki maskeyi düzenlemez. Yeni candidate pending kalır ve mevcut onayı sessizce değiştirmez. Optional provider score yalnız sağlanan anlamıyla korunur.
- `SourceMediaIdentity` metadata değer nesnesidir; ortak Asset sahipliği kurmaz. Gelecekte doğru ürün/varyant/Asset medya sürümüne bağlanır. Maske PrintArea veya fiziksel baskı onayı değildir; SegmentationRevision müşteri DesignVersion'ı değildir; ReviewDecision ortak AuditLog'un yerine geçmez. Reviewer ileride authenticated principal'dan alınır. Ayrıntılı sınırlar: `docs/contracts/domain-contract-draft.md` ProductSurfaces bölümü.
- Mevcut onaylı Canvas önizleme/projeksiyon yalnız approved mask tüketir; ADR-001 Fabric.js müşteri editörü sorumluluğunu değiştirmez. Roboflow/SAM 3 segmentation PoC, ADR-002 Cloudflare görsel üretim kararından ayrıdır; production provider/medya aktarımı/saklama/maliyet/güvenlik açık kalır. Task arayüzü durable job değildir; gerçek adapter adımında ölçülen latency/provider davranışı ve ortak worker/job yönüyle yürütme stratejisi seçilir.
- `docs/sources/README.md` kayıt hash'leri mevcut özgün/kopya çiftleriyle uyuşmuyor; özgün ve kopya içerikleri kendi aralarında aynı. Bu oturumda kaynak dosyaları veya kayıtlı hash'ler değiştirilmedi; kaynak sürüm/provenance uzlaştırması ayrı iştir.
- Belgelerde atıf yapılan `Xinobi_Kavramsal_ve_Teknik_Analiz2.md` çalışma ağacında bulunamadı. İçeriği yeniden kurulmadı; mevcut fark matrisi doğrudan kaynak yerine kabul edilmez.
- Step 1 UNIT/MOCK başarısı gerçek hosted entegrasyon, UAT, fiziksel baskı veya PM faz kabulü değildir. Hiçbir rol onayı veya D kararı bu kayıtla doldurulmaz.


### ProductSurfaces Step 3 — 06.10.2026 oturum kaydı

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok.
- Yalnız development + explicit opt-in, process-local in-memory session/version lock, exact source/candidate kontrolü, automatic init ve yeni interactive pending revisions, approve/reject uygulandı.
- Yerel reference provider aynı maskeyi döndürür; noktalar kaydedilir fakat AI ile yeniden hesaplama yok. Üretim auth/persistence/jobs/provider yok; renderer/Fabric.js ve asset'ler değişmedi.
- Asset/Variant/media sınırı dev fixture üzerinden korunur. Maske PrintArea/DPI/physical production/D04 onayı değildir. D04/D05/D08/D10 açık kaldı.
- Final kanıt TST-093–099: 63/63 backend, 4/4 Admin E2E, Release 0 uyarı/0 hata, Admin typecheck/build/lint, hash/diff. İlk compile, sandbox Event Log, NVM shim, CSS browser desteği, pointer hassasiyeti ve test-host DLL kilidi sorunları raporlarda tekrar sonuçlarıyla korundu.
- Sonraki adım yalnız kullanıcı incelemesi; Step 4 başlamadı.

### ProductSurfaces Step 4B-1 — 06.10.2026 oturum kaydı

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Bu ProductSurfaces alt adımı repository-wide Faz04 değildir.
- Provider-neutral interface/domain korunarak infrastructure Roboflow PCS/PVS adapter, bounded COCO RLE normalization, existing Skia validation ve candidate-specific in-memory mask buffer uygulandı. Request/result HTTP yalnız mocked handler'larla sınandı.
- Default reference provider; ExternalInferenceEnabled default false. Runtime socket-backed provider composition yoktur; flag açılsa bile outbound kapalıdır. Gerçek key okunmadı/eklenmedi/kullanılmadı. Test header'ındaki sentetik string credential değildir. Görsel dışarı gönderilmedi, gerçek inference yok, kasıtlı Roboflow kredi tüketimi sıfır.
- External-provider mode startup/GET/page-load candidate üretmez; explicit “Aday oluştur” POST gerekir. HTTP await sırasında review gate tutulmaz; in-flight conflict, exact-source revalidation, failure/cancellation version ve önceki approval koruması vardır. Hatalarda noktalar korunur; retry yoktur.
- TST-100 final: 111/111 backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin typecheck/build/lint ve diff kontrolü başarılı. İlk nullable/test await compile, sandbox Event Log/browser start, NVM shim ve lint dependency sorunları düzeltme/izinli tekrar kanıtıyla kaydedildi.
- Renderer/Fabric.js/Tea Maker asset'leri ve production Asset/Variant/PrintArea/Design sorumlulukları değişmedi. Persistence/auth/jobs yok. D04/D05/D08/D10 çözülmedi. OpenAPI hash öncesi/sonrası aynı.
- Sonraki tek güvenli adım kullanıcı code-review/onayıdır. Deployed Roboflow wire contract hâlâ smoke doğrulaması ister. Credential configuration/use, exact görselin dış aktarımı veya gerçek inference öncesinde ayrıca açık kullanıcı onayı gerekir. Step 4B-2 başlamadı.

### ProductSurfaces Step 4B-2 — single automatic Roboflow smoke test / 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. UserSecretsId non-secret metadata eklendi; key'i kullanıcı kendi terminalinde ayarladı ve onayladı. Value gösterilmedi veya secret dump yapılmadı.
- Explicit limited approval: yalnız existing Tea Maker WebP, `lower kettle body`, tam bir automatic inference maksimum; interactive/second inference/retry yasak. Preflight source 1066×1600, SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`, provider/gate/credential presence/counter=0 doğrulandı. Atomic single-request guard ve interactive rejection uygulandı; default disabled kaldı.
- Actual requests attempted: **1**. HTTP **200**, **1529 ms**. PCS/RLE mocked wire assumptions eşleşti; parser correction yok. Returned candidate 1, selected index 0, supplied score 0.83984375. Compressed COCO RLE `[1600,1066]` -> exact RGBA PNG; validation başarılı.
- Mask SHA `6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db`; alpha zero/opaque/intermediate 1422315/283285/0. One pending candidate/revision, active approval null. Onay yapılmadı; second automatic, interactive ve retry yapılmadı. Exact credit consumption was not confirmed by the inference response.
- Desktop ve 390px mobile GET-only QA: aligned=true, overflow=false, QA POST=0. Görsel lower body iyi, fakat spout dahil ve alt sınır hafif pürüzlü; candidate insan review gerektirir. Screenshot'lar `%TEMP%/xinobi-product-surfaces-step4b2-desktop.png` ve `...-mobile.png`; safe evidence JSON aynı temp dizininde. Yerel QA localhost 5015 API / 5175 Vite, tek çağrı bütçesi tükenmiş in-memory oturum; restart bu çağrıyı tekrar yetkilendirmez.
- TST-101: 120/120 mocked/local backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin type/build/lint ve diff/hash başarılı. İlk GET-only QA scriptinde Türkçe stdin encoding locator timeout verdi; ASCII selector ile düzeltildi, inference tekrar edilmedi.
- Renderer/Fabric.js/source/reference assets, Asset/Variant/PrintArea/Design sorumlulukları ve OpenAPI değişmedi. D04/D05/D08/D10 açık. Production persistence/jobs/auth yok; runtime restart adayları kaybeder. Retention/training/billing miktarı teyitli değildir.
- Sonraki tek güvenli adım pending adayın kullanıcı tarafından incelenmesidir. Interactive deployed PVS testi için ayrı açık çağrı/point/source/budget onayı gerekir. Bu oturumun inference izni tüketildi; başka çağrı yapılmayacak.

### ProductSurfaces Step 4B-3 — single interactive Roboflow smoke test / 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Explicit limited approval yalnız Tea Maker exact source ve Keep (420,920) / Exclude (245,730) için tek interactive call. Credential değişmedi ve server-side kaldı. Automatic inference/retry/ikinci call yok.
- Actual interactive requests attempted: **1**; HTTP **200**, **1312 ms**. PVS top-level predictions/masks/confidence/format ve compressed COCO RLE [1600,1066] varsayımları doğrulandı; parser correction yok. Tek result, index 0, supplied score 0.9453125; score approval değildir.
- Normalized RGBA PNG 1066×1600; SHA `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`; alpha transparent/opaque/intermediate 1448452/257148/0. Exact source SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414` korundu; empty/full validation geçti, cleanup/resize yok.
- Önceki automatic pending kimlik ve maskesi verified local smoke handoff ile korundu. Yeni pending interactive revision/candidate, exact lineage, candidate-specific bytes; approval null, stateVersion=5. Automatic vs interactive: 26361 changed, 26249 removed, 112 added. Spout dışarıda; ana body korunmuş. Logo işaretlerinde küçük holes ve alt kenarda hafif jaggedness insan incelemesi gerektirir.
- Admin Düzelt/points/regenerate gerçek akışı: click başına inference yok; explicit regenerate tek POST. Desktop/390px mobile aligned, overflow yok. `%TEMP%/xinobi-step4b3-interactive-desktop.png`, `...-mobile.png`, `xinobi-step4b3-automatic-vs-interactive.png`.
- TST-102: 126/126 mocked/local backend/API, 5/5 Admin Playwright, Release 0 uyarı/0 hata, Admin typecheck/build/lint ve diff/hash başarılı. OpenAPI SHA unchanged `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`.
- Exact credit consumption was not confirmed by the inference response. Renderer/Fabric.js/assets/PrintArea/production Asset/persistence/jobs/auth değişmedi; D04/D05/D08/D10 açık.
- Tek çağrı bütçesi tüketildi. Başka inference yok. Technical automatic + correction + pending review kanıtlandı; insan approval/code review sonraki güvenli adımdır. API restart yeni izin değildir.

### ProductSurfaces Step 4C-2 — Tea Maker opt-in enclosed-hole refinement / 06.10.2026

- Branch/HEAD feature/product-personalization / acc0c99; commit yok. Yalnız LOCAL deterministic işlem; gerçek Roboflow call0, credential kullanılmadı, dış medya aktarımı/kredi yok, package0.
- `ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled` default false; exact Tea Maker source/raw fixture ve reference provider + external/smoke gates false gerektirir. Threshold5718 inclusive/connectivity8 yalnız bu fixture policy'sidir; global default değil. Raw provider mask immutable test/development fixture olarak korunur; yeni Asset/persistence modeli yok.
- Provider-independent refiner yalnız enclosed alpha0 components doldurur; border-connected exterior ve mevcut RGBA pikseller değişmez. Branding dependency, bottom cleanup, smoothing, generic morphology yok. Existing validation/SHA pipeline kullanılır.
- Expected ölçümler birebir: foreground257148→262866, components5→1, enclosed holes1→0, filled1 hole/5718pixels. Exterior changed0, outer silhouette changed0. Raw SHA before/after `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`; derived SHA `4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43`.
- New pending derived candidate + exact raw/source/algorithm/version/policy/count/checksum provenance. Raw IDs unchanged; approval null, stale/version protections retained. Admin Ham/Düzenlenmiş comparison changes visualization only; raw view blocks decisions, explicit local refine action, no threshold editor. Desktop1440/mobile390 aligned, no overflow; logo hole fixed, spout/handle/upper/base/bottom silhouette preserved.
- TST-103: focused17/17, full backend/API148/148, Admin6/6, Release0 warnings/errors, Admin type/build/lint/diff successful. Initial test proxy header/CSS cwd/pixmap nullable issues corrected; no tests weakened or expected threshold changed. Raw/source/OpenAPI hashes preserved.
- Evidence `%TEMP%/xinobi-step4c2-review-derived-desktop.png`, `...-mobile.png`, `xinobi-step4c2-raw-vs-derived.png`; final derived QA candidate pending, no approval. Runtime API5016/Vite5176 is local-only and inference disabled; restart resets derived state, raw regression fixture remains.
- Renderer/Fabric.js/assets/PrintArea/Design/production Asset/persistence/jobs/auth unchanged. D04/D05/D08/D10 open. Policy stays Tea-Maker-specific; next safe step human/code review only. No inference/other product/next step begun.

### ProductSurfaces Step 4D-2 — minimal local Add/Remove correction — 06.10.2026

- Branch/HEAD: feature/product-personalization / acc0c99; commit yok. Yalnız development review içinde source-pixel Add/Remove strokes, zoom/pan, radius2/4/8/16, Undo/reset ve explicit yeni düzeltilmiş pending aday eklendi; full editor değil.
- Backend `source-pixel-capsule-strokes` v1 authoritative. Parent/raw/refined immutable; exact source/session/version/parent ve bounded input/work doğrulanır. Yeni provenance parent/output checksum + ordered operations + derived IDs + fixed dev reviewer kaydeder. Approval ayrı; eski onay değişmez.
- Çizim/zoom/pan/Undo sırasında POST0; explicit create1 local POST. Failure strokes/Undo korur, stale409 farklı adaya implicit transfer/retry yapmaz. Unsaved correction mode review/view değişimini engeller. API restart/history kaybı sürer; production persistence/auth/Asset/PrintArea/DesignVersion oluşturulmadı.
- TST-104: 21 focused + full169/169 backend/API, Admin10/10, Release0 warnings/errors, Admin type/build/lint ve diff başarılı. Çalışan API DLL kilidi nedeniyle mevcut süreç kapatılmadan ignored `bin/step4d2/` output kullanıldı. İlk compile/sandbox/pointer scroll/refined-parent QA/lint sorunları ve düzeltmeler test kaydında.
- Exact refined parent4f3fffe... üzerinden alt-kenar temsili human Add stroke88 pixel ekledi; output7979b30e...; pending, approvalnull. Desktop/390 mobile ve local before/after QA incelendi. Tüm sınırlar tamamlandı/ticari uygunluk onaylandı iddiası yok.
- Roboflow calls0, credential unused, external transfer0, packages0. Renderer/Fabric.js/source/manual mask/raw fixture/OpenAPI korunur. PrintArea/D04 ve D05/D08/D10 açık. Geçici QA dosyaları test kaydında; candidate test-host restart ile kaybolur.
- Sonraki tek güvenli adım: kullanıcı UI/QA incelemesi; yeni ürün/inference/production step başlatılmadı.

### ProductSurfaces Step 5B — Development Accepted-Surface → Storefront Renderer Bridge / 06.10.2026

- Yalnız development preview: explicit environment+flag gate, read-only loopback rendering bundle, exact source SHA/dimensions, manuel accepted prototype mask SHA/alignment, required branding SHA/alignment. AI ReviewDecision uydurulmadı; pending/rejected/derived adaylar yayınlanmadı.
- Web adapter + EditorWorkspace props; selected development variant query ürün→studio→editor ve geri bağlantıda korunur. Unsupported renkler blue'ya düşmez. Same-origin versioned assets; renderer algoritmaları ve manuel/source/branding asset'leri değişmedi. Native UI/loading/unavailable korunur.
- TST-105: 18 focused / 187 backend/API, 15 bridge+renderer / 6 mevcut web interaction-accessibility test geçti; API Release 0 warning/error, web typecheck/build/lint başarılı. 1440 desktop/390 mobile QA; outside pixel differences0, branding differences0; Next dev proxy local blue ready/silver unavailable doğrulandı.
- Roboflow0, credential use0, image transfer0, package0; production Asset/Variant/storage/persistence/PrintArea/cart/order yok. D02/D04/D05/D08/D10 açık. Shared Catalog+Asset+approved resolver gelecekte fixture resolver'ın yerini alır; production publishability kanıtlanmadı.
- Başlangıç API output kilidi ayrı ignored build directory ile aşıldı; mevcut Google Font build sandbox hatası izinli build ile giderildi. Test cookie/route-announcer/list-reference assertions düzeltildi; test kuralları zayıflatılmadı. Aktif normal Next dev durdurulmadan isolated preview distDir kullanıldı; Next type includes tsconfig'e eklendi.
- OpenAPI before/after SHA `01f859b52fe8543303c3201364718eef5f0610716a78250c57fde47b12c24fe6`; manuel mask SHA `8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06` korundu. Commit yok; next step yalnız kullanıcı QA/code review.

### Integration çalışma durumu — 06.10.2026

Ayrı integration/product-surfaces-step5b worktree; checkpoint e325dd7 + origin/main 529c107, merge henüz commit edilmedi. Teammate commerce/Admin korunur; ProductPatternPreview tek canonical surface renderer. D kararları ve production Asset/PrintArea açık. Önceki durum tabloları tarihsel kayıttır.

Integration validation — TST-106: backend214/214, Admin10/10, canonical bridge/renderer17/17; full web55/65 (5 preserved contrast + 5 legacy expectation failures). API/Web/Admin builds pass; incoming cached whitespace noted separately. Original worktree unchanged, no merge commit/push/inference. DEMO-P101/DEMO-V101-B explicit media-validated development bridge; no production IDs or D resolution.

### 7–8 Ekim task dökümü ve 9 Ekim ek işleri — 09.10.2026

Kullanıcı isteğiyle 7–8 Ekim işleri commit kanıtlarına bağlı tek tek tasklara dönüştürüldü: **108 task**. 9 Ekim için **17 ek task** ayrı bölümde gösterildi. Toplam **125 task**, **97 tarihsel commit**. Çok özellikli commitler ayrı tasklara bölündü; geri alınan tasarım, canlıya çıkmamış paketler ayrıştırıldı; döküm sırasında commitlenen mobil sipariş/bildirim akışı da dahil edildi. Bu kayıt faz onayı/canlı yayın beyanı değildir; task dökümü için tarihsel testler yeniden çalıştırılmadı.

- [Task kayıtları](../docs/tasks/tasks-2026-10-07-09.md)
- [İçe aktarılabilir CSV](../docs/tasks/tasks-2026-10-07-09.csv)

### 9 Ekim yeni commitler, doğrulama bildirimi ve açık işler — 09.10.2026

`9d00596` task dökümünden sonra gelen 14 geliştirme/karar commitinin ek kaydı (`3591c8e`–`baf83e4`): satın alma doğrulamalı değerlendirme ve teknik özellikler; web/mobil karşılaştırma; hesaba bağlı Tasarımlarım; kurumsal teklif talep/takip/mesaj/kabul-ret; kataloğa dayanan Nobi, Cloudflare metin modeli ve kural tabanlı geri dönüş; gerçek AI politika/kaynak/konuşma/iletişim/maliyet yönetimi; mobil asistan/teklif/tasarımlar/editör. Nobi gerçek metin modeli çağrısı kullanıcının bildirimine göre bir kez doğrulandı, ADR-002 Ek C (`1bfc60e`) ile kayıtlı; bu oturumda yeni sağlayıcı çağrısı yok.

- [54 ek task](../docs/tasks/tasks-2026-10-09-addendum.md): 43 commit kanıtlı özellik kaydı, 11 bekleyen doğrulama/karar/yapılandırma işi. Önceki 125 kayda ek, toplam 179 task kaydı.
- [İçe aktarılabilir ek CSV](../docs/tasks/tasks-2026-10-09-addendum.csv).
- [Bildirilen doğrulama raporu](../test/2026-10-09/REP-20261009-owner-validation-summary.md): kullanıcı .NET 306/306, mobil 49/49, web/admin TypeScript/lint temiz; Chrome yalıtılmış 5004 API ve Preview göndericiyle denendiğini bildirdi. Son mobil `baf83e4` emülatör doğrulaması eksik. Ham loglar sağlanmadı; sonuçlar yeniden çalıştırılmadı ve faz onayı verilmedi.
- Açık kararlar: D03 geçici 14 günlük iade/iptal kuralları; D07 kabul edilen teklifin siparişe dönüşümü; D10 Nobi konuşmalarının geçici 90 günlük saklanması/aydınlatma. WhatsApp numarası, Firebase mobil projesi ve gerçek Netgsm test erişimi eksik.
- Bilinen test sorunları: Temsilidir/generated vakasında onaylı maske önkoşulu eksik; DevelopmentAcceptedSurfaceTests bir koşu başarısız, tekrar başarılı. İkisi de çözülmüş işaretlenmedi.
- Kullanıcının bildirdiği emülatör 5004'e bağlı; normal kullanımda 5003'e dönüş gerekiyor. Bu kayıt sırasında local servisler, veri, maskeler veya posta kutuları değiştirilmedi.

### Bekleyen işler — bağımsız doğrulama / 09.10.2026

[TST-107](../test/2026-10-09/TST-107-pending-work-validation.md): .NET 306/306, DevelopmentAcceptedSurfaceTests iki odaklı koşuda 18/18, mobil 49/49, Android cihaz testleri 5/5, Temsilidir web 3/3; Flutter analiz ve web build/ilgili lint temiz. Web test kataloğu/maskesi izole edildi (`bf510fc`). Emülatör Tasarımlarım’da kart taşması ve adlandırma controller yaşam döngüsü hatalarını yakaladı; düzeltme ve cihaz testleri `63ac7a4`. Galeri, taşıma, boyut, döndürme, kaplama ve hesaba kaydetme test verisiyle doğrulandı. Normal APK 5003 adresiyle derlenip yüklendi.

ADD-044/052/054 güncellendi. ADD-053 araştırıldı ancak ilk hata yeniden üretilemedi; çözülmüş değil. Firebase mobil SDK/izin/token bağlantısı eksik; proje erişimi/APNs/hizmet hesabı gerekli. Netgsm gerçek test hesabı ve izinli alıcı, WhatsApp numarası, D03/D07/D10 kararları ve insan maske incelemesi bekliyor. Bu kontroller yeni gerçek sağlayıcı çağrısı, gerçek e-posta/SMS teslimi veya faz onayı anlamına gelmez.

### Web e2e’deki 19 hata — giderildi / 09.10.2026

[TST-108](../test/2026-10-09/TST-108-web-regression-resolution.md): güncel tam web paketi **107/107**, atlanan/flaky 0. Web build/TypeScript ve tam lint temiz. Ana sayfa/ürün/teklif takibi/yasal kontrastları, ürün satın alma düğmesi CSS kapsamı ve dar ekranda arama/menü dokunma alanları düzeltildi. Demo kontrollere bağlı testler güncel sunucu sözleşmeleriyle, tarayıcı içi sahte verilerle doğrulanır. Test başlatıcısı doğru API adresleriyle webi yeniden derler; ekran görüntüleri Playwright çıktı dizinindedir. Gerçek posta/AI/ödeme çağrısı yapılmadı; SQL ve migration değiştirilmedi. TST-092’deki 19 hata artık aktif web blokajı değildir.

### SQL bağlantı teşhisi — 09.10.2026

[TST-109](../test/2026-10-09/TST-109-sql-connectivity-diagnosis.md): çalışan API başlangıçta `sql_not_configured`; mevcut Keychain parolası çıktıya yazılmadan ignored Local ayara bağlandı ve servisler yeniden başlatıldı. İlk TCP kontrolü timeout verdi. Kullanıcının istediği tekrar kontrolde mevcut ayarlarla TCP, SQL login ve `XinobiYeniDB` erişimi başarılı; API SQL readiness `ready/ok`. Önceki ağ timeout'unun nedeni bu kontrollerle belirlenmedi. Parola ve yerel ayar commit edilmedi.

### SQL geçişi — ilk migration uygulandı / 09.10.2026

[TST-110](../test/2026-10-09/TST-110-initial-core-migration-application.md): kullanıcı iş sırasına göre başlanmasını istedi. `main` / `c58b28e` üzerinden ilk atomik adım 03.05 uygulandı. Model/script testleri **12/12**; SQL yazımından hemen önce hedef ve metadata yetkisi doğrulandı, kullanıcı tablo sayısı **0**. `0001_InitialCore.idempotent.sql` başarılı; `20261007090524_InitialCore`, **12 çekirdek tablo + 1 geçmiş tablosu**. İkinci uygulama geçmiş/tablo listesini değiştirmedi. API SQL readiness `ready/ok`. Yerel ürün/hesap/sipariş kayıtları aktarılmadı, servis deposu değiştirilmedi. Yedek/restore ve runtime hesap ayrımı henüz tamamlanmadı; faz kabulü verilmedi.

Sonraki tek güvenli adım: mevcut sözleşmeleri koruyan kategori/ürün/varyant/fiyat/stok SQL modelini ve migration'ını hazırlamak; sonrasında SQL depoları ve idempotent yerel veri aktarımı. D02 dış sistem veri sahipliği uydurulmadan mevcut yerel alanlar korunmalı. Uygulama açılışında migration çalıştırılmaz.

### SQL katalog geçişi — kod hazır, yedek doğrulama bekliyor / 09.10.2026

[TST-111](../test/2026-10-09/TST-111-sql-catalog-preparation.md): `main` / `c6838cb` sonrası kategori/ürün/varyant/fiyat/stok + sunum/duyuru için 6 tablolu `20261009120332_CatalogCommerce` migration'ı, idempotent/rollback SQL, transaction/application lock kullanan SQL depo, doğrulanmış/no-op aktarım ve yerel aktivasyon hazır. API testleri gerçek veri/SQL işaretinden izole edildi. Tam .NET **315 geçti / 1 gerçek SQL testi atlandı / 0 başarısız**; JS syntax/diff temiz. Yerel 17 ürün/69 varyant/4 fiyat/6 kategori ve mevcut medya korunacak; dış D02 kararları verilmiş sayılmaz.

Mevcut SQL hedefinin COPY_ONLY/CHECKSUM yedeği başarılı, VERIFYONLY **Msg262 CREATE DATABASE permission denied in master** nedeniyle başarısız. `tools/sql/verify-catalog-backup.sql` DBA'nın yetkili hesabıyla çalıştırılmalı; kullanıcıya soru iletildi. Runbook doğrulanmış yedek şartı sağlanmadan **0002 uygulanmadı, yerel veri aktarılmadı, SQL işareti etkinleştirilmedi**. Uygulama hesabına sunucu yetkisi eklenmedi. Sonraki tek güvenli adım DBA doğrulama kanıtı; ardından migration/boş katalog gerçek SQL testi/aktarımı sırayla uygulamak. Hesap/sipariş ve diğer modüller henüz SQL deposuna geçirilmedi; faz kabulü yok.

### SQL devam — yedek yetkisi sürüyor, hesap/sipariş şeması hazır / 09.10.2026

[TST-112](../test/2026-10-09/TST-112-customer-schema-and-backup-retry.md): `main` / `2a40725` sonrası kullanıcı bekleyen aşamadan devam istedi. Aynı VERIFYONLY tekrarında **Msg262/3013**, çıkış 1; sunucu yetkisi engeli sürüyor, 0002/0003 uygulanmadı. Bağımsız `20261009132316_CustomerIdentityOrders` migration'ı hazır: profil kolonları, 2 hash oturum tablosu, adres ve 2 sipariş tablosu. Tarihsel adres/ürün snapshot'ları, müşteri bazlı idempotency, tek varsayılan adres, rowversion ve tutar kısıtları; ödeme/stok/ürün kararları değişmedi. .NET **321 geçti / 1 atlandı / 0 başarısız**. Yerel 1 hesap ve oturum kayıtları incelendi fakat taşınmadı; gizli değerler rapora alınmadı.

Sonraki tek güvenli canlı adım: DBA'nın `tools/sql/verify-catalog-backup.sql` başarı kanıtı, ardından 0002/gerçek SQL katalog testi/aktarım. Hazırlık işlerinde sonraki adım IAccountStore SQL uygulaması ve kimlik/rol/adres/sipariş aktarımı; 0003 şeması tek başına bu servisleri etkinleştirmez. D10, rol/izin seed'i, runtime hesap ayrımı ve restore provası açık. Faz kabulü verilmedi.

### SQL geçişi — migration'lar uygulandı, yerel veri SQL'de / 09.10.2026

[TST-113](../test/2026-10-09/TST-113-sql-migrations-applied-and-local-data-transferred.md): Proje sahibi, DB boş olduğu için VERIFYONLY beklemeden uygulamayı onayladı (runbook'ta sapma kaydı). 0002, 0003 (`-I` ile) ve yeni 0004 (`ops.FeatureDocuments`) uygulandı; 4 geçmiş kaydı, 24 tablo, tekrar no-op. `SqlAccountStore` + `AccountTransfer`, `DocumentStore<T>` + `FeatureTransfer` eklendi (`1215139`, `4032980`). Gerçek SQL testleri geçti; .NET **322 geçti / 3 atlandı / 0 başarısız**. Onayla katalog (17 ürün/69 varyant), 1 hesap ve Nobi belgesi aktarıldı; üç işaret dosyası yazıldı, yerel API SQL'den okuyor. Açık: medya/tasarım dosyaları diskte, D10, bellek içi e-posta doğrulama, yedek/restore provası. Sıradaki: panel güvenliği, dosya deposu, arka plan işleri, kişiselleştirilmiş ürünün siparişe eklenmesi.

### Panel güvenliği, dosya deposu, arka plan işleri, kişiselleştirilmiş sipariş / 09.10.2026

[TST-114](../test/2026-10-09/TST-114-panel-security-storage-jobs-personalised-order.md): Panel uçları personel oturumu ve rota iznine bağlandı (`12f543c`); sahibin hesabı süper yönetici. `IFileStore` ile medya ve tasarımlar tek depoda, sunucuda `Storage:LocalRoot`; R2/S3 için gerekenler runbook'ta (`fa8d720`). Bildirim kuyruğu sahiplenmeli, işçiler SQL ortamında da çalışıyor, saatlik oturum temizliği (`7db18d6`). Analiz2 adımı: kayıtlı tasarım sepete eklenir, sahiplik/ürün/kişiselleştirme sunucuda denetlenir, görsel siparişe kopyalanır; 0005 uygulandı; web, mobil ve panelde gösterim (`49618a1`, `0fa22a2`). .NET **341/4 atlandı/0**, Flutter 50/50. Açık: kişiselleştirme ücreti, kişiselleştirilmiş iade kuralı, üretim dosyası kontrolü, R2/S3 hesabı, XINOBI U oturumlarının SQL'e taşınması, D10.

Yerel logo promptu düzeltmesi (16.10.2026): [TST-129](../test/2026-10-16/TST-129-photo-specific-logo-mask-prompt.md). Basılı logo çizgisi/fiziksel etiket ayrımı ve renderer alfa sözleşmesi eklendi; marka/renk/konum fotoğraftan incelenir. Build/lint ve browser başarılı; push yok, faz yüzdeleri değişmedi.

Yerel web maske okuma düzeltmesi (16.10.2026): [TST-130](../test/2026-10-16/TST-130-anonymous-approved-mask-preview.md). Commerce-mask GET default-deny 401 sorunu AllowAnonymous ile çözüldü; yönetim korunuyor. 13/13, gerçek ürün önizlemesi hazır/PNG 200; push yok, faz yüzdeleri değişmedi.


### WEB-01 - Gerçek katalog gezinme kabulü / 30.10.2026

[Task kapanışı](../docs/tasks/web-01-catalog-navigation-2026-10-30.md), [TST-136...141](../test/2026-10-30/TST-136-web01-catalog-navigation.md): 24 aktif ürün/8 kategoriyle 390/768/1440 px gezinme kabulü başarılı. URL arama/sıralama ve geri dönüş koruması, kategori kimliği/çakışması, gerçek hata-boş-yükleniyor ayrımı, retry ve silinen/pasif karşılaştırma seçimi düzeltildi. 3 mevcut fixture regresyonu, TypeScript, tam web lint ve statik production build başarılı. İlk çerez paneli kaynaklı test tıklama engeli korunarak raporlandı ve test navigasyon yardımcısı düzeltilerek tekrarlandı. WEB-01 yerel teknik kabul tamamlandı; CAT-01 veri/medya tamlığı, canlı deploy ve resmi UAT kapanmadı. Faz yüzdeleri değiştirilmedi; veri yazımı/migration/APK/sağlayıcı işlemi yok.


### WEB-02 - Ürün detay teknik kabulü / 30.10.2026

[Task / açık veri işleri](../docs/tasks/web-02-product-detail-2026-10-30.md), [TST-142...149](../test/2026-10-30/TST-142-web02-product-detail.md): 24 ürün/79 renk, 390/768/1440 px toplam 237 kontrol başarılı. Renk URL/geçmiş, eksik/geçersiz fiyat ve stok, kesinti/retry, bozuk görsel mesajı, doğru SKU sepeti ve maskesiz renkte açık renk seçimi uygulandı. Üç eksik public dosya yalnız yerele geri getirildi, medya 110/110; gerçek yüzey GET 30/30 hazır. 5+1 fixture regresyonu, TypeScript/lint/build başarılı. Teknik kısım tamamlandı; kullanıcı 23 ürünün açıklama/özelliklerini dosya gelene kadar açık bıraktı. SKU 117 fiyatı da açık, satın alma kapalı. Tüm WEB-02 ticari veri kabulü, canlı yayın veya faz kapanışı iddia edilmez; yüzdeler değiştirilmedi.


### WEB-07 - Web erişilebilirlik teknik düzenlemeleri / 30.10.2026

[Task](../docs/tasks/web-07-accessibility-2026-10-30.md), [denetim matrisi](../design/a11y-audit.md), [TST-150...156](../test/2026-10-30/TST-150-web07-accessibility.md): görünür odak, mobil menü/Nobi/duyuru odak yönetimi, dialog klavye döngüsü, etkin ödeme düğmesi kontrastı ve büyük metin yerleşimleri düzeltildi. 320/390/768/1440 px'de 13 kritik sayfa (52 birleşim), toplam 27 benzersiz test son odaklı tekrarlarla başarılı; gerçek public katalogda 15 axe taraması başarılı. İlk başarısızlıklar ve son tekrarlar raporda korunur. Teknik bölüm tamamlandı; gerçek VoiceOver/TalkBack/fiziksel cihaz/zoom ve QA-03 tasarım/handoff kabulü açık. Faz yüzdeleri, ürün içeriği, ticari veri, API/mobil veya canlı kurulum değişmedi.

## 30.10.2026 — KIS-01 fiziksel baskı profilleri

Ürün/renk/yüz bazlı eksik ölçülü taslak, sürümlü kalibrasyon onayı/kaldırma, geçmiş okuma, mm/DPI/taşma/renk/format/korunan bölgeler ve fiziksel SVG referansı uygulandı. Yeni yerleşim ve siparişler değişmez profil kopyası/SHA alır. Pixel → mm ölçümü yalnız kalibre edilmiş düzlemsel referans içindir; manuel/kavisli üretim şablonuna otomatik baskı çıktısı iddiası yok. `productionReady=false`. Gerçek ürün verisine onay yazılmadı.

[Uygulama ve kullanım](../docs/tasks/kis-01-print-profiles-2026-10-30.md), [test TST-157–166](../test/2026-10-30/TST-157-kis01-print-profiles.md). KAR-05 gerçek ölçüler ve üretim sahibi numune/konum kabulü açık; SQL fiziksel profil kabulü yapılmadı. KIS-05/06/07 üretim onayı/render/indirme ayrı kapsamdır. Web02 için kullanıcıdan beklenen 23 ürün içeriği açık kalır. Faz/PM/üretim kabulü tamamlandı sayılmaz.

## 30.10.2026 - Canlı admin giriş ekranı kontrolü

Kullanıcının doğruladığı canlı /admin/ adresinde yeni Chrome ve uygulama içi tarayıcıda giriş formu görünür; girişsiz oturum/katalog/tasarım okumaları 401. Yeni auth uygulaması veya deploy gerekmedi; hesap/izin değişmedi, parola/MFA denenmedi. Kullanıcının önceki tarayıcısında görünmeme nedeni doğrulanmadı; geçerli oturumun paneli açması mevcut davranış. [TST-167-169](../test/2026-10-30/TST-167-live-admin-login-diagnosis.md).

## 30.10.2026 - Flutter ana sayfa XINOBI U web yerleşim eşliği

Kullanıcının ekran görüntüsündeki eski üst üste kart düzeni, mobil webdeki label/ürün/alt kart satırlarıyla eşlendi. Ürün 300px kendi satırında; soru kartı altta, desen kartı sağ alt hizalı, Temsilidir görünür. İçerik doğal yükseklikte; 320/390/700px ve 2x metinde örtüşme yok. Analiz temiz, 7 odaklı ve 79 tam Flutter testi geçti. [TST-170-174](../test/2026-10-30/TST-170-flutter-home-web-parity.md). Fiziksel cihaz, APK/kurulum veya yayın yapılmadı. KIS fiziksel üretim ve resmi mobil UAT açık kalır.

## 30.10.2026 - Tüm eksik işlerin fazlara aktarımı

120 kapanış taskı Faz01-11 arasında tek ana fazla eşlendi; Faz00 anlık durum/12 faz özeti yenilendi. Müşteri/veri/erişim girdileri, teknik geliştirme ve gerçek kabul işleri ayrıldı; ortak bağımlılıklar task sayısını artırmadan bağlandı. Admin gerçek posta teslimi, 23 ürün/fiyat, WEB-07 cihaz/a11y, KIS-01 ölçü/numune/SQL ve Flutter paket/telefon kurulumu özel alt kayıtlarla açık. [Ana liste](../docs/tasks/project-closure-2026-10-30.md), [denetim/16 commit](../docs/tasks/phase-audit-2026-10-30.md).

[TST-175-178](../test/2026-10-30/TST-175-phase-closure-sync.md): 120/120 görev, 272 yeni yerel link/anchor, tarihsel içerik/rol kabul koruması ve diff/upstream PASS. Yeni uygulama testi, SQL yazımı, sağlayıcı, APK veya deployment yapılmadı; faz/PM onayı ve yüzde üretilmedi.

## 05.11.2026 — Sürat Swagger uyumu

Güncel prova şemasında Iademi boolean, BirimDesi/BirimKg string; outbound JSON bu türlere düzeltildi. Kalıcı/public model korunur. 75 izole Sürat testi geçti; eski belirsiz deneme yeniden gönderilmedi. Eski create yanıtı saklanmadığı için kesin neden yok; Sürat kayıt teyidi, güvenli create teşhis kaydı ve gerçek kabul açık. Ayrıntı: `test/2026-11-05/TST-250-surat-live-schema.md`. Deploy yok.


05.11.2026 — TST-251: Gönderim sonucu için güvenli HTTP durum/kategori kaydı ve attempt geçmişi eklendi; public DTO/otomatik retry davranışı korunur. Eski belirsiz kayıtlara geriye dönük teşhis üretilemez. Ayrıntı: `test/2026-11-05/TST-251-surat-create-diagnostics.md`. Gerçek gönderim/deploy yok.


## 05.11.2026 — SIP-TAS-01…09 güncel regresyon

[TST-252](../test/2026-11-05/TST-252-order-design-regression.md): 36 API PASS / 1 SQL SKIP / 0 FAIL; beş admin tarayıcı paketi, 21 dosya durumu ve 7 eski kayıt senaryosu, dört genişlik/%200 metin, admin build/lint geçti (4 eski lint uyarısı). Yeni uygulama kusuru bulunmadı; kod/veri değiştirilmedi. SQL/IIS/manuel cihaz ve PM kabulü açık; deploy yapılmadı.


## 05.11.2026 — Admin UI/UX denetimi

[TST-253](../test/2026-11-05/TST-253-admin-ux-audit.md): 20/20 izole admin test dosyası PASS; 64 responsive matris satırı, 48 boş/hata/yetki durumu. Sipariş/kargo odaklı denetimde 3 P1 ve 4 P2 bulgu; taslak kaybı, kritik onaylar ve varsayılan sağlayıcı teyidi öncelikli. Bu teslim denetim/önceliklendirme; uygulama düzeltmesi yapılmadı, gerçek veri/deploy yok. Rapor: `design/admin-ux-audit-2026-11-05.md`.


## 05.11.2026 — UI/UX bulguları düzeltme turu

[TST-254](../test/2026-11-05/TST-254-admin-ux-fixes.md): ADM-UX-01…07 için taslak/ayrılma ve busy koruması, kritik işlem özeti/onayı, tarafsız manuel teyit, readonly alanlar, dürüst etiket handoff mesajı ve ortak form düzeni uygulandı. Gerçek veri/sağlayıcı/deploy yok. SQL/IIS/manuel cihaz ve PM kabulü açık. Nihai test sonuçları raporda.


## 05.11.2026 — Yayın öncesi birleşik regresyon

[TST-255](../test/2026-11-05/TST-255-pre-release-regression.md): API 595 PASS / 29 SKIP / 0 FAIL; admin 21/21 dosya + ayrıca üretim profilinde MFA/login/logout testi PASS; web 24/24 e2e, lint/tip ve üretim derlemeleri PASS. Yerel yazılım engeli bulunmadı. Sürat gerçek kabulü, ödeme/sevk uygunluğu, SQL çoklu süreç, IIS/SMTP/cihaz/PM ve yeni repo sunucu erişimi raporda açık. Canlı Sürat kapalı; deploy/paket yayını yapılmadı.


## 05.11.2026 — Doğrulanmış release yayımlandı; IIS bekliyor

[DEPLOY-017](../deployments/DEPLOY-017-validated-release-published.md): `xinobi-d8ea431`, kaynak d8ea43160e9704a90bb756369c2fb5cedb421ae5, yeni özel mostidea/xinobi_new reposunda 3 asset yayımlandı; SHA256/CRC/secret dışlama ve paket admin MFA testi PASS. Yerel prova ayarı/verisi pakete alınmadı. Önceki yayımlanan kaynakla migration farkı yok; DB işlemi yapılmadı. Eski canlı GET smoke 200/anonim admin401. Sunucu erişimi yok; gerçek ayarlar/backup/IIS deployment.json ve sonrası smoke henüz doğrulanmadı. GitHub release, canlı kurulum diye sayılmaz. Yeni repo token/script ve operatör komutu kayıt içinde.


## 06.11.2026 — Kişiselleştirmede tek kaynak fotoğraf/maske planı

Kullanıcı kararı: desenli ürünler için çoklu renk ve renkler arası hizalama gerekmiyor. Güncel revizyon: fotoğraf üretim promptu kaldırılacak; doğrudan yüklenen tek görsel kaynak olacak ve sabit piksel boyutu/en-boy oranı şartı olmayacak. Kaynak indirme ve maskeleme promptu korunacak; prompt boyutu kaynağın gerçek ölçüsünden alınacak, diğer maskeleme kuralları aynen kalacak. Birden fazla görsele aynı maskeyi uygulama/toplu renk onayı kaldırılacak. Maskenin kendi fotoğrafıyla ölçü/koordinat eşliği ve sipariş dosya güvenliği sürecek. Task 01–03 aynı; 04–12 revize edildi. [12 tasklık değişiklik planı](../docs/tasks/personalization-single-source-tasks-2026-11-06.md); bu fazla ilişkili tasklar: **KIS-TEK-01–12**. Hepsi açık; yalnız plan hazırlandı, uygulama/veri geçişi/deploy yapılmadı. Normal ürün renkleri ve tarihsel siparişler korunacak.


## 06.11.2026 — KIS-TEK-01 teknik model teslimi

[ADR-005](../docs/decisions/ADR-005-personalization-single-source.md): ürün başına tek profil, değişmez kaynak/yüzey sürümü ve açık fulfillmentVariantId bağı tanımlandı. SKU/fiyat/stok aynı ürünün seçilen ticari varyantından; ilk varyant/fiyat fallback’i yok. Doğrudan kaynak yükleme, sabit tuval olmadan gerçek ölçü, maske eşliği ve üç sipariş dosyası korunumu tanımlandı. Teknik tanım tamam; işletmenin gerçek ürün/SKU ve fiyat kapsamı kabulü bekliyor, task tamamen kapalı değil. Task 02–12 başlanmadı. Kod/veri/deploy değişmedi.


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


## 06.11.2026 — Sürat destek yanıtı ve örnek JSON uyumu

Sağlayıcı iletilen test referanslarıyla kayıt oluşmadığını teyit etti; başarılı kayıtlara taleple prova hareketi ekleyebileceğini bildirdi. Create isteğine örnekteki boş alanlar ve kapıda tahsilatsız 0/null eklendi. [Yanıt/operatör adımları](../Entegrasyonlar/01-Surat-Kargo/SAGLAYICI-YANITI-2026-11-06.md), [TST-262](../test/2026-11-06/TST-262-surat-provider-support-example.md): 82 Sürat testi PASS; gerçek gönderi/mutabakat/e-posta/deploy yok. Eski kök neden kesin değil; gerçek kabul ve hareket testi açık.

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


## 10.11.2026 — Müşteri hesabı yönetimi

Müşteriler → İncele altında askıya al/yeniden etkinleştir ve ayrı `customers.delete` yetkili hesap silme eklendi. Personel hesapları hedef olamaz; açık onay + silmede SİL, sürüm/işlem kilidi, hata sonrası yeniden okuma ve güvenli audit var. Oturumlar iptal edilir; in-flight checkout da hesap kilidinde aktiflik kontrolünden geçer. Hesap silme `deleted` durumudur; profil, adres, siparişler ve dosyalar korunur, bu ekrandan yeniden açılmaz. [Kullanım ve SQL 0010 önkoşulu](../docs/runbooks/customer-account-management.md), [TST-271](../test/2026-11-10/TST-271-customer-account-management.md). OpenAPI/TS/Dart güncellendi; gerçek SQL migration/çoklu süreç kabulü açık. Yerel File kopyası açık seçilerek çalışır, SQL hatasında fallback yok. Gerçek müşteriye işlem yapılmadı; deploy/APK yok.
