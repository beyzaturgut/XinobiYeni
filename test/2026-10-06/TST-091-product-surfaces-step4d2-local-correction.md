# TST-091 — ProductSurfaces Step 4D-2 — minimal local Add/Remove correction

Tarih: 06.10.2026. LOCAL HUMAN CORRECTION / DETERMINISTIC RASTER / API / ADMIN PLAYWRIGHT / VISUAL QA.

## Scope and safety

Real Roboflow requests **0**, credential unused, external image transfer **0**, new packages **0**, commit **0**. Tests use existing mock handlers/reference providers; external and both smoke gates are false. No cleanup, morphology, smoothing, antialiasing or full mask editor added. Storefront renderer/Fabric.js/source/reference mask/branding/provider implementation unchanged. Shared Asset/Variant remains the existing development fixture boundary. Mask/review is not PrintArea, DesignVersion, physical print/DPI/manufacturing or D04 approval. D04/D05/D08/D10 remain open.

## Contract and deterministic processing

Development-only POST `/api/v1/admin/dev/product-surfaces/tea-maker-101-blue/revisions/{revisionId}/candidates/{candidateId}/correct` accepts sessionId, expectedStateVersion and ordered operations `{operation: "add"|"remove", radius, points:[{x,y}]}`. No source path/checksum, reviewer or provider input accepted. Existing loopback/origin/development opt-in and safe Problem Details retained. Exact displayed parent, session/version and authoritative current source are checked under the process-local gate; source checked again before commit. Wrong targets 404, stale state/source 409, invalid operations or structurally invalid result 422. No segmentation provider invocation exists in this operation.

Source-pixel bounds are half-open `[0,width) × [0,height)`. Finite decimal coordinates/radii retained. Limits: 1–100 operations, 1–2000 points/stroke, 5000 total points, radius 1–32 source pixels, 25,000,000 bounding-box raster visits/request. These conservative development limits bound local work, not physical print dimensions. UI radius choices 2/4/8/16px, zoom 1–8×.

`ManualMaskCorrector` uses pixel centers `(x+.5,y+.5)`, squared distance to each continuous segment <= radius² (capsules including endpoints); single point is a circle. Ordered Add sets alpha255, Remove alpha0. Brush footprint clips at the raster border, while out-of-source point centers are rejected. No interpolation of mask pixels, feathering, morphology or antialiasing. Untouched decoded RGBA preserved. PNG encoded with existing SkiaSharp unpremultiplied pixmap; existing AlignedImageInspector checks exact dimensions/alpha/non-empty/non-full/source and .NET SHA-256. Pathological work exceeding the limit produces no candidate.

## Immutable derivation and review

New ManualCorrection revision/candidate is pending. Parent/raw/refined bytes/checksums/IDs remain unchanged; existing active approval is not replaced. `MaskCorrectionProvenance` stores exact SourceMediaIdentity, parent revision/candidate/checksum, immutable ordered operations, algorithm `source-pixel-capsule-strokes`, version `1`, output SHA-256, derived IDs and fixed development reviewer. Provider score is not invented. Outer silhouette may change intentionally here; Step 4C exterior-preservation invariant is deliberately not applied to explicit human strokes. Exact approval remains a separate operation. Production authenticated reviewer/common AuditLog/storage are not implemented.

## Admin behavior

Focused native Canvas 2D overlay only while correcting, otherwise existing CSS-alpha review remains. Source image is unchanged. Local preview uses the same pixel-center coverage model but is not authoritative; successful submission reloads exact backend mask through candidate-specific URL. Zoom/pan use current contain rectangle and source coordinates, not DPR. Border/outside clicks are ignored, stroke ends on exit and does not bridge re-entry. Continuous segments prevent fast-motion gaps. Zoom/pan/brush/Undo/reset/drawing produce zero POSTs. One explicit create click produces one local correction POST.

Unsaved correction mode blocks Approve/Reject and raw/derived switching. Failure keeps strokes and Undo. 409 refreshes review without retry, freezes the original parent preview and forbids submitting strokes to a different candidate; explicit discard exits safely. Success clears submitted strokes and switches to new pending candidate. Zoom/pan are view-only, not persisted. Reload/navigation/API restart still lose development state; no durable storage or production auth is claimed.

## Tea Maker QA

Exact source 1066×1600 SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`.
Parent refined SHA `4f3fffe81e442b66808e219514d50bd2e37b7db348ef512ebcb6f649dd8deb43`, foreground262866. Parent generated locally from immutable stored raw fixture, not by inference. UI test asserts this exact parent checksum before drawing.

Human-selected Add stroke near `(435,1230)`→`(470,1230)`, radius4, zoom4/pan, 9 actual browser source points; decimal dispatch coordinates retained. Backend output SHA `7979b30e9ece0fa00cb002aca23fcd07cf82b28a73341d2a2a29ad2ae540a034`. Local pixel comparison: **88 added, 0 removed**, foreground262954. Two central bottom indent artifacts substantially reduced; remaining neighboring jaggedness intentionally not automatically cleaned. Logo/body inclusion and protected parts untouched by this localized stroke. Spout correction not separately submitted; the same bounded Remove tool is available for local spout-boundary corrections. This is a representative correction, not reproduction of the manual reference or commercial approval.

QA candidate `56bef5fa-8d96-42f5-bf81-f9b690e37fff`, revision `b1107a1c-25e2-4dee-bbf0-5ad35da6a012`, pending, activeApproval=null. Parent remains retrievable with original bytes. Test host shutdown loses this in-memory state; temporary PNG/evidence retain local QA only.

Desktop and 390px mobile visually inspected: controls/overlay usable, no horizontal overflow, selected tool uses existing teal state, zoom/pan/source mapping tested. Keyboard focus/Enter for Undo tested. Drawing POST count0; explicit successful create count1; inference POST count0. A separate failed mocked submission demonstrates retained strokes/Undo, stale test demonstrates no implicit retarget/retry. Synthetic backend/mock review tests exercise approval rules; actual QA candidate was not approved/rejected.

QA artifacts (temporary, not application assets):
- `%TEMP%/xinobi-step4d2-unsaved-desktop.png`
- `%TEMP%/xinobi-step4d2-corrected-desktop.png`
- `%TEMP%/xinobi-step4d2-correction-mobile.png`
- `%TEMP%/xinobi-step4d2-bottom-before-after.png`
- `%TEMP%/xinobi-step4d2-parent-mask.png`, `xinobi-step4d2-corrected-mask.png`
- `%TEMP%/xinobi-step4d2-correction-evidence.json`, `xinobi-step4d2-pixel-evidence.json`

## Checks and execution evidence

- Focused correction tests: **21/21** (18 raster/rules, 3 development API).
- Full backend/API/architecture regressions: **169/169**, skipped0. `dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj -c Release --no-restore -p:OpenApiGenerateDocumentsOnBuild=false -p:BaseOutputPath=bin/step4d2/`.
- API Release build, separate ignored output: **0 warnings / 0 errors**, OpenAPI generation false.
- Admin TypeScript `tsc -b`, Vite build, oxlint: passed, final lint warning0.
- Admin Playwright **10/10**, including 4 new correction tests and all existing6. Test hosts reference-only, external/smoke=false. Added optional `PRODUCT_SURFACES_TEST_API_BINARY` permits isolated Release binary; separate local fixture host5019 avoids sharing mutable review state with refinement regression host5017.
- `git diff --check` passed; new source/test/doc text checked separately for whitespace. Git CRLF conversion notices are not diff errors.
- OpenAPI SHA before/after identical `01f859b52fe8543303c3201364718eef5f0610716a78250c57fde47b12c24fe6`.
- Manual renderer mask before/after identical `8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06`.
- Raw regression PNG before/after identical `7ddf567572abf6b696edba4d2a533b5f74ab2a1e9ffb85fdfca9f06c27359dbf`.

Initial test compile required explicit point constructor types for C# params overload. Initial sandbox API tests returned500 from restricted Windows test-host/Event Log access; unrestricted local host run passed3/3, then full169/169. Normal Release output was locked by existing API process; apphost-disabled retry also hit DLL lock. Existing process was preserved, validation moved to `bin/step4d2/` and succeeded. Initial Playwright drawing used stale page coordinates after toolbar-induced scroll; helper now obtains current geometry after scroll. Teardown waits for loaded mask. Visual QA then exposed initial test racing fixture load and selecting raw; exact refined checksum is now mandatory. Early lint notices from state updates/ref reads in render corrected using loaded ImageData state and memoized pixel preview. No tests weakened, provider call, threshold adjustment or source-asset change occurred.

This closes the minimal single-product technical segmentation-onboarding PoC capability, subject to human acceptance. It does not close production onboarding, mask commercial quality, durability/authentication, broader-product validation or any D decision. Next safe step is human review of the UI/QA only; no further implementation/inference authorized by this record.
