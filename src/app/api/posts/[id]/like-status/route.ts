import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts/[id]/like-status - Check if user has liked a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ liked: false });
    }

    const userId = session.user.id as string;
    const postId = id;

    // Check if like exists
    const like = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ liked: false });
  }
}
