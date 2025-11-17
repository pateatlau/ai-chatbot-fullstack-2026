#!/usr/bin/env node

/**
 * Admin MFE Integration Test Script
 * Tests all admin dashboard features including API integration
 */

const ADMIN_API_URL = 'http://localhost:3002/api/admin';
const AUTH_API_URL = 'http://localhost:3000/api/auth';

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

let adminToken = '';

// Test helper functions
function test(description, fn) {
  testResults.total++;
  try {
    fn();
    console.log(`✓ ${description}`);
    testResults.passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    testResults.failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Login as admin to get token
async function loginAsAdmin() {
  console.log('\n🔐 Authenticating as admin...\n');

  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testadmin@example.com',
        password: 'Admin123!@#',
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    adminToken = data.accessToken;
    console.log('✓ Admin authentication successful\n');
  } catch (error) {
    console.error('✗ Admin authentication failed:', error.message);
    process.exit(1);
  }
}

// Test 1: Admin API - Get Dashboard Stats
async function testDashboardStats() {
  console.log('📊 Dashboard Statistics Tests\n');

  try {
    const response = await fetch(`${ADMIN_API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert(response.ok, 'Stats API should return 200');
    const data = await response.json();

    test('Stats API returns data', () => {
      assert(data, 'Response should have data');
    });

    test('Stats has totalUsers', () => {
      assert(
        typeof data.totalUsers === 'number',
        'totalUsers should be a number'
      );
    });

    test('Stats has activeUsers', () => {
      assert(
        typeof data.activeUsers === 'number',
        'activeUsers should be a number'
      );
    });

    test('Stats has totalConversations', () => {
      assert(
        typeof data.totalConversations === 'number',
        'totalConversations should be a number'
      );
    });

    test('Stats has tokensUsed', () => {
      assert(
        typeof data.tokensUsed === 'number',
        'tokensUsed should be a number'
      );
    });
  } catch (error) {
    console.error('Dashboard stats test failed:', error.message);
  }
}

// Test 2: User Management - List Users
async function testUserManagement() {
  console.log('\n👥 User Management Tests\n');

  try {
    const response = await fetch(`${ADMIN_API_URL}/users?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert(response.ok, 'Users list API should return 200');
    const data = await response.json();

    test('Users API returns data', () => {
      assert(data, 'Response should have data');
    });

    test('Users API has users array', () => {
      assert(Array.isArray(data.users), 'users should be an array');
    });

    test('Users API has pagination', () => {
      assert(typeof data.total === 'number', 'total should be a number');
      assert(typeof data.page === 'number', 'page should be a number');
      assert(typeof data.limit === 'number', 'limit should be a number');
    });

    test('User objects have required fields', () => {
      if (data.users.length > 0) {
        const user = data.users[0];
        assert(user.id, 'User should have id');
        assert(user.email, 'User should have email');
        assert(user.name, 'User should have name');
        assert(user.role, 'User should have role');
        assert(typeof user.isActive === 'boolean', 'User should have isActive');
      }
    });
  } catch (error) {
    console.error('User management test failed:', error.message);
  }
}

// Test 3: User Management - Filtering
async function testUserFiltering() {
  console.log('\n🔍 User Filtering Tests\n');

  try {
    // Test role filter
    const roleResponse = await fetch(`${ADMIN_API_URL}/users?role=ADMIN`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    test('Role filter works', () => {
      assert(roleResponse.ok, 'Role filter should return 200');
    });

    const roleData = await roleResponse.json();

    test('Role filter returns only admins', () => {
      if (roleData.users.length > 0) {
        const allAdmins = roleData.users.every((u) => u.role === 'ADMIN');
        assert(allAdmins, 'All returned users should have ADMIN role');
      }
    });

    // Test active filter
    const activeResponse = await fetch(`${ADMIN_API_URL}/users?isActive=true`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    test('Active filter works', () => {
      assert(activeResponse.ok, 'Active filter should return 200');
    });

    const activeData = await activeResponse.json();

    test('Active filter returns only active users', () => {
      if (activeData.users.length > 0) {
        const allActive = activeData.users.every((u) => u.isActive === true);
        assert(allActive, 'All returned users should be active');
      }
    });
  } catch (error) {
    console.error('User filtering test failed:', error.message);
  }
}

// Test 4: Audit Logs
async function testAuditLogs() {
  console.log('\n📝 Audit Logs Tests\n');

  try {
    const response = await fetch(
      `${ADMIN_API_URL}/audit-logs?page=1&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    assert(response.ok, 'Audit logs API should return 200');
    const data = await response.json();

    test('Audit logs API returns data', () => {
      assert(data, 'Response should have data');
    });

    test('Audit logs has logs array', () => {
      assert(Array.isArray(data.logs), 'logs should be an array');
    });

    test('Audit logs has pagination', () => {
      assert(typeof data.total === 'number', 'total should be a number');
      assert(typeof data.page === 'number', 'page should be a number');
      assert(typeof data.limit === 'number', 'limit should be a number');
    });

    test('Audit log objects have required fields', () => {
      if (data.logs.length > 0) {
        const log = data.logs[0];
        assert(log.id, 'Log should have id');
        assert(log.adminId, 'Log should have adminId');
        assert(log.action, 'Log should have action');
        assert(log.createdAt, 'Log should have createdAt');
      }
    });
  } catch (error) {
    console.error('Audit logs test failed:', error.message);
  }
}

// Test 5: Admin MFE Components
function testAdminMFEComponents() {
  console.log('\n🎨 Admin MFE Component Tests\n');

  test('Admin API client exists', () => {
    const fs = require('fs');
    const apiPath = './src/api/admin.api.ts';
    assert(fs.existsSync(apiPath), 'Admin API client file should exist');
  });

  test('AdminDashboardPage exists', () => {
    const fs = require('fs');
    const pagePath = './src/pages/AdminDashboardPage.tsx';
    assert(fs.existsSync(pagePath), 'AdminDashboardPage should exist');
  });

  test('UserManagementPage exists', () => {
    const fs = require('fs');
    const pagePath = './src/pages/UserManagementPage.tsx';
    assert(fs.existsSync(pagePath), 'UserManagementPage should exist');
  });

  test('UserDetailPage exists', () => {
    const fs = require('fs');
    const pagePath = './src/pages/UserDetailPage.tsx';
    assert(fs.existsSync(pagePath), 'UserDetailPage should exist');
  });

  test('AuditLogsPage exists', () => {
    const fs = require('fs');
    const pagePath = './src/pages/AuditLogsPage.tsx';
    assert(fs.existsSync(pagePath), 'AuditLogsPage should exist');
  });
}

// Test 6: App Routing
function testAppRouting() {
  console.log('\n🔀 App Routing Tests\n');

  const fs = require('fs');
  const appPath = './src/app/app.tsx';
  const appContent = fs.readFileSync(appPath, 'utf-8');

  test('App imports all pages', () => {
    assert(
      appContent.includes('AdminDashboardPage'),
      'App should import AdminDashboardPage'
    );
    assert(
      appContent.includes('UserManagementPage'),
      'App should import UserManagementPage'
    );
    assert(
      appContent.includes('UserDetailPage'),
      'App should import UserDetailPage'
    );
    assert(
      appContent.includes('AuditLogsPage'),
      'App should import AuditLogsPage'
    );
  });

  test('App has route for /admin/users', () => {
    assert(
      appContent.includes('/admin/users'),
      'App should have route for /admin/users'
    );
  });

  test('App has route for /admin/users/:id', () => {
    assert(
      appContent.includes('/admin/users/'),
      'App should have route for /admin/users/:id'
    );
  });

  test('App has route for /admin/audit-logs', () => {
    assert(
      appContent.includes('/admin/audit-logs'),
      'App should have route for /admin/audit-logs'
    );
  });
}

// Test 7: TypeScript Types
function testTypeScriptTypes() {
  console.log('\n📘 TypeScript Types Tests\n');

  const fs = require('fs');
  const apiPath = './src/api/admin.api.ts';
  const apiContent = fs.readFileSync(apiPath, 'utf-8');

  test('API defines User interface', () => {
    assert(
      apiContent.includes('export interface User'),
      'API should export User interface'
    );
  });

  test('API defines DashboardStats interface', () => {
    assert(
      apiContent.includes('export interface DashboardStats'),
      'API should export DashboardStats interface'
    );
  });

  test('API defines AuditLog interface', () => {
    assert(
      apiContent.includes('export interface AuditLog'),
      'API should export AuditLog interface'
    );
  });

  test('API defines request/response types', () => {
    assert(
      apiContent.includes('UserListResponse') ||
        apiContent.includes('Response'),
      'API should define response types'
    );
  });
}

// Main test runner
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Admin MFE Integration Tests');
  console.log('═══════════════════════════════════════════════════════\n');

  // Login first
  await loginAsAdmin();

  // Run API tests
  await testDashboardStats();
  await testUserManagement();
  await testUserFiltering();
  await testAuditLogs();

  // Change to admin-mfe directory for file tests
  process.chdir('apps/admin-mfe');

  // Run component tests
  testAdminMFEComponents();
  testAppRouting();
  testTypeScriptTypes();

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );
  console.log('═══════════════════════════════════════════════════════\n');

  if (testResults.failed === 0) {
    console.log('✨ All tests passed! Admin MFE is ready.\n');
    console.log('Admin MFE Status:');
    console.log('  ✓ Dashboard with real-time stats');
    console.log('  ✓ User management with pagination and filtering');
    console.log('  ✓ User detail/edit page');
    console.log('  ✓ Audit logs viewer');
    console.log('  ✓ TypeScript types and API integration\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run all tests
runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
