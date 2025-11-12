#!/bin/bash
# Automated setup script for Node.js version (Linux/Mac)

echo ""
echo "================================================================"
echo "  Project Estimation Tool - Node.js Version Setup"
echo "================================================================"
echo ""

# Check Node.js
echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo ""
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Or use your package manager:"
    echo "  - Mac: brew install node"
    echo "  - Ubuntu: sudo apt install nodejs npm"
    echo ""
    exit 1
fi

echo "     Node.js found: $(node --version)"
echo ""

# Check npm
echo "[2/4] Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "     ERROR: npm not found!"
    exit 1
fi

echo "     npm found: $(npm --version)"
echo ""

# Install dependencies
echo "[3/4] Installing dependencies..."
echo "     This may take 30-60 seconds..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: npm install failed!"
    echo "Try running: npm install --legacy-peer-deps"
    echo ""
    exit 1
fi

echo ""
echo "     Dependencies installed successfully!"
echo ""

# Generate example files
echo "[4/4] Generating example files..."
npm run estimate -- --example
if [ $? -ne 0 ]; then
    echo "     Warning: Could not generate examples"
fi

echo ""
echo "================================================================"
echo "  Setup Complete!"
echo "================================================================"
echo ""
echo "Next steps:"
echo "  1. Edit backlog.json with your project items"
echo "  2. Run: npm run estimate"
echo "  3. View results in estimation.json"
echo ""
echo "Quick commands:"
echo "  npm run estimate              - Run estimation"
echo "  npm run estimate -- --csv     - Export to CSV"
echo "  npm run estimate -- --prompts - View AI templates"
echo "  npm run estimate -- --help    - Show all options"
echo ""
echo "Documentation:"
echo "  README.md       - Complete guide"
echo "  QUICKSTART.md   - Quick reference"
echo ""
echo "================================================================"
echo ""






