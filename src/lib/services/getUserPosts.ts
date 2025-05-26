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

  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}/posts?${params.toString()}`), {
      // Cache for 2 minutes to reduce API calls
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      console.error('Failed to fetch user posts:', response.status, response.statusText);
      return { posts: [], pagination: { total: 0, page: 1, limit: 9, totalPages: 0 } };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return { posts: [], pagination: { total: 0, page: 1, limit: 9, totalPages: 0 } };
  }
}