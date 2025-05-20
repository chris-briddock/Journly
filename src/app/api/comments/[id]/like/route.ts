import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createCommentLikeNotification } from '@/lib/notifications';

// POST /api/comments/[id]/like - Like or unlike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to like a comment' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if the user has already liked the comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    });

    if (existingLike) {
      // User has already liked the comment, so unlike it
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: id,
          },
        },
      });

      // Decrement the like count
      await prisma.comment.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      // User hasn't liked the comment yet, so like it
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: id,
        },
      });

      // Increment the like count
      await prisma.comment.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });

      // Create notification for the comment author
      await createCommentLikeNotification({
        commentId: id,
        actionUserId: userId,
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike comment' },
      { status: 500 }
    );
  }
}
