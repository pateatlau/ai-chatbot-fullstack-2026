# Event-Driven Architecture Production Deployment Guide

## Overview

This guide covers deploying the event-driven MFE architecture to production environments.

---

## Pre-Deployment Checklist

### Code Review

- [ ] All event emissions tested
- [ ] Event listeners properly cleaned up
- [ ] No memory leaks detected
- [ ] Event payloads optimized (small size)
- [ ] Error handling in all listeners
- [ ] TypeScript errors resolved
- [ ] Lint warnings addressed

### Testing

- [ ] Unit tests passing (134+ tests)
- [ ] Integration tests passing (20+ tests)
- [ ] E2E tests covering event flows
- [ ] Performance tests completed
- [ ] Load testing done
- [ ] Cross-browser testing complete

### Configuration

- [ ] Event bus production config set
- [ ] DevTools disabled in production
- [ ] Logging levels appropriate
- [ ] Error tracking configured
- [ ] Environment variables set

---

## Production Configuration

### Event Bus Settings

**Recommended production configuration:**

```typescript
// libs/shared/event-bus/src/lib/event-bus.ts

export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus({
      enableHistory: process.env.NODE_ENV === 'development',
      maxHistorySize: process.env.NODE_ENV === 'development' ? 1000 : 50,
      enableLogging: false, // Disable in production
    });
  }
  return globalEventBus;
}
```

### Key Settings Explained:

**enableHistory**

- Development: `true` (for DevTools)
- Production: `false` (save memory)
- Alternative: Keep `true` with small `maxHistorySize` for debugging

**maxHistorySize**

- Development: `1000` events
- Production: `50` events (or 0 if history disabled)
- Reduces memory footprint

**enableLogging**

- Development: `true`
- Production: `false`
- Use error tracking instead (Sentry, etc.)

---

## Environment Variables

### Required Variables

```bash
# .env.production

# Application
NODE_ENV=production

# API Endpoints
VITE_AUTH_SERVICE_URL=https://api.yourapp.com/auth
VITE_CHATBOT_SERVICE_URL=https://api.yourapp.com/chatbot
VITE_ADMIN_SERVICE_URL=https://api.yourapp.com/admin
VITE_PROFILE_SERVICE_URL=https://api.yourapp.com/profile

# Feature Flags
VITE_ENABLE_DEVTOOLS=false

# Error Tracking
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ENVIRONMENT=production
```

---

## Build Process

### Production Build Commands

```bash
# Build all applications and libraries
nx run-many --target=build --all --configuration=production

# Build specific MFE
nx build shell --configuration=production
nx build auth-mfe --configuration=production
nx build chatbot-mfe --configuration=production
nx build admin-mfe --configuration=production
nx build profile-mfe --configuration=production

# Build backend services
nx build auth-service --configuration=production
nx build chatbot-service --configuration=production
nx build admin-service --configuration=production
```

### Build Output

```
dist/
  apps/
    shell/              # Main shell application
    auth-mfe/           # Auth microfrontend
    chatbot-mfe/        # Chatbot microfrontend
    admin-mfe/          # Admin microfrontend
    profile-mfe/        # Profile microfrontend
```

---

## Deployment Strategies

### Option 1: CDN Deployment (Recommended)

Deploy each MFE separately to CDN for optimal caching and performance.

**Shell Application:**

```bash
# Upload shell to CDN
aws s3 sync dist/apps/shell s3://your-bucket/shell/ --delete
aws cloudfront create-invalidation --distribution-id XYZ --paths "/*"
```

**Each MFE:**

```bash
# Auth MFE
aws s3 sync dist/apps/auth-mfe s3://your-bucket/auth-mfe/ --delete

# Chatbot MFE
aws s3 sync dist/apps/chatbot-mfe s3://your-bucket/chatbot-mfe/ --delete

# Repeat for other MFEs...
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM nginx:alpine

# Copy built applications
COPY dist/apps/shell /usr/share/nginx/html/shell
COPY dist/apps/auth-mfe /usr/share/nginx/html/auth-mfe
COPY dist/apps/chatbot-mfe /usr/share/nginx/html/chatbot-mfe
# ... other MFEs

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and deploy
docker build -t myapp-frontend:latest .
docker push myapp-frontend:latest
```

### Option 3: Kubernetes Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: myapp-frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: NODE_ENV
              value: 'production'
```

---

## Nginx Configuration

### Recommended nginx.conf

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourapp.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;

    # Shell application (root)
    location / {
        root /usr/share/nginx/html/shell;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Auth MFE
    location /auth/ {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /auth/index.html;
    }

    # Chatbot MFE
    location /chatbot/ {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /chatbot/index.html;
    }

    # Admin MFE
    location /admin/ {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /admin/index.html;
    }

    # Profile MFE
    location /profile/ {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /profile/index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass https://api.yourapp.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## Monitoring & Observability

### Error Tracking

**Integrate Sentry:**

```typescript
// apps/shell/src/main.tsx
import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_SENTRY_ENVIRONMENT,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
  });
}
```

**Track Event Bus Errors:**

```typescript
// Add to event bus error handler
try {
  await listener(data);
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        event_name: eventName,
        component: 'event-bus',
      },
    });
  }
  console.error(`[EventBus] Listener error for ${eventName}:`, error);
}
```

### Performance Monitoring

**Add Performance Tracking:**

```typescript
// libs/shared/event-bus/src/lib/event-bus.ts

async emit(eventName: string, data: any = {}): Promise<void> {
  const startTime = performance.now();

  // ... existing emit logic ...

  const duration = performance.now() - startTime;

  if (duration > 100) {
    console.warn(`[EventBus] Slow event emission: ${eventName} took ${duration}ms`);
  }
}
```

### Logging

**Production Logging Strategy:**

```typescript
// Use structured logging
const log = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (DataDog, CloudWatch, etc.)
      logToService('info', message, meta);
    } else {
      console.log(message, meta);
    }
  },
  error: (message: string, error: Error, meta?: any) => {
    // Always log errors
    logToService('error', message, {
      ...meta,
      error: error.message,
      stack: error.stack,
    });
  },
};
```

---

## Performance Optimization

### Code Splitting

Ensure proper code splitting per MFE:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@myapp/frontend/ui-components'],
          'event-bus': ['@myapp/shared/event-bus'],
        },
      },
    },
  },
});
```

### Lazy Loading

Lazy load MFE components:

```typescript
// apps/shell/src/routes/index.tsx
const ChatbotMFE = lazy(() => import('@myapp/chatbot-mfe'));
const AdminMFE = lazy(() => import('@myapp/admin-mfe'));
```

### Asset Optimization

```bash
# Optimize images
imagemin dist/apps/**/*.{jpg,jpeg,png} --out-dir=dist/apps/optimized

# Minimize CSS
postcss dist/apps/**/*.css --dir dist/apps/optimized --use cssnano

# Tree-shake unused code (automatic with Vite)
```

---

## Security Considerations

### Content Security Policy

```nginx
# Add to nginx config
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

### Event Bus Security

**Validate event payloads:**

```typescript
// Add payload validation
emit(eventName: string, data: any = {}): void {
  // Validate payload size
  const payloadSize = JSON.stringify(data).length;
  if (payloadSize > 10000) {
    throw new Error(`Event payload too large: ${payloadSize} bytes`);
  }

  // Sanitize sensitive data
  if (data.password || data.token) {
    console.warn('[EventBus] Sensitive data detected in event payload');
  }

  // ... emit logic
}
```

---

## Rollback Strategy

### Version Management

```bash
# Tag releases
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Build with version
VITE_APP_VERSION=v1.0.0 nx build shell --configuration=production
```

### Blue-Green Deployment

```bash
# Deploy to green environment
deploy-to green

# Test green environment
run-smoke-tests https://green.yourapp.com

# Switch traffic
switch-traffic to green

# Keep blue for rollback
# If issues detected:
switch-traffic to blue
```

---

## Health Checks

### Event Bus Health Check

```typescript
// apps/shell/src/health/event-bus-health.ts

export function checkEventBusHealth() {
  const eventBus = getEventBus();
  const stats = eventBus.getStats();

  return {
    healthy: true,
    totalListeners: stats.totalListeners,
    eventTypes: stats.eventTypes,
    memoryUsage: stats.totalEvents * 1000, // Rough estimate
  };
}
```

### Endpoint

```typescript
// Add to health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    eventBus: checkEventBusHealth(),
    version: process.env.VITE_APP_VERSION,
  });
});
```

---

## Troubleshooting

### Common Production Issues

**Event Listeners Not Working**

- Check environment variables set correctly
- Verify MFE loaded properly
- Check browser console for errors
- Ensure event names match exactly

**Memory Leaks**

- Monitor Active Listeners metric
- Check component cleanup (useEffect return)
- Verify unsubscribe called on unmount
- Review Chrome DevTools Memory tab

**Performance Degradation**

- Check Events/Second metric
- Review Event Breakdown for storms
- Optimize high-frequency events
- Consider event batching

---

## Post-Deployment Validation

### Smoke Tests

```bash
# Run post-deployment tests
npm run test:smoke:production

# Check key flows
- Login/Logout
- Profile updates
- Chatbot interactions
- Admin operations
```

### Metrics to Monitor

- **Event Throughput**: Events/second < 10
- **Listener Count**: Stable, no continuous growth
- **Memory Usage**: < 5MB for event history
- **Error Rate**: < 0.1% of events
- **Page Load Time**: < 3 seconds
- **Time to Interactive**: < 5 seconds

---

## Maintenance

### Regular Tasks

**Weekly:**

- Review error logs
- Check performance metrics
- Monitor memory usage
- Analyze event patterns

**Monthly:**

- Update dependencies
- Review security patches
- Optimize event payloads
- Clean up unused events

**Quarterly:**

- Performance audit
- Security review
- Architecture review
- Load testing

---

## Support & Resources

- **Documentation**: `docs/EVENT_BUS_DOCUMENTATION_INDEX.md`
- **DevTools Guide**: `docs/EVENT_BUS_DEVTOOLS_GUIDE.md`
- **Quick Start**: `docs/EVENT_BUS_QUICK_START.md`
- **API Reference**: Event Bus implementation

---

**Version**: 1.0.0  
**Last Updated**: Phase 5 completion  
**Maintainers**: Event Bus Team
