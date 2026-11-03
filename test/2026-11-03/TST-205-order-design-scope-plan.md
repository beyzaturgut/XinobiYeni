# TST-205 - Sipariş tasarım detayı kapsam/task/faz planı / 03.11.2026

Kullanıcı önce sipariş tasarım detayının yerleşim ve ayrı desen/ürün/giydirilmiş görsel indirmelerinden oluşmasını istedi, sonra açıkça yalnız plan/task/faz kaydı yapılmasını ve uygulamaya başlanmamasını belirtti. Bu oturum yalnız bu planı tamamlar.

## Kayıtlar

- [SIP-TAS-01...09: tasklar, bağımlılıklar ve kapanış koşulları](../../docs/tasks/order-design-detail-scope-2026-11-03.md).
- Faz00 karar kaydı, Faz01/02/03/05/06/11 dağılımı; ana task MD/JSON ve Faz06 alt taskları eşlendi.
- KIS-01/05/06 fiziksel üretim hedefleri kapsam dışı olarak işaretlendi, tamamlandı denmedi. KIS-03/07 sipariş yerleşimi/üç görsel teslimi; KIS-08 fiyat/dosya kabulü. Fiziksel şartname KAR-05 ve UAT-04/08 kabul bağları revize edildi.
- Eski fiziksel profil geliştirme/test geçmişi silinmedi. Genel editör araçları, ödeme/kargo/iade ve entegrasyon kapsamı korunur. “Maskeleme ürünü” ürün kaynak fotoğrafı olarak adlandırıldı; ayrı maske PNG indirmesi yeni zorunlu teslim yapılmadı.
- Önceki genel PDF yeni kapsam kararından önce hazırlandı; tarihsel olduğu yeni planda açıkça not edildi. Yeni PDF üretilmedi.

## Doğrulama

1. JSON parse + 120 ana kimliğin HEAD ile birebir korunması; 9 benzersiz yeni alt task ve hepsinde Planlandı/uygulanmadı durumu.
2. Üç üretim taskında kapsam dışı durumu ve KIS-07'nin baskı render kuyruğuna bağlı olmaması; genel editörün fiziksel profile zorunlu bağı kaldırıldı.
3. Yerel Markdown dosya bağlantıları, faz/task başlıkları, ana/alt task tutarlılığı ve git diff boşluk kontrolü.
4. Diff yalnız Prompts/design/docs/tasks/test altında; uygulama kaynağı, şema, veri, API, UI veya Flutter değişikliği yok. Uygulama testleri/build, gerçek servis çağrısı, migration, release/deploy ve APK yok.

**Sonuç:** PASS / DOCUMENTATION STATIC. Bu sonuç uygulamanın yapıldığı veya kullanıcı/PM/faz kabulü verildiği anlamına gelmez. Plan kaynak kesiti e89c649; git fetch/upstream kontrolü commit öncesi yapıldı. Geçici planlama/doğrulama scriptleri /tmp altında tutuldu.
