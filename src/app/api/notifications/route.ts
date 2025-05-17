import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const grouped = searchParams.get('grouped') === 'true';
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: { userId: string; read?: boolean } = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    if (grouped) {
      // Get grouped notifications
      // First, get notifications that are part of a group
      const groupedNotifications = await prisma.notification.groupBy({
        by: ['groupId'],
        where: {
          userId,
          groupId: { not: null },
        },
        _count: true,
        having: {
          groupId: {
            _count: {
              gt: 1
            }
          }
        }
      });

      // Get the group IDs
      const groupIds = groupedNotifications
        .map((group: { groupId: string | null }) => group.groupId)
        .filter((id: string | null): id is string => id !== null);

      // Get the first notification from each group
      const groupRepresentatives = await Promise.all(
        groupIds.map(async (groupId: string) => {
          const [firstNotification, count] = await Promise.all([
            prisma.notification.findFirst({
              where: {
                groupId,
                userId
              },
              orderBy: { createdAt: 'desc' },
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
            }),
            prisma.notification.count({
              where: {
                groupId,
                userId
              }
            })
          ]);

          if (firstNotification) {
            return {
              ...firstNotification,
              _count: {
                groupedNotifications: count - 1 // Subtract 1 to exclude the representative
              }
            };
          }
          return null;
        })
      );

      // Get non-grouped notifications
      const nonGroupedNotifications = await prisma.notification.findMany({
        where: {
          ...where,
          OR: [
            { groupId: null },
            { groupId: { notIn: groupIds } }
          ]
        },
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
        take: limit - groupRepresentatives.length,
        skip,
      });

      // Combine and sort all notifications
      const allNotifications = [
        ...groupRepresentatives.filter((n) => n !== null),
        ...nonGroupedNotifications
      ].sort((a, b) => {
        if (!a || !b) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const total = await prisma.notification.count({ where });

      // Return the combined result
      return NextResponse.json({
        notifications: allNotifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      // Get regular notifications without grouping
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

      return NextResponse.json({
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/mark-read - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const { ids, all = false } = await request.json();

    if (all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId, // Ensure user can only mark their own notifications
        },
        data: { read: true },
      });
    } else {
      return NextResponse.json(
        { error: 'No notification IDs provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
