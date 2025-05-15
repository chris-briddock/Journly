import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { createMockSession } from './auth-test-utils';

/**
 * Interface for mock request options
 */
export interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
  formData?: FormData;
  session?: Session | null;
}

/**
 * Creates a mock NextRequest object for testing API routes
 * @param options - Options for the request
 * @returns A mock NextRequest object
 */
export function createMockRequest(options: MockRequestOptions = {}): NextRequest {
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
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });

  // Create headers with content type if not provided
  const headersWithContentType = { ...headers };
  if (body && !headersWithContentType['content-type']) {
    headersWithContentType['content-type'] = 'application/json';
  }

  // Create request
  const request = new NextRequest(urlObj, {
    method,
    headers: headersWithContentType,
    body: body ? JSON.stringify(body) : null,
  });

  // Mock the json method
  request.json = jest.fn().mockResolvedValue(body);

  // Mock formData method if formData is provided
  if (formData) {
    request.formData = jest.fn().mockResolvedValue(formData);
  }

  // Mock cookies
  Object.entries(cookies).forEach(([key, value]) => {
    // This is a simplified mock since we can't directly set cookies on NextRequest
    Object.defineProperty(request.cookies, 'get', {
      value: jest.fn((name: string) => name === key ? { name, value } : undefined),
      configurable: true,
    });

    Object.defineProperty(request.cookies, 'has', {
      value: jest.fn((name: string) => name === key),
      configurable: true,
    });
  });

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
 * Helper to create a NextResponse with JSON data
 * @param data - The data to include in the response
 * @param status - HTTP status code
 * @returns A NextResponse object
 */
export function createJsonResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Mock the auth function from next-auth
 * @param session - The session to return
 * @returns A function that mocks the auth function
 */
export function mockAuth(session: Session | null = createMockSession()) {
  return jest.fn().mockResolvedValue(session);
}

/**
 * Interface for API route handler test context
 */
export interface ApiRouteTestContext {
  request: NextRequest;
  params?: Record<string, string>;
  session?: Session | null;
  auth?: jest.Mock;
}

/**
 * Creates a test context for API route handlers
 * @param options - Options for the test context
 * @returns A test context object
 */
export function createApiRouteTestContext(options: MockRequestOptions = {}): ApiRouteTestContext {
  const { session = createMockSession(), ...requestOptions } = options;
  
  return {
    request: createMockRequest(requestOptions),
    params: {},
    session,
    auth: mockAuth(session),
  };
}
