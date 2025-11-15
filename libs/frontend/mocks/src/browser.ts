import { setupWorker } from 'msw/browser';
import { authHandlers, seedMockUsers } from './handlers/auth.handlers';

// Combine all handlers
const handlers = [...authHandlers];

// Setup MSW worker
export const worker = setupWorker(...handlers);

// Initialize mock data
export function initializeMocks() {
  seedMockUsers();
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}
