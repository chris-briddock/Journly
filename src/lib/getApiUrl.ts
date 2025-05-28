/**
 * Get the correct API URL for server-side and client-side requests
 * Returns null during build time to prevent API calls during static generation
 */
export function getApiUrl(path: string): string | null {
  // Ensure path starts with /
  const apiPath = path.startsWith("/") ? path : `/${path}`

  // Check if we're in build time (static generation)
  const isBuildTime = process.env.NODE_ENV === 'production' &&
                     process.env.NEXT_PHASE === 'phase-production-build';

  // During build time, return null to prevent API calls
  if (isBuildTime) {
    console.log(`[Build] Skipping API call to ${apiPath} during static generation`);
    return null;
  }

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // In the browser, we can use relative URLs
    return apiPath;
  }

  // Use absolute URLs on server
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return `${baseUrl.replace(/\/$/, "")}${apiPath}`
}
