```powershell
# TechNexus — WebP Image Conversion Script
# Converts JPG/JPEG/PNG images to WebP and updates HTML/CSS references.
#
# Run with:
# powershell -ExecutionPolicy Bypass -File .\convert-to-webp.ps1

$ErrorActionPreference = "Stop"

Write-Host "TechNexus WebP Conversion" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# ── Check cwebp installation ──────────────────────────────────────────
$cwebp = Get-Command cwebp -ErrorAction SilentlyContinue

if (-not $cwebp) {
    Write-Host ""
    Write-Host "cwebp not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install using one of these:" -ForegroundColor Yellow
    Write-Host "  choco install webp"
    Write-Host "  scoop install libwebp"
    Write-Host ""
    exit 1
}

Write-Host "cwebp found: $($cwebp.Source)" -ForegroundColor Green

# ── Images to convert ─────────────────────────────────────────────────
$images = @(
    @{ src = "index_main\server_rack_1.jpeg";              quality = 82 },
    @{ src = "index_main\motherboard_assembly_1.jpeg";     quality = 82 },
    @{ src = "index_main\software_dev_1.jpeg";             quality = 82 },
    @{ src = "index_main\african_woman_interpreter_1.jpg"; quality = 82 },
    @{ src = "index_main\medical_equipment_1.jpg";         quality = 82 },
    @{ src = "index_main\server_rack_2.jpg";               quality = 82 },
    @{ src = "og-image.jpg";                               quality = 85 },
    @{ src = "Products_logos\technexuslogo1.jpg";          quality = 90 }
)

# ── Begin conversion ──────────────────────────────────────────────────
Write-Host ""
Write-Host "Converting images..." -ForegroundColor Yellow

$converted = @()

foreach ($img in $images) {

    $src = $img.src
    $q   = $img.quality

    if (-not (Test-Path $src)) {
        Write-Host "  SKIP: File not found -> $src" -ForegroundColor DarkYellow
        continue
    }

    $dir  = Split-Path $src -Parent
    $base = [System.IO.Path]::GetFileNameWithoutExtension($src)

    if ($dir) {
        $dest = Join-Path $dir "$base.webp"
    }
    else {
        $dest = "$base.webp"
    }

    $origSize = (Get-Item $src).Length

    try {

        # Use cmd /c to avoid PowerShell STDERR issue with cwebp
        $null = cmd /c "cwebp -q $q -mt `"$src`" -o `"$dest`""

        if (-not (Test-Path $dest)) {
            Write-Host "  FAILED: $src" -ForegroundColor Red
            continue
        }

        $newSize = (Get-Item $dest).Length

        $savedKB = [math]::Round(($origSize - $newSize) / 1KB, 1)

        if ($origSize -gt 0) {
            $pct = [math]::Round((1 - ($newSize / $origSize)) * 100)
        }
        else {
            $pct = 0
        }

        Write-Host (
            "  OK: {0,-50} {1,8} KB saved ({2}%)" -f $src, $savedKB, $pct
        ) -ForegroundColor Green

        $converted += @{
            oldSlash = $src.Replace("\", "/")
            newSlash = $dest.Replace("\", "/")
        }

    }
    catch {
        Write-Host "  FAILED: $src" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ── Stop if nothing converted ─────────────────────────────────────────
if ($converted.Count -eq 0) {
    Write-Host ""
    Write-Host "No images converted." -ForegroundColor Red
    Write-Host "Check image paths and cwebp installation." -ForegroundColor Yellow
    exit 1
}

# ── Update HTML files ────────────────────────────────────────────────
Write-Host ""
Write-Host "Updating HTML references..." -ForegroundColor Yellow

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.git\\"
}

foreach ($file in $htmlFiles) {

    $content = [System.IO.File]::ReadAllText(
        $file.FullName,
        [System.Text.Encoding]::UTF8
    )

    $changed = $false

    foreach ($c in $converted) {

        if ($content.Contains($c.oldSlash)) {
            $content = $content.Replace($c.oldSlash, $c.newSlash)
            $changed = $true
        }
    }

    if ($changed) {

        [System.IO.File]::WriteAllText(
            $file.FullName,
            $content,
            [System.Text.Encoding]::UTF8
        )

        Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
    }
}

# ── Update CSS files ─────────────────────────────────────────────────
Write-Host ""
Write-Host "Updating CSS references..." -ForegroundColor Yellow

$cssFiles = Get-ChildItem -Path . -Filter "*.css" -Recurse | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.git\\"
}

foreach ($file in $cssFiles) {

    $content = [System.IO.File]::ReadAllText(
        $file.FullName,
        [System.Text.Encoding]::UTF8
    )

    $changed = $false

    foreach ($c in $converted) {

        if ($content.Contains($c.oldSlash)) {
            $content = $content.Replace($c.oldSlash, $c.newSlash)
            $changed = $true
        }
    }

    if ($changed) {

        [System.IO.File]::WriteAllText(
            $file.FullName,
            $content,
            [System.Text.Encoding]::UTF8
        )

        Write-Host "  Updated: $($file.Name)" -ForegroundColor Green
    }
}

# ── Summary ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Conversion complete." -ForegroundColor Cyan
Write-Host "$($converted.Count) image(s) converted." -ForegroundColor Cyan

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  git add -A"
Write-Host "  git commit -m `"perf: convert images to WebP`""
Write-Host "  git push origin main"

Write-Host ""
Write-Host "Original images remain untouched." -ForegroundColor DarkYellow
Write-Host "HTML and CSS now reference .webp files." -ForegroundColor DarkYellow
```
