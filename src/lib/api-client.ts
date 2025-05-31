import { getApiUrl } from './getApiUrl';

/**
 * API Client for making HTTP requests
 * Handles common patterns like error handling, authentication, etc.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base API client function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const apiUrl = getApiUrl(url);

  // During build time, throw an error to prevent API calls
  if (!apiUrl) {
    throw new Error('API calls are not available during build time');
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
    ...fetchOptions,
  };

  let response: Response;
  try {
    response = await fetch(apiUrl, defaultOptions);
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      throw new ApiError(`Network Error: ${error.message}`, 0, 'Network Error');
    }
    throw new ApiError('Network Error: Failed to fetch', 0, 'Network Error');
  }

  if (!response.ok) {
    let errorMessage = `${response.statusText}`;

    // Try to get more specific error message from response body
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = `${errorMessage} - ${errorData.error}`;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }

    throw new ApiError(errorMessage, response.status, response.statusText);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

/**
 * GET request
 */
export function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', params });
}

/**
 * POST request
 */
export function apiPost<T>(
  endpoint: string,
  data?: Record<string, unknown> | unknown[],
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request
 */
export function apiPut<T>(
  endpoint: string,
  data?: Record<string, unknown> | unknown[],
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request
 */
export function apiPatch<T>(
  endpoint: string,
  data?: Record<string, unknown> | unknown[],
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request
 */
export function apiDelete<T>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}
