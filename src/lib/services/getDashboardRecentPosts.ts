import { getApiUrl } from "../getApiUrl";
import { Post } from "@/types/models/post";

/**
 * Get recent posts for the current user's dashboard
 * @param limit Maximum number of posts to return
 * @returns List of recent posts
 */
export async function getDashboardRecentPosts(limit = 5): Promise<Post[]> {
  try {
    const response = await fetch(getApiUrl(`/api/dashboard/recent-posts?limit=${limit}`), {
      next: { revalidate: 0 },
      credentials: 'include', // Include credentials (cookies) for authentication
      cache: 'no-store', // Disable caching to ensure fresh data
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent posts');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}
