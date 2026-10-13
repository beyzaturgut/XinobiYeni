# DEPLOY-009 — Ana sayfa giydirilmiş ürün görseli

- Tarih: 13.10.2026 (Europe/Istanbul). Sorumlu: Codex hazırlık, RDP uygulaması proje sahibi.
- Kaynak: main / `42dc4d87c9767a65d0f26af1eb1bd39084abe33f`.
- Hedef: XinobiYeni / pool XinobiYeni / `C:\inetpub\wwwroot\XinobiYeni\out`, HTTPS 443 ve HTTP 8014.
- Tür: birleşik web/admin; `node tools/package-deploy.mjs`. API güncellemesi yok.
- Paket: `paketler/web/XinobiYeni-deploy-42dc4d8.zip`; 37718337 bayt.
- SHA-256: `3e93170a998258d04b9f5f8d6d570ced8d0b808f3d7f7ce8ef6badcbea6dc266`.
- Değişiklik: personalization-feature CSS sonundaki position:relative override kaldırıldı; mutlak konumlu ürün kutusu ve fallback görsel yüksekliği korundu.
- Test: production build; Chrome'da 1440/768/390 genişlikte görsel yükleniyor ve yüksekliği sırasıyla 440/390/322 px. Page error yok. ZIP CRC ve birleşik admin/görsel yolları doğrulandı.
- Canlı ön kontrol: mevcut ürün görsel dosyası HTTPS'te 200; CSS düzeltmesi henüz sunucuya uygulanmadı. Sertifika kontrolü tanıda atlandı.
- Yedek/geri dönüş: uzak yedek alınmadı. Uygulama öncesi mevcut out/config yedeğini al; başarısızlıkta bu dizini geri yükle. API/SQL verisine dokunma.
- Migration: yok. Gerçek canlı smoke: RDP kopyalama sonrası bekliyor.
- Sonuç: **HAZIRLANDI**; uzak yayın yapılmadı.
