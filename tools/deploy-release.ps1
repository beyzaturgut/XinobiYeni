# Run from an Administrator Windows PowerShell terminal. Requires existing IIS sites.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)][ValidatePattern('^xinobi-[a-f0-9]{7}$')][string]$Release,
    [string]$WebSite = 'XinobiYeni',
    [string]$ApiSite = 'XinobiYeniApi',
    [string]$ServerSettings = 'C:\XinobiData\config\appsettings.Server.json',
    [string]$WorkRoot = 'C:\XinobiDeploy',
    [string]$HealthUrl = 'http://127.0.0.1:8024/api/v1/health/ready',
    [string]$WebUrl = 'http://127.0.0.1:8014'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Open PowerShell as Administrator.' }
Import-Module WebAdministration
$web = Get-Item "IIS:\Sites\$WebSite"
$api = Get-Item "IIS:\Sites\$ApiSite"
$webPath = [Environment]::ExpandEnvironmentVariables($web.physicalPath).TrimEnd('\')
$apiPath = [Environment]::ExpandEnvironmentVariables($api.physicalPath).TrimEnd('\')
# API IIS site may point at the parent and mount /api as an application.
$apiApp = Get-WebApplication -Site $ApiSite | Where-Object { $_.path -eq '/api' }
if ($apiApp) { $apiPath = [Environment]::ExpandEnvironmentVariables($apiApp.physicalPath).TrimEnd('\') }
$apiPool = if ($apiApp) { $apiApp.applicationPool } else { $api.applicationPool }
$webPool = $web.applicationPool
foreach ($entry in @(@($webPath,'index.html'),@($apiPath,'Xinobi.Api.dll'))) {
    if (!(Test-Path -LiteralPath (Join-Path $entry[0] $entry[1]) -PathType Leaf)) { throw "Unexpected IIS target: $($entry[0]). Check site/application paths first." }
}
if ($webPath -ieq $apiPath -or $webPath.StartsWith($apiPath+'\',[StringComparison]::OrdinalIgnoreCase) -or $apiPath.StartsWith($webPath+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Web/API target directories must be separate.' }
foreach ($target in @($webPath,$apiPath)) {
 foreach ($protected in @($ServerSettings,$WorkRoot)) {
  if ([IO.Path]::GetFullPath($protected).StartsWith($target+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Settings and deployment work directory must be outside deployed directories.' }
 }
}
if (!(Test-Path -LiteralPath $ServerSettings -PathType Leaf)) { throw "Server settings missing: $ServerSettings. Complete the existing API settings migration first; see docs/runbooks/iis-api-install.md." }
Get-Content -LiteralPath $ServerSettings -Raw | ConvertFrom-Json | Out-Null
if (!$PSCmdlet.ShouldProcess("$webPath and $apiPath", "Download $Release, back up, install and health-check; roll back on failure")) { return }
New-Item -ItemType Directory -Path $WorkRoot -Force | Out-Null
try { $lock = [IO.File]::Open((Join-Path $WorkRoot 'deployment.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None) } catch { throw 'Another deployment is running, or the deployment lock cannot be opened.' }
try {
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$work = Join-Path $WorkRoot "$Release-$stamp"
New-Item -ItemType Directory -Path $work | Out-Null
$log = Join-Path $work 'deployment.json'
$record = [ordered]@{release=$Release;time=(Get-Date -Format o);operator=$env:USERNAME;webPath=$webPath;apiPath=$apiPath;status='PREPARING';migration='Not executed';sha256=$null;commit=$null}
function Save-Record { $record | ConvertTo-Json | Set-Content -LiteralPath $log -Encoding UTF8 }
Save-Record
$headers = @{Accept='application/vnd.github+json'}
if ($env:GITHUB_TOKEN) { $headers.Authorization = "Bearer $env:GITHUB_TOKEN" }
function Download-Asset($asset, $destination) {
    $h = @{} + $headers; $h.Accept = 'application/octet-stream'
    Invoke-WebRequest -UseBasicParsing -Uri $asset.url -Headers $h -OutFile $destination | Out-Null
}
$pools = @($webPool,$apiPool) | Select-Object -Unique
foreach ($pool in $pools) { if ((Get-WebAppPoolState -Name $pool).Value -ne 'Started') { throw "Pool $pool must be running before deployment." } }
$swaps = @()
try {
    $releaseInfo = Invoke-RestMethod -Uri "https://api.github.com/repos/beyzaturgut/XinobiYeni/releases/tags/$Release" -Headers $headers
    foreach ($name in @('xinobi.zip','xinobi.zip.sha256')) {
        $asset = @($releaseInfo.assets | Where-Object { $_.name -eq $name })
        if ($asset.Count -ne 1) { throw "Release asset missing or ambiguous: $name" }
        Download-Asset $asset[0] (Join-Path $work $name)
    }
    $expected = (Get-Content (Join-Path $work 'xinobi.zip.sha256') -Raw).Trim()
    $actual = (Get-FileHash (Join-Path $work 'xinobi.zip') -Algorithm SHA256).Hash
    if ($expected -notmatch '^[a-fA-F0-9]{64}$' -or $actual -ine $expected) { throw 'SHA256 mismatch. Nothing installed.' }
    $record.sha256 = $actual
    $stage = Join-Path $work 'extracted'
    Expand-Archive -LiteralPath (Join-Path $work 'xinobi.zip') -DestinationPath $stage
    foreach ($file in @('out\index.html','out\web.config','out\admin\index.html','api\Xinobi.Api.dll','api\web.config','release.json')) {
        if (!(Test-Path -LiteralPath (Join-Path $stage $file) -PathType Leaf)) { throw "Invalid package: $file missing" }
    }
    $record.commit = (Get-Content (Join-Path $stage 'release.json') -Raw | ConvertFrom-Json).commit
    if ($record.commit -notmatch '^[a-f0-9]{40}$' -or !$record.commit.StartsWith($Release.Substring(7))) { throw 'Package commit does not match selected release.' }
    # Stage beside each target so directory renames stay on the same volume.
    foreach ($pair in @(@($webPath,'out'),@($apiPath,'api'))) {
        $target = $pair[0]
        $next = "$target-next-$stamp"
        Copy-Item -LiteralPath (Join-Path $stage $pair[1]) -Destination $next -Recurse
        $swaps += [pscustomobject]@{target=$target;next=$next;backup="$target-previous-$stamp";moved=$false;installed=$false}
    }
    $record.status = 'PREPARED'; Save-Record
    foreach ($pool in $pools) { Stop-WebAppPool -Name $pool }
    foreach ($pool in $pools) {
        $deadline = (Get-Date).AddSeconds(60)
        while ((Get-WebAppPoolState -Name $pool).Value -ne 'Stopped') {
            if ((Get-Date) -gt $deadline) { throw "Pool $pool did not stop." }
            Start-Sleep -Seconds 1
        }
    }
    foreach ($swap in $swaps) {
        Move-Item -LiteralPath $swap.target -Destination $swap.backup; $swap.moved=$true
        Move-Item -LiteralPath $swap.next -Destination $swap.target; $swap.installed=$true
    }
    foreach ($pool in $pools) { Start-WebAppPool -Name $pool }
    $ready=$false
    for ($i=0; $i -lt 20; $i++) {
        try { if ((Invoke-WebRequest -UseBasicParsing -Uri $HealthUrl -TimeoutSec 10).StatusCode -eq 200) { $ready=$true; break } } catch {}
        Start-Sleep -Seconds 3
    }
    if (!$ready) { throw 'API readiness failed.' }
    foreach ($route in @('/','/admin/','/api/v1/health/ready','/api/v1/catalog/storefront')) {
        if ((Invoke-WebRequest -UseBasicParsing -Uri ($WebUrl.TrimEnd('/')+$route) -TimeoutSec 30).StatusCode -ne 200) { throw "Web check failed: $route" }
    }
    $record.status='SUCCESS'; Save-Record
    Write-Host "Deployment successful. Record: $log. Previous directories retained for rollback."
} catch {
    $failure = $_
    $record.status='FAILED'
    try {
        if (@($swaps | Where-Object { $_.moved }).Count -gt 0) {
            foreach ($pool in $pools) { if ((Get-WebAppPoolState -Name $pool).Value -ne 'Stopped') { Stop-WebAppPool -Name $pool } }
            Start-Sleep -Seconds 5
            foreach ($swap in $swaps) {
                if ($swap.installed) { Move-Item -LiteralPath $swap.target -Destination "$($swap.target)-failed-$stamp" }
                if ($swap.moved) { Move-Item -LiteralPath $swap.backup -Destination $swap.target }
            }
            $record.status='ROLLED_BACK'
        }
        foreach ($pool in $pools) { if ((Get-WebAppPoolState -Name $pool).Value -ne 'Started') { Start-WebAppPool -Name $pool } }
    } catch { $record.status='ROLLBACK_FAILED'; Write-Warning 'Automatic recovery failed. Restore previous directories and check IIS pools manually.' }
    Save-Record
    throw $failure
}

} finally { $lock.Dispose() }
