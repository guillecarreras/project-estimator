#!/bin/bash

# Quickstart script for Google Docs Content Generator

echo "======================================"
echo "Google Docs Content Generator"
echo "Quickstart Script"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found. Please run this script from the google-docs-generator directory."
    exit 1
fi

echo "✓ In correct directory"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check pip installation."
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Check for credentials
if [ ! -f "credentials.json" ]; then
    echo "⚠️  credentials.json not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a new project"
    echo "3. Enable Google Docs API"
    echo "4. Create OAuth 2.0 credentials (Desktop app)"
    echo "5. Download credentials.json and place it in this directory"
    echo ""
    echo "For detailed instructions, see SETUP_GUIDE.md"
    echo ""
    read -p "Press Enter once you've placed credentials.json in this directory..."
fi

if [ -f "credentials.json" ]; then
    echo "✓ credentials.json found"
else
    echo "❌ credentials.json still not found. Exiting."
    exit 1
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "To run the tool:"
echo "  python3 src/main.py"
echo ""
echo "For help, see:"
echo "  - README.md (full documentation)"
echo "  - SETUP_GUIDE.md (setup instructions)"
echo "  - USAGE_EXAMPLES.md (usage examples)"
echo ""
