# Run backend, frontend, then Playwright tests (PowerShell)
# Usage: .\run-and-test.ps1
# Or:    pwsh -File run-and-test.ps1

$ErrorActionPreference = "Stop"
$backendDir = Join-Path $PSScriptRoot "..\backend"
$frontendDir = $PSScriptRoot

Write-Host "=== 1. Starting backend (port 8000) ===" -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:backendDir
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

Write-Host "=== 2. Starting frontend (port 3000 or next available) ===" -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:frontendDir
    npm run dev
}

Write-Host "Waiting 25s for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

# Detect frontend port from job output
$frontendOutput = Receive-Job $frontendJob
if ($frontendOutput -match "localhost:(\d+)") { $port = $Matches[1] } else { $port = "3000" }
Write-Host "Frontend detected on port $port" -ForegroundColor Green

Write-Host "=== 3. Installing Playwright Chromium (if needed) ===" -ForegroundColor Cyan
Set-Location $frontendDir
npx playwright install chromium 2>&1 | Out-Null

Write-Host "=== 4. Running tests (PW_BASE_URL=http://localhost:$port) ===" -ForegroundColor Cyan
$env:PW_BASE_URL = "http://localhost:$port"
npx playwright test tests/use-cases-full.spec.js --project=chromium --reporter=list

$result = $LASTEXITCODE
Write-Host "`n=== Stopping servers ===" -ForegroundColor Cyan
Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
exit $result
