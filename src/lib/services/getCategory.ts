import { getApiUrl } from "../getApiUrl";

/**
 * Get a single category by ID
 */
export async function getCategory(id: string) {
  const response = await fetch(getApiUrl(`/api/categories/${id}`), {
    next: { revalidate: 0 },
    credentials: 'include', // Include credentials (cookies) for authentication
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch category');
  }

  return response.json();
}