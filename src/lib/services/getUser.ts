import { User } from "@prisma/client";
import { getApiUrl } from "../getApiUrl";

/**
 * Get user profile by ID
 */
export async function getUser(id: string): Promise<User | null> {
  const url = getApiUrl(`/api/users/${id}`);

  // During build time, return null to prevent API calls
  if (!url) {
    console.log('[Build] Skipping user fetch during static generation');
    return null;
  }

  const response = await fetch(url, {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user');
  }

  return response.json();
}