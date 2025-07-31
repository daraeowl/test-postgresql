#!/bin/bash

# Start local development environment for Convex with Cloudflare tunnel
echo "🚀 Starting Convex local development environment..."

# Check if CONVEX_ADMIN_KEY is set
if [ -z "$CONVEX_ADMIN_KEY" ]; then
    echo "⚠️  Warning: CONVEX_ADMIN_KEY environment variable is not set."
    echo "   You can set it by running: export CONVEX_ADMIN_KEY=your-admin-key"
    echo "   Or add it to your shell profile (~/.bashrc, ~/.zshrc, etc.)"
fi

# Build and start the services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Services are starting up!"
echo ""
echo "🌐 Access your services via Cloudflare tunnel:"
echo "   - Convex Dashboard: https://convex-dev.jrrojas.dev (port 6791)"
echo "   - Backend API: https://convex-dev.jrrojas.dev (port 3210)"
echo "   - Health Check: https://convex-dev.jrrojas.dev/version"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""
echo "🔧 If you need to update the admin key, restart the services:"
echo "   docker-compose down && CONVEX_ADMIN_KEY=your-key docker-compose up -d"
echo ""
echo "🌍 Make sure your Cloudflare tunnel is configured to route:"
echo "   - convex-dev.jrrojas.dev → localhost:6791 (dashboard)"
echo "   - convex-dev.jrrojas.dev/api/* → localhost:3210 (backend)" 