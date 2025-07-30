# Multi-stage build for Convex backend
FROM ghcr.io/get-convex/convex-backend:5143fec81f146ca67495c12c6b7a15c5802c37e2

# Set working directory
WORKDIR /app

# Copy convex functions
COPY convex/ ./convex/

# Copy configuration files
COPY dokploy.yaml ./
COPY convex.json ./

# Expose ports
EXPOSE 3210 3211

# Set environment variables
ENV INSTANCE_NAME=game-items-api
ENV RUST_LOG=info
ENV DISABLE_BEACON=true
ENV REDACT_LOGS_TO_CLIENT=false
ENV ACTIONS_USER_TIMEOUT_SECS=300

# Health check
HEALTHCHECK --interval=5s --start-period=5s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3210/version || exit 1

# Start the Convex backend
CMD ["convex-backend"] 