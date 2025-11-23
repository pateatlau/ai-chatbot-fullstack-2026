#!/bin/bash

# Database Container Stop Script
# Stops PostgreSQL, Redis, and MongoDB containers

set -e

cd "$(dirname "$0")/.."

echo "🛑 Stopping database containers..."
echo ""

# Stop PostgreSQL
echo "📦 Stopping PostgreSQL..."
docker stop myapp-postgres 2>/dev/null || true

# Stop Redis
echo "📦 Stopping Redis..."
docker stop myapp-redis 2>/dev/null || true

# Stop MongoDB
echo "📦 Stopping MongoDB..."
docker stop mongodb-dev 2>/dev/null || true

sleep 2

echo ""
echo "✅ All database containers stopped!"
echo ""
echo "💡 Tip: Run 'npm run db:start' to start all containers again"
