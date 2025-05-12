import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories/popular - Get popular categories with post counts
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular categories' },
      { status: 500 }
    );
  }
}
