# Production Runbook - AI Chatbot MongoDB Migration

# Day 7 Operations Guide

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Status:** 🔴 LIVE DEPLOYMENT  
**On-Call Team:** DevOps + Backend Engineers

---

## Quick Reference

### Emergency Contacts

| Role                | Name   | Contact       | Escalation Time |
| ------------------- | ------ | ------------- | --------------- |
| DevOps Lead         | [Name] | [Phone/Slack] | Immediate       |
| Backend Lead        | [Name] | [Phone/Slack] | 15 minutes      |
| Engineering Manager | [Name] | [Phone/Slack] | 30 minutes      |
| CTO                 | [Name] | [Phone/Slack] | 1 hour          |

### Critical Commands

```bash
# EMERGENCY ROLLBACK (< 30 seconds)
npm run read-switch:set 0

# Check current status
npm run read-switch:status

# View service health
curl http://localhost:3001/health

# View logs
docker logs chatbot-chatbot-service -f --tail=100

# Restart service
docker-compose restart chatbot-service
```

---

## Deployment Timeline

### Pre-Deployment (T-60 minutes)

**Checklist:**

- [ ] All tests passing
- [ ] Staging environment validated
- [ ] Team briefed and on standby
- [ ] Monitoring dashboards open
- [ ] Rollback procedures reviewed
- [ ] Stakeholders notified

**Commands:**

```bash
# Verify environment
docker-compose -f docker-compose.prod.yml config

# Check service health
docker-compose ps

# Verify MongoDB authentication
npm run test:mongodb-auth

# Verify PostgreSQL connection
npm run test:postgres
```

### Deployment (T-0)

**Step 1: Deploy Production Configuration**

```bash
# Stop existing services
docker-compose down

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start with production config
docker-compose -f docker-compose.prod.yml up -d

# Verify all services healthy
docker-compose ps
npm run health:check
```

**Expected Output:**

```
SERVICE                 STATUS    HEALTH
mongodb                 Up        healthy
postgres                Up        healthy
redis                   Up        healthy
chatbot-service         Up        healthy
auth-service            Up        healthy
admin-service           Up        healthy
```

### Traffic Migration (T+15 minutes)

**Phase 1: 10% MongoDB (15 minutes)**

```bash
# Enable dual-read for verification
npm run read-switch:dual-read on

# Set 10% MongoDB traffic
npm run read-switch:set 10

# Monitor for 10 minutes
watch -n 30 'npm run read-switch:status'
```

**Watch For:**

- Error rate < 0.5%
- Latency increase < 10%
- No dual-read mismatches
- Both databases healthy

**Go/No-Go Decision:**
✅ **GO:** All metrics normal → Proceed to Phase 2  
🛑 **NO-GO:** Any issues → Rollback and investigate

**Phase 2: 25% MongoDB (15 minutes)**

```bash
npm run read-switch:set 25
# Monitor for 10 minutes
```

**Phase 3: 50% MongoDB (20 minutes)**

```bash
npm run read-switch:set 50

# Disable dual-read for performance
npm run read-switch:dual-read off

# Monitor for 15 minutes
```

**Phase 4: 75% MongoDB (15 minutes)**

```bash
npm run read-switch:set 75
# Monitor for 10 minutes
```

**Phase 5: 90% MongoDB (15 minutes)**

```bash
npm run read-switch:set 90
# Monitor for 10 minutes
```

**Phase 6: 100% MongoDB - Full Cutover (10 minutes)**

```bash
npm run read-switch:set 100
# Monitor for 5 minutes
```

🎉 **MIGRATION COMPLETE**

### Post-Deployment (T+120 minutes)

**Validation:**

```bash
# Verify 100% MongoDB
npm run read-switch:status

# Run integration tests
npm run test:integration

# Check error logs
docker logs chatbot-chatbot-service | grep -i error

# Verify data consistency
npm run verify:data-consistency
```

**Documentation:**

- [ ] Update status page
- [ ] Post completion message
- [ ] Schedule retrospective
- [ ] Update monitoring dashboards

---

## Monitoring

### Dashboards

**Primary Dashboard:** http://grafana.yourdomain.com/d/chatbot-overview  
**MongoDB Dashboard:** http://grafana.yourdomain.com/d/mongodb  
**PostgreSQL Dashboard:** http://grafana.yourdomain.com/d/postgresql  
**Service Health:** http://grafana.yourdomain.com/d/service-health

### Key Metrics to Watch

**1. Error Rate**

- **Normal:** < 0.5%
- **Warning:** 0.5% - 2%
- **Critical:** > 2%
- **Action:** If > 5%, immediate rollback

**2. Latency (p95)**

- **Normal:** < 100ms
- **Warning:** 100ms - 200ms
- **Critical:** > 200ms
- **Action:** If > 500ms, rollback

**3. Throughput**

- **Normal:** Stable or increasing
- **Warning:** 10% decrease
- **Critical:** 25% decrease
- **Action:** Investigate immediately

**4. Data Consistency**

- **Normal:** 100% match
- **Warning:** < 99.9%
- **Critical:** < 99%
- **Action:** If < 98%, immediate rollback

**5. Database Health**

- **Normal:** Both databases "up"
- **Warning:** High latency on one
- **Critical:** Either database "down"
- **Action:** If critical, immediate rollback

---

## Troubleshooting

### Issue 1: High Error Rate

**Symptoms:**

- Error rate > 5%
- 500 responses in logs
- Client complaints

**Diagnosis:**

```bash
# Check error logs
docker logs chatbot-chatbot-service | grep -i error | tail -50

# Check database health
npm run health:check

# Check current traffic split
npm run read-switch:status
```

**Resolution:**

1. Immediate rollback: `npm run read-switch:set 0`
2. Verify PostgreSQL working: `curl http://localhost:3001/health`
3. Investigate MongoDB errors
4. Fix issues and retry migration

**Prevention:**

- Enable dual-read during early phases
- Monitor error rates closely
- Set up automated rollback triggers

### Issue 2: Data Inconsistency

**Symptoms:**

- Dual-read mismatch warnings
- Count differences between databases
- Missing records

**Diagnosis:**

```bash
# Check data counts
npm run verify:data-consistency

# Enable verbose dual-read
npm run read-switch:dual-read on --verbose

# Compare specific records
npm run compare:conversation <id>
```

**Resolution:**

1. Pause migration at current percentage
2. Identify inconsistent records
3. Re-run data migration: `npm run migrate:to-mongodb --force`
4. Verify consistency: `npm run verify:data-consistency`
5. Resume migration

**Prevention:**

- Run consistency checks before starting
- Keep dual-write enabled during migration
- Monitor sync lag metrics

### Issue 3: MongoDB Connection Issues

**Symptoms:**

- "MongoDB is down" errors
- Connection timeouts
- Authentication failures

**Diagnosis:**

```bash
# Check MongoDB status
docker exec chatbot-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Check connection from app
npm run test:mongodb-connection

# View MongoDB logs
docker logs chatbot-mongodb-prod --tail=100
```

**Resolution:**

1. Immediate rollback: `npm run read-switch:set 0`
2. Restart MongoDB: `docker-compose restart mongodb`
3. Verify authentication: `npm run test:mongodb-auth`
4. Check network connectivity
5. Resume migration when stable

**Prevention:**

- Pre-deployment MongoDB health check
- Connection pool monitoring
- Automated health checks

### Issue 4: Performance Degradation

**Symptoms:**

- Latency p95 > 200ms
- Slower response times
- User complaints

**Diagnosis:**

```bash
# Check current latencies
curl http://localhost:3001/metrics | grep latency

# Analyze slow queries
docker exec chatbot-mongodb-prod mongosh --eval "db.currentOp()"

# Check resource usage
docker stats
```

**Resolution:**

1. Reduce percentage: `npm run read-switch:set 25` (from 50%)
2. Analyze slow queries
3. Add missing indexes
4. Optimize query patterns
5. Increase MongoDB resources if needed
6. Resume gradual increase

**Prevention:**

- Pre-deployment load testing
- Index optimization before migration
- Resource monitoring

### Issue 5: Service Crashes

**Symptoms:**

- Service restarts
- Out of memory errors
- Unhandled exceptions

**Diagnosis:**

```bash
# Check service status
docker-compose ps

# View crash logs
docker logs chatbot-chatbot-service --tail=200

# Check memory usage
docker stats chatbot-chatbot-service
```

**Resolution:**

1. Immediate rollback: `npm run read-switch:set 0`
2. Restart service: `docker-compose restart chatbot-service`
3. Investigate crash cause
4. Fix code/config issue
5. Deploy fix
6. Resume migration

**Prevention:**

- Pre-deployment stress testing
- Memory leak detection
- Proper error handling

---

## Rollback Procedures

### Level 1: Instant Rollback (< 30 seconds)

**Use When:** Error rate > 5%, critical data issues

```bash
# Set all reads back to PostgreSQL
npm run read-switch:set 0

# Verify rollback
npm run read-switch:status

# Confirm service health
curl http://localhost:3001/health
```

**Validation:**

- [ ] MongoDB percentage = 0%
- [ ] PostgreSQL healthy
- [ ] Error rate < 0.5%
- [ ] Latency normal

### Level 2: Gradual Rollback (5 minutes)

**Use When:** Performance degradation, minor issues

```bash
# From 100% reduce gradually
npm run read-switch:set 75
# Wait 1 minute, monitor

npm run read-switch:set 50
# Wait 1 minute, monitor

npm run read-switch:set 25
# Wait 1 minute, monitor

npm run read-switch:set 0
# Fully back to PostgreSQL
```

### Level 3: Full System Rollback (15 minutes)

**Use When:** Multiple services failing, critical system issues

```bash
# Stop all services
docker-compose down

# Revert to previous version
git checkout previous-stable-tag

# Rebuild and restart
docker-compose -f docker-compose.yml up -d --build

# Verify all services
docker-compose ps
npm run test:integration

# Set PostgreSQL as primary
npm run read-switch:set 0
```

---

## Post-Migration Tasks

### Day 7 (Migration Complete)

- [ ] Verify 100% MongoDB traffic
- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Team retrospective

### Day 14 (1 Week Post-Migration)

- [ ] Disable dual-write if stable
- [ ] Stop PostgreSQL sync
- [ ] Archive PostgreSQL data
- [ ] Update documentation

### Day 21 (2 Weeks Post-Migration)

- [ ] Remove PostgreSQL dependency
- [ ] Clean up migration code
- [ ] Final performance report
- [ ] Celebrate success! 🎉

---

## Communication Templates

### Pre-Deployment Notification

```
Subject: [ACTION REQUIRED] MongoDB Migration - Nov 23, 2025

Team,

We are proceeding with the MongoDB migration today starting at [TIME].

Timeline:
- T-0: Deploy production configuration
- T+15min: Begin gradual traffic migration (10% → 100%)
- T+2hr: Complete cutover to MongoDB

Expected Impact: None (gradual rollout)

Monitoring: [Dashboard Link]
Status Updates: #deployments channel every 30 minutes

On-Call: [Names]

Please acknowledge receipt.
```

### Progress Update (Every 30 minutes)

```
🚀 MongoDB Migration Update

Status: In Progress - [X]% MongoDB traffic
Time Elapsed: [X] minutes
Next Phase: Increase to [Y]% at [TIME]

Metrics:
✅ Error Rate: [X]% (target: < 0.5%)
✅ Latency p95: [X]ms (target: < 100ms)
✅ Both databases healthy
✅ No data inconsistencies

Proceeding as planned.
```

### Completion Notification

```
Subject: ✅ MongoDB Migration Complete

Team,

MongoDB migration successfully completed!

Final Stats:
- Duration: [X] hours
- Traffic: 100% MongoDB
- Error Rate: [X]%
- Latency: [X]ms (improved [Y]%)
- Downtime: 0 seconds

Next Steps:
- 24-hour monitoring period
- Week 2: Disable dual-write
- Week 3: Archive PostgreSQL

Great work everyone! 🎉
```

### Incident Report (If Issues)

```
Subject: [INCIDENT] MongoDB Migration Rollback

Team,

We encountered [ISSUE] during migration and rolled back.

Timeline:
- T+[X]min: Issue detected
- T+[Y]min: Rollback initiated
- T+[Z]min: Services restored

Impact: [DESCRIPTION]
Root Cause: [ANALYSIS]
Action Items: [NEXT STEPS]

Detailed postmortem to follow.
```

---

## Success Criteria

### Technical Metrics

- ✅ 100% traffic on MongoDB
- ✅ Error rate < 0.5%
- ✅ Latency improved by 30%+
- ✅ Zero downtime
- ✅ 100% data consistency

### Business Metrics

- ✅ No customer complaints
- ✅ All features functional
- ✅ Cost reduction achieved
- ✅ Team confidence high

---

## Additional Resources

- **Architecture Docs:** `/docs/architecture/mongodb-migration.md`
- **API Docs:** `/docs/api/chatbot-service.md`
- **Day 4 Setup:** `/DAY4_MONGODB_SETUP.md`
- **Day 5 Migration:** `/DAY5_DATA_MIGRATION_COMPLETE.md`
- **Day 6 Switching:** `/DAY6_READ_SWITCHING_COMPLETE.md`
- **Phase 3 Plan:** `/GRAPHQL_MONGODB_REVISED_ROADMAP.md`

---

**Document Owner:** DevOps Team  
**Review Frequency:** After each deployment  
**Next Review:** Post-migration retrospective

---
