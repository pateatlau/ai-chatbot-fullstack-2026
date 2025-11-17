#!/usr/bin/env node

/**
 * Setup script for Admin Service testing
 * Creates test admin and regular user accounts
 *
 * Run: node apps/admin-service/setup-test-users.js
 */

const http = require('http');

const AUTH_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function request(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

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

async function setupTestUsers() {
  console.log(`\n${colors.cyan}Setting up test users...${colors.reset}\n`);

  // Create admin user
  try {
    const adminResponse = await request(
      'POST',
      `${AUTH_URL}/api/auth/register`,
      {
        email: 'admin@example.com',
        password: 'Admin123!@#',
        name: 'Test Admin',
      }
    );

    if (adminResponse.status === 201) {
      console.log(`${colors.green}✓${colors.reset} Admin user created`);

      // Need to manually set role to ADMIN in database
      console.log(`${colors.cyan}  Run this SQL to make admin:${colors.reset}`);
      console.log(
        `  UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';`
      );
    } else if (adminResponse.status === 400) {
      console.log(`${colors.cyan}ℹ${colors.reset} Admin user already exists`);
    } else {
      console.log(`${colors.red}✗${colors.reset} Failed to create admin user`);
    }
  } catch (error) {
    console.log(
      `${colors.red}✗${colors.reset} Error creating admin user:`,
      error.message
    );
  }

  // Create regular user
  try {
    const userResponse = await request(
      'POST',
      `${AUTH_URL}/api/auth/register`,
      {
        email: 'user@example.com',
        password: 'User123!@#',
        name: 'Test User',
      }
    );

    if (userResponse.status === 201) {
      console.log(`${colors.green}✓${colors.reset} Regular user created`);
    } else if (userResponse.status === 400) {
      console.log(
        `${colors.cyan}ℹ${colors.reset} Regular user already exists`
      );
    } else {
      console.log(
        `${colors.red}✗${colors.reset} Failed to create regular user`
      );
    }
  } catch (error) {
    console.log(
      `${colors.red}✗${colors.reset} Error creating regular user:`,
      error.message
    );
  }

  console.log(`\n${colors.cyan}Setup complete!${colors.reset}\n`);
}

setupTestUsers().catch((error) => {
  console.error(`${colors.red}Setup error:${colors.reset}`, error);
  process.exit(1);
});
