# Mevcut katalog fotoğrafıyla maskeleme akışını koruma

11.11.2026 · Kullanıcının “o sistemdeki hiçbir şey değişmeyecekti; sadece başka renkler için onay iptal” açıklaması önceki kaldırma yorumunu düzeltir.

- Ayrı katalog “Tek kaynak fotoğraf” yönetim bölümü geri eklenmez.
- Ürün yüzeylerinde mevcut ürün fotoğrafı seçilir, orijinali indirilir, mevcut kurallı prompt gerçek boyutla kopyalanır, hazırlanmış WebP maske yüklenir, önizlenir ve yalnız o fotoğraf için onaylanır.
- Kaynak profili olmayan üründe GET seçimi/indirme yazmaz. İlk geçerli maske yüklemesi kaynak kopyası ve taslağı birlikte oluşturur. Kaynak kimliği/hash/sürüm ve eşzamanlılık doğrulanır. Geçersiz yükleme profil oluşturmaz.
- Başka renklere maske kopyalama, aynı hizalama kutusu ve toplu onay yoktur; eski toplu yazma rotaları 410 kalır.
- Mevcut profiller, normal renkler, katalog, eski tasarım/sipariş dosyaları değiştirilmez. Eski varyant maskeleri otomatik taşınmaz. Kaynak seçimindeki varyant açıkça fiziksel SKU bağıdır; orijinal fotoğraf ticari SKU seçmez.
- Sabit kaynak boyutu/en-boy oranı yoktur. Maske kendi kaynak boyutuyla eşleşir; dosya/RAM bütçesi korunur. SQL şeması/gerçek veri geçişi veya deploy yoktur.

[Uygulama ve test kanıtı](../../test/2026-11-11/TST-272-catalog-photo-mask-workflow.md).
