#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please edit .env and add your Claude API key"
  exit 1
fi

# Start the app in development mode
npm run electron-dev