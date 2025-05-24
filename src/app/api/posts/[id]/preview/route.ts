import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/posts/[id]/preview - Get a post by ID for preview (allows draft posts for authors)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Require authentication for preview
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required to preview posts' },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        categories: {
          include: {
            category: true,
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

    // Only allow the author to preview their own posts
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only preview your own posts' },
        { status: 403 }
      );
    }

    // Add SEO fields to the post
    const seoData = await prisma.post.findUnique({
      where: { id },
      select: {
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoCanonicalUrl: true,
        ogImage: true,
        noIndex: true,
      },
    });

    // Merge SEO data with post
    if (seoData) {
      Object.assign(post, seoData);
    }

    // Don't increment view count for preview
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post preview' },
      { status: 500 }
    );
  }
}
