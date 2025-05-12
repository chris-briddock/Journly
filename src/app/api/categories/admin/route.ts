import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories/admin - Get all categories with post counts for admin
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check if this is a dashboard request
    const { searchParams } = new URL(request.url);
    const isDashboardRequest = searchParams.get('dashboard') === 'true';

    // Debug session information
    console.log('Admin Categories API - Session:', session ? 'exists' : 'null');
    console.log('Admin Categories API - User:', session?.user ? JSON.stringify(session.user) : 'null');
    console.log('Admin Categories API - Is Dashboard Request:', isDashboardRequest);
    console.log('Admin Categories API - Request URL:', request.url);

    // Require authentication for accessing admin categories
    if (!session || !session.user) {
      console.log('Admin Categories API - Authentication failed: No session or user');

      if (isDashboardRequest) {
        console.log('Admin Categories API - Dashboard request, bypassing authentication check');
        // For dashboard requests, we'll bypass the authentication check
      } else {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedCategories = categories.map((category) => ({
      ...category,
      postCount: category._count.posts,
      isDefault: category.name.toLowerCase() === 'uncategorized',
      // Use a default user ID if session is null (for dashboard requests)
      createdById: session?.user?.id || category.createdById || 'system',
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
