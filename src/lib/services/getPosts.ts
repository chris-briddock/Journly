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

  const response = await fetch(getApiUrl(`/api/posts?${params.toString()}`), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}