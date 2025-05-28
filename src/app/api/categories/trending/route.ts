import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simple in-memory cache for rate limiting
const trendingRequestCache = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function for trending categories
function checkTrendingRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 20; // Max 20 requests per minute per IP

  const key = `trending-categories:${ip}`;
  const current = trendingRequestCache.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    trendingRequestCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// GET /api/categories/trending - Get trending categories based on recent activity
export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkTrendingRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const days = parseInt(searchParams.get('days') || '7'); // Look at activity in the last 7 days

    // Calculate the date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get categories with recent post activity, ordered by activity score
    const trendingCategories = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      description: string | null;
      postCount: number;
      recentPostCount: bigint;
      recentLikeCount: bigint;
      recentCommentCount: bigint;
      recentViewCount: bigint;
      activityScore: number;
    }>>`
      SELECT
        c.id,
        c.name,
        c.description,
        c."postCount",
        COUNT(DISTINCT p.id) as "recentPostCount",
        COALESCE(SUM(p."likeCount"), 0) as "recentLikeCount",
        COALESCE(SUM(p."commentCount"), 0) as "recentCommentCount",
        COALESCE(SUM(p."viewCount"), 0) as "recentViewCount",
        (
          COUNT(DISTINCT p.id) * 10 +
          COALESCE(SUM(p."likeCount"), 0) * 2 +
          COALESCE(SUM(p."commentCount"), 0) * 3 +
          COALESCE(SUM(p."viewCount"), 0) * 0.1
        ) as "activityScore"
      FROM "Category" c
      LEFT JOIN "PostCategory" pc ON c.id = pc."categoryId"
      LEFT JOIN "Post" p ON pc."postId" = p.id
        AND p.status = 'published'
        AND p."publishedAt" >= ${dateThreshold}
      WHERE c."isDefault" = true OR c."postCount" > 0
      GROUP BY c.id, c.name, c.description, c."postCount"
      HAVING COUNT(DISTINCT p.id) > 0 OR c."postCount" > 0
      ORDER BY "activityScore" DESC, c."postCount" DESC
      LIMIT ${limit}
    `;

    // Transform the data to ensure proper number types
    const formattedCategories = trendingCategories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      postCount: category.postCount,
      recentPostCount: Number(category.recentPostCount),
      recentLikeCount: Number(category.recentLikeCount),
      recentCommentCount: Number(category.recentCommentCount),
      recentViewCount: Number(category.recentViewCount),
      activityScore: category.activityScore,
    }));

    // Add cache headers
    const response = NextResponse.json({
      categories: formattedCategories,
      period: `${days} days`,
    });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error fetching trending categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending categories' },
      { status: 500 }
    );
  }
}
