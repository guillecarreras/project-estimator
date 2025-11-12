#!/bin/bash
# Web Launcher - Opens HTML interface in browser

echo ""
echo "================================================================"
echo "  Project Estimation Tool - Web Launcher"
echo "================================================================"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Starting web server..."
    echo ""
    python3 web-launcher.py
elif command -v python &> /dev/null; then
    echo "Starting web server..."
    echo ""
    python web-launcher.py
else
    echo "Warning: Python not found. Trying to open HTML directly..."
    echo ""
    
    # Try to open with default browser
    if command -v xdg-open &> /dev/null; then
        xdg-open launcher.html
    elif command -v open &> /dev/null; then
        open launcher.html
    else
        echo "Could not open browser automatically."
        echo "Please open launcher.html manually in your browser."
    fi
    
    echo ""
    echo "For better experience, install Python and run:"
    echo "  python3 web-launcher.py"
    echo ""
fi






