# CM 101 candidate-only one-shot CLI

This mode runs before normal API startup. It does not start an API listener, DesignStudio worker or Cloudflare generation. Ordinary API/Admin startup cannot invoke it. All enable flags default off.

Exact binding: CM 101 product `DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6`, variant `DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1`, source `01b20091ecaa4fbb86a9a929bf7b56ee.webp`, 3543x5315, SHA-256 `f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935`, prompt `lower kettle body`.

## Before any real execution

Obtain explicit authorization for ONE paid request and ONE unique attempt GUID. This implementation/testing task does not authorize execution. Do not generate another GUID to retry a failure. Do not infer historical unused permission from a missing record.

The existing credential setting is `ProductSurfaces:Segmentation:Roboflow:ApiKey` in API .NET User Secrets, or process environment `ProductSurfaces__Segmentation__Roboflow__ApiKey`. The CLI never takes a credential argument, logs it, or loads appsettings.Local.json. Credentials are loaded only after exact source validation and the persistent claim. Credential configuration was not inspected during implementation.

The compiled Debug API contains the CLI. Future builds must retain `-p:OpenApiGenerateDocumentsOnBuild=false`.

## Command: ONLY after explicit real-request authorization

Replace the placeholder with the single specifically authorized GUID. Preserve it and the ledger after every outcome. Do not run this command as part of startup or tests.

```powershell
Set-Location 'D:\XinobiYeni-integration'
$attemptId = '<EXPLICITLY-AUTHORIZED-ATTEMPT-GUID>'
$flags = @{
    ASPNETCORE_ENVIRONMENT = 'Development'
    ProductSurfaces__DevelopmentReview__Enabled = 'true'
    ProductSurfaces__Cm101Candidate__Enabled = 'true'
    ProductSurfaces__Segmentation__Provider = 'roboflow'
    ProductSurfaces__Segmentation__ExternalInferenceEnabled = 'true'
    ProductSurfaces__Segmentation__SingleAutomaticSmokeEnabled = 'false'
    ProductSurfaces__Segmentation__SingleInteractiveSmokeEnabled = 'false'
    ProductSurfaces__ExperimentalCatalogWorkspace__Enabled = 'false'
    DesignStudio__WorkerEnabled = 'false'
    DesignStudio__ExternalInferenceEnabled = 'false'
}
$previous = @{}
try {
    foreach ($name in $flags.Keys) {
        $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, $flags[$name], 'Process')
    }
    dotnet '.\services\api\bin\Debug\net10.0\Xinobi.Api.dll' `
        --cm101-candidate-once --attempt-id $attemptId `
        --acknowledge-third-party-credit-usage
    if ($LASTEXITCODE -ne 0) {
        throw 'Attempt failed or uncertain. Preserve the record; do not retry or change the attempt GUID.'
    }
}
finally {
    foreach ($name in $previous.Keys) {
        [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process')
    }
}
```

## Storage and safety

Catalog input is read-only: `services/api/App_Data/real-catalog-qa/state.json` and `media/`. No catalog variant/mask field or approved mask directory is written.

Isolated output root: `services/api/App_Data/cm101-sam3-review/`.

- `attempts/<GUID>.json`: immutable atomic CreateNew claim, flushed before credentials/transport. Existing, corrupt or partial records block reuse across processes and restarts. No refund/reset.
- `pending/<GUID>/source.webp`: byte-exact verified source snapshot.
- `pending/<GUID>/candidate-mask.png`: source-aligned full-resolution RGBA mask.
- `pending/<GUID>/review-overlay.png`: tinted source photograph, bounded to 1600px high for review. This is not a replacement source or mask.
- `pending/<GUID>/candidate.json`: final completeness marker, exact identities/checksums, revision/candidate IDs, provider provenance/score, pending status, explicit REAL ROBOFLOW label and branding-not-yet-validated state.

Failures after claim remain consumed, including missing credentials, transport failures, timeout, malformed RLE and output-write failures. Partial output is unapproved and must be preserved for investigation. Successful output is also pending, never an approval.

Transport is a fresh direct SocketsHttpHandler: no redirects, cookies, proxy, ambient credentials, decompression or retry middleware; HTTP/1.1 exact with Connection: close. A second send is rejected. Endpoint, source payload and prompt are checked before transport.

Open `review-overlay.png` and inspect `candidate-mask.png` at full zoom. Review all boundaries, metal rings/base/spout/handle/background exclusions and complete logo protection. A prompt does not prove semantic mask correctness. Separate branding validation and manual review are required. This command does not import the candidate into Admin, approve it or enable storefront rendering.
