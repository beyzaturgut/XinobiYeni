# Xinobi belge arşivi

Paylaşılabilir önemli PDF belgelerinin proje içindeki düzenli arşivi. Tarih klasörü belge tarihidir; kopyalama tarihiyle değiştirilmez. Tarihi doğrulanamayan tanıtım `tarihsiz/` altındadır.

## 03.11.2026 belgeleri

- [Genel proje durumu](2026-11-03/xinobi-proje-durumu-2026-11-03.pdf) - 2 sayfa. Aynı günün sade sipariş tasarım kapsam kararından önceki özet; güncel kapsam için aşağıdaki planı kullan.
  Düzenlenebilir kaynak: [Markdown](../../docs/tasks/order-design-detail-scope-2026-11-03.md).
- [Sipariş tasarımı MostGate taskları ve promptları](2026-11-03/xinobi-siparis-tasarim-mostgate-tasklar-ve-promptlar-2026-11-03.pdf) - 10 sayfa. Plan/prompt belgesi; uygulama ilerlemesi Faz00 ve tarihli test kayıtlarından okunur.
  Düzenlenebilir kaynak: [Markdown](../../docs/tasks/order-design-mostgate-prompts-2026-11-03.md).
- [Sürat Kargo entegrasyon taskı ve uygulama planı](2026-11-03/xinobi-surat-kargo-entegrasyon-task-ve-uygulama-plani-2026-11-03.pdf) - 14 sayfa. Planlandı; entegrasyon uygulanmadı. Sağlayıcı teyitleri açık.
  Düzenlenebilir kaynak: [Markdown](../../docs/tasks/surat-kargo-integration-plan-2026-11-03.md).

## 30.10.2026 belgeleri

- [Proje tamamlama task planı](2026-10-30/Xinobi_Proje_Tamamlama_Task_Plani_2026-10-30.pdf) - 36 sayfa. 30.10.2026 tarihli plan; sonraki kapsam kararlarından önce hazırlanmıştır.
- [Yapıldı / yapılmadı durum raporu](2026-10-30/Xinobi_Task_Durum_Raporu_Yapildi_Yapilmadi_2026-10-30.pdf) - 69 sayfa. 30.10.2026 tarihsel durum kaydı; güncel ilerlemeyi temsil etmez.

## Tarihsiz tanıtım

- [Proje tanıtım dosyası](tarihsiz/Xinobi_Proje_Tanitim_Dosyasi.pdf) - 22 sayfa. Tarihsiz tanıtım; güncel task durumu değildir.

## Güncel çalışma kaynakları

- [Faz00: güncel proje takibi](../../Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md)
- [Task planları](../../docs/tasks/)
- [Ekran ve tasarım denetimleri](../../design/)
- [Test sonuçları](../../test/INDEX.md)

## Düzen kuralı

Yeni onaylı/paylaşılabilir PDF ve Word çıktıları `YYYY-AA-GG/` içine, açıklayıcı ve tarihli adla eklenir. Düzenlenebilir task/faz/tasarım kaynakları kendi mevcut klasörlerinde kalır ve buradan bağlanır. Eski raporlar tarihsel kayıt olarak saklanır; güncel durum diye sunulmaz.

`output/pdf/` üretim/paylaşım kopyaları önceki bağlantıların çalışması için korunmuştur. İlk üç eski belge Documents/ChatGPT çalışma alanından projeye alınmıştır; özgünleri silinmedi. Yeni sürümde arşiv dosyası ve manifest birlikte güncellenmeli, PDF metni değiştirilirse yeniden render/görsel kontrol yapılmalıdır.

`manifest.json` kaynak konumlarını, sayfa sayılarını ve SHA-256 özetlerini içerir. Geçici render görselleri, tarayıcı profilleri, credential içeren kargo ZIP/Postman dosyaları bu arşive alınmaz. Müşterinin bağlayıcı özgün belgeleri üstteki Proje Yönetimi klasöründe ve docs/sources altında mevcut düzeninde korunur.
