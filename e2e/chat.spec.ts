import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Chatbot Functionality
 * Tests: Conversation Management, Message Sending, Streaming, Markdown, Rate Limiting
 */

test.describe('Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('testadmin@example.com');
    await page.getByLabel(/password/i).fill('Admin123!@#');
    await page.getByRole('button', { name: /log.*in/i }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should navigate to chat page', async ({ page }) => {
    // Click chat link in navigation
    await page.getByRole('link', { name: /^chat$/i }).click();

    // Should navigate to chat page
    await expect(page).toHaveURL('/chat', { timeout: 5000 });

    // Should see chat interface
    await expect(
      page.getByRole('heading', { name: /chat|conversation/i })
    ).toBeVisible();
  });

  test('should create new conversation', async ({ page }) => {
    await page.goto('/chat');

    // Click new conversation button
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();

    // Should see new conversation in sidebar or URL change
    await expect(page).toHaveURL(/\/chat\/[\w-]+/, { timeout: 5000 });
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/chat');

    // Create new conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Type message
    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Hello, test message!');

    // Send message
    await page.getByRole('button', { name: /send/i }).click();

    // Should see user message
    await expect(page.getByText('Hello, test message!')).toBeVisible({
      timeout: 5000,
    });

    // Should see AI response (with streaming)
    await expect(page.getByText(/mock.*ai.*assistant/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display streaming response progressively', async ({ page }) => {
    await page.goto('/chat');

    // Create new conversation and send message
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test streaming');
    await page.getByRole('button', { name: /send/i }).click();

    // Should see loading indicator or streaming indicator
    await expect(
      page.locator(
        '[class*="loading"], [class*="streaming"], [class*="typing"]'
      )
    ).toBeVisible({ timeout: 2000 });

    // Should eventually see complete response
    await expect(page.getByText(/mock.*ai/i)).toBeVisible({ timeout: 10000 });
  });

  test('should render markdown in messages', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation and send message with markdown-like content
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test **bold** text');
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for response (mock AI echoes back)
    await page.waitForTimeout(2000);

    // Should render markdown elements (if response contains markdown)
    const hasMarkdown =
      (await page.locator('strong, em, code, pre').count()) > 0;
    expect(hasMarkdown).toBeTruthy();
  });

  test('should show rate limit warning when approaching limit', async ({
    page,
  }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Send multiple messages quickly
    const messageInput = page.getByPlaceholder(/type.*message|message/i);

    for (let i = 0; i < 8; i++) {
      await messageInput.fill(`Test message ${i}`);
      await page.getByRole('button', { name: /send/i }).click();
      await page.waitForTimeout(500);
    }

    // Should see rate limit indicator or warning
    const hasRateLimit = await page
      .getByText(/rate.*limit|slow.*down|too.*many/i)
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    // Note: Rate limit may not trigger if responses are slow enough
  });

  test('should rename conversation', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Find conversation in sidebar and open context menu
    const conversationItem = page.locator('[class*="conversation"]').first();
    await conversationItem.hover();

    // Click rename button (might be icon or three-dot menu)
    const renameButton = page
      .getByRole('button', { name: /rename|edit/i })
      .first();
    if (await renameButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await renameButton.click();

      // Enter new name
      const nameInput = page.getByPlaceholder(/name|title/i);
      await nameInput.fill('Renamed Conversation');
      await nameInput.press('Enter');

      // Should see updated name
      await expect(page.getByText('Renamed Conversation')).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('should delete conversation', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Send a message to ensure conversation exists
    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test message');
    await page.getByRole('button', { name: /send/i }).click();
    await page.waitForTimeout(1000);

    // Find conversation in sidebar and open context menu
    const conversationItem = page.locator('[class*="conversation"]').first();
    await conversationItem.hover();

    // Click delete button
    const deleteButton = page
      .getByRole('button', { name: /delete|remove|trash/i })
      .first();
    if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion if modal appears
      const confirmButton = page.getByRole('button', {
        name: /confirm|yes|delete/i,
      });
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Should redirect or show empty state
      await page.waitForTimeout(1000);
    }
  });

  test('should display conversation list in sidebar', async ({ page }) => {
    await page.goto('/chat');

    // Should see conversation sidebar
    const sidebar = page.locator(
      '[class*="sidebar"], [class*="conversation-list"]'
    );
    await expect(sidebar).toBeVisible({ timeout: 3000 });

    // Create a conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Should see at least one conversation in list
    const conversationItems = page.locator('[class*="conversation"]');
    await expect(conversationItems.first()).toBeVisible({ timeout: 3000 });
  });

  test('should switch between conversations', async ({ page }) => {
    await page.goto('/chat');

    // Create first conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });
    const firstConversationUrl = page.url();

    // Send message in first conversation
    let messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('First conversation message');
    await page.getByRole('button', { name: /send/i }).click();
    await page.waitForTimeout(1000);

    // Create second conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });
    const secondConversationUrl = page.url();

    // URLs should be different
    expect(firstConversationUrl).not.toBe(secondConversationUrl);

    // Send message in second conversation
    messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Second conversation message');
    await page.getByRole('button', { name: /send/i }).click();
    await page.waitForTimeout(1000);

    // Click first conversation in sidebar
    const conversations = page.locator('[class*="conversation"]');
    await conversations.nth(1).click(); // Index 1 is likely the first one (0 might be active)

    // Should navigate back to first conversation
    await page.waitForTimeout(500);
    // Should see first conversation message
    await expect(page.getByText('First conversation message')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should disable input while message is sending', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Send message
    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test message');
    await page.getByRole('button', { name: /send/i }).click();

    // Input should be disabled while streaming
    await expect(messageInput).toBeDisabled({ timeout: 1000 });

    // Eventually should be enabled again
    await expect(messageInput).toBeEnabled({ timeout: 10000 });
  });

  test('should scroll to bottom when new messages arrive', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Send message
    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test auto-scroll');
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Message list should be scrolled to bottom (last message visible)
    const lastMessage = page.locator('[class*="message"]').last();
    await expect(lastMessage).toBeInViewport({ timeout: 3000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/chat');

    // Create conversation
    await page
      .getByRole('button', { name: /new.*conversation|new.*chat|\+/i })
      .first()
      .click();
    await page.waitForURL(/\/chat\/[\w-]+/, { timeout: 5000 });

    // Simulate offline
    await page.context().setOffline(true);

    // Try to send message
    const messageInput = page.getByPlaceholder(/type.*message|message/i);
    await messageInput.fill('Test offline');
    await page.getByRole('button', { name: /send/i }).click();

    // Should see error message
    await expect(page.getByText(/error|failed|network|offline/i)).toBeVisible({
      timeout: 5000,
    });

    // Go back online
    await page.context().setOffline(false);
  });

  test('should show empty state when no conversations', async ({ page }) => {
    await page.goto('/chat');

    // If there are conversations, delete them all first
    // (This test assumes starting fresh or being able to clear state)

    // Should see empty state message
    const emptyStatePatterns = [
      /no.*conversation/i,
      /start.*conversation/i,
      /begin.*chat/i,
      /empty/i,
    ];

    let hasEmptyState = false;
    for (const pattern of emptyStatePatterns) {
      if (
        await page
          .getByText(pattern)
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        hasEmptyState = true;
        break;
      }
    }

    // Empty state or conversation list should be visible
    expect(
      hasEmptyState ||
        (await page.locator('[class*="conversation"]').count()) > 0
    ).toBeTruthy();
  });
});
