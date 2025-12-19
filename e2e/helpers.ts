import { Page } from '@playwright/test';

/**
 * Test utility functions for E2E tests
 */

/**
 * Login helper function
 */
export async function login(
  page: Page,
  email: string = 'testadmin@example.com',
  password: string = 'Admin123!@#'
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log.*in|sign.*in/i }).click();

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|$)/, { timeout: 10000 });
}

/**
 * Logout helper function
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: /avatar|user|account/i }).click();
  await page.getByRole('button', { name: /log.*out|sign.*out/i }).click();

  // Wait for redirect
  await page.waitForTimeout(1000);
}

/**
 * Clear authentication
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get auth token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('token'));
}

/**
 * Set auth token in localStorage
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate((t) => localStorage.setItem('token', t), token);
}

/**
 * Wait for element with retry
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}
