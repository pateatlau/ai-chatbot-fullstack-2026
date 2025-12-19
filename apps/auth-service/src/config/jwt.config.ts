// JWT Configuration
// Use getter functions to ensure values are read AFTER dotenv loads
// This prevents the values from being cached at module load time

export function getJWTSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

export function getJWTRefreshSecret(): string {
  return (
    process.env.JWT_REFRESH_SECRET ||
    'your-refresh-secret-key-change-in-production'
  );
}

export function getJWTExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '15m';
}

export function getJWTRefreshExpiresIn(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
}

// Legacy exports for backward compatibility - these call the getter functions
export const JWT_SECRET = getJWTSecret();
export const JWT_REFRESH_SECRET = getJWTRefreshSecret();
export const JWT_EXPIRES_IN = getJWTExpiresIn();
export const JWT_REFRESH_EXPIRES_IN = getJWTRefreshExpiresIn();
