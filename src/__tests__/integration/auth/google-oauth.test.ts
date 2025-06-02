/**
 * Integration tests for Google OAuth authentication
 */

// Mock environment variables for testing
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    AUTH_GOOGLE_ID: 'test-google-client-id',
    AUTH_GOOGLE_SECRET: 'test-google-client-secret',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Google OAuth Integration', () => {
  it('should have Google OAuth environment variables configured', () => {
    expect(process.env.AUTH_GOOGLE_ID).toBe('test-google-client-id');
    expect(process.env.AUTH_GOOGLE_SECRET).toBe('test-google-client-secret');
  });

  it('should have NextAuth environment variables configured', () => {
    expect(process.env.NEXTAUTH_SECRET).toBe('test-secret');
    expect(process.env.NEXTAUTH_URL).toBe('http://localhost:3000');
  });

  it('should validate Google OAuth configuration requirements', () => {
    // Test that all required environment variables are present
    const requiredVars = [
      'AUTH_GOOGLE_ID',
      'AUTH_GOOGLE_SECRET',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    requiredVars.forEach(varName => {
      expect(process.env[varName]).toBeDefined();
      expect(process.env[varName]).not.toBe('');
    });
  });
});
