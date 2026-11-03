# Sipariş tasarım detayı - MostGate taskları ve uygulama promptları

03.11.2026 | Kapsam: SIP-TAS-01...09 | Durum: Planlandı, uygulanmadı | Kaynak: d1f5852

Bu doküman yalnız sipariş tasarım detayı planındaki 9 alt taskı içerir; projenin 120 ana taskının tamamını tekrar etmez. MostGate sistemine kayıt açılmadı. Aşağıdaki promptlar ileride kullanılmak üzere hazırlanmıştır; bu oturumda uygulama yapılmaz.

## Kullanım ve kapsam

Her task için önce MostGate konusu ve açıklaması, ardından tek başına kullanılabilecek prompt yer alır. Promptların çoğaltılması taskların uygulandığı anlamına gelmez. Önce bağımlılıkları tamamla; hazır işler sıra içinde paralel ele alınabilir.

Teslim üç ayrı görseldir: ham desen, editörde maskelemede kullanılan ürün kaynak fotoğrafı, giydirilmiş temsili önizleme. Maske PNG dosyası yeni zorunlu indirme değildir. Yerleşim ve dosyalar siparişin kayıtlı revizyonuna bağlı kalır. Üretime hazırlama/gönderme kapsam dışıdır.

[Ana plan](order-design-detail-scope-2026-11-03.md) | [Faz06](../../Prompts/Faz06_Kisisellestirme_Editor_Baski.md)

## İçindekiler

- SIP-TAS-01: Baskı ve operasyon ekranını sipariş tasarım detayına sadeleştirme
- SIP-TAS-02: Siparişe bağlı tasarım dosyalarını ve revizyon bilgisini sabitleme
- SIP-TAS-03: Sipariş detayında müşterinin kayıtlı editör yerleşimini gösterme
- SIP-TAS-04: Sipariş satırındaki ham deseni ayrı dosya olarak indirme
- SIP-TAS-05: Maskelemede kullanılan ürün kaynak görselini ayrı indirme
- SIP-TAS-06: Siparişin giydirilmiş ürün görselini gösterme ve indirme
- SIP-TAS-07: Sipariş tasarım dosyalarında yetki ve işlem durumlarını tamamlama
- SIP-TAS-08: Eski ve eksik sipariş tasarım kayıtlarını doğru gösterme
- SIP-TAS-09: Sipariş tasarım detayının son test ve kabul kaydını oluşturma

## SIP-TAS-01

**MostGate konusu:** Baskı ve operasyon ekranını sipariş tasarım detayına sadeleştirme

**MostGate açıklaması:** Admin panelinde sipariş satırına bağlı sade bir tasarım detay alanı oluştur. Ürün, SKU, renk, tasarım ve kayıtlı yerleşim bilgileriyle üç görsel alanını ayır. Fiziksel profil, kalibrasyon, üretime gönderme ve üretim onay/hazır/red kontrollerini bu ekrandan kaldır. Mevcut sipariş, ödeme ve kargo işlemlerini koru; eski kayıtları silme.

**Faz / ana task:** Faz02 / Faz06 / KIS-07
**Bağımlılık:** Yok

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-01 taskını uygula: Baskı ve operasyon ekranını sipariş tasarım detayına sadeleştirme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz02 / Faz06 / KIS-07. Bağımlılık: Yok.

Yapılacaklar:
- Mevcut PrintOperations, ilişkili sipariş geçişi ve Orders detayını incele; mevcut admin görsel dilini koru.
- Sipariş/ürün/SKU/renk, tasarım adı/türü ve varsa konfigürasyon-revizyon bilgilerini anlaşılır bir hiyerarşiye yerleştir.
- Kayıtlı yerleşim alanı ile Ham desen, Ürün kaynak görseli ve Giydirilmiş önizleme alanlarını birbirinden ayır.
- Fiziksel profil/kalibrasyon ve üretim eylemlerini bu görünür akıştan çıkar; mevcut profil verisini veya geçmiş API kayıtlarını silme.
- Bu task yalnız ekran iskeleti ve mevcut verinin sunumudur. Eksik yerleşim/dosya altyapısını diğer tasklar adına geliştirme. Gerçek veri/indirme hazır değilse açıklamalı eksik durum göster; sahte çalışan buton ekleme.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Ürün/SKU/renk, desen, kayıtlı yerleşim ve üç görsel dosyası bir arada; üretime hazırlama eylemi yok.

Doğrulama: Dar ve masaüstü ekranlarda hiyerarşiyi, üretim kontrollerinin bulunmamasını, sipariş geçişini, geri/ileri ve eski kayıt davranışını izole fixture ile doğrula. Admin lint, TypeScript ve üretim derlemesini çalıştır; temsili görüntüleri incele.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-02

**MostGate konusu:** Siparişe bağlı tasarım dosyalarını ve revizyon bilgisini sabitleme

**MostGate açıklaması:** Desen, editörde kullanılan ürün kaynak görseli ve giydirilmiş önizlemeyi sipariş satırının kaydedilmiş tasarım revizyonuyla ilişkilendir. Tasarım silinse veya katalog görseli değişse bile eski siparişin yerleşimi ve dosyaları değişmesin.

**Faz / ana task:** Faz05 / Faz06 / KIS-03, KIS-07
**Bağımlılık:** SIP-TAS-01

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-02 taskını uygula: Siparişe bağlı tasarım dosyalarını ve revizyon bilgisini sabitleme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz05 / Faz06 / KIS-03, KIS-07. Bağımlılık: SIP-TAS-01.

Yapılacaklar:
- Mevcut sipariş, konfigürasyon revizyonu ve korunmuş desen/önizleme kayıtlarını incele; var olan korumaları yeniden ayrı sistem olarak kurma.
- Sipariş kimliği, satır kimliği/indeksi, ürün/varyant/SKU, tasarım, konfigürasyon revizyonu, yerleşim şeması ve üç dosya referansı için mevcut sözleşmeyi tamamla.
- Desen ve ürün kaynak görselinin doğru sürümlerini, yerleşimi ve kompozisyon referansını sipariş anına bağla. Dosya bütünlüğünü mevcut hash/sürüm yaklaşımıyla doğrula.
- Katalog fotoğrafı, maske veya tasarım sonradan değişince eski siparişe güncel veriyi ikame etme; tasarım silinmesi sipariş dosyalarını bozmamalı.
- Başarısız veya tekrarlanan sipariş denemelerinde yarım dosya bağı ve yanlış revizyon oluşmasını önle. Mevcut idempotency, sahiplik ve sipariş davranışını koru.
- Bu task veri/sürüm bağını kurar; indirme arayüzleri SIP-TAS-04/05/06, kapsamlı dosya erişim kabulü SIP-TAS-07 içindir. Yeni üretim sürümü veya üretim onayı ekleme.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Tasarım silme/yeniden düzenleme, katalog görseli veya maske değişimi eski dosyaları ve yerleşimi değiştirmiyor.

Doğrulama: Tasarım silme/düzenleme, katalog ve maske değişimi, eski revizyon, tekrar istek ve yarım kayıt senaryolarını izole API/dosya fixture testleriyle doğrula. Kalıcılığı izole SQL ortamı varsa ayrıca test et; yoksa açık kabul olarak kaydet. Etkilenen sözleşme ve derleme kontrollerini çalıştır.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-03

**MostGate konusu:** Sipariş detayında müşterinin kayıtlı editör yerleşimini gösterme

**MostGate açıklaması:** Sipariş satırının kayıtlı tasarım revizyonundan tuval boyutu, konum, ölçek, döndürme, yerleşim modu, kavis ve varsa bölgesel ayarları okunabilir biçimde göster. Birimleri belirt; eksik değerleri sıfırla doldurma ve fiziksel baskı ölçüsü hesaplama.

**Faz / ana task:** Faz06 / KIS-03, KIS-07
**Bağımlılık:** SIP-TAS-02

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-03 taskını uygula: Sipariş detayında müşterinin kayıtlı editör yerleşimini gösterme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz06 / KIS-03, KIS-07. Bağımlılık: SIP-TAS-02.

Yapılacaklar:
- Yerleşim alanlarını mevcut kayıtlı şemadan oku; güncel tasarım ekranının geçici durumunu veya varsayılanlarını kullanma.
- Kaynak tuval genişliği/yüksekliği, yatay/dikey konum, ölçek, döndürme, mod, kavis ve varsa gövde/bölge ayarlarını kullanıcı dilinde etiketle.
- Her değerin gerçek birimini ve anlamını koru. Görüntüleme için yüzde dönüşümü gerekiyorsa kayıtlı tuval ölçüsüne dayanarak açıkça etiketle; asıl değeri değiştirme.
- Siparişe bağlı tasarım/konfigürasyon revizyonunu göster; alanların seçilen sipariş satırına ait olduğunu doğrula.
- Eski veya desteklenmeyen şemada kaydı bozmadan açıklama göster. Uygulanmayan ayarı sıfır/aktif gibi sunma.
- Bu task salt okunur sunumdur; yerleşimi değiştirme, mm/DPI/ICC hesabı veya baskıya uygunluk onayı ekleme.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Ekran editörde kaydedilen aynı revizyonu gösteriyor; uygulanmayan/eksik alanlar sıfır gibi sunulmuyor.

Doğrulama: Doğru revizyon, farklı tuval boyutu, gerçek sıfır ile eksik alan ayrımı, bölgesel ayarlar, eski şema ve uzun metni fixture ile kontrol et. 320/390 ve masaüstü görünümde büyük metni incele. Admin lint, TypeScript ve build doğrula.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-04

**MostGate konusu:** Sipariş satırındaki ham deseni ayrı dosya olarak indirme

**MostGate açıklaması:** Kullanıcının yüklediği veya AI ile oluşturduğu ham deseni siparişe bağlı korunmuş kopyasından ayrı indirilebilir yap. Özgün dosya içeriğini ve gerçek türünü koru; ürün fotoğrafını veya giydirilmiş önizlemeyi desen dosyası yerine sunma.

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Bağımlılık:** SIP-TAS-02

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-04 taskını uygula: Sipariş satırındaki ham deseni ayrı dosya olarak indirme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz05 / Faz06 / KIS-07. Bağımlılık: SIP-TAS-02.

Yapılacaklar:
- Mevcut korumalı sipariş desen endpointini ve dosya kopyasını incele; mümkünse mevcut sözleşmeyi tamamla.
- Sunucuda yetkili sipariş/satır bağından doğru korunmuş desen kopyasını çöz. İstemcinin gönderdiği keyfi URL veya dosya yolunu kullanma.
- Gerçek MIME, dosya uzantısı ve anlaşılır dosya adıyla ayrı indirme sağla; içeriği yeniden render ederek değiştirme.
- İndirmeyi yeni sipariş tasarım detayındaki Ham desen alanına bağla; tekrarlı tıklamayı sınırla ve işlem durumunu göster.
- Eksik desen için açık durum, servis hatası için yeniden deneme ver. Güncel tasarımdan veya birleşik önizlemeden yedek içerik üretme.
- Ürün fotoğrafı ve giydirilmiş görsel indirmelerini bu taskta üstlenme; üretim dosyası hazırlama ekleme.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: İndirilen desen doğru sipariş/satır/tasarım sürümüne ait; dosya türü ve adı doğru.

Doğrulama: İndirilen byte/hash, MIME/uzantı, doğru sipariş-satır-revizyon, başka kullanıcı/yetkisiz rol, silinmiş tasarım, eksik dosya ve servis hatasını izole test et. API kontrolleriyle admin lint, tip ve build doğrulamasını tamamla.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-05

**MostGate konusu:** Maskelemede kullanılan ürün kaynak görselini ayrı indirme

**MostGate açıklaması:** Desenin editörde yerleştirildiği doğru ürün, SKU ve renge ait kaynak ürün fotoğrafını ayrı indirilebilir yap. Sipariş anında korunmuş kaynak sürümünü kullan; güncel katalog fotoğrafıyla değiştirme. Bu dosya alfa/PNG maske dosyası değil, ürünün kaynak görselidir.

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Bağımlılık:** SIP-TAS-02

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-05 taskını uygula: Maskelemede kullanılan ürün kaynak görselini ayrı indirme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz05 / Faz06 / KIS-07. Bağımlılık: SIP-TAS-02.

Yapılacaklar:
- SIP-TAS-02 ile kurulan siparişe bağlı ürün kaynak görseli kaydını kullan; katalogdaki son görsele doğrudan bağlanma.
- Kaynağın ürün/varyant/SKU/renk ve editör tuval sürümüyle eşleşmesini doğrula. Desen uygulanmamış gerçek ürün kaynak dosyasını sun.
- Sunucunun güvenilir dosya kaydından çözümle; istemciden gelen URL ile keyfi dış adres veya dosya sistemi okuması açma.
- Gerçek dosya türünü ve içerik bütünlüğünü koruyan indirme sağla; Ürün kaynak görseli etiketiyle arayüze bağla.
- Eski siparişte korunmuş kaynak yoksa indirmenin neden kullanılamadığını açık göster; güncel katalog veya başka renk görselini sessizce kullanma.
- Ayrı maske PNG indirmesini yeni gereksinim olarak ekleme. Mevcut maskeleme özelliğini ve ürün verisini değiştirme.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Dosya editörde kullanılan ürün fotoğrafıyla aynı sürüm ve tuvalde; başka renk veya yeni fotoğraf indirilmiyor.

Doğrulama: Katalog fotoğrafı/renk/maske sonradan değişse de aynı sipariş kaynağının inmesini; byte/hash, dosya türü, yetki ve eksik kaynak durumlarını izole fixture ile doğrula. Kaynak çözümleme için yol aşımı/keyfi URL senaryolarını test et; etkilenen build ve lint kontrollerini çalıştır.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-06

**MostGate konusu:** Siparişin giydirilmiş ürün görselini gösterme ve indirme

**MostGate açıklaması:** Müşterinin kayıtlı yerleşimiyle oluşan ürün üstü kompozisyonu sipariş detayında göster ve ayrı indirilebilir yap. Önizleme doğru sipariş revizyonuna ait olsun; temsili görsel olarak etiketlensin ve baskıya hazır dosya gibi sunulmasın.

**Faz / ana task:** Faz05 / Faz06 / KIS-07
**Bağımlılık:** SIP-TAS-02, SIP-TAS-03

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-06 taskını uygula: Siparişin giydirilmiş ürün görselini gösterme ve indirme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz05 / Faz06 / KIS-07. Bağımlılık: SIP-TAS-02, SIP-TAS-03.

Yapılacaklar:
- Mevcut konfigürasyon önizleme kaydı, siparişe korunmuş kompozisyon ve admin erişim yollarını incele; mevcut korumayı yeniden kurma.
- Kayıt/sipariş akışında oluşturulan dijital kompozisyonu doğru ürün, kaynak görsel, maske ve kayıtlı yerleşim revizyonuyla ilişkilendirip koru.
- Eksik koruma veya admin erişimini mevcut sözleşmeler içinde tamamla. Daha sonra güncel katalog/tasarım üzerinden eski siparişi sessizce yeniden giydirme.
- Giydirilmiş önizleme alanında gerçek kompozisyonu göster; aynı dosyanın ayrı indirmesini sağla ve Temsilidir açıklamasını koru.
- Ham desen ile kompozisyonu karıştırma. Eski siparişte kompozisyon saklanmadıysa bunu açık göster; ham deseni giydirilmiş görsel diye sunma.
- Dijital önizlemenin gerektiği kayıt adımı bu taskın içindedir; fiziksel baskı renderı, yüksek DPI/ICC çıktısı, üretim kuyruğu veya üretim onayı değildir.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Görünen ve indirilen kompozisyon aynı sipariş revizyonuna ait; temsili önizleme etiketi var, baskıya hazır dosya iddiası yok.

Doğrulama: Gösterilen ve indirilen kompozisyonun byte/hash ve sipariş revizyonu eşliğini, desen silinmesi ve sonraki düzenleme bağımsızlığını doğrula. Eksik/bozuk önizleme, yetki ve tekrar indirme durumlarını test et; etkilenen web/admin/API kontrollerini çalıştır.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-07

**MostGate konusu:** Sipariş tasarım dosyalarında yetki ve işlem durumlarını tamamlama

**MostGate açıklaması:** Üç görsel indirmesinin sipariş ve satır bazlı sunucu yetkilerini doğrula. Yüklenme, indirme sürüyor, eksik dosya, yetkisizlik, servis hatası ve yeniden denemeyi ortak arayüz diline getir. Yetkisiz dosya erişimini ve hatalı başarı bildirimini engelle.

**Faz / ana task:** Faz03 / Faz06 / SEC-07, KIS-07
**Bağımlılık:** SIP-TAS-04, SIP-TAS-05, SIP-TAS-06

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-07 taskını uygula: Sipariş tasarım dosyalarında yetki ve işlem durumlarını tamamlama.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz03 / Faz06 / SEC-07, KIS-07. Bağımlılık: SIP-TAS-04, SIP-TAS-05, SIP-TAS-06.

Yapılacaklar:
- SIP-TAS-04/05/06 yollarını ve mevcut admin sipariş okuma/dosya izinlerini uçtan uca denetle; rol CRUD sistemi ekleme.
- Dosya kimliğini güvenilir sipariş/satır/revizyon bağıyla çöz. Sadece istemcinin görünürlüğüne güvenme; her istekte sunucu izni uygula.
- Oturum yok, yetki yok, sipariş/satır bulunamadı, kayıtlı dosya yok ve servis kullanılamıyor durumlarını mevcut güvenli hata sözleşmesiyle ayır.
- Arayüzde indirme sürerken tekrar gönderimi sınırla, başarısız istek sonrası yeniden deneme sun; tarayıcının dosyayı diske yazdığını doğrulamadan böyle bir başarı iddiası üretme.
- Keyfi URL/path okuma, başka siparişin dosyasına erişim ve özel dosyanın açık/statik adrese sızması risklerini kapat. Mevcut güvenli indirme/audit yaklaşımını koru.
- Bu task önceki dosya tasklarının temel yetki kontrolünü erteleme gerekçesi değildir; tüm dosya yolları ilk eklendiklerinde de korumalı olmalıdır.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Yetkisiz kullanıcı dosya alamıyor; erişim denetimi sipariş/satır bağına göre; hata veya eksik kayıt başarı görünmüyor.

Doğrulama: Anonim, müşteri, uygun/uygunsuz personel rolü ve oturumu süresi dolmuş istekleri her üç dosyada izole doğrula. Başka sipariş/satır, 404/403/503, bağlantı kesintisi, hızlı tekrar ve odak/duyuru kontrollerini çalıştır. İlgili güvenlik ve admin regresyonlarını tamamla.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-08

**MostGate konusu:** Eski ve eksik sipariş tasarım kayıtlarını doğru gösterme

**MostGate açıklaması:** Yerleşim, korunmuş ürün fotoğrafı veya giydirilmiş önizlemesi olmayan eski siparişleri açık mesajlarla göster. Olmayan dosyanın indirmesini kapat; güncel tasarımdan eski yerleşim tahmin etme veya ham deseni kompozisyon olarak sunma.

**Faz / ana task:** Faz05 / Faz06 / KIS-03, KIS-07
**Bağımlılık:** SIP-TAS-02, SIP-TAS-07

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-08 taskını uygula: Eski ve eksik sipariş tasarım kayıtlarını doğru gösterme.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz05 / Faz06 / KIS-03, KIS-07. Bağımlılık: SIP-TAS-02, SIP-TAS-07.

Yapılacaklar:
- Eski kayıt varyasyonlarını envanterle: yalnız desen, yerleşimi eksik, ürün kaynağı eksik, kompozisyonu eksik ve desteklenmeyen şema.
- Her görsel ve yerleşim alanını bağımsız değerlendir; bir dosya eksik diye mevcut diğer doğru indirmeleri gizleme.
- Eksik veri ile servis/erişim hatasını ayır. Kayıt yoksa eski sipariş için saklanmadığını belirt; servis hatasında henüz kayıt yok sonucuna varma.
- Güncel katalog görseli veya yeni tasarım revizyonundan eski değerleri uydurma; fiziksel ölçü/varsayılan sıfır ekleme.
- Geri doldurma yalnız aynı sipariş sürümüne ait kanıtlanabilir kaynağa dayanabilir. Gerekirse salt okunur önizleme/dry-run ve geri dönüş planı hazırla; bu task kapsamında gerçek iş kayıtlarına toplu veri değişikliği uygulama.
- Arayüzde kullanılamayan indirme için anlaşılır neden ver; doğrulanmış mevcut desen veya görsel için erişimi koru.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Eski/eksik kayıtlar ekranı bozmaz; olmayan dosyanın indirmesi kapalı ve nedeni anlaşılır.

Doğrulama: Eski/eksik/kısmi verili fixture matrisiyle her alanın mesajını ve buton durumunu test et. Kaynak yokken fallback yapılmadığını, servis hatasının boş kayıt sayılmadığını ve geçerli dosyaların indirilebildiğini doğrula. Admin lint, tip/build ve ilgili API testlerini çalıştır.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```

## SIP-TAS-09

**MostGate konusu:** Sipariş tasarım detayının son test ve kabul kaydını oluşturma

**MostGate açıklaması:** Yeni sipariş tasarım detayını yerleşim ve üç görsel indirmesiyle birlikte doğrula. Doğru sipariş revizyonu, eski kayıtlar, izinler, servis hataları ve dar ekran kullanımını test et. Üretim kontrollerinin bulunmadığını doğrula; teknik test ile gerçek kullanıcı kabulünü ayrı kaydet.

**Faz / ana task:** Faz02 / Faz06 / Faz11 / KIS-03, KIS-07, QA-03
**Bağımlılık:** SIP-TAS-01...08

### Uygulama promptu

```text
Xinobi projesinde SIP-TAS-09 taskını uygula: Sipariş tasarım detayının son test ve kabul kaydını oluşturma.

Başlangıç: AGENTS.md, Faz00, ilgili faz kayıtları ve docs/tasks/order-design-detail-scope-2026-11-03.md dosyasını oku. Git durumunu kontrol edip mevcut kullanıcı değişikliklerini koru. Bağımlılıkları kod/test üzerinden doğrula; eksik önkoşulları açıkça kaydet.

Faz / ana task: Faz02 / Faz06 / Faz11 / KIS-03, KIS-07, QA-03. Bağımlılık: SIP-TAS-01...08.

Yapılacaklar:
- SIP-TAS-01...08 durumunu kaynak ve test kayıtlarından doğrula; eksik taskı bu son test işi içinde sessizce tamamlandı sayma.
- Sipariş/satır/ürün/SKU/renk/konfigürasyon revizyonu ile yerleşim ve üç dosyanın kimlik/içerik eşliğini test et.
- Silinen/düzenlenen tasarım, değişen katalog/maske, eski şema, eksik dosya, yanlış rol, kesinti, hızlı tekrar ve yeniden deneme senaryolarını kapsa.
- Admin ekranını 320/390/768/1440 px ve kritik alanlarda %200 metinle kontrol et; klavye, odak, etiket, durum duyurusu ve indirme erişimini incele.
- Üretime gönder, fiziksel profil/kalibrasyon, üretim onay/red ve baskı render kuyruğu eylemlerinin yeni akışta bulunmadığını doğrula.
- Sipariş dosyası kalıcılığı/restart ve revizyon bağı için izole SQL kabulünü ayrı çalıştır veya ortam yoksa açık bırak. Gerçek cihaz/ekran okuyucu ve iş sahibi kabulünü otomasyonla yapılmış sayma.

Kurallar: Yalnız bu taskın gerektirdiği admin/web/API alanlarında çalış. Mevcut sipariş, ödeme, kargo, iade, URL ve revizyon davranışını koru. Gerçek hesap/sipariş/katalog verisini test amacıyla değiştirme; izole fixture kullan. Özel dosyalarda sunucu yetkisini ilk adımdan uygula. Üretime hazırlık/gönderim, fiziksel profil/kalibrasyon, baskı render kuyruğu veya ayrı üretim onayı ekleme. Flutter geliştirmesi, hosting, deployment ve APK işlerine geçme.

Kabul koşulu: Üç indirme ve yerleşim doğru sürümle eşleşiyor; üretim eylemi yok; gerekli regresyon/erişilebilirlik ve kullanıcı kabulü kanıtlı.

Doğrulama: İlgili mevcut admin/web/API regresyonlarını ve gerekli odaklı testleri çalıştır. Etkilenen alanlarda lint, TypeScript/.NET derleme kontrollerini yap. Ekran bazlı kontrol edildi/düzeltildi/açık matrisi ve temsili görseller hazırla; açıklar için neden ve kapanış koşulu yaz.

Teslim: Sonuçları test/INDEX.md, tarihli rapor, Faz00 ve ilgili faz/task kayıtlarına işle. Sadece bu taskın doğrulanan kısmını tamamlandı işaretle; diğerlerini yapılmış sayma. Gerçek kabulü yapılamayan noktaları açık bırak. Repo iş akışına göre doğrulanmış değişiklikleri commit edip push et. Son yanıtta değişiklikleri, test sonuçlarını ve kalanları kısa belirt.
```
