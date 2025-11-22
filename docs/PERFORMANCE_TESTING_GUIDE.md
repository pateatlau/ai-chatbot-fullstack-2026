# Performance Testing & Benchmarking Guide

**Date:** November 23, 2025  
**Version:** 1.0  
**Status:** ✅ Complete - Ready for execution

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Suite Details](#test-suite-details)
4. [Running Tests](#running-tests)
5. [Analyzing Results](#analyzing-results)
6. [Expected Baseline Results](#expected-baseline-results)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Overview

This performance testing suite provides comprehensive benchmarking of GraphQL vs REST APIs to validate the implementation plan's performance claims.

### What We're Testing

| Scenario              | GraphQL | REST    | Metric                               |
| --------------------- | ------- | ------- | ------------------------------------ |
| **Admin Dashboard**   | 1 query | 7 calls | Response time, bandwidth, error rate |
| **User Profile**      | 1 query | 3 calls | Response time, bandwidth, error rate |
| **Conversation List** | 1 query | 2 calls | Response time, bandwidth, error rate |

### Key Metrics

- **Response Time (p95, p99)** - How fast requests complete under load
- **Error Rate** - Percentage of failed requests
- **Throughput** - Requests per second
- **Bandwidth** - Data transferred per request
- **Improvement** - Percentage faster/smaller for GraphQL

### Expected Outcomes

Based on the implementation plan:

- GraphQL should be **40-60% faster** for complex queries
- GraphQL should use **35-67% less bandwidth**
- GraphQL should reduce API calls by **50-86%**
- Error rates should remain < 1% for both

---

## Quick Start

### Prerequisites

1. **k6 installed** (required)

   ```bash
   # macOS
   brew install k6

   # Linux
   sudo apt-get install k6

   # Ubuntu/Debian
   sudo add-apt-repository ppa:k6/stable
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Backend services running**

   ```bash
   # Terminal 1: Start auth service (REST endpoint)
   npm run dev:auth

   # Terminal 2: Start GraphQL gateway
   npm run dev:gateway

   # Terminal 3: Start chatbot service (optional, for more realistic load)
   npm run dev:chatbot
   ```

3. **Docker services running**
   ```bash
   # PostgreSQL and Redis
   docker-compose up -d postgres redis
   ```

### Run Benchmark

```bash
# Make script executable
chmod +x k6/run-performance-tests.sh

# Run default benchmark (GraphQL vs REST comparison)
./k6/run-performance-tests.sh benchmark

# Or use npm script
npm run test:perf:benchmark
```

---

## Test Suite Details

### 1. GraphQL Benchmark Test (`graphql-benchmark.js`)

**Purpose:** Directly compare GraphQL vs REST performance

**Scenarios:**

1. **Admin Dashboard (40% of test)**
   - GraphQL: Single query fetching system stats + top users + current user
   - REST: 7 separate API calls
   - Expected: GraphQL 50% faster

2. **User Profile (35% of test)**
   - GraphQL: Single query with user data, conversations, analytics
   - REST: 3 separate API calls
   - Expected: GraphQL 40% faster

3. **Conversation List (25% of test)**
   - GraphQL: Single query with nested messages
   - REST: 2 separate API calls
   - Expected: GraphQL 25-30% faster

**Load Profile:**

```
0-30s:     Ramp up to 10 VUs (virtual users)
30s-2.5m:  Sustain 20 VUs
Total:     3 minutes
```

**Metrics Collected:**

- `graphql_response_time` (ms) - Response time per request
- `graphql_errors` (rate) - Error rate
- `graphql_bandwidth` (B) - Response size
- `graphql_requests` (count) - Total requests
- `rest_response_time` (ms) - REST response time
- `rest_errors` (rate) - REST error rate
- `rest_bandwidth` (B) - REST response size
- `rest_requests` (count) - Total REST requests

### 2. Load Test (`load-test.js`) - Baseline

**Purpose:** Establish performance baseline for existing REST API

**Load Profile:**

```
0-2m:      Ramp up to 50 VUs
2-7m:      Sustain 100 VUs
7-9m:      Spike to 200 VUs
9-12m:     Sustain 200 VUs
12-14m:    Ramp down to 50 VUs
14-15m:    Cool down to 0 VUs
```

**What It Tests:**

- User registration
- User login
- Conversation creation
- Message sending
- Conversation listing
- Profile retrieval

### 3. Spike Test (`spike-test.js`)

**Purpose:** Test system behavior under sudden traffic spikes

**Scenarios:**

- Sudden 10x load increase
- Recovery time measurement
- Error handling

### 4. Soak Test (`soak-test.js`)

**Purpose:** Test system stability under sustained load

**Duration:** 30 minutes (long-running)

**What It Validates:**

- Memory leaks
- Database connection pool issues
- Cache effectiveness
- Long-running stability

---

## Running Tests

### Basic Commands

```bash
# Run default benchmark
./k6/run-performance-tests.sh

# Run specific test
./k6/run-performance-tests.sh benchmark  # GraphQL vs REST
./k6/run-performance-tests.sh load       # Baseline load test
./k6/run-performance-tests.sh spike      # Spike test
./k6/run-performance-tests.sh soak       # 30-minute soak test
./k6/run-performance-tests.sh all        # All tests sequentially

# With custom URLs
GRAPHQL_URL=http://staging.example.com/graphql \
REST_URL=http://staging.example.com/api \
./k6/run-performance-tests.sh benchmark

# With custom output directory
REPORT_DIR=./perf-reports ./k6/run-performance-tests.sh benchmark
```

### npm Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:perf": "./k6/run-performance-tests.sh benchmark",
    "test:perf:benchmark": "./k6/run-performance-tests.sh benchmark",
    "test:perf:load": "./k6/run-performance-tests.sh load",
    "test:perf:spike": "./k6/run-performance-tests.sh spike",
    "test:perf:soak": "./k6/run-performance-tests.sh soak",
    "test:perf:all": "./k6/run-performance-tests.sh all"
  }
}
```

### Direct k6 Commands

```bash
# Run with custom VUs and duration
k6 run k6/graphql-benchmark.js -e GRAPHQL_URL=http://localhost:4000/graphql

# Run with custom thresholds
k6 run k6/graphql-benchmark.js --duration=5m --vus=50

# Run and output to multiple formats
k6 run k6/graphql-benchmark.js \
  --out json=results.json \
  --out csv=results.csv \
  --out influxdb=influxdb://localhost:8086/mydb
```

---

## Analyzing Results

### Report Outputs

After running tests, you'll find:

```
k6/reports/
├── benchmark_20251123_143022.json          # Raw metrics data
├── benchmark_20251123_143022.log           # Test output log
├── report_20251123_143022.html             # Interactive HTML report
└── [load|spike|soak]_*.{json,log}          # Other test results
```

### HTML Report

The HTML report includes:

- ✅ Side-by-side performance comparison
- ✅ Interactive charts (if running with browser)
- ✅ Key findings and recommendations
- ✅ Scenario-by-scenario breakdown
- ✅ Next steps for optimization

### JSON Data Analysis

Extract metrics from JSON reports:

```bash
# Extract GraphQL p95 response time
jq '.metrics.graphql_response_time.values.p95' k6/reports/benchmark_*.json

# Extract error rates
jq '.metrics | {
  graphql_error_rate: .graphql_errors.value,
  rest_error_rate: .rest_errors.value
}' k6/reports/benchmark_*.json

# Calculate improvement percentage
python3 << 'EOF'
import json

with open('k6/reports/benchmark_latest.json') as f:
    data = json.load(f)

graphql_p95 = data['metrics']['graphql_response_time']['values']['p95']
rest_p95 = data['metrics']['rest_response_time']['values']['p95']
improvement = (rest_p95 - graphql_p95) / rest_p95 * 100

print(f"GraphQL: {graphql_p95:.0f}ms")
print(f"REST: {rest_p95:.0f}ms")
print(f"Improvement: {improvement:.1f}%")
EOF
```

### Quick Analysis Script

```bash
# View latest benchmark results
ls -lrt k6/reports/benchmark_*.json | tail -1 | \
  awk '{print $NF}' | xargs -I {} bash -c 'echo "Latest Report: {}"; jq ".metrics | {
    graphql_response_time: (.graphql_response_time.values | {p95, p99}),
    rest_response_time: (.rest_response_time.values | {p95, p99}),
    graphql_errors: (.graphql_errors.value * 100 | "\(.)%"),
    rest_errors: (.rest_errors.value * 100 | "\(.)%")
  }" {}'
```

---

## Expected Baseline Results

### Benchmark Results (Hypothesis)

Based on implementation plan projections:

**Admin Dashboard (7 REST calls → 1 GraphQL query)**

| Metric              | GraphQL | REST    | Improvement  |
| ------------------- | ------- | ------- | ------------ |
| Response Time (p95) | 185ms   | 378ms   | 51% faster ✓ |
| Response Time (p99) | 215ms   | 445ms   | 52% faster ✓ |
| Bandwidth           | 8.5 KB  | 14.2 KB | 40% less ✓   |
| Error Rate          | 0.8%    | 1.2%    | Better ✓     |

**User Profile (3 REST calls → 1 GraphQL query)**

| Metric              | GraphQL | REST   | Improvement  |
| ------------------- | ------- | ------ | ------------ |
| Response Time (p95) | 89ms    | 156ms  | 43% faster ✓ |
| Response Time (p99) | 105ms   | 182ms  | 42% faster ✓ |
| Bandwidth           | 3.2 KB  | 5.8 KB | 45% less ✓   |
| Error Rate          | 0.7%    | 1.0%   | Better ✓     |

**Conversation List (2 REST calls → 1 GraphQL query)**

| Metric              | GraphQL | REST   | Improvement  |
| ------------------- | ------- | ------ | ------------ |
| Response Time (p95) | 142ms   | 198ms  | 28% faster ✓ |
| Response Time (p99) | 165ms   | 225ms  | 27% faster ✓ |
| Bandwidth           | 4.5 KB  | 7.2 KB | 38% less ✓   |
| Error Rate          | 0.8%    | 1.1%   | Better ✓     |

### Thresholds for Success

```javascript
thresholds: {
  'graphql_response_time': ['p(95)<300'],    // 95% of GraphQL < 300ms
  'graphql_errors': ['rate<0.01'],           // < 1% error rate
  'rest_response_time': ['p(95)<400'],       // 95% of REST < 400ms
  'rest_errors': ['rate<0.01'],              // < 1% error rate
}
```

---

## Troubleshooting

### Common Issues

#### "k6 command not found"

```bash
# Install k6
brew install k6  # macOS
# or
sudo apt-get install k6  # Linux

# Verify installation
k6 version
```

#### "Connection refused" errors

```bash
# Check if services are running
lsof -i :4000  # GraphQL Gateway
lsof -i :3000  # Auth Service

# Start services
npm run dev:gateway
npm run dev:auth

# If ports are in use
npm run kill:all
npm run dev:backend
```

#### Tests timeout or fail

```bash
# Check network connectivity
curl http://localhost:4000/graphql
curl http://localhost:3000/api/auth/profile

# Check logs
tail -f logs/auth-service.log
tail -f logs/graphql-gateway.log

# Run with verbose output
k6 run k6/graphql-benchmark.js -v
```

#### Inconsistent results

- **Solution:** Run multiple times to average results
- **Cause:** System load, network variance, cache warmup
- **Mitigation:**
  - Close other applications
  - Run during off-peak times
  - Increase test duration for stability
  - Run 3 times and average results

### Validate Setup

```bash
#!/bin/bash
# Quick validation script

echo "Checking prerequisites..."

# Check k6
if command -v k6 &> /dev/null; then
  echo "✓ k6 installed: $(k6 version)"
else
  echo "✗ k6 not found - install with: brew install k6"
  exit 1
fi

# Check GraphQL endpoint
echo "Testing GraphQL endpoint..."
if curl -s http://localhost:4000/.well-known/apollo/server-health > /dev/null 2>&1; then
  echo "✓ GraphQL Gateway responding"
else
  echo "✗ GraphQL Gateway not responding"
  echo "  Start with: npm run dev:gateway"
fi

# Check REST endpoint
echo "Testing REST endpoint..."
if curl -s http://localhost:3000/api/auth/health > /dev/null 2>&1; then
  echo "✓ Auth Service responding"
else
  echo "✗ Auth Service not responding"
  echo "  Start with: npm run dev:auth"
fi

echo ""
echo "Setup validation complete!"
```

---

## Next Steps

### Immediate Actions

1. **Install k6**

   ```bash
   brew install k6
   ```

2. **Start backend services**

   ```bash
   # Terminal 1
   npm run dev:auth

   # Terminal 2
   npm run dev:gateway
   ```

3. **Run benchmark**

   ```bash
   ./k6/run-performance-tests.sh benchmark
   ```

4. **Review results**
   - Check `k6/reports/` for HTML report
   - Verify GraphQL is faster than REST
   - Identify any performance issues

### Follow-up Tasks (Phase 6 Continued)

1. **Monitor Production Metrics**
   - Set up Apollo Studio
   - Track query performance
   - Alert on anomalies

2. **Optimize Queries**
   - Identify slow queries
   - Add caching where appropriate
   - Implement DataLoader batching

3. **Document Findings**
   - Create team-accessible report
   - Share performance recommendations
   - Update deployment guides

4. **Set Baselines**
   - Establish performance SLOs
   - Create alerting rules
   - Monitor trends over time

### Long-term Monitoring

```bash
# Schedule weekly benchmarks
0 2 * * 1 /path/to/project/k6/run-performance-tests.sh benchmark >> /var/log/perf-bench.log
```

### Team Communication

Share results with stakeholders:

- ✅ Executive: "GraphQL is 51% faster for admin features"
- ✅ Product: "Reduces mobile bandwidth by 35-67%"
- ✅ DevOps: "No infrastructure cost increase needed"
- ✅ QA: "Both REST and GraphQL remain stable"

---

## Reference

### k6 Documentation

- [k6 Official Docs](https://k6.io/docs/)
- [k6 API Reference](https://k6.io/docs/k6-api/)
- [Custom Metrics](https://k6.io/docs/k6-api/metrics/)

### GraphQL Performance Best Practices

- [Apollo Performance Best Practices](https://www.apollographql.com/docs/apollo-server/performance/)
- [GraphQL Query Optimization](https://www.apollographql.com/docs/graph-manager/query-performance/)
- [DataLoader for Batching](https://github.com/graphql/dataloader)

### Related Files

- `k6/graphql-benchmark.js` - Main benchmark script
- `k6/load-test.js` - Baseline load testing
- `k6/spike-test.js` - Spike testing
- `k6/soak-test.js` - Soak testing
- `k6/run-performance-tests.sh` - Test runner script

---

## Summary

This performance testing suite provides:

✅ **Comprehensive benchmarking** of GraphQL vs REST  
✅ **Automated test execution** with bash scripts  
✅ **Multiple test types** (benchmark, load, spike, soak)  
✅ **Detailed reporting** with HTML output  
✅ **Easy integration** with CI/CD pipelines  
✅ **Troubleshooting guidance** for common issues

**Ready to proceed?** Run `./k6/run-performance-tests.sh benchmark` to start testing!
