import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchPosts,
  fetchPost,
  fetchPostForView,
  fetchPostForEdit,
  fetchPostPreview,
  fetchPostMetadata,
  fetchRecentPosts,
  fetchRelatedPosts,
  fetchScheduledPosts,
  fetchBookmarks,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostBookmark,
  fetchPostBookmarkStatus,
  fetchPostLikeStatus,
  schedulePost,
  bulkDeletePosts,
  bulkUpdatePostStatus,
  checkScheduledPosts,
  type PostFilters,
} from '@/lib/api/posts';
import { Post } from '@/types/models/post';

/**
 * Hook to fetch posts with filters
 */
export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: () => fetchPosts(filters),
    staleTime: 0
  });
}

/**
 * Hook to fetch a single post
 */
export function usePost(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchPost(id),
    enabled: enabled && !!id,
    staleTime: 0
  });
}

/**
 * Hook to fetch a post for viewing (increments view count)
 */
export function usePostForView(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchPostForView(id),
    enabled: enabled && !!id,
    staleTime: 0
  });
}

/**
 * Hook to fetch a post for editing
 */
export function usePostForEdit(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => fetchPostForEdit(id),
    enabled: enabled && !!id,
    staleTime: 0, // Always fresh for editing
  });
}

/**
 * Hook to fetch post preview
 */
export function usePostPreview(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.preview(id),
    queryFn: () => fetchPostPreview(id),
    enabled: enabled && !!id,
    staleTime: 0, // Always fresh for preview
  });
}

/**
 * Hook to fetch post metadata for SEO generation
 */
export function usePostMetadata(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.metadata(id),
    queryFn: () => fetchPostMetadata(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - metadata doesn't change often
  });
}

/**
 * Hook to fetch recent posts
 */
export function useRecentPosts(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.posts.recent(limit),
    queryFn: () => fetchRecentPosts(limit),
    staleTime: 0
  });
}

/**
 * Hook to fetch related posts
 */
export function useRelatedPosts(
  postId: string,
  categoryIds: string[],
  limit: number = 3,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.posts.related(postId, categoryIds),
    queryFn: () => fetchRelatedPosts(postId, categoryIds, limit),
    enabled: enabled && !!postId && categoryIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check article access
 */
export function useArticleAccess(postId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['article-access', postId],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/access`);
      if (!response.ok) {
        throw new Error('Failed to check article access');
      }
      return response.json();
    },
    enabled: enabled && !!postId,
    staleTime: 0, // Don't cache access checks
    retry: false, // Don't retry on failure
  });
}

/**
 * Hook to fetch scheduled posts
 */
export function useScheduledPosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.scheduled(filters),
    queryFn: () => fetchScheduledPosts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch post bookmark status
 */
export function usePostBookmarkStatus(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.bookmarks.status(id),
    queryFn: () => fetchPostBookmarkStatus(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch post like status
 */
export function usePostLikeStatus(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.likes.status(id),
    queryFn: () => fetchPostLikeStatus(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user bookmarks
 */
export function useBookmarks(filters: PostFilters = {}) {
  return useQuery({
    queryKey: queryKeys.bookmarks.list(filters),
    queryFn: () => fetchBookmarks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate posts lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      // Invalidate user posts (for dashboard posts page)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create post. Please try again.');
      console.error('Create post error:', error);
    },
  });
}

/**
 * Hook to update a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      updatePost(id, data),
    onSuccess: (updatedPost, { id }) => {
      // Update the specific post in cache
      queryClient.setQueryData(queryKeys.posts.detail(id), updatedPost);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      // Invalidate user posts (for dashboard posts page)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success('Post updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update post. Please try again.');
      console.error('Update post error:', error);
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      // Invalidate user posts (for dashboard posts page)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });

      toast.success('Post deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete post. Please try again.');
      console.error('Delete post error:', error);
    },
  });
}

/**
 * Hook to toggle post like
 */
export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));

      // Optimistically update like count (we'll get the actual result from the API)
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
          ...previousPost,
          likeCount: previousPost.likeCount + 1, // Optimistic increment
        });
      }

      return { previousPost };
    },
    onSuccess: (result, postId) => {
      // Update with actual result from API
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
          ...previousPost,
          likeCount: result.likesCount, // Use actual count from API
        });
      }

      toast.success(result.liked ? 'Post liked!' : 'Post unliked!');
    },
    onError: (_, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      toast.error('Failed to update like. Please try again.');
    },
    onSettled: (_, __, postId) => {
      // Always refetch after mutation to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}

/**
 * Hook to toggle post bookmark
 */
export function useTogglePostBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostBookmark,
    onSuccess: (result, postId) => {
      // Update bookmark status in cache
      queryClient.setQueryData(queryKeys.bookmarks.status(postId), result);

      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.lists() });

      toast.success(result.bookmarked ? 'Post bookmarked!' : 'Bookmark removed!');
    },
    onError: (error) => {
      toast.error('Failed to update bookmark. Please try again.');
      console.error('Toggle bookmark error:', error);
    },
  });
}

/**
 * Hook to schedule a post
 */
export function useSchedulePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, publishAt }: { postId: string; publishAt: Date }) =>
      schedulePost(postId, publishAt),
    onSuccess: () => {
      // Invalidate scheduled posts and dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success('Post scheduled successfully!');
    },
    onError: (error) => {
      toast.error('Failed to schedule post. Please try again.');
      console.error('Schedule post error:', error);
    },
  });
}

/**
 * Hook to bulk delete posts
 */
export function useBulkDeletePosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeletePosts,
    onSuccess: (result) => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success(`${result.deletedCount} post(s) deleted successfully!`);
    },
    onError: (error) => {
      toast.error('Failed to delete posts. Please try again.');
      console.error('Bulk delete posts error:', error);
    },
  });
}

/**
 * Hook to bulk update post status
 */
export function useBulkUpdatePostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postIds, status }: { postIds: string[]; status: 'published' | 'draft' }) =>
      bulkUpdatePostStatus(postIds, status),
    onSuccess: (result, { status }) => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      toast.success(`${result.updatedCount} post(s) updated to ${status} successfully!`);
    },
    onError: (error) => {
      toast.error('Failed to update posts. Please try again.');
      console.error('Bulk update posts error:', error);
    },
  });
}

/**
 * Hook to check for scheduled posts to publish
 */
export function useScheduledPostsPoller(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.posts.scheduledCheck(),
    queryFn: checkScheduledPosts,
    enabled,
    staleTime: 0, // Always fresh
    refetchInterval: 60 * 1000, // Poll every 60 seconds
    refetchIntervalInBackground: false, // Only poll when tab is active
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error instanceof Error && error.message.includes('401')) return false;
      if (error instanceof Error && error.message.includes('403')) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to manually check and publish scheduled posts
 */
export function useCheckScheduledPosts(options?: {
  onSuccess?: (data: { publishedCount: number }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkScheduledPosts,
    onSuccess: (data) => {
      // Invalidate scheduled posts and dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Check scheduled posts error:', error);
      options?.onError?.(error);
    },
  });
}

