import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/posts/[id]/related - Get related posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const categoryIdsParam = searchParams.get('categoryIds');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!categoryIdsParam) {
      return NextResponse.json([]);
    }

    const categoryIds = categoryIdsParam.split(',');

    if (categoryIds.length === 0) {
      return NextResponse.json([]);
    }

    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: id },
        status: "published",
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      },
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
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(relatedPosts);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
}
