# Glue worklets (powershell version)
#
# This script is used to glue worklet processors into the build process.
# It reads the worklet files, wraps them in a module, and exports them for use in the main library.
# Note: this cannot script cannot be used from a bundler, and is only meant to be run for development/build purposes.
# 
# ~ Rohan Kanhaisingh

param(
    [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')),
    [string]$GluePath = (Join-Path $Root 'lib/_dist/wasm/fluex_dsp.js'),
    [string]$WorkletsGlob = (Join-Path $Root 'lib/src/worklets/*.worklet.js'),
    [string]$OutFile = (Join-Path $Root 'lib/src/worklets/generated.ts')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function To-TSIdentifier([string]$name) {

    $base = $name -replace '\.worklet\.js$', ''
    $base = $base -replace '[^0-9A-Za-z]+', ' '
    $parts = ($base.Trim() -split '\s+') | Where-Object { $_ -ne '' }
    if ($parts.Count -eq 0) { return 'Worklet' }
    $parts = $parts | ForEach-Object {
        if ($_ -match '^\d') { "_$_" } else { $_ }
    }
    return ($parts | ForEach-Object { $_.Substring(0, 1).ToUpper() + $_.Substring(1) }) -join ''
}

function Escape-ForTemplate([string]$text) {

    $t = $text -replace '^\uFEFF', ''
    $t = $t -replace '`', '\`'
    $t = $t -replace '\$\{', '\${'
    return $t
}

if (!(Test-Path -LiteralPath $GluePath)) {
    throw "Glue niet gevonden: $GluePath. Run eerst: wasm-pack build --target web --out-dir lib/wasm-dist"
}

$workletFiles = @(Get-ChildItem -Path $WorkletsGlob -File -ErrorAction Stop)

if (($workletFiles | Measure-Object).Count -eq 0) {
    throw "Geen worklet-bestanden gevonden met glob: $WorkletsGlob"
}

$glueRaw = Get-Content -LiteralPath $GluePath -Raw -Encoding UTF8
$glueEsc = Escape-ForTemplate $glueRaw

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("/* AUTO-GENERATED - do not edit */")
[void]$sb.AppendLine("// Dit bestand bevat gecombineerde (glue + worklet) bronnen als template strings.")
[void]$sb.AppendLine("// Elke export is self-contained en geschikt voor AudioWorklet.addModule(BlobURL).")
[void]$sb.AppendLine("")

$mapEntries = New-Object System.Collections.Generic.List[string]

foreach ($wf in $workletFiles) {
    $name = $wf.Name                              
    $stem = ($name -replace '\.worklet\.js$', '')  
    $id = To-TSIdentifier $name                 
    $constName = "${id}WorkletSource"             

    $workletRaw = Get-Content -LiteralPath $wf.FullName -Raw -Encoding UTF8
    $workletEsc = Escape-ForTemplate $workletRaw

    $combined = "$glueEsc`r`n`r`n$workletEsc"

    [void]$sb.AppendLine("export const $constName = `$combined`;")
    [void]$sb.AppendLine("")

    $mapEntries.Add("  `"$stem`": $constName")
}

[void]$sb.AppendLine("export const WORKLETS = {")

if ($mapEntries.Count -gt 0) {
    [void]$sb.AppendLine(($mapEntries -join ",`n"))
}

[void]$sb.AppendLine("} as const;")
[void]$sb.AppendLine("export type WorkletName = keyof typeof WORKLETS;")

$outDir = Split-Path -Parent $OutFile
if (!(Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutFile, $sb.ToString(), $utf8NoBom)