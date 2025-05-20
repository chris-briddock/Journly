import { getApiUrl } from "../getApiUrl";

/**
 * Get a single post by ID
 */
export async function getPost(id: string) {
  const response = await fetch(getApiUrl(`/api/posts/${id}`), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }

  return response.json();
}