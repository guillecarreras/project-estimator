#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "====================================="
echo " Project Estimator - Node.js Setup"
echo "====================================="
echo

cd "$SCRIPT_DIR"

echo "Checking Node.js..."
node --version || { echo "ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org"; exit 1; }

if [ ! -d "node_modules" ]; then
    echo
    echo "[1/3] Installing dependencies..."
    npm install
else
    echo "[*] Dependencies already installed, skipping npm install"
fi

echo
echo "[2/3] Generating example backlog..."
npm run estimate -- --example

echo
echo "[3/3] Running estimation..."
npm run estimate -- --csv

echo
echo "====================================="
echo " Done! Results saved to:"
echo "   estimation.json"
echo "   estimation.csv"
echo "   gantt.csv"
echo "====================================="
