import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { Post } from '@/types/models/post';

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostFilters extends Record<string, string | number | boolean | undefined> {
  page?: number;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  status?: 'published' | 'draft' | 'scheduled';
  q?: string;
}

/**
 * Fetch posts with optional filters
 */
export function fetchPosts(filters: PostFilters = {}): Promise<PostsResponse> {
  return apiGet<PostsResponse>('/api/posts', filters);
}

/**
 * Fetch a single post by ID
 */
export function fetchPost(id: string): Promise<Post> {
  return apiGet<Post>(`/api/posts/${id}`);
}

/**
 * Fetch a post for viewing (increments view count)
 */
export function fetchPostForView(id: string): Promise<Post> {
  return apiGet<Post>(`/api/posts/${id}/view`);
}

/**
 * Fetch post metadata for SEO generation
 */
export function fetchPostMetadata(id: string): Promise<{
  title: string;
  description: string;
  keywords?: string;
  authors: Array<{ name: string }>;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    type: string;
    publishedTime?: string;
    authors: string[];
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
    };
  };
  alternates: {
    canonical: string;
  };
  post: {
    id: string;
    title: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    publishedAt: Date | null;
    categories: Array<{
      category: {
        id: string;
        name: string;
      };
    }>;
  };
}> {
  return apiGet(`/api/posts/${id}/metadata`);
}

/**
 * Fetch a post for editing (dashboard)
 */
export function fetchPostForEdit(id: string): Promise<Post> {
  return apiGet<Post>(`/api/posts/${id}/edit`, { dashboard: 'true' });
}

/**
 * Fetch post preview
 */
export function fetchPostPreview(id: string): Promise<Post> {
  return apiGet<Post>(`/api/posts/${id}/preview`);
}

/**
 * Fetch recent posts
 */
export function fetchRecentPosts(limit: number = 5): Promise<Post[]> {
  return apiGet<Post[]>('/api/posts/recent', { limit });
}

/**
 * Fetch related posts
 */
export function fetchRelatedPosts(
  postId: string,
  categoryIds: string[],
  limit: number = 3
): Promise<Post[]> {
  return apiGet<Post[]>(`/api/posts/${postId}/related`, {
    categoryIds: categoryIds.join(','),
    limit,
  });
}

/**
 * Fetch scheduled posts
 */
export function fetchScheduledPosts(filters: PostFilters = {}): Promise<PostsResponse> {
  return apiGet<PostsResponse>('/api/posts/schedule', filters);
}

/**
 * Create a new post
 */
export function createPost(data: Partial<Post>): Promise<Post> {
  return apiPost<Post>('/api/posts', data);
}

/**
 * Update a post
 */
export function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  return apiPut<Post>(`/api/posts/${id}`, data);
}

/**
 * Delete a post
 */
export function deletePost(id: string): Promise<void> {
  return apiDelete<void>(`/api/posts/${id}`);
}

/**
 * Like/unlike a post
 */
export function togglePostLike(id: string): Promise<{ liked: boolean; likesCount: number }> {
  return apiPost<{ liked: boolean; likesCount: number }>(`/api/posts/${id}/like`);
}

/**
 * Bookmark/unbookmark a post
 */
export function togglePostBookmark(id: string): Promise<{ bookmarked: boolean }> {
  return apiPost<{ bookmarked: boolean }>(`/api/posts/${id}/bookmark`);
}

/**
 * Get bookmark status for a post
 */
export function fetchPostBookmarkStatus(id: string): Promise<{ bookmarked: boolean }> {
  return apiGet<{ bookmarked: boolean }>(`/api/posts/${id}/bookmark-status`);
}

/**
 * Get like status for a post
 */
export function fetchPostLikeStatus(id: string): Promise<{ liked: boolean }> {
  return apiGet<{ liked: boolean }>(`/api/posts/${id}/like-status`);
}

/**
 * Schedule a post
 */
export function schedulePost(postId: string, publishAt: Date): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/api/posts/schedule', {
    postId,
    publishAt: publishAt.toISOString(),
  });
}

/**
 * Fetch user bookmarks
 */
export function fetchBookmarks(filters: PostFilters = {}): Promise<{
  posts: (Post & { bookmarkedAt: string })[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}> {
  return apiGet('/api/bookmarks', filters);
}

/**
 * Fetch post comments
 */
export function fetchPostComments(postId: string): Promise<Comment[]> {
  return apiGet<Comment[]>(`/api/posts/${postId}/comments`);
}

/**
 * Create a comment
 */
export function createComment(postId: string, content: string, parentId?: string): Promise<Comment> {
  return apiPost<Comment>('/api/comments', { postId, content, parentId });
}

/**
 * Bulk delete posts
 */
export function bulkDeletePosts(postIds: string[]): Promise<{ deletedCount: number }> {
  return apiPost<{ deletedCount: number }>('/api/posts/bulk-delete', { postIds });
}

/**
 * Bulk update post status
 */
export function bulkUpdatePostStatus(postIds: string[], status: 'published' | 'draft'): Promise<{ updatedCount: number }> {
  return apiPost<{ updatedCount: number }>('/api/posts/bulk-update', { postIds, status });
}

/**
 * Check for scheduled posts to publish
 */
export function checkScheduledPosts(): Promise<{
  success: boolean;
  message: string;
  publishedCount: number;
  publishedPostIds?: string[];
}> {
  return apiGet<{
    success: boolean;
    message: string;
    publishedCount: number;
    publishedPostIds?: string[];
  }>('/api/cron/publish-scheduled');
}

interface Comment {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}


