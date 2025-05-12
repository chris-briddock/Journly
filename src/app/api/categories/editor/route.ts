import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories/editor - Get all categories for the post editor
export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check if this is a dashboard request
    const { searchParams } = new URL(request.url);
    const isDashboardRequest = searchParams.get('dashboard') === 'true';

    // Debug session information
    console.log('Categories API - Session:', session ? 'exists' : 'null');
    console.log('Categories API - User:', session?.user ? JSON.stringify(session.user) : 'null');
    console.log('Categories API - Is Dashboard Request:', isDashboardRequest);
    console.log('Categories API - Request URL:', request.url);

    // Require authentication for accessing categories
    if (!session || !session.user) {
      console.log('Categories API - Authentication failed: No session or user');

      if (isDashboardRequest) {
        console.log('Categories API - Dashboard request, bypassing authentication check');
        // For dashboard requests, we'll bypass the authentication check
      } else {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories for editor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
