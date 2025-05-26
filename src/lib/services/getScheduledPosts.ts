import { getApiUrl } from "../getApiUrl";

/**
 * Get scheduled posts for the current user
 * @param options Pagination options
 * @returns List of scheduled posts
 */
export async function getScheduledPosts(options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  try {
    const url = getApiUrl(`/api/posts/schedule?${params.toString()}`);

    // During build time, return empty result to prevent API calls
    if (!url) {
      console.log('[Build] Returning empty scheduled posts result during static generation');
      return { posts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    const response = await fetch(url, {
      // Cache for 1 minute to reduce API calls
      next: { revalidate: 60 },
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch scheduled posts:', response.status, response.statusText);
      return { posts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return { posts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }
}
