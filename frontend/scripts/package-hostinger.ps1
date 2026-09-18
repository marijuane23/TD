Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$distPath = (Get-Item 'dist').FullName
$zipPath = Join-Path $distPath 'hostinger-deploy.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $distPath -Recurse -File | Where-Object { $_.FullName -ne $zipPath } | ForEach-Object {
    $relPath = $_.FullName.Substring($distPath.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath)
}
$zip.Dispose()

Write-Host " Successfully created hostinger-deploy.zip with forward-slash paths!"
