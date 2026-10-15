# DEPLOY-011 — IP test sunucusunda HTTP ana adres

- Tarih: 15.10.2026 (Europe/Istanbul). Sorumlu: Claude hazırlık, RDP uygulaması proje sahibi.
- Kaynak: main / `ef66c03d57ab19c2f8e85b7dd20445b3242c38f9` (HTTP değişikliği `fb9380e`).
- Hedef: XinobiYeni / `C:\inetpub\wwwroot\XinobiYeni\out`, ana adres HTTP 8014 (HTTPS 443 ikincil);
  XinobiYeniApi / `C:\inetpub\wwwroot\XinobiYeniApi\api`, `http://localhost:8024`.
- Paketler:
  - `paketler/web/XinobiYeni-deploy-ef66c03.zip` (birleşik web/admin), 68969335 bayt,
    SHA-256 `8256e9de36bd021da0218f06e555582fbd841543ecaf7b370bef4c42d3d9808c`.
  - `paketler/mobil/XinobiYeni-api-ef66c03.zip` (API), 102362770 bayt,
    SHA-256 `3f6d65a2c05e203e1143dc51de4f36ff70b7ab03a274e277d87cb061fd801b8b`.
- İşlem: `node tools/package-deploy.mjs`, `node tools/package-api-iis.mjs`. Admin web.config SSL zorunlu
  kılmaz; API paketi `AdminCatalog:RequireHttps=false`, `Catalog:AssetBaseUrl=http://109.104.120.91:8014`.
- Test: .NET mimari testleri 417 başarılı, 1 başarısız
  (`LiveCatalogNeedsStaffAndPermissionAndKeepsOtherPanelAreasClosed`, `fc715ec` admin oturum ayrımından;
  bu değişiklikten önce de başarısız). HTTP proxy üzerinden admin yazma testi başarılı. ZIP içerikleri kontrol edildi.
- Uygulama: API paketi yalnız kendi ayarlarını taşır. Sunucudaki `appsettings.Production.json`
  önce yedeklenmeli; SQL/Accounts/AdminCatalog/Email/Storage/Features ayarları korunmalı veya
  `tools/repair-iis-catalog.ps1` ile yeniden birleştirilmeli (bkz. `docs/runbooks/https-reverse-proxy.md`).
- Öncesi yedek/geri dönüş: uzak işlem yapılmadı. Web `out`, API dizini ve production JSON yedeklenmeli;
  geri dönüşte önceki dosyalar geri yüklenip pool'lar recycle edilir. SQL verisi silinmez.
- Migration/aktarım: bu değişiklik için yok.
- Sonuç: **HAZIRLANDI**; paketler uzak sunucuda henüz uygulanmadı, HTTP smoke bekliyor.
