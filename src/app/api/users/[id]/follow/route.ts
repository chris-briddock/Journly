import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createFollowNotification } from '@/lib/notifications';

// POST /api/users/[id]/follow - Follow or unfollow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to follow a user' },
        { status: 401 }
      );
    }

    const followerId = session.user.id as string;
    const followingId = id;

    // Can't follow yourself
    if (followerId === followingId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if the user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: 'User to follow not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.$transaction([
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        }),
        prisma.user.update({
          where: { id: followerId },
          data: { followingCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: followingId },
          data: { followerCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ isFollowing: false });
    } else {
      // Follow
      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId,
            followingId,
          },
        }),
        prisma.user.update({
          where: { id: followerId },
          data: { followingCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: followingId },
          data: { followerCount: { increment: 1 } },
        }),
      ]);

      // Create notification
      await createFollowNotification({
        followerId,
        followingId,
      });

      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to follow/unfollow user' },
      { status: 500 }
    );
  }
}
