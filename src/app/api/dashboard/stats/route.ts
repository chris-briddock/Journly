import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard stats for the current user
export async function GET() {
  try {
    const session = await auth();

    // Require authentication for accessing dashboard stats
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      totalComments,
    ] = await Promise.all([
      prisma.post.count({
        where: { authorId: userId },
      }),
      prisma.post.count({
        where: { authorId: userId, status: "published" },
      }),
      prisma.post.count({
        where: { authorId: userId, status: "draft" },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          viewCount: true,
        },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          likeCount: true,
        },
      }),
      prisma.post.aggregate({
        where: { authorId: userId },
        _sum: {
          commentCount: true,
        },
      }),
    ]);

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.viewCount || 0,
      totalLikes: totalLikes._sum.likeCount || 0,
      totalComments: totalComments._sum.commentCount || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
