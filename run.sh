#!/bin/bash

echo "=================================="
echo "    CLAUDE DESKTOP FOR CODERS    "
echo "=================================="
echo "A desktop client for Claude AI with special features for developers"
echo ""

echo "Starting Claude Desktop..."

# For development mode (React + Electron)
if [ "$1" == "dev" ]; then
  echo "Running in development mode"
  npm run electron-dev
# For production mode (already built app)
else
  echo "Running in production mode"
  
  # Check if build directory exists
  if [ ! -d "build" ]; then
    echo "Build directory not found. Building the application first..."
    npm run build
  fi
  
  # Start the electron app with the built React app
  npm run start-prod
fi