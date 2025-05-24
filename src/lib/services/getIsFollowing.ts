import { getApiUrl } from "../getApiUrl";

/**
 * Check if a user is following another user
 */
export async function getIsFollowing(userId: string) {
  const response = await fetch(getApiUrl(`/api/users/${userId}/is-following`), {
    next: { revalidate: 0 },
    credentials: 'include', // Include credentials (cookies) for authentication
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to check follow status');
  }

  const data = await response.json();
  return data.isFollowing;
}