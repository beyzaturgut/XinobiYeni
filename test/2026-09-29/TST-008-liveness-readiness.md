# TST-008 — API liveness ve SQL Server readiness ayrımı

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / commit öncesi `5079ddf`
- Faz/görev: Faz03 / 03.02 sağlık ve readiness sözleşmesi
- Seviye: UNIT / INTEGRATION / CONTRACT / CI CONTRACT
- Ortam: macOS; .NET SDK 10.0.401; Microsoft.Data.SqlClient 7.1.0; Node 24.20.0; Flutter 3.47.5; Dart 3.13.4
- Çalıştıran: Codex

## Amaç

API süreç sağlığını SQL Server erişiminden ayırmak; SQL yapılandırması/erişimi yokken readiness'in güvenli biçimde 503 dönmesini, liveness'in 200 kalmasını ve iki sözleşmenin OpenAPI istemcilerine aktarılmasını doğrulamak.

## Önkoşullar ve test verisi

- Gerçek SQL Server bağlantısı veya parola kullanılmadı.
- Test ortamında `ConnectionStrings:Xinobi` kasıtlı olarak tanımlanmadı.
- Readiness başarı yolu gerçek bağlantı varmış gibi davranan test probe'u ile sınandı; bu sonuç gerçek SQL erişim kabulü değildir.
- `.env.example` yalnız `ConnectionStrings__Xinobi` anahtar adını içerir, değer içermez.

## Komut özeti

```text
dotnet restore XinobiYeni.slnx
dotnet build XinobiYeni.slnx --configuration Release --no-restore
dotnet test XinobiYeni.slnx --configuration Release --no-build --no-restore
pnpm contracts:generate
pnpm lint
pnpm build
cd packages/clients/dart && dart pub get && dart run build_runner build && dart analyze && dart test
cd apps/mobile && flutter pub get && flutter analyze && flutter test
git diff --check
pnpm contracts:check
cd packages/clients/dart && dart run build_runner build
git diff --exit-code -- packages/clients/dart
```

## Beklenen sonuç

- `/api/v1/health/live` SQL'den bağımsız HTTP 200 döndürür.
- `/api/v1/health/ready` SQL ayarı yoksa HTTP 503, `not_ready` ve güvenli `sql_not_configured` kodu döndürür.
- Readiness cevabı connection string, parola, sunucu adı, exception veya stack trace içermez.
- Probe hazır olduğunda readiness HTTP 200, `ready` ve `ok` döndürür.
- OpenAPI ve TypeScript/Dart istemciler iki yeni yolu ve modelleri içerir.

## Gerçek sonuç

- Durum: BAŞARILI
- İlk Release doğrulaması: build 0 uyarı/0 hata; 8/8 test başarılı.
- Başarı yolu testi eklendikten sonra: build 0 uyarı/0 hata; 9/9 test başarılı, 0 atlanan.
- TypeScript istemci, web ve panel lint/build: başarılı.
- Dart istemci analyze: sorun yok; serializer testi 1/1 başarılı.
- Flutter analyze: sorun yok; testler 2/2 başarılı.
- OpenAPI, TypeScript ve Dart çıktıları `/health/live`, `/health/ready`, `ReadinessResponse` ve `DependencyHealth` sözleşmelerini içeriyor.
- Son `git diff --check`: başarılı.
- Temiz yerel commit üzerinde `pnpm contracts:check` başarılı; OpenAPI/TypeScript/Dart yeniden üretimi fark bırakmadı. `build_runner` 0 yeni çıktı üretti ve serializer drift kontrolü de geçti.

## Hata ve düzeltme

İlk istemci üretiminden sonra OpenAPI Generator, yeni endpoint açıklamalarında satır sonu boşlukları üretti ve `git diff --check` bunları bildirdi. Üretilmiş dosyaları elle değiştirmek yerine `tools/normalize-generated-clients.mjs` eklendi; Dart/Markdown çıktıları her üretimde platformdan bağımsız biçimde normalize edildi. Yeniden üretim, build_runner, analyze/test ve diff kontrolü başarılı geçti.

Microsoft.Data.SqlClient bağlantı hataları istemciye yansıtılmaz. Probe yalnız `sql_not_configured`, `sql_timeout`, `sql_unavailable` veya `sql_invalid_configuration` güvenli kodlarını döndürür; log mesajları da connection string veya exception ayrıntısı içermez.

## Kanıt

- `services/api/Infrastructure/Readiness/SqlServerReadinessProbe.cs`
- `services/api/Contracts/ReadinessResponse.cs`
- `tests/Xinobi.Architecture.Tests/ApiContractTests.cs`
- `packages/contracts/openapi/v1.json`
- `tools/normalize-generated-clients.mjs`

## Etki ve sonraki adım

Orkestrasyon/izleme artık süreç canlılığı ile SQL hazırlığını ayırabilir. SQL gerçek portu ve güvenli connection string ortam değişkeni sağlandığında readiness üzerinden gerçek bağlantı ayrıca doğrulanmalı ve yeni CONNECTIVITY raporu yazılmalıdır. SQL beklenirken sıradaki bağımsız 03.02 işi standart API hata gövdesindeki `code`, `message`, `traceId` ve alan hata sözleşmesini tamamlamaktır.
