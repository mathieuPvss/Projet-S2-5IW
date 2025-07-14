#!/bin/sh

# Set default environment variables if not provided
export NUXT_PORT=${NUXT_PORT:-4444}
export NUXT_HOST=${NUXT_HOST:-0.0.0.0}
export PORT=${PORT:-$NUXT_PORT}

# Ensure other environment variables are available
export AUTH_BASE_URL=${AUTH_BASE_URL}
export NEST_BASE_URL=${NEST_BASE_URL}
export SCRAPER_LOCAL_URL=${SCRAPER_LOCAL_URL}

echo "Starting Nuxt server on $NUXT_HOST:$NUXT_PORT"
echo "Environment variables:"
echo "  NUXT_HOST: $NUXT_HOST"
echo "  NUXT_PORT: $NUXT_PORT"
echo "  AUTH_BASE_URL: $AUTH_BASE_URL"
echo "  NEST_BASE_URL: $NEST_BASE_URL"
echo "  SCRAPER_LOCAL_URL: $SCRAPER_LOCAL_URL"

# Start the Node.js server directly with environment variables
exec node .playground/.output/server/index.mjs
