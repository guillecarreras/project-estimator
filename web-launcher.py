#!/usr/bin/env python3
"""
Web Launcher for Project Estimation Tool
Serves the HTML launcher on a local web server
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve files with proper headers"""
    
    def end_headers(self):
        # Add headers to allow local file access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        sys.stdout.write("%s - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))


def find_available_port(start_port=8000, max_attempts=10):
    """Find an available port to use"""
    port = start_port
    for _ in range(max_attempts):
        try:
            with socketserver.TCPServer(("", port), None) as s:
                return port
        except OSError:
            port += 1
    return None


def main():
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print("\n" + "="*60)
    print("  Project Estimation Tool - Web Launcher")
    print("="*60)
    print()
    
    # Find available port
    port = find_available_port(PORT)
    if port is None:
        print(f"❌ Could not find an available port. Ports {PORT}-{PORT+9} are in use.")
        print("   Please close other applications or specify a different port.")
        input("\nPress Enter to exit...")
        return
    
    # Create server
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            url = f"http://localhost:{port}/launcher.html"
            
            print(f"🚀 Server started on port {port}")
            print(f"📂 Serving from: {script_dir}")
            print(f"🌐 Opening browser: {url}")
            print()
            print("="*60)
            print("  Server is running...")
            print("  Press Ctrl+C to stop")
            print("="*60)
            print()
            
            # Open browser
            webbrowser.open(url)
            
            # Serve forever
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print("  Server stopped")
        print("="*60)
        print()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        input("\nPress Enter to exit...")


if __name__ == "__main__":
    main()






