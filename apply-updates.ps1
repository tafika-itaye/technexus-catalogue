# TechNexus Website Updates — May 2026
# Run with: powershell -ExecutionPolicy Bypass -File .\apply-updates.ps1

$ErrorActionPreference = "Stop"

Write-Host "TechNexus Update Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Check all required files exist first
$required = @("wa-chat.js", "eis.html", "eis-splash.html", "_headers")
foreach ($f in $required) {
    if (-not (Test-Path $f)) {
        Write-Host "MISSING: $f -- copy it to the repo root and re-run." -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: $f" -ForegroundColor Green
}

# Patch index.html
Write-Host ""
Write-Host "Patching index.html..." -ForegroundColor Yellow

$idx = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$changed = $false

# Fix 1: bump styles.css version (simpler match)
if ($idx.Contains("styles.css?v=202604190622")) {
    $idx = $idx.Replace("styles.css?v=202604190622", "styles.css?v=202605110001")
    Write-Host "  styles.css version bumped." -ForegroundColor Green
    $changed = $true
} else {
    Write-Host "  styles.css version already updated -- skipping." -ForegroundColor DarkYellow
}

# Fix 2: Add EIS nav link
if (-not $idx.Contains('href="eis.html"')) {
    $idx = $idx.Replace('<a href="credentials.html">Credentials</a>', '<a href="eis.html">EIS Compliance</a>' + "`r`n    " + '<a href="credentials.html">Credentials</a>')
    Write-Host "  EIS nav link added." -ForegroundColor Green
    $changed = $true
} else {
    Write-Host "  EIS nav link already present -- skipping." -ForegroundColor DarkYellow
}

# Fix 3: Add wa-chat.js
if (-not $idx.Contains("wa-chat.js")) {
    $idx = $idx.Replace('<script src="site-ui.js?v=202604190622" defer></script>', '<script src="site-ui.js?v=202605110001" defer></script>' + "`r`n" + '<script src="wa-chat.js?v=202605110001" defer></script>')
    Write-Host "  wa-chat.js script tag added." -ForegroundColor Green
    $changed = $true
} else {
    Write-Host "  wa-chat.js already present -- skipping." -ForegroundColor DarkYellow
}

if ($changed) {
    [System.IO.File]::WriteAllText("index.html", $idx, [System.Text.Encoding]::UTF8)
    Write-Host "  index.html saved." -ForegroundColor Green
}

# Git commit and push
Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow
git add wa-chat.js eis.html eis-splash.html index.html _headers
git status --short

Write-Host ""
Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "feat: EIS page, in-page WA chat widget, PageSpeed fixes, nav update [May 2026]"

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  https://www.technexusmw.com" -ForegroundColor Cyan
Write-Host "  https://www.technexusmw.com/eis.html" -ForegroundColor Cyan
Write-Host "  https://www.technexusmw.com/eis-splash.html" -ForegroundColor Cyan
