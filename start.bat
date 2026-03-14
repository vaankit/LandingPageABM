@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    exit /b 1
  )
)

echo Starting Spot.AI Landing Page Lab on http://0.0.0.0:3001
call npm start
