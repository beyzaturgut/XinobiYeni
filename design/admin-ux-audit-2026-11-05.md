# Admin UI/UX denetimi — 05.11.2026

Kapsam: sipariş listesi/detayı, sipariş tasarım dosyaları (baskı), Sürat gönderi/takip ve bağlantı ekranı. Kullanıcı denetim ve önceliklendirme istedi; bu teslim bulgu/kanıt kaydıdır, uygulama düzeltmesi değildir. Başlangıç main/cbf0153, temiz ağaç. Gerçek hesap/sipariş/sağlayıcı değiştirilmedi; deploy yok.

## Öncelikli bulgular

| ID | Öncelik | Bulgu / kanıt | Etki | Kapanış koşulu |
|---|---|---|---|---|
| ADM-UX-01 | P1 | Kaydedilmemiş müşteri notu uyarısız kayboluyor. Sentetik siparişte not yaz → X ile kapat → aynı siparişi aç: boş not, 0 onay. Orders.tsx open alanları sıfırlıyor, close dirty kontrolü yapmıyor. | Operatörün yazdığı bilgi kaybı; notun gönderildiği sanılabilir. | X/Escape/modül geçişi için dirty kontrolü; kal/ayrıl veya siparişe bağlı taslak koruma. Notun tek başına kaydedilmediği açık olsun. |
| ADM-UX-02 | P1 | Kargo oluşturma paket/ücret/alıcı özeti olmadan tek tıklamada POST gönderiyor. Tarayıcı fixture: 1 POST, 0 onay. Manuel kargoya ver, teslim edildi, iptal/iade talebini onayla/reddet/tamamla da ikinci inceleme olmadan çalışıyor (kaynak incelemesi). | Yanlış işlem veya yanlış paket/borçlandırma seçimi. Server idempotency yanlış ilk işlemi önlemez. | Dış sisteme yazma ve kritik durum değişimlerinde sipariş/ortam/sonuç özetli onay; vazgeçmede 0 POST, onayda tek POST. Doğrudan sipariş iptali ve sağlayıcı mutabakatında zaten confirm var. |
| ADM-UX-03 | P1 | Belirsiz kayıtta teyit sonucu varsayılan registered / “Kayıt oluşmuş”. Tarayıcıyla doğrulandı. | Kullanıcı bunu sağlayıcıdan dönmüş sonuç zannedebilir; önceki oturumdaki kullanıcı sorularıyla da tutarlı. Sunucu kanıt ve UI confirm ister; otomatik kayıt kabulü değildir. | Başlangıç seçimi boş olsun; sonuç seçmeden kaydetme kapalı. “Sürat’ten alınan manuel teyit” ve boş takip yokluk kanıtı değildir açıklaması alan yanında. |
| ADM-UX-04 | P2 | Salt okunur kullanıcıda koli/desi/kg/ücret alanları düzenlenebilir; submit kapalı. Tarayıcı isEditable=true, submitDisabled=true. | Kaydedilemeyecek formda emek ve yetki belirsizliği. Yetki aşımı kanıtı değil. | Alanları readonly/disabled veya açıklamalı özet yap; yetki gerekçesi görünür kalsın. |
| ADM-UX-05 | P2 | Test etiketi mesajı “indirildi” diyor; tarayıcının diske kaydettiği doğrulanamaz. SuratShipment.tsx download. Tasarım dosyalarında doğru “tarayıcıya verildi” metni mevcut. | Bir dosyanın kayıt durumunda iki farklı başarı anlamı. | Kargo etiketi mesajını dosya teslimiyle aynı dürüst metne getir; hata anında başarı yok. |
| ADM-UX-06 | P2 | Sipariş ve kargo işlemi sürerken dialog X/Escape ile kapanabiliyor; close busy/lock kontrol etmez. İşlem kaydı devam ederken kullanıcı görünür geri bildirimi kaybeder. Kaynak incelemesi; gerçek yazma denenmedi. | İşlem yarım kaldı sanılıp başka siparişle tekrarlanabilir. | İşlem sürerken açıklamalı kapanış koruması veya kapanınca görünür kalıcı işlem durumu; sekme değişince başarı/hata kaybolmasın. |
| ADM-UX-07 | P2 | Sürat mutabakat formunda catalog-form sınıfı yok; select/textarea kenar boşluğu ve alan gruplaması gönderi formundan farklı. 320 px sentetik ekranda aksiyonlar arka arkaya yoğun. | Uzun dialogda paket, manuel teyit ve manuel sevk ayrımı zorlaşıyor. | Mutabakatı ortak form/fieldset ile grupla; alanlar ve aksiyonlar hizalı, 320 px/%200 metin ve klavyede kullanılabilir olsun. |

P1: sonraki düzeltme turunda önce ele alınmalı. P2: kullanım ve geri bildirim iyileştirmesi. Bu denetimde kanıtlanmış P0 yetki/veri bütünlüğü açığı yok; bu ifade bütün adminin güvenlik kabulü değildir.

## Kontrol matrisi

| Alan | Sonuç / sınır |
|---|---|
| Sipariş tablo ve filtreler | Arama/durum/kişiselleştirme filtreleri ve temizleme mevcut. Filtre boşluğu ile hiç sipariş olmaması ayrılıyor. Kaydırılabilir tablo klavye odağına açık. |
| Liste yüklenme/hata/yetkisizlik | Ortak izole durum senaryolarıyla denetlenir; hata yerine boş başarı gösterilmemesi kontrolü. |
| Sipariş dialog ve klavye | AdminDialog native modal ve Tab döngüsü; X/Escape sonrası tetikleyiciye odak dönüşü var. Dirty ve busy kapanışı yukarıda açık. |
| Baskı/tasarım | Önceki aynı gün TST-252: üç ayrı dosya, kayıtlı yerleşim, 404/403/503/ağ/oturum/tekrar durumları; dört genişlik/%200 metin; otomatik erişilebilirlik geçti. Bu denetimde uygulama kodu değişmedi. |
| Kargo | Ayar tanımlı ile gerçek bağlantı/kabul ayrılıyor; boş/şube kabulü bekleme/servis hatası ve eski veri ayrımı, belirsiz sonuçta yeniden gönderim engeli mevcut. |
| Form ve başarı durumları | Alanlar create hatasında korunur; tek istek kilidi var. Note kapanışı, kritik işlem onayı ve etiket başarı dili açık. |
| Gerçek cihaz/ekran okuyucu | Çalıştırılmadı; axe/Chrome klavye testi bunların kabulü değildir. |

## Sonraki iş sırası

1. ADM-UX-01: siparişe bağlı taslak ve ayrılma koruması.
2. ADM-UX-02/03: kritik işlem özeti ve manuel sağlayıcı teyidinin tarafsız başlangıcı.
3. ADM-UX-06: işlem sürerken kapanış/geri bildirim.
4. ADM-UX-04/05/07: readonly alanlar, dosya başarı metni ve mutabakat formu düzeni.
5. Odaklı düzeltme regresyonu → yayın öncesi teknik kontroller → ayrıca yetkili deploy → canlı smoke ve PM kabulü.

İlgili test kanıtı: test/2026-11-05/TST-253-admin-ux-audit.md. Gerçek işletme işlemlerine ve yeni üretim/baskı akışına geçilmedi.
