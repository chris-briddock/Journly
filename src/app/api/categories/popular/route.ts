import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

// Simple in-memory cache for rate limiting
const requestCache = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 requests per minute per IP

  const key = `popular-categories:${ip}`;
  const current = requestCache.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    requestCache.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// GET /api/categories/popular - Get popular categories with post counts
export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const categories = await prisma.category.findMany({
      orderBy: [
        {
          name: "asc",
        },
      ],
      take: limit,
    });

    // Get post count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.postCategory.count({
          where: {
            categoryId: category.id,
            post: {
              status: "published",
            },
          },
        });
        return {
          ...category,
          postCount: count,
        };
      })
    );

    // Add cache headers
    const response = NextResponse.json(categoriesWithCount);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular categories' },
      { status: 500 }
    );
  }
}
