#!/usr/bin/env node

/**
 * Admin Service Integration Tests
 * Tests user management, audit logging, and analytics endpoints
 *
 * Prerequisites:
 * - Auth Service running on port 3000
 * - Admin Service running on port 3002
 * - PostgreSQL with test data
 *
 * Run: node apps/admin-service/test-admin-service.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3002';
const AUTH_URL = 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// HTTP request helper
function request(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test helpers
function logTest(name, passed, message = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`  ${color}${icon}${colors.reset} ${name}`);
  if (message) {
    console.log(`    ${colors.yellow}${message}${colors.reset}`);
  }
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function runTests() {
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.cyan}   Admin Service Integration Tests${colors.reset}`
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════════${colors.reset}\n`
  );

  let adminToken = null;
  let userToken = null;
  let testUserId = null;

  // Test 1: Login as admin
  console.log(`${colors.blue}Authentication${colors.reset}`);
  try {
    const response = await request('POST', `${AUTH_URL}/api/auth/login`, {
      email: 'testadmin@example.com',
      password: 'Admin123!@#',
    });

    if (response.status === 200 && response.data.accessToken) {
      adminToken = response.data.accessToken;
      logTest('Admin login successful', true);
    } else {
      logTest(
        'Admin login successful',
        false,
        'No admin user found. Create one first.'
      );
      process.exit(1);
    }
  } catch (error) {
    logTest('Admin login successful', false, error.message);
    process.exit(1);
  }

  // Test 2: Login as regular user
  try {
    const response = await request('POST', `${AUTH_URL}/api/auth/login`, {
      email: 'regularuser@example.com',
      password: 'User123!@#',
    });

    if (response.status === 200 && response.data.accessToken) {
      userToken = response.data.accessToken;
      logTest('Regular user login successful', true);
    } else {
      logTest('Regular user login successful', false, 'Create test user first');
    }
  } catch (error) {
    logTest('Regular user login successful', false, error.message);
  }

  // Test 3: Health check
  console.log(`\n${colors.blue}Health Check${colors.reset}`);
  try {
    const response = await request('GET', `${BASE_URL}/health`);
    logTest(
      'Admin service health check',
      response.status === 200,
      response.status !== 200 ? `Status: ${response.status}` : ''
    );
  } catch (error) {
    logTest('Admin service health check', false, error.message);
  }

  // Test 4: Unauthorized access (no token)
  console.log(`\n${colors.blue}Authorization${colors.reset}`);
  try {
    const response = await request('GET', `${BASE_URL}/api/admin/users`);
    logTest(
      'Reject request without token',
      response.status === 401,
      response.status !== 401 ? `Expected 401, got ${response.status}` : ''
    );
  } catch (error) {
    logTest('Reject request without token', false, error.message);
  }

  // Test 5: Non-admin access
  if (userToken) {
    try {
      const response = await request(
        'GET',
        `${BASE_URL}/api/admin/users`,
        null,
        userToken
      );
      logTest(
        'Reject non-admin user',
        response.status === 403,
        response.status !== 403 ? `Expected 403, got ${response.status}` : ''
      );
    } catch (error) {
      logTest('Reject non-admin user', false, error.message);
    }
  }

  // Test 6: List users
  console.log(`\n${colors.blue}User Management${colors.reset}`);
  try {
    const response = await request(
      'GET',
      `${BASE_URL}/api/admin/users`,
      null,
      adminToken
    );

    if (response.status === 200 && response.data.users) {
      logTest('List users', true, `Found ${response.data.users.length} users`);

      // Save a non-admin user ID for testing
      testUserId = response.data.users.find((u) => u.role !== 'ADMIN')?.id;
    } else {
      logTest(
        'List users',
        false,
        `Status: ${response.status}, Error: ${response.data.error || JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('List users', false, error.message);
  }

  // Test 7: Get user by ID
  if (testUserId) {
    try {
      const response = await request(
        'GET',
        `${BASE_URL}/api/admin/users/${testUserId}`,
        null,
        adminToken
      );

      logTest(
        'Get user by ID',
        response.status === 200 && response.data.id === testUserId,
        response.status !== 200 ? `Status: ${response.status}` : ''
      );
    } catch (error) {
      logTest('Get user by ID', false, error.message);
    }
  }

  // Test 8: Update user
  if (testUserId) {
    try {
      const response = await request(
        'PATCH',
        `${BASE_URL}/api/admin/users/${testUserId}`,
        { name: 'Updated Test User' },
        adminToken
      );

      logTest(
        'Update user',
        response.status === 200 &&
          response.data.user?.name === 'Updated Test User',
        response.status !== 200 ? `Status: ${response.status}` : ''
      );
    } catch (error) {
      logTest('Update user', false, error.message);
    }
  }

  // Test 9: Reset user password
  if (testUserId) {
    try {
      const response = await request(
        'POST',
        `${BASE_URL}/api/admin/users/${testUserId}/reset-password`,
        {},
        adminToken
      );

      logTest(
        'Reset user password',
        response.status === 200 && response.data.temporaryPassword,
        response.status !== 200
          ? `Status: ${response.status}`
          : 'Temp password generated'
      );
    } catch (error) {
      logTest('Reset user password', false, error.message);
    }
  }

  // Test 10: Get statistics
  console.log(`\n${colors.blue}Analytics${colors.reset}`);
  try {
    const response = await request(
      'GET',
      `${BASE_URL}/api/admin/stats`,
      null,
      adminToken
    );

    if (response.status === 200 && response.data.totalUsers !== undefined) {
      logTest(
        'Get overview stats',
        true,
        `Users: ${response.data.totalUsers}, Active: ${response.data.activeUsers}`
      );
    } else {
      logTest('Get overview stats', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Get overview stats', false, error.message);
  }

  // Test 11: Get audit logs
  console.log(`\n${colors.blue}Audit Logging${colors.reset}`);
  try {
    const response = await request(
      'GET',
      `${BASE_URL}/api/admin/audit-logs`,
      null,
      adminToken
    );

    if (response.status === 200 && response.data.logs) {
      logTest(
        'Get audit logs',
        true,
        `Found ${response.data.logs.length} log entries`
      );
    } else {
      logTest(
        'Get audit logs',
        false,
        `Status: ${response.status}, Error: ${response.data.error || JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Get audit logs', false, error.message);
  }

  // Test 12: List users with filters
  console.log(`\n${colors.blue}Filtering & Pagination${colors.reset}`);
  try {
    const response = await request(
      'GET',
      `${BASE_URL}/api/admin/users?page=1&pageSize=5&role=USER`,
      null,
      adminToken
    );

    logTest(
      'List users with filters',
      response.status === 200 && response.data.users,
      response.status !== 200
        ? `Status: ${response.status}`
        : `Got ${response.data.users.length} users`
    );
  } catch (error) {
    logTest('List users with filters', false, error.message);
  }

  // Test 13: Prevent self-deactivation
  console.log(`\n${colors.blue}Security Checks${colors.reset}`);
  try {
    // Get admin user ID
    const meResponse = await request(
      'GET',
      `${AUTH_URL}/api/auth/me`,
      null,
      adminToken
    );
    const adminId = meResponse.data.id;

    const response = await request(
      'PATCH',
      `${BASE_URL}/api/admin/users/${adminId}`,
      { isActive: false },
      adminToken
    );

    logTest(
      'Prevent admin self-deactivation',
      response.status === 400,
      response.status !== 400 ? `Expected 400, got ${response.status}` : ''
    );
  } catch (error) {
    logTest('Prevent admin self-deactivation', false, error.message);
  }

  // Print summary
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.cyan}   Test Summary${colors.reset}`);
  console.log(
    `${colors.cyan}═══════════════════════════════════════${colors.reset}\n`
  );

  const total = testResults.passed + testResults.failed;
  const percentage =
    total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

  console.log(
    `  ${colors.green}✓ Passed:${colors.reset} ${testResults.passed}`
  );
  console.log(`  ${colors.red}✗ Failed:${colors.reset} ${testResults.failed}`);
  console.log(`  ${colors.blue}Total:${colors.reset}  ${total}`);
  console.log(
    `  ${colors.yellow}Success Rate:${colors.reset} ${percentage}%\n`
  );

  if (testResults.failed > 0) {
    console.log(`${colors.red}Some tests failed!${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, error);
  process.exit(1);
});
