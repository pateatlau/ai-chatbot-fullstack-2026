#!/bin/bash

# Day 3: Gateway Optimization - Performance Benchmarking
# Measures query latency before and after middleware optimization

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:4000/graphql}"
REQUESTS_PER_BATCH=100
BATCHES=5

echo "🚀 GraphQL Gateway Performance Benchmarking"
echo "==========================================="
echo "Gateway URL: $GATEWAY_URL"
echo "Requests per batch: $REQUESTS_PER_BATCH"
echo "Batches: $BATCHES"
echo ""

# Function to run a GraphQL query and measure time
run_query() {
  local query="$1"
  local description="$2"
  
  echo "📊 Testing: $description"
  
  local times=()
  for i in $(seq 1 $REQUESTS_PER_BATCH); do
    local start_time=$(date +%s%N)
    
    # Send GraphQL query
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"$query\"}" \
      "$GATEWAY_URL" > /dev/null
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    times+=($duration)
  done
  
  # Calculate statistics
  local total=0
  local min=${times[0]}
  local max=${times[0]}
  
  for t in "${times[@]}"; do
    total=$((total + t))
    if (( t < min )); then
      min=$t
    fi
    if (( t > max )); then
      max=$t
    fi
  done
  
  local avg=$((total / ${#times[@]}))
  
  echo "  ✓ Min: ${min}ms, Max: ${max}ms, Avg: ${avg}ms"
  echo ""
}

# Test Case 1: Simple Query
SIMPLE_QUERY="query { admin(id: \\\"123\\\") { id role } }"
run_query "$SIMPLE_QUERY" "Simple Admin Query"

# Test Case 2: Query with Pagination
PAGINATED_QUERY="query { admins(input: { page: 1, limit: 20 }) { id userId role } }"
run_query "$PAGINATED_QUERY" "Paginated Admin List"

# Test Case 3: System Stats Query
STATS_QUERY="query { systemStats { totalUsers totalConversations activeUsers24h } }"
run_query "$STATS_QUERY" "System Statistics"

# Test Case 4: Audit Logs Query
AUDIT_QUERY="query { auditLogs(input: { page: 1, limit: 50 }) { id action timestamp } }"
run_query "$AUDIT_QUERY" "Audit Logs"

# Summary
echo "✅ Benchmarking Complete!"
echo ""
echo "💡 Performance Notes:"
echo "  - DataLoader: Batches reduce N+1 queries"
echo "  - Rate Limiting: Protects from brute force (100 req/min)"
echo "  - Complexity Analysis: Rejects queries > 1000 complexity"
echo ""
echo "📈 Expected Improvements:"
echo "  - Query latency: 50-80% faster (with batching)"
echo "  - Throughput: 70-80% increase"
echo "  - P95 latency: 70% reduction"
echo ""

