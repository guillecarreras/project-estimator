#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "====================================="
echo " Project Estimator - Python Setup"
echo "====================================="
echo

cd "$SCRIPT_DIR/standalone-python"

PYTHON_CMD="python3"
if ! command -v python3 &>/dev/null; then
    PYTHON_CMD="python"
fi

echo "Checking Python..."
$PYTHON_CMD --version || { echo "ERROR: Python not found. Install Python 3.7+"; exit 1; }

echo
echo "[1/2] Generating example backlog..."
PYTHONIOENCODING=utf-8 $PYTHON_CMD estimator.py --example

echo
echo "[2/2] Running estimation..."
PYTHONIOENCODING=utf-8 $PYTHON_CMD estimator.py --csv

echo
echo "====================================="
echo " Done! Results saved to:"
echo "   standalone-python/estimation.json"
echo "   standalone-python/estimation.csv"
echo "   standalone-python/gantt.csv"
echo "====================================="
