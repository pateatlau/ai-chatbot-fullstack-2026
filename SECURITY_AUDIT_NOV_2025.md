# Security Audit Report - November 21, 2025

**Auditor**: GitHub Copilot (Senior Security Expert Mode)  
**Date**: November 21, 2025  
**Project**: AI Chatbot Full-Stack Application  
**Branch**: feature/graphql-implementation  
**Audit Scope**: Full-stack security analysis (Backend, Frontend, Infrastructure)

---

## 📊 Executive Summary

**Overall Security Posture**: ⚠️ **NEEDS IMMEDIATE ATTENTION**

- **Critical Vulnerabilities**: 2 (Must fix before any deployment)
- **High Severity**: 4 (Fix before production launch)
- **Medium Severity**: 4 (Address within sprint)
- **Low Severity**: 3 (Best practices to implement)
- **Strengths**: 10 security features already implemented correctly

**Risk Level**: 🔴 **HIGH** - Due to exposed secrets and CORS misconfiguration

---

## 🔴 CRITICAL VULNERABILITIES (Fix Immediately)

### 1. **EXPOSED SECRETS IN REPOSITORY**

**Severity**: 🔴 CRITICAL  
**CVSS Score**: 9.8 (Critical)  
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Issue**:
Real API keys and production-ready secrets are committed to the repository in `.env` files:

**Affected Files**:

- `apps/chatbot-service/.env` - Contains live OpenAI API key
- `apps/auth-service/.env` - Contains JWT secrets with "change in production" placeholder

**Exposed Secrets**:

```bash
# apps/chatbot-service/.env
OPENAI_API_KEY="sk-proj-[REDACTED-200-CHARS]" # ⚠️ Real key exposed in .env file!

# Both services
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
```

**Impact**:

- ❌ OpenAI API key can be stolen → unauthorized charges ($$$)
- ❌ Anyone with repo access (including GitHub history) has production secrets
- ❌ Weak JWT secrets allow token forgery → account takeover
- ❌ Database credentials exposed → potential data breach

**Exploitation Scenario**:

1. Attacker finds public repo or gains read access
2. Extracts OpenAI key from commit history
3. Uses key for own purposes → charges to your account
4. OR: Forks weak JWT secrets to forge authentication tokens

**Remediation**:

**IMMEDIATE ACTIONS** (Do within 1 hour):

```bash
# 1. ROTATE OPENAI API KEY IMMEDIATELY
# - Go to https://platform.openai.com/api-keys
# - Delete the exposed key
# - Generate new key
# - Store in secure location (NOT in repo)

# 2. Generate strong JWT secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# 3. Remove .env files from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/*/.env' \
  --prune-empty --tag-name-filter cat -- --all

# 4. Force push (WARNING: Coordinate with team)
git push origin --force --all
git push origin --force --tags

# 5. Update .gitignore (already correct, but verify)
# Ensure *.env is present
```

**Long-term Solution**:

```bash
# 1. Create .env.example templates (no real secrets)
# apps/auth-service/.env.example
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
JWT_SECRET="generate-with-crypto-randomBytes-32-hex"
JWT_REFRESH_SECRET="generate-with-crypto-randomBytes-32-hex"
# ... etc

# 2. Use secrets manager in production
# AWS: AWS Secrets Manager
# GCP: Secret Manager
# Azure: Key Vault
# Self-hosted: HashiCorp Vault

# 3. CI/CD pipeline injects secrets at runtime
# Never commit real credentials
```

**Verification**:

- [ ] OpenAI API key rotated
- [ ] New JWT secrets generated (32+ bytes)
- [ ] .env files removed from git history
- [ ] .env.example templates created
- [ ] Team notified of secret rotation
- [ ] Secrets manager selected for production

---

### 2. **CORS WILDCARD VULNERABILITY**

**Severity**: 🔴 CRITICAL  
**CVSS Score**: 8.1 (High)  
**CWE**: CWE-942 (Permissive Cross-domain Policy)

**Issue**:
CORS configuration accepts ANY origin, bypassing same-origin policy even with credentials enabled.

**Location**: `apps/auth-service/src/main.ts:33-37`

```typescript
// ⚠️ VULNERABLE CODE
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'; // Accepts ANY domain!
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true'); // + credentials = DANGEROUS
  // ...
});
```

**Impact**:

- ❌ Any website can make authenticated requests to your API
- ❌ CSRF attacks despite SameSite cookies
- ❌ Credential theft via malicious sites
- ❌ Session hijacking from evil.com → yourapi.com

**Exploitation Scenario**:

```javascript
// Attacker's website: evil.com
fetch('http://yourapi.com/api/auth/me', {
  credentials: 'include', // Sends victim's cookies!
})
  .then((r) => r.json())
  .then((data) => {
    // Steal user data
    sendToAttacker(data);
  });
```

**Remediation**:

```typescript
// apps/auth-service/src/main.ts
// Replace lines 29-40 with:

// CORS Configuration - Whitelist only
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL] // Production: single domain
    : [
        'http://localhost:5173', // Shell
        'http://localhost:5174', // Auth MFE
        'http://localhost:5175', // Chatbot MFE
        'http://localhost:5176', // Admin MFE
        'http://localhost:5177', // Profile MFE
      ];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (process.env.NODE_ENV !== 'production') {
    // Log rejected origins in development
    console.warn(`CORS: Rejected origin: ${origin}`);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

**Apply to all services**:

- [ ] apps/auth-service/src/main.ts
- [ ] apps/chatbot-service/src/main.ts
- [ ] apps/admin-service/src/main.ts

**Verification**:

- [ ] CORS whitelist implemented
- [ ] Origin validation tested
- [ ] Rejected origins logged
- [ ] Production uses single FRONTEND_URL
- [ ] Browser console shows no CORS errors

---

## 🟠 HIGH SEVERITY (Fix Before Production)

### 3. **Missing Security Headers**

**Severity**: 🟠 HIGH  
**CVSS Score**: 7.5 (High)  
**CWE**: CWE-693 (Protection Mechanism Failure)

**Issue**:
No security headers configured, leaving application vulnerable to multiple attack vectors.

**Missing Headers**:

- ❌ `Content-Security-Policy` (XSS protection)
- ❌ `X-Frame-Options` (Clickjacking protection)
- ❌ `X-Content-Type-Options` (MIME-sniffing prevention)
- ❌ `Strict-Transport-Security` (HTTPS enforcement)
- ❌ `X-XSS-Protection` (Browser XSS filter)
- ❌ `Referrer-Policy` (Information leakage)

**Impact**:

- XSS attacks can execute malicious scripts
- Clickjacking via iframe embedding
- MIME-type confusion attacks
- Man-in-the-middle on HTTP

**Remediation**:

```bash
# Install Helmet.js
npm install helmet
```

```typescript
// apps/auth-service/src/main.ts (after other imports)
import helmet from 'helmet';

// After app initialization, before other middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires inline styles
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
```

**Apply to**:

- [ ] apps/auth-service
- [ ] apps/chatbot-service
- [ ] apps/admin-service
- [ ] apps/graphql-gateway

---

### 4. **Insufficient Input Sanitization**

**Severity**: 🟠 HIGH  
**CVSS Score**: 7.3 (High)  
**CWE**: CWE-20 (Improper Input Validation)

**Issue**:
Relying solely on Zod validation. Missing HTML/script sanitization layer.

**Current State**:

- ✅ Zod validation (good for types)
- ✅ Prisma ORM (prevents SQL injection)
- ❌ No HTML sanitization
- ❌ No script tag removal
- ❌ No dangerous character escaping

**Potential Vulnerabilities**:

```javascript
// Stored XSS example
{
  name: "<script>alert('XSS')</script>",
  bio: "<img src=x onerror=alert('XSS')>"
}
```

**Remediation**:

```bash
npm install express-validator dompurify isomorphic-dompurify
```

```typescript
// libs/backend/security/src/lib/sanitizer.ts (NEW FILE)
import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = createDOMPurify();

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [],
  });
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

// Middleware
export const sanitizeMiddleware = (req: any, res: any, next: any) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};
```

```typescript
// apps/auth-service/src/main.ts
import { sanitizeMiddleware } from '@myapp/backend/security';

app.use(express.json());
app.use(sanitizeMiddleware); // Add after body parsing
```

---

### 5. **Rate Limiting Too Permissive**

**Severity**: 🟠 HIGH  
**CVSS Score**: 6.5 (Medium)  
**CWE**: CWE-770 (Allocation of Resources Without Limits)

**Issue**:
Development rate limit values (1000 attempts) hardcoded in production code.

**Location**: `apps/auth-service/src/middleware/rate-limit.middleware.ts:57-66`

```typescript
// ⚠️ VULNERABLE - 1000 login attempts allowed!
export const loginRateLimiter = createRateLimiter({
  maxAttempts: 1000, // Should be 5-10
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'rate-limit:login',
});
```

**Impact**:

- Brute-force attacks easily succeed
- Credential stuffing attacks
- API abuse and DoS

**Remediation**:

```typescript
// apps/auth-service/src/middleware/rate-limit.middleware.ts

const isDev = process.env.NODE_ENV === 'development';

export const loginRateLimiter = createRateLimiter({
  maxAttempts: isDev ? 1000 : 5, // Strict in production
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'rate-limit:login',
});

export const passwordResetRateLimiter = createRateLimiter({
  maxAttempts: isDev ? 1000 : 3,
  windowMs: 60 * 60 * 1000,
  keyPrefix: 'rate-limit:password-reset',
});

export const registerRateLimiter = createRateLimiter({
  maxAttempts: isDev ? 1000 : 3,
  windowMs: 60 * 60 * 1000,
  keyPrefix: 'rate-limit:register',
});
```

**Verification**:

- [ ] Rate limits environment-dependent
- [ ] Production limits: 5 login, 3 register, 3 password reset
- [ ] Test brute-force protection
- [ ] Monitor rate limit hits

---

### 6. **Token Storage in localStorage (Documentation Inconsistency)**

**Severity**: 🟠 HIGH  
**CVSS Score**: 7.5 (High)  
**CWE**: CWE-922 (Insecure Storage of Sensitive Information)

**Issue**:
Documentation mentions localStorage for tokens, but implementation uses HttpOnly cookies.

**Current Implementation**: ✅ HttpOnly cookies (secure)  
**Documentation**: ❌ References localStorage (insecure pattern)

**Impact**:

- Confusion for developers
- Risk of localStorage implementation
- XSS vulnerability if tokens moved to localStorage

**Remediation**:

**1. Audit Frontend Code**:

```bash
# Search for localStorage token usage
grep -r "localStorage.setItem.*token" apps/
grep -r "localStorage.getItem.*token" apps/
```

**2. Update Documentation**:

- Remove all references to localStorage tokens
- Emphasize HttpOnly cookie implementation
- Document why cookies > localStorage

**3. Add Linting Rule**:

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.object.name='localStorage'][callee.property.name='setItem'] > Literal[value=/token/i]",
        "message": "Never store tokens in localStorage. Use HttpOnly cookies."
      }
    ]
  }
}
```

---

## 🟡 MEDIUM SEVERITY (Address This Sprint)

### 7. **No Request Size Limits**

**Severity**: 🟡 MEDIUM  
**CVSS Score**: 5.3 (Medium)  
**CWE**: CWE-400 (Uncontrolled Resource Consumption)

**Issue**: Missing body-parser size limits allows DoS attacks.

**Remediation**:

```typescript
// All services main.ts
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

### 8. **Insufficient Security Event Logging**

**Severity**: 🟡 MEDIUM  
**CVSS Score**: 5.9 (Medium)  
**CWE**: CWE-778 (Insufficient Logging)

**Missing Logs**:

- Login failures (brute-force detection)
- Token validation failures
- Rate limit hits
- Password reset attempts
- Authorization failures

**Remediation**:

```bash
npm install winston
```

```typescript
// libs/backend/logger/src/lib/security-logger.ts
import winston from 'winston';

export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console(),
  ],
});

// Usage in auth middleware
securityLogger.warn('Login failure', {
  email: input.email,
  ip: req.ip,
  timestamp: new Date(),
});
```

---

### 9. **Weak Password Policy (Frontend Only)**

**Severity**: 🟡 MEDIUM  
**CVSS Score**: 5.3 (Medium)

**Issue**: Password complexity validation only on backend.

**Remediation**: Add frontend validation matching backend rules

```typescript
// Shell SecurityPage already has this ✅
// Ensure auth-mfe has same validation
```

---

### 10. **Database Credentials Management**

**Severity**: 🟡 MEDIUM  
**CVSS Score**: 6.5 (Medium)

**Issue**: Plain-text passwords in .env files (even if gitignored).

**Remediation**:

- Use secrets manager (covered in #1)
- Rotate credentials regularly
- Use IAM authentication where possible

---

## 🟢 LOW SEVERITY (Best Practices)

### 11. **Missing HTTPS Enforcement**

**Remediation**:

```typescript
// Production middleware
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

---

### 12. **No Session Absolute Timeout**

**Issue**: HttpOnly cookies persist indefinitely until logout.

**Remediation**:

```typescript
// apps/auth-service - when setting cookies
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days absolute timeout
});
```

---

### 13. **Verbose Error Messages**

**Issue**: Some errors may leak implementation details in production.

**Remediation**:

```typescript
// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);

    const message =
      process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message;

    res.status(err.status || 500).json({ error: message });
  }
);
```

---

## ✅ SECURITY STRENGTHS (Already Implemented)

1. ✅ **bcrypt password hashing** (12 rounds) - Industry standard
2. ✅ **JWT with short expiration** (15 min) - Limits token lifetime
3. ✅ **Refresh token rotation** - Prevents token reuse
4. ✅ **HttpOnly cookies for tokens** - XSS protection
5. ✅ **Parameterized SQL queries** (Prisma) - SQL injection prevention
6. ✅ **Zod input validation** - Type safety
7. ✅ **SameSite cookie protection** - CSRF mitigation
8. ✅ **TypeScript strict mode** - Type safety
9. ✅ **Rate limiting infrastructure** - Redis-based
10. ✅ **Token blacklisting on logout** - Session invalidation

---

## 📋 PRIORITIZED ACTION PLAN

### 🚨 IMMEDIATE (Next 1-2 Hours) - CRITICAL

**Priority 1: Stop the Bleeding**

- [ ] **Rotate OpenAI API key** at https://platform.openai.com/api-keys
- [ ] **Generate new JWT secrets** using crypto.randomBytes(32)
- [ ] **Remove .env files from git history** using git filter-branch
- [ ] **Fix CORS wildcard** in auth-service/src/main.ts

**Commands**:

```bash
# Generate new secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Store securely (NOT in repo)
# Update all services with new secrets
```

---

### ⚡ TODAY (Next 4-6 Hours) - HIGH

**Priority 2: Essential Security**

- [ ] **Install Helmet.js** in all services
- [ ] **Fix rate limit values** (1000 → 5 for production)
- [ ] **Add request size limits** (10kb)
- [ ] **Create .env.example templates** (remove real .env files)
- [ ] **Audit frontend for localStorage token usage**

**Commands**:

```bash
npm install helmet
# Then apply helmet configuration to all services
```

---

### 📅 THIS WEEK (Sprint Items) - MEDIUM

**Priority 3: Comprehensive Protection**

- [ ] **Implement input sanitization** (DOMPurify)
- [ ] **Add security event logging** (Winston)
- [ ] **Document HttpOnly cookie implementation** (fix localStorage references)
- [ ] **Add frontend password validation**
- [ ] **Test all security fixes**

---

### 🎯 BEFORE PRODUCTION (Must-Have) - LOW + FINAL

**Priority 4: Production Readiness**

- [ ] **Set up secrets manager** (AWS/GCP/Azure)
- [ ] **Add HTTPS enforcement middleware**
- [ ] **Implement session absolute timeout**
- [ ] **Generic error messages in production**
- [ ] **Security audit with OWASP ZAP**
- [ ] **Penetration testing**
- [ ] **Review all CORS configurations**
- [ ] **Load testing with k6**

---

## 🧪 TESTING & VERIFICATION

### Security Test Checklist

**Authentication**:

- [ ] Test brute-force protection (rate limits)
- [ ] Verify token expiration
- [ ] Test token blacklisting
- [ ] Verify HttpOnly cookie security (F12 → Application)
- [ ] Test CSRF protection
- [ ] Verify password complexity requirements

**CORS**:

- [ ] Test allowed origins
- [ ] Verify rejected origins logged
- [ ] Test credentials with CORS
- [ ] Verify preflight requests

**Headers**:

- [ ] Verify CSP headers present
- [ ] Test X-Frame-Options
- [ ] Verify HSTS in production
- [ ] Test X-Content-Type-Options

**Input Validation**:

- [ ] Test XSS payloads (sanitized)
- [ ] Test SQL injection attempts (blocked by Prisma)
- [ ] Test oversized requests (rejected)
- [ ] Verify Zod validation errors

**Tools**:

```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000

# npm audit
npm audit --audit-level=moderate

# Dependency check
npx snyk test

# Check secrets in repo
git secrets --scan-history
```

---

## 📊 COMPLIANCE CHECKLIST

### OWASP Top 10 (2021)

- [x] **A01: Broken Access Control** - JWT + RBAC implemented
- [ ] **A02: Cryptographic Failures** - ⚠️ Exposed secrets (CRITICAL)
- [x] **A03: Injection** - Prisma ORM prevents SQL injection
- [ ] **A04: Insecure Design** - ⚠️ CORS misconfiguration (CRITICAL)
- [ ] **A05: Security Misconfiguration** - ⚠️ Missing security headers (HIGH)
- [x] **A06: Vulnerable Components** - npm audit clean
- [x] **A07: Authentication Failures** - bcrypt + JWT + rate limiting
- [x] **A08: Software/Data Integrity** - Git + code review
- [ ] **A09: Logging Failures** - ⚠️ Insufficient security logging (MEDIUM)
- [x] **A10: SSRF** - No external fetches from user input

**Score**: 6/10 implemented, 4/10 need attention

---

## 📝 NOTES & RECOMMENDATIONS

### Additional Security Measures (Post-Launch)

1. **Web Application Firewall (WAF)**
   - AWS WAF / Cloudflare
   - DDoS protection
   - Bot mitigation

2. **Security Monitoring**
   - Sentry for error tracking
   - Datadog for APM
   - CloudWatch for infrastructure

3. **Compliance**
   - GDPR compliance (data privacy)
   - SOC 2 Type II (if enterprise)
   - PCI-DSS (if handling payments)

4. **Bug Bounty Program**
   - HackerOne or Bugcrowd
   - Responsible disclosure policy

5. **Regular Security Audits**
   - Quarterly automated scans
   - Annual penetration testing
   - Dependency updates (Dependabot)

---

## 🔗 REFERENCES

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📧 CONTACT

**Security Issues**: Report to project maintainer immediately  
**Next Audit**: Scheduled for 3 months post-launch  
**Security Champion**: TBD

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2025  
**Next Review**: Before production deployment

---

## ⚠️ DISCLAIMER

This audit is based on code review and static analysis. Dynamic testing (penetration testing) is required before production deployment. This document does not guarantee security - it identifies known vulnerabilities at the time of audit.

**Remember**: Security is a continuous process, not a one-time fix.
