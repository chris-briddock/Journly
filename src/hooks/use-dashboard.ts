import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiGet } from '@/lib/api-client';

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
 * Fetch dashboard stats
 */
export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiGet<DashboardStats>('/api/dashboard/stats');
}

/**
 * Hook to fetch dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to dashboard
  });
}
