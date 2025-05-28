import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchUser,
  searchUsers,
  fetchUserPosts,
  fetchUserFollowers,
  fetchUserFollowing,
  fetchUserActivity,
  fetchIsFollowing,
  toggleUserFollow,
  checkArticleResetStatus,
  resetUserArticleCount,
  registerUser,
  updateUserPassword,
  updateUserProfile,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/api/users';
import { UserFilters } from '@/types/models/userFilters';

/**
 * Hook to fetch a user by ID
 */
export function useUser(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUser(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search users
 */
export function useSearchUsers(query: string = '', limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.search(query, limit),
    queryFn: () => searchUsers(query, limit),
    enabled: enabled && query.length >= 0, // Allow empty query to show all users
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch user posts
 */
export function useUserPosts(userId: string, filters: UserFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.posts(userId, filters),
    queryFn: () => fetchUserPosts(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user followers
 */
export function useUserFollowers(userId: string, filters: UserFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.followers(userId, filters),
    queryFn: () => fetchUserFollowers(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch user following
 */
export function useUserFollowing(userId: string, filters: UserFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.following(userId, filters),
    queryFn: () => fetchUserFollowing(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch user activity
 */
export function useUserActivity(userId: string, filters: UserFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.activity(userId, filters),
    queryFn: () => fetchUserActivity(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to check if current user is following another user
 */
export function useIsFollowing(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.isFollowing(userId),
    queryFn: () => fetchIsFollowing(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to toggle user follow
 */
export function useToggleUserFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserFollow,
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.isFollowing(userId) });

      // Snapshot previous value
      const previousFollowStatus = queryClient.getQueryData<{ isFollowing: boolean }>(
        queryKeys.users.isFollowing(userId)
      );

      // Optimistically update
      if (previousFollowStatus) {
        queryClient.setQueryData(queryKeys.users.isFollowing(userId), {
          isFollowing: !previousFollowStatus.isFollowing,
        });
      }

      return { previousFollowStatus };
    },
    onSuccess: (result, userId) => {
      // Update follow status in cache
      queryClient.setQueryData(queryKeys.users.isFollowing(userId), result);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.followers(userId, {})
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.following(userId, {})
      });

      toast.success(result.isFollowing ? 'User followed!' : 'User unfollowed!');
    },
    onError: (error, userId, context) => {
      // Rollback on error
      if (context?.previousFollowStatus) {
        queryClient.setQueryData(
          queryKeys.users.isFollowing(userId),
          context.previousFollowStatus
        );
      }
      toast.error('Failed to update follow status. Please try again.');
      console.error('Toggle follow error:', error);
    },
    onSettled: (_data, _error, userId) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.users.isFollowing(userId) });
    },
  });
}

/**
 * Hook to check article reset status with polling
 */
export function useArticleResetStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.articleResetStatus(),
    queryFn: checkArticleResetStatus,
    enabled,
    staleTime: 0, // Always fresh
    refetchInterval: 24 * 60 * 60 * 1000, // Poll every 24 hours
    refetchIntervalInBackground: false, // Only poll when tab is active
  });
}

/**
 * Hook to reset user article count
 */
export function useResetArticleCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserArticleCount,
    onSuccess: () => {
      // Invalidate article reset status to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.articleResetStatus() });

      // Also invalidate article count if we have that query
      queryClient.invalidateQueries({ queryKey: ['article-count'] });

      console.log('Article count reset successfully');
    },
    onError: (error) => {
      console.error('Error resetting article count:', error);
    },
  });
}

/**
 * Hook to register a new user
 */
export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create account. Please try again.');
      console.error('Register user error:', error);
    },
  });
}

/**
 * Hook to update user password
 */
export function useUpdateUserPassword() {
  return useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update password. Please try again.');
      console.error('Update password error:', error);
    },
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update user data in cache
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser);

      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update profile. Please try again.');
      console.error('Update profile error:', error);
    },
  });
}

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.users.notificationPreferences(),
    queryFn: fetchNotificationPreferences,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      // Invalidate notification preferences to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.notificationPreferences() });

      toast.success('Notification preferences updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update notification preferences. Please try again.');
      console.error('Update notification preferences error:', error);
    },
  });
}
