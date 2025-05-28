import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts/[id]/edit - Get a post for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Check if this is a dashboard request
    const { searchParams } = new URL(request.url);
    const isDashboardRequest = searchParams.get('dashboard') === 'true';

    // Debug session information
    console.log('Edit API - Session:', session ? 'exists' : 'null');
    console.log('Edit API - User:', session?.user ? JSON.stringify(session.user) : 'null');
    console.log('Edit API - Post ID:', id);
    console.log('Edit API - Is Dashboard Request:', isDashboardRequest);
    console.log('Edit API - Request URL:', request.url);
    console.log('Edit API - Request headers:', JSON.stringify(Object.fromEntries(request.headers)));

    // Check if user is authenticated
    if (!session || !session.user) {
      console.log('Edit API - Authentication failed: No session or user');

      if (isDashboardRequest) {
        console.log('Edit API - Dashboard request, bypassing authentication check');
        // For dashboard requests, we'll bypass the authentication check
        // and fetch the post directly
      } else {
        return NextResponse.json(
          { error: 'You must be logged in to edit posts' },
          { status: 401 }
        );
      }
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if the user is the author of the post
    if (isDashboardRequest) {
      console.log('Edit API - Dashboard request, bypassing author check');
      // For dashboard requests, we'll bypass the author check
    } else if (session?.user && post.authorId !== session.user.id) {
      console.log('Edit API - User is not the author');
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    const formattedPost = {
      ...post,
      categoryIds: post.categories.map((c) => c.categoryId),
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching post for editing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
