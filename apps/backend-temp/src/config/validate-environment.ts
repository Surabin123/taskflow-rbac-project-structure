export function validateEnvironment(config: Record<string, unknown>) {
  const jwtSecret = config.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return config;
}
