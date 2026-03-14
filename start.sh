#!/bin/zsh
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Spot.AI Landing Page Lab on http://localhost:3001"
npm start
