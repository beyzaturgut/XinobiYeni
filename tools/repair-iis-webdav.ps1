# Windows PowerShell 5.1, run as Administrator. Removes WebDAV only from the API site.
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ApiSite = 'XinobiYeniApi',
    [string]$ApiPool = 'XinobiYeniApi'
)
$ErrorActionPreference = 'Stop'
$appcmd = Join-Path $env:windir 'system32\inetsrv\appcmd.exe'
if (!(Test-Path -LiteralPath $appcmd)) { throw 'IIS appcmd not found.' }

function Invoke-Appcmd([string[]]$Arguments) {
    $result = & $appcmd @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ('IIS command failed: ' + ($result -join [Environment]::NewLine))
    }
    return ($result -join [Environment]::NewLine)
}

$pool = Invoke-Appcmd -Arguments @('list', 'app', ($ApiSite + '/'), '/text:applicationPool')
if ($pool.Trim() -ne $ApiPool) { throw 'The API site does not use the expected pool. Check ApiSite and ApiPool before retrying.' }
$modules = Invoke-Appcmd -Arguments @('list', 'config', $ApiSite, '/section:system.webServer/modules', '/xml')
$handlers = Invoke-Appcmd -Arguments @('list', 'config', $ApiSite, '/section:system.webServer/handlers', '/xml')
[xml]$moduleXml = $modules
[xml]$handlerXml = $handlers
$hasModule = $null -ne $moduleXml.SelectSingleNode("//add[@name='WebDAVModule']")
$hasHandler = $null -ne $handlerXml.SelectSingleNode("//add[@name='WebDAV']")
if (!$hasModule -and !$hasHandler) {
    Write-Host 'WebDAV is already absent from the API site. No configuration changed.'
    return
}
if (!$PSCmdlet.ShouldProcess($ApiSite, 'Back up IIS, remove API WebDAV module/handler, recycle API pool')) { return }

$backup = 'XinobiBeforeWebDav-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8)
Invoke-Appcmd -Arguments @('add', 'backup', $backup) | Out-Null
Write-Host "IIS backup created: $backup"
# Store site-scoped removals in applicationHost.config so future API ZIPs do not undo them.
# ASP.NET Core handler, authentication, SQL settings and other IIS sites stay intact.
if ($hasModule) {
    Invoke-Appcmd -Arguments @('set', 'config', $ApiSite, '/section:system.webServer/modules', "/-[name='WebDAVModule']", '/commit:apphost') | Out-Null
}
if ($hasHandler) {
    Invoke-Appcmd -Arguments @('set', 'config', $ApiSite, '/section:system.webServer/handlers', "/-[name='WebDAV']", '/commit:apphost') | Out-Null
}
$afterModules = Invoke-Appcmd -Arguments @('list', 'config', $ApiSite, '/section:system.webServer/modules', '/xml')
$afterHandlers = Invoke-Appcmd -Arguments @('list', 'config', $ApiSite, '/section:system.webServer/handlers', '/xml')
[xml]$afterModuleXml = $afterModules
[xml]$afterHandlerXml = $afterHandlers
if ($afterModuleXml.SelectSingleNode("//add[@name='WebDAVModule']") -or $afterHandlerXml.SelectSingleNode("//add[@name='WebDAV']")) {
    throw 'WebDAV removal did not take effect. Review the site configuration before retrying.'
}
Invoke-Appcmd -Arguments @('recycle', 'apppool', ("/apppool.name:" + $ApiPool)) | Out-Null
Write-Host 'API WebDAV removed and API pool recycled. Anonymous catalog writes should return 401 instead of IIS 405.'
Write-Host 'Next: verify an authorized administrator can create and remove a temporary test product.'
