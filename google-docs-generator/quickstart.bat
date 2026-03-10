@echo off
REM Quickstart script for Google Docs Content Generator (Windows)

echo ======================================
echo Google Docs Content Generator
echo Quickstart Script
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo [OK] Python found
python --version
echo.

REM Check if we're in the right directory
if not exist "requirements.txt" (
    echo [X] requirements.txt not found. Please run this script from the google-docs-generator directory.
    pause
    exit /b 1
)

echo [OK] In correct directory
echo.

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo [X] Failed to install dependencies. Please check pip installation.
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Check for credentials
if not exist "credentials.json" (
    echo [!] credentials.json not found!
    echo.
    echo Please follow these steps:
    echo 1. Go to https://console.cloud.google.com/
    echo 2. Create a new project
    echo 3. Enable Google Docs API
    echo 4. Create OAuth 2.0 credentials (Desktop app^)
    echo 5. Download credentials.json and place it in this directory
    echo.
    echo For detailed instructions, see SETUP_GUIDE.md
    echo.
    pause
)

if exist "credentials.json" (
    echo [OK] credentials.json found
) else (
    echo [X] credentials.json still not found. Exiting.
    pause
    exit /b 1
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo To run the tool:
echo   python src/main.py
echo.
echo For help, see:
echo   - README.md (full documentation^)
echo   - SETUP_GUIDE.md (setup instructions^)
echo   - USAGE_EXAMPLES.md (usage examples^)
echo.
pause
