# Run in Windows PowerShell as Administrator on the Xinobi IIS server, from the extracted API ZIP folder:
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-api.ps1 -WhatIf
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-api.ps1
# Server-only settings live in $ServerSettings, outside the api folder, so replacing the api folder keeps them.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$SiteRoot = 'C:\inetpub\wwwroot\XinobiYeniApi',
    [string]$ServerSettings = 'C:\XinobiData\config\appsettings.Server.json',
    [string]$ApiPool = 'XinobiYeniApi',
    [string]$BackupRoot = 'C:\XinobiBackups',
    [string]$HealthUrl = 'http://127.0.0.1:8024/api/v1/health/ready',
    [string]$PublicOrigin = 'http://109.104.120.91:8014'
)
$ErrorActionPreference = 'Stop'
$package = Join-Path $PSScriptRoot 'api'
$apiDirectory = Join-Path $SiteRoot 'api'
if (!(Test-Path -LiteralPath (Join-Path $package 'Xinobi.Api.dll') -PathType Leaf)) { throw 'Run this script from the extracted API ZIP folder (api\Xinobi.Api.dll not found next to it).' }
# The package must be extracted elsewhere: its api folder cannot also be the site's api folder that gets replaced.
if ((Resolve-Path -LiteralPath $PSScriptRoot).Path.TrimEnd('\') -ieq (Resolve-Path -LiteralPath $SiteRoot).Path.TrimEnd('\')) {
    throw "Extract the API ZIP to another folder (for example C:\XinobiDeploy\api-<commit>) and run install-api.ps1 there, not inside $SiteRoot. Nothing was changed."
}
$appcmd = Join-Path $env:windir 'system32\inetsrv\appcmd.exe'
if (!(Test-Path -LiteralPath $appcmd)) { throw 'IIS appcmd not found.' }

# A real server settings file enables the SQL admin catalog; the packaged defaults never do.
function Test-ServerSettings([string]$path) {
    if (!(Test-Path -LiteralPath $path -PathType Leaf)) { return $false }
    try { $json = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json } catch { return $false }
    return ($json.AdminCatalog -and $json.AdminCatalog.Enabled -eq $true)
}

# One-time move: take the settings from the running api folder, otherwise from the newest repair backup.
$settingsSource = $null
if (!(Test-ServerSettings $ServerSettings)) {
    $candidates = @(Join-Path $apiDirectory 'appsettings.Production.json')
    # Repair backups and the manual copies kept next to the site (for example "Backup Deploy\api-backup-deploy-007").
    foreach ($folder in @($BackupRoot, (Join-Path $SiteRoot 'Backup Deploy'))) {
        if (!(Test-Path -LiteralPath $folder)) { continue }
        $candidates += Get-ChildItem -LiteralPath $folder -Recurse -File -Include 'appsettings.Production*.json' |
            Sort-Object LastWriteTime -Descending | ForEach-Object { $_.FullName }
    }
    $settingsSource = $candidates | Where-Object { Test-ServerSettings $_ } | Select-Object -First 1
    if (!$settingsSource) {
        throw "No server settings with AdminCatalog.Enabled found. Restore the previous appsettings.Production.json to $ServerSettings (or run repair-iis-catalog.ps1), then retry. Nothing was changed."
    }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$previous = Join-Path $SiteRoot ('api-previous-' + $stamp)
if (!$PSCmdlet.ShouldProcess($apiDirectory, "Stop $ApiPool, keep the current api as $previous, install the new api and start the pool")) {
    if ($settingsSource) { Write-Host "Would copy server settings from $settingsSource to $ServerSettings." }
    return
}

if ($settingsSource) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $ServerSettings) -Force | Out-Null
    Copy-Item -LiteralPath $settingsSource -Destination $ServerSettings
    & icacls.exe (Split-Path -Parent $ServerSettings) /grant "IIS AppPool\${ApiPool}:(OI)(CI)R" | Out-Null
    Write-Host "Server settings moved outside the api folder: $settingsSource -> $ServerSettings (no values printed)."
}

& $appcmd stop apppool "/apppool.name:$ApiPool" | Out-Null
Start-Sleep -Seconds 3
if (Test-Path -LiteralPath $apiDirectory) { Rename-Item -LiteralPath $apiDirectory -NewName (Split-Path -Leaf $previous) }
try {
    Copy-Item -LiteralPath $package -Destination $apiDirectory -Recurse
} catch {
    if (Test-Path -LiteralPath $previous) {
        if (Test-Path -LiteralPath $apiDirectory) { Remove-Item -LiteralPath $apiDirectory -Recurse -Force }
        Rename-Item -LiteralPath $previous -NewName 'api'
    }
    & $appcmd start apppool "/apppool.name:$ApiPool" | Out-Null
    throw "Copy failed; the previous api was put back and the pool started. $($_.Exception.Message)"
}
& $appcmd start apppool "/apppool.name:$ApiPool" | Out-Null

$ready = $false
for ($i = 0; $i -lt 20 -and !$ready; $i++) {
    Start-Sleep -Seconds 3
    try { $ready = (Invoke-WebRequest -UseBasicParsing -Uri $HealthUrl -TimeoutSec 10).StatusCode -eq 200 } catch { }
}
# With the admin catalog on, the panel state needs a staff session (401); without the server settings the route is absent (404).
$catalog = 0
try { $catalog = (Invoke-WebRequest -UseBasicParsing -Uri ($HealthUrl -replace '/api/v1/health/ready$', '/api/v1/local-commerce/state') -TimeoutSec 10).StatusCode } catch { if ($_.Exception.Response) { $catalog = [int]$_.Exception.Response.StatusCode } }
Write-Host "Installed. Previous api kept at $previous (delete it after checking the site)."
Write-Host ("Health: " + $(if ($ready) { 'ready' } else { 'NOT READY - check the API, or roll back by renaming the folders' }))
Write-Host ("Admin catalog and product images: " + $(if ($catalog -eq 401) { 'on' } else { "NOT ON (state answered $catalog) - check $ServerSettings" }))
Write-Host 'Rollback: stop the pool, rename api to api-failed and the previous folder back to api, start the pool.'
