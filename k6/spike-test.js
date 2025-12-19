import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike test - sudden traffic surge
const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Normal load
    { duration: '10s', target: 1000 }, // SPIKE!
    { duration: '3m', target: 1000 }, // Stay at spike
    { duration: '10s', target: 50 }, // Drop
    { duration: '2m', target: 50 }, // Recovery
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Allow degradation during spike
    http_req_failed: ['rate<0.1'], // 10% failure acceptable
  },
};

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/auth/health`],
    ['GET', `${BASE_URL}/api/admin/health`],
    ['GET', `${BASE_URL}/api/chat/health`],
  ]);

  check(responses[0], {
    'auth health is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function setup() {
  console.log('Starting SPIKE test...');
  console.log(
    'Simulating sudden traffic surge (e.g., viral post, email campaign)'
  );
}
