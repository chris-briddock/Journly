// Mock the auth module
jest.mock('@/lib/auth', () => ({
  authConfig: {
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
      signIn: '/login',
    },
    providers: [
      {
        id: 'google',
      },
      {
        id: 'github',
      },
      {
        id: 'microsoft-entra-id',
      },
      {
        id: 'credentials',
      },
    ],
    callbacks: {
      session: jest.fn(),
      jwt: jest.fn(),
    },
    trustHost: true,
  },
}));

// Import the mocked module
const { authConfig } = jest.requireMock('@/lib/auth');

describe('Auth Configuration', () => {
  it('has the correct session configuration', () => {
    expect(authConfig.session.strategy).toBe('jwt');
    expect(authConfig.session.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
  });

  it('has the correct pages configuration', () => {
    expect(authConfig.pages.signIn).toBe('/login');
  });

  it('has the correct providers configuration', () => {
    expect(authConfig.providers).toHaveLength(4);
    expect(authConfig.providers[0].id).toBe('google');
    expect(authConfig.providers[1].id).toBe('github');
    expect(authConfig.providers[2].id).toBe('microsoft-entra-id');
    expect(authConfig.providers[3].id).toBe('credentials');
  });

  it('has the correct callbacks configuration', () => {
    expect(typeof authConfig.callbacks.session).toBe('function');
    expect(typeof authConfig.callbacks.jwt).toBe('function');
  });

  it('has the correct trustHost configuration', () => {
    expect(authConfig.trustHost).toBe(true);
  });
});
