# CM101 Metallic Navy — existing reviewed development acceptance

Version: 811f44ed-2d47-49b6-ada2-2824b54d72ef.
Exact product: DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6.
Exact variant: DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1.
Source: 3543 × 5315, SHA-256 f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935.
Target: lower kettle shell. Existing Admin acceptance and timestamp are preserved byte-for-byte, not newly approved. Mask and original-pixel branding overlay are not regenerated.

The source is the owner's supplied XINOBI catalog product photograph. No customer uploads, accounts, sessions or keys are included. This is a project development fixture, not a grant of third-party redistribution rights; no independent photo license document was supplied. Confirm rights before distributing beyond the owner's repository.

## Fresh-machine installation
Use this branch in D:\XinobiYeni-integration for the existing D-only QA launcher. Install the repository's existing dependencies with its normal documented package-manager workflow; no new packages are introduced here. Build API with OpenAPI generation disabled:

    dotnet build services/api -c Release -p:OpenApiGenerateDocumentsOnBuild=false -o services/api/App_Data/integration-runtime/catalog-generic-api
    node tools/install-cm101-checkpoint.cjs
    node tools/start-xinobi-qa.cjs --checkpoint-demo

The installer validates all packaged hashes, identities, dimensions, binary alpha and logo exclusion before publishing a new isolated directory. It refuses ANY existing destination, preserving existing QA data. It does not fetch, infer, approve or replace anything. The imported catalog contains the tracked baseline demo seed plus only the exact CM101 navy variant; its demonstration stock is zero. It is not the full 17-product catalog. Package source bytes are installed under the original media filename.

Admin http://127.0.0.1:5176/ — choose CM101 navy, open the local editor. The imported approved mask is the initial mask and the allowed add-brush region; it is NOT labeled as a recovered raw SAM3 candidate.
Customer http://127.0.0.1:3032/xinobi-u/kendi-gorselin/?product=DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6&variant=DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1

Optional explicit Cloudflare UI generation: add --cloudflare after configuring server-side User Secrets. Startup refuses queued/running jobs. No credential is packaged. Roboflow is unavailable in checkpoint-demo mode: this fixture is for existing acceptance, not a new paid segmentation attempt.

Existing service ports cause startup to stop without killing processes. Installing does not start or change running services. Manual rollback: stop only your new demo processes and select your previous launcher/data; never overwrite the old catalog. Keep or archive the isolated installation directory.

Tests: node --test tools/test-cm101-checkpoint.cjs. The installed acceptance is read through the existing registry, including a restart-equivalent fresh registry instance; other variants fail closed.
