@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "node_modules\" if exist "package.json" if not exist "dist\index.html" (
  echo Первый запуск: ставлю зависимости и собираю приложение...
  call npm install
  call npm run assets
  call npm run build
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 pause
