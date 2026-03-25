@echo off
echo =====================================
echo  Project Estimator - Node.js Setup
echo =====================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo.
    echo [1/3] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
) else (
    echo [*] Dependencies already installed, skipping npm install
)

echo.
echo [2/3] Generating example backlog...
npm run estimate -- --example

echo.
echo [3/3] Running estimation...
npm run estimate -- --csv

echo.
echo =====================================
echo  Done! Results saved to:
echo    estimation.json
echo    estimation.csv
echo    gantt.csv
echo =====================================
echo.
pause
