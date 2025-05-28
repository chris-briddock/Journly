import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { apiGet, apiPost } from '@/lib/api-client';

export interface Notification {
  id: string;
  type: string;
  read: boolean;
  message: string;
  link: string | null;
  createdAt: string;
  groupId: string | null;
  data: string | Record<string, unknown> | null;
  actionUser: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  post?: {
    id: string;
    title: string;
  } | null;
  comment?: {
    id: string;
    content: string;
    postId: string;
  } | null;
  _count?: {
    groupedNotifications?: number;
  };
}

export interface NotificationFilters extends Record<string, string | number | boolean | undefined> {
  limit?: number;
  grouped?: boolean;
  page?: number;
  unreadOnly?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch notifications
 */
export function fetchNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
  return apiGet<NotificationResponse>('/api/notifications', filters);
}

/**
 * Mark notifications as read
 */
export function markNotificationsAsRead(ids?: string[]): Promise<void> {
  return apiPost<void>('/api/notifications', ids ? { ids } : { all: true });
}

/**
 * Hook to fetch notifications
 */
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => fetchNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds - notifications should be fresh
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const { data } = useNotifications({ limit: 1, unreadOnly: true });
  return data?.pagination.total || 0;
}

/**
 * Hook to mark notifications as read
 */
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsAsRead,
    onMutate: async (ids?: string[]) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueriesData({ queryKey: queryKeys.notifications.all });

      // Optimistically update to mark notifications as read
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (old: NotificationResponse | undefined) => {
        if (!old) return old;

        return {
          ...old,
          notifications: old.notifications.map(notification => {
            if (!ids || ids.includes(notification.id)) {
              return { ...notification, read: true };
            }
            return notification;
          }),
        };
      });

      // Return a context object with the snapshotted value
      return { previousNotifications };
    },
    onError: (error, _ids, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark notifications as read');
      console.error('Mark notifications as read error:', error);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
