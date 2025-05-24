import { getApiUrl } from "../getApiUrl";

/**
 * Get followers of a specific user
 * @param userId The ID of the user
 * @param options Pagination options
 * @returns List of users who follow the specified user
 */
export async function getUserFollowers(userId: string, options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(getApiUrl(`/api/users/${userId}/followers?${params.toString()}`), {
    next: { revalidate: 0 },
    credentials: 'include', // Include credentials (cookies) for authentication
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch followers');
  }

  return response.json();
}
