#!/bin/bash

# Universal deployment script for Convex self-hosted
echo "🚀 Deploying Convex self-hosted instance..."

# Check if we're in a CI/CD environment
if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]; then
    echo "📦 CI/CD environment detected"
    DEPLOY_MODE="ci"
else
    echo "💻 Local deployment detected"
    DEPLOY_MODE="local"
fi

# Set default environment variables
export CONVEX_ADMIN_KEY=${CONVEX_ADMIN_KEY:-"847b4026aee7394a0d0863bbd847c20f28d546067e7c0480bd9d6d0067f3e644"}
export INSTANCE_SECRET=${INSTANCE_SECRET:-"847b4026aee7394a0d0863bbd847c20f28d546067e7c0480bd9d6d0067f3e644"}
export CONVEX_CLOUD_ORIGIN="https://convex-dev.jrrojas.dev"
export CONVEX_SITE_ORIGIN="https://convex-dev.jrrojas.dev"
export NEXT_PUBLIC_DEPLOYMENT_URL="https://convex-dev.jrrojas.dev"

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -f http://localhost:3210/version > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:6791 > /dev/null 2>&1; then
    echo "✅ Dashboard is healthy"
else
    echo "❌ Dashboard health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "🌐 Your services are running:"
echo "   - Backend: http://localhost:3210"
echo "   - Dashboard: http://localhost:6791"
echo ""
echo "🔑 Admin Key: $CONVEX_ADMIN_KEY"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart" 