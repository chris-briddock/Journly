/**
 * Get the correct API URL for server-side and client-side requests
 */
export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const apiPath = path.startsWith("/") ? path : `/${path}`

  // Use absolute URLs on server
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return `${baseUrl.replace(/\/$/, "")}${apiPath}`
}
