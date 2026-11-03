import { validateEnvironment } from './validate-environment';

describe('validateEnvironment', () => {
  it('accepts and returns configuration with a sufficiently long JWT secret', () => {
    const config = { JWT_SECRET: 'test-secret-value-that-is-at-least-32-characters' };
    expect(validateEnvironment(config)).toBe(config);
  });

  it.each([undefined, '', 'short'])('rejects an absent or weak JWT secret', (JWT_SECRET) => {
    expect(() => validateEnvironment({ JWT_SECRET })).toThrow(
      'JWT_SECRET must be set to at least 32 characters',
    );
  });
});
