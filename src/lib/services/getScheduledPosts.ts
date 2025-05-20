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

  const response = await fetch(getApiUrl(`/api/posts/schedule?${params.toString()}`), {
    next: { revalidate: 0 },
    credentials: 'include', // Include credentials (cookies) for authentication
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled posts');
  }

  return response.json();
}
