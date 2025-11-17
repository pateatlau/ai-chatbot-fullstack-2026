import { test, expect } from '@playwright/test';
import { login, logout, clearAuth, getAuthToken } from './helpers';

/**
 * E2E Tests for Authentication Flow
 * Tests: Login, Registration, Token Management, Protected Routes
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login page for unauthenticated users', async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(
      page.locator('h1, h2').filter({ hasText: /log.*in/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /log.*in|sign.*in/i })
    ).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /log.*in/i }).click();

    // Should see validation errors
    await expect(page.getByText(/email.*required/i)).toBeVisible();
    await expect(page.getByText(/password.*required/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await login(page);

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|$)/, { timeout: 10000 });

    // Token should be stored in localStorage
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');

    // Submit form
    await page.getByRole('button', { name: /log.*in/i }).click();

    // Should see error message
    await expect(
      page.getByText(
        /invalid.*credentials|incorrect.*password|authentication.*failed/i
      )
    ).toBeVisible({ timeout: 5000 });

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page);
    await expect(page).toHaveURL(/\/(dashboard|$)/, { timeout: 10000 });

    // Logout
    await logout(page);

    // Token should be removed from localStorage
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });

  test('should redirect to login when accessing protected route without auth', async ({
    page,
  }) => {
    // Clear any existing tokens
    await clearAuth(page);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('should allow navigation to register page', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page
      .getByRole('link', { name: /register|sign.*up|create.*account/i })
      .click();

    // Should navigate to register page
    await expect(page).toHaveURL('/register');
    await expect(
      page.locator('h1, h2').filter({ hasText: /register|sign.*up/i })
    ).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Generate unique email
    const uniqueEmail = `testuser${Date.now()}@example.com`;

    // Fill in registration form
    await page.getByLabel(/name|full.*name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/^password/i).fill('Test123!@#');
    await page.getByLabel(/confirm.*password/i).fill('Test123!@#');

    // Submit form
    await page
      .getByRole('button', { name: /register|sign.*up|create/i })
      .click();

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 10000 });
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/register');

    // Type weak password
    await page.getByLabel(/^password/i).fill('weak');

    // Should show strength indicator
    await expect(page.getByText(/weak|strength|strong/i)).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({
    page,
  }) => {
    // Login
    await login(page);
    await expect(page).toHaveURL(/\/(dashboard|$)/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be authenticated - not redirected to login
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL('/login');

    // Token should still be in localStorage
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();
  });
});
