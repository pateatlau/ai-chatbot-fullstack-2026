#!/usr/bin/env node

/**
 * Token Debugging Script
 *
 * This script helps debug JWT token issues by:
 * 1. Decoding and displaying token contents
 * 2. Verifying token signature
 * 3. Checking expiration
 * 4. Testing actual API calls
 */

const jwt = require('jsonwebtoken');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// JWT secret from environment
const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your-super-secret-jwt-key-change-this-in-production';

console.log('=== JWT Token Debugger ===\n');
console.log('JWT_SECRET configured:', JWT_SECRET.substring(0, 20) + '...\n');

rl.question('Paste your access_token here: ', (token) => {
  if (!token || token.trim() === '') {
    console.log('\n❌ No token provided');
    rl.close();
    return;
  }

  token = token.trim();

  console.log('\n=== Token Analysis ===\n');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...\n');

  // Decode without verification
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      console.log('❌ Failed to decode token\n');
      rl.close();
      return;
    }

    console.log('📦 Header:');
    console.log(JSON.stringify(decoded.header, null, 2));

    console.log('\n📦 Payload:');
    console.log(JSON.stringify(decoded.payload, null, 2));

    // Check expiration
    if (decoded.payload.exp) {
      const expirationDate = new Date(decoded.payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate < now;

      console.log('\n⏰ Expiration:');
      console.log('  Expires at:', expirationDate.toISOString());
      console.log('  Current time:', now.toISOString());
      console.log('  Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');

      if (!isExpired) {
        const timeLeft = Math.floor((expirationDate - now) / 1000 / 60);
        console.log('  Time remaining:', timeLeft, 'minutes');
      }
    }

    // Verify signature
    console.log('\n🔐 Signature Verification:');
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token signature is VALID');
      console.log('User ID:', verified.userId);
      console.log('Email:', verified.email);
      console.log('Role:', verified.role);
    } catch (verifyError) {
      console.log('❌ Token signature verification FAILED:');
      console.log('   Error:', verifyError.message);

      if (verifyError.name === 'TokenExpiredError') {
        console.log(
          '\n⚠️  Token has expired. User needs to refresh or login again.'
        );
      } else if (verifyError.name === 'JsonWebTokenError') {
        console.log('\n⚠️  Token signature is invalid. Possible causes:');
        console.log('   - Wrong JWT_SECRET on backend');
        console.log('   - Token was tampered with');
        console.log('   - Token format is corrupted');
      }
    }
  } catch (error) {
    console.log('❌ Error analyzing token:', error.message);
  }

  console.log('\n=== Testing API Endpoints ===\n');

  const testEndpoint = async (url, name) => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`${name}: ${response.status} ${response.statusText}`);

      if (response.status === 401 || response.status === 403) {
        const body = await response.text();
        console.log('  Response:', body);
      }
    } catch (error) {
      console.log(`${name}: ❌ Failed - ${error.message}`);
    }
  };

  (async () => {
    await testEndpoint('http://localhost:3000/api/auth/me', 'Auth Service');
    await testEndpoint(
      'http://localhost:3001/api/chat/conversations',
      'Chatbot Service'
    );

    console.log('\n=== Diagnosis Complete ===\n');
    rl.close();
  })();
});
