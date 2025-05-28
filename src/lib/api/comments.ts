import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

export interface Comment {
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
  replies?: Comment[];
}

export interface CreateCommentData extends Record<string, unknown> {
  postId: string;
  content: string;
  parentId?: string;
}

/**
 * Fetch comments for a post
 */
export function fetchComments(postId: string): Promise<Comment[]> {
  return apiGet<Comment[]>('/api/comments', { postId });
}

/**
 * Create a new comment
 */
export function createComment(data: CreateCommentData): Promise<Comment> {
  return apiPost<Comment>('/api/comments', data);
}

/**
 * Update a comment
 */
export function updateComment(id: string, content: string): Promise<Comment> {
  return apiPut<Comment>(`/api/comments/${id}`, { content });
}

/**
 * Delete a comment
 *
 */
export function deleteComment(id: string): Promise<void> {
  return apiDelete<void>(`/api/comments/${id}`);
}

/**
 * Like/unlike a comment
 */
export function toggleCommentLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
  return apiPost<{ liked: boolean; likeCount: number }>(`/api/comments/${id}/like`);
}
