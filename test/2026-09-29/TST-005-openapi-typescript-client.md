# TST-005 — OpenAPI TypeScript istemci üretimi ve sözleşme fark kontrolü

- Tarih/saat (Europe/Istanbul): 2026-09-29 14:17
- Commit/branch: `main` / commit öncesi `7a5b901`
- Faz/görev: Faz03 / 03.02 ortak API sözleşmesi ve CI
- Seviye: UNIT / INTEGRATION / CONTRACT / CI CONTRACT
- Ortam: macOS; .NET SDK 10.0.401; Node 24.20.0; pnpm 12.6.0; Flutter 3.47.5
- Çalıştıran: Codex

## Amaç

ASP.NET Core API'yi kanonik OpenAPI kaynağı yaparak web ve yönetim panelinin paylaşacağı tip güvenli TypeScript istemciyi deterministik üretmek; sözleşme/üretilmiş tip sapmasını Docker kullanmadan CI'da yakalamak.

## Önkoşullar ve test verisi

- Gerçek SQL Server, sağlayıcı, müşteri verisi veya sır kullanılmadı.
- Build-time OpenAPI: `Microsoft.Extensions.ApiDescription.Server` 10.0.12.
- Tip üretimi: `openapi-typescript` 7.13.0.
- İstemci çalışma zamanı: `openapi-fetch` 0.17.0.
- İstemci paketine ait TypeScript: 5.9.3.

## Komutlar

```text
pnpm install
pnpm contracts:generate
pnpm peers check
dotnet build XinobiYeni.slnx --configuration Release --no-restore
dotnet test XinobiYeni.slnx --configuration Release --no-build --no-restore
pnpm lint
pnpm build
cd apps/mobile && flutter analyze && flutter test
pnpm contracts:generate
shasum -a 256 packages/contracts/openapi/v1.json packages/clients/typescript/src/schema.d.ts
git diff --check
pnpm contracts:check
gh run list --workflow ci.yml --limit 1 --json databaseId,headSha,status,conclusion,url
```

## Beklenen sonuç

- API build'i sürümlü OpenAPI belgesini üretir.
- Health 200 yanıtı OpenAPI'de açık ve zorunlu alanlı şema taşır.
- TypeScript tipleri ve istemci fabrikası derlenir; bilinmeyen yol/yanıt alanı statik olarak kabul edilmez.
- İkinci üretim aynı byte çıktısını verir.
- .NET, web, panel, ortak istemci ve mobil regresyonları geçer.

## Gerçek sonuç

- Durum: BAŞARILI
- Süre: tam regresyon yaklaşık 20,7 sn; son deterministik üretim 1,5 sn
- .NET Release build: 0 uyarı, 0 hata.
- .NET test: 6/6 başarılı, 0 başarısız, 0 atlanan.
- Ortak TypeScript istemci lint/build: başarılı; web ve panel lint/production build: başarılı.
- Flutter analyze: sorun yok; Flutter test: 1/1 başarılı.
- Peer dependency kontrolü: sorun yok.
- İki ardışık üretimde OpenAPI SHA-256 `5dcfbc05...b5004c`, TypeScript şeması SHA-256 `751c34d0...de494`; değişmedi.
- `git diff --check`: başarılı.
- Yerel commit sonrasında CI ile aynı `pnpm contracts:check`: başarılı; yeniden üretim çalışma ağacında fark bırakmadı.
- Push sonrası `HEAD` ve `origin/main`: `8df55b4bd28190911995abe20c4daf7f47ba65d1`, eşit. Uzak GitHub Actions sonucu sorgulanamadı; yerel ortamda `gh` komutu kurulu değil.

## Hata ve düzeltme

İlk bağımlılık kurulumunda istemci paketine TypeScript 6.0.2 verilmesi nedeniyle `openapi-typescript@7.13.0` paketinin `^5.x` peer beklentisi karşılanmadı. Resmi npm sürüm bilgisi doğrulanarak istemci paketi TypeScript 5.9.3'e sabitlendi; `pnpm peers check` sonrasında sorun kalmadı.

İlk OpenAPI çıktısında anonim health yanıtı gövde şeması üretmedi ve TypeScript çıktısı `content?: never` oldu. Yanıt `HealthResponse` DTO'suna dönüştürüldü; entegrasyon testi OpenAPI `$ref` ve bileşen şemasını denetleyecek şekilde genişletildi. Yeniden üretimde dört zorunlu alan doğru oluşturuldu.

`pnpm install`, görevden bağımsız mevcut web `eslint@9.39.5` sürümü için deprecation uyarısı verdi. Kurulum/build/lint başarısız olmadı; kapsam dışı bağımlılık yükseltmesi bu değişikliğe eklenmedi.

Push sonrası uzak workflow durumunu sorgulayan `gh run list` denemesi `zsh: command not found: gh` ile başarısız oldu. Bu bir uygulama/CI test hatası değil, yerel GitHub CLI eksikliğidir. GitHub Actions'ın gerçek sonucu henüz kanıtlanmış sayılmaz; CLI kurulumu veya GitHub arayüzü erişimiyle ayrıca doğrulanmalıdır.

## Kanıt

- `packages/contracts/openapi/v1.json`
- `packages/clients/typescript/src/schema.d.ts`
- `packages/clients/typescript/src/contract-smoke.ts`
- `tests/Xinobi.Architecture.Tests/ApiContractTests.cs`
- `.github/workflows/ci.yml`

## Etki ve sonraki adım

Web ve panel artık aynı API sözleşmesinden tip güvenli istemci kullanabilir; CI temiz checkout üzerinde yeniden üretim farkını reddeder. Uzak GitHub Actions sonucu `gh` eksikliği nedeniyle bekliyor. Dart istemci üretimi ayrı bir atomik görevdir. SQL/D02/D03 olmadan veri şeması veya iş endpoint'i eklenmeyecektir.
