# TST-235 | Entegrasyon klasörleri

03.11.2026. Faz/task kaynakları üzerinden 13 entegrasyon klasörü ve üst dizin README oluşturuldu. Her klasörün kapsam/durum/karar/kaynak notu var.

- 13/13 klasör README mevcut. 56 yerel bağlantı kontrolü PASS. Sürat plan ve PDF bağlantıları PASS.
- Ödeme/e-belge sağlayıcısı varsayılmadı; SMTP/Resend alternatif, FCM/APNs ortak push akışı. Roboflow ve kapsamda olmayan marketler eklenmedi.
- Mevcut uygulama değişiklikleri korundu. Secret veya ham credential belgesi kopyalanmadı. Sağlayıcı çağrısı/kod/deploy yok.
- git diff --check PASS; yalnız dokümantasyon için uygulama testleri çalıştırılmadı.
