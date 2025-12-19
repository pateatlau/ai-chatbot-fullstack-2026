# k6 Load Testing Suite

Comprehensive load testing scenarios for the AI Chatbot application using k6.

## Prerequisites

```bash
# Install k6
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

## Test Scenarios

### 1. Load Test (`load-test.js`)

**Purpose:** Simulate normal to high load with realistic user behavior

**Profile:**

- Duration: ~15 minutes
- Users: Ramps from 0 → 50 → 100 → 200 (spike) → 50 → 0
- Scenarios:
  - 30% new user registration + chat
  - 50% existing user login + chat
  - 10% profile management
  - 10% browsing conversations

**Run:**

```bash
k6 run k6/load-test.js
k6 run k6/load-test.js --env BASE_URL=https://your-domain.com
```

**Thresholds:**

- 95% of requests < 500ms
- Error rate < 1%
- Request failure rate < 1%

### 2. Stress Test (`stress-test.js`)

**Purpose:** Find system breaking point and recovery behavior

**Profile:**

- Duration: ~29 minutes
- Users: Ramps from 0 → 100 → 300 → 500 → 1000 → 1500 (peak) → 100 → 0
- Simple health check hammering

**Run:**

```bash
k6 run k6/stress-test.js
```

**Thresholds:**

- 95% of requests < 2s (degraded performance acceptable)
- Error rate < 5%
- Request failure rate < 5%

**What to observe:**

- At what point does the system start degrading?
- Does it recover when load decreases?
- Are there any crashes or cascading failures?

### 3. Spike Test (`spike-test.js`)

**Purpose:** Test system response to sudden traffic surge

**Profile:**

- Duration: ~7 minutes
- Users: 50 → **1000 (in 10 seconds!)** → stay → 50
- Simulates viral post, email campaign, or marketing event

**Run:**

```bash
k6 run k6/spike-test.js
```

**Thresholds:**

- 95% of requests < 3s
- Request failure rate < 10% (acceptable during spike)

**What to observe:**

- Does the system handle the sudden surge?
- How quickly does it scale (if using auto-scaling)?
- Are there any timeout errors or connection refusals?

### 4. Soak Test (`soak-test.js`)

**Purpose:** Detect memory leaks and performance degradation over time

**Profile:**

- Duration: ~4 hours
- Users: Constant 100 users
- Realistic user behavior with delays

**Run:**

```bash
k6 run k6/soak-test.js
```

**Thresholds:**

- 95% of requests < 800ms
- Request failure rate < 1%

**What to observe:**

- Memory usage over time (should be stable)
- Response times over time (should not degrade)
- Database connection pool behavior
- File handle leaks

## Interpreting Results

### Key Metrics

**Request Duration:**

```
http_req_duration..............: avg=125ms  min=50ms   med=100ms  max=500ms  p(90)=200ms p(95)=300ms
```

- `avg`: Average response time
- `p(95)`: 95th percentile (95% of requests faster than this)
- `max`: Slowest request

**Error Rate:**

```
errors.........................: 0.5%
http_req_failed................: 0.3%
```

- Should be < 1% for normal operations
- < 5% acceptable under stress

**Throughput:**

```
http_reqs......................: 50000  250/s
```

- Total requests and requests per second

### Health Indicators

✅ **Healthy System:**

- p(95) < 500ms
- Error rate < 1%
- Consistent performance across test duration

⚠️ **Warning Signs:**

- p(95) > 1s
- Error rate 1-5%
- Increasing response times during soak test
- Memory usage growing over time

❌ **Critical Issues:**

- p(95) > 3s
- Error rate > 5%
- Service crashes or restarts
- Database connection errors

## Example Output

```
     ✓ registration status is 201
     ✓ login status is 200
     ✓ create conversation status is 201
     ✓ send message status is 201

     checks.........................: 98.5%  ✓ 49250  ✗ 750
     data_received..................: 125 MB 8.3 MB/s
     data_sent......................: 25 MB  1.7 MB/s
     http_req_duration..............: avg=150ms min=50ms med=120ms max=800ms p(90)=250ms p(95)=350ms
     http_reqs......................: 50000  3333/s
     successful_logins..............: 8750
     failed_logins..................: 125
     errors.........................: 1.5%
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Run Load Tests
  run: |
    k6 run k6/load-test.js \
      --env BASE_URL=https://staging.your-domain.com \
      --out json=results.json

- name: Check Thresholds
  run: |
    # Fail if error rate > 2%
    ERROR_RATE=$(jq '.metrics.errors.rate' results.json)
    if (( $(echo "$ERROR_RATE > 0.02" | bc -l) )); then
      echo "Error rate too high: $ERROR_RATE"
      exit 1
    fi
```

## Cloud Load Testing

For distributed load testing from multiple regions:

```bash
# k6 Cloud (paid service)
k6 login cloud
k6 cloud k6/load-test.js

# Or use k6 operator on Kubernetes
kubectl apply -f k6-operator.yaml
```

## Monitoring During Tests

**Watch system metrics:**

```bash
# Docker stats
docker stats

# Server metrics (if SSH access)
ssh user@server 'htop'

# Database connections
docker-compose exec postgres psql -U myapp -c "SELECT count(*) FROM pg_stat_activity;"

# Redis info
docker-compose exec redis redis-cli INFO
```

## Optimization Tips

If tests reveal performance issues:

1. **Database:**
   - Add indexes on frequently queried columns
   - Optimize N+1 queries
   - Use connection pooling (already configured)

2. **API:**
   - Add caching for read-heavy endpoints
   - Implement rate limiting
   - Use compression (gzip already enabled)

3. **Infrastructure:**
   - Scale horizontally (more containers)
   - Increase container resources
   - Add load balancer
   - Use CDN for static assets

4. **Code:**
   - Profile slow endpoints
   - Optimize database queries
   - Reduce payload sizes
   - Implement pagination

## Next Steps

After load testing:

1. Document performance baseline
2. Set up continuous performance monitoring
3. Create performance budgets
4. Implement alerting for degradation
5. Schedule regular load tests (weekly/monthly)
