import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/analytics/posts - Get detailed post analytics for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view analytics' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const userId = session.user.id as string;

    // Get posts with analytics data
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        publishedAt: true,
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: { 
        authorId: userId,
        status: 'published'
      },
    });

    // Calculate engagement rate for each post
    const postsWithEngagement = posts.map(post => ({
      ...post,
      engagementRate: post.viewCount > 0 
        ? ((post.likeCount + post.commentCount) / post.viewCount * 100).toFixed(1)
        : '0.0',
      categories: post.categories.map(({ category }) => category),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      posts: postsWithEngagement,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post analytics' },
      { status: 500 }
    );
  }
}
