# Aynı hizada renk fotoğrafı üretme istemi

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


> **06.11.2026 — Tarihsel belge; güncel iş akışı değildir.** KIS-TEK-04 ile fotoğraf üretim promptu admin panelden kaldırıldı. Kişiselleştirme kaynağı doğrudan yüklenir; sabit piksel boyutu ve çoklu renk fotoğrafı üretimi gerekmez. Güncel kullanım: [tek kaynak yönetimi](personalization-source-management.md). Aşağıdaki eski istem yalnız geçmiş kayıt olarak korunur.

Amaç: Elde yalnızca bir ana görsel varken, ürünün bütün renklerini aynı tuvalde, aynı konum ve ölçekte, beyaz arka planlı fotoğraf olarak ürettirmek. Böylece admin panelde tek ortak maske **Seçilen renklerde onayla** ile her renge hizalama gerekmeden uygulanır ([guided-shared-product-mask.md](guided-shared-product-mask.md)).

## Kullanım

1. Ana görseli görsel üretim aracına ekleyip aşağıdaki istemi tek mesajda gönder. Başka ürün için ürün adını, renkleri, hex değerlerini ve dosya adlarını değiştir; tuval boyutunu 5 görselde aynı tut.
2. Çıktıları ilgili renk varyantlarına yükle. Panel yalnız referansla aynı piksel boyutundaki renkleri ortak maskeye açar.
3. Referans renkte taslak maske hazırla (onaylama), diğer renkleri **Önizleme rengi** ile kontrol et, gerekirse kaydırma/ölçek/dönüş ayarlarıyla düzelt ve **Seçilen renklerde onayla**.

Araç 5 görseli tek seferde üretmekte zorlanırsa önce yalnız 1. görseli iste; sonra o görseli ekleyip “bu görselin üzerinde yalnızca gövde rengini [renk / hex] yap, başka hiçbir şeyi değiştirme” diye renkleri tek tek iste. Üretilen görseller gerçek ürün fotoğrafı değildir; tonları gerçek ürünle karşılaştır.

## İstem — Elektrikli Çay Makinesi CM 111-115

Renk değerleri yerel katalogdaki varyant hex kodlarıdır (20.10.2026).

```text
Eklediğim ANA GÖRSELDEKİ ürünün (Elektrikli Çay Makinesi CM 111-115) beyaz arka planlı katalog fotoğraflarını 5 renkte üret. Bu 5 fotoğraf aynı desen maskesiyle üst üste kullanılacak. Bu yüzden ürünün konumu, boyutu ve şekli 5 görselde de piksel düzeyinde birebir aynı olmalı; aralarındaki tek fark gövde rengi olmalı.

GİRDİ
- Elimde yalnızca bu ana görsel var. Ürünün şeklini, oranlarını, parçalarını ve logosunu buradan al.
- Ana görselde başka nesneler, dekor, arka plan veya farklı bir açı varsa onları alma; yalnızca ürünü kullan.

ÇIKTI TUVALİ (5 görselde aynı)
- Boyut: tam 1333 × 2000 piksel (genişlik × yükseklik), dikey.
- Arka plan: düz, saf beyaz #FFFFFF. Gradyan, doku, zemin çizgisi, yansıma yüzeyi veya sahne olmasın.
- Gölge: ya hiç olmasın ya da ürünün altında çok hafif, yumuşak bir temas gölgesi olsun; 5 görselde aynı yerde ve aynı biçimde.
- Ürün yatayda tam ortada dursun. Ürün (kulp ve kapak dahil) tuval yüksekliğinin yaklaşık %80'ini kaplasın. Üstte ve altta yaklaşık 200'er piksel boşluk kalsın. Ürünün hiçbir kısmı tuvalden taşmasın veya kırpılmasın.
- Kamera açısı, perspektif ve ürünün dönüş yönü ana görseldeki gibi olsun. Ürünü aynalama, döndürme ya da farklı açıdan çizme.

ÜRETİM SIRASI (hizanın tutması için önemli)
1. Önce yukarıdaki kurallarla 1. görseli (Metalik gümüş) üret. Bu görsel KALIP olacak.
2. Kalan 4 rengi sıfırdan üretme. Kalıp görselin üzerinde yalnızca gövde rengini değiştir. Ürünün konturu, konumu, boyutu, kulpu, kapağı, tabanı, logosu, gölgesi ve ışık yönü kalıpla birebir aynı kalsın.

RENKLER (bu sırayla, her biri ayrı dosya)
1. Metalik gümüş — #D0D0D0
2. Metalik lacivert — #29456C
3. Rose gold — #D39484
4. Metalik kırmızı — #ED3641
5. Antrasit gri — #545454
Hex değeri gövdenin ana tonudur. Metalik yüzey olduğu için parlama ve gölgelenme bu tonun açık ve koyu versiyonlarıyla doğal görünsün, ama parlama noktaları 5 görselde aynı yerde olsun. Siyah plastik kulp, kapak düğmesi, taban ve metal halka gibi gövde dışı parçalar 5 görselde aynı renkte kalsın; yalnızca gövde rengi değişsin.

LOGO VE YAZI
- Ana görseldeki logo veya yazı neyse aynen koru: yeri, boyutu ve çizgileri değişmesin. Okuyamadığın yazıyı uydurma, yeni logo ekleme.
- Logonun rengi 5 görselde de ana görseldeki gibi kalsın.

YASAKLAR
- Ürünü 5 görselde farklı boyutta, farklı konumda veya farklı açıda üretme.
- Arka plana nesne, metin, filigran, çerçeve veya renkli zemin ekleme.
- Ürünün modelini, oranlarını veya parçalarını değiştirme.

ÇIKTI FORMATI
- Her görseli WebP formatında ver. Kayıpsız (lossless) WebP kullan; kayıplı sıkıştırma beyaz arka planda ve ürün kenarlarında renk sapması ve kenar bozulması yaratır, 5 görsel arasında fark oluşturur.
- Kayıpsız WebP üretemiyorsan en az %95 kalitede WebP ver ve bunu açıkça belirt.
- Saydamlık (alfa kanalı) kullanma; arka plan opak saf beyaz #FFFFFF olsun.
- Dosyayı yeniden ölçekleme veya küçültme; WebP dosyası da tam 1333 × 2000 piksel olmalı.

TESLİM ÖNCESİ KONTROL
- 5 görsel üst üste konduğunda (konum 0,0, ölçek 1, dönüş 0) ürün sınırları, kulp, kapak ve logo aynı piksellere denk gelmeli.
- Her dosyanın gerçek boyutu 1333 × 2000 piksel ve formatı WebP olmalı. Arka plan her yerde #FFFFFF olmalı.
- Bunu sağlayamıyorsan (örneğin farklı çözünürlükte ya da başka formatta üretiyorsan veya ürün görseller arasında kayıyorsa) sonucu tamamlanmış gibi sunma; hangi kısıtın engellediğini açıkça söyle.

DOSYA ADLARI (WebP)
cm111-metalik-gumus-1333x2000.webp
cm112-metalik-lacivert-1333x2000.webp
cm113-rose-gold-1333x2000.webp
cm114-metalik-kirmizi-1333x2000.webp
cm115-antrasit-gri-1333x2000.webp
```
