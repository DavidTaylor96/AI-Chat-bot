#!/bin/bash

echo "=================================="
echo "    CLAUDE DESKTOP FOR CODERS    "
echo "=================================="
echo "A desktop client for Claude AI with special features for developers"
echo ""

# Check for .env file
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please edit .env and add your Claude API key if you have one."
  echo "The app will run in mock mode by default until you add a valid API key."
  sleep 2
fi

# Kill any existing processes
pkill -f "electron" || true

# Start in production mode
echo "Starting Claude Desktop in production mode..."
npm run start-prod