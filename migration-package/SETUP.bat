@echo off
REM Automated setup script for Node.js version

echo.
echo ================================================================
echo   Project Estimation Tool - Node.js Version Setup
echo ================================================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run this script again.
    echo.
    pause
    exit /b 1
)

echo      Node.js found: 
node --version
echo.

REM Check npm
echo [2/4] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo      ERROR: npm not found!
    pause
    exit /b 1
)

echo      npm found: 
npm --version
echo.

REM Install dependencies
echo [3/4] Installing dependencies...
echo      This may take 30-60 seconds...
echo.
npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed!
    echo Try running: npm install --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

echo.
echo      Dependencies installed successfully!
echo.

REM Generate example files
echo [4/4] Generating example files...
call npm run estimate -- --example
if errorlevel 1 (
    echo      Warning: Could not generate examples
)

echo.
echo ================================================================
echo   Setup Complete!
echo ================================================================
echo.
echo Next steps:
echo   1. Edit backlog.json with your project items
echo   2. Run: npm run estimate
echo   3. View results in estimation.json
echo.
echo Quick commands:
echo   npm run estimate              - Run estimation
echo   npm run estimate -- --csv     - Export to CSV
echo   npm run estimate -- --prompts - View AI templates
echo   npm run estimate -- --help    - Show all options
echo.
echo Documentation:
echo   README.md       - Complete guide
echo   QUICKSTART.md   - Quick reference
echo.
echo ================================================================
echo.

pause






