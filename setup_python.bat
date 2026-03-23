@echo off
chcp 65001 > nul
echo =====================================
echo  Project Estimator - Python Setup
echo =====================================
echo.

cd /d "%~dp0standalone-python"

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

echo.
echo [1/2] Generating example backlog...
python -X utf8 estimator.py --example
if errorlevel 1 (
    echo ERROR: Setup failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Running estimation...
python -X utf8 estimator.py --csv

echo.
echo =====================================
echo  Done! Results saved to:
echo    standalone-python\estimation.json
echo    standalone-python\estimation.csv
echo    standalone-python\gantt.csv
echo =====================================
echo.
pause
