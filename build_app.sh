#!/bin/bash

# Print banner
echo "=================================="
echo "  Taylor DESKTOP BUILD SCRIPT   "
echo "=================================="
echo "Building Taylor Desktop application for distribution"
echo ""

# Check for required dependencies
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required but not installed. Please install Node.js first."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required but not installed. Please install npm first."; exit 1; }

# Ensure we have all dependencies
echo "Installing dependencies..."
npm install

# Build the React app
echo "Building React application..."
npm run build

# Create Electron distributable
echo "Creating Electron distributable packages..."
npm run package

echo ""
echo "Build complete! Distributables are available in the dist/ directory."
echo "=================================="