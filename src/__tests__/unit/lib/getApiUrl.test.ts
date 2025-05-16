import { getApiUrl } from '@/lib/getApiUrl';

describe('getApiUrl', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset window and process.env before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore window and process.env after each test
    global.window = originalWindow;
    process.env = originalEnv;
  });

  it('returns relative URL in browser environment', () => {
    // Ensure window is defined to simulate browser environment
    global.window = {} as Window & typeof globalThis;

    const path = '/api/posts';
    const result = getApiUrl(path);

    expect(result).toBe(path);
  });

  it('returns absolute URL in server environment with NEXT_PUBLIC_APP_URL', () => {
    // Delete window to simulate server environment
    // @ts-expect-error used to simulate server environment
    delete global.window;

    // Set NEXT_PUBLIC_APP_URL
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';

    const path = '/api/posts';
    const result = getApiUrl(path);

    expect(result).toBe('https://example.com/api/posts');
  });

  it('returns absolute URL with localhost fallback in server environment without NEXT_PUBLIC_APP_URL', () => {
    // Delete window to simulate server environment
    // @ts-expect-error used to simulate server environment
    delete global.window;

    // Delete NEXT_PUBLIC_APP_URL to test fallback
    delete process.env.NEXT_PUBLIC_APP_URL;

    const path = '/api/posts';
    const result = getApiUrl(path);

    expect(result).toBe('http://localhost:3000/api/posts');
  });

  it('adds leading slash if missing', () => {
    // Ensure window is defined to simulate browser environment
    global.window = {} as Window & typeof globalThis;

    const path = 'api/posts';
    const result = getApiUrl(path);

    expect(result).toBe('/api/posts');
  });
});
