import { NextRequest, NextResponse } from 'next/server';
import { Session, User } from 'next-auth';

// Extend the User type to include role
interface ExtendedUser extends User {
  role?: string;
}

/**
 * Interface for request options
 */
export interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
  formData?: FormData;
}

/**
 * Creates a mock NextRequest object for testing API routes
 * @param options - Options for the request
 * @returns A mock NextRequest object
 */
export function createMockNextRequest(options: MockRequestOptions): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    headers = {},
    body = null,
    cookies = {},
    searchParams = {},
    formData,
  } = options;

  // Create URL with search params
  // Use a base URL for testing to avoid URL parsing errors
  const baseUrl = 'http://localhost:3000';
  const urlObj = new URL(url, baseUrl);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });

  // Create headers with content type if not provided
  const headersWithContentType = { ...headers };
  if (body && !headersWithContentType['content-type']) {
    headersWithContentType['content-type'] = 'application/json';
  }

  // Create a mock NextRequest
  const request = {
    method,
    url: urlObj.toString(),
    nextUrl: urlObj,
    headers: new Headers(headersWithContentType),
    json: jest.fn().mockResolvedValue(body),
    formData: formData ? jest.fn().mockResolvedValue(formData) : jest.fn(),
    cookies: {
      get: jest.fn((name: string) => {
        const cookie = cookies[name];
        return cookie ? { name, value: cookie } : undefined;
      }),
      has: jest.fn((name: string) => name in cookies),
      getAll: jest.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
    },
    clone: jest.fn().mockReturnThis(),
  } as unknown as NextRequest;

  // The cookies are already mocked in the request object

  return request;
}

/**
 * Creates mock params for API route handlers
 * @param params - The params object
 * @returns A promise that resolves to the params object
 */
export function createMockParams<T extends Record<string, string>>(params: T): Promise<T> {
  return Promise.resolve(params);
}

/**
 * Interface for session options
 */
export interface MockSessionOptions {
  authenticated?: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  image?: string | null;
}

/**
 * Creates a mock session for testing authenticated API routes
 * @param options - Options for the session
 * @returns A mock session object or null if not authenticated
 */
export function createMockSession(options: MockSessionOptions): Session | null {
  const {
    authenticated = true,
    userId = 'test-user-id',
    userName = 'Test User',
    userEmail = 'test@example.com',
    role = 'user',
    image = null,
  } = options;

  if (!authenticated) {
    return null;
  }

  // Create a session with the extended user type
  return {
    user: {
      id: userId,
      name: userName,
      email: userEmail,
      image,
      role,
    } as ExtendedUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Helper to create a NextResponse with JSON data
 * @param data - The data to include in the response
 * @param status - HTTP status code
 * @returns A NextResponse object
 */
export function createJsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
