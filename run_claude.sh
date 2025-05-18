#!/bin/bash

# Print banner
echo "=================================="
echo "    Taylor DESKTOP FOR CODERS    "
echo "=================================="
echo "A desktop client for Taylor AI with special features for developers"
echo ""

# Check for required dependencies
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required but not installed. Please install Node.js first."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required but not installed. Please install npm first."; exit 1; }

# Check node version
node_version=$(node -v | cut -d 'v' -f 2)
required_version="14.0.0"
if [[ $(echo -e "$node_version\n$required_version" | sort -V | head -n1) != "$required_version" ]]; then
  echo "Warning: Recommended Node.js version is v14.0.0 or higher. You have $node_version"
  echo "The application may not work correctly with older versions."
  sleep 2
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please edit .env and add your Taylor API key if you have one."
  echo "The app will run in mock mode by default until you add a valid API key."
  sleep 3
fi

# Check for API key and warn if not found
if grep -q "REACT_APP_Taylor_API_KEY=" .env && ! grep -q "REACT_APP_Taylor_API_KEY=sk-" .env; then
  echo "WARNING: No Taylor API key found. The app will run in mock mode."
  echo "To use the real Taylor API, edit the .env file and add your API key."
  echo "Running in mock mode for now..."
  sleep 2
fi

# Kill any existing processes
pkill -f "react-scripts start" || true
pkill -f "electron" || true

# Start the application using our development script
echo "Starting Taylor Desktop..."
npm run electron-dev