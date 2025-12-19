#!/bin/bash

# Database Container Status Script
# Shows status of PostgreSQL, Redis, and MongoDB containers

cd "$(dirname "$0")/.."

echo "📊 Database Container Status"
echo "============================"
echo ""

# Check each container
check_container() {
  local name=$1
  local port=$2
  
  if docker ps | grep -q "$name"; then
    echo "✅ $name (port $port) - RUNNING"
  elif docker ps -a | grep -q "$name"; then
    echo "⛔ $name (port $port) - STOPPED"
  else
    echo "❌ $name (port $port) - NOT FOUND"
  fi
}

check_container "myapp-postgres" "5432"
check_container "myapp-redis" "6379"
check_container "mongodb-dev" "27017"

echo ""
echo "📍 Connection Details:"
echo "   PostgreSQL: localhost:5432"
echo "   Redis:      localhost:6379"
echo "   MongoDB:    localhost:27017"
echo ""

if docker ps | grep -q "postgres\|redis\|mongodb"; then
  echo "✨ All databases ready for development!"
else
  echo "⚠️  Some or all databases are not running."
  echo "   Run: npm run db:start"
fi
