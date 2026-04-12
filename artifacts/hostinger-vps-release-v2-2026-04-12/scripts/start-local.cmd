@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT_DIR=%~dp0.."
for %%I in ("%ROOT_DIR%") do set "ROOT_DIR=%%~fI"
set "API_URL=http://127.0.0.1:5000/api/v1/health"
set "WEB_URL=http://127.0.0.1:3001"
set "API_OUT=%ROOT_DIR%\.local-runtime\api.out.log"
set "API_ERR=%ROOT_DIR%\.local-runtime\api.err.log"
set "WEB_OUT=%ROOT_DIR%\.local-runtime\web.out.log"
set "WEB_ERR=%ROOT_DIR%\.local-runtime\web.err.log"

if not exist "%ROOT_DIR%\.local-runtime" mkdir "%ROOT_DIR%\.local-runtime"

if not exist "%ROOT_DIR%\.next\BUILD_ID" (
  echo Frontend build not found, running npm.cmd run build:web ...
  call npm.cmd run build:web
  if errorlevel 1 exit /b 1
)

call :check_url "%API_URL%"
if errorlevel 1 (
  start "" /min cmd.exe /c "cd /d %ROOT_DIR% && node src\index.js 1>>%API_OUT% 2>>%API_ERR%"
  echo Backend API launch requested.
) else (
  echo Backend API is already responding.
)

call :wait_for_url "%API_URL%" "Backend API"
if errorlevel 1 exit /b 1

call :check_url "%WEB_URL%"
if errorlevel 1 (
  start "" /min cmd.exe /c "cd /d %ROOT_DIR% && node scripts\start-web-local.js 1>>%WEB_OUT% 2>>%WEB_ERR%"
  echo Frontend Web launch requested.
) else (
  echo Frontend Web is already responding.
)

call :wait_for_url "%WEB_URL%" "Frontend Web"
if errorlevel 1 exit /b 1

echo Local stack started successfully.
echo Public site: http://127.0.0.1:3001
echo Login CMS: http://127.0.0.1:3001/login
echo CMS: http://127.0.0.1:3001/cms
echo API health: http://127.0.0.1:5000/api/v1/health
echo API log: %API_OUT%
echo Web log: %WEB_OUT%
exit /b 0

:check_url
curl.exe -sS --max-time 3 "%~1" >nul 2>nul
exit /b %errorlevel%

:wait_for_url
set "WAIT_URL=%~1"
set "WAIT_LABEL=%~2"
set /a ATTEMPT=0
:wait_loop
call :check_url "%WAIT_URL%"
if not errorlevel 1 exit /b 0
set /a ATTEMPT+=1
if !ATTEMPT! GEQ 30 (
  echo %~2 failed to become ready: %~1
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait_loop
