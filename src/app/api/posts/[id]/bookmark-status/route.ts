import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts/[id]/bookmark-status - Check if user has bookmarked a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ isBookmarked: false });
    }

    const userId = session.user.id as string;
    const postId = id;

    // Check if bookmark exists
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        postId,
        userId,
      },
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json({ isBookmarked: false });
  }
}
