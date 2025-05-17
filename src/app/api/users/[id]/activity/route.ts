import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users/[id]/activity - Get user's activity feed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: { 
        authorId: id,
        status: 'published'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        createdAt: true,
        featuredImage: true,
      },
    });

    // Get user's comments
    const comments = await prisma.comment.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Get user's likes
    const likes = await prisma.like.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            featuredImage: true,
          },
        },
      },
    });

    // Combine and sort activities
    const activities = [
      ...posts.map(post => ({ ...post, type: 'post' as const })),
      ...comments.map(comment => ({ ...comment, type: 'comment' as const })),
      ...likes.map(like => ({ ...like, type: 'like' as const })),
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(skip, skip + limit);

    // Get total count for pagination
    const totalPosts = await prisma.post.count({ 
      where: { authorId: id, status: 'published' } 
    });
    const totalComments = await prisma.comment.count({ where: { authorId: id } });
    const totalLikes = await prisma.like.count({ where: { userId: id } });
    const total = totalPosts + totalComments + totalLikes;

    return NextResponse.json({
      items: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}
