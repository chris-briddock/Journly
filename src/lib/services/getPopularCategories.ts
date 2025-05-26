import { getApiUrl } from "../getApiUrl";

/**
 * Get popular categories with caching
 */
export async function getPopularCategories(limit = 10) {
  try {
    const url = getApiUrl(`/api/categories/popular?limit=${limit}`);

    // During build time, return empty array to prevent API calls
    if (!url) {
      console.log('[Build] Returning empty categories array during static generation');
      return [];
    }

    const response = await fetch(url, {
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch popular categories:', response.status, response.statusText);
      // Return empty array instead of throwing error to prevent build failures
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    // Return empty array instead of throwing error to prevent build failures
    return [];
  }
}