import { setupWorker } from 'msw/browser';
import { authHandlers, seedMockUsers } from './handlers/auth.handlers';
import { profileHandlers } from './handlers/profile.handlers';

// Combine all handlers
const handlers = [...authHandlers, ...profileHandlers];

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
