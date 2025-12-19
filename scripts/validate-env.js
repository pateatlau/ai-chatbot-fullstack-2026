#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 *
 * Validates that all required environment variables are set.
 * Reads required variables from .env.required file.
 *
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate:env
 *
 * Exit codes:
 *   0 - All required variables present
 *   1 - Missing required variables or validation errors
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    log('', 'reset');
    log('Please create a .env file from the template:', 'yellow');
    log('  cp .env.example .env', 'cyan');
    log('', 'reset');
    return null;
  }

  // Load .env file manually (avoid dotenv dependency for validation script)
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      env[key] = value.replace(/^["']|["']$/g, '');
    }
  });

  return env;
}

function loadRequiredVariables() {
  const requiredPath = path.join(process.cwd(), '.env.required');

  if (!fs.existsSync(requiredPath)) {
    log('⚠️  .env.required file not found, skipping validation', 'yellow');
    return [];
  }

  const content = fs.readFileSync(requiredPath, 'utf-8');
  const required = [];

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    // Variable names are listed one per line
    if (/^[A-Z_][A-Z0-9_]*$/.test(trimmed)) {
      required.push(trimmed);
    }
  });

  return required;
}

function validateJWTSecret(value) {
  if (!value) return { valid: false, error: 'JWT_SECRET is empty' };

  // Remove common placeholder patterns
  const placeholders = [
    'CHANGE_THIS',
    'your-secret',
    'your_secret',
    'change-me',
    'replace-me',
  ];

  const lowerValue = value.toLowerCase();
  for (const placeholder of placeholders) {
    if (lowerValue.includes(placeholder.toLowerCase())) {
      return {
        valid: false,
        error:
          'JWT_SECRET contains placeholder text - generate a secure secret',
      };
    }
  }

  if (value.length < 64) {
    return {
      valid: false,
      error: `JWT_SECRET too short (${value.length} chars, minimum 64 required)`,
    };
  }

  return { valid: true };
}

function validateDatabaseURL(value) {
  if (!value) return { valid: false, error: 'DATABASE_URL is empty' };

  try {
    const url = new URL(value);
    if (!url.protocol.startsWith('postgres')) {
      return { valid: false, error: 'DATABASE_URL must be a PostgreSQL URL' };
    }
    if (!url.hostname) {
      return { valid: false, error: 'DATABASE_URL missing hostname' };
    }
    if (!url.pathname || url.pathname === '/') {
      return { valid: false, error: 'DATABASE_URL missing database name' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'DATABASE_URL is not a valid URL' };
  }
}

function validateRedisURL(value) {
  if (!value) return { valid: false, error: 'REDIS_URL is empty' };

  try {
    const url = new URL(value);
    if (!url.protocol.startsWith('redis')) {
      return { valid: false, error: 'REDIS_URL must be a Redis URL' };
    }
    if (!url.hostname) {
      return { valid: false, error: 'REDIS_URL missing hostname' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'REDIS_URL is not a valid URL' };
  }
}

function validateURL(varName, value) {
  if (!value) return { valid: false, error: `${varName} is empty` };

  try {
    new URL(value);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `${varName} is not a valid URL` };
  }
}

function customValidation(varName, value) {
  // Special validation for specific variables
  switch (varName) {
    case 'JWT_SECRET':
    case 'JWT_REFRESH_SECRET':
      return validateJWTSecret(value);

    case 'DATABASE_URL':
      return validateDatabaseURL(value);

    case 'REDIS_URL':
      return validateRedisURL(value);

    case 'VITE_API_URL':
    case 'VITE_GRAPHQL_GATEWAY_URL':
    case 'VITE_AUTH_SERVICE_URL':
    case 'VITE_CHATBOT_SERVICE_URL':
    case 'VITE_ADMIN_SERVICE_URL':
      return validateURL(varName, value);

    default:
      return { valid: true };
  }
}

function main() {
  log('🔍 Validating environment variables...', 'cyan');
  log('', 'reset');

  // Load .env file
  const env = loadEnvFile();
  if (!env) {
    process.exit(1);
  }

  // Load required variables
  const requiredVars = loadRequiredVariables();
  if (requiredVars.length === 0) {
    log('✅ No required variables defined, validation passed', 'green');
    process.exit(0);
  }

  log(`📋 Checking ${requiredVars.length} required variables:`, 'blue');
  log('', 'reset');

  const missing = [];
  const invalid = [];
  const valid = [];

  // Check each required variable
  requiredVars.forEach((varName) => {
    const value = env[varName];

    if (!value || value.trim() === '') {
      missing.push(varName);
      log(`  ❌ ${varName}: MISSING`, 'red');
    } else {
      // Perform custom validation
      const validation = customValidation(varName, value);

      if (!validation.valid) {
        invalid.push({ varName, error: validation.error });
        log(`  ❌ ${varName}: INVALID - ${validation.error}`, 'red');
      } else {
        valid.push(varName);
        log(`  ✅ ${varName}: OK`, 'green');
      }
    }
  });

  log('', 'reset');
  log('━'.repeat(60), 'blue');
  log('', 'reset');

  // Summary
  const totalChecked = requiredVars.length;
  const totalValid = valid.length;
  const totalMissing = missing.length;
  const totalInvalid = invalid.length;

  log(
    `Summary: ${totalValid}/${totalChecked} valid`,
    totalValid === totalChecked ? 'green' : 'yellow'
  );

  if (totalMissing > 0) {
    log(`  Missing: ${totalMissing}`, 'red');
  }

  if (totalInvalid > 0) {
    log(`  Invalid: ${totalInvalid}`, 'red');
  }

  log('', 'reset');

  // Show remediation steps if there are issues
  if (totalMissing > 0 || totalInvalid > 0) {
    log('🔧 Remediation Steps:', 'yellow');
    log('', 'reset');

    if (totalMissing > 0) {
      log('1. Add missing variables to your .env file:', 'yellow');
      missing.forEach((varName) => {
        log(`   ${varName}=your-value-here`, 'cyan');
      });
      log('', 'reset');
    }

    if (totalInvalid > 0) {
      log(`${totalMissing > 0 ? '2' : '1'}. Fix invalid variables:`, 'yellow');

      if (invalid.some((v) => v.varName.includes('JWT'))) {
        log('   Generate JWT secrets:', 'cyan');
        log('   openssl rand -base64 64', 'cyan');
        log('', 'reset');
      }

      log('   See .env.example for correct formats', 'cyan');
      log('', 'reset');
    }

    log('📚 Documentation:', 'blue');
    log('  - ENV_VARIABLES_QUICKREF.md - Quick reference guide', 'cyan');
    log('  - docs/ENVIRONMENT_CONSOLIDATION_NOV22.md - Setup guide', 'cyan');
    log('', 'reset');

    log('❌ Environment validation FAILED', 'red');
    process.exit(1);
  }

  log('✅ Environment validation PASSED', 'green');
  log('', 'reset');
  log('All required variables are present and valid.', 'green');
  log('You can now start the application.', 'green');
  log('', 'reset');

  process.exit(0);
}

// Run validation
main();
