@echo off
REM Web Launcher - Opens HTML interface in browser

REM Change to the script's directory
cd /d "%~dp0"

echo.
echo ================================================================
echo   Project Estimation Tool - Web Launcher
echo ================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Warning: Python not found. Trying to open HTML directly...
    echo.
    start "" "%~dp0launcher.html"
    echo.
    echo If the page doesn't work properly, install Python and run:
    echo   python web-launcher.py
    echo.
    pause
    exit /b 0
)

echo Starting web server...
echo.
python web-launcher.py

pause

