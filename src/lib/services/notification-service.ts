import prisma from '@/lib/prisma';
import { Notification } from '@prisma/client';

/**
 * Get notifications for a user
 * @param userId The ID of the user
 * @param unreadOnly Whether to only return unread notifications
 * @param page The page number
 * @param limit The number of notifications per page
 * @returns The notifications and pagination information
 */
export async function getNotifications(userId: string, unreadOnly = false, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Build the where clause
  const where: { userId: string; read?: boolean } = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actionUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            postId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Mark all notifications as read for a user
 * @param userId The ID of the user
 * @returns The number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return result.count;
}

/**
 * Mark a notification as read
 * @param notificationId The ID of the notification
 * @param userId The ID of the user (for security check)
 * @returns The updated notification or null if not found
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Delete a notification
 * @param notificationId The ID of the notification
 * @param userId The ID of the user (for security check)
 * @returns The deleted notification or null if not found
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });
}
