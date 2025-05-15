// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Extend Jest matchers
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Configure Testing Library
import { configure } from '@testing-library/react';

configure({
  // Increase the timeout for async utilities like waitFor
  asyncUtilTimeout: 5000,
  // Throw more helpful errors
  getElementError: (message) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = null;
    return error;
  },
});

// Polyfill for TextEncoder/TextDecoder and Request/Response
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Headers, Request and Response for Next.js API routes
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.headers = {};
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value);
        });
      }
    }

    append(name, value) {
      name = name.toLowerCase();
      if (this.headers[name]) {
        this.headers[name] += `, ${value}`;
      } else {
        this.headers[name] = value;
      }
    }

    delete(name) {
      delete this.headers[name.toLowerCase()];
    }

    get(name) {
      return this.headers[name.toLowerCase()] || null;
    }

    has(name) {
      return name.toLowerCase() in this.headers;
    }

    set(name, value) {
      this.headers[name.toLowerCase()] = value;
    }

    forEach(callback) {
      Object.entries(this.headers).forEach(([name, value]) => {
        callback(value, name, this);
      });
    }
  };
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = input instanceof Request ? input.url : input;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers || {});
      this.body = init.body || null;
      this.bodyUsed = false;
      this.cache = init.cache || 'default';
      this.credentials = init.credentials || 'same-origin';
      this.destination = '';
      this.integrity = '';
      this.keepalive = init.keepalive || false;
      this.mode = init.mode || 'cors';
      this.redirect = init.redirect || 'follow';
      this.referrer = init.referrer || 'about:client';
      this.referrerPolicy = init.referrerPolicy || '';
    }

    clone() {
      return new Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        cache: this.cache,
        credentials: this.credentials,
        keepalive: this.keepalive,
        mode: this.mode,
        redirect: this.redirect,
        referrer: this.referrer,
        referrerPolicy: this.referrerPolicy,
      });
    }

    async json() {
      return this.body ? JSON.parse(this.body) : null;
    }

    async text() {
      return this.body ? this.body.toString() : '';
    }

    async formData() {
      return new FormData();
    }
  };
}

if (typeof FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }

    append(name, value) {
      if (this.data.has(name)) {
        const values = this.data.get(name);
        values.push(value);
      } else {
        this.data.set(name, [value]);
      }
    }

    delete(name) {
      this.data.delete(name);
    }

    get(name) {
      return this.data.has(name) ? this.data.get(name)[0] : null;
    }

    getAll(name) {
      return this.data.has(name) ? [...this.data.get(name)] : [];
    }

    has(name) {
      return this.data.has(name);
    }

    set(name, value) {
      this.data.set(name, [value]);
    }

    entries() {
      return Array.from(this.data.entries()).flatMap(([name, values]) =>
        values.map(value => [name, value])
      );
    }

    keys() {
      return Array.from(this.data.keys());
    }

    values() {
      return Array.from(this.data.values()).flat();
    }

    forEach(callback) {
      for (const [name, values] of this.data.entries()) {
        for (const value of values) {
          callback(value, name, this);
        }
      }
    }
  };
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Headers(init.headers || {});
      this.type = 'default';
      this.url = '';
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
    }

    async json() {
      return this.body ? JSON.parse(this.body) : null;
    }

    async text() {
      return this.body ? this.body.toString() : '';
    }

    clone() {
      return new Response(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
  };
}

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: React.createElement') ||
      args[0].includes('Error: Not implemented'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    __esModule: true,
    NextResponse: {
      json: jest.fn((data, options = {}) => {
        return {
          status: options.status || 200,
          headers: new Headers(options.headers || {}),
          json: jest.fn().mockResolvedValue(data),
          clone: jest.fn().mockReturnThis(),
        };
      }),
      redirect: jest.fn((url) => {
        return {
          status: 302,
          headers: new Headers({ Location: url }),
          json: jest.fn().mockRejectedValue(new Error('Cannot call json() on redirect response')),
          clone: jest.fn().mockReturnThis(),
        };
      }),
      next: jest.fn((options = {}) => {
        return {
          status: 200,
          headers: new Headers(options.headers || {}),
          json: jest.fn().mockResolvedValue({}),
          clone: jest.fn().mockReturnThis(),
        };
      }),
    },
    NextRequest: jest.fn().mockImplementation((url, options = {}) => {
      return {
        url,
        method: options.method || 'GET',
        headers: new Headers(options.headers || {}),
        json: jest.fn().mockResolvedValue(options.body ? JSON.parse(options.body) : null),
        formData: jest.fn().mockResolvedValue(new FormData()),
        cookies: {
          get: jest.fn(),
          has: jest.fn(),
          getAll: jest.fn(),
        },
        clone: jest.fn().mockReturnThis(),
        nextUrl: new URL(url),
      };
    }),
  };
});

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

const mockSearchParams = {
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  toString: jest.fn(),
  delete: jest.fn(),
  append: jest.fn(),
  set: jest.fn(),
  sort: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
  redirect: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  return {
    __esModule: true,
    signIn: jest.fn().mockResolvedValue({ ok: true }),
    signOut: jest.fn().mockResolvedValue({ ok: true }),
    useSession: jest.fn(() => {
      return {
        data: {
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
            role: 'user',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        status: 'authenticated',
        update: jest.fn(),
      };
    }),
    getSession: jest.fn(() => {
      return Promise.resolve({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          image: null,
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }),
    getCsrfToken: jest.fn(() => {
      return Promise.resolve('mocked-csrf-token');
    }),
    getProviders: jest.fn(() => {
      return Promise.resolve({
        google: {
          id: 'google',
          name: 'Google',
          type: 'oauth',
          signinUrl: 'https://example.com/api/auth/signin/google',
          callbackUrl: 'https://example.com/api/auth/callback/google',
        },
        github: {
          id: 'github',
          name: 'GitHub',
          type: 'oauth',
          signinUrl: 'https://example.com/api/auth/signin/github',
          callbackUrl: 'https://example.com/api/auth/callback/github',
        },
      });
    }),
  };
});

// Mock next-auth
jest.mock('next-auth', () => {
  return {
    __esModule: true,
    auth: jest.fn(() => Promise.resolve({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })),
    handlers: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    signIn: jest.fn().mockResolvedValue({ ok: true }),
    signOut: jest.fn().mockResolvedValue({ ok: true }),
    unstable_update: jest.fn(),
    default: jest.fn(),
  };
});

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock prisma
jest.mock('@/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      comment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      like: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      follow: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback({
        user: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        post: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        category: {
          update: jest.fn(),
        },
        postCategory: {
          createMany: jest.fn(),
        },
      })),
    },
  };
});
