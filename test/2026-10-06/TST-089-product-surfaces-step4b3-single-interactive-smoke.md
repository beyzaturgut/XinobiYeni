# TST-089 — ProductSurfaces Step 4B-3 — single interactive Roboflow smoke test

Tarih: 06.10.2026. Seviye: EXPLICITLY AUTHORIZED REAL INTERACTIVE SMOKE / LOCAL VALIDATION / MOCK REGRESSION / VISUAL QA.

## Yetki ve preflight

Maksimum bir interactive çağrı açıkça yetkiliydi. Existing server-side user-secrets credential değişmedi ve değeri gösterilmedi. Yalnız `apps/web/public/assets/products/tea-maker-101-blue.webp`, source version `dev:tea-maker-101:blue:source:v1`, decoded 1066×1600, SHA-256 `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414` kullanıldı. Keep (420,920), Exclude (245,730), sıra ve exact source-pixel koordinatları doğrulandı. Başlangıç interactive counter=0; credential presence ve gates yalnız boolean olarak kontrol edildi.

`SingleInteractiveSmokeEnabled` default false; automatic/interactive smoke seçenekleri birlikte açılamaz. Exact endpoint/payload/source/point guard ve atomic tek-request bütçesi vardır. No redirects/retries. Automatic inference bu provider'da yasaktır. GET/startup/page-load inference yapmaz. API restart yeni izin vermez.

Önceki automatic API host'u kod aktarımı için durdurulmadan önce gerçek automatic mask ve güvenli review metadata temp snapshot'a alındı. Exact automatic mask SHA doğrulandı. Yeni development session'da aynı pending revision/candidate kimlikleri internal restoration ile korundu; public provider sözleşmesi değişmedi. Bu yalnız local smoke handoff, production persistence/Asset modeli değildir. Eski session token yeni session'da stale kabul edilir. Approval null kaldı.

## Tek çağrı ve deployed PVS

- Real interactive inference requests attempted: **1**; automatic inference **0**, retry **0**.
- `POST https://serverless.roboflow.com/sam3/visual_segment`, original bytes base64, server-side Bearer; bir prompt içinde ordered points `420,920,true` ve `245,730,false`; `multimask_output:false`, `format:rle`. Previous mask gönderilmedi.
- HTTP **200**, transport/capture **1312 ms**.
- Top-level: `inference_id`, `frame_id`, `time`, `resolved_model`, `predictions`.
- Prediction keys: `masks`, `confidence`, `format`; mask keys `size`, `counts`.
- Results **1**, selected order **0**, supplied score **0.9453125**. Score commercial correctness/approval değildir.
- RLE Object, size **[1600,1066]**, counts **String / compressed COCO RLE**.
- Step 4B-1 PVS parser assumptions doğrulandı; parser/wire correction yok.
- Exact credit consumption was not confirmed by the inference response.

## Normalization ve exact candidate

Source-aligned RGBA PNG **1066×1600**, SHA-256 `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`.

Alpha min/max **0/255**, transparent **1448452**, opaque **257148**, intermediate **0**, total **1705600**, mean **38.445555816135084**. Empty/full validation geçti. Exact source/version/checksum association korundu. No resize/crop/rotation/smoothing/morphology/cleanup; yalnız RLE representation conversion ve PNG encoding.

New interactive revision `115133d1-70a6-4377-a48d-b98556286b61`, candidate `327d232c-4315-4ee0-aa06-b3abe2507151`, **pending**, stateVersion=5, revisionCount=2. Lineage previous candidate `a48b1d6c-a1c3-446d-92b3-50a1f690e353`, previous automatic revision `9b3c37cd-7179-48c8-afc3-04c09fbb1ea9` ve exact mask bytes korunmuştur. Active approval null; automatic approval yok. Candidate-specific buffer ve eski mask endpoint'i çalışır.

Automatic mask SHA `6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db` ile source alpha pixel comparison: **26361 changed**, **26249 removed**, **112 added**. Interactive opaque **257148**. Önceki opaque **283285**; delta tutarlıdır.

## Admin ve görsel QA

Gerçek normal Düzelt → Koru/Hariç tut → Adayı yeniden oluştur akışı kullanıldı. Browser'ın CSS pointer yuvarlaması exact koordinatları değiştirmesin diye yalnız geçici QA DOM preview native 1066×1600 gösterildi; sonra mevcut responsive stil geri getirildi. Noktalar exact source values olarak kontrol edildi, input sırasında inference=0; explicit regenerate bir POST üretti. Başarı sonrası noktalar temizlendi, yeni pending aday gösterildi. Başka mutation/approval yapılmadı.

- Desktop 1440px ve mobile 390px overlay hizalı, coordinate shift yok, horizontal overflow=false.
- Ana alt body korunuyor; spout görünür biçimde dışarıda; handle/upper vessel/base/background dışarıda.
- Logo çevresindeki body dahil, ancak symbol/text piksellerinde küçük alpha boşlukları görünür. Renderer'in continuous-body/branding-last beklentisi açısından insan review gerekir; logo alanı kusursuz biçimde continuous denemez.
- Alt kenar hafif jagged ve küçük indentations içeriyor; büyük iç delik/disconnected island görünmüyor. Physical/PrintArea/D04 approval değil. Aday promising fakat otomatik olarak uygun/onaylı sayılmadı.
- `%TEMP%/xinobi-step4b3-interactive-desktop.png`
- `%TEMP%/xinobi-step4b3-interactive-mobile.png`
- `%TEMP%/xinobi-step4b3-automatic-vs-interactive.png` (yalnız offline QA Canvas, application/editor değişikliği değil).
- Safe local evidence/review/mask/comparison stats aynı temp dizininde; key/header/base64/raw response yok.

İlk QA launch yanlış Playwright module path nedeniyle browser/preflight öncesi durdu; mevcut @playwright/test yolu düzeltildi, inference attempt değildi. İlk automatic screenshot loading state'te alındı; karşılaştırma ayrı GET-only offline QA'dan üretildi. Standalone comparison CSS mask (webkit prefix olmadan) düzgün çalışmadı; geçici offline comparison Canvas ile üretildi. Existing Admin CSS webkit alpha mask görüntüleri doğru, değiştirilmedi. Lint NVM shim çalışmadı; mevcut gerçek Node binary ile geçti. Hiçbiri inference retry değildir.

## Yerel regresyon

- Backend/API: **126/126**, skipped 0; real call sonrasında no-build local rerun geçti. Six new interactive guard cases mocked transport kullanır: exact wire points, one-call success/failure budget, forbidden automatic, changed coordinates, extra/reordered points, mutually exclusive smoke modes.
- API Release build **0 warnings / 0 errors**, `OpenApiGenerateDocumentsOnBuild=false`.
- Admin typecheck/build/lint başarılı; Playwright **5/5**, **10.3s**, reference/mock hosts, external ve her iki smoke flag false.
- Normal tests gerçek provider'a fallback yapmaz; API test factory her iki smoke gate'i explicit false yapar.
- `git diff --check` başarılı.
- OpenAPI before/after SHA aynı: `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`. Contract generation çalışmadı.

Yeni paket/credential değişikliği yok. Renderer/Fabric.js/source/reference assets/PrintArea/Design/production Asset/persistence/jobs/auth değişmedi. D04/D05/D08/D10 açık; retention/training/billing miktarı teyitli değil. Commit yok.

## Durma sınırı

Tek interactive bütçe tüketildi. Automatic + correction + new pending review technical pipeline gerçek provider ile kanıtlandı; candidate approval suitability ayrı insan kararıdır. Başka inference yetkili değil. Restart yeni izin sayılmaz. Sonraki güvenli adım yalnız insan review / code review; yeni provider çağrısı için yeni explicit izin gerekir.
