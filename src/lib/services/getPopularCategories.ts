import { getApiUrl } from "../getApiUrl";

/**
 * Get popular categories
 */
export async function getPopularCategories(limit = 10) {
  const response = await fetch(getApiUrl(`/api/categories/popular?limit=${limit}`), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular categories');
  }

  return response.json();
}