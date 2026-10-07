# DEPLOY-005 — Güncel web yayın paketi

- Tarih: 2026-10-07 (Europe/Istanbul)
- Sorumlu: Codex; kullanıcı isteğiyle ZIP hazırlığı.
- Kaynak: main / e66bd73ac32f35a0a6fab0b00175b133432ac64d
- Çalışma ağacı: API/OpenAPI tarafında kullanıcıya ait tamamlanmamış değişiklikler var; bu statik web paketine dahil değildir ve bu kayıtla commit edilmez.
- Hedef: mevcut IIS XinobiYeni web sitesi için paket; son kayıtlı hedef 109.104.120.91:8014, C:\inetpub\wwwroot\XinobiYeni\out. Bu oturumda sunucu/hosting ayarları değiştirilmedi.
- Yayın türü: Next.js statik export, local içerik anlık görüntüsü.
- İşlem: `node tools/package-iis-preview.mjs`.
- Artefakt: XinobiYeni-web-e66bd73.zip, 145.235.808 bayt.
- SHA-256: e7c1212d8011ac6e59f934831eab4671796cc6395e5e19ad1383a91ab76dd86e
- İçerik: 28 statik rota, 17 ürün, 97 doğrulanmış medya referansı, IIS web.config.
- Kontroller: web derlemesi ve TypeScript başarılı; ZIP bütünlüğü başarılı; ürün/içerik görselleri arşivde; anasayfa, ürünler, Xinobi dünyası, hesap/giriş, sepet ve içerik JSON'u geçici yerel HTTP sunucusunda 200 döndü. Yerel SMTP/API anahtarları arşivde bulunmadı.
- HTTP/HTTPS canlı smoke: yapılmadı; sunucuya aktarım yok.
- Veritabanı migration: yok; ZIP veritabanı veya sunucu API'si içermez.
- Öncesi yedek/geri alma: yayın henüz uygulanmadı. Uygulama öncesinde mevcut out klasörü tarih/saatli yedeklenmeli; geri alma yedek klasörle yapılmalı (DEPLOY-004 adımları).
- Durum: HAZIRLANDI.

ZIP içinde out klasörü vardır. Admin paneli, ASP.NET API, hesap/SMTP gönderim servisi ve AI işlemleri bu statik ZIP'le yayınlanmaz. Canlı hesap/e-posta ve AI için ayrıca sunucu API yayını ve güvenli istemci bağlantısı gerekir. Ürünler ve medyalar paketleme anının kopyasıdır; sonraki local admin değişiklikleri yeniden paketleme gerektirir. ZIP ve local içerik dosyaları Git'e eklenmez.
