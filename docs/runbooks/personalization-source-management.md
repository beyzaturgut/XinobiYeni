# Admin — tek kişiselleştirme kaynağı yönetimi

06.11.2026 · KIS-TEK-03 ve KIS-TEK-04 uygulandı. [Hedef model](../decisions/ADR-005-personalization-single-source.md), [task planı](../tasks/personalization-single-source-tasks-2026-11-06.md).

## Kullanım

Admin → Katalog → **XINOBI U · Tek kaynak fotoğraf** alanını aç. Yalnız açıkça kişiselleştirilebilir işaretli ürünler listelenir. Seçili ürünün normal renkleri ve stok/varyant formu ayrı kalır.

Mevcut katalog fotoğrafını seç veya tek kaynak fotoğraf yükle. Fotoğraf üretim promptu KIS-TEK-04 ile katalog ana ekranından ve Medya sekmesinden kaldırıldı; kaynak görsel doğrudan yüklenir. Kaynak yükleme kodu normal katalog küçültücüsünü kullanmaz: dosyanın gerçek baytları ve ölçüsü korunur. PNG/JPEG/tek kareli WebP ve en fazla 25 MB dosya sınırı var; sabit piksel boyutu/en-boy oranı yok. Testte 73×41 ve 7001×5 kaynaklar kabul edildi; bu, ilerideki maske/editor zincirinin her boyutta tamamlandığının kabulü değildir.

Kaynak fotoğrafı kaydet düğmesi ürün, kaynak değişimi ve eski siparişlerin korunmasını açıklayan onay ister. Yalnız sunucu yeni revizyonu ve aynı hash’i doğrularsa başarı gösterilir. Kaynak kaydı mevcut renk fotoğraflarını veya maskelerini güncellemez. Kayıtlı kaynağı indirme bayt SHA doğrulaması yapar; mesaj yalnız tarayıcıya teslim edildiğini söyler.

**Bu aşama kaynak hazırlığıdır.** Yeni kaynağın maskesi/onayı ve web/Flutter/checkout bağlantısı KIS-TEK-05…10’da uygulanacaktır. Mevcut maskeler yeni kaynağa otomatik taşınmaz; eski yüzey ekranı yeni profil için onay verilmiş gibi değerlendirilmez. Yeni kaynak kaydı mağazadaki mevcut önizlemeyi değiştirmez. Fulfillment SKU’su otomatik seçilmez.

## Durumlar ve korumalar

- Yüklenme, kaynak yok, servis/bağlantı hatası, yetkisizlik, eski/kayıp kaynak ve kayıt başarısı ayrı gösterilir. Boş/bozuk API payload’ı başarı sayılmaz.
- Kaynak değişikliğinde ürün seçimi, modül gezinmesi ve çıkış için vazgeçme onayı; sekme kapatmada beforeunload koruması var. İşlem sürerken ayrılma ve ikinci gönderim engellenir. Hatalı kayıtta seçim korunur.
- Önceki kaynak kaybolmuşsa aynı fotoğraf yeniden yüklenerek yeni revizyonla onarılabilir; aynı hash bu onarımı engellemez.
- catalog.read okur, catalog.write kaynak seçimi/kaydı yapar. Dosya yükleme ayrıca mevcut media.write yetkisini kullanır. Genel katalog formunun renk/HEX/SKU doğrulamaları kaynak formunu engellemez.
- Kaynak değişikliği designs belgesini, siparişleri, varyant fotoğraflarını, fiyatı veya stoku yazmaz. Eski siparişin üç dosyası yeniden üretilmez.

## API ve saklama

Giriş/personel/MFA ve mevcut panel origin/HTTPS kurallarıyla:

- GET `/api/v1/local-commerce/personalization-sources/{productId}`: kaynak durumu/revizyonu. Profil yoksa revision=0/status=none; GET yeni kayıt oluşturmaz.
- GET `.../{productId}/candidate?image=...`: sadece izinli medya/static fotoğraf yolunun gerçek format/boyut/hash bilgisi; keyfi uzak URL okunmaz.
- PUT `.../{productId}`: image, sourceSha256, expectedRevision. Yanlış kaynak hash’i veya eski revizyon 409. Yeni fotoğraf ayrı GUID medya nesnesine tam bayt kopyalanır; eski kaynak ezilmez.

Mevcut ops.FeatureDocuments içinde `personalization-profiles` JSON belgesi; Development dosya modunda `personalization/personalization-profiles.json`. schemaVersion=1, profiles[productId] altında profileRevision ve sources[] geçmişi; her kaynak revision/asset/createdAt taşır. Henüz ticari bağ, maske onay sürümü veya müşteriye açık renderer sözleşmesi eklenmedi. Sonraki tasklarda bu şema sürümlenerek genişletilecek.

Null/uyumsuz sürümlü/bozuk profil yapısı üzerine kaydetme engellenir; hata boş kaynak olarak gösterilmez. Ortak DocumentStore’a opt-in rejectNull eklendi; diğer özellik belgelerinin davranışı varsayılan olarak değişmedi.

Fiziksel SQL migration yok; yeni belge yalnız ilk gerçek kayıt sırasında oluşur. Bu geliştirmede gerçek kayıt oluşturulmadı, mevcut envanter taşınmadı. SQL depolamada mevcut FeatureDocuments kilidi kullanılır; gerçek SQL çoklu süreç kabulü yapılmadı. Dosya kopyası ve SQL commit atomik değildir: yarış/commit hatasında referanssız yeni medya dosyası kalabilir. Otomatik temizlik veya eski dosya silme yok; sonraki geçiş/temizlik işi referans envanteriyle ele almalı.

## Doğrulama

[TST-258](../../test/2026-11-06/TST-258-personalization-source-management.md), [TST-259](../../test/2026-11-06/TST-259-direct-source-no-photo-prompt.md). Yerel UI/API çalışıyor; deploy/APK yok. Gerçek kaynak seçimi/yüklemesi ve işletme SKU kabulü kullanıcı tarafından ayrıca yapılacak.
