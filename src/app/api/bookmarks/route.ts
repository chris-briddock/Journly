import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Type definition for bookmark with included post data
interface BookmarkWithPost {
  id: string;
  createdAt: Date;
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    readingTime: number;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    categories: Array<{
      category: {
        id: string;
        name: string;
      };
    }>;
  };
}

// GET /api/bookmarks - Get user's bookmarked posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view bookmarks' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const userId = session.user.id as string;

    // Get bookmarked posts with pagination
    const [bookmarks, totalCount] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          post: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.bookmark.count({
        where: { userId },
      }),
    ]);

    // Transform the data to match the expected format
    const posts = bookmarks.map((bookmark: BookmarkWithPost) => ({
      ...bookmark.post,
      bookmarkedAt: bookmark.createdAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      posts,
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
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}
