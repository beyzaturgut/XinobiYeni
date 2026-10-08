# DEPLOY-007 — Birleşik web ve admin ZIP

- Tarih: 2026-10-08 (Europe/Istanbul)
- Sorumlu: Codex; kullanıcı tek web+admin ZIP istedi.
- Kaynak branch/commit: main / 0b028378e38e6025960adfc61b46468d6d03ff11. Çalışma ağacında başka geliştirmeler mevcut; uygulama derlemesi mevcut çalışma ağacından alınmıştır, bu hazırlık kaydı onları commit etmez.
- Hedef: mevcut IIS XinobiYeni sitesi; web `/`, admin `/admin/`. Son kayıtlı HTTP web adresi 109.104.120.91:8014; admin için HTTPS gerekir. Sunucuya erişilmedi ve hosting ayarı değiştirilmedi.
- Yayın türü: Next.js web export + Vite admin statik paketleri, local ürün/içerik anlık görüntüsü.
- İşlem: `node tools/package-deploy.mjs`.
- Artefakt: XinobiYeni-deploy-0b02837.zip; 152.972.851 bayt.
- SHA-256: 57c1e59a91acb9e20f18377bba5ecfa6c7a206cf2de8a5122e1ad5c254e9f076
- Paket düzeni: `out/` mağaza, `out/admin/` yönetim paneli, `DEPLOY.txt` kurulum notları.
- Kontroller: her iki derleme ve TypeScript başarılı; ZIP bütünlüğü, ana giriş dosyaları, admin varlık yolları, admin HTTPS zorunluluğu, tüm içerik medya referansları ve yerel sırların dışlanması doğrulandı.
- Öncesi yedek/geri alma: sunucu yayını uygulanmadı; yayın öncesinde mevcut web/admin fiziksel klasörleri yedeklenmeli, geri alma bu yedeklerle yapılmalı.
- HTTP/HTTPS canlı smoke: yapılmadı.
- Veritabanı migration: yok; API/veritabanı bu pakete dahil değildir.
- Durum: HAZIRLANDI; sunucuya aktarılmadı.

ZIP içindeki out klasörü web ve admin dosyalarını birlikte içerir. IIS kurulumunda mevcut fiziksel yol, sanal dizin ve binding düzenini kontrol edin; mağaza altında başka admin sanal dizini varsa yalnız klasör kopyalamak onu değiştirmez. Admin panelinin gerçek ürün/fiyat/stok yönetimi, yetkili üretim API'si ve hesap kaynağı gerektirir. Mevcut local-commerce uçları yalnız Development/loopback içindir; bu paket bunları Production'da açmaz. SMTP/API anahtarları, hesap kayıtları ve ortam dosyaları ZIP veya Git'e dahil değildir. Ürünler paketleme anındaki kopyadır.
