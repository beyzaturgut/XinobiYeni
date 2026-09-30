# Xinobi deployment kayıtları

Her gerçek yayın veya geri alma işlemi bu klasörde sıralı bir kayıt oluşturur. Hazırlık/başarısız deneme de silinmez; gerçek yayın yapılmadıysa durum açıkça `HAZIRLANDI` veya `BAŞARISIZ` yazılır.

Zorunlu alanlar:

- Deployment ID, tarih/saat ve sorumlu
- Kaynak branch ve tam commit
- Hedef ortam, sunucu, site/application adı ve binding
- Yayın türü ve artefakt hash'i
- Uygulanan komut/işlem
- Öncesi yedek ve geri alma noktası
- HTTP/HTTPS smoke sonuçları
- Veritabanı migration durumu
- Sonuç: `HAZIRLANDI`, `BAŞARILI`, `BAŞARISIZ` veya `GERİ ALINDI`

Üretim sırları, parola, token ve bağlantı dizeleri kayda yazılmaz.
