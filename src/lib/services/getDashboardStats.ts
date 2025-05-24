import { getApiUrl } from "../getApiUrl";

/**
 * Interface for dashboard statistics
 */
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

/**
 * Get dashboard statistics for the current user
 * @returns Dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await fetch(getApiUrl('/api/dashboard/stats'), {
      next: { revalidate: 0 },
      credentials: 'include', // Include credentials (cookies) for authentication
      cache: 'no-store', // Disable caching to ensure fresh data
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values if the API call fails
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      scheduledPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }
}
