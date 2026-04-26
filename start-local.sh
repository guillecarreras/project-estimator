#!/bin/bash

# Start local development server
# Uses SQLite for easy local testing

set -e

echo "🚀 Starting Project Estimator Local Server..."
echo ""

# Setup
export NODE_ENV=development
export DATABASE_URL="sqlite:./data/estimator.db"
export PORT=3000
export JWT_SECRET="dev-secret-key-$(date +%s)"

# Create data directory
mkdir -p data

# Build if needed
if [ ! -d "dist" ]; then
  echo "📦 Building TypeScript..."
  npm run build
fi

echo ""
echo "✅ Build complete"
echo ""
echo "🌐 Server starting on http://localhost:3000"
echo ""
echo "📚 API Endpoints:"
echo "  POST   /api/estimations       - Create estimation"
echo "  GET    /api/estimations       - List estimations"
echo "  GET    /api/estimations/:id   - Get estimation"
echo "  POST   /api/projects          - Create project"
echo "  GET    /api/projects          - List projects"
echo ""
echo "🔍 Status:"
echo "  GET    /health                - Health check"
echo "  GET    /ready                 - Readiness check"
echo ""
echo "📊 Default Login (Demo):"
echo "  Username: admin"
echo "  Password: demo123"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start server
node dist/api/server.js
