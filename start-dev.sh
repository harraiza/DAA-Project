#!/bin/bash

echo "🚀 Starting Algorithm Quest Development Server"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to client directory
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎮 Starting React development server..."
echo "🌐 The app will be available at: http://localhost:3000"
echo "📱 Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start 