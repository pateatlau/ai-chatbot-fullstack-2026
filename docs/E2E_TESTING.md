# E2E Testing Guide

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Playwright provides reliable, cross-browser testing capabilities to ensure the entire application stack works together correctly.

## Test Coverage

### Test Suites

| Test Suite     | File                  | Tests | Coverage                                                        |
| -------------- | --------------------- | ----- | --------------------------------------------------------------- |
| Authentication | `e2e/auth.spec.ts`    | 10    | Login, registration, logout, protected routes, token management |
| Chatbot        | `e2e/chat.spec.ts`    | 15    | Conversations, messages, streaming, markdown, rate limiting     |
| Admin          | `e2e/admin.spec.ts`   | 14    | User management, audit logs, role-based access, statistics      |
| Profile        | `e2e/profile.spec.ts` | 15    | Profile viewing, settings, security, password changes           |

**Total: 54 E2E tests** covering all major user flows

### Browser Coverage

Tests run on multiple browsers to ensure cross-browser compatibility:

- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## Prerequisites

Before running E2E tests, ensure:

1. **Backend services are running:**

   ```bash
   # Auth Service (port 3000)
   nx serve auth-service

   # Admin Service (port 3002)
   nx serve admin-service

   # Chatbot Service (port 3001)
   nx serve chatbot-service
   ```

2. **Database is set up:**

   ```bash
   cd apps/auth-service
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Frontend shell is running:**

   ```bash
   nx serve shell
   ```

4. **Playwright browsers are installed:**
   ```bash
   npx playwright install
   ```

## Running Tests

### Run All Tests

```bash
# Run all tests on all browsers
npx playwright test

# Run all tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Specific Test Suites

```bash
# Run only authentication tests
npx playwright test e2e/auth.spec.ts

# Run only chatbot tests
npx playwright test e2e/chat.spec.ts

# Run only admin tests
npx playwright test e2e/admin.spec.ts

# Run only profile tests
npx playwright test e2e/profile.spec.ts
```

### Run Tests with Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run with specific number of workers
npx playwright test --workers=2

# Run in debug mode
npx playwright test --debug

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests in UI mode (interactive)
npx playwright test --ui
```

### Generate Test Report

```bash
# Run tests and generate HTML report
npx playwright test

# Open last HTML report
npx playwright show-report
```

## Test Structure

### Test Organization

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';
import { login, logout, clearAuth } from './helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await clearAuth(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.goto('/some-page');
    await expect(page.getByText('Expected')).toBeVisible();
  });
});
```

### Helper Functions

The `e2e/helpers.ts` file provides reusable utilities:

```typescript
// Login helper
await login(page, 'email@example.com', 'password');

// Logout helper
await logout(page);

// Clear authentication
await clearAuth(page);

// Get auth token
const token = await getAuthToken(page);
```

## Configuration

### playwright.config.ts

Key configuration options:

```typescript
{
  testDir: './e2e',           // Test directory
  fullyParallel: true,        // Run tests in parallel
  retries: 2,                 // Retry failed tests (CI only)
  workers: 1,                 // Number of parallel workers (CI)
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',  // Trace on retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
}
```

### Environment Variables

Tests use these environment variables:

- `CI`: Set to `true` in CI/CD pipeline
- `BASE_URL`: Override default base URL (default: `http://localhost:5173`)

## Debugging Tests

### Visual Debugging

```bash
# Run in headed mode
npx playwright test --headed

# Run in debug mode with Playwright Inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test e2e/auth.spec.ts --debug
```

### Using Playwright Inspector

When running with `--debug`:

1. Playwright Inspector opens automatically
2. Use the toolbar to:
   - Step through test actions
   - Inspect locators
   - View console logs
   - Take screenshots
   - Record videos

### Viewing Traces

```bash
# Open trace viewer for failed tests
npx playwright show-trace trace.zip
```

Trace viewer shows:

- Test execution timeline
- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

### Common Debugging Patterns

```typescript
// Add screenshot
await page.screenshot({ path: 'screenshot.png' });

// Add console log listener
page.on('console', (msg) => console.log(msg.text()));

// Pause test execution
await page.pause();

// Wait for specific time (avoid in production)
await page.waitForTimeout(1000);

// Wait for network idle
await page.waitForLoadState('networkidle');
```

## Best Practices

### 1. Use Semantic Selectors

```typescript
// ✅ Good - Uses semantic selectors
await page.getByRole('button', { name: /submit/i });
await page.getByLabel('Email');
await page.getByText('Welcome');

// ❌ Bad - Brittle CSS selectors
await page.locator('.btn-primary');
await page.locator('#email-input');
```

### 2. Wait for Elements

```typescript
// ✅ Good - Explicit wait
await expect(page.getByText('Success')).toBeVisible({ timeout: 5000 });

// ❌ Bad - Hard wait
await page.waitForTimeout(3000);
```

### 3. Use Helper Functions

```typescript
// ✅ Good - Reusable helper
await login(page);

// ❌ Bad - Duplicate code
await page.goto('/login');
await page.getByLabel(/email/i).fill('...');
await page.getByLabel(/password/i).fill('...');
await page.getByRole('button', { name: /login/i }).click();
```

### 4. Test Isolation

```typescript
// ✅ Good - Clean state before each test
test.beforeEach(async ({ page }) => {
  await clearAuth(page);
});

// ❌ Bad - Tests depend on each other
```

### 5. Meaningful Assertions

```typescript
// ✅ Good - Clear assertion
await expect(page).toHaveURL('/dashboard');
await expect(page.getByText('Welcome back')).toBeVisible();

// ❌ Bad - Vague check
expect(page.url()).toContain('dash');
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

Workflow file: `.github/workflows/e2e-tests.yml`

### CI/CD Configuration

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
```

### Viewing CI/CD Results

1. Go to **Actions** tab in GitHub
2. Select the workflow run
3. Download `playwright-report` artifact
4. Extract and open `index.html` in browser

## Troubleshooting

### Tests Fail Locally

**Issue**: Tests pass in CI but fail locally

**Solutions**:

1. Ensure all services are running
2. Clear browser cache: `npx playwright test --project=chromium --headed --browser=chromium --clear-cache`
3. Update Playwright: `npm install -D @playwright/test@latest && npx playwright install`
4. Check database state: Seed data might be missing

### Timeout Errors

**Issue**: `TimeoutError: locator.click: Timeout exceeded`

**Solutions**:

1. Increase timeout: `await element.click({ timeout: 10000 })`
2. Wait for element: `await expect(element).toBeVisible()`
3. Check if service is responding: `curl http://localhost:3000/health`

### Flaky Tests

**Issue**: Tests sometimes pass, sometimes fail

**Solutions**:

1. Add explicit waits: `await expect(element).toBeVisible()`
2. Wait for network: `await page.waitForLoadState('networkidle')`
3. Retry failed tests: Configure in `playwright.config.ts`
4. Use `test.only()` to isolate and debug

### Service Connection Errors

**Issue**: Cannot connect to backend services

**Solutions**:

1. Verify services are running: `lsof -i :3000 -i :3001 -i :3002`
2. Check service logs: `tail -f /tmp/auth-service.log`
3. Restart services
4. Check `.env` files are correct

## Performance

### Test Execution Time

- **All tests (single browser)**: ~3-5 minutes
- **All tests (all browsers)**: ~10-15 minutes
- **CI/CD pipeline**: ~8-12 minutes (includes setup)

### Optimization Tips

1. **Run in parallel**: Use `fullyParallel: true` in config
2. **Use multiple workers**: `npx playwright test --workers=4`
3. **Run critical tests first**: Use `test.describe.parallel()`
4. **Skip non-critical tests in development**: Use `test.skip()`

## Adding New Tests

### 1. Create Test File

```typescript
// e2e/new-feature.spec.ts
import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should work correctly', async ({ page }) => {
    await page.goto('/new-feature');
    await expect(page.getByText('Feature')).toBeVisible();
  });
});
```

### 2. Run New Test

```bash
npx playwright test e2e/new-feature.spec.ts
```

### 3. Update Documentation

Add to this README:

- Test count in coverage table
- Any new helper functions
- Special setup requirements

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Testing Library](https://github.com/testing-library/playwright-testing-library)

## Support

For help with E2E tests:

1. Check this documentation
2. Review test examples in `e2e/` directory
3. Check Playwright documentation
4. Open an issue in the project repository
