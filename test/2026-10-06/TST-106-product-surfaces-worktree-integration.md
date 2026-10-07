# TST-106 — ProductSurfaces separate-worktree integration

Date: 06.10.2026. Branch integration/product-surfaces-step5b; checkpoint e325dd7 + origin/main 529c107. Merge is not committed/pushed. Original worktree sources unchanged.

## Composition and safety

Incoming LocalCommerce/catalog/variants/categories/content/media, DesignStudio composition and current Admin/storefront are preserved. ProductPatternPreview is the sole product-surface renderer; its implementation, lighting and warp helpers are byte/content unchanged from checkpoint. Removed experimental apps/web/src/lib/product-surface.ts and replaced its two consumers (personalization-feature and xinobi-u/onizleme/product-preview). The old free-preview utility now invokes mocked/local canonical Playwright coverage.

GET /api/v1/dev/product-surfaces/commerce/{productReference}/{variantReference}/rendering-inputs explicitly accepts only DEMO-P101 / DEMO-V101-B with current commerce variant.Image exactly /assets/products/tea-maker-101-blue.webp, then invokes the existing authoritative accepted-reference resolver. No color alias or fallback. Development + explicit storefront-preview flag + loopback only. Source 1066x1600 SHA da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414; manual mask SHA 8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06; required branding SHA 7f2337118d63980f4e3e36ad502bc2b92d0df88821a60d96dcfef1469dda1c88. All unchanged. No AI candidate publication, fabricated ReviewDecision, production identity/storage/PrintArea or D resolution.

Validation processes explicitly set DesignStudio:WorkerEnabled=false and ExternalInferenceEnabled=false, ProductSurfaces external/smoke flags false. DesignStudio worker tests explicitly register only a fake provider. No Roboflow/Cloudflare inference or credential use. Zero packages installed; existing dependency-cache junctions used only in integration worktree.

## Results

- Entire backend/API/architecture suite: 214/214 passed, including new commerce bridge 10 cases and incoming commerce/DesignStudio tests. dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false. Release API build passed, 0 warnings/errors.
- Admin: TypeScript build, Vite build and configured lint passed. ProductSurfaces Playwright 10/10 passed, new shell desktop/mobile included.
- Web: next build --webpack passed (27 static routes), TypeScript and ESLint passed. Turbopack cannot resolve the reused node_modules junction outside worktree root; no renderer change was made for this tooling constraint.
- Final full web Playwright: 55/65 passed; 17/17 accepted-surface/commerce/lighting/pixel/warp tests passed. Home touch 5/5 and navigation 3/3 passed. Test-only static server root-path guard fixed after an initial 46/65 run.
- Five preserved UI contrast failures: home CTA white/red 3.97; login gray text; assistant gray text; Xinobi gray span; legal gray paragraphs. Five legacy interaction expectation failures: search result count, old AI demo controls, catalog variant count, old favorite label, old simple personalization text/style demo. No assertions weakened or unrelated UI redesigned. These remain for human review.
- Canvas pixel evidence: 1066x1600; outside-mask differences 0; branding differences 0; initial coverage gaps 0; shaded interior pixels 251333. Curvature-zero byte equality and transform/lighting tests pass.
- Desktop1440/mobile390 screenshots inspected: pattern restricted to lower body, spout/handle/upper/base protected, branding on top; lighting/curvature retained; no overflow in canonical preview. QA paths: TEMP/xinobi-integration-canonical-1440.png and TEMP/xinobi-integration-canonical-390.png. Admin TEMP/xinobi-product-surfaces-step3-desktop.png and mobile.png inspected.
- Integration resolution git diff --check passes. Entire cached incoming merge check reports pre-existing Markdown hard-break trailing spaces in two Proje Yönetimi docs and a blank EOF in incoming site-header.tsx; not changed as unrelated.
- OpenAPI approved baseline/final SHA 01f859b52fe8543303c3201364718eef5f0610716a78250c57fde47b12c24fe6. New worktree checkout initially materialized CRLF bytes (155de2a42f4732e527448cf2577162d36e3b8724812fd9ec8439dce8a2e09d48); exact approved external-backup bytes restored only in integration worktree. No regeneration/normalization; excluded from resolution staging. Original OpenAPI untouched.
- Incoming TST-074–086 retained; ProductSurfaces TST-074–092 renamed deterministically to TST-087–105, including links/ranges. Both execution histories retained.

Not production-ready; no merge commit or push. D02/D04/D05/D08/D10 remain open.
