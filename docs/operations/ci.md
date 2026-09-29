# Docker'sız CI sözleşmesi

GitHub Actions iş akışı `.github/workflows/ci.yml` altında çalışır. Container veya Docker service kullanılmaz.

## Her push ve pull request

- .NET `10.0.401`: restore, Release build ve test.
- Node `.node-version`, pnpm `12.6.0`: frozen install, lint ve production build.
- Flutter `3.47.5`: pub get, analyze ve test.

Workflow yalnız `contents: read` iznine sahiptir; checkout kimlik bilgilerini kalıcılaştırmaz. Aynı ref üzerindeki eski çalışma yeni çalışma başlayınca iptal edilir.

## Bilinçli olarak henüz yok

- SQL Server entegrasyon job'u: güvenli uzak test SQL Server ve koşu bazlı izole DB sağlanınca eklenir.
- iOS/Android signing ve mağaza yayını: D09 hesap/signing kararından sonra ayrı korumalı workflow olur.
- Gerçek cihaz, sağlayıcı sandbox ve canlı testler bu CI sonucuyla tamamlanmış sayılmaz.
- Deployment otomatik değildir; ortam, onay ve rollback kararı beklenir.

