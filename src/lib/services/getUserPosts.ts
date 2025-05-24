import { getApiUrl } from "../getApiUrl";

/**
 * Get user posts by user ID
 */
export async function getUserPosts(userId: string, options: { limit?: number; page?: number } = {}) {
  const { limit = 9, page = 1 } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('status', 'published');

  const response = await fetch(getApiUrl(`/api/users/${userId}/posts?${params.toString()}`), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user posts');
  }

  return response.json();
}