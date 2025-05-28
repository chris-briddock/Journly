import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createLikeNotification } from '@/lib/notifications';

// POST /api/posts/[id]/like - Toggle like/unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to like a post' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const postId = id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike the post
      const updatedPost = await prisma.$transaction(async (tx) => {
        // Delete like
        await tx.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        // Decrement post like count and return updated post
        const updated = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        });

        return updated;
      });

      return NextResponse.json({
        liked: false,
        likesCount: updatedPost.likeCount
      });
    } else {
      // Like the post
      const updatedPost = await prisma.$transaction(async (tx) => {
        // Create like
        await tx.like.create({
          data: {
            postId,
            userId,
          },
        });

        // Increment post like count and return updated post
        const updated = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });

        return updated;
      });

      // Create notification
      await createLikeNotification({
        postId,
        actionUserId: userId,
      });

      return NextResponse.json({
        liked: true,
        likesCount: updatedPost.likeCount
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}


