$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$proxyPath = Join-Path $PSScriptRoot 'sepay-webhook-proxy.cjs'
$tunnelPath = Join-Path $projectRoot 'backend\target\sepay-tunnel\cloudflared.exe'

if (-not (Test-Path -LiteralPath $tunnelPath)) {
    throw "Khong tim thay cloudflared.exe tai $tunnelPath"
}
$nodePath = (Get-Command node -ErrorAction Stop).Source
$proxyProcess = $null
$existingProxy = Get-NetTCPConnection -LocalPort 18081 -State Listen -ErrorAction SilentlyContinue

try {
    if ($existingProxy) {
        Write-Host 'Cong 18081 dang duoc su dung. Dung proxy hien co.'
    } else {
        $proxyProcess = Start-Process -FilePath $nodePath -ArgumentList @('"' + $proxyPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
        Start-Sleep -Seconds 1
        if ($proxyProcess.HasExited) {
            throw 'Proxy khong khoi dong duoc.'
        }
    }

    Write-Host 'URL webhook = URL https://...trycloudflare.com ben duoi + /api/v1/registrations/webhooks/sepay'
    Write-Host 'Giu terminal nay mo khi test. Nhan Ctrl+C de dung tunnel.'
    & $tunnelPath tunnel --url http://127.0.0.1:18081 --protocol http2
} finally {
    # Only stop the proxy started by this script, not an existing process.
    if ($proxyProcess -and -not $proxyProcess.HasExited) {
        Stop-Process -Id $proxyProcess.Id -ErrorAction SilentlyContinue
    }
}
