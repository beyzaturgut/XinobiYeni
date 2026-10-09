param([switch]$EnableCloudflareAfterConsent)
# Local questionnaire metadata only. No worker or external inference.
$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
if([IO.Path]::GetFullPath($repoRoot) -ne 'D:\XinobiYeni-integration'){throw 'Run only in the D: integration worktree'}
if(Get-NetTCPConnection -State Listen -LocalPort 5020 -ErrorAction SilentlyContinue){throw 'Port 5020 is occupied; do not stop its process'}
$contentRoot=Join-Path $repoRoot 'services/api/App_Data/questionnaire-preview-api'
if(Test-Path (Join-Path $contentRoot 'appsettings.Local.json')){throw 'Unexpected local configuration'}
$bankDir=Join-Path $contentRoot 'DesignStudio'
New-Item -ItemType Directory -Path $bankDir -Force | Out-Null
$bankSource=Join-Path $repoRoot 'services/api/DesignStudio/question-bank.json'
$bankTarget=Join-Path $bankDir 'question-bank.json'
if(Test-Path $bankTarget){if((Get-FileHash $bankSource).Hash -ne (Get-FileHash $bankTarget).Hash){throw 'Question bank differs'}}else{Copy-Item -LiteralPath $bankSource -Destination $bankTarget}
# Default stays offline. Do not use this switch before explicit paid-call consent.
$generationEnabled='false'
if($EnableCloudflareAfterConsent){
 $statePath=Join-Path $repoRoot 'services/api/App_Data/questionnaire-preview-sessions/sessions.json'
 if(Test-Path $statePath){
  $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
  if($null -eq $state.sessions){throw 'Unknown session store; refusing worker activation'}
  foreach($entry in $state.sessions.PSObject.Properties){if($entry.Value.status -in @('queued','running')){throw 'Pending generation exists; do not enable worker'}}
 }
 $generationEnabled='true'
}
$env:ASPNETCORE_ENVIRONMENT='Development'
$env:ASPNETCORE_CONTENTROOT=$contentRoot
$env:ASPNETCORE_URLS='http://127.0.0.1:5020'
dotnet (Join-Path $repoRoot 'services/api/bin/Release/net10.0/Xinobi.Api.dll') --LocalCommerce:DataDirectory="$repoRoot\services\api\App_Data\real-catalog-qa" --DesignStudio:DataDirectory="$repoRoot\services\api\App_Data\questionnaire-preview-sessions" --DesignStudio:WorkerEnabled=$generationEnabled --DesignStudio:ExternalInferenceEnabled=$generationEnabled --DesignStudio:DailyGenerationLimit=1 --ProductSurfaces:DevelopmentReview:Enabled=false --ProductSurfaces:DevelopmentStorefrontPreview:Enabled=false --ProductSurfaces:Segmentation:ExternalInferenceEnabled=false --Email:DeliveryMode=Preview --Logging:EventLog:LogLevel:Default=None
