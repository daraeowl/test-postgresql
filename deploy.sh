#!/bin/bash

# Game Items API - Self-Hosted Convex Deployment Script

echo "🚀 Deploying Game Items API to Self-Hosted Convex..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
# Convex Self-Hosted Configuration
INSTANCE_NAME=game-items-api
INSTANCE_SECRET=$(openssl rand -hex 32)

# Port Configuration
PORT=3210
SITE_PROXY_PORT=3211
DASHBOARD_PORT=6791

# Convex Cloud Configuration
CONVEX_CLOUD_ORIGIN=http://127.0.0.1:3210
CONVEX_SITE_ORIGIN=http://127.0.0.1:3211
NEXT_PUBLIC_DEPLOYMENT_URL=http://127.0.0.1:3210

# Logging Configuration
RUST_LOG=info

# Optional: Disable beacon for self-hosted
DISABLE_BEACON=true

# Optional: Redact logs for privacy
REDACT_LOGS_TO_CLIENT=false

# Optional: Timeout configuration
ACTIONS_USER_TIMEOUT_SECS=300

# Game Items API Configuration
GAME_ITEMS_API_URL=https://api.ashescodex.com/items
API_CACHE_DURATION=300000
EOF
    echo "✅ Created .env file with default configuration"
fi

# Start the Convex services
echo "📦 Starting Convex services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Convex services are running!"
    echo ""
    echo "🌐 Dashboard: http://localhost:6791"
    echo "🔧 Backend: http://localhost:3210"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open http://localhost:6791 in your browser"
    echo "2. Navigate to the 'Functions' tab"
    echo "3. Upload your convex/ folder"
    echo "4. Test the game items API integration"
else
    echo "❌ Failed to start Convex services"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎮 Game Items API Integration Ready!"
echo "You can now use the Convex functions to interact with the game items API." 