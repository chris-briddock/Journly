import { getApiUrl } from "../getApiUrl";

/**
 * Check if a user is following another user
 */
export async function getIsFollowing(userId: string) {
  const url = getApiUrl(`/api/users/${userId}/is-following`);

  // During build time, return false to prevent API calls
  if (!url) {
    console.log('[Build] Returning false for following status during static generation');
    return false;
  }

  const response = await fetch(url, {
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