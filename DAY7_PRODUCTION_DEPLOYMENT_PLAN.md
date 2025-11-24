# Day 7 Production Deployment Plan

**Date:** November 23, 2025  
**Phase:** 3 / Week 9  
**Status:** 🟡 In Progress  
**Estimated Duration:** 4 hours  
**Risk Level:** Medium (mitigated by gradual rollout)

---

## Objectives

1. ✅ Configure production MongoDB with authentication and replication
2. ✅ Set up comprehensive monitoring and alerting
3. ✅ Create production-ready environment configuration
4. ✅ Implement health checks and readiness probes
5. ✅ Execute gradual traffic migration (10% → 100%)
6. ✅ Create production runbook and troubleshooting guide
7. ✅ Validate performance and complete Phase 3

---

## Pre-Deployment Checklist

### Infrastructure Readiness

- ✅ Day 4: MongoDB setup complete
- ✅ Day 5: Data migration successful (3 conv, 8 msgs)
- ✅ Day 6: Read switcher tested (0%, 50%, 100%)
- ⏳ Production MongoDB cluster configured
- ⏳ Monitoring dashboards deployed
- ⏳ Alerting rules configured
- ⏳ Backup strategy validated

### Code Readiness

- ✅ Dual-write service operational
- ✅ Read switcher service tested
- ✅ Data migration service validated
- ⏳ Health check endpoints added
- ⏳ Production error handling enhanced
- ⏳ Connection pooling optimized

### Team Readiness

- ⏳ Deployment team briefed
- ⏳ Monitoring team trained
- ⏳ Rollback procedures reviewed
- ⏳ Stakeholder approval obtained

---

## Deployment Timeline

### Phase 1: Infrastructure Setup (60 minutes)

**Task 1.1: MongoDB Production Configuration (20 min)**

- Enable authentication
- Create admin user
- Create application user with limited permissions
- Configure replica set (3 nodes minimum)
- Enable TLS/SSL
- Set up automated backups

**Task 1.2: Monitoring Setup (20 min)**

- Deploy Prometheus exporters
- Configure MongoDB metrics
- Set up PostgreSQL metrics
- Create Grafana dashboards
- Configure log aggregation

**Task 1.3: Environment Configuration (20 min)**

- Create production .env template
- Configure connection strings
- Set up secrets management
- Validate environment variables
- Test connectivity

### Phase 2: Service Deployment (60 minutes)

**Task 2.1: Health Checks (15 min)**

- Implement database health endpoints
- Add service readiness indicators
- Configure liveness probes
- Set up automated recovery

**Task 2.2: Production Build (15 min)**

- Build Docker images
- Run security scans
- Push to container registry
- Tag releases

**Task 2.3: Deployment Execution (30 min)**

- Deploy to staging environment
- Run smoke tests
- Deploy to production
- Verify all services healthy

### Phase 3: Traffic Migration (90 minutes)

**Phase 3.1: 10% MongoDB (15 min)**

- Enable dual-read mode
- Set to 10% MongoDB
- Monitor for 10 minutes
- Verify metrics

**Phase 3.2: 25% MongoDB (15 min)**

- Increase to 25%
- Monitor for 10 minutes
- Check error rates

**Phase 3.3: 50% MongoDB (20 min)**

- Increase to 50%
- Disable dual-read (performance)
- Monitor for 15 minutes
- Validate latency

**Phase 3.4: 75% MongoDB (15 min)**

- Increase to 75%
- Monitor for 10 minutes
- Check throughput

**Phase 3.5: 90% MongoDB (15 min)**

- Increase to 90%
- Monitor for 10 minutes
- Final validation

**Phase 3.6: 100% MongoDB (10 min)**

- Complete cutover
- Monitor for 5 minutes
- Celebrate! 🎉

### Phase 4: Validation & Documentation (30 minutes)

**Task 4.1: Performance Testing (10 min)**

- Run load tests
- Measure latency (p50, p95, p99)
- Verify throughput
- Check resource utilization

**Task 4.2: Documentation (15 min)**

- Update runbook
- Document final configuration
- Create troubleshooting guide
- Write completion report

**Task 4.3: Handoff (5 min)**

- Brief operations team
- Share access credentials
- Provide monitoring links
- Schedule follow-up

---

## Monitoring Strategy

### Key Metrics

**Database Performance:**

- Query latency (p50, p95, p99)
- Queries per second
- Connection pool utilization
- Cache hit ratio
- Index efficiency

**Application Performance:**

- API response times
- Error rate
- Request throughput
- Service availability

**System Health:**

- CPU utilization
- Memory usage
- Disk I/O
- Network bandwidth

**Business Metrics:**

- Conversations created
- Messages sent
- Active users
- Data consistency rate

### Alert Thresholds

**Critical (PagerDuty):**

- Error rate > 5%
- Latency p95 > 500ms
- Service down > 1 minute
- Data inconsistency detected
- Disk usage > 90%

**Warning (Slack):**

- Error rate > 1%
- Latency p95 > 200ms
- Connection pool > 80%
- CPU > 80% for 5 minutes
- Memory > 85%

**Info (Email):**

- Deployment started/completed
- Traffic percentage changed
- Backup completed
- Certificate expiring in 30 days

---

## Rollback Strategy

### Immediate Rollback (< 30 seconds)

```bash
# Set read traffic back to PostgreSQL
npm run read-switch:set 0

# Verify status
npm run read-switch:status
```

**Triggers:**

- Error rate > 10%
- Data inconsistency detected
- Service unavailable
- Critical security issue

### Gradual Rollback (5 minutes)

```bash
# Reduce MongoDB percentage gradually
npm run read-switch:set 75  # From 100%
npm run read-switch:set 50  # Monitor
npm run read-switch:set 25  # Continue
npm run read-switch:set 0   # Complete
```

**Triggers:**

- Error rate 5-10%
- Latency degradation
- Customer complaints
- Unusual behavior detected

### Full System Rollback (15 minutes)

```bash
# Stop all services
npm run kill:all

# Revert to previous Docker images
docker-compose down
git checkout previous-stable-tag
docker-compose up -d

# Verify PostgreSQL primary
npm run read-switch:set 0
```

**Triggers:**

- Multiple services failing
- Data corruption detected
- Unrecoverable errors
- Major security breach

---

## Risk Mitigation

### Technical Risks

**Risk 1: MongoDB Performance Issues**

- **Probability:** Low
- **Impact:** High
- **Mitigation:** Gradual rollout, instant rollback capability
- **Contingency:** Keep PostgreSQL as backup for 7 days

**Risk 2: Data Inconsistency**

- **Probability:** Very Low
- **Impact:** Critical
- **Mitigation:** Dual-read verification, automated consistency checks
- **Contingency:** Pause migration, investigate, re-sync data

**Risk 3: Connection Pool Exhaustion**

- **Probability:** Low
- **Impact:** Medium
- **Mitigation:** Pre-configured limits (5-10 connections), monitoring
- **Contingency:** Increase pool size, implement connection queuing

**Risk 4: Network Latency**

- **Probability:** Low
- **Impact:** Medium
- **Mitigation:** Co-locate MongoDB near application servers
- **Contingency:** Enable read caching, optimize queries

### Operational Risks

**Risk 5: Human Error**

- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Automated scripts, peer review, dry runs
- **Contingency:** Rollback procedures, change management process

**Risk 6: Monitoring Gaps**

- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Comprehensive dashboards, multiple alert channels
- **Contingency:** Manual monitoring, log analysis

---

## Success Criteria

### Technical Metrics

- ✅ 100% traffic on MongoDB
- ✅ Error rate < 0.5%
- ✅ Latency p95 < 100ms (target: 50ms improvement)
- ✅ Data consistency 100%
- ✅ Zero downtime during migration

### Business Metrics

- ✅ No customer complaints
- ✅ All features functional
- ✅ Performance improved
- ✅ Cost reduction (MongoDB cheaper at scale)

### Operational Metrics

- ✅ Monitoring functional
- ✅ Alerting tested
- ✅ Team trained
- ✅ Documentation complete

---

## Production Configuration

### MongoDB Production Settings

```yaml
# docker-compose.prod.yml
mongodb:
  image: mongo:7.0
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
  command: >
    --replSet rs0
    --keyFile /etc/mongodb/keyfile
    --bind_ip_all
  volumes:
    - mongodb_data:/data/db
    - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
    - ./keyfile:/etc/mongodb/keyfile:ro
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '2'
        memory: 4G
      reservations:
        cpus: '1'
        memory: 2G
```

### Environment Variables

```bash
# Production .env
NODE_ENV=production

# MongoDB Production
MONGODB_URI=mongodb://chatbot_user:${MONGO_APP_PASSWORD}@mongodb-1:27017,mongodb-2:27017,mongodb-3:27017/chatbot?replicaSet=rs0&authSource=admin&ssl=true

# PostgreSQL Production
DATABASE_URL=postgresql://chatbot_user:${PG_PASSWORD}@postgres:5432/chatbot?sslmode=require

# Connection Pooling
MONGODB_POOL_MIN=5
MONGODB_POOL_MAX=20
PG_POOL_MIN=5
PG_POOL_MAX=20

# Monitoring
PROMETHEUS_ENDPOINT=/metrics
METRICS_ENABLED=true
LOG_LEVEL=info

# Feature Flags
MONGODB_READ_PERCENTAGE=0
DUAL_READ_ENABLED=false
```

---

## Health Check Implementation

### Database Health Endpoint

```typescript
// apps/chatbot-service/src/routes/health.ts
import express from 'express';
import { prisma } from '../services/prisma';
import { connectToMongoDB } from '../services/mongodb';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // PostgreSQL health
    await prisma.$queryRaw`SELECT 1`;
    health.services.postgresql = { status: 'up', latency: 0 };
  } catch (error) {
    health.status = 'degraded';
    health.services.postgresql = { status: 'down', error: error.message };
  }

  try {
    // MongoDB health
    const mongoose = await connectToMongoDB();
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;
    health.services.mongodb = { status: 'up', latency };
  } catch (error) {
    health.status = 'degraded';
    health.services.mongodb = { status: 'down', error: error.message };
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/ready', async (req, res) => {
  // Readiness check - service can handle traffic
  const ready = {
    ready: true,
    checks: {},
  };

  try {
    // Check database connections
    await prisma.$queryRaw`SELECT 1`;
    ready.checks.database = true;
  } catch {
    ready.ready = false;
    ready.checks.database = false;
  }

  res.status(ready.ready ? 200 : 503).json(ready);
});

export default router;
```

---

## Load Testing Plan

### Test Scenarios

**Scenario 1: Baseline Load**

- 100 concurrent users
- 1000 requests/minute
- Duration: 5 minutes
- Mix: 70% reads, 30% writes

**Scenario 2: Peak Load**

- 500 concurrent users
- 5000 requests/minute
- Duration: 10 minutes
- Mix: 80% reads, 20% writes

**Scenario 3: Stress Test**

- 1000 concurrent users
- 10000 requests/minute
- Duration: 5 minutes
- Mix: 90% reads, 10% writes

### k6 Test Script

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Steady
    { duration: '1m', target: 500 }, // Spike
    { duration: '5m', target: 500 }, // Peak
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% under 200ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  // Get conversations (read operation)
  const res = http.get('http://localhost:3001/api/conversations');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## Next Steps

1. **Now:** Implement production configurations
2. **+30 min:** Set up monitoring and alerts
3. **+60 min:** Deploy to production
4. **+90 min:** Begin traffic migration
5. **+180 min:** Complete cutover to 100% MongoDB
6. **+240 min:** Validate and document

**Estimated Completion:** 4 hours from start

---

## Team Communication Plan

### Stakeholder Updates

**Pre-Deployment (T-1 hour):**

- Email to all stakeholders
- Deployment window confirmed
- Contact information shared

**During Deployment (Every 30 minutes):**

- Slack updates in #deployments
- Current traffic percentage
- Key metrics snapshot

**Post-Deployment (T+1 hour):**

- Success notification
- Performance summary
- Next steps

### Escalation Path

**Level 1:** DevOps Engineer (immediate response)  
**Level 2:** Engineering Manager (15 minutes)  
**Level 3:** CTO (30 minutes)  
**Level 4:** CEO (1 hour)

---

**Status:** 🟡 Ready to Begin  
**Next Action:** Implement production MongoDB authentication

---
