# TST-232 | Belge arşivi düzeni

03.11.2026. Yalnız belge düzeni; uygulama kodu değiştirilmedi.

- Documents/ChatGPT altındaki 3 PDF ve repodaki bugünkü 3 PDF tarihli proje arşivine kopyalandı. Tarihsiz tanıtım ayrı tutuldu.
- 6/6 kaynak-hedef SHA-256 eşitliği PASS; 6/6 PDF pypdf ile açıldı ve sayfa sayısı doğrulandı. İçerik değişmediği için yeniden üretim/render yapılmadı.
- Belge dizini, kaynak Markdown bağlantıları, kök README ve Faz00 erişimi eklendi. Yeni dizin bağlantıları PASS. Manifest kaynak/hash/sayfa bilgilerini içerir.
- Eski kaynak ve paylaşım yolları korundu. Geçici dosyalar ve gizli bilgi içeren entegrasyon kaynakları alınmadı. Tarihsel kapsam uyarıları eklendi.
- Bazı eski PDF dosyaları Git tarafından metin algılandığı için PDF iç yapısındaki boşluklar ilk staged kontrolde uyarı verdi. `.gitattributes` ile PDF türü binary tanımlandı; dosya baytları değiştirilmeden kontrol tekrarlandı ve PASS. Uygulama testi gerektiren değişiklik yok.
