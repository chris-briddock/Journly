import { User } from "@prisma/client";
import { getApiUrl } from "../getApiUrl";

/**
 * Get user profile by ID
 */
export async function getUser(id: string): Promise<User | null> {
  const response = await fetch(getApiUrl(`/api/users/${id}`), {
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