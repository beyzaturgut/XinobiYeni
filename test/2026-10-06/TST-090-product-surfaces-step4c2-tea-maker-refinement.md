# TST-090 — ProductSurfaces Step 4C-2 — Tea Maker opt-in enclosed-hole refinement

Tarih: 06.10.2026. Seviye: LOCAL DETERMINISTIC / SYNTHETIC + REAL LOCAL FIXTURE / API REGRESSION / ADMIN E2E / VISUAL QA.

## Sınır ve aktivasyon

Real Roboflow inference **0**; mevcut credential okunmadı/kullanılmadı/değiştirilmedi, görsel dışarı gönderilmedi, kredi kullanılmadı. Existing mocked adapter testleri yalnız synthetic test key + fake handlers kullanır. Yeni paket **0**. Commit yok.

`ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled` default false. Yalnız development review opt-in içinde mevcut exact Tea Maker fixture için açılır. Fixture policy `maxEnclosedHoleAreaPixels=5718`, inclusive, connectivity=8; global default veya başka ürün kuralı değildir. Reference provider + external/single-smoke flags false zorunlu. Kombinasyon yanlışsa fail closed; real credential okunmadan önce Program guard çalışır. Bu local refinement oturumunda segmentation revisions POST'u da reddedilir.

Source mevcut WebP 1066×1600; SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`. Product/variant/shared Asset development referansları mevcut fixture'dan çözülür; parallel Asset/media persistence yok. Raw PVS PNG hash doğrulanarak `tests/Xinobi.Architecture.Tests/Fixtures/tea-maker-blue-interactive-raw.png` içine immutable offline regression evidence olarak kopyalandı; source asset veya renderer asset'i kopyalanmadı/değişmedi. Raw provider HTTP response/key saklanmadı.

## İşlem ve invariant

Provider-independent `Infrastructure/MaskProcessing/DesignableMaskRefiner` validated alpha>0 foreground'u korur. Alpha=0 background için border-seeded 8-connected flood fill exterior'u işaretler. Yalnız kalan enclosed components supplied policy alan sınırını karşılıyorsa alpha255 olur. Diğer RGBA pikselleri korunur. Unpremultiplied raster doğrudan PNG encode edilir; existing AlignedImageInspector + .NET SHA-256 uygulanır.

RoboflowMaskNormalizer yalnız RLE representation conversion olarak değişmeden kaldı. Branding overlay algoritma girdisi değil. Resize/crop/rotate/antialias/blur/morphology/contour/bottom cleanup yok. Derived mask yeni candidate-specific reference ve buffer snapshot alır; raw bytes/metadata/identities overwrite edilmez.

## Gerçek fixture sonucu

| Ölçüm | Raw | Derived |
|---|---:|---:|
| Boyut | 1066×1600 | 1066×1600 |
| Foreground | 257148 | 262866 |
| Transparent | 1448452 | 1442734 |
| Intermediate alpha | 0 | 0 |
| Foreground components (8) | 5 | 1 |
| Enclosed holes (8) | 1, area5718 | 0 |

Holes found **1**, filled **1**, added pixels **5718**. Exterior background changed pixels **0**. Outer foreground boundary adjacent to border-connected exterior changed pixels **0**. Existing foreground RGBA pixels unchanged. Bottom irregularities remain exactly unchanged. Raw SHA before/after `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`; derived SHA `4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43`. Repeated deterministic processing bytes/checksum identical. Expected measurements matched; threshold never changed to force a result.

## Provenance ve review

New refinement revision/candidate is pending; raw interactive identities remain `115133d1-70a6-4377-a48d-b98556286b61` / `327d232c-4315-4ee0-aa06-b3abe2507151`. Raw provider score retained as historical provider metadata; derived candidate invents no score. Domain `MaskDerivation` records exact source, parent raw IDs/checksum, algorithm `enclosed-background-fill`, version `1`, connectivity8, maxArea5718, holesFound/holesFilled/pixelsFilled, derived checksum and IDs. Refinement is distinct from inference and DesignVersion.

Explicit local endpoint: `POST /api/v1/admin/dev/product-surfaces/tea-maker-101-blue/revisions/{revisionId}/candidates/{candidateId}/refine`. Client supplies only session + expected state version, not policy/source checksum/path. Existing local/dev gate, safe Problem Details, exact target/source checks, process-local lock and state-version409 protection retained. Source identity is checked again before commit. Previous approval is not silently replaced. Raw remains independently retrievable from its original mask route.

Final QA session after rebuild: derived revision `6e0c8c04-fcc1-4ee1-a502-28983b2c1db4`, candidate `d882f4a7-8ae0-49ed-8af7-3bd69653b461`, stateVersion2, revisionCount2, activeApproval=null; both raw and derived pending. Previous automatic ID remains raw lineage context; this local fixture does not pretend to restore production history. Rebuild/restart loses derived session; local deterministic QA was repeated against immutable raw, without any inference.

## Admin QA

Existing Admin surfaces/actions/styles reused. Explicit local “Kapalı bölgeyi düzenle” creates derived pending candidate. “Ham / Düzenlenmiş” is a comparison toggle only; review target remains the derived identity. Raw comparison disables approval/rejection; selected state uses existing teal styling. Concise actual evidence: “1 kapalı bölge dolduruldu · 5.718 piksel”. No generic threshold control/manual editor/branding dependency.

Desktop1440 and mobile390 image/overlay rectangles match, overflow=false. Visually logo hole disappears; body extends under branding. Spout, handles, upper vessel, base/background and left/right/bottom outer boundaries stay excluded/unchanged. Bottom jaggedness still visible and intentionally unmodified. Commercial suitability/PrintArea/DPI/manufacturing/D04 approval is not implied.

- `%TEMP%/xinobi-step4c2-review-raw-desktop.png`
- `%TEMP%/xinobi-step4c2-review-derived-desktop.png`
- `%TEMP%/xinobi-step4c2-review-derived-mobile.png`
- `%TEMP%/xinobi-step4c2-raw-vs-derived.png` (offline QA only)
- `%TEMP%/xinobi-step4c2-derived-mask.png`, `xinobi-step4c2-review-evidence.json` (safe local evidence)

QA browser blocks external requests and allows only local refinement POST; subsequent comparison is read-only. Live QA approval/rejection count0. API/Playwright approval cases use isolated test sessions or a mocked decision response, not the human-review QA candidate.

## Test/build evidence

- Focused `DesignableMaskRefinerTests`: **17/17**. Inclusive/exclusive threshold, multiple holes, border/exterior channel, diagonal channel, handle opening, concave/thin/disconnected/spike/large hole preservation, intermediate alpha preservation, raw/determinism/source checks, real fixture topology/outer-boundary/RGBA invariants.
- Five new `ProductSurfaceRefinementApiTests`: exact pending provenance, raw bytes/IDs, explicit derived approval, stale/wrong-target409, previous approval preservation, concurrent one-commit guard, disabled opt-in, disabled inference, wrong variant route.
- All backend/API regressions: **148/148**, skipped0, using `dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj -c Release --no-restore -p:OpenApiGenerateDocumentsOnBuild=false`.
- API Release build **0 warnings / 0 errors**, OpenAPI generation disabled.
- Admin `tsc -b`, `vite build`, `oxlint`: passed with existing Node24.20.0 binary.
- Admin Playwright **6/6**: existing5 + local refinement integration, comparison selection, exact target, overlay/mobile alignment, no inference POST, mocked approval, actual local candidate stays pending. Test hosts explicitly disable external/smoke gates.
- `git diff --check`: passed; new text files checked separately for trailing whitespace.
- OpenAPI before/after SHA identical: `01F859B52FE8543303C3201364718EEF5F0610716A78250C57FDE47B12C24FE6`. No contract generation/revert/normalization.

Initial Admin refinement test proxy dropped original JSON header and failed; corrected to preserve request headers, then6/6 passed. First style append used wrong cwd and wrote nothing; correct path used. Direct pixmap encode initially needed nullable guards to satisfy strict API build; guards added, final148/148 and build clean. No expected Tea Maker topology mismatch, tests weakened, threshold adjustment or provider call occurred.

## Açık sınırlar

Tea Maker-specific opt-in remains; one image does not validate a universal small-hole policy. Algorithm is reusable but policy/business safety is not generalized. Production persistence/auth/common AuditLog/provider transfer/retention decisions remain open. Renderer/Fabric.js/source/reference/branding assets and production Asset/Variant/PrintArea/Design infrastructure unchanged. D04/D05/D08/D10 unresolved. Stop after this step; next safe action is human review/code review, no further inference.
