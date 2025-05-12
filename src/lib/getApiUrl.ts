/**
 * Utility function to get the correct API URL for server-side and client-side requests
 * 
 * This function handles the different environments:
 * - In the browser: Uses relative URLs
 * - In server-side rendering: Uses absolute URLs with the correct origin
 * - In Vercel build/deployment: Uses absolute URLs with the correct origin
 * 
 * @param path The API path (should start with a slash)
 * @returns The complete URL to use for API requests
 */
export function getApiUrl(path: string): string {
  // Make sure path starts with a slash
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // In the browser, we can use relative URLs
    return apiPath;
  } else {
    // In server-side rendering, we need to use absolute URLs
    // Use NEXT_PUBLIC_APP_URL if available, otherwise fall back to a default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}${apiPath}`;
  }
}
