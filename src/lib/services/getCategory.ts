import { getApiUrl } from "../getApiUrl";

/**
 * Get a single category by ID with graceful error handling
 */
export async function getCategory(id: string) {
  try {
    const response = await fetch(getApiUrl(`/api/categories/${id}`), {
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error('Failed to fetch category:', response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}