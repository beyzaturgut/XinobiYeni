# XINOBI U tasarım yönü ve cevap kuralları

**27.10 yerel OCR güncellemesi:** Yeni AI adayları yayımlanmadan Tesseract ile tam görsel/köşe taramasından geçer. Şüpheli yazı/imza izinde en fazla bir ek aday; OCR hatasında kontrolsüz görsel yayımlanmaz. Eşya denetimi eklenmedi. Eski v2/v3/v4 metinlerindeki OCR yok ifadeleri tarihsel kalır. [İşletim ve kurulum](runbooks/tesseract-artwork-gate.md).

## Güncel estetik yön — 27.10.2026 / xinobi-art-direction-4

V3 renk rolleri ve motif hiyerarşisi korunur. V4 rafine motif konturları, kontrollü çizgi kalınlığı, dengeli görsel ağırlık ve ana konturdan ince yardımcı çizgiler ister. Minimal/geometri/İskandinav teknik tarifleri tutarlı ince konturlarla güncellendi. Model ve steps=4 aynı. Bu estetik değişiklik OCR/nesne denetimi değildir; yazı/imza/eşya bulunmaması garanti edilmez. Görselin Cloudflare görsel anlama modeline gönderilmesi kullanıcı tarafından reddedildi. Yerel denetim seçenekleri değerlendirildi; üretim sonrası kontrol henüz uygulanmadı.


## Güncel sürüm — 27.10.2026 / xinobi-art-direction-3

İlk kalite denemesi için mevcut beş soru ve seçenek kimlikleri korunur. Prompt motif → sanat yönü/teknik → renk rolleri → kompozisyon/ruh hâli → görsel hiyerarşi sırasıyla kurulur.

- Zemin, ana motif, destek ve az miktardaki vurgu rengi açıkça ayrılır. Minimal/İskandinav üç, diğer stiller dört ana renkle sınırlıdır; monokrom beyaz zemin/kömür grisi motif olarak kalır. Mavi palette zemin warm white, ana motif navy olarak düzenlendi.
- Büyük biçimler ana ritmi, küçük biçimler yardımcı detayı taşır. Kompozisyon kümeler ve açık kanallarla yönlendirilir. Tek odaklı seçimde bir baskın form, yalnız repeat seçiminde karşılıklı kenar eşleşmesi istenir.
- Minimal/İskandinav sadeliğini korur; yoğun seçim karmaşık detay yerine basit motif ritmini artırır. Suluboya pigmenti, gravür taraması ve diğer tekniklerin karakteri korunur.
- Orman/bahçe motifleri daha belirgin sap, yaprak, büyük-küçük çiçek ilişkisiyle; okyanus geniş dalga, katmanlı akış ve ince köpük çizgileriyle tarif edilir. Küçültüldüğünde okunabilen siluet ve boşluklar istenir.
- Uzun eşya/yazı yasak listesi kaldırıldı. Tuvalin yalnız seçilen doğa motifleri ve zeminle oluştuğu olumlu olarak belirtilir; kısa text-free, unlettered, unbranded, unsigned, watermark-free, borderless kapanışı korunur. Bu talimatlar yazı/nesne bulunmayacağı garantisi değildir. OCR/nesne tespiti bu değişiklikte eklenmedi.

Model FLUX.1 schnell, steps=4 ve tek sonuç aynı kalır; prompt etkisi üretim ayarıyla karıştırılmaz. Gerçek referans görsel gönderilmez. Eski görseller ve kuyrukta saklanmış promptlar değişmez; v3 için yeni bir üretim gerekir. Sunucuda kullanmak için güncel API kurulmalıdır; commit/push canlı deploy değildir.

### İlk görsel değerlendirme

Yerel API güncel kaynakla yeniden başlatıldıktan sonra XINOBI U üzerinde yeni anket/üretim başlatın. İlk turda bahçe/İskandinav/yeşil/seyrek/sakin; okyanus/gravür/mavi/yoğun/enerjik; bahçe/suluboya/pastel/katmanlı/düşsel gibi farklı kombinasyonlardan ekranda sunulanları deneyin. Birden fazla örnek inceleyin; rastgele tek sonuçla eski-yeni kalite farkına karar vermeyin. Her örnekte cevapları, oturum kimliğini ve ham desen + ürün önizlemesini birlikte değerlendirin. Yazı/eşya varlığı, stile uyum, renk dağılımı, motif hiyerarşisi ve ürün üzerindeki okunabilirlik için geçti/kaldı + kısa not tutun. Estetik kalite ancak bu üretimlerden sonra değerlendirilir. Bu kod oturumunda ücretli üretim yapılmadı.

Doğrulama: [prompt v3 test kaydı](../test/2026-10-27/TST-art-direction-v3.md).

## Tarihsel sürüm — v2 / 25.10.2026

25.10.2026: istem sürümü `xinobi-art-direction-2`. Amaç ürün fotoğrafı değil,
ürün üzerine daha sonra uygulanacak bağımsız iki boyutlu desen üretmektir.
Modelin kullanım bağlamından eşya veya marka yazısı türetmesini azaltmak için
olumlu tarifte marka, ev aleti koleksiyonu ve mutfak kullanım bağlamı bulunmaz.

## Cevapların tasarıma dönüşmesi

Mevcut beş soru ve seçenek kimlikleri korunur. Doğa motifleri, renk paleti,
kompozisyon, ruh hâli ve çizim tekniği ayrı tarif edilir.

- Minimal/İskandinav: sade şekiller, bir motif ailesi, en fazla iki motif ölçeği ve
  üç ana renk. Zengin/katmanlı yoğunlukta basit motiflerin ritmi artar; %45–55 sakin
  zemin ve en fazla tek şekil katmanı korunur.
- Suluboya: görünür pigment ve saydam boya geçişleri; botanik seçiminde yaprak ve
  çiçek resimleme, diğer doğa temalarında akışkan boyama.
- Gravür: ince oyma çizgileri ve tarama; zengin/katmanlı seçimde ayrıntılı konturlar.
- Mürekkep: el çizgisi ve değişken çizgi kalınlığı; ayrıntı yoğunluk seçimine bağlıdır.
- Geometri, retro ve soyut kendi şekil, doku ve kompozisyon karakterlerini korur.
- Minimal olmayan zengin/katmanlı tasarımlar ayrıntılı motiflere izin verir; tüm
  stillere zorunlu sadelik, düz dolgu veya iki katman sınırı uygulanmaz.
- Diğer stillerde en fazla dört ana renk; aynı palet içinde ton geçişleri mümkündür.
  Monokrom her durumda beyaz ve kömür grisi olarak kalır.
- Seyrek, dengeli, zengin, tek odak, akış, tekrar, asimetri ve katman kompozisyonları
  ayrı kurallara sahiptir. Yalnız tekrar seçiminde kesintisiz döşeme istenir.

## İstenmeyen içerik

Tüm istemlerde ürünler, ev aletleri, mutfak eşyaları, fincanlar, çaydanlıklar,
mobilya, iç mekân, ürün maketi ve 3D nesneler açıkça yasaklanır. Yazı, harf, rakam,
logo, tipografi, etiket, açıklama, imza, filigran ve çerçeve de yasaklanır.
Olumlu tarif yalnız seçilen doğa motiflerini çizmesini ister.

Bunlar modele verilen talimatlardır. OCR veya nesne denetimi eklenmedi; çıktıda
istenmeyen içerik bulunmayacağı ya da estetik kalitenin artacağı garanti edilmez.
Kalite yeni üretilen görseller ve ürün üzerindeki önizlemelerle değerlendirilmelidir.

## Kapsam ve doğrulama

`DesignArtDirection` sabit seçenek kimliklerini kurallara çevirir. `QuestionBank`
soru/cevap eşleşmelerini doğrular. Yeni üretimlerin tamamlanan istemi ve istem sürümü
kaydedilir. Eski görseller ve kuyrukta kayıtlı eski istemler değiştirilmez; yeni
kurallar için deploy sonrasında yeni bir üretim başlatılmalıdır.

Model (FLUX.1 schnell), dört adımlı üretim, kota ve tek sonuç davranışı değişmedi.
Referans görseller sağlayıcıya gönderilmez. Testler minimal/yoğunluk çakışmasını,
çizim tekniklerini, konu/yazı yasaklarını, kayıtlı istemi ve 32.768 cevap birleşiminin
2.048 karakter sınırına uymasını kapsar. Üretim testleri sahte sağlayıcı kullanır;
ücretli görsel üretimi veya görsel kalite değerlendirmesi yapılmaz.

Bu değişiklik kaynak koddadır; canlıya uygulanması için API deploy'u gerekir.

Yerel seçeneklerin kanıt ve sınırları: [yerel denetim değerlendirmesi](runbooks/local-artwork-review.md).
