import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { Post } from '@/types/models/post';
import { User } from '@/types/models/user';
import { UserActivityResponse } from '@/types/models/userActivityResponse';
import { UserFilters } from '@/types/models/userFilters';
import { UsersResponse } from '@/types/models/usersResponse';

/**
 * Fetch a user by ID
 */
export function fetchUser(id: string): Promise<User> {
  return apiGet<User>(`/api/users/${id}`);
}

/**
 * Search users
 */
export function searchUsers(query: string = '', limit: number = 10): Promise<User[]> {
  return apiGet<User[]>('/api/users/search', { q: query, limit });
}

/**
 * Fetch user posts
 */
export function fetchUserPosts(
  userId: string,
  filters: UserFilters = {}
): Promise<{ posts: Post[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const params = { ...filters };

  // Only set default status to 'published' if not a dashboard request and no status specified
  if (!filters.dashboard && !filters.status) {
    params.status = 'published';
  }

  return apiGet<{ posts: Post[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/api/users/${userId}/posts`, params);
}

/**
 * Fetch user followers
 */
export function fetchUserFollowers(
  userId: string,
  filters: UserFilters = {}
): Promise<UsersResponse> {
  return apiGet<UsersResponse>(`/api/users/${userId}/followers`, filters);
}

/**
 * Fetch user following
 */
export function fetchUserFollowing(
  userId: string,
  filters: UserFilters = {}
): Promise<UsersResponse> {
  return apiGet<UsersResponse>(`/api/users/${userId}/following`, filters);
}

/**
 * Fetch user activity
 */
export function fetchUserActivity(
  userId: string,
  filters: UserFilters = {}
): Promise<UserActivityResponse> {
  return apiGet<UserActivityResponse>(`/api/users/${userId}/activity`, filters);
}

/**
 * Check if current user is following another user
 */
export function fetchIsFollowing(userId: string): Promise<{ isFollowing: boolean }> {
  return apiGet<{ isFollowing: boolean }>(`/api/users/${userId}/is-following`);
}

/**
 * Follow/unfollow a user
 */
export function toggleUserFollow(userId: string): Promise<{ isFollowing: boolean }> {
  return apiPost<{ isFollowing: boolean }>(`/api/users/${userId}/follow`);
}

/**
 * Check article reset status
 */
export function checkArticleResetStatus(): Promise<{ lastArticleResetDate: string | null }> {
  return apiGet<{ lastArticleResetDate: string | null }>('/api/users/article-reset-check');
}

/**
 * Reset user article count
 */
export function resetUserArticleCount(): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/api/users/reset-article-count', {});
}

/**
 * Register a new user
 */
export function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string }> {
  return apiPost<{ id: string; name: string; email: string }>('/api/register', data);
}

/**
 * Update user password
 */
export function updateUserPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return apiPut<{ message: string }>('/api/user/password', data);
}

/**
 * Update user profile
 */
export function updateUserProfile(data: {
  name?: string;
  bio?: string;
  image?: string;
  location?: string;
}): Promise<User> {
  return apiPut<User>('/api/profile', data);
}

/**
 * Fetch notification preferences
 */
export function fetchNotificationPreferences(): Promise<{
  emailNotifications: boolean;
  browserNotifications: boolean;
  newComments: boolean;
  newLikes: boolean;
  newFollowers: boolean;
  mentions: boolean;
  newsletter: boolean;
  marketingEmails: boolean;
  postUpdates: boolean;
  commentReplies: boolean;
  newPostsFromFollowing: boolean;
  mentionsInPosts: boolean;
  mentionsInComments: boolean;
}> {
  return apiGet<{
    emailNotifications: boolean;
    browserNotifications: boolean;
    newComments: boolean;
    newLikes: boolean;
    newFollowers: boolean;
    mentions: boolean;
    newsletter: boolean;
    marketingEmails: boolean;
    postUpdates: boolean;
    commentReplies: boolean;
    newPostsFromFollowing: boolean;
    mentionsInPosts: boolean;
    mentionsInComments: boolean;
  }>('/api/user/notification-preferences');
}

/**
 * Update notification preferences
 */
export function updateNotificationPreferences(data: {
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  newComments?: boolean;
  newLikes?: boolean;
  newFollowers?: boolean;
  mentions?: boolean;
  newsletter?: boolean;
  marketingEmails?: boolean;
  postUpdates?: boolean;
  commentReplies?: boolean;
  newPostsFromFollowing?: boolean;
  mentionsInPosts?: boolean;
  mentionsInComments?: boolean;
}): Promise<{ success: boolean; message: string }> {
  return apiPost<{ success: boolean; message: string }>('/api/user/notification-preferences', data);
}
