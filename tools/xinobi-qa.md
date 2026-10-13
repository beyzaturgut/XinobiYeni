# Unified D: XINOBI U QA

From D:\XinobiYeni-integration, ONE command enables the complete local experience:

    node tools/start-xinobi-qa.cjs --cloudflare --roboflow

This is an explicit runtime opt-in to the existing Cloudflare provider, not an
inference request. Generation happens only after the customer clicks the AI
button. Five preference descriptions are sent; the product photo is not sent.
The application daily generation limit is disabled only in Development. Existing usage survives restart and is not reset. Failed/time-out jobs
are not retried. An existing queued/running job blocks enabled startup so it
cannot be replayed merely by opening the environment.

Offline mock/testing mode (default):

    node tools/start-xinobi-qa.cjs

Read-only cold-start preflight:

    node tools/start-xinobi-qa.cjs --cloudflare --check

No builds, installs or cache copies. Existing API Release DLL and Admin/Web
node_modules are required. All required ports are checked before any start;
occupied ports stop the launcher without killing or replacing anything. Do not
run a second launcher over an existing environment. No automatic port migration.
On startup failure, already-started services are left intact and their owned PIDs
are listed in App_Data/integration-runtime/unified-qa/processes.json. Check those
PIDs before manually stopping anything. Never stop unknown processes.
Keep the launcher terminal open during QA. Logs are ignored local runtime data
in that same directory. No secret values or CLI credentials are printed.

## Addresses

- Admin: http://127.0.0.1:5176/
- Customer: http://127.0.0.1:3032/xinobi-u/
- Own image: http://127.0.0.1:3032/xinobi-u/kendi-gorselin/?product=DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6&variant=DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1
- Questionnaire: http://127.0.0.1:3032/xinobi-u/sorular/?product=DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6&variant=DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1

Admin: choose Urun yuzeyi incele (gelistirme), CM101, Metallic Navy, then open
Yerel maske editorunu ac. Local saving creates pending revisions; approval still
requires explicit boundary review and exact server-side source/mask validation.
The launcher never saves, edits or approves a mask. The original demo review
remains available in the default fixture selection. Demo output is unchanged.

Customer: choose own image or questionnaire. A ready generated result leads to
Urunumde dene and the same accepted CM101 canonical renderer. Unsupported
variants do not borrow this mask. Paid generation in this unified environment
is for real-catalog sessions; the demo API is kept generation-disabled.

## Services (no reconfiguration between features)

- Demo API 5013 (also 5003 for earlier development routes): isolated demo data,
  gated reference review/refinement and manual accepted fixture. Inference OFF.
- Real catalog API 5019: reads existing real-catalog-qa; worker/inference OFF.
- Design API 5020: same real catalog, existing questionnaire-preview-sessions;
  single generation worker only in --cloudflare mode.
- Design proxy 5021: exact loopback Host/Origin and narrow session routes;
  generation requires --cloudflare. No retries or demo fallback for generation.
- Existing mask editor/delivery 3046: preserves current approved pointer/files.
- Admin 5176: real catalog reads proxied to 5019; demo review to 5013. QA-only
  catalog writes return 405 so received data cannot be changed through Admin.
- Web 3032: same-origin catalog/design/accepted media routes.

No process needs to be stopped to move between Admin, own-image and questionnaire.
No worker runs in the catalog/demo APIs. No external job starts from GET, startup,
selection or mask editing. Roboflow smoke, catalog and experimental segmentation
paths are explicitly disabled. This command CANNOT authorize a paid mask request;
a separate explicit user consent and guarded execution path would be required.

Credentials remain in existing .NET User Secrets (Cloudflare:AccountId and
Cloudflare:ApiToken), or server environment fallback. Never NEXT_PUBLIC variables.
GET design-studio/status reports configured status without revealing values.
This local readiness check cannot prove live credentials/quota without a real
request. API HTTP-client URL logging is disabled to avoid account IDs in logs.

## Network-safe checks

Before startup (proxy unit tests need the free 5021 port):
    node --test tools/test-xinobi-qa.cjs

With the offline launcher running:
    node tools/test-questionnaire-preview.cjs
    node tools/test-design-generation-preview.cjs --browser-only
    node tools/test-unified-qa-live.cjs
    node tools/local-mask-editor/test-xinobi-u-catalog.cjs
    node tools/local-mask-editor/test-admin-approval-guard.cjs

The generated result is mocked. This proves handoff, not paid provider quality.
Tests must not click AI against a real enabled provider. No mask approvals or
catalog writes are performed. Synthetic fixture output is never published.


## Explicit dual-provider QA
PowerShell: `node D:XinobiYeni-integration	oolsstart-xinobi-qa.cjs --cloudflare --roboflow`
The application daily generation cap is disabled only in Development. Existing usage is retained. Each generation job remains idempotent; a fresh explicit questionnaire is required for a new design. Storage/session creation safety bounds remain.
Roboflow is available only for the verified CM101 navy lower kettle source. Admin's Yeni maske oluştur asks explicit third-party/credit consent, creates one persisted attempt, and never retries. Pending output does NOT replace the existing approved mask or editor input. Review new output separately before choosing a new correction input; no automatic activation.
Occupied ports abort startup without stopping existing services. Restart the old launcher manually once to load the updated binary; subsequent provider switching needs no restart.
