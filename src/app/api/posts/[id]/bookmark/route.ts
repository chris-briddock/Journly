import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/posts/[id]/bookmark - Toggle bookmark/unbookmark a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to bookmark a post' },
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

    // Check if user already bookmarked the post
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      return NextResponse.json({ bookmarked: false });
    } else {
      // Create bookmark
      await prisma.bookmark.create({
        data: {
          postId,
          userId,
        },
      });

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
