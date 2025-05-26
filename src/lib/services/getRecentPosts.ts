import { getApiUrl } from "../getApiUrl";
import { Post } from "@/types/models/post";

/**
 * Get recent posts with caching
 */
export async function getRecentPosts(limit = 5): Promise<Post[]> {
  try {
    const url = getApiUrl(`/api/posts/recent?limit=${limit}`);

    // During build time, return empty array to prevent API calls
    if (!url) {
      console.log('[Build] Returning empty posts array during static generation');
      return [];
    }

    const response = await fetch(url, {
      // Cache for 2 minutes to reduce API calls
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      console.error('Failed to fetch recent posts:', response.status, response.statusText);
      return [];
    }

    return response.json() as Promise<Post[]>;
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}