# Local Tarzını Keşfet preview

> **10.11.2026 — Legacy development tools.** These instructions describe the historical variant/family QA environment, not the current single-source workflow. Start with the [current workflow](../docs/runbooks/single-source-personalization.md). Do not use these scripts to create a new single-source profile, transfer masks between photos or claim current acceptance. Existing data and compatibility readers remain supported.


Only the opt-in D: Next development preview uses this bridge.
No questionnaire content, generator, catalog, mask or renderer was changed.

Start the isolated questionnaire API (5020):
    powershell -NoProfile -ExecutionPolicy Bypass -File tools/start-questionnaire-preview.ps1
Start the narrow proxy (5021):
    node tools/questionnaire-preview-proxy.cjs

Keep the existing Next preview (3032) and catalog API (5019) running.
Open http://127.0.0.1:3032/xinobi-u/ and choose Tarzını Keşfet on CM101.

The API reads the real-catalog-qa dataset without modifying state or media.
Only question session metadata is written to App_Data/questionnaire-preview-sessions.
Its content root contains a byte-identical copy of the existing question bank,
and no appsettings.Local.json. WorkerEnabled and ExternalInferenceEnabled are
explicitly false, so provider credentials are not read by IsConfigured.

The proxy accepts GET status/session/image and POST sessions only.
Browser writes require exact Origin http://127.0.0.1:3032 and bounded JSON.
The proxy validates the browser Origin, then uses loopback server-to-server
requests without forwarding that browser Origin. Existing API Origin rules
are unchanged. Real-catalog creates go to 5020; the existing DEMO-P101 flow and
old demo sessions are preserved through 5013. Missing GET sessions/images
fall back to the demo API only on 404. Creates are never retried.

POST generation and unrelated design mutations return 405 and are not
forwarded. Five answered questions show the existing design-profile summary.
A generated picture is a separate step and remains disabled in this preview.
Its ready-result UI and product-preview handoff are tested using browser mocks.

Tests:
    node tools/test-questionnaire-preview.cjs
    node tools/local-mask-editor/test-xinobi-u-catalog.cjs

Tests create isolated question sessions, never real generation jobs, catalog
writes or mask approvals. Runtime data is not intended for Git.


## Preparing Cloudflare generation (DO NOT RUN until explicit consent)

The default script still sets both inference and worker to false. The proxy
still rejects generation unless DESIGN_STUDIO_PREVIEW_GENERATION_ENABLED=true.
The optional generation route permits only POST sessions/{64-hex-id}/generation,
exact browser Origin, bounded JSON and exactly five answer pairs. It goes only
to 5020 and never falls back to the demo API. Other writes remain blocked.

The existing QuestionBank.BuildPrompt validates all five session answers and
maps each option to its existing semantic prompt. DesignSessionStore persists
that prompt, queues once, and returns the same result for repeated requests.
No questionnaire, Cloudflare provider, mask or rendering logic is replaced.

AFTER explicit consent, restart ONLY these two preview processes (not demo,
catalog, mask editor or Web) in separate PowerShell terminals:

    Set-Location D:\XinobiYeni-integration
    powershell -NoProfile -ExecutionPolicy Bypass -File tools/start-questionnaire-preview.ps1 -EnableCloudflareAfterConsent

    Set-Location D:\XinobiYeni-integration
    $env:DESIGN_STUDIO_PREVIEW_GENERATION_ENABLED='true'
    node tools/questionnaire-preview-proxy.cjs

Before starting, verify no queued/running jobs in the isolated sessions store.
The script refuses to activate the worker if it finds them or invalid JSON.
The daily limit is one (a daily guard, not a durable lifetime one-shot grant).
Do not restart with a new data directory to bypass it. Following one click,
wait for its existing session result; do not create a replacement on timeout.
Stop the enabled worker/proxy after the controlled attempt, then return to
normal offline startup. An API failure may consume provider usage.

Credentials are server-only .NET User Secrets for the existing API project
(UserSecretsId is in Xinobi.Api.csproj), Cloudflare:AccountId and
Cloudflare:ApiToken; equivalent environment names Cloudflare__AccountId and
Cloudflare__ApiToken. Existing fallback names CLOUDFLARE_ACCOUNT_ID and
CLOUDFLARE_API_TOKEN are also supported. Do not print/list secrets or put them
in NEXT_PUBLIC variables, source files or CLI arguments. Key presence/validity
and account quota must be verified after consent; this task did not inspect
actual secrets. The isolated content root must have no appsettings.Local.json.

Use http://127.0.0.1:3032/xinobi-u/sorular/?product=DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6&variant=DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1
GET /api/v1/design-studio/status must report configured:true before clicking.
Click AI once after five answers, wait for queued/running/ready, then choose
Urunumde dene. Session identity is retained; accepted CM101 source/mask/branding
validation is still required. A generated pattern does not approve a mask.
The provider sends only the preference prompt, not the product photograph.

Existing model: @cf/black-forest-labs/flux-1-schnell; steps=4. Pricing reference:
https://developers.cloudflare.com/workers-ai/platform/pricing/
Actual account plan, free allowance and returned image dimensions determine cost.
No real generation was executed by the mock tests:
    node tools/test-design-generation-preview.cjs
