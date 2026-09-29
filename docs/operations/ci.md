# Docker'sız CI sözleşmesi

GitHub Actions iş akışı `.github/workflows/ci.yml` altında çalışır. Container veya Docker service kullanılmaz.

## Her push ve pull request

- .NET `10.0.401`: restore, Release build ve test.
- Java Temurin 17: sabit OpenAPI Generator çekirdeğiyle Dart/Dio istemci üretimi.
- Node `.node-version`, pnpm `12.6.0`: frozen install; ASP.NET build çıktısı OpenAPI ile üretilmiş TypeScript ve Dart istemcilerinde git farkı kontrolü; lint ve production build.
- Flutter `3.47.5`: üretilmiş Dart istemcide dependency/build_runner/analyze/test ve serializer drift kontrolü; mobil uygulamada pub get, analyze ve test.

Workflow yalnız `contents: read` iznine sahiptir; checkout kimlik bilgilerini kalıcılaştırmaz. Aynı ref üzerindeki eski çalışma yeni çalışma başlayınca iptal edilir.

## API sözleşmesi fark kontrolü

API Release build'i `packages/contracts/openapi/v1.json` belgesini üretir. `pnpm contracts:check`, sabit `openapi-typescript` 7.13.0 ile TypeScript şemasını ve sabit OpenAPI Generator 7.25.0 `dart-dio` üreticisiyle Dart istemciyi yeniden üretir; `packages/` altında commit edilmemiş fark veya yeni dosya varsa CI'ı başarısız kılar. Üretilmiş Dart `built_value` serializer dosyaları mobil job'da tekrar oluşturulur ve ayrıca drift denetimine girer.

TypeScript ortak paketi `openapi-fetch` ile web ve panel için tip güvenli istemci fabrikası sunar. Flutter uygulaması `packages/clients/dart` paketini yerel path dependency olarak tüketir. Jeneratör kaynakları elle değiştirilmez; jeneratörün bilinen basit-operation `unused_import` çıktısı için sürümlü analiz şablonu `tools/openapi-templates/dart` altındadır. OpenAPI Generator'ın OpenAPI 3.1 desteği 7.25.0 sürümünde beta olduğundan, üretilmiş modeller gerçek serialize/deserialize sözleşme testiyle korunur.

## Bilinçli olarak henüz yok

- SQL Server entegrasyon job'u: güvenli uzak test SQL Server ve koşu bazlı izole DB sağlanınca eklenir.
- iOS/Android signing ve mağaza yayını: D09 hesap/signing kararından sonra ayrı korumalı workflow olur.
- Gerçek cihaz, sağlayıcı sandbox ve canlı testler bu CI sonucuyla tamamlanmış sayılmaz.
- Deployment otomatik değildir; ortam, onay ve rollback kararı beklenir.
