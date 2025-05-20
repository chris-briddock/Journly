import { getApiUrl } from "../getApiUrl";
import { Post } from "@/types/models/post";

/**
 * Get recent posts
 */
export async function getRecentPosts(limit = 5): Promise<Post[]> {
  const response = await fetch(getApiUrl(`/api/posts/recent?limit=${limit}`), {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent posts');
  }

  return response.json() as Promise<Post[]>;
}