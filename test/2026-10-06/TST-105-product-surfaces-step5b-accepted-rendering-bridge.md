# TST-105 — ProductSurfaces Step 5B — Development Accepted-Surface → Storefront Renderer Bridge

- Date: 06.10.2026. Branch/HEAD: feature/product-personalization / acc0c99. No commit.
- Classification: LOCAL REAL MEDIA / DEVELOPMENT API / WEB ADAPTER / PIXEL REGRESSION / E2E / ACCESSIBILITY / BUILD / INTEGRITY.
- Roboflow calls: 0; credential use: 0; external product-image transfer: 0; packages: 0.

## Contract and safety

Development + `ProductSurfaces:DevelopmentStorefrontPreview:Enabled` (absent = false) enables only loopback GET `/api/v1/dev/product-surfaces/{productReference}/{variantReference}/rendering-inputs`. Optional development-only `RepositoryRoot` follows the existing fixture convention. Response is no-store, `scope:development-preview`, development product/variant refs, `previewAvailable`, nullable rendering inputs. Inputs contain surfaceVersion, sourceMediaVersion, dimensions, source/mask/branding URL+SHA and brandingRequired. No provider/revision/reviewer/correction data.

Accepted manual prototype reference is NOT an AI ReviewDecision. Current review candidate and approval are not consulted or modified. Source is 1066×1600, SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`; mask is 1066×1600 RGBA, SHA `8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06`; branding is required/aligned, SHA `7f2337118d63980f4e3e36ad502bc2b92d0df88821a60d96dcfef1469dda1c88`. All hashes remain unchanged. Wrong/missing/invalid media or wrong product/color returns unavailable without fallback.

`blue` is a development reference, not a production ID. Shared Catalog/Asset/approved-surface resolution replaces this deletable fixture boundary later. No production persistence/storage/auth/PrintArea/commerce was added. D02/D04/D05/D08/D10 remain open; preview is not commercial enablement or manufacturing acceptance.

## Local activation (no secret)

API: set `ProductSurfaces__DevelopmentStorefrontPreview__Enabled=true` in the local process and use Development. RepositoryRoot defaults to repository root relative to services/api; supply explicitly when launching a DLL from another cwd. Leave review/external/smoke gates disabled for this bridge.

Web: set `PRODUCT_SURFACES_DEV_PREVIEW_PROXY=true` in the local Next dev process. Narrow proxy target is loopback port5003; `PRODUCT_SURFACES_DEV_PREVIEW_API_PORT` optionally chooses another local port (1024–65535). Opt-in uses ignored `.next/product-surfaces-preview` output to coexist with the already running normal dev server. Production build remains static export and has no proxy; without a read seam it shows preview unavailable, never a static fallback mask.

Same-origin existing asset paths carry checksum query versions. No asset duplication or object storage. Browser Canvas remains readable. This does not make mutable local files production immutable assets.

## Execution evidence

- Focused `DevelopmentAcceptedSurfaceTests`: 18/18. Complete xUnit/API/architecture suite: 187/187. Command: `dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false -p:OutputPath=bin/step5b-debug/`; focused filter `FullyQualifiedName~DevelopmentAcceptedSurfaceTests`. Windows EventLog disabled for local test process; new factory also clears logging providers.
- Release: `dotnet build services/api/Xinobi.Api.csproj -c Release --no-restore -p:OpenApiGenerateDocumentsOnBuild=false -p:OutputPath=bin/step5b-release/`: 0 warnings, 0 errors.
- Node24.20.0 was invoked from the existing nvm install because the shell shim had no active version. No install or package edit. `tsc --noEmit`, complete web ESLint, Next build passed. Initial sandbox Google Inter download failed; permitted build succeeded without product transfer. No unrelated font refactor.
- Playwright: accepted-surface + existing product-pattern-preview/product-lighting/product-surface-warp: 15/15 (9 bridge +6 renderer/helper). Existing product/studio/editor interaction/accessibility: 6/6. Chrome, local gated API with review/external/smoke false; test static server proxies only the rendering-input GET. No provider calls. Controlled intercepted responses cover loading, error, invalid dimensions/required branding, gated404 and unavailable variants.
- Real local Next dev proxy on3014 to API5024: blue ready, silver unavailable. Existing localhost3000 dev server was not stopped. Test runs used independent ports after initial sandbox teardown interference. Next automatically added isolated output type includes in tsconfig.
- Pixel regression: canvas1066×1600; source/mask/branding dimensions1066×1600; outside differences0, branding differences0, coverage gaps0, changed inside261549, shaded inside251333. x/y/scale/rotation/curvature controls and cached shading/warp regressions passed.
- Desktop1440×1000/mobile390×844 visually inspected. Lower body pattern, protected spout/handle/upper/base, unchanged branding, lighting/curvature; no horizontal overflow. Existing mobile heading/product-stage placement was not redesigned.
- QA: `%TEMP%/xinobi-step5b-desktop.png`, `%TEMP%/xinobi-step5b-mobile.png` (temporary, not app assets).
- Initial new-test issues: InvalidDataException required explicit safe catch; cookie panel reappeared on full page load; Next route-announcer required feature-scoped alert selector; deserialized point-list value comparison needed JSON rather than reference equality. Corrected without weakening required behavior.
- `git diff --check`: passed. OpenAPI SHA before/after `01f859b52fe8543303c3201364718eef5f0610716a78250c57fde47b12c24fe6`. No generation/check command executed. Source/manual/branding unchanged; renderer algorithms and Admin unchanged.

## Result / limitations

Accepted development reference → validated bundle → web adapter → EditorWorkspace → original renderer is proven locally. AI candidate approval → durable production publication is NOT proven or implemented. This bridge is only Tea Maker blue front-view1066×1600. No automatic masks/refinement/correction, no cart/order or physical calibration. Next action is user QA/code review, not another inference or production rollout.
