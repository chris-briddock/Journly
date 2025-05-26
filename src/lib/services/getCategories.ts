import { getApiUrl } from "../getApiUrl";

/**
 * Get all categories with graceful error handling
 */
export async function getCategories(isDashboard: boolean) {
  try {
    const response = isDashboard ?
    await fetch(getApiUrl('/api/categories?dashboard=true'), {
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }) : await fetch(getApiUrl('/api/categories'), {
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status, response.statusText);
      // Return empty array instead of throwing error to prevent build failures
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of throwing error to prevent build failures
    return [];
  }
}
