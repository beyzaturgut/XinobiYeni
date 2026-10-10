# Development-only product-family mask geometry

Family geometry is created only by an explicit Admin action from an existing, current accepted mask. Catalog product ID is the family boundary; Admin explicitly confirms exact variant membership in the same physical model. A different catalog product is not eligible.

Storage: catalog-surface-review/family-geometry/{familyId}/{version}/geometry.json and independent upper-body.png / lower-body.png. by-product/{product-id SHA}.json selects the current immutable version. New geometry never updates an accepted variant. Runtime files are not source assets.

CM101's legacy approval is explicitly lower-body only. Upper geometry is missing; no upper candidate is invented. A genuine independently reviewed upper mask, combined with the lower region and transparent separation, must be accepted before a two-region family reference can be defined.

## Admin

Open http://127.0.0.1:5176 and the product-surface review. Select the exact approved reference product/variant. Expand the family-reference section, select only verified physical-model siblings, confirm the membership and save the geometry version. On the target variant choose similarity or limited affine and click Aile maskesinden taslak oluştur. This performs local mask alignment only: source photos and approved masks are untouched; no inference is requested.

Inspect all junctions and the persisted edge diagnostics. These approximate orientation-aware edge distances are not a boundary-quality certificate. Logo, handle, spout, metal seams and base always require manual review. No local deformation is applied.

The editor add brush is limited to a bounded editing envelope around the transferred mask (maximum 32 source pixels). If correction needs more than this envelope, stop and prepare a separately reviewed mask. Use protection brushes on the TARGET source photograph: branding RGB cannot come from the reference color. Save a new pending draft, open the existing canonical protection-pattern test and require zero outside-mask, branding and alpha differences. A new edit invalidates that proof. Approval additionally requires explicit family alignment and target-branding review. Neither saving nor alignment approves a surface.

## Pilot and tests

node tools/test-family-mask-registry.cjs

Tests publish synthetic approvals only in isolated integration-runtime test storage; never in the active registry. The real CM101 to CM104 pilot stays pending in its isolated family-real-pilot directory. CM104 remains unavailable to customers until a separate explicit Admin approval; this implementation task does not approve it.

Server modules require restarting only the owned 3046 editor service after permission. Admin Vite reloads the UI. Other QA services need no restart. Keep Cloudflare and Roboflow untouched; family transfer has no outbound provider path.
