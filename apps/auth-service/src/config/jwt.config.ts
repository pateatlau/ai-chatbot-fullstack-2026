// JWT Configuration
// These values are guaranteed to have defaults if not set in environment
const JWT_SECRET_VALUE =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET_VALUE =
  process.env.JWT_REFRESH_SECRET ||
  'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN_VALUE = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN_VALUE = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Export as const strings (TypeScript knows these are always strings)
export const JWT_SECRET = JWT_SECRET_VALUE as string;
export const JWT_REFRESH_SECRET = JWT_REFRESH_SECRET_VALUE as string;
export const JWT_EXPIRES_IN = JWT_EXPIRES_IN_VALUE as string;
export const JWT_REFRESH_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN_VALUE as string;
