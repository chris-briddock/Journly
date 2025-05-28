import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '@/lib/api/comments';

/**
 * Hook to fetch post comments
 */
export function usePostComments(postId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.comments.list(postId),
    queryFn: () => fetchComments(postId),
    enabled: enabled && !!postId,
    staleTime: 30 * 1000, // 30 seconds - comments change frequently
  });
}

/**
 * Hook to create a comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, { postId }) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(postId) });

      // Invalidate the post to update comment count
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });

      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      toast.error('Failed to add comment. Please try again.');
      console.error('Create comment error:', error);
    },
  });
}

/**
 * Hook to update a comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, content),
    onSuccess: (updatedComment) => {
      // Update the specific comment in cache
      queryClient.setQueryData(queryKeys.comments.detail(updatedComment.id), updatedComment);

      // Invalidate the comments list for the post
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(updatedComment.postId) });

      toast.success('Comment updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update comment. Please try again.');
      console.error('Update comment error:', error);
    },
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.comments.detail(deletedId) });

      // Invalidate comments lists (we don't know which post it belongs to)
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      toast.success('Comment deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete comment. Please try again.');
      console.error('Delete comment error:', error);
    },
  });
}

/**
 * Hook to like/unlike a comment
 */
export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCommentLike,
    onSuccess: (result) => {
      // Invalidate comments lists to update like counts
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.lists() });

      toast.success(result.liked ? 'Comment liked!' : 'Comment unliked!');
    },
    onError: (error) => {
      toast.error('Failed to update like. Please try again.');
      console.error('Toggle comment like error:', error);
    },
  });
}
