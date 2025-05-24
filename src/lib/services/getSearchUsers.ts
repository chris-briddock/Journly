import { getApiUrl } from "../getApiUrl";

/**
 * Search users for mentions
 * @param query Search query
 * @param limit Maximum number of results to return
 * @returns Array of users matching the query
 */
export async function searchUsers(query: string = '', limit: number = 10) {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('limit', limit.toString());

  const response = await fetch(getApiUrl(`/api/users/search?${params.toString()}`), {
    next: { revalidate: 0 } // Don't cache user search results
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  return response.json();
}