# Runs without IIS or network access. Only helper functions are loaded from the deploy script.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$tokens = $null
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile(
    (Join-Path $PSScriptRoot 'deploy-release.ps1'), [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count -gt 0) { throw ($parseErrors | Out-String) }
$names = @('Stop-DeploymentPools','Move-DeploymentDirectory','Start-DeploymentPools')
$functions = $ast.FindAll({param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -in $names}, $true)
if ($functions.Count -ne 3) { throw 'Deployment helper functions missing.' }
foreach ($f in $functions) { Invoke-Expression $f.Extent.Text }
function Assert($condition, $message) { if (!$condition) { throw $message } }
function Start-Sleep { param($Seconds) $script:sleeps++ }
$script:sleeps=0
$script:stopCalls=0
$script:stateReads=0
function Stop-WebAppPool { param($Name) $script:stopCalls++ }
function Get-WebAppPoolState {
    param($Name)
    $script:stateReads++
    $state = if ($script:stateReads -eq 1) { 'Started' } elseif ($script:stateReads -lt 4) { 'Stopping' } else { 'Stopped' }
    [pscustomobject]@{Value=$state}
}
Stop-DeploymentPools -Names @('test')
Assert ($script:stopCalls -eq 1 -and $script:sleeps -eq 2) 'Did not wait for pool shutdown.'
Write-Host 'PASS: pool shutdown is awaited'
$script:sleeps=0
$script:moveCalls=0
$script:destinationExists=$false
$script:permanentFailure=$false
function Test-Path { param($LiteralPath) return $script:destinationExists }
function Move-Item {
    param($LiteralPath,$Destination,$ErrorAction)
    $script:moveCalls++
    if ($script:permanentFailure) { throw [System.UnauthorizedAccessException]::new('fixture access denied') }
    if ($script:moveCalls -lt 3) { throw [System.IO.IOException]::new('fixture file lock') }
}
Move-DeploymentDirectory -Source 'source' -Destination 'destination'
Assert ($script:moveCalls -eq 3 -and $script:sleeps -eq 2) 'File lock was not retried.'
Write-Host 'PASS: transient directory locks are retried'
$script:destinationExists=$true
$script:moveCalls=0
$rejected=$false
try { Move-DeploymentDirectory -Source 'source' -Destination 'destination' } catch { $rejected=$true }
Assert ($rejected -and $script:moveCalls -eq 0) 'Existing destination was merged.'
Write-Host 'PASS: existing destinations are refused'
$script:destinationExists=$false
$script:permanentFailure=$true
$script:moveCalls=0
$script:sleeps=0
$rejected=$false
try { Move-DeploymentDirectory -Source 'source' -Destination 'destination' } catch { $rejected=$true }
Assert ($rejected -and $script:moveCalls -eq 30 -and $script:sleeps -eq 29) 'Permanent failure was swallowed or retried without a limit.'
Write-Host 'PASS: permanent directory failures surface after bounded retries'
# Exercise the real recovery catch block with two targets: first fails, second must still recover.
$catch = $ast.FindAll({param($node) $node -is [System.Management.Automation.Language.CatchClauseAst] -and $node.Body.Extent.Text.Contains('$recoveryErrors = @()')}, $true) | Select-Object -First 1
Assert ($null -ne $catch) 'Recovery catch block missing.'
$script:restored=@()
$script:started=@()
function Stop-DeploymentPools { param($Names) }
function Move-DeploymentDirectory {
    param($Source,$Destination)
    if ($Source -eq 'web') { throw 'fixture web directory lock' }
    $script:restored += $Destination
}
function Start-DeploymentPools { param($Names) $script:started += $Names }
function Save-Record {}
$pools=@('webPool','apiPool')
$stamp='test'
$log='fixture.json'
$record=[ordered]@{status='FAILED'}
$swaps=@(
    [pscustomobject]@{target='web';backup='web-old';installed=$true;moved=$true},
    [pscustomobject]@{target='api';backup='api-old';installed=$true;moved=$true}
)
$bodyText=$catch.Body.Extent.Text
$recoveryBlock=[scriptblock]::Create($bodyText.Substring(1,$bodyText.Length-2))
try { . $recoveryBlock } catch {}
Assert ('api' -in $script:restored) 'One target failure prevented recovery of another.'
Assert ($script:started.Count -eq 2) 'Pool restart was skipped after recovery failure.'
Assert ($record.status -eq 'ROLLBACK_FAILED') 'Partial recovery was reported as success.'
Write-Host 'PASS: partial recovery still restores other targets and attempts all pools'
