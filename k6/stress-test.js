import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');

// Configuration for stress testing
const BASE_URL = __ENV.BASE_URL || 'http://localhost:80';

export const options = {
  stages: [
    // Ramp-up slowly
    { duration: '2m', target: 100 }, // Get to 100 users
    { duration: '5m', target: 300 }, // Increase to 300
    { duration: '2m', target: 500 }, // Push to 500
    { duration: '5m', target: 1000 }, // Stress at 1000 users
    { duration: '3m', target: 1500 }, // Peak stress at 1500
    { duration: '5m', target: 1500 }, // Hold at peak
    { duration: '5m', target: 100 }, // Recover
    { duration: '2m', target: 0 }, // Cool down
  ],
  thresholds: {
    // Allow degraded performance under stress
    http_req_duration: ['p(95)<2000'], // 95% under 2s
    errors: ['rate<0.05'], // 5% error rate acceptable
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // Simple health check endpoint stress
  const response = http.get(`${BASE_URL}/api/auth/health`);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
  responseTrend.add(response.timings.duration);

  sleep(0.5); // Very short sleep for high load
}

export function setup() {
  console.log('Starting STRESS test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('WARNING: This will push the system to its limits!');
}
