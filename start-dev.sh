#!/bin/bash

echo "🧹 Cleaning up existing processes..."

# Kill any existing processes
pkill -f "concurrently\|nodemon\|react-scripts" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "🚀 Starting development server..."

# Start the frontend
cd client
npm start &
CLIENT_PID=$!
cd ..

echo "⏳ Waiting for React app to start..."
sleep 10

# Test frontend
echo "🔍 Testing frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ React app is running on port 3000"
else
    echo "⚠️  React app may still be starting..."
fi

echo ""
echo "🎉 Development environment is starting!"
echo "📱 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for user to stop
wait 