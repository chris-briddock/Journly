import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchReadingHistory,
  recordReadingProgress,
  type ReadingHistoryFilters,
} from '@/lib/api/reading-history';

/**
 * Hook to fetch reading history
 */
export function useReadingHistory(filters: ReadingHistoryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.readingHistory.list(filters),
    queryFn: () => fetchReadingHistory(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to record reading progress
 */
export function useRecordReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, progress, completed }: { postId: string; progress: number; completed?: boolean }) =>
      recordReadingProgress(postId, progress, completed),
    onSuccess: () => {
      // Invalidate reading history
      queryClient.invalidateQueries({ queryKey: queryKeys.readingHistory.lists() });
    },
    onError: (error) => {
      console.error('Record reading progress error:', error);
      // Don't show toast for reading progress errors as they happen frequently
    },
  });
}
