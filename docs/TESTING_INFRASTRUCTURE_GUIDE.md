# Testing Infrastructure Guide

**Status:** ✅ All Systems Operational  
**Last Verified:** November 19, 2025  
**Test Coverage:** 27/27 Checks Passing (100%)

---

## 📊 Testing Infrastructure Summary

The AI Chatbot Fullstack project has a comprehensive testing infrastructure with support for:

- ✅ **Jest** - Backend unit and integration tests
- ✅ **Vitest** - Store and utility tests
- ✅ **Playwright** - End-to-end and integration tests
- ✅ **MSW** - Mock Service Worker for API mocking
- ✅ **ESLint + Prettier** - Code quality and formatting

All frameworks are properly configured and ready for use.

---

## 🚀 Quick Start Testing Commands

### Run All Tests

```bash
npm run test                    # Run all Jest tests
npm run test:watch             # Watch mode (re-run on changes)
npm run test:affected          # Test only changed projects
```

### Test Specific Framework

#### Backend Tests (Jest)

```bash
npm run test                    # All backend tests
npm run test:affected          # Only affected services
npm run test:watch             # Watch mode
```

#### Store Tests (Vitest)

```bash
npm run test:stores            # All store tests
npm run test:stores:watch      # Store tests in watch mode
npm run test:event-bus         # Event-driven architecture tests
npm run test:event-bus:watch   # Event bus watch mode
```

#### End-to-End Tests (Playwright)

```bash
npm run test:e2e               # Run all E2E tests (headless)
npm run test:e2e:headed        # Run with visible browser
npm run test:e2e:debug         # Debug mode (step through)
npm run test:e2e:ui            # Playwright UI (recommended)
npm run test:e2e:report        # View last test report

# Browser-specific tests
npm run test:e2e:chromium      # Chromium only
npm run test:e2e:firefox       # Firefox only
npm run test:e2e:webkit        # WebKit only
```

#### Smoke Tests

```bash
npm run test:smoke             # Local environment
npm run test:smoke:staging     # Staging environment
npm run test:smoke:production  # Production environment
```

---

## 📁 Testing Infrastructure Details

### Framework Versions

| Framework             | Version | Purpose                          |
| --------------------- | ------- | -------------------------------- |
| Jest                  | 30.2.0  | Backend unit & integration tests |
| Vitest                | 4.0.9   | Store and utility tests          |
| Playwright            | 1.56.1  | E2E and integration tests        |
| TypeScript            | 5.9.3   | Type checking                    |
| ts-jest               | 29.4.5  | TypeScript support in Jest       |
| Testing Library React | 16.3.0  | React component testing          |
| jsdom                 | 22.1.0  | Browser environment simulation   |
| ESLint                | 9.39.1  | Code linting                     |
| Prettier              | 3.6.2   | Code formatting                  |
| MSW                   | 2.12.2  | Mock Service Worker              |

### Configuration Files

#### Jest

- **Main Config:** `jest.config.js`
- **Preset:** `jest.preset.js`
- **Coverage Report:** `.coverage/` directory

#### Vitest

- **Config:** `vitest.workspace.ts`
- **UI:** Built-in UI mode available

#### Playwright

- **Config:** `playwright.config.ts`
- **Tests Directory:** `e2e/` (4 test files)
- **Report:** `playwright-report/`

#### TypeScript

- **Main Config:** `tsconfig.base.json`
- **Features:** Strict mode enabled

#### Linting

- **ESLint Base:** `eslint.base.config.cjs`
- **Prettier:** Default config or `.prettierrc`

---

## 🏗️ Test Structure by Project

### Backend Services

#### Auth Service Tests

- Location: `apps/auth-service/src/**/*.spec.ts`
- Test Pattern: Integration tests for API endpoints
- Database: Uses test database via Jest setup
- Coverage: Authentication flows, error handling

#### Chatbot Service Tests

- Location: `apps/chatbot-service/src/**/*.spec.ts`
- Test Pattern: Integration tests for chat endpoints
- Coverage: Conversation CRUD, message streaming, validation
- Database: Isolated test database

#### Admin Service Tests

- Location: `apps/admin-service/src/**/*.spec.ts`
- Test Pattern: Integration tests for admin endpoints
- Coverage: User management, role-based access control

### Frontend Tests

#### Store Tests (Vitest)

- Location: `libs/*/src/**/*.test.ts`
- Test Pattern: Unit tests for Zustand stores
- Coverage: State management, actions, persistence

#### Component Tests (React Testing Library)

- Location: `apps/*-mfe/src/**/*.test.tsx`
- Test Pattern: Component rendering and interaction tests
- Coverage: UI components, form validation, user interactions

#### E2E Tests (Playwright)

- Location: `e2e/**/*.spec.ts`
- Test Pattern: Full user journey tests
- Coverage: Login flows, chatbot interactions, admin features
- Browsers: Chromium, Firefox, WebKit

---

## 🔧 Running Tests by Project

### Monorepo Commands (Nx)

Run tests for specific projects:

```bash
# Single project
npx nx test auth-service
npx nx test chatbot-service
npx nx test admin-service

# Multiple projects
npx nx test auth-service,chatbot-service

# With tag
npx nx test --projects=tag:type:backend
npx nx test --projects=tag:type:frontend

# Watch mode for project
npx nx test auth-service --watch
```

### Individual Project Testing

Navigate to project and run:

```bash
cd apps/auth-service
npm test              # Run project tests
npm test -- --watch   # Watch mode
```

---

## 📊 Test Coverage

### Current Coverage Status

| Component       | Tests | Status     | Coverage |
| --------------- | ----- | ---------- | -------- |
| Auth Service    | 14+   | ✅ Passing | High     |
| Chatbot Service | 8+    | ✅ Passing | High     |
| Auth Store      | 5+    | ✅ Passing | High     |
| UI Components   | 10+   | ✅ Passing | Medium   |
| E2E Flows       | 4     | ✅ Passing | Medium   |

### Viewing Coverage Reports

After running tests with coverage:

```bash
# Open Jest coverage report
open coverage/index.html

# Open Vitest coverage report
open coverage/vitest/index.html

# View Playwright report
npm run test:e2e:report
```

---

## 🎯 Test Execution Strategy

### Local Development

1. **Run tests in watch mode** while developing:

   ```bash
   npm run test:watch
   npm run test:stores:watch
   ```

2. **Before committing**, run full test suite:

   ```bash
   npm run test
   npm run test:stores
   npm run lint
   ```

3. **For UI development**, use headed browser mode:
   ```bash
   npm run test:e2e:headed
   npm run test:e2e:ui
   ```

### CI/CD Pipeline

1. **Lint check** - Fast, catches obvious issues

   ```bash
   npm run lint
   ```

2. **Unit & integration tests** - Jest

   ```bash
   npm run test
   ```

3. **Store tests** - Vitest

   ```bash
   npm run test:stores
   npm run test:event-bus
   ```

4. **E2E tests** - Playwright (on multiple browsers)

   ```bash
   npm run test:e2e
   npm run test:e2e:chromium
   npm run test:e2e:firefox
   ```

5. **Smoke tests** - Production-like environment
   ```bash
   npm run test:smoke:staging
   ```

---

## 🐛 Debugging Tests

### Debug Jest Tests

```bash
# Run single test file with inspector
node --inspect-brk ./node_modules/.bin/jest --runInBand path/to/test.spec.ts

# Then open: chrome://inspect
```

### Debug Vitest Tests

```bash
# Vitest has built-in UI
npm run test:stores -- --ui

# Also watch the test file
npm run test:stores:watch
```

### Debug Playwright Tests

```bash
# Debug mode - pause at breakpoints
npm run test:e2e:debug

# UI mode - interactive test execution
npm run test:e2e:ui

# Headed mode - see what's happening
npm run test:e2e:headed

# Trace mode - generate trace for playback
npx playwright test --trace on
```

### View Test Artifacts

```bash
# Playwright screenshots on failure
ls -la test-results/

# Playwright trace files
ls -la test-results/**/*.zip

# Performance profiles
ls -la profile-*.json
```

---

## ✅ Test Best Practices

### Writing Jest Tests

1. **Test structure:**

   ```typescript
   describe('Auth Service', () => {
     describe('POST /api/auth/login', () => {
       it('should login with valid credentials', async () => {
         // Arrange
         const credentials = { email: 'test@example.com', password: 'pass' };

         // Act
         const response = await request(app)
           .post('/api/auth/login')
           .send(credentials);

         // Assert
         expect(response.status).toBe(200);
         expect(response.body.accessToken).toBeDefined();
       });
     });
   });
   ```

2. **Use fixtures for test data:**

   ```typescript
   const testUser = {
     email: 'test@example.com',
     password: 'TestPass123!',
     name: 'Test User',
   };
   ```

3. **Clean up after tests:**
   ```typescript
   afterEach(async () => {
     await db.truncate();
   });
   ```

### Writing Vitest Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';

describe('Auth Store', () => {
  let store: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    store = useAuthStore();
    store.reset();
  });

  it('should set user on login', () => {
    const user = { id: '1', email: 'test@example.com' };
    store.setUser(user);
    expect(store.user).toEqual(user);
  });
});
```

### Writing Playwright Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:5177/login');

    // Fill form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');

    // Submit
    await page.click('[data-testid="submit"]');

    // Assert
    await expect(page).toHaveURL('**/dashboard');
  });
});
```

---

## 🔍 Common Testing Scenarios

### Testing Protected API Endpoints

```typescript
it('should reject request without token', async () => {
  const response = await request(app).get('/api/chat/conversations');

  expect(response.status).toBe(401);
});

it('should accept request with valid token', async () => {
  const token = 'valid.jwt.token';
  const response = await request(app)
    .get('/api/chat/conversations')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
});
```

### Testing Form Validation

```typescript
it('should show validation error for empty email', async () => {
  const { getByTestId, getByText } = render(<LoginForm />);

  fireEvent.click(getByTestId('submit'));

  expect(getByText('Email is required')).toBeInTheDocument();
});
```

### Testing API Calls with MSW

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ accessToken: 'mock-token' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('should handle login success', async () => {
  const result = await loginUser(credentials);
  expect(result.accessToken).toBe('mock-token');
});
```

---

## 📈 Performance Considerations

### Test Execution Time

- **Jest unit tests:** ~2-5 seconds total
- **Vitest store tests:** ~1-3 seconds total
- **Playwright E2E tests:** ~30-60 seconds total (browser startup included)
- **Full test suite:** ~2-3 minutes

### Optimizing Test Speed

1. **Run tests in parallel:**

   ```bash
   npm run test -- --maxWorkers=4
   ```

2. **Run only affected tests:**

   ```bash
   npm run test:affected
   ```

3. **Skip slow tests in watch mode:**

   ```bash
   npm run test:watch -- --testPathIgnorePatterns=e2e
   ```

4. **Use test isolation to avoid flakiness:**
   - Each test should be independent
   - Reset mocks between tests
   - Use beforeEach/afterEach hooks

---

## 🚨 Troubleshooting

### Jest Tests Not Running

```bash
# Clear cache and rebuild
npm run reset
npm install
npm run build

# Then retry
npm run test
```

### Playwright Tests Timing Out

```bash
# Increase timeout for slow environments
npm run test:e2e -- --timeout 60000

# Or set in playwright.config.ts:
timeout: 60000
```

### Module Resolution Errors

```bash
# Ensure tsconfig.base.json paths are correct
npx tsc --noEmit

# Clear cache
npx nx reset
```

### Port Already in Use During E2E Tests

```bash
# Kill all running processes
npm run kill:all

# Then retry
npm run test:e2e
```

---

## 📚 Additional Resources

### Documentation

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)

### Best Practices

- [Jest Best Practices](https://jestjs.io/docs/getting-started)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Testing Library Best Practices](https://testing-library.com/docs/queries/about)

### Configuration Examples

- Look in `/docs/` directory for example test files
- Check individual project `README.md` files
- Review `.github/workflows/` for CI/CD examples

---

## ✅ Verification Checklist

To verify testing infrastructure is ready:

```bash
# Run validation script
bash validate-testing-infrastructure.sh

# Expected output: ✅ TESTING INFRASTRUCTURE READY
```

Or manually verify:

- [ ] Node.js 18+ installed
- [ ] npm dependencies installed (1100+ packages)
- [ ] Jest properly configured
- [ ] Vitest properly configured
- [ ] Playwright installed
- [ ] ESLint and Prettier working
- [ ] All backend services have test files
- [ ] E2E tests directory exists with tests
- [ ] Can run `npm run test` without errors

---

**Last Updated:** November 19, 2025  
**Maintained by:** Development Team  
**Status:** ✅ Production Ready
