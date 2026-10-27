param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$distHtml = Join-Path $PSScriptRoot 'dist\index.html'
$rootHtml = Join-Path $PSScriptRoot 'index.html'
if (Test-Path $distHtml) { $root = Join-Path $PSScriptRoot 'dist' }
elseif (Test-Path $rootHtml) { $root = $PSScriptRoot }
else {
  Write-Host "Сначала соберите приложение: npm run build"
  exit 1
}
$prefix = "http://127.0.0.1:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch {
  Write-Host "Не удалось открыть порт $Port. Закройте другое окно запуска и попробуйте снова."
  exit 1
}
Write-Host "Вершина запущена: $prefix"
Write-Host "Папка: $root"
try { Start-Process $prefix } catch {}
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json'
  '.webmanifest' = 'application/manifest+json'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.webp' = 'image/webp'
  '.woff' = 'font/woff'
  '.woff2' = 'font/woff2'
  '.ico' = 'image/x-icon'
}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }
    $file = Join-Path $root ($path -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path $file) -or (Get-Item $file).PSIsContainer) { $file = Join-Path $root 'index.html' }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
    $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    $ctx.Response.StatusCode = 500
  } finally {
    $ctx.Response.Close()
  }
}
