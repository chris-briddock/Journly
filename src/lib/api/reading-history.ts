import { apiGet, apiPost } from '@/lib/api-client';

export interface ReadingHistoryItem {
  id: string;
  lastRead: string;
  progress: number;
  completed: boolean;
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    createdAt: string;
    readingTime: number;
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
  };
}

export interface ReadingHistoryResponse {
  items: ReadingHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReadingHistoryFilters extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
}

/**
 * Fetch user's reading history
 */
export function fetchReadingHistory(filters: ReadingHistoryFilters = {}): Promise<ReadingHistoryResponse> {
  return apiGet<ReadingHistoryResponse>('/api/reading-history', filters);
}

/**
 * Record reading progress
 */
export function recordReadingProgress(
  postId: string,
  progress: number,
  completed: boolean = false
): Promise<ReadingHistoryItem> {
  return apiPost<ReadingHistoryItem>('/api/reading-history', {
    postId,
    progress,
    completed,
  });
}
