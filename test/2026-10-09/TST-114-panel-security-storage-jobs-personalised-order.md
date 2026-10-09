# TST-114 — Panel güvenliği, dosya deposu, arka plan işleri, kişiselleştirilmiş sipariş

- Tarih: 09.10.2026. Başlangıç `7363597`, bitiş `0fa22a2` + bu rapor.
- İstek: migration'dan sonra panel güvenliği, dosya deposu (yapılabiliyorsa), arka plan işleri ve Analiz2'den yalnız "kişiselleştirilmiş ürünü siparişe ekleme".

## Panel güvenliği (`12f543c`)

- `/api/v1/local-commerce/**` ve `/surfaces` artık personel hesabı + rota izni ister: okuma `x.read`, değişiklik `x.write`, iptal/iade kararı `orders.cancel`. Eşlenmemiş panel rotası uygulamayı başlatmaz.
- Anonim kalanlar yalnız yerel vitrinin okuduğu `GET /state` ve ürün medyası.
- Admin uygulaması her ortamda giriş ister; istekler oturum çerezi + `X-Xinobi-Csrf` ile gider, 401'de bir kez yeniler.
- Proje sahibinin mevcut hesabı `bootstrap-super-admin` ile süper yönetici yapıldı.
- Kanıt: anonim 401, müşteri 403, izinsiz personel rolü 403, süper yönetici 200; Chrome'da admin "Yönetici girişi" ekranı.

## Dosya deposu (`fa8d720`)

- `IFileStore`: alan başına düz, denetlenen anahtar; atomik yazma. Yerel arka uç eski klasör düzenini korur; sunucuda `Storage:LocalRoot` ile kullanılabilir, ayar yoksa 503.
- Katalog medyası ve kayıtlı tasarımlar bu depoya geçti. Medya 200, boyut diskle aynı.
- Nesne depolama (R2/S3) hesap ve anahtar gerektirdiği için yapılmadı; adımlar `docs/runbooks/file-storage.md`.

## Arka plan işleri (`7db18d6`)

- Bildirim kuyruğu gönderimden önce aynı kilitli yazmada sahiplenilir (2 dk kira); çakışan turlar aynı mesajı iki kez göndermez (test: 4 eşzamanlı tur, 5 mesaj, 5 gönderim).
- İşçi, özellik durumu SQL'de olan her ortamda çalışır; saatlik `MaintenanceWorker` süresi dolmuş SQL oturumlarını siler. Düzen: `docs/runbooks/background-jobs.md`.

## Kişiselleştirilmiş ürünü siparişe ekleme (`49618a1`, `0fa22a2`)

- Sepet satırı isteğe bağlı kayıtlı tasarım taşır. Sunucu: tasarım müşterinin olmalı, aynı ürün için yapılmış olmalı, ürün kişiselleştirmeye açık olmalı.
- Görsel siparişe ait değişmez kopyaya alınır; kayıtlı tasarım silinse de sipariş değişmez. Müşteri ve `orders.read` yetkili personel görür, başkası 404/401.
- 0005: `sales.OrderLines.PersonalizationJson` (nullable, ISJSON). XinobiYeniDB'ye uygulandı (sipariş tablosu boştu; yalnız nullable kolon), tekrar no-op.
- Web: Tasarımlarım ve önizlemede "Bu tasarımla sepete ekle"; sepet, ödeme, siparişler ve iade formu tasarımlı satırları ayrı ve "Temsilidir" etiketiyle gösterir. Mobil aynı biçimde. Panel siparişte tasarım görseli.
- Kanıt: API testi (yabancı tasarım, başka ürün, kapalı kişiselleştirme reddi; aynı renk düz + tasarımlı iki satır; silinen tasarıma rağmen sipariş görseli); gerçek SQL'de satır kopyası gidiş-dönüş; Chrome'da sepet iki satır, hata yok.

## Sonuçlar

- .NET **341 geçti / 4 atlandı / 0 başarısız**; gerçek SQL testleri ayrıca geçti ve kendi `.invalid` kayıtlarını temizledi.
- Flutter analyze temiz, `flutter test` 50/50. Web `tsc` + eslint, admin `tsc` + oxlint temiz (yalnız önceden var olan uyarılar).

## Açık

- Kişiselleştirme ek ücreti yok (fiyat varyantla aynı); karar gerekir.
- Kişiselleştirilmiş ürün iade kuralı ayrı yapılandırılmadı (Analiz2 §iade, hukuk onayı).
- Üretim dosyası teknik kontrolü yok; panel görseli temsilidir.
- R2/S3 hesabı, XINOBI U oturumlarının SQL'e taşınması ve D10.
