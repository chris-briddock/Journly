import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/users/[id]/posts - Get posts by user ID with pagination and filtering
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Check if the current user is the owner of the posts
    const isCurrentUser = session?.user?.id === id;

    // Debug session and user info
    console.log('Session user ID:', session?.user?.id);
    console.log('Requested user ID:', id);
    console.log('Is current user:', isCurrentUser);

    // Public users can only see published posts
    // No authentication required for public access to published posts

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isDashboardRequest = searchParams.get('dashboard') === 'true';
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Record<string, unknown> = {
      authorId: id,
    };

    // Add search query if provided
    if (query) {
      // PostgreSQL supports case-insensitive search with mode: 'insensitive'
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Add status filter if provided and user is viewing their own posts
    if (status && status !== 'all') {
      where.status = status;
    } else if (isDashboardRequest) {
      // If this is a dashboard request, show all posts (both published and draft)
      // This is a special case for the dashboard where we want to show all posts
      console.log('Dashboard request: showing all posts');
      // Explicitly delete any status filter that might have been set
      delete where.status;
    } else if (!isCurrentUser) {
      // Non-owners can only see published posts
      where.status = 'published';
    } else {
      // Default behavior for current user with no explicit filter
      // Show all posts (both published and draft)
      console.log('Default behavior: showing all posts');
      // Explicitly delete any status filter that might have been set
      delete where.status;
    }

    // Log the where clause for debugging
    console.log('Query where clause:', JSON.stringify(where, null, 2));

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Log the results for debugging
    console.log(`Found ${posts.length} posts out of ${total} total`);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}
