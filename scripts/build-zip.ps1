# Builds the Chrome Web Store upload zip:
#   preferred-account-login-v<version>.zip  (version read from manifest.json)
# Only manifest.json, icons/, and src/ are included.
#
# Uses .NET zip APIs directly (instead of Compress-Archive) so entry names
# use spec-compliant forward slashes.
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
$root = (Get-Location).Path

$version = (Get-Content manifest.json -Raw | ConvertFrom-Json).version
if (-not $version) {
	throw "Could not read version from manifest.json"
}

$out = "preferred-account-login-v$version.zip"
if (Test-Path $out) {
	Remove-Item $out -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @(Get-Item manifest.json) +
	(Get-ChildItem -Path icons, src -File | Where-Object { $_.Extension -ne ".svg" })

$archive = [System.IO.Compression.ZipFile]::Open(
	(Join-Path $root $out),
	[System.IO.Compression.ZipArchiveMode]::Create
)
try {
	foreach ($file in $files) {
		$entryName = $file.FullName.Substring($root.Length + 1) -replace "\\", "/"
		[void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
			$archive,
			$file.FullName,
			$entryName
		)
	}
} finally {
	$archive.Dispose()
}

Write-Output "Created $out"
