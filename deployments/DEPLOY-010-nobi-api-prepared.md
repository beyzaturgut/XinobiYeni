# DEPLOY-010 — Nobi canlı web API adresi

- Tarih: 13.10.2026 (Europe/Istanbul). Sorumlu: Codex hazırlık, RDP uygulaması proje sahibi.
- Kaynak: main / `dfbc9724fedf1268a8e84e9475069628f6088b26`.
- Hedef: XinobiYeni / pool XinobiYeni / `C:\inetpub\wwwroot\XinobiYeni\out`, HTTPS 443 ve HTTP 8014.
- Paket: `paketler/web/XinobiYeni-deploy-dfbc972.zip` (birleşik web/admin), 37718281 bayt.
- SHA-256: `06dd6fbf40124c54d04ef862f0655ebcf25d84cb2a9ad846312e1d018356698f`.
- İşlem: `node tools/package-deploy.mjs`. Nobi, commerceApi boşken `/api/v1` aynı kaynak API'sini kullanır.
- Test: web TypeScript ve production web/admin build; Chrome fixture config yanıtından greeting gösterimi, gerçek sağlayıcı kullanılmadı. ZIP CRC ve birleşik admin doğrulandı.
- Canlı tanı: `/api/v1/assistant/config` 503, `feature_unavailable`. RDP'de API production JSON'a `Features:StorageProvider=SqlServer` eklenmeli; mevcut sırlar ve diğer ayarlar korunmalı. Özellik SQL ayarı diğer özelliklerin ortak deposunu da etkinleştirir; bildirim worker'ı SQL ortamında varsayılan açık olduğundan mevcut `Notifications:WorkerEnabled` işletim tercihi korunmalı. Gerçek AI sağlayıcı etkinliği ayrıca yapılandırmaya bağlıdır.
- Öncesi yedek/geri dönüş: uzak işlem yapılmadı. Web out ve API configuration yedeklenmeli; geri dönüşte önceki web/config geri yüklenip API pool'u recycle edilir. SQL verisi silinmez.
- Migration/aktarım: yok; mevcut assistant belgesi daha önce SQL'e aktarılmıştır (TST-113).
- Sonuç: **HAZIRLANDI**; paket ve Features ayarı henüz uzak sunucuda uygulanmadı, gerçek canlı Nobi smoke bekliyor.
