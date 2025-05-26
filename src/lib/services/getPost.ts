import { getApiUrl } from "../getApiUrl";

/**
 * Get a single post by ID
 */
export async function getPost(id: string) {
  const url = getApiUrl(`/api/posts/${id}`);

  // During build time, return null to prevent API calls
  if (!url) {
    console.log('[Build] Skipping post fetch during static generation');
    return null;
  }

  const response = await fetch(url, {
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