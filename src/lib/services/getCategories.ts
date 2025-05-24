import { getApiUrl } from "../getApiUrl";

/**
 * Get all categories
 */
export async function getCategories(isDashboard: boolean) {
  const response = isDashboard ? 
  await fetch(getApiUrl('/api/categories?dashboard=true'), {
    next: { revalidate: 0 },
    cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
  }) : await fetch(getApiUrl('/api/categories'), {
    next: { revalidate: 0 },
    cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}
