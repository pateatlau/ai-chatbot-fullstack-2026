import http from 'k6/http';
import { check, sleep } from 'k6';

// Soak test - sustained load over long period
const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export const options = {
  stages: [
    { duration: '5m', target: 100 }, // Ramp up
    { duration: '4h', target: 100 }, // Sustain for 4 hours
    { duration: '5m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

let accessToken = null;

export function setup() {
  console.log('Starting SOAK test...');
  console.log(
    'This will run for ~4 hours to detect memory leaks and degradation'
  );

  // Register a test user for the duration
  const response = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email: `soak-test-${Date.now()}@example.com`,
      password: 'SoakTest123!',
      name: 'Soak Test User',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (response.status === 201) {
    const body = JSON.parse(response.body);
    return { token: body.access_token };
  }

  return { token: null };
}

export default function (data) {
  const token = data.token;

  if (!token) {
    console.error('No token available');
    return;
  }

  // Realistic user behavior over time

  // Check health
  http.get(`${BASE_URL}/api/auth/health`);
  sleep(2);

  // List conversations
  const listResponse = http.get(`${BASE_URL}/api/chat/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(listResponse, {
    'list conversations is 200': (r) => r.status === 200,
  });

  sleep(5);

  // Create conversation periodically
  if (Math.random() < 0.1) {
    const createResponse = http.post(
      `${BASE_URL}/api/chat/conversations`,
      JSON.stringify({
        title: `Soak Test Conversation ${Date.now()}`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (createResponse.status === 201) {
      const body = JSON.parse(createResponse.body);
      const conversationId = body.id;

      sleep(2);

      // Send a message
      http.post(
        `${BASE_URL}/api/chat/messages`,
        JSON.stringify({
          conversationId,
          content: 'Soak test message',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  }

  // Random think time
  sleep(Math.random() * 10 + 5); // 5-15 seconds
}

export function teardown(data) {
  console.log('Soak test completed!');
  console.log('Check for:');
  console.log('- Memory leaks (increasing memory usage over time)');
  console.log('- Performance degradation (increasing response times)');
  console.log('- Resource exhaustion (database connections, file handles)');
}
