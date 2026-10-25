# XINOBI U tasarım yönü ve cevap kuralları

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
