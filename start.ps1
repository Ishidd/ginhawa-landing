$ErrorActionPreference = 'Stop'
$websiteNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if ($websiteNode) {
    $websiteVersion = [version]((& $websiteNode --version).TrimStart('v'))
}
if (-not $websiteNode -or $websiteVersion -lt [version]'24.0.0') {
    $websiteNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $websiteNode)) {
    throw 'Install Node.js 24 or later, then run npm install and npm run dev in this directory.'
}
$websiteCli = Join-Path $PSScriptRoot 'node_modules\astro\bin\astro.mjs'
if (-not (Test-Path -LiteralPath $websiteCli)) {
    throw 'Dependencies are missing. With Node.js 24 or later, run npm ci in this directory first.'
}
$env:ASTRO_TELEMETRY_DISABLED = '1'
Push-Location -LiteralPath $PSScriptRoot
try {
    & $websiteNode $websiteCli dev --host 127.0.0.1
} finally {
    Pop-Location
}
