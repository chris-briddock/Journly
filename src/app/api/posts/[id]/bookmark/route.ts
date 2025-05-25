import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/posts/[id]/bookmark - Bookmark a post
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
      return NextResponse.json(
        { error: 'You have already bookmarked this post' },
        { status: 400 }
      );
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        postId,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    return NextResponse.json(
      { error: 'Failed to bookmark post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/bookmark - Remove bookmark from a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to remove a bookmark' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const postId = id;

    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: 'You have not bookmarked this post' },
        { status: 400 }
      );
    }

    // Remove bookmark
    await prisma.bookmark.delete({
      where: {
        id: existingBookmark.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
