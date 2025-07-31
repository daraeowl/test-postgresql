#!/bin/bash

# Set CORS environment variables
export CORS_ORIGINS="http://localhost:6791,https://convex-dev.jrrojas.dev"
export ALLOWED_ORIGINS="http://localhost:6791,https://convex-dev.jrrojas.dev"
export CORS_ALLOW_ORIGIN="http://localhost:6791,https://convex-dev.jrrojas.dev"
export CORS_ALLOW_CREDENTIALS="true"
export CORS_ALLOW_METHODS="GET,POST,PUT,DELETE,OPTIONS"
export CORS_ALLOW_HEADERS="Content-Type,Authorization,X-Requested-With"

# Create data directory if it doesn't exist
mkdir -p /convex/data

# Start the Convex backend without passing the database path argument
exec convex-local-backend --db sqlite 