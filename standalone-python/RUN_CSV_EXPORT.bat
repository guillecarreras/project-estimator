@echo off
REM Export to CSV for Excel

echo.
echo ========================================
echo   Exporting to CSV for Excel
echo ========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed
    pause
    exit /b 1
)

if not exist "backlog.json" (
    echo Generating example files first...
    python estimator.py --example
    echo.
)

echo Running estimation with CSV export...
echo.
python estimator.py --csv
echo.

echo ========================================
echo   Files created:
echo   - estimation.csv
echo   - gantt.csv
echo ========================================
echo.
echo You can now open these files in Excel!
echo.

pause






