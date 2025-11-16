import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';

// Combine all handlers
const handlers = [...authHandlers];

// Setup MSW server for Node.js (testing)
export const server = setupServer(...handlers);
