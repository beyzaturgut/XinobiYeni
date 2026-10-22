# TST-127 — Maskeleme için exact kaynak fotoğraf indirme

16.10.2026 · Yerel eğri/PNG denemesi; push yok, geri dönüş başlangıcı `adac37a` korunuyor.

Kullanıcı 7711×11561 orijinalinin panelde 1334×2000 görünmesini ve küçük maske kaymasını bildirdi. Katalog yüklemesi `productPhotoMaxEdge=2000` ile `downscaleImage` kullanıyor: boyutlar round(7711×2000/11561)=1334 ve 2000. Bu kod kırpma/taşıma yapmaz; bildirilen kaymanın tamamının bu ölçeklemeden kaynaklandığı kanıtlanmadı. AI çıktısının kompozisyon/tuval değişimi bu çalışmada ölçülmedi.

Panelde “Maskeleme için kaynak fotoğrafı indir” eklendi. Sunulan aktif varyantın kaynak dosyasını yeniden encode/resize/crop yapmadan indirir; SHA-256, Detail.SourceSha256 ile karşılaştırılır. Aynı tuvalde hazırlama ve dışa aktarırken içeriğe göre kırpmama açıklaması var.

Kontroller: admin build/lint ve git diff --check başarılı. `node tools/test-guided-surface-admin.mjs --manual-masks` başarılı; indirilen byte'lar sahte kaynak PNG ile birebir eşit ve dosya adı gerçek boyutları içeriyor. Mevcut eğri/PNG, sıfır inference ve responsive kontrolleri de geçti. Kullanıcı fotoğrafı/maskesi değiştirilmedi, gerçek AI çağrısı yapılmadı.
