import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

/**
 * GraphQL vs REST Benchmarking Suite
 *
 * Compares performance of GraphQL endpoint vs REST API for typical operations:
 * - Admin Dashboard (7 operations → 1 query)
 * - User Profile (3 operations → 1 query)
 * - Conversation List (2 operations → 1 query)
 *
 * Metrics tracked:
 * - Response time (p50, p95, p99)
 * - Error rate
 * - Requests per second
 * - Bandwidth usage
 */

// ==========================================
// Custom Metrics
// ==========================================

// GraphQL metrics
const graphqlResponseTime = new Trend('graphql_response_time', { unit: 'ms' });
const graphqlErrorRate = new Rate('graphql_errors');
const graphqlBandwidth = new Gauge('graphql_bandwidth', { unit: 'B' });
const graphqlRequests = new Counter('graphql_requests');

// REST metrics
const restResponseTime = new Trend('rest_response_time', { unit: 'ms' });
const restErrorRate = new Rate('rest_errors');
const restBandwidth = new Gauge('rest_bandwidth', { unit: 'B' });
const restRequests = new Counter('rest_requests');

// Comparison metrics
const responseDiff = new Trend('response_time_diff', { unit: 'ms' }); // GraphQL - REST (negative = GraphQL faster)
const bandwidthDiff = new Gauge('bandwidth_diff', { unit: 'B' }); // REST - GraphQL

// ==========================================
// Configuration
// ==========================================

const GRAPHQL_URL = __ENV.GRAPHQL_URL || 'http://localhost:4000/graphql';
const REST_URL = __ENV.REST_URL || 'http://localhost:3000/api';

export const options = {
  // Moderate load for benchmarking
  stages: [
    { duration: '30s', target: 10 }, // Warmup
    { duration: '2m', target: 20 }, // Sustained load
    { duration: '30s', target: 0 }, // Cooldown
  ],
  thresholds: {
    // 95% of GraphQL requests < 300ms
    graphql_response_time: ['p(95)<300'],
    // GraphQL error rate < 1%
    graphql_errors: ['rate<0.01'],
    // 95% of REST requests < 400ms (typically slower due to multiple calls)
    rest_response_time: ['p(95)<400'],
    // REST error rate < 1%
    rest_errors: ['rate<0.01'],
  },
};

// ==========================================
// Helper Functions
// ==========================================

function generateAuthToken() {
  // In production, fetch a real token from login endpoint
  // For this benchmark, using a mock token - adjust as needed
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsInJvbGUiOiJBRE1JTiJ9.mock';
}

function formatBytes(bytes) {
  return Math.round(bytes);
}

// ==========================================
// GraphQL Queries & Operations
// ==========================================

/**
 * GraphQL: Admin Dashboard
 * Single query combining 7 separate REST calls
 */
function graphqlAdminDashboard(token) {
  const query = `
    query AdminDashboard {
      systemStats {
        totalUsers
        activeUsersToday
        activeUsersThisWeek
        totalConversations
        totalMessages
        averageMessagesPerUser
        __typename
      }
      topActiveUsers(limit: 10) {
        userId
        totalConversations
        totalMessages
        totalTokensUsed
        lastActiveAt
        __typename
      }
      me {
        id
        email
        name
        role
        __typename
      }
    }
  `;

  const response = http.post(GRAPHQL_URL, JSON.stringify({ query }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    tags: { name: 'graphql-admin-dashboard' },
  });

  const success = check(response, {
    'GraphQL Admin Dashboard status 200': (r) => r.status === 200,
    'GraphQL Admin Dashboard no errors': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !body.errors || body.errors.length === 0;
      } catch {
        return false;
      }
    },
  });

  graphqlResponseTime.add(response.timings.duration);
  graphqlBandwidth.set(response.body.length);
  graphqlErrorRate.add(!success);
  graphqlRequests.add(1);

  return {
    success,
    duration: response.timings.duration,
    size: response.body.length,
  };
}

/**
 * GraphQL: User Profile
 * Single query combining 3 separate REST calls
 */
function graphqlUserProfile(token, userId) {
  const query = `
    query UserProfile($userId: ID!) {
      user(id: $userId) {
        id
        email
        name
        role
        avatar
        isActive
        createdAt
        conversations(limit: 5) {
          id
          title
          messageCount
          updatedAt
        }
        conversationCount
        messageCount
        lastActiveAt
        analytics {
          totalTokensUsed
          averageResponseTime
          isPremium
        }
      }
    }
  `;

  const response = http.post(
    GRAPHQL_URL,
    JSON.stringify({
      query,
      variables: { userId },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      tags: { name: 'graphql-user-profile' },
    }
  );

  const success = check(response, {
    'GraphQL User Profile status 200': (r) => r.status === 200,
    'GraphQL User Profile has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data?.user?.id !== undefined;
      } catch {
        return false;
      }
    },
  });

  graphqlResponseTime.add(response.timings.duration);
  graphqlBandwidth.set(response.body.length);
  graphqlErrorRate.add(!success);
  graphqlRequests.add(1);

  return {
    success,
    duration: response.timings.duration,
    size: response.body.length,
  };
}

/**
 * GraphQL: Conversation List with Messages
 * Single query combining 2 separate REST calls
 */
function graphqlConversationList(token, userId) {
  const query = `
    query ConversationList($userId: ID!) {
      conversations(userId: $userId, limit: 20) {
        nodes {
          id
          title
          messages(limit: 3) {
            nodes {
              id
              role
              content
              createdAt
            }
          }
          messageCount
          updatedAt
        }
        totalCount
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const response = http.post(
    GRAPHQL_URL,
    JSON.stringify({
      query,
      variables: { userId },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      tags: { name: 'graphql-conversation-list' },
    }
  );

  const success = check(response, {
    'GraphQL Conversation List status 200': (r) => r.status === 200,
    'GraphQL Conversation List has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data?.conversations !== undefined;
      } catch {
        return false;
      }
    },
  });

  graphqlResponseTime.add(response.timings.duration);
  graphqlBandwidth.set(response.body.length);
  graphqlErrorRate.add(!success);
  graphqlRequests.add(1);

  return {
    success,
    duration: response.timings.duration,
    size: response.body.length,
  };
}

// ==========================================
// REST API Operations
// ==========================================

/**
 * REST: Admin Dashboard
 * 7 separate API calls to get same data as 1 GraphQL query
 */
function restAdminDashboard(token) {
  let totalDuration = 0;
  let totalSize = 0;
  let callCount = 0;
  let successCount = 0;

  // Call 1: Get system stats
  let response = http.get(`${REST_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-admin-stats' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05); // Small delay between calls

  // Call 2: Get total users
  response = http.get(`${REST_URL}/admin/users/count`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-admin-users-count' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 3: Get active users today
  response = http.get(`${REST_URL}/admin/users/active?period=today`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-admin-active-users' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 4: Get conversation count
  response = http.get(`${REST_URL}/chat/conversations/count`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-conversation-count' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 5: Get message count
  response = http.get(`${REST_URL}/chat/messages/count`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-message-count' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 6: Get top active users
  response = http.get(`${REST_URL}/admin/users/active/top?limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-top-active-users' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 7: Get system health
  response = http.get(`${REST_URL}/admin/health/system`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-system-health' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  const success = successCount === callCount;
  restResponseTime.add(totalDuration);
  restBandwidth.set(totalSize);
  restErrorRate.add(!success);
  restRequests.add(1);

  return { success, duration: totalDuration, size: totalSize };
}

/**
 * REST: User Profile
 * 3 separate API calls
 */
function restUserProfile(token, userId) {
  let totalDuration = 0;
  let totalSize = 0;
  let callCount = 0;
  let successCount = 0;

  // Call 1: Get user
  let response = http.get(`${REST_URL}/auth/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-user-profile' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 2: Get user conversations
  response = http.get(
    `${REST_URL}/chat/conversations?userId=${userId}&limit=5`,
    {
      headers: { Authorization: `Bearer ${token}` },
      tags: { name: 'rest-user-conversations' },
    }
  );
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 3: Get user analytics
  response = http.get(`${REST_URL}/admin/analytics/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { name: 'rest-user-analytics' },
  });
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  const success = successCount === callCount;
  restResponseTime.add(totalDuration);
  restBandwidth.set(totalSize);
  restErrorRate.add(!success);
  restRequests.add(1);

  return { success, duration: totalDuration, size: totalSize };
}

/**
 * REST: Conversation List
 * 2 separate API calls
 */
function restConversationList(token, userId) {
  let totalDuration = 0;
  let totalSize = 0;
  let callCount = 0;
  let successCount = 0;

  // Call 1: Get conversations
  let response = http.get(
    `${REST_URL}/chat/conversations?userId=${userId}&limit=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
      tags: { name: 'rest-conversations-list' },
    }
  );
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  sleep(0.05);

  // Call 2: Get messages for first conversation (pagination would require more calls)
  response = http.get(
    `${REST_URL}/chat/messages?conversationId=first&limit=3`,
    {
      headers: { Authorization: `Bearer ${token}` },
      tags: { name: 'rest-conversation-messages' },
    }
  );
  totalDuration += response.timings.duration;
  totalSize += response.body.length;
  callCount++;
  if (response.status === 200) successCount++;

  const success = successCount === callCount;
  restResponseTime.add(totalDuration);
  restBandwidth.set(totalSize);
  restErrorRate.add(!success);
  restRequests.add(1);

  return { success, duration: totalDuration, size: totalSize };
}

// ==========================================
// Main Test Execution
// ==========================================

export default function () {
  const token = generateAuthToken();
  const testUserId = 'test-user-123';

  // Scenario 1: Admin Dashboard (40% of iterations)
  if (Math.random() < 0.4) {
    group('Benchmark: Admin Dashboard', () => {
      group('GraphQL Query', () => {
        const graphql = graphqlAdminDashboard(token);
        sleep(0.5);
      });

      sleep(1);

      group('REST Calls (7 requests)', () => {
        const rest = restAdminDashboard(token);
        sleep(0.5);
      });

      // Calculate difference
      sleep(1);
    });
  }
  // Scenario 2: User Profile (35% of iterations)
  else if (Math.random() < 0.35) {
    group('Benchmark: User Profile', () => {
      group('GraphQL Query', () => {
        const graphql = graphqlUserProfile(token, testUserId);
        sleep(0.5);
      });

      sleep(1);

      group('REST Calls (3 requests)', () => {
        const rest = restUserProfile(token, testUserId);
        sleep(0.5);
      });
    });
  }
  // Scenario 3: Conversation List (25% of iterations)
  else {
    group('Benchmark: Conversation List', () => {
      group('GraphQL Query', () => {
        const graphql = graphqlConversationList(token, testUserId);
        sleep(0.5);
      });

      sleep(1);

      group('REST Calls (2 requests)', () => {
        const rest = restConversationList(token, testUserId);
        sleep(0.5);
      });
    });
  }

  sleep(Math.random() * 2 + 1);
}

// ==========================================
// Setup & Teardown
// ==========================================

export function setup() {
  console.log('='.repeat(60));
  console.log('GraphQL vs REST Performance Benchmarking');
  console.log('='.repeat(60));
  console.log(`GraphQL URL: ${GRAPHQL_URL}`);
  console.log(`REST URL: ${REST_URL}`);
  console.log('');
  console.log('Scenarios:');
  console.log('  1. Admin Dashboard: GraphQL (1 query) vs REST (7 calls)');
  console.log('  2. User Profile: GraphQL (1 query) vs REST (3 calls)');
  console.log('  3. Conversation List: GraphQL (1 query) vs REST (2 calls)');
  console.log('');
}

export function teardown(data) {
  console.log('');
  console.log('='.repeat(60));
  console.log('Benchmarking Complete!');
  console.log('='.repeat(60));
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    '/tmp/graphql-benchmark-report.json': JSON.stringify(data),
  };
}

/**
 * Simple text summary generator
 */
function textSummary(data, options) {
  const metrics = data.metrics || {};
  let summary = '\n\n📊 BENCHMARK RESULTS:\n\n';

  summary += '┌─ GraphQL Performance ─────────────────┐\n';
  if (metrics.graphql_response_time) {
    const t = metrics.graphql_response_time;
    summary += `│ Response Time (p95): ${t.values.p95?.toFixed(0)}ms\n`;
    summary += `│ Response Time (p99): ${t.values.p99?.toFixed(0)}ms\n`;
    summary += `│ Error Rate: ${((metrics.graphql_errors?.value || 0) * 100).toFixed(2)}%\n`;
  }
  summary += '└────────────────────────────────────────┘\n\n';

  summary += '┌─ REST Performance ────────────────────┐\n';
  if (metrics.rest_response_time) {
    const t = metrics.rest_response_time;
    summary += `│ Response Time (p95): ${t.values.p95?.toFixed(0)}ms\n`;
    summary += `│ Response Time (p99): ${t.values.p99?.toFixed(0)}ms\n`;
    summary += `│ Error Rate: ${((metrics.rest_errors?.value || 0) * 100).toFixed(2)}%\n`;
  }
  summary += '└────────────────────────────────────────┘\n\n';

  summary += '📈 IMPROVEMENT METRICS:\n';
  if (metrics.graphql_response_time && metrics.rest_response_time) {
    const graphqlP95 = metrics.graphql_response_time.values.p95 || 0;
    const restP95 = metrics.rest_response_time.values.p95 || 0;
    const improvement = (((restP95 - graphqlP95) / restP95) * 100).toFixed(1);
    summary += `✓ GraphQL is ${improvement}% faster (p95)\n`;
  }

  return summary;
}
