#!/bin/bash

echo "🧹 Cleaning up previous installations..."

# Remove node_modules and package-lock files
rm -rf node_modules
rm -f package-lock.json

cd client
rm -rf node_modules
rm -f package-lock.json
cd ..

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps
cd ..

echo "✅ Installation complete!"
echo "🚀 Run 'npm start' to start the development server" 