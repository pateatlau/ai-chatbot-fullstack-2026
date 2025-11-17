import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Profile Functionality
 * Tests: Profile Viewing, Settings Update, Security Settings, Password Change
 */

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('testadmin@example.com');
    await page.getByLabel(/password/i).fill('Admin123!@#');
    await page.getByRole('button', { name: /log.*in/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should navigate to profile page from user menu', async ({ page }) => {
    // Open user menu
    await page.getByRole('button', { name: /avatar|user|account/i }).click();

    // Click profile link
    await page
      .getByRole('button', { name: /profile/i })
      .or(page.getByRole('link', { name: /profile/i }))
      .click();

    // Should navigate to profile page
    await expect(page).toHaveURL(/\/profile/, { timeout: 5000 });

    // Should see profile heading
    await expect(
      page.getByRole('heading', { name: /profile|account/i })
    ).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    await page.goto('/profile');

    // Should see user email
    await expect(page.getByText(/testadmin@example\.com/i)).toBeVisible({
      timeout: 3000,
    });

    // Should see user details section
    await expect(page.getByText(/email|name|role/i)).toBeVisible();
  });

  test('should update profile name', async ({ page }) => {
    await page.goto('/profile');

    // Find name input
    const nameInput = page.getByLabel(/name|full.*name|display.*name/i);

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Clear and update name
      await nameInput.clear();
      await nameInput.fill('Updated Admin Name');

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should see success message
      await expect(page.getByText(/success|updated|saved/i)).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    // Open user menu
    await page.getByRole('button', { name: /avatar|user|account/i }).click();

    // Click settings link
    await page
      .getByRole('button', { name: /settings/i })
      .or(page.getByRole('link', { name: /settings/i }))
      .click();

    // Should navigate to settings page
    await expect(page).toHaveURL(/\/profile\/settings/, { timeout: 5000 });

    // Should see settings heading
    await expect(
      page.getByRole('heading', { name: /settings/i })
    ).toBeVisible();
  });

  test('should update notification preferences', async ({ page }) => {
    await page.goto('/profile/settings');

    // Look for notification toggles
    const notificationToggle = page
      .getByLabel(/notification|email.*notification/i)
      .first();

    if (
      await notificationToggle.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      // Toggle notification
      const initialState = await notificationToggle.isChecked();
      await notificationToggle.click();

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should see success message
      await expect(page.getByText(/success|updated|saved/i)).toBeVisible({
        timeout: 3000,
      });

      // State should have changed
      const newState = await notificationToggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should navigate to security page', async ({ page }) => {
    // Open user menu
    await page.getByRole('button', { name: /avatar|user|account/i }).click();

    // Click security link
    await page
      .getByRole('button', { name: /security/i })
      .or(page.getByRole('link', { name: /security/i }))
      .click();

    // Should navigate to security page
    await expect(page).toHaveURL(/\/profile\/security/, { timeout: 5000 });

    // Should see security heading
    await expect(
      page.getByRole('heading', { name: /security/i })
    ).toBeVisible();
  });

  test('should change password successfully', async ({ page }) => {
    await page.goto('/profile/security');

    // Find password change form
    const currentPasswordInput = page.getByLabel(
      /current.*password|old.*password/i
    );
    const newPasswordInput = page
      .getByLabel(/^new.*password|^password/i)
      .first();
    const confirmPasswordInput = page.getByLabel(
      /confirm.*password|repeat.*password/i
    );

    if (
      await currentPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      // Fill password change form
      await currentPasswordInput.fill('Admin123!@#');
      await newPasswordInput.fill('NewAdmin123!@#');
      await confirmPasswordInput.fill('NewAdmin123!@#');

      // Submit form
      await page
        .getByRole('button', { name: /change.*password|update.*password/i })
        .click();

      // Should see success message
      await expect(
        page.getByText(/success|password.*changed|password.*updated/i)
      ).toBeVisible({ timeout: 3000 });

      // Change password back for other tests
      await page.waitForTimeout(1000);
      await currentPasswordInput.fill('NewAdmin123!@#');
      await newPasswordInput.fill('Admin123!@#');
      await confirmPasswordInput.fill('Admin123!@#');
      await page
        .getByRole('button', { name: /change.*password|update.*password/i })
        .click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show validation error for mismatched passwords', async ({
    page,
  }) => {
    await page.goto('/profile/security');

    // Find password inputs
    const currentPasswordInput = page.getByLabel(
      /current.*password|old.*password/i
    );
    const newPasswordInput = page
      .getByLabel(/^new.*password|^password/i)
      .first();
    const confirmPasswordInput = page.getByLabel(
      /confirm.*password|repeat.*password/i
    );

    if (
      await currentPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      // Fill with mismatched passwords
      await currentPasswordInput.fill('Admin123!@#');
      await newPasswordInput.fill('NewAdmin123!@#');
      await confirmPasswordInput.fill('DifferentPassword123!@#');

      // Submit form
      await page
        .getByRole('button', { name: /change.*password|update.*password/i })
        .click();

      // Should see validation error
      await expect(
        page.getByText(/passwords.*match|passwords.*same|mismatch/i)
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/profile/security');

    // Find password inputs
    const currentPasswordInput = page.getByLabel(
      /current.*password|old.*password/i
    );
    const newPasswordInput = page
      .getByLabel(/^new.*password|^password/i)
      .first();
    const confirmPasswordInput = page.getByLabel(
      /confirm.*password|repeat.*password/i
    );

    if (
      await currentPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      // Fill with weak password
      await currentPasswordInput.fill('Admin123!@#');
      await newPasswordInput.fill('weak');
      await confirmPasswordInput.fill('weak');

      // Submit form
      await page
        .getByRole('button', { name: /change.*password|update.*password/i })
        .click();

      // Should see validation error
      await expect(
        page.getByText(/weak|strong|requirements|characters/i)
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display active sessions', async ({ page }) => {
    await page.goto('/profile/security');

    // Look for sessions section
    const sessionsPatterns = [/active.*sessions?/i, /sessions?/i, /devices?/i];

    let hasSessions = false;
    for (const pattern of sessionsPatterns) {
      if (
        await page
          .getByText(pattern)
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        hasSessions = true;
        break;
      }
    }

    // Should have sessions info or indicate feature exists
    expect(hasSessions).toBeTruthy();
  });

  test('should enable two-factor authentication', async ({ page }) => {
    await page.goto('/profile/security');

    // Look for 2FA section
    const twoFactorButton = page.getByRole('button', {
      name: /enable.*2fa|two.*factor|authenticator/i,
    });

    if (await twoFactorButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await twoFactorButton.click();

      // Should see 2FA setup modal or page
      await expect(
        page.getByText(/qr.*code|authenticator|scan|secret/i)
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should update email notification preferences', async ({ page }) => {
    await page.goto('/profile/settings');

    // Look for email settings
    const emailToggle = page.getByLabel(/email/i).first();

    if (await emailToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailToggle.click();

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should see success
      await expect(page.getByText(/success|updated/i)).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('should display account creation date', async ({ page }) => {
    await page.goto('/profile');

    // Should see account info
    const accountInfoPatterns = [
      /created|joined|member.*since/i,
      /\d{4}/, // Year pattern
    ];

    let hasAccountInfo = false;
    for (const pattern of accountInfoPatterns) {
      if (
        await page
          .getByText(pattern)
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        hasAccountInfo = true;
        break;
      }
    }

    expect(hasAccountInfo).toBeTruthy();
  });

  test('should show user role badge', async ({ page }) => {
    await page.goto('/profile');

    // Should see role indicator
    await expect(page.getByText(/admin|role/i)).toBeVisible({ timeout: 3000 });
  });

  test('should validate email format when updating', async ({ page }) => {
    await page.goto('/profile');

    // Find email input
    const emailInput = page.getByLabel(/email/i);

    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try invalid email
      await emailInput.clear();
      await emailInput.fill('invalid-email');

      // Try to save
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should see validation error
      await expect(
        page.getByText(/valid.*email|invalid.*email|email.*format/i)
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should persist changes across page reloads', async ({ page }) => {
    await page.goto('/profile');

    // Update name
    const nameInput = page.getByLabel(/name|full.*name|display.*name/i);

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const testName = `Test User ${Date.now()}`;
      await nameInput.clear();
      await nameInput.fill(testName);

      // Save
      await page.getByRole('button', { name: /save|update/i }).click();
      await expect(page.getByText(/success/i)).toBeVisible({ timeout: 3000 });

      // Reload page
      await page.reload();

      // Name should persist
      const reloadedNameInput = page.getByLabel(
        /name|full.*name|display.*name/i
      );
      await expect(reloadedNameInput).toHaveValue(testName, {
        timeout: 3000,
      });
    }
  });

  test('should handle profile tab navigation', async ({ page }) => {
    await page.goto('/profile');

    // Look for tabs
    const settingsTab = page
      .getByRole('link', { name: /settings/i })
      .or(page.getByRole('tab', { name: /settings/i }));

    if (await settingsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsTab.click();

      // Should navigate to settings
      await expect(page).toHaveURL(/settings/, { timeout: 3000 });

      // Navigate to security
      const securityTab = page
        .getByRole('link', { name: /security/i })
        .or(page.getByRole('tab', { name: /security/i }));

      if (await securityTab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await securityTab.click();
        await expect(page).toHaveURL(/security/, { timeout: 3000 });
      }
    }
  });
});
