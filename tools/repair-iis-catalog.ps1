# Run in Windows PowerShell as Administrator on the existing Xinobi IIS server.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ApiDirectory = 'C:\inetpub\wwwroot\XinobiYeniApi\api',
    [string]$WebDirectory = 'C:\inetpub\wwwroot\XinobiYeni\out',
    [string]$StorageRoot = 'C:\XinobiData',
    [string]$ApiPool = 'XinobiYeniApi',
    [string]$PublicOrigin = 'https://109.104.120.91',
    [string]$BackupRoot = 'C:\XinobiBackups'
)
$ErrorActionPreference = 'Stop'
$configPath = Join-Path $ApiDirectory 'appsettings.Production.json'
if (!(Test-Path -LiteralPath $configPath -PathType Leaf)) { throw 'API production settings not found.' }
$origin = [Uri]$PublicOrigin
if ($origin.Scheme -ne 'https') { throw 'PublicOrigin must use HTTPS.' }
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json

function Set-SectionValue($document, [string]$section, [string]$name, $value) {
    if (!$document.PSObject.Properties[$section]) {
        $document | Add-Member -NotePropertyName $section -NotePropertyValue ([pscustomobject]@{})
    }
    $document.$section | Add-Member -NotePropertyName $name -NotePropertyValue $value -Force
}

# Reuse a previously configured storage root; do not move a working media store.
if ($config.Storage -and $config.Storage.LocalRoot) { $StorageRoot = $config.Storage.LocalRoot }
$environmentStorage = [Environment]::GetEnvironmentVariable('Storage__LocalRoot', 'Machine')
if ($environmentStorage) { $StorageRoot = $environmentStorage }
if ($config.Email -and $config.Email.DeliveryMode -eq 'Preview') {
    throw 'Production cannot use Preview email. Configure the real Smtp or Resend provider first.'
}
$appcmd = Join-Path $env:windir 'system32\inetsrv\appcmd.exe'
if (!(Test-Path -LiteralPath $appcmd)) { throw 'IIS appcmd not found.' }
if (!$PSCmdlet.ShouldProcess($ApiDirectory, 'Back up settings, restore media, enable SQL accounts/catalog and recycle API pool')) { return }

$backup = Join-Path $BackupRoot ('catalog-repair-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $backup | Out-Null
Copy-Item -LiteralPath $configPath -Destination (Join-Path $backup 'appsettings.Production.json')
Write-Host 'Production settings backed up outside the web root. No credentials are printed.'

$mediaDirectory = Join-Path $StorageRoot 'media'
New-Item -ItemType Directory -Path $mediaDirectory -Force | Out-Null
$copied = 0
$packagedMedia = Join-Path $WebDirectory 'assets\deploy-media'
if (Test-Path -LiteralPath $packagedMedia -PathType Container) {
    foreach ($file in Get-ChildItem -LiteralPath $packagedMedia -File) {
        if ($file.Name -notmatch '^[a-f0-9]{32}\.(png|jpg|webp|mp4|webm)$') { continue }
        $target = Join-Path $mediaDirectory $file.Name
        if (Test-Path -LiteralPath $target) {
            if ((Get-FileHash -LiteralPath $target).Hash -ne (Get-FileHash -LiteralPath $file.FullName).Hash) {
                throw 'An existing media file differs from the packaged copy. No file was overwritten; review storage before retrying.'
            }
            continue
        }
        Copy-Item -LiteralPath $file.FullName -Destination $target
        $copied++
    }
}
if (!(Get-ChildItem -LiteralPath $mediaDirectory -File | Select-Object -First 1)) {
    throw 'No product media found. Restore assets\deploy-media from the combined web/admin ZIP, then retry.'
}
& icacls.exe $StorageRoot /grant "IIS AppPool\${ApiPool}:(OI)(CI)M" | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not grant the API pool access to the media directory.' }

Set-SectionValue $config 'Catalog' 'StorageProvider' 'SqlServer'
Set-SectionValue $config 'Catalog' 'AssetBaseUrl' ($PublicOrigin.TrimEnd('/'))
Set-SectionValue $config 'Accounts' 'StorageProvider' 'SqlServer'
Set-SectionValue $config 'AdminCatalog' 'Enabled' $true
Set-SectionValue $config 'Storage' 'LocalRoot' $StorageRoot
Set-SectionValue $config 'ReverseProxy' 'Enabled' $true
Set-SectionValue $config 'ReverseProxy' 'AllowedHosts' @($origin.DnsSafeHost)
# Existing ConnectionStrings, SMTP/Resend credentials and all other sections remain intact.
$temporaryConfig = $configPath + '.repair.tmp'
$json = $config | ConvertTo-Json -Depth 100
[IO.File]::WriteAllText($temporaryConfig, $json, (New-Object Text.UTF8Encoding($false)))
# Windows PowerShell 5.1 can bind $null to an empty string for the backup path;
# File.Replace then rejects it. Use a real, unique backup path on the same volume.
$replaceBackup = Join-Path $backup 'appsettings.Production.before-replace.json'
[IO.File]::Replace($temporaryConfig, $configPath, $replaceBackup)
& $appcmd recycle apppool "/apppool.name:$ApiPool"
if ($LASTEXITCODE -ne 0) { throw 'Settings saved, but API pool recycle failed. Recycle it from IIS Manager.' }
Write-Host "Repair applied. Copied media files: $copied. Backup: $backup"
Write-Host 'Verify health/ready, one product image and administrator login. No SQL migration or import was run.'
