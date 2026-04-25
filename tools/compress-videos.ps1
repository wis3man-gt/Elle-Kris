# =============================================================================
# compress-videos.ps1
# Elle & Kris Construction — Video Compression Workflow
#
# REQUIREMENTS — install FFmpeg first:
#   winget install ffmpeg
#   (or) choco install ffmpeg
#   Then restart PowerShell so ffmpeg is on PATH.
#
# USAGE (run from repo root):
#   powershell -ExecutionPolicy Bypass -File tools\compress-videos.ps1
#
# OUTPUT: assets/videos/optimized/
#   <name>.webm  — VP9, primary source
#   <name>.mp4   — H.264, fallback source
# =============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Paths ────────────────────────────────────────────────────────────────────
$InputDir  = Join-Path $PSScriptRoot "..\assets\videos"
$OutputDir = Join-Path $InputDir "optimized"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# ── Check FFmpeg ──────────────────────────────────────────────────────────────
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error @"
FFmpeg not found on PATH.
Install it with:  winget install ffmpeg
Then restart PowerShell and re-run this script.
"@
    exit 1
}

# ── Per-video config ──────────────────────────────────────────────────────────
# maxW:   maximum output width  (never upscales)
# fps:    target frame rate
# crfVP9: VP9  quality  (lower = better; 30–35 for background/decorative video)
# crfH264 H.264 quality (lower = better; 20–24 for background/decorative video)
$VideoConfig = @{
    "heroVideo"  = @{ maxW = 1280; fps = 24; crfVP9 = 30; crfH264 = 22 }
    "whyUsVid1"  = @{ maxW = 960;  fps = 24; crfVP9 = 33; crfH264 = 23 }
    "whyUsVid2"  = @{ maxW = 960;  fps = 24; crfVP9 = 33; crfH264 = 23 }
    "whyUsVid3"  = @{ maxW = 960;  fps = 24; crfVP9 = 33; crfH264 = 23 }
    "whyUsVid4"  = @{ maxW = 960;  fps = 24; crfVP9 = 33; crfH264 = 23 }
}

# ── Helper: human-readable file size ─────────────────────────────────────────
function Format-Size([long]$bytes) {
    if ($bytes -ge 1MB) { return "{0:0.0} MB" -f ($bytes / 1MB) }
    return "{0:0} KB" -f ($bytes / 1KB)
}

# ── Process each .mp4 in the input dir ───────────────────────────────────────
$inputs = Get-ChildItem -Path $InputDir -Filter "*.mp4" -File |
          Where-Object { $_.DirectoryName -eq (Resolve-Path $InputDir).Path }

if ($inputs.Count -eq 0) {
    Write-Host "No .mp4 files found in $InputDir" -ForegroundColor Yellow
    exit 0
}

foreach ($file in $inputs) {
    $name = $file.BaseName
    $cfg  = if ($VideoConfig.ContainsKey($name)) { $VideoConfig[$name] }
            else { @{ maxW = 1280; fps = 24; crfVP9 = 33; crfH264 = 23 } }

    $maxW    = $cfg.maxW
    $fps     = $cfg.fps
    $crfVP9  = $cfg.crfVP9
    $crfH264 = $cfg.crfH264

    # Scale filter: resize only if wider than maxW, keep aspect ratio, even dims
    $scaleFilter = "scale='if(gt(iw,$maxW),$maxW,iw)':'if(gt(iw,$maxW),-2,ih)':flags=lanczos,fps=$fps"

    $outWebm = Join-Path $OutputDir "$name.webm"
    $outMp4  = Join-Path $OutputDir "$name.mp4"

    Write-Host ""
    Write-Host "─── $name ─────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host "    Input:  $(Format-Size $file.Length)" -ForegroundColor Gray

    # ── WebM / VP9 ────────────────────────────────────────────────────────────
    Write-Host "    Encoding WebM (VP9, CRF $crfVP9) …" -ForegroundColor Yellow
    $argsWebm = @(
        "-y",                          # overwrite without asking
        "-i", $file.FullName,
        "-c:v", "libvpx-vp9",
        "-crf", $crfVP9,
        "-b:v", "0",                   # CRF mode (must pair b:v 0 with crf)
        "-vf", $scaleFilter,
        "-an",                         # strip audio (decorative video)
        "-deadline", "best",           # slow but smallest file
        "-cpu-used", "1",              # thoroughness (0=slowest/best, 5=fastest)
        "-row-mt", "1",                # multi-threaded row encoding
        "-tile-columns", "2",
        $outWebm
    )
    & ffmpeg @argsWebm 2>&1 | Where-Object { $_ -match "frame=|error|Error" }
    if (Test-Path $outWebm) {
        $sz = (Get-Item $outWebm).Length
        Write-Host "    WebM:   $(Format-Size $sz)  (saved $([math]::Round((1 - $sz/$file.Length)*100))%)" -ForegroundColor Green
    }

    # ── MP4 / H.264 fallback ─────────────────────────────────────────────────
    Write-Host "    Encoding MP4 (H.264, CRF $crfH264) …" -ForegroundColor Yellow
    $argsMp4 = @(
        "-y",
        "-i", $file.FullName,
        "-c:v", "libx264",
        "-crf", $crfH264,
        "-preset", "slow",
        "-vf", $scaleFilter,
        "-an",
        "-movflags", "+faststart",     # moov atom at front for streaming
        "-pix_fmt", "yuv420p",         # broad browser compatibility
        $outMp4
    )
    & ffmpeg @argsMp4 2>&1 | Where-Object { $_ -match "frame=|error|Error" }
    if (Test-Path $outMp4) {
        $sz = (Get-Item $outMp4).Length
        Write-Host "    MP4:    $(Format-Size $sz)  (saved $([math]::Round((1 - $sz/$file.Length)*100))%)" -ForegroundColor Green
    }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Done. Optimized files are in:" -ForegroundColor Cyan
Write-Host "  $OutputDir" -ForegroundColor White
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review quality in a browser"
Write-Host "  2. Move files from optimized/ into assets/videos/"
Write-Host "  3. Update <source> tags to include .webm before .mp4"
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
