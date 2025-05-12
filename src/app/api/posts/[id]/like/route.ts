import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/posts/[id]/like - Like a post
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
      return NextResponse.json(
        { error: 'You have already liked this post' },
        { status: 400 }
      );
    }

    // Create like and update post like count in a transaction
    await prisma.$transaction(async (tx) => {
      // Create like
      await tx.like.create({
        data: {
          postId,
          userId,
        },
      });

      // Increment post like count
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to unlike a post' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const postId = id;

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: 'You have not liked this post' },
        { status: 400 }
      );
    }

    // Delete like and update post like count in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete like
      await tx.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Decrement post like count
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
