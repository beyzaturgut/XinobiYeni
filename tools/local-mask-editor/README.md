# Development-only local mask editor

> **10.11.2026 — Legacy development tools.** These instructions describe the historical variant/family QA environment, not the current single-source workflow. Start with the [current workflow](../../docs/runbooks/single-source-personalization.md). Do not use these scripts to create a new single-source profile, transfer masks between photos or claim current acceptance. Existing data and compatibility readers remain supported.


Start from D:\XinobiYeni-integration:

    node tools/local-mask-editor/server.cjs

Open http://127.0.0.1:3045. No API, Admin or inference service is used.
Optional port: $env:MASK_EDITOR_PORT="3046" before starting.

Default inputs are the verified CM101 source, original SAM3 bounds, pending
refinement -02 and its locked branding overlay. The editor never edits inputs.

Use the mouse wheel to zoom around the pointer. Select Kaydır and drag to pan.
Choose Sil / Ekle and set brush diameter in source pixels. Ekle cannot extend
outside original SAM3 alpha or into branding. Region buttons zoom to review
areas; they are configuration, not editor geometry. Geri al / Yinele operate on
completed strokes. History retains approximately 2 million changed pixels,
plus the current stroke; older undo strokes may be discarded.
Turquoise is editable mask; orange is locked branding. Toggle mask visibility
or opacity to inspect the original photo. Brush output uses binary alpha.

Yeni bekleyen sürümü kaydet validates and writes a new UUID/timestamp directory
under services/api/App_Data/cm101-sam3-review/manual-editor:
mask.pending.png, unchanged branding-protection.png, full-resolution review,
closeup-N.png and validation.json. Nothing is approved or sent to catalog.
Review all boundaries manually. The supplied partial mask still has unresolved
ring/contact pixels; this tool does not automatically correct them.

Reusable configuration: pass a local JSON path to server.cjs with absolute
source, original, mask, branding, output paths, sourceSha256 and optional
regions [{name,x,y,width,height}]. All images must share source dimensions.
Branding can be a transparent source-sized PNG when no protection is required.
Decoder cap is 40 million pixels; save body cap is 24 MB. Server only binds
127.0.0.1, validates Host/Origin and rejects cross-site saves. This is a local
development tool, not a production authenticated service.

Tests (server running):
    node tools/local-mask-editor/test.cjs
    node tools/local-mask-editor/test-inputs.cjs

Test exports remain isolated and pending; they are not corrections or approvals.
## Admin inline approval and CM101 customer preview

No separate approval page is used. Open http://127.0.0.1:5176, choose
Ürün yüzeyi incele (geliştirme), CM101 and Metallic Navy, then open the editor.
Correct the pending ring/contact boundaries. The orange logo protection stays
locked. Save creates a pending revision only. To accept the current edited
mask, explicitly confirm boundary review and click Maskeyi onayla. The server
rechecks exact current catalog product/variant/source bytes and dimensions,
original candidate bounds and branding exclusion. It publishes an immutable
UUID version and replaces the current pointer atomically only after validation.
The original candidate, drafts, source and catalog records are not modified.

The approval/delivery server is a separate development-only Node service on
3046. Start in D:\XinobiYeni-integration:
    $env:MASK_EDITOR_PORT="3046"
    node tools/local-mask-editor/server.cjs

The earlier 3045 editor can stay running. Do not stop other occupied ports.
Admin embedding allows only http://127.0.0.1:5176 by default.

Customer preview (after explicit approval):
http://127.0.0.1:3032/xinobi-u/kendi-gorselin/?product=DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6&variant=DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1
The shared PlacementStudio also consumes completed DesignStudio
patterns at /xinobi-u/onizleme/. No paid generation is enabled by this tool.

From apps/web, start the isolated development preview:
    $env:PRODUCT_SURFACES_DEV_PREVIEW_PROXY="true"
    $env:PRODUCT_SURFACES_DEV_PREVIEW_API_PORT="5013"
    node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3032

The existing demo stays on 3030. The preview uses the real catalog read API on
5019 and the existing demo/DesignStudio read API on 5013. CM101 accepted inputs
and versioned media go to the local 3046 service. This does not add production
publication or a SQL model; accepted files are isolated under manual-editor/
approved. Missing, changed or corrupt accepted inputs fail closed.

The renderer rejects more than 20 million pixels or a side above 6000 pixels.
CM101 uses full-resolution processing (18.8 million pixels), without altering
source identities. It can consume significant browser memory and is slower
than the demo. Bounds outside the mask are preserved; physical boundary
correctness remains the administrator's visual responsibility.
