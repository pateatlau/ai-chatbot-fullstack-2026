import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export const options = {
  stages: [
    // Ramp-up
    { duration: '2m', target: 50 }, // Gradually increase to 50 users
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 min
    { duration: '2m', target: 200 }, // Spike to 200 users
    { duration: '3m', target: 200 }, // Hold at 200 users
    { duration: '2m', target: 50 }, // Ramp down to 50
    { duration: '1m', target: 0 }, // Cool down
  ],
  thresholds: {
    // 95% of requests must complete within 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be less than 1%
    errors: ['rate<0.01'],
    // 99% of requests should succeed
    http_req_failed: ['rate<0.01'],
  },
};

// ==========================================
// Helper Functions
// ==========================================

function generateRandomEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `loadtest-${timestamp}-${random}@example.com`;
}

function register() {
  const email = generateRandomEmail();
  const password = 'LoadTest123!';

  const response = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email,
      password,
      name: 'Load Test User',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const success = check(response, {
    'registration status is 201': (r) => r.status === 201,
    'registration has access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  if (success) {
    const body = JSON.parse(response.body);
    return { email, password, token: body.access_token };
  }

  return null;
}

function login(email, password) {
  const response = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login has access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (success) {
    successfulLogins.add(1);
  } else {
    failedLogins.add(1);
  }

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  if (success) {
    const body = JSON.parse(response.body);
    return body.access_token;
  }

  return null;
}

function createConversation(token) {
  const response = http.post(
    `${BASE_URL}/api/chat/conversations`,
    JSON.stringify({
      title: `Load Test Conversation ${Date.now()}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const success = check(response, {
    'create conversation status is 201': (r) => r.status === 201,
    'conversation has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  if (success) {
    const body = JSON.parse(response.body);
    return body.id;
  }

  return null;
}

function sendMessage(token, conversationId, content) {
  const response = http.post(
    `${BASE_URL}/api/chat/messages`,
    JSON.stringify({
      conversationId,
      content,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const success = check(response, {
    'send message status is 201': (r) => r.status === 201,
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  return success;
}

function listConversations(token) {
  const response = http.get(`${BASE_URL}/api/chat/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const success = check(response, {
    'list conversations status is 200': (r) => r.status === 200,
    'conversations is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  return success;
}

function getProfile(token) {
  const response = http.get(`${BASE_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const success = check(response, {
    'profile status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  return success;
}

// ==========================================
// Test Scenarios
// ==========================================

export default function () {
  // Scenario 1: New User Registration & Chat (30% of traffic)
  if (Math.random() < 0.3) {
    group('New User Registration Flow', () => {
      const user = register();
      if (!user) return;

      sleep(1);

      const conversationId = createConversation(user.token);
      if (!conversationId) return;

      sleep(1);

      sendMessage(
        user.token,
        conversationId,
        'Hello, this is a load test message'
      );
      sleep(2);

      listConversations(user.token);
    });
  }
  // Scenario 2: Existing User Login & Chat (50% of traffic)
  else if (Math.random() < 0.5) {
    group('Existing User Login Flow', () => {
      // Use a pre-seeded test user
      const token = login('test@example.com', 'Test123!');
      if (!token) {
        // If test user doesn't exist, register one
        const user = register();
        if (!user) return;

        sleep(1);

        const conversationId = createConversation(user.token);
        if (!conversationId) return;

        sleep(1);

        sendMessage(user.token, conversationId, 'Load test message');
      } else {
        sleep(1);

        listConversations(token);

        sleep(1);

        const conversationId = createConversation(token);
        if (!conversationId) return;

        sleep(1);

        sendMessage(token, conversationId, 'Another load test message');
      }
    });
  }
  // Scenario 3: Profile Management (10% of traffic)
  else if (Math.random() < 0.1) {
    group('Profile Management Flow', () => {
      const user = register();
      if (!user) return;

      sleep(1);

      getProfile(user.token);

      sleep(2);

      getProfile(user.token);
    });
  }
  // Scenario 4: Browse & Read (10% of traffic)
  else {
    group('Browse Conversations Flow', () => {
      const user = register();
      if (!user) return;

      sleep(1);

      // List conversations multiple times (browsing behavior)
      for (let i = 0; i < 3; i++) {
        listConversations(user.token);
        sleep(2);
      }
    });
  }

  // Random think time between actions
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// ==========================================
// Setup & Teardown
// ==========================================

export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Configuration: ${JSON.stringify(options.stages)}`);
}

export function teardown(data) {
  console.log('Load test completed!');
}
