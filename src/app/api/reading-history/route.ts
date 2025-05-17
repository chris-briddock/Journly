import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/reading-history - Get user's reading history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view reading history' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const readingHistory = await prisma.readingHistory.findMany({
      where: { userId: session.user.id as string },
      orderBy: { lastRead: 'desc' },
      skip,
      take: limit,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            excerpt: true,
            featuredImage: true,
            createdAt: true,
            readingTime: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            categories: {
              select: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const total = await prisma.readingHistory.count({
      where: { userId: session.user.id as string },
    });

    return NextResponse.json({
      items: readingHistory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading history' },
      { status: 500 }
    );
  }
}

// POST /api/reading-history - Record reading activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to record reading history' },
        { status: 401 }
      );
    }

    const { postId, progress, completed } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Upsert reading history (create or update)
    const readingHistory = await prisma.readingHistory.upsert({
      where: {
        userId_postId: {
          userId: session.user.id as string,
          postId,
        },
      },
      update: {
        lastRead: new Date(),
        progress: progress !== undefined ? progress : undefined,
        completed: completed !== undefined ? completed : undefined,
      },
      create: {
        userId: session.user.id as string,
        postId,
        progress: progress || 0,
        completed: completed || false,
      },
    });

    return NextResponse.json(readingHistory);
  } catch (error) {
    console.error('Error recording reading history:', error);
    return NextResponse.json(
      { error: 'Failed to record reading history' },
      { status: 500 }
    );
  }
}
