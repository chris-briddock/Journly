import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/analytics/engagement - Get engagement analytics for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view analytics' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Get engagement data by post
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        publishedAt: true,
        createdAt: true,
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
        { viewCount: 'desc' }
      ],
      take: 10, // Top 10 posts for engagement chart
    });

    // Calculate engagement metrics for each post
    const engagementData = posts.map(post => {
      const totalEngagement = post.likeCount + post.commentCount;
      const engagementRate = post.viewCount > 0
        ? (totalEngagement / post.viewCount * 100)
        : 0;

      return {
        id: post.id,
        title: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
        fullTitle: post.title,
        views: post.viewCount,
        likes: post.likeCount,
        comments: post.commentCount,
        totalEngagement,
        engagementRate: Number(engagementRate.toFixed(1)),
        publishedAt: post.publishedAt,
        categories: post.categories.map(({ category }) => category.name),
      };
    });

    // Get category distribution
    const categoryStats = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  authorId: userId,
                  status: 'published'
                }
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    });

    const totalPosts = categoryStats.reduce((sum, cat) => sum + cat._count.posts, 0);

    const categoryDistribution = categoryStats
      .filter(cat => cat._count.posts > 0)
      .map(category => ({
        id: category.id,
        name: category.name,
        postCount: category._count.posts,
        percentage: totalPosts > 0 ? Number(((category._count.posts / totalPosts) * 100).toFixed(1)) : 0,
      }));

    // Calculate engagement trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPosts = await prisma.post.findMany({
      where: {
        authorId: userId,
        status: 'published',
        publishedAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        publishedAt: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
      },
      orderBy: {
        publishedAt: 'asc'
      }
    });

    // Group by week for trend analysis
    const weeklyTrends = [];
    const weekMap = new Map();

    recentPosts.forEach(post => {
      if (!post.publishedAt) return;

      const weekStart = new Date(post.publishedAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          week: weekKey,
          views: 0,
          likes: 0,
          comments: 0,
          posts: 0
        });
      }

      const weekData = weekMap.get(weekKey);
      weekData.views += post.viewCount;
      weekData.likes += post.likeCount;
      weekData.comments += post.commentCount;
      weekData.posts += 1;
    });

    weeklyTrends.push(...Array.from(weekMap.values()));

    // Calculate summary metrics
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);
    const averageEngagementRate = engagementData.length > 0
      ? engagementData.reduce((sum, post) => sum + post.engagementRate, 0) / engagementData.length
      : 0;

    return NextResponse.json({
      engagementByPost: engagementData,
      categoryDistribution,
      weeklyTrends,
      summary: {
        totalViews,
        totalLikes,
        totalComments,
        averageEngagementRate: Number(averageEngagementRate.toFixed(1)),
        totalPosts: posts.length,
        totalCategories: categoryDistribution.length,
      }
    });
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    );
  }
}
