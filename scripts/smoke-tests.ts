#!/usr/bin/env ts-node
/**
 * Smoke Tests - Quick validation of critical paths after deployment
 * Run with: npm run test:smoke -- --env=staging|production
 */

import axios, { AxiosInstance } from 'axios';

const ENVIRONMENTS = {
  staging: 'https://staging.your-domain.com',
  production: 'https://your-domain.com',
  local: 'http://localhost:5173',
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class SmokeTests {
  private api: AxiosInstance;
  private results: TestResult[] = [];
  private env: string;

  constructor(env: string) {
    this.env = env;
    const baseURL =
      ENVIRONMENTS[env as keyof typeof ENVIRONMENTS] || ENVIRONMENTS.local;

    this.api = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });

    console.log(`🚀 Running smoke tests against: ${baseURL}\n`);
  }

  private async runTest(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`❌ ${name} (${duration}ms) - ${error}`);
    }
  }

  // ==========================================
  // Health Checks
  // ==========================================
  private async testHealthChecks(): Promise<void> {
    await this.runTest('Auth Service Health', async () => {
      const response = await this.api.get('/api/auth/health');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.runTest('Admin Service Health', async () => {
      const response = await this.api.get('/api/admin/health');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.runTest('Chatbot Service Health', async () => {
      const response = await this.api.get('/api/chat/health');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ==========================================
  // Authentication Flow
  // ==========================================
  private async testAuthFlow(): Promise<void> {
    let accessToken: string;

    await this.runTest('User Registration', async () => {
      const timestamp = Date.now();
      const response = await this.api.post('/api/auth/register', {
        email: `smoke-test-${timestamp}@example.com`,
        password: 'SmokeTest123!',
        name: 'Smoke Test User',
      });

      if (response.status !== 201) {
        throw new Error(
          `Expected 201, got ${response.status}: ${JSON.stringify(response.data)}`
        );
      }

      accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('No access token returned');
      }
    });

    await this.runTest('User Login', async () => {
      const response = await this.api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'Test123!',
      });

      // Accept both 200 (success) and 401 (user doesn't exist in fresh DB)
      if (![200, 401].includes(response.status)) {
        throw new Error(`Expected 200 or 401, got ${response.status}`);
      }
    });

    await this.runTest('Protected Route Access', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token');
        return;
      }

      const response = await this.api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ==========================================
  // Chatbot Flow
  // ==========================================
  private async testChatbotFlow(): Promise<void> {
    let accessToken: string;
    let conversationId: string;

    // Get token first
    await this.runTest('Get Auth Token for Chat', async () => {
      const timestamp = Date.now();
      const response = await this.api.post('/api/auth/register', {
        email: `chat-smoke-${timestamp}@example.com`,
        password: 'SmokeTest123!',
        name: 'Chat Smoke Test',
      });

      if (response.status === 201) {
        accessToken = response.data.access_token;
      } else if (response.status === 409) {
        // User exists, try login
        const loginResponse = await this.api.post('/api/auth/login', {
          email: `chat-smoke-${timestamp}@example.com`,
          password: 'SmokeTest123!',
        });
        accessToken = loginResponse.data.access_token;
      }

      if (!accessToken) {
        throw new Error('Failed to get access token');
      }
    });

    await this.runTest('Create Conversation', async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await this.api.post(
        '/api/chat/conversations',
        { title: 'Smoke Test Conversation' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status}`);
      }

      conversationId = response.data.id;
      if (!conversationId) {
        throw new Error('No conversation ID returned');
      }
    });

    await this.runTest('Send Chat Message', async () => {
      if (!accessToken || !conversationId) {
        throw new Error('Missing prerequisites');
      }

      const response = await this.api.post(
        '/api/chat/messages',
        {
          conversationId,
          content: 'Hello, this is a smoke test message',
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status}`);
      }
    });

    await this.runTest('List Conversations', async () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await this.api.get('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of conversations');
      }
    });
  }

  // ==========================================
  // Admin Panel
  // ==========================================
  private async testAdminPanel(): Promise<void> {
    await this.runTest('Admin Dashboard Access', async () => {
      const response = await this.api.get('/api/admin/stats');

      // Accept 200 (success) or 401 (no auth) or 403 (not admin)
      if (![200, 401, 403].includes(response.status)) {
        throw new Error(`Expected 200/401/403, got ${response.status}`);
      }
    });

    await this.runTest('User List Access', async () => {
      const response = await this.api.get('/api/admin/users');

      // Accept 200 (success) or 401 (no auth) or 403 (not admin)
      if (![200, 401, 403].includes(response.status)) {
        throw new Error(`Expected 200/401/403, got ${response.status}`);
      }
    });
  }

  // ==========================================
  // Frontend MFE Loading
  // ==========================================
  private async testMFELoading(): Promise<void> {
    await this.runTest('Shell App Loads', async () => {
      const response = await this.api.get('/');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      const html = response.data;
      if (!html.includes('remoteEntry')) {
        throw new Error('No Module Federation remoteEntry found');
      }
    });

    await this.runTest('Auth MFE RemoteEntry', async () => {
      const response = await this.api.get('/auth-mfe/remoteEntry.js');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.runTest('Chatbot MFE RemoteEntry', async () => {
      const response = await this.api.get('/chatbot-mfe/remoteEntry.js');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.runTest('Admin MFE RemoteEntry', async () => {
      const response = await this.api.get('/admin-mfe/remoteEntry.js');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.runTest('Profile MFE RemoteEntry', async () => {
      const response = await this.api.get('/profile-mfe/remoteEntry.js');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ==========================================
  // Performance Checks
  // ==========================================
  private async testPerformance(): Promise<void> {
    await this.runTest('Response Time < 500ms', async () => {
      const start = Date.now();
      await this.api.get('/api/auth/health');
      const duration = Date.now() - start;

      if (duration > 500) {
        throw new Error(`Response took ${duration}ms (threshold: 500ms)`);
      }
    });
  }

  // ==========================================
  // Run All Tests
  // ==========================================
  public async runAll(): Promise<void> {
    console.log('═'.repeat(60));
    console.log('SMOKE TESTS - Critical Path Validation');
    console.log('═'.repeat(60));
    console.log();

    await this.testHealthChecks();
    console.log();

    await this.testAuthFlow();
    console.log();

    await this.testChatbotFlow();
    console.log();

    await this.testAdminPanel();
    console.log();

    await this.testMFELoading();
    console.log();

    await this.testPerformance();
    console.log();

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const avgDuration =
      this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    console.log('═'.repeat(60));
    console.log('TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Environment: ${this.env}`);
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Average Duration: ${avgDuration.toFixed(0)}ms`);
    console.log();

    if (failed > 0) {
      console.log('FAILED TESTS:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  • ${r.name}: ${r.error}`);
        });
      console.log();
    }

    console.log('═'.repeat(60));

    process.exit(failed > 0 ? 1 : 0);
  }
}

// ==========================================
// Main Execution
// ==========================================
const args = process.argv.slice(2);
const envFlag = args.find((arg) => arg.startsWith('--env='));
const env = envFlag ? envFlag.split('=')[1] : 'local';

const smokeTests = new SmokeTests(env);
smokeTests.runAll().catch((error) => {
  console.error('❌ Smoke tests failed:', error);
  process.exit(1);
});
