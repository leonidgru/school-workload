# Launcher script for School Teacher Workload App
$htmlPath = Join-Path $PSScriptRoot "index.html"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " מערכית - מחשבון משרות ושעות מורים בתיכון" -ForegroundColor Yellow
Write-Host " פותח את האפליקציה בדפדפן..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Start-Process $chromePath -ArgumentList $htmlPath
} else {
    Start-Process $htmlPath
}
