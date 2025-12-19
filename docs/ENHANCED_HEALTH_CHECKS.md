# Enhanced Health Checks Documentation

## Overview

All backend services now include comprehensive health checks that monitor dependency status, response times, memory usage, and service uptime. This provides better observability and helps quickly identify issues in production.

## Health Check Response Format

### Healthy Status Example

```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-11-17T04:19:47.628Z",
  "uptime": 1187.79,
  "dependencies": {
    "database": {
      "status": "up",
      "responseTime": 83
    },
    "redis": {
      "status": "up",
      "responseTime": 1
    }
  },
  "memory": {
    "heapUsed": "15MB",
    "heapTotal": "17MB",
    "rss": "52MB"
  }
}
```

### Degraded Status Example

```json
{
  "status": "degraded",
  "service": "auth-service",
  "timestamp": "2025-11-17T04:19:47.628Z",
  "uptime": 1187.79,
  "dependencies": {
    "database": {
      "status": "down",
      "error": "Connection timeout"
    },
    "redis": {
      "status": "up",
      "responseTime": 1
    }
  },
  "memory": {
    "heapUsed": "15MB",
    "heapTotal": "17MB",
    "rss": "52MB"
  }
}
```

## Service-Specific Health Checks

### Auth Service (Port 3000)

**Endpoint:** `GET /health`

**Checks:**

- ✅ Database connectivity (Prisma)
- ✅ Redis connectivity
- ✅ Memory usage
- ✅ Service uptime

**Response Time:** < 100ms typical

**Example:**

```bash
curl http://localhost:3000/health
```

---

### Chatbot Service (Port 3001)

**Endpoint:** `GET /health`

**Checks:**

- ✅ Database connectivity (Prisma)
- ✅ Redis connectivity
- ✅ OpenAI API status (when not in mock mode)
- ✅ Memory usage
- ✅ Service uptime
- ✅ Mock mode configuration

**Response Time:** < 150ms typical (< 100ms in mock mode)

**Special Features:**

- Detects mock AI mode via `USE_MOCK_AI` environment variable
- OpenAI check skipped when using mock mode
- Shows configuration status in response

**Example:**

```bash
curl http://localhost:3001/health
```

**Mock Mode Response:**

```json
{
  "status": "healthy",
  "service": "chatbot-service",
  "dependencies": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "openai": {
      "status": "mock",
      "message": "Using mock AI responses"
    }
  },
  "config": {
    "useMockAI": true
  }
}
```

---

### Admin Service (Port 3002)

**Endpoint:** `GET /health`

**Checks:**

- ✅ Database connectivity (Prisma)
- ✅ Memory usage
- ✅ Service uptime

**Response Time:** < 100ms typical

**Example:**

```bash
curl http://localhost:3002/health
```

---

## HTTP Status Codes

| Status Code | Service Status | Description                       |
| ----------- | -------------- | --------------------------------- |
| 200         | healthy        | All dependencies are operational  |
| 503         | degraded       | One or more dependencies are down |

## Monitoring Integration

### Uptime Monitoring

Services can be monitored using the health endpoints with tools like:

- **Pingdom** - HTTP monitoring with alerting
- **UptimeRobot** - Free tier available
- **Datadog** - Full observability platform
- **New Relic** - APM with health checks

### Example Health Check Script

```bash
#!/bin/bash
# health-check-all.sh

services=(
  "auth-service:3000"
  "chatbot-service:3001"
  "admin-service:3002"
)

for service in "${services[@]}"; do
  name="${service%%:*}"
  port="${service##*:}"

  echo "Checking $name..."
  response=$(curl -s -w "%{http_code}" http://localhost:$port/health)
  http_code="${response: -3}"
  body="${response:0:${#response}-3}"

  if [ "$http_code" -eq 200 ]; then
    echo "✅ $name is healthy"
  else
    echo "❌ $name is degraded (HTTP $http_code)"
    echo "$body" | jq .
  fi
  echo
done
```

### Docker Compose Health Checks

```yaml
services:
  auth-service:
    image: auth-service:latest
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  chatbot-service:
    image: chatbot-service:latest
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3001/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  admin-service:
    image: admin-service:latest
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3002/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes Liveness/Readiness Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: auth-service
spec:
  containers:
    - name: auth-service
      image: auth-service:latest
      ports:
        - containerPort: 3000
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3
      readinessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 10
        periodSeconds: 5
        timeoutSeconds: 3
        failureThreshold: 2
```

## Dependency Status Details

### Database Check

- Uses `prisma.$queryRaw` to execute `SELECT 1`
- Measures response time in milliseconds
- Catches connection errors, timeout errors, and invalid credentials
- **Degraded:** Service continues but database operations will fail

### Redis Check

- Uses `redis.ping()` command
- Measures response time in milliseconds
- Catches connection errors and authentication failures
- **Degraded:** Service continues but caching/session operations will fail

### OpenAI Check (Chatbot Service Only)

- Uses `openai.models.list()` API call
- Only runs when `USE_MOCK_AI !== 'true'`
- Measures response time in milliseconds
- Catches API key errors, rate limit errors, and network failures
- **Degraded:** Service continues using mock responses if available

## Memory Metrics

The health checks include Node.js memory usage:

- **heapUsed**: Memory currently used by JavaScript objects
- **heapTotal**: Total heap size allocated
- **rss**: Resident Set Size (total memory allocated for the process)

**Typical Values:**

- Auth Service: 50-60 MB
- Chatbot Service: 50-70 MB
- Admin Service: 60-80 MB

**Alert Thresholds:**

- Warning: > 200 MB
- Critical: > 500 MB

## Configuration

### Environment Variables

Each service requires these variables for health checks:

**All Services:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

**Auth & Chatbot Services:**

```bash
REDIS_URL="redis://localhost:6379"
```

**Chatbot Service (Optional):**

```bash
USE_MOCK_AI=true  # Skip OpenAI checks
OPENAI_API_KEY=sk-xxx  # Required if USE_MOCK_AI=false
```

### Dotenv Path Resolution

All services use smart path resolution to find .env files:

1. `src/../../.env` (from source)
2. `dist/../../../apps/service-name/.env` (from build)
3. `dist/../../../.env` (workspace root)
4. `process.cwd()/apps/service-name/.env`
5. `process.cwd()/.env`

The first successful path is used.

## Troubleshooting

### Service Shows "degraded" Status

1. Check which dependency is down:

   ```bash
   curl http://localhost:3000/health | jq .dependencies
   ```

2. Verify dependency services are running:

   ```bash
   # PostgreSQL
   psql -U myapp -d myapp_dev -c "SELECT 1"

   # Redis
   redis-cli ping

   # OpenAI (if applicable)
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. Check environment variables:
   ```bash
   # In the service directory
   cat apps/auth-service/.env | grep DATABASE_URL
   cat apps/auth-service/.env | grep REDIS_URL
   ```

### High Memory Usage

If memory exceeds normal thresholds:

1. Check for memory leaks:

   ```bash
   curl http://localhost:3000/health | jq .memory
   ```

2. Monitor over time:

   ```bash
   watch -n 5 'curl -s http://localhost:3000/health | jq .memory'
   ```

3. Restart service if RSS > 500 MB

### Slow Response Times

If `responseTime` > 1000ms:

1. Check database slow queries:

   ```sql
   SELECT * FROM pg_stat_statements
   ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. Check Redis latency:

   ```bash
   redis-cli --latency
   ```

3. Check network connectivity:
   ```bash
   ping -c 5 localhost
   ```

## Testing

### Manual Testing

```bash
# Test all services
./scripts/health-check-all.sh

# Test individual service
curl -v http://localhost:3000/health | jq .

# Test with downtime simulation
docker stop postgres
curl http://localhost:3000/health
# Should return 503 with degraded status
docker start postgres
```

### Automated Testing

```javascript
// health-check.test.js
describe('Health Checks', () => {
  it('should return healthy status when all deps are up', async () => {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.dependencies.database.status).toBe('up');
    expect(data.dependencies.redis.status).toBe('up');
  });

  it('should return degraded status when database is down', async () => {
    // Stop database
    await docker.stopContainer('postgres');

    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
    expect(data.dependencies.database.status).toBe('down');

    // Restore database
    await docker.startContainer('postgres');
  });
});
```

## Performance Impact

Health check overhead is minimal:

| Check Type | Typical Time | Max Concurrent |
| ---------- | ------------ | -------------- |
| Database   | 20-50ms      | 100/second     |
| Redis      | 1-5ms        | 1000/second    |
| OpenAI     | 100-500ms    | 10/second      |
| Memory     | <1ms         | Unlimited      |

**Recommendations:**

- Poll health endpoints every 30-60 seconds
- Use exponential backoff on failures
- Cache results for 5-10 seconds for high-traffic scenarios

## Future Enhancements

Potential improvements for Phase 5:

1. **Metrics Endpoint** - Prometheus-compatible metrics
2. **Custom Checks** - Plugin architecture for app-specific checks
3. **Historical Data** - Track uptime percentages
4. **Alerting** - Built-in webhook notifications
5. **Dashboard** - Real-time health visualization
6. **Tracing** - Distributed tracing integration

---

**Last Updated:** 2025-11-17  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
