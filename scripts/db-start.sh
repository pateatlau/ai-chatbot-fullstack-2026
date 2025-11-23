#!/bin/bash

# Database Container Start Script
# Starts PostgreSQL, Redis, and MongoDB containers

set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting database containers..."
echo ""

# PostgreSQL
echo "📦 Starting PostgreSQL (port 5432)..."
docker start myapp-postgres 2>/dev/null || docker-compose up -d postgres

# Redis
echo "📦 Starting Redis (port 6379)..."
docker start myapp-redis 2>/dev/null || docker-compose up -d redis

# MongoDB
echo "📦 Starting MongoDB (port 27017)..."
docker start mongodb-dev 2>/dev/null || docker run -d --name mongodb-dev -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=mongo_dev_password -v mongodb_dev_data:/data/db mongo:7 > /dev/null 2>&1 || true

sleep 3

echo ""
echo "✅ Waiting for containers to be ready..."
sleep 3

# Verify all are running
echo ""
echo "📊 Container Status:"
docker ps | grep -E "postgres|redis|mongodb" || echo "⚠️  Some containers may still be starting..."

echo ""
echo "✅ All database containers started!"
echo ""
echo "📍 Connection Details:"
echo "   PostgreSQL: localhost:5432 (user: myapp, password: myapp_dev_password, db: myapp_dev)"
echo "   Redis:      localhost:6379"
echo "   MongoDB:    localhost:27017 (user: admin, password: mongo_dev_password)"
echo ""
echo "💡 Tip: Run 'npm run db:stop' to stop all containers"
