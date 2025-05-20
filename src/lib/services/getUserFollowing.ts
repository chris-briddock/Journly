import { getApiUrl } from "../getApiUrl";

/**
 * Get users that a specific user is following
 * @param userId The ID of the user
 * @param options Pagination options
 * @returns List of users that the specified user is following
 */
export async function getUserFollowing(userId: string, options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(getApiUrl(`/api/users/${userId}/following?${params.toString()}`), {
    next: { revalidate: 0 },
    credentials: 'include', // Include credentials (cookies) for authentication
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch following');
  }

  return response.json();
}
