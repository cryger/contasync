# =============================================================
#  Contasync v2 - mueve el código viejo a _legacy\
#  Ejecutar UNA vez desde la carpeta del proyecto:
#     powershell -ExecutionPolicy Bypass -File .\reestructurar.ps1
#  No borra nada: cuando confirmes que todo funciona, elimina _legacy\
# =============================================================
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$legacy = Join-Path $PSScriptRoot '_legacy'
New-Item -ItemType Directory -Force $legacy | Out-Null

function Mover($ruta) {
  if (Test-Path $ruta) {
    $destino = Join-Path $legacy $ruta
    New-Item -ItemType Directory -Force (Split-Path $destino) | Out-Null
    Move-Item $ruta $destino -Force
    Write-Host "  movido  $ruta" -ForegroundColor DarkGray
  }
}

Write-Host "`n1) Logos a frontend\public" -ForegroundColor Cyan
New-Item -ItemType Directory -Force 'frontend\public' | Out-Null
if (Test-Path 'public') {
  Get-ChildItem 'public' | ForEach-Object { Copy-Item $_.FullName 'frontend\public' -Force }
}

Write-Host "`n2) Frontend viejo (template Argon) a _legacy" -ForegroundColor Cyan
'src', 'public', 'dist', 'node_modules', 'index.html', 'vite.config.js', 'package-lock.json',
'DownloadReportButton.js', '.github', '.env' | ForEach-Object { Mover $_ }

Write-Host "`n3) Backend viejo a _legacy" -ForegroundColor Cyan
'backend\src\routes', 'backend\src\controllers', 'backend\src\models', 'backend\src\config\database.js',
'backend\testConnection.js', 'backend\package-lock.json', 'backend\node_modules' | ForEach-Object { Mover $_ }

Write-Host "`n4) Archivo .env del backend" -ForegroundColor Cyan
$envFile = 'backend\.env'
if (-not (Test-Path $envFile) -or (Get-Item $envFile).Length -eq 0) {
  Copy-Item 'backend\.env.example' $envFile -Force
  Write-Host "  creado backend\.env desde .env.example -> pon tu contraseña de PostgreSQL" -ForegroundColor Yellow
}

Write-Host "`nListo. Siguiente:" -ForegroundColor Green
Write-Host "  npm run instalar"
Write-Host "  (crear la base) psql -U postgres -p 5433 -c `"CREATE DATABASE contasync_facturacion;`""
Write-Host "  npm run db:init"
Write-Host "  npm run dev"
