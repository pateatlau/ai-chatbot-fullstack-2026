# Production Deployment Guide

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
  - [Docker Compose](#docker-compose-deployment)
  - [Kubernetes](#kubernetes-deployment)
  - [Cloud Platforms](#cloud-platform-deployments)
- [Database Setup](#database-setup)
- [Security Checklist](#security-checklist)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling Strategy](#scaling-strategy)
- [Backup & Recovery](#backup--recovery)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** 24.0+ and **Docker Compose** 2.20+
- **Node.js** 20 LTS (for local builds)
- **PostgreSQL** 15+
- **Redis** 7+
- **Nginx** (for reverse proxy)

### Required Accounts

- OpenAI API account (for chatbot functionality)
- Domain name and DNS management
- SSL certificate (Let's Encrypt recommended)
- **Container registry** (Docker Hub, AWS ECR, GCP GCR, etc.)

---

## API Documentation

All backend services expose interactive API documentation via Swagger UI.

### Accessing API Documentation

#### Local Development

- **Auth Service**: http://localhost:3000/api-docs
- **Chatbot Service**: http://localhost:3001/api-docs
- **Admin Service**: http://localhost:3002/api-docs

#### Production

- **Auth Service**: https://api.yourdomain.com/auth/api-docs
- **Chatbot Service**: https://api.yourdomain.com/chat/api-docs
- **Admin Service**: https://api.yourdomain.com/admin/api-docs

### Using Swagger UI

1. **Navigate** to the API documentation URL
2. **Click** "Authorize" button (top right)
3. **Enter** your JWT token in the format: `Bearer YOUR_TOKEN_HERE`
4. **Click** "Authorize" then "Close"
5. **Try** endpoints by clicking "Try it out" and "Execute"

### Getting an Access Token

```bash
# Login to get access token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Response includes accessToken
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": { ... }
}
```

### API Endpoints Overview

#### Auth Service (Port 3000)

**Authentication:**

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

**User Management:**

- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

**Health:**

- `GET /health` - Service health check

#### Chatbot Service (Port 3001)

**Conversations:**

- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations` - List user's conversations
- `GET /api/chat/conversations/:id` - Get conversation details
- `PATCH /api/chat/conversations/:id` - Update conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

**Chat Messages:**

- `POST /api/chat/conversations/:id/messages` - Send message (streaming response)
- `GET /api/chat/conversations/:id/messages` - Get conversation messages
- `DELETE /api/chat/messages/:id` - Delete message

**Stats:**

- `GET /api/chat/stats` - Get user chat statistics

**Health:**

- `GET /health` - Service health check (includes OpenAI status)

#### Admin Service (Port 3002)

**User Management (Admin Only):**

- `GET /api/admin/users` - List all users (paginated, searchable)
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/reset-password` - Reset user password

**Analytics (Admin Only):**

- `GET /api/admin/stats` - System statistics (users, chats, system metrics)

**Audit (Admin Only):**

- `GET /api/admin/audit-logs` - Audit logs (paginated, filterable)

**Health:**

- `GET /health` - Service health check

### Features

✅ **Interactive Testing** - Execute API calls directly from browser
✅ **Authentication** - Built-in Bearer token authentication
✅ **Request/Response Examples** - See sample payloads for all endpoints
✅ **Schema Validation** - View detailed request/response schemas
✅ **Error Responses** - See all possible error codes and messages
✅ **Rate Limiting** - Documented rate limits for protected endpoints

### OpenAPI Specification

Each service exposes its OpenAPI 3.0 specification:

- **Auth Service**: http://localhost:3000/api-docs/swagger.json
- **Chatbot Service**: http://localhost:3001/api-docs/swagger.json
- **Admin Service**: http://localhost:3002/api-docs/swagger.json

Use these specs with:

- Postman (import collection)
- Insomnia (import specification)
- Code generators (openapi-generator)
- API testing tools

---

## Environment Configuration

### 1. Generate Secure Secrets

```bash
# Generate JWT secrets (minimum 64 characters)
openssl rand -base64 64

# Generate database password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32
```

### 2. Create Production .env File

Copy `.env.example` to `.env.prod`:

```bash
cp .env.example .env.prod
```

Edit `.env.prod` with your production values:

```env
# Database
DATABASE_URL="postgresql://myapp:SECURE_PASSWORD@postgres:5432/myapp_prod"
DB_USER=myapp
DB_PASSWORD=SECURE_PASSWORD
DB_NAME=myapp_prod

# Redis
REDIS_URL="redis://:SECURE_REDIS_PASSWORD@redis:6379"
REDIS_PASSWORD=SECURE_REDIS_PASSWORD

# JWT (MUST BE IDENTICAL ACROSS ALL SERVICES)
JWT_SECRET="YOUR_64_CHAR_SECRET_HERE"
JWT_REFRESH_SECRET="YOUR_DIFFERENT_64_CHAR_SECRET_HERE"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-your-real-api-key"
OPENAI_MODEL="gpt-4o-mini"
USE_MOCK_AI=false

# Frontend
FRONTEND_URL="https://your-domain.com"
SHELL_PORT=80

# Logging
LOG_LEVEL="info"
NODE_ENV="production"
```

### 3. Create Service-Specific .env Files

```bash
# Auth Service
cp apps/auth-service/.env.example apps/auth-service/.env
# Edit with production values

# Admin Service
cp apps/admin-service/.env.example apps/admin-service/.env
# Edit with production values

# Chatbot Service
cp apps/chatbot-service/.env.example apps/chatbot-service/.env
# Edit with production values
```

---

## Deployment Methods

### Docker Compose Deployment

#### Option 1: Production Docker Compose (Recommended)

**Step 1: Build Images**

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker-compose -f docker-compose.prod.yml build auth-service
docker-compose -f docker-compose.prod.yml build admin-service
docker-compose -f docker-compose.prod.yml build chatbot-service
docker-compose -f docker-compose.prod.yml build shell
```

**Step 2: Start Services**

```bash
# Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Step 3: Run Database Migrations**

```bash
# Run migrations in auth-service
docker-compose -f docker-compose.prod.yml exec auth-service sh -c "cd prisma && npx prisma migrate deploy"

# Run migrations in chatbot-service
docker-compose -f docker-compose.prod.yml exec chatbot-service sh -c "cd prisma && npx prisma migrate deploy"

# Seed initial data
docker-compose -f docker-compose.prod.yml exec auth-service sh -c "cd prisma && npx prisma db seed"
```

**Step 4: Verify Deployment**

```bash
# Health checks
curl http://localhost:3000/health  # Auth service
curl http://localhost:3002/health  # Admin service
curl http://localhost:3001/health  # Chatbot service
curl http://localhost/health       # Shell app

# View running containers
docker ps

# Check logs
docker logs chatbot-auth-service
docker logs chatbot-admin-service
docker logs chatbot-chatbot-service
docker logs chatbot-shell
```

#### Option 2: Manual Docker Build & Run

```bash
# Build images
docker build -t myapp/auth-service:latest -f apps/auth-service/Dockerfile .
docker build -t myapp/admin-service:latest -f apps/admin-service/Dockerfile .
docker build -t myapp/chatbot-service:latest -f apps/chatbot-service/Dockerfile .
docker build -t myapp/shell:latest -f apps/shell/Dockerfile .

# Run PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_USER=myapp \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=myapp_prod \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

# Run Redis
docker run -d \
  --name redis \
  -v redis_data:/data \
  -p 6379:6379 \
  redis:7-alpine

# Run services
docker run -d \
  --name auth-service \
  --env-file apps/auth-service/.env \
  -p 3000:3000 \
  myapp/auth-service:latest

# ... (repeat for other services)
```

---

### Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (1.25+)
- kubectl configured
- Helm 3+ (optional)

#### Create Kubernetes Manifests

**1. Create namespace:**

```bash
kubectl create namespace chatbot-prod
```

**2. Create secrets:**

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=username=myapp \
  --from-literal=password=SECURE_PASSWORD \
  --from-literal=database=myapp_prod \
  -n chatbot-prod

# JWT secrets
kubectl create secret generic jwt-secrets \
  --from-literal=jwt-secret=YOUR_64_CHAR_SECRET \
  --from-literal=jwt-refresh-secret=YOUR_DIFFERENT_SECRET \
  -n chatbot-prod

# OpenAI API key
kubectl create secret generic openai-credentials \
  --from-literal=api-key=YOUR_OPENAI_API_KEY \
  -n chatbot-prod
```

**3. Apply deployments:**

Create `k8s/` directory with manifests:

```yaml
# k8s/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: chatbot-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: myapp/auth-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: chatbot-prod
spec:
  selector:
    app: auth-service
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
```

**4. Apply manifests:**

```bash
kubectl apply -f k8s/
```

**5. Create Ingress:**

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chatbot-ingress
  namespace: chatbot-prod
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: chatbot-tls
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /api/auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 3000
          - path: /api/admin
            pathType: Prefix
            backend:
              service:
                name: admin-service
                port:
                  number: 3002
          - path: /api/chat
            pathType: Prefix
            backend:
              service:
                name: chatbot-service
                port:
                  number: 3001
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shell
                port:
                  number: 80
```

---

### Cloud Platform Deployments

#### AWS (Elastic Beanstalk / ECS)

**Using AWS Elastic Container Service (ECS):**

1. **Push images to ECR:**

```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag myapp/auth-service:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest

# Push
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
```

2. **Create ECS task definitions and services**
3. **Use RDS for PostgreSQL and ElastiCache for Redis**
4. **Configure Application Load Balancer**

#### Google Cloud Platform (Cloud Run)

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/auth-service apps/auth-service

# Deploy to Cloud Run
gcloud run deploy auth-service \
  --image gcr.io/PROJECT_ID/auth-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://..." \
  --set-secrets="JWT_SECRET=jwt-secret:latest"
```

#### Azure (Container Instances / App Service)

```bash
# Login to Azure Container Registry
az acr login --name myregistry

# Build and push
az acr build --registry myregistry --image auth-service:latest apps/auth-service

# Create container instance
az container create \
  --resource-group myapp-rg \
  --name auth-service \
  --image myregistry.azurecr.io/auth-service:latest \
  --dns-name-label myapp-auth \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
  --secure-environment-variables \
    DATABASE_URL="..." \
    JWT_SECRET="..."
```

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy shell app
cd apps/shell
vercel --prod
```

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up
```

---

## Database Setup

### Initial Setup

```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Create admin user
node scripts/create-admin.js
```

### Backup Strategy

**Daily Automated Backups:**

```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h postgres \
  -U myapp \
  -d myapp_prod \
  -F c \
  -f $BACKUP_DIR/backup_$DATE.dump

# Keep only last 30 days
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete
```

**Add to crontab:**

```
0 2 * * * /scripts/backup-db.sh
```

### Restore from Backup

```bash
# Restore PostgreSQL
pg_restore \
  -h postgres \
  -U myapp \
  -d myapp_prod \
  -c \
  backup_20250117_020000.dump
```

---

## Security Checklist

### Pre-Deployment

- [ ] All `.env` files use strong, unique secrets
- [ ] JWT_SECRET is 64+ characters and random
- [ ] Database passwords are strong (20+ characters)
- [ ] OpenAI API key is valid and has usage limits
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is enabled on all APIs
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection headers configured
- [ ] CSRF protection enabled
- [ ] HTTPS/TLS enabled with valid certificate
- [ ] Security headers configured (CSP, HSTS, etc.)

### Post-Deployment

- [ ] Run security audit: `npm audit`
- [ ] Check for exposed secrets: `git-secrets --scan`
- [ ] Test authentication flows
- [ ] Verify rate limiting works
- [ ] Test CORS configuration
- [ ] Check error messages don't expose sensitive info
- [ ] Monitor logs for suspicious activity

---

## Monitoring & Logging

### Application Logging

All services log to stdout/stderr. Configure log aggregation:

**Docker Logging Driver:**

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**Centralized Logging Options:**

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki**
- **CloudWatch Logs** (AWS)
- **Google Cloud Logging**
- **Azure Monitor**

### Metrics & Monitoring

**Health Check Endpoints:**

- Auth Service: `http://localhost:3000/health`
- Admin Service: `http://localhost:3002/health`
- Chatbot Service: `http://localhost:3001/health`
- Shell App: `http://localhost/health`

**Monitoring Tools:**

- **Prometheus + Grafana** (self-hosted)
- **Datadog**
- **New Relic**
- **AWS CloudWatch**
- **Google Cloud Monitoring**

### Uptime Monitoring

Configure external uptime monitoring:

- **UptimeRobot** (free tier available)
- **Pingdom**
- **StatusCake**
- **Better Uptime**

---

## Scaling Strategy

### Horizontal Scaling

**Docker Compose:**

```bash
# Scale auth service to 3 replicas
docker-compose -f docker-compose.prod.yml up -d --scale auth-service=3
```

**Kubernetes:**

```bash
# Scale deployment
kubectl scale deployment auth-service --replicas=3 -n chatbot-prod

# Autoscaling
kubectl autoscale deployment auth-service \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n chatbot-prod
```

### Vertical Scaling

Increase container resources:

```yaml
resources:
  limits:
    memory: '1Gi'
    cpu: '1000m'
  requests:
    memory: '512Mi'
    cpu: '500m'
```

### Database Scaling

- **Read Replicas**: Create PostgreSQL read replicas for heavy read workloads
- **Connection Pooling**: Use PgBouncer for connection pooling
- **Partitioning**: Partition large tables by date

### Redis Scaling

- **Redis Cluster**: For high availability
- **Redis Sentinel**: For automatic failover

---

## Backup & Recovery

### Automated Backups

**Database:**

- Schedule daily backups at 2 AM
- Retain 30 days of backups
- Store in separate location (S3, GCS, etc.)

**Application Code:**

- Git repository with tags for releases
- Docker images tagged and pushed to registry

**Configuration:**

- Environment variables backed up securely
- Kubernetes manifests in version control

### Disaster Recovery Plan

**RTO (Recovery Time Objective): 2 hours**
**RPO (Recovery Point Objective): 24 hours**

1. **Database Failure:**
   - Restore from latest backup (max 24h old)
   - Apply transaction logs if available
   - Verify data integrity

2. **Service Failure:**
   - Roll back to previous Docker image
   - Redeploy using stored manifests
   - Verify health checks pass

3. **Complete Infrastructure Loss:**
   - Provision new infrastructure
   - Restore database from backup
   - Deploy latest application version
   - Restore configuration from secrets manager

---

## Rollback Procedures

### Docker Compose Rollback

```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Pull previous image version
docker pull myapp/auth-service:v1.2.3

# Update docker-compose.prod.yml to use previous version
# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Rollback

```bash
# Rollback to previous revision
kubectl rollout undo deployment/auth-service -n chatbot-prod

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 -n chatbot-prod

# Check rollout status
kubectl rollout status deployment/auth-service -n chatbot-prod
```

### Database Migration Rollback

```bash
# Prisma doesn't support automatic rollback
# Restore from backup taken before migration
pg_restore -h postgres -U myapp -d myapp_prod backup_before_migration.dump
```

---

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

**Symptoms:** Container exits immediately

**Solutions:**

```bash
# Check logs
docker logs chatbot-auth-service

# Check environment variables
docker exec chatbot-auth-service env

# Verify database connection
docker exec chatbot-auth-service sh -c "nc -zv postgres 5432"
```

#### 2. Database Connection Errors

**Symptoms:** "ECONNREFUSED" or "Connection timeout"

**Solutions:**

- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `docker ps | grep postgres`
- Test connection: `psql $DATABASE_URL`
- Check network: `docker network inspect chatbot-network`

#### 3. JWT Authentication Fails

**Symptoms:** "Invalid token" errors

**Solutions:**

- Verify JWT_SECRET is identical across all services
- Check token expiration (JWT_EXPIRES_IN)
- Inspect token: Use jwt.io to decode

#### 4. Frontend Can't Load MFEs

**Symptoms:** Module Federation errors

**Solutions:**

- Check Nginx configuration
- Verify CORS headers
- Check browser console for network errors
- Ensure all MFE ports are accessible

#### 5. High Memory Usage

**Solutions:**

- Check for memory leaks in application code
- Increase container memory limits
- Enable Node.js garbage collection logging
- Monitor with: `docker stats`

#### 6. Slow API Responses

**Solutions:**

- Check database query performance
- Add database indexes
- Enable Redis caching
- Scale services horizontally

---

## Production Checklist

### Before First Deployment

- [ ] All environment variables configured
- [ ] SSL certificate obtained and configured
- [ ] Domain DNS configured
- [ ] Database migrations tested
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation reviewed

### Deployment Day

- [ ] Notify team of deployment window
- [ ] Create database backup
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Run smoke tests on production
- [ ] Monitor logs and metrics
- [ ] Verify all health checks pass
- [ ] Test critical user flows
- [ ] Update status page

### Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Check performance metrics
- [ ] Verify backup completed successfully
- [ ] Document any issues encountered
- [ ] Update runbooks with lessons learned

---

## Support & Resources

- **Documentation**: `/docs`
- **GitHub Issues**: Repository issues page
- **Docker Hub**: Container registry
- **Status Page**: Your status page URL

---

**Last Updated**: November 2025  
**Version**: 1.0.0
