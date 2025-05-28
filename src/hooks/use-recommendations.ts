import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { apiGet } from '@/lib/api-client';

export interface RecommendedPost {
  id: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
}

/**
 * Fetch recommendations
 */
export function fetchRecommendations(limit: number = 3): Promise<RecommendedPost[]> {
  return apiGet<RecommendedPost[]>('/api/recommendations', { limit });
}

/**
 * Hook to fetch recommendations
 */
export function useRecommendations(limit: number = 3) {
  return useQuery({
    queryKey: queryKeys.recommendations.list(limit),
    queryFn: () => fetchRecommendations(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
