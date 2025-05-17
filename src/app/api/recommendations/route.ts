import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Post } from '@prisma/client';

// Define a type for the post with included relations
type PostWithRelations = Post & {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

// GET /api/recommendations - Get personalized content recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // For logged-in users, provide personalized recommendations
    if (session && session.user) {
      const userId = session.user.id as string;

      // Get categories from user's reading history
      const readingHistory = await prisma.readingHistory.findMany({
        where: { userId },
        orderBy: { lastRead: 'desc' },
        take: 20,
        include: {
          post: {
            select: {
              categories: {
                select: {
                  categoryId: true,
                },
              },
            },
          },
        },
      });

      // Extract category IDs from reading history
      const categoryIds = new Set<string>();
      readingHistory.forEach(item => {
        item.post.categories.forEach(cat => {
          categoryIds.add(cat.categoryId);
        });
      });

      // Get posts from these categories that user hasn't read
      const readPostIds = readingHistory.map(item => item.postId);

      let recommendations: PostWithRelations[] = [];

      // If user has reading history with categories
      if (categoryIds.size > 0) {
        recommendations = await prisma.post.findMany({
          where: {
            status: 'published',
            id: { notIn: readPostIds },
            categories: {
              some: {
                categoryId: { in: Array.from(categoryIds) },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        });
      }

      // If we don't have enough recommendations, add some recent posts
      if (recommendations.length < limit) {
        const additionalPosts = await prisma.post.findMany({
          where: {
            status: 'published',
            id: { notIn: [...readPostIds, ...recommendations.map(p => p.id)] },
          },
          orderBy: { createdAt: 'desc' },
          take: limit - recommendations.length,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        recommendations = [...recommendations, ...additionalPosts];
      }

      return NextResponse.json(recommendations);
    }

    // For non-logged-in users, provide trending posts
    else {
      const trendingPosts = await prisma.post.findMany({
        where: {
          status: 'published',
        },
        orderBy: [
          { likeCount: 'desc' },
          { commentCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return NextResponse.json(trendingPosts);
    }
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
