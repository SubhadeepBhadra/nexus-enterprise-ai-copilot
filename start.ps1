# Nexus Enterprise AI Copilot PowerShell Launcher
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching Nexus Enterprise AI Copilot" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$vscodeExe = "C:\Users\Subho\AppData\Local\Programs\Microsoft VS Code\Code.exe"

if ($nodeCmd) {
    Start-Process "http://localhost:3000"
    & node server.js
} elseif (Test-Path $vscodeExe) {
    $env:ELECTRON_RUN_AS_NODE = "1"
    Start-Process "http://localhost:3000"
    & $vscodeExe server.js
} else {
    Write-Host "Opening index.html directly in browser..." -ForegroundColor Yellow
    Start-Process "$scriptDir\index.html"
}

