import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiGet } from '@/lib/api-client';

export interface PostAnalytics {
  id: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: string;
  createdAt: Date;
  publishedAt: Date | null;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export interface PostAnalyticsResponse {
  posts: PostAnalytics[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AnalyticsFilters {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface EngagementData {
  id: string;
  title: string;
  fullTitle: string;
  views: number;
  likes: number;
  comments: number;
  totalEngagement: number;
  engagementRate: number;
  publishedAt: Date | null;
  categories: string[];
}

export interface CategoryDistribution {
  id: string;
  name: string;
  postCount: number;
  percentage: number;
}

export interface WeeklyTrend {
  week: string;
  views: number;
  likes: number;
  comments: number;
  posts: number;
}

export interface EngagementAnalyticsResponse {
  engagementByPost: EngagementData[];
  categoryDistribution: CategoryDistribution[];
  weeklyTrends: WeeklyTrend[];
  summary: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    averageEngagementRate: number;
    totalPosts: number;
    totalCategories: number;
  };
}

/**
 * Fetch post analytics
 */
export function fetchPostAnalytics(filters: AnalyticsFilters = {}): Promise<PostAnalyticsResponse> {
  return apiGet<PostAnalyticsResponse>('/api/analytics/posts', filters);
}

/**
 * Hook to fetch post analytics
 */
export function usePostAnalytics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.posts(filters),
    queryFn: () => fetchPostAnalytics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch engagement analytics
 */
export function fetchEngagementAnalytics(): Promise<EngagementAnalyticsResponse> {
  return apiGet<EngagementAnalyticsResponse>('/api/analytics/engagement');
}

/**
 * Hook to fetch engagement analytics
 */
export function useEngagementAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.engagement(),
    queryFn: () => fetchEngagementAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
