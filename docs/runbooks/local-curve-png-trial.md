# Yerel eğri / PNG maske denemesi — 16.10.2026

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


> **20.10.2026 itibarıyla geçersiz:** admin maskeleme yalnız PNG yüklemesine indirildi; eğri, fırça, Roboflow ve hizalama kaldırıldı. Güncel akış: [TST-133](../../test/2026-10-20/TST-133-png-only-admin-masking.md), renk fotoğrafı üretimi: [colour-photo-generation-prompt.md](colour-photo-generation-prompt.md).

Kullanıcı talimatı: yalnız yerelde dene, push yapma; “geri dön” denirse bu denemeden önceki noktaya dön.

- Başlangıç HEAD: `adac37a90f77d6ed2a6a72b2447be55aedc463ca`.
- Başlangıç çalışma ağacı temizdi.
- Geri dönüş yedeği: `/private/tmp/xinobi-curve-trial-20261016-adac37a/manifest.json`; değişen mevcut dosyaların kopyası `code/`, maskeleme workspace kopyası `product-surfaces/`, salt okunur aktif katalog kopyası `catalog-before.json`.
- Bu deneme commit/push edilmedi. Generated build ve yerel veriler Git'e eklenmez.

## Deneme

1. http://127.0.0.1:5173 → Ürün yüzeyleri → Elle gösterilen ortak ürün maskesini dene.
2. Ürün rengi seç. **Eğrili çizim** sekmesinde gövde kenarına en az üç nokta koy. Alan otomatik kapanır; noktalar sürüklenebilir. Yeni kenar noktası eklemek için görsele tıkla.
3. Yakınlaştırma %100–300; çizim alanı kaydırılabilir. Yumuşaklık 0 düz kenar, daha yüksek değerler yuvarlak geçiş oluşturur.
4. Ayrı gövde için **Desen alanı ekle**, logo/kulp gibi boşluk için **Hariç alan ekle**. Her alan en az üç noktadan oluşmalı.
5. **Eğriyi maske taslağına kaydet**. Onay sonrası da eğri belgesi saklanır; aynı kaynak için yeniden açılabilir. Fırça veya PNG ile yeni bir taslak oluşturulursa önceki eğriyle aynı geometri olduğu varsayılmaz.
6. **PNG maske** sekmesinde tam kaynak boyutunda (ekranda yazılı), en fazla 8 MB PNG yükle. Şeffaf PNG için alpha, siyah-beyaz için beyaz alan seçilir. Boyut esnetilmez. Boş/tam dolu maske reddedilir.
7. PNG taslağı ürün üzerinde görünür. İstenirse fırçayla düzeltilebilir; PNG dosyası otomatik vektör noktalarına çevrilmez. Taslak PNG aç/indir bağlantısı mevcut.
8. Aynı konumdaki renkleri kontrol edip mevcut ortak onay düğmesiyle uygula. Bu işlem yerel katalogdaki onaylı maske bağlantılarını günceller; taslak kaydı tek başına onay değildir.

İki yeni yöntem de GPU, yeni paket veya dış servis kullanmaz. Roboflow sekmeleri ayrıca korunur; yalnız o düğmelere açıkça basılırsa sağlayıcı çağrısı yapılır.

## PNG hizalaması

Katalog yüklemesi büyük fotoğrafları uzun kenar 2000 piksele küçültür. Maske için panelde **Maskeleme için kaynak fotoğrafı indir** kullanın; dosya aktif varyantla byte/SHA eşleşmelidir. Maskeyi bu tuvalde hazırlayın, dışa aktarırken ürün/katman konumunu değiştirmeyin ve içeriğe göre kırpmayı kapatın. Aynı çözünürlük tek başına AI çıktısındaki ürün konumunun korunduğu anlamına gelmez. Büyük asıl dosyadan hazırlanmış maskeyi kullanmak gerekirse bütün tuvali orantılı küçültün; bounding box/crop kullanmayın. [TST-127](../../test/2026-10-16/TST-127-exact-mask-source-download.md).

## AI maskeleme promptu

Kaynak indirme alanının altındaki “Yapay zeka için maskeleme promptu” seçili ürün/renk ve dosyanın teknik bilgileriyle otomatik güncellenir. Gerekirse hedefi “yalnız alt gövde” olarak değiştirin, “Promptu kopyala”ya basın ve kaynak indirme düğmesinden aldığınız dosyayla birlikte AI aracına verin. Prompt RGBA/alfa, tam tuval, (0,0) ve kırpmama şartlarını açıklar; AI çıktısının piksel doğruluğunu garanti etmez. Dönen maskeyi Şeffaf PNG modunda yükleyip görsel kontrol yapın. [TST-128](../../test/2026-10-16/TST-128-source-bound-mask-prompt.md).

## Geri dönüş

Kullanıcı “geri dön” derse önce `git status` ve yedek manifestini karşılaştır. Yalnız bu denemenin değişikliklerini başlangıç kopyalarından geri al; yeni deneme dosyalarını kaldır. Sonradan eklenen ilgisiz çalışmayı koru; `git reset --hard`, `git clean` veya toplu veri geri yükleme kullanma. Yerel maske verisine geri dönüş gerekiyorsa yalnız denemede değiştirilen maske/taslak kayıtlarını yedekle karşılaştır; katalogdaki ürün/fiyat/stok ve hesap/sipariş verisini topluca geri alma. Yeniden başlatılan süreç kimliği manifestte tutulur.

Kanıt: [TST-126](../../test/2026-10-16/TST-126-local-curve-png-trial.md).

Logo promptu: panel teknik metadata doldurur; logo adı, rengi ve konturunu harici AI ekli fotoğraftan incelemelidir. Basılı logo çizgileri şeffaf, araları ve çevresindeki gövde opaktır. Gerçek fiziksel etiket varsa kendi sınırı korunur. Yeni promptu tekrar kopyalayın. [TST-129](../../test/2026-10-16/TST-129-photo-specific-logo-mask-prompt.md).

Web önizleme 401 düzeltmesi: salt okunur commerce-mask rendering-inputs GET anonimdir, Development/loopback koşulları sürer; panel oturumu gerekmez. Onaydan sonra webi yenileyin; hazır tasarımda “Üründe gelişmiş önizlemeyi aç” kullanın. [TST-130](../../test/2026-10-16/TST-130-anonymous-approved-mask-preview.md).

Renk başına hizalama: Önizleme renginde başka renk seçince maske o fotoğrafın üstünde görünür. Kayma varsa maskeyi sürükleyin ya da ölçek/dönüş ayarlayın; referans maske değişmez. Onayda hizalanan renk kendi maskesini alır. [TST-131](../../test/2026-10-20/TST-131-per-colour-mask-alignment.md).
