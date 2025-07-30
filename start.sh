#!/bin/bash

# Convex Backend Startup Script
# Based on https://github.com/get-convex/convex-backend/tree/main/self-hosted/docker-build

set -e

# Create data directory if it doesn't exist
mkdir -p /convex/data

# Initialize database if it doesn't exist
if [ ! -f /convex/data/db.sqlite3 ]; then
    echo "Initializing Convex database..."
    # The backend will create the database on first run
fi

# Start the Convex backend
echo "Starting Convex backend..."
exec convex-backend 