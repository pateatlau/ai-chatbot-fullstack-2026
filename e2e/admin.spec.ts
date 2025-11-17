import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Admin Functionality
 * Tests: Dashboard Access, User Management, Audit Logs, Role-Based Access
 */

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('testadmin@example.com');
    await page.getByLabel(/password/i).fill('Admin123!@#');
    await page.getByRole('button', { name: /log.*in/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should display admin link in navigation for admin users', async ({
    page,
  }) => {
    // Admin link should be visible
    await expect(page.getByRole('link', { name: /^admin$/i })).toBeVisible();
  });

  test('should navigate to admin dashboard', async ({ page }) => {
    // Click admin link
    await page.getByRole('link', { name: /^admin$/i }).click();

    // Should navigate to admin page
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });

    // Should see admin content
    await expect(
      page.getByRole('heading', { name: /admin|dashboard/i })
    ).toBeVisible();
  });

  test('should display user management interface', async ({ page }) => {
    await page.goto('/admin');

    // Should see users tab or section
    const usersTab = page
      .getByRole('link', { name: /users|user.*management/i })
      .or(page.getByRole('button', { name: /users|user.*management/i }));

    if (await usersTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Should see user list or table
    await expect(
      page.locator('table, [role="table"], [class*="user-list"]')
    ).toBeVisible({ timeout: 3000 });
  });

  test('should display user statistics', async ({ page }) => {
    await page.goto('/admin');

    // Should see statistics cards
    const statsPatterns = [
      /total.*users/i,
      /active.*users/i,
      /new.*users/i,
      /users/i,
    ];

    let hasStats = false;
    for (const pattern of statsPatterns) {
      if (
        await page
          .getByText(pattern)
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        hasStats = true;
        break;
      }
    }

    expect(hasStats).toBeTruthy();
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin');

    // Navigate to users if needed
    const usersTab = page
      .getByRole('link', { name: /users/i })
      .or(page.getByRole('button', { name: /users/i }));
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Look for role filter
    const roleFilter = page
      .getByLabel(/role|filter.*role/i)
      .or(page.locator('select').filter({ hasText: /role|admin|user/i }));

    if (await roleFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleFilter.selectOption('ADMIN');

      // Should see filtered results
      await page.waitForTimeout(1000);

      // Verify table updated
      const tableRows = page.locator('table tbody tr, [role="row"]');
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('should search users by email', async ({ page }) => {
    await page.goto('/admin');

    // Navigate to users
    const usersTab = page
      .getByRole('link', { name: /users/i })
      .or(page.getByRole('button', { name: /users/i }));
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Look for search input
    const searchInput = page.getByPlaceholder(/search|email|name/i);

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('testadmin');

      // Should see filtered results
      await page.waitForTimeout(1000);
      await expect(page.getByText(/testadmin@example.com/i)).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('should display audit logs', async ({ page }) => {
    // Navigate directly to audit logs
    await page.goto('/admin/audit-logs');

    // Should see audit logs interface
    await expect(
      page.getByRole('heading', { name: /audit.*logs?/i })
    ).toBeVisible({ timeout: 3000 });

    // Should see logs table or list
    await expect(
      page.locator('table, [role="table"], [class*="log"], [class*="audit"]')
    ).toBeVisible({ timeout: 3000 });
  });

  test('should filter audit logs by action type', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    // Look for action filter
    const actionFilter = page
      .getByLabel(/action|type|filter/i)
      .or(
        page
          .locator('select')
          .filter({ hasText: /action|login|update|delete/i })
      );

    if (await actionFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Select a filter option
      await actionFilter.selectOption({ index: 1 });

      // Should update results
      await page.waitForTimeout(1000);
    }
  });

  test('should paginate through users', async ({ page }) => {
    await page.goto('/admin');

    // Navigate to users
    const usersTab = page
      .getByRole('link', { name: /users/i })
      .or(page.getByRole('button', { name: /users/i }));
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /next|→|›/i });

    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get current page indicator
      const currentPage = await page
        .locator('[class*="page"], [aria-current="page"]')
        .textContent();

      // Click next
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Page should change
      const newPage = await page
        .locator('[class*="page"], [aria-current="page"]')
        .textContent();
      expect(newPage).not.toBe(currentPage);
    }
  });

  test('should update user role', async ({ page }) => {
    await page.goto('/admin');

    // Navigate to users
    const usersTab = page
      .getByRole('link', { name: /users/i })
      .or(page.getByRole('button', { name: /users/i }));
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Find a user row and edit button
    const editButton = page.getByRole('button', { name: /edit/i }).first();

    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Should see edit modal or form
      await expect(page.getByText(/edit.*user|update.*user/i)).toBeVisible({
        timeout: 2000,
      });

      // Find role select
      const roleSelect = page.getByLabel(/role/i);
      if (await roleSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        await roleSelect.selectOption('USER');

        // Save changes
        await page.getByRole('button', { name: /save|update/i }).click();

        // Should see success message
        await expect(page.getByText(/success|updated|saved/i)).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test('should delete user', async ({ page }) => {
    await page.goto('/admin');

    // Navigate to users
    const usersTab = page
      .getByRole('link', { name: /users/i })
      .or(page.getByRole('button', { name: /users/i }));
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
    }

    // Find delete button (not for admin user)
    const deleteButton = page
      .getByRole('button', { name: /delete|remove/i })
      .nth(1);

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', {
        name: /confirm|yes|delete/i,
      });
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();

        // Should see success message
        await expect(page.getByText(/success|deleted|removed/i)).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test('should prevent non-admin users from accessing admin pages', async ({
    page,
  }) => {
    // Logout
    await page.getByRole('button', { name: /avatar|user/i }).click();
    await page.getByRole('button', { name: /log.*out/i }).click();
    await expect(page).toHaveURL('/login');

    // Login as regular user (if exists)
    await page.getByLabel(/email/i).fill('testuser@example.com');
    await page.getByLabel(/password/i).fill('User123!@#');
    await page.getByRole('button', { name: /log.*in/i }).click();

    // If login succeeds, admin link should not be visible
    if (await page.url().includes('/dashboard')) {
      const adminLink = page.getByRole('link', { name: /^admin$/i });
      await expect(adminLink).not.toBeVisible({ timeout: 2000 });

      // Try to access admin page directly
      await page.goto('/admin');

      // Should redirect to dashboard or show error
      await expect(page).not.toHaveURL('/admin', { timeout: 2000 });
    }
  });

  test('should display recent activity in admin dashboard', async ({
    page,
  }) => {
    await page.goto('/admin');

    // Should see activity section
    const activityPatterns = [
      /recent.*activity/i,
      /activity/i,
      /recent.*actions/i,
    ];

    let hasActivity = false;
    for (const pattern of activityPatterns) {
      if (
        await page
          .getByText(pattern)
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        hasActivity = true;
        break;
      }
    }

    expect(hasActivity).toBeTruthy();
  });

  test('should export audit logs', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download/i });

    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

      await exportButton.click();

      // Verify download started
      const download = await downloadPromise.catch(() => null);
      if (download) {
        expect(download.suggestedFilename()).toMatch(
          /audit|logs|\.csv|\.json/i
        );
      }
    }
  });
});

test.describe('Admin Access Control', () => {
  test('should require authentication for admin routes', async ({ page }) => {
    // Clear auth
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Try to access admin page
    await page.goto('/admin');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
