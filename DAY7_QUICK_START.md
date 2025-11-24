# Day 7 Quick Start - Production Deployment

**Last Updated:** November 23, 2025  
**Status:** 🟢 Ready to Execute  
**Estimated Time:** 2-3 hours

---

## Pre-Flight Checklist

Before starting the production deployment:

- [ ] All tests passing (`npm run test`)
- [ ] Team briefed and on standby
- [ ] Stakeholders notified
- [ ] Monitoring dashboards open
- [ ] `.env.production` configured with real credentials
- [ ] Rollback procedures reviewed

---

## Quick Command Reference

### Pre-Deployment

```bash
# 1. Check current status
npm run db:status
npm run health:check
npm run read-switch:status

# 2. Verify data consistency
npm run migrate:verify

# 3. Verify all Docker services healthy
docker-compose ps
```

### Deployment

```bash
# 1. Stop development environment
npm run db:stop

# 2. Configure production environment
cp .env.production.template .env.production
# Edit .env.production with actual passwords

# 3. Initialize production MongoDB
npm run prod:init-mongodb

# 4. Deploy production stack
npm run prod:deploy

# 5. Verify all services healthy
npm run prod:status
```

### Traffic Migration (90 minutes)

```bash
# Phase 1: 10% MongoDB (15 minutes)
npm run read-switch:dual-read on
npm run read-switch:set 10
# Wait 10 minutes, monitor metrics
npm run read-switch:status

# Phase 2: 25% MongoDB (15 minutes)
npm run read-switch:set 25
# Wait 10 minutes, monitor metrics
npm run read-switch:status

# Phase 3: 50% MongoDB (20 minutes)
npm run read-switch:dual-read off  # Disable for performance
npm run read-switch:set 50
# Wait 15 minutes, monitor metrics
npm run read-switch:status

# Phase 4: 75% MongoDB (15 minutes)
npm run read-switch:set 75
# Wait 10 minutes, monitor metrics
npm run read-switch:status

# Phase 5: 90% MongoDB (15 minutes)
npm run read-switch:set 90
# Wait 10 minutes, monitor metrics
npm run read-switch:status

# Phase 6: 100% MongoDB - Full Cutover (10 minutes)
npm run read-switch:set 100
# Wait 5 minutes, monitor metrics
npm run read-switch:status
```

### Validation

```bash
# Check final status
npm run prod:status

# Verify health
npm run health:check

# Check for errors
npm run prod:logs | grep -i error

# Verify data consistency
npm run migrate:verify
```

### Emergency Rollback (if needed)

```bash
# Instant rollback to PostgreSQL
npm run read-switch:set 0

# Verify rollback successful
npm run read-switch:status
npm run health:check
```

---

## Monitoring Checklist

Watch these metrics during migration:

### Critical (Immediate Action if Threshold Exceeded)

- **Error Rate:** Must stay < 5%
- **Latency p95:** Must stay < 500ms
- **Database Health:** Both must be "up"
- **Data Consistency:** Must be 100%

### Important (Monitor Closely)

- **Error Rate:** Target < 0.5%
- **Latency p95:** Target < 100ms
- **Throughput:** Should remain stable or increase
- **Connection Pools:** Should stay < 80% utilized

### Health Check Commands

```bash
# Every 5 minutes during migration
npm run health:check
npm run read-switch:status

# Check real-time metrics
curl http://localhost:3001/metrics

# Watch logs
npm run prod:logs --tail=50
```

---

## Decision Points

### After Each Phase

**GO Criteria (Proceed to Next Phase):**

- ✅ Error rate < 0.5%
- ✅ Latency normal or improved
- ✅ No data inconsistencies
- ✅ Both databases healthy
- ✅ No customer complaints

**NO-GO Criteria (Rollback):**

- 🛑 Error rate > 5%
- 🛑 Latency > 500ms
- 🛑 Data inconsistencies detected
- 🛑 Either database down
- 🛑 Customer complaints received

**If NO-GO:**

```bash
# Immediate rollback
npm run read-switch:set 0
# Investigate issue
# Fix problem
# Retry migration
```

---

## Communication Templates

### Progress Update (Every 30 minutes)

```
🚀 MongoDB Migration Update

Time: [HH:MM]
Status: Phase [X] - [Y]% MongoDB traffic
Next: Increase to [Z]% at [HH:MM]

Metrics:
✅ Error Rate: 0.3% (target: < 0.5%)
✅ Latency p95: 45ms (target: < 100ms)
✅ Both databases healthy
✅ No data inconsistencies

Proceeding as planned.
```

### Completion Notification

```
✅ MongoDB Migration Complete!

Duration: [X] hours [Y] minutes
Final Status: 100% MongoDB traffic
Error Rate: [X]%
Latency: [X]ms (improved [Y]%)
Downtime: 0 seconds

Great work team! 🎉
```

---

## Troubleshooting Quick Reference

### Issue: High Error Rate

```bash
# Check errors
npm run prod:logs | grep -i error

# Rollback immediately
npm run read-switch:set 0

# Investigate cause
npm run health:check
```

### Issue: Data Inconsistency

```bash
# Pause migration
npm run read-switch:dual-read on

# Verify data
npm run migrate:verify

# Re-sync if needed
npm run migrate:to-mongo --force
```

### Issue: Service Down

```bash
# Check service status
docker-compose ps

# View logs
npm run prod:logs --tail=200

# Restart if needed
docker-compose restart chatbot-service
```

### Issue: MongoDB Connection Problems

```bash
# Check MongoDB status
docker exec chatbot-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
docker-compose restart mongodb

# Verify connection
npm run health:check
```

---

## Success Criteria

### Technical

- ✅ 100% traffic on MongoDB
- ✅ Error rate < 0.5%
- ✅ Latency improved (target: 30% faster)
- ✅ Zero downtime
- ✅ 100% data consistency

### Business

- ✅ No customer complaints
- ✅ All features functional
- ✅ Performance improved
- ✅ Cost reduced

### Operational

- ✅ Smooth deployment
- ✅ Team executed confidently
- ✅ Documentation accurate
- ✅ Monitoring effective

---

## Post-Deployment

### Immediate (T+1 hour)

- [ ] Send completion notification
- [ ] Continue monitoring
- [ ] Document any issues
- [ ] Update status page

### Day 1 (T+24 hours)

- [ ] Review metrics summary
- [ ] Check for anomalies
- [ ] Gather team feedback
- [ ] Document lessons learned

### Week 1 (T+7 days)

- [ ] Consider disabling dual-write
- [ ] Validate MongoDB-only operation
- [ ] Plan PostgreSQL archive
- [ ] Schedule retrospective

### Week 2 (T+14 days)

- [ ] Disable dual-write if stable
- [ ] Archive PostgreSQL data
- [ ] Remove PostgreSQL dependency
- [ ] Celebrate success! 🎉

---

## Key Files Reference

- **Full Plan:** `DAY7_PRODUCTION_DEPLOYMENT_PLAN.md`
- **Detailed Runbook:** `PRODUCTION_RUNBOOK.md`
- **Phase 3 Summary:** `PHASE3_MONGODB_MIGRATION_COMPLETE.md`
- **Day 7 Complete:** `DAY7_PRODUCTION_DEPLOYMENT_COMPLETE.md`

---

## Emergency Contacts

| Role                | Name   | Contact       |
| ------------------- | ------ | ------------- |
| DevOps Lead         | [Name] | [Phone/Slack] |
| Backend Lead        | [Name] | [Phone/Slack] |
| Engineering Manager | [Name] | [Phone/Slack] |
| CTO                 | [Name] | [Phone/Slack] |

---

**Ready to Deploy:** 🟢 YES  
**All Systems:** GO  
**Confidence Level:** HIGH

**Let's ship it! 🚀**

---
