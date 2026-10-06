# TST-088 — ProductSurfaces Step 4B-2 — single automatic Roboflow smoke test

Tarih: 06.10.2026. Seviye: EXPLICITLY AUTHORIZED REAL PROVIDER SMOKE / LOCAL VALIDATION / MOCK REGRESSION / READ-ONLY VISUAL QA.

## Yetki ve preflight

Kullanıcı yalnız existing Tea Maker source + `lower kettle body` için maksimum bir real automatic POST'u açıkça onayladı. Interactive/second call/automatic retry/timeout retry/prompt experiments/batch/Workflow yasak. Key kullanıcı terminalinde ASP.NET user-secrets'e yazıldı ve kullanıcı kurulum onayı verdi. API UserSecretsId non-secret metadata'dır. Secret list/dump/value çıktısı yok; key server-side private configuration ve Bearer header'da kaldı.

Live path yalnız Development + DevelopmentReview.Enabled + Provider=roboflow + ExternalInferenceEnabled + SingleAutomaticSmokeEnabled ile compose edilir. İki inference gate default false; normal reference workflow etkilenmedi. Startup ve GET inference yapmaz. Exact source/prompt/payload/endpoint guard, process-local atomic one-request counter, no redirect/cookie/negotiation/retry middleware ve interactive rejection vardır. Bu oturum restart edilip yeni call yapılmasına izin verilmedi.

Preflight geçti: credentialPresent=true (value yok), external flag=true, provider=roboflow, attempts=0, candidate=null. Source path `apps/web/public/assets/products/tea-maker-101-blue.webp`; source identity `dev:tea-maker-101:blue:source:v1`; decoded 1066×1600; SHA-256 `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`; prompt exact `lower kettle body`.

## Tek çağrı sonucu

- Real inference requests attempted: **1**. `POST /sam3/concept_segment`, Bearer server-side, original bytes base64, text prompt, `format:rle`. Source re-encode edilmedi.
- HTTP **200**, transport response capture elapsed **1529 ms**.
- Top-level properties: `inference_id`, `frame_id`, `time`, `resolved_model`, `prompt_results`.
- Prompt result properties: `prompt_index`, `echo`, `predictions`.
- Prediction properties: `masks`, `confidence`, `format`.
- Candidates **1**; selected index **0**, supplied score **0.83984375**. Score segmentation metadata'dır; commercial correctness değildir.
- `format=rle`; masks Object; keys `size`,`counts`; RLE size **[1600,1066]**; counts **String / compressed COCO RLE**.
- PCS mocked assumptions doğrulandı; parser/wire-contract correction gerekmedi. PVS hâlâ real smoke ile doğrulanmadı.
- Exact credit consumption was not confirmed by the inference response.

## Yerel validation / pending review

Normalized RGBA PNG **1066×1600**; SHA-256 `6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db`.

Alpha min/max **0/255**, transparent **1422315**, opaque **283285**, intermediate **0**, mean alpha **42.35323346622889**. Toplam **1705600**. Empty/full guards geçti; exact source/version/SHA/boyut eşleşmesi korundu. No resize/crop/rotate/smoothing/morphology; RLE representation conversion ve PNG encoding dışında mask editing yok.

Revision `9b3c37cd-7179-48c8-afc3-04c09fbb1ea9`, candidate `a48b1d6c-a1c3-446d-92b3-50a1f690e353`; **pending**, revisionCount=1, activeApproval=null. Candidate-specific immutable development mask buffer'a bağlandı. No automatic approval; existing approval replacement yok. Review state version=3. Interactive inference ve retry **0**.

## Read-only Admin QA

1440px desktop ve **390px** mobile source natural size 1066×1600. Source/mask display rectangles eşit; aligned=true, horizontal overflow=false. QA script bütün POST ve provider URL erişimlerini abort eder; gerçek browser QA POST sayısı **0**. Sonrasında attempts hâlâ **1**, candidate pending, approval null.

- `%TEMP%/xinobi-product-surfaces-step4b2-desktop.png`
- `%TEMP%/xinobi-product-surfaces-step4b2-mobile.png`
- `%TEMP%/xinobi-product-surfaces-step4b2-evidence.json` yalnız safe local structural/source/review/geometry metadata içerir; raw provider response/key/header/base64 yok.

Görsel değerlendirme: alt vessel body iyi ayrılmış, upper vessel/handle/base/background dışarıda görünür; **lower spout maskeye dahil**. Alt kenar hafif jagged. Alignment başarısı designable/business/PrintArea/production approval değildir; aday onaylanmadı. Bu gözlem interactive düzeltmenin neden gerekebileceğini gösterir, bu oturumda uygulanmadı.

İlk GET-only QA scriptindeki Türkçe stdin string encoding locator timeout verdi; ASCII regex selector ile yerel QA tekrarlandı. Bu yalnız GET/screenshot tekrarından ibarettir; inference tekrarı yoktur.

## Smoke sonrası yerel regresyon

- `dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore --no-build -c Release --verbosity minimal`: **120/120**, skipped 0. Adapter/Step 1–3/API regresyonları ve 9 yeni **mock transport** single-budget/preflight/concurrency/failure/interactive-rejection test case dahil. No-build canlı in-memory host'un DLL'ini yeniden yazmamak için kullanıldı; aynı current sources daha önce 120/120 build+test geçmişti.
- `dotnet build services/api/Xinobi.Api.csproj --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false --verbosity minimal`: **0 warnings / 0 errors**.
- Admin existing installed Node 24.20.0 ile `tsc -b --pretty false`, `vite build`, `oxlint`: başarılı.
- Admin Playwright: **5/5**, **9.9s**. Test host provider reference; external/single-smoke gates false. Normal tests gerçek Roboflow'a düşemez; provider tests explicit mocked handlers kullanır.
- `git diff --check`: başarılı; yeni dosyalar ayrıca whitespace kontrolünden geçti.
- OpenAPI SHA-256 before/after **aynı**: `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`. Generated contracts komutları çalıştırılmadı; pre-existing modification korundu.

Yeni paket, production persistence/auth/jobs, renderer/Fabric.js/PrintArea veya source/reference asset değişikliği yok. Credential ve raw request/response loglanmadı. D04/D05/D08/D10 çözülmedi; retention/training şartları teyit edilmedi. Commit yok.

## Durma sınırı

Bu çağrı izni tüketildi. Başka automatic veya interactive inference yetkili değildir. Interactive Keep/Exclude için yeni açık kullanıcı izni, exact source/point list/request budget ve PVS wire/alignment validation gerekir. API restart memory state'i kaybeder; restart yeni inference izni sayılmaz. Production execution/storage/auth/audit/retention kararları ayrıca açık kalır.
