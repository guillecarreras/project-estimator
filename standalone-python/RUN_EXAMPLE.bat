@echo off
REM Quick run script for Windows

echo.
echo ========================================
echo   Project Estimator - Python Version
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Download Python from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Python detected!
echo.

REM Check if backlog.json exists
if not exist "backlog.json" (
    echo No backlog.json found. Generating example files...
    echo.
    python estimator.py --example
    echo.
)

echo Running estimation...
echo.
python estimator.py
echo.

echo ========================================
echo   Results saved to estimation.json
echo ========================================
echo.

pause






