# TST-007 — OpenAPI Dart istemcisi ve Flutter entegrasyonu

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / commit öncesi `400917c`
- Faz/görev: Faz03 / 03.02 ve 03.09 ortak mobil API istemcisi
- Seviye: UNIT / INTEGRATION / CONTRACT / CI CONTRACT
- Ortam: macOS; Java 17.0.20.1; OpenAPI Generator CLI 2.40.1; Generator 7.25.0; Flutter 3.47.5; Dart 3.13.4
- Çalıştıran: Codex

## Amaç

ASP.NET Core'un kanonik OpenAPI 3.1 belgesinden Flutter'ın kullanacağı tip güvenli Dart/Dio istemciyi sabit sürümle üretmek; model serializer davranışını, mobil paket tüketimini ve CI sözleşme sapması kontrolünü doğrulamak.

## Önkoşullar ve test verisi

- SQL Server, dış sağlayıcı, gerçek müşteri verisi veya sır kullanılmadı.
- Girdi: `packages/contracts/openapi/v1.json`.
- Jeneratör: `dart-dio`, `built_value`; sürüm 7.25.0.
- Test verileri yalnız `Xinobi.Api`, `healthy`, UTC örnek zaman ve sentetik request ID değerlerinden oluşur.

## Komut özeti

```text
pnpm install --frozen-lockfile
pnpm contracts:generate
cd packages/clients/dart && dart pub get && dart run build_runner build && dart analyze && dart test
cd apps/mobile && flutter pub get && flutter analyze && flutter test
dotnet build XinobiYeni.slnx --configuration Release --no-restore
dotnet test XinobiYeni.slnx --configuration Release --no-build --no-restore
pnpm lint
pnpm build
git diff --check
pnpm contracts:check
cd packages/clients/dart && dart run build_runner build
git diff --exit-code -- packages/clients/dart
```

## Beklenen sonuç

- `HealthResponse` Dart modeli dört zorunlu alanı doğru Dart tipleriyle taşır.
- `SystemApi.getApiHealth()` tipli `Response<HealthResponse>` üretir.
- Serializer round-trip veri kaybetmez.
- Flutter uygulaması ortak istemci paketini derler ve model sözleşmesini kullanır.
- Yeniden üretim ve serializer build'i commit edilen çıktılarda fark bırakmaz.
- Mevcut .NET, TypeScript, web, panel ve mobil regresyonları geçer.

## Gerçek sonuç

- Durum: BAŞARILI
- .NET Release build: 0 uyarı, 0 hata; test 6/6 başarılı.
- TypeScript istemci, web ve panel lint/build: başarılı.
- Dart istemci analyze: sorun yok; gerçek serializer round-trip testi 1/1 başarılı.
- Flutter analyze: sorun yok; widget + üretilmiş model sözleşme testleri 2/2 başarılı.
- `pnpm install --frozen-lockfile`: başarılı; supply-chain politikası geçti.
- OpenAPI Generator `dart-dio` üreticisini kararlı olarak bildirdi; OpenAPI 3.1 desteğinin beta olduğuna ilişkin upstream uyarı devam ediyor.
- Flutter/Dart bağımlılık çözümlemesi daha yeni fakat mevcut constraintlerle uyumsuz paketler bulunduğunu bilgi olarak bildirdi; analiz/test başarısız olmadı ve bu görevde zorlamalı yükseltme yapılmadı.
- Temiz yerel commit üzerinde `pnpm contracts:check` başarılı oldu; TypeScript ve Dart istemci yeniden üretimi fark bırakmadı. Ardından `build_runner` 0 çıktı üretti ve Dart serializer drift kontrolü de temiz geçti.

## Hata ve düzeltme

1. İlk `flutter --version` kontrolü sandbox dışında bulunan Flutter SDK cache dosyalarına yazamadığı için `Operation not permitted` ile durdu. Aynı salt tanılama gerekli izinle tekrarlandı; Flutter 3.47.5 ve Dart 3.13.4 doğrulandı.
2. İlk `pnpm add` denemesi yeni CLI paketinin kurulum betiğini güvenlik gereği engelledi (`ERR_PNPM_IGNORED_BUILDS`). `pnpm-workspace.yaml` içinde yalnız `@openapitools/openapi-generator-cli` için açık izin verildi; tekrar kurulum başarılı oldu.
3. İlk `json_serializable` üretimi eski analyzer/SDK aralığı ve iki statik analiz uyarısıyla başarısız oldu. Resmi üretici yardımında bu seçeneğin beta olduğu görülerek kararlı varsayılan `built_value` seçildi.
4. İlk built_value analizi jeneratörün kullanılmayan `JsonObject` import'u nedeniyle tek uyarıyla başarısız oldu. İlk özel şablon yanlış alt dizinde olduğundan ikinci analiz de aynı uyarıyla başarısız oldu. Şablon doğru köke taşındı; yalnız jeneratörün bilinen `unused_import` çıktısı ignore edildi, diğer katı kurallar korundu. Son analyze temiz geçti.
5. `build_runner` güncel sürümü artık `--delete-conflicting-outputs` seçeneğini kaldırdığını bildirdi. Final CI komutundan bu seçenek çıkarıldı.

Başarısız denemeler sonucunda hiçbir SQL, uzak servis veya kullanıcı verisi değiştirilmedi. İlk tamamen üretilmiş ve commit edilmemiş Dart dizini, kararlı serializer seçeneğine geçerken temizlenip yeniden üretildi.

## Kanıt

- `packages/clients/dart/`
- `packages/clients/dart/test/health_contract_test.dart`
- `apps/mobile/test/api_client_contract_test.dart`
- `openapitools.json`
- `tools/openapi-templates/dart/analysis_options.mustache`
- `.github/workflows/ci.yml`

## Etki ve sonraki adım

Web, panel ve Flutter artık aynı ASP.NET OpenAPI kaynağından üretilmiş tipli istemcilere sahip. Temiz commit üzerindeki iki drift kontrolü de geçti; push sonrası uzak Actions sonucu ayrıca gözlenmelidir. SQL erişimi gelene kadar bir sonraki güvenli iş Faz03 liveness/readiness ayrımıdır: liveness veritabanından bağımsız kalmalı, readiness ise SQL yapılandırması yokken güvenli ve açıklayıcı biçimde başarısız olmalıdır.
