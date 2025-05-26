import { getApiUrl } from "../getApiUrl";

/**
 * Get posts with optional filtering and pagination
 */
export async function getPosts(options: {
  page?: number;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  status?: string;
  q?: string;
}) {
  const { page = 1, limit = 10, categoryId, authorId, status, q } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (categoryId) params.append('categoryId', categoryId);
  if (authorId) params.append('authorId', authorId);
  if (status) params.append('status', status);
  if (q) params.append('q', q);

  try {
    const response = await fetch(getApiUrl(`/api/posts?${params.toString()}`), {
      // Cache for 2 minutes to reduce API calls
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      console.error('Failed to fetch posts:', response.status, response.statusText);
      return { posts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }
}